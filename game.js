const THREE_URL='https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
let THREE=null;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), choice=a=>a[Math.floor(Math.random()*a.length)];
const CHUNK=64, LOAD_RADIUS=2, UNLOAD_RADIUS=3, PLAYER_RADIUS=.34;

const CITIES=[
 {id:'paris',name:'Paris',artifact:'Fragment d’Azur'},
 {id:'rome',name:'Rome',artifact:'Sceau solaire'},
 {id:'nyc',name:'New York',artifact:'Noyau néon'},
 {id:'tokyo',name:'Tokyo',artifact:'Éclat quantique'},
 {id:'london',name:'Londres',artifact:'Clé d’obsidienne'}
];
const WEAPONS={
 fists:{id:'fists',name:'Poings',icon:'👊',damage:7,price:0},
 baton:{id:'baton',name:'Bâton électrique',icon:'⚡',damage:15,price:120},
 blaster:{id:'blaster',name:'Blaster ionique',icon:'🔫',damage:24,price:360},
 pulse:{id:'pulse',name:'Carabine à impulsion',icon:'✨',damage:38,price:780},
 relic:{id:'relic',name:'Lame relique',icon:'🗡️',damage:55,price:1450}
};
const SHOP_ITEMS=[
 {id:'medkit',name:'Kit de soin',icon:'🩹',price:55,type:'consumable',desc:'+40 PV'},
 {id:'armor',name:'Plaque d’armure',icon:'🛡️',price:85,type:'consumable',desc:'+30 armure'},
 ...Object.values(WEAPONS).filter(x=>x.price).map(x=>({...x,type:'weapon',desc:`Dégâts ${x.damage}`})),
 {id:'bag',name:'Extension de sac',icon:'🎒',price:240,type:'upgrade',desc:'+5 places'},
 {id:'stealth',name:'Gants discrets',icon:'🧤',price:420,type:'upgrade',desc:'Réduit le risque de détection'}
];
const base={
 cityId:'paris',hp:100,maxHp:100,armor:0,coins:130,alert:0,level:1,xp:0,
 inventory:[],bagMax:20,ownedWeapons:['fists'],equipped:'fists',stealth:0,
 collected:[],artifacts:[],kills:0,pickpockets:0,googleKey:'',mode:'3d',
 pos:{x:0,z:4},yaw:0,pitch:0,streetCounter:0
};
let state=loadState();
function loadState(){try{return {...structuredClone(base),...JSON.parse(localStorage.getItem('sq3d-v3')||'{}')}}catch{return structuredClone(base)}}
function save(){localStorage.setItem('sq3d-v3',JSON.stringify(state))}
function city(){return CITIES.find(c=>c.id===state.cityId)||CITIES[0]}
function weapon(){return WEAPONS[state.equipped]||WEAPONS.fists}
function invCount(){return state.inventory.reduce((a,x)=>a+x.qty,0)}
function addInv(id,qty=1){let x=state.inventory.find(i=>i.id===id);x?x.qty+=qty:state.inventory.push({id,qty})}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rngFor(s){let a=hashStr(s);return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function chunkKey(cx,cz){return `${state.cityId}:${cx}:${cz}`}
function currentChunk(){return {cx:Math.floor(state.pos.x/CHUNK),cz:Math.floor(state.pos.z/CHUNK)}}
function mission(){const c=city();return state.artifacts.includes(c.id)?{t:`${c.name} sécurisé`,d:'Artefact trouvé. Continue d’explorer ou change de ville.'}:{t:`Retrouver : ${c.artifact}`,d:'L’objet peut apparaître dans n’importe quel quartier. Le scanner indique sa proximité lorsqu’il est généré.'}}
function levelCheck(){const n=1+Math.floor(state.xp/220);if(n>state.level){state.level=n;state.maxHp+=8;state.hp=state.maxHp;toast(`Niveau ${n} — PV maximum augmentés`)}} 

let scene,camera,renderer,clock,textures={},chunks=new Map(),colliders=[],pickups=[],shops=[],npcs=[],enemies=[],activeEnemy=null,activeEnemyEntity=null;
let moveStick={x:0,y:0},lookStick={x:0,y:0},minimapTick=0,spawnTick=0;

async function init(){
 try{THREE=await import(THREE_URL)}catch{toast('Connexion requise au premier lancement du moteur 3D.');return}
 const host=$('#threeHost');
 scene=new THREE.Scene();scene.background=new THREE.Color(0x87a8bd);scene.fog=new THREE.Fog(0x87a8bd,55,185);
 camera=new THREE.PerspectiveCamera(73,host.clientWidth/host.clientHeight,.06,240);
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(host.clientWidth,host.clientHeight);renderer.shadowMap.enabled=false;host.appendChild(renderer.domElement);
 clock=new THREE.Clock();
 scene.add(new THREE.HemisphereLight(0xc9e8ff,0x314132,2.15));
 const sun=new THREE.DirectionalLight(0xfff5dd,1.7);sun.position.set(40,80,30);scene.add(sun);
 textures=createTextures();
 ensureChunks(true);updateCamera();updateHUD();animate();
 addEventListener('resize',()=>{camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)});
}

function canvasTex(draw,repeatX=4,repeatY=4){
 const c=document.createElement('canvas');c.width=256;c.height=256;const ctx=c.getContext('2d');draw(ctx,c.width,c.height);
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeatX,repeatY);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t
}
function createTextures(){
 const asphalt=canvasTex((x,w,h)=>{x.fillStyle='#2d3337';x.fillRect(0,0,w,h);for(let i=0;i<1800;i++){let g=35+Math.random()*35;x.fillStyle=`rgb(${g},${g},${g})`;x.fillRect(Math.random()*w,Math.random()*h,1,1)}},5,5);
 const pavement=canvasTex((x,w,h)=>{x.fillStyle='#9b9990';x.fillRect(0,0,w,h);x.strokeStyle='#7e7c75';x.lineWidth=2;for(let i=0;i<8;i++){x.beginPath();x.moveTo(i*w/8,0);x.lineTo(i*w/8,h);x.stroke()}for(let i=0;i<8;i++){x.beginPath();x.moveTo(0,i*h/8);x.lineTo(w,i*h/8);x.stroke()}},6,6);
 const grass=canvasTex((x,w,h)=>{x.fillStyle='#35573e';x.fillRect(0,0,w,h);for(let i=0;i<2000;i++){x.fillStyle=Math.random()>.5?'#436b4a':'#2d4b34';x.fillRect(Math.random()*w,Math.random()*h,1,3)}},7,7);
 const facades=['#8b6558','#6d7886','#837b69','#725c67'].map(base=>canvasTex((x,w,h)=>{
   x.fillStyle=base;x.fillRect(0,0,w,h);
   for(let yy=12;yy<h;yy+=34)for(let xx=10;xx<w;xx+=30){
     x.fillStyle=Math.random()>.25?'#9ec3d4':'#273544';x.fillRect(xx,yy,16,18);
     x.fillStyle='#17232c';x.fillRect(xx+2,yy+2,12,2)
   }
   x.strokeStyle='#0002';x.lineWidth=2;for(let yy=0;yy<h;yy+=32){x.beginPath();x.moveTo(0,yy);x.lineTo(w,yy);x.stroke()}
 },3,4));
 return {asphalt,pavement,grass,facades}
}

function createChunk(cx,cz){
 const key=chunkKey(cx,cz);if(chunks.has(key))return;
 const r=rngFor(key),g=new THREE.Group();g.userData={key,cx,cz};scene.add(g);chunks.set(key,g);
 const x0=cx*CHUNK,z0=cz*CHUNK,road=10,walk=3;

 const ground=new THREE.Mesh(new THREE.PlaneGeometry(CHUNK,CHUNK),new THREE.MeshStandardMaterial({map:textures.grass,roughness:1}));
 ground.rotation.x=-Math.PI/2;ground.position.set(x0+CHUNK/2,-.05,z0+CHUNK/2);g.add(ground);

 const roadMat=new THREE.MeshStandardMaterial({map:textures.asphalt,roughness:1});
 const rx=new THREE.Mesh(new THREE.PlaneGeometry(road,CHUNK),roadMat);rx.rotation.x=-Math.PI/2;rx.position.set(x0+road/2,.01,z0+CHUNK/2);g.add(rx);
 const rz=new THREE.Mesh(new THREE.PlaneGeometry(CHUNK,road),roadMat);rz.rotation.x=-Math.PI/2;rz.position.set(x0+CHUNK/2,.012,z0+road/2);g.add(rz);

 const pavMat=new THREE.MeshStandardMaterial({map:textures.pavement,roughness:1});
 const sx=new THREE.Mesh(new THREE.PlaneGeometry(walk,CHUNK-road),pavMat);sx.rotation.x=-Math.PI/2;sx.position.set(x0+road+walk/2,.02,z0+(CHUNK+road)/2);g.add(sx);
 const sz=new THREE.Mesh(new THREE.PlaneGeometry(CHUNK-road,walk),pavMat);sz.rotation.x=-Math.PI/2;sz.position.set(x0+(CHUNK+road)/2,.021,z0+road+walk/2);g.add(sz);

 // lane markings
 const lineMat=new THREE.MeshBasicMaterial({color:0xe9dfab});
 for(let i=0;i<7;i++){
   const m=new THREE.Mesh(new THREE.PlaneGeometry(.18,4),lineMat);m.rotation.x=-Math.PI/2;m.position.set(x0+road/2,.025,z0+12+i*8);g.add(m);
   const n=new THREE.Mesh(new THREE.PlaneGeometry(4,.18),lineMat);n.rotation.x=-Math.PI/2;n.position.set(x0+12+i*8,.026,z0+road/2);g.add(n)
 }

 // 4 building lots
 const lots=[[20,20],[44,20],[20,44],[44,44]];
 lots.forEach((p,idx)=>{
   if(r()<.18&&!(cx===0&&cz===0&&idx===0))return;
   const w=13+r()*7,d=13+r()*7,h=7+r()*24,x=x0+p[0]+(r()-.5)*3,z=z0+p[1]+(r()-.5)*3;
   const mat=new THREE.MeshStandardMaterial({map:textures.facades[Math.floor(r()*textures.facades.length)],roughness:.9});
   const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);b.position.set(x,h/2,z);g.add(b);
   addCollider(key,x,z,w,d,'building')
 });

 // physical shop, guaranteed origin and common elsewhere
 if((cx===0&&cz===0)||r()<.28){
   const x=x0+16,z=z0+16;
   const shop=createShopMesh(key,x,z,r);g.add(shop.group);shops.push(shop);
 }
 // street props
 for(let i=0;i<4;i++){
   const lamp=new THREE.Group(),pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,3.2,8),new THREE.MeshStandardMaterial({color:0x343b42,metalness:.6}));
   pole.position.y=1.6;lamp.add(pole);const light=new THREE.Mesh(new THREE.SphereGeometry(.16,8,8),new THREE.MeshBasicMaterial({color:0xffe9a8}));light.position.y=3.2;lamp.add(light);
   lamp.position.set(x0+12+i*14,0,z0+12);g.add(lamp)
 }

 // loot everywhere in the city
 const lootCount=2+Math.floor(r()*5);
 for(let i=0;i<lootCount;i++){
   const p=randomWalkablePoint(x0,z0,r),type=r()<.48?'coins':r()<.72?'scrap':r()<.9?'medkit':'rare';
   const id=`${key}:loot:${i}`;if(state.collected.includes(id))continue;
   const mesh=createPickupMesh(type);mesh.position.set(p.x,.45,p.z);mesh.userData={id,type,key};g.add(mesh);pickups.push(mesh)
 }

 // Artifact can spawn in many chunks, deterministic but not only origin
 if(!state.artifacts.includes(state.cityId) && ((Math.abs(cx)+Math.abs(cz)>1 && r()<.09)||(cx===2&&cz===-1))){
   const id=`${key}:artifact`;
   if(!state.collected.includes(id)){
     const p=randomWalkablePoint(x0,z0,r),mesh=createPickupMesh('artifact');mesh.position.set(p.x,.7,p.z);mesh.userData={id,type:'artifact',key};g.add(mesh);pickups.push(mesh)
   }
 }

 // civilians
 const npcCount=2+Math.floor(r()*4);
 for(let i=0;i<npcCount;i++){const p=randomSidewalkPoint(x0,z0,r);const n=createPerson(false,key,p.x,p.z,r);g.add(n.group);npcs.push(n)}
 // adversaries
 if(r()<.48){const p=randomSidewalkPoint(x0,z0,r);const e=createPerson(true,key,p.x,p.z,r);g.add(e.group);enemies.push(e)}
}
function randomWalkablePoint(x0,z0,r){
 if(r()<.5)return{x:x0+11+r()*(CHUNK-15),z:z0+5+(r()-.5)*4};
 return{x:x0+5+(r()-.5)*4,z:z0+11+r()*(CHUNK-15)}
}
function randomSidewalkPoint(x0,z0,r){
 if(r()<.5)return{x:x0+11.5,z:z0+14+r()*(CHUNK-18)};
 return{x:x0+14+r()*(CHUNK-18),z:z0+11.5}
}
function createShopMesh(key,x,z,r){
 const group=new THREE.Group();
 const body=new THREE.Mesh(new THREE.BoxGeometry(8,4.6,7),new THREE.MeshStandardMaterial({color:0x225d58,roughness:.75}));body.position.y=2.3;group.add(body);
 const awn=new THREE.Mesh(new THREE.BoxGeometry(8.4,.35,1.3),new THREE.MeshStandardMaterial({color:0xe8b84f}));awn.position.set(0,3.1,3.7);group.add(awn);
 const door=new THREE.Mesh(new THREE.PlaneGeometry(2,2.8),new THREE.MeshBasicMaterial({color:0x102935}));door.position.set(0,1.55,3.515);group.add(door);
 const sign=makeSign('BOUTIQUE');sign.position.set(0,4.25,3.65);group.add(sign);group.position.set(x,0,z);
 addCollider(key,x,z,8,7,'shop');
 return{key,x,z,group,id:`${key}:shop`}
}
function makeSign(text){
 const c=document.createElement('canvas');c.width=512;c.height=128;const q=c.getContext('2d');q.fillStyle='#10222a';q.fillRect(0,0,512,128);q.fillStyle='#ffdb77';q.font='bold 48px system-ui';q.textAlign='center';q.textBaseline='middle';q.fillText(text,256,64);
 const t=new THREE.CanvasTexture(c),s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true}));s.scale.set(5.5,1.35,1);return s
}
function createPickupMesh(type){
 const color={coins:0xffcf52,scrap:0xb4c0ca,medkit:0x62e3a4,rare:0xa58cff,artifact:0x62d7ff}[type];
 const geo=type==='artifact'?new THREE.OctahedronGeometry(.65):type==='coins'?new THREE.CylinderGeometry(.36,.36,.12,16):new THREE.BoxGeometry(.62,.62,.62);
 const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,emissive:type==='artifact'?0x15546c:0x000000,emissiveIntensity:1}));if(type==='coins')m.rotation.x=Math.PI/2;return m
}
function createPerson(hostile,key,x,z,r){
 const group=new THREE.Group();
 const skin=new THREE.MeshStandardMaterial({color:0xd5a47c}),cloth=new THREE.MeshStandardMaterial({color:hostile?0x6c2331:choice([0x315f7b,0x486d45,0x6a4e75,0x785f42])});
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.75,5,8),cloth);body.position.y=1.05;group.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.25,10,10),skin);head.position.y=1.75;group.add(head);
 const legMat=new THREE.MeshStandardMaterial({color:0x222b34});
 const l1=new THREE.Mesh(new THREE.BoxGeometry(.16,.68,.18),legMat),l2=l1.clone();l1.position.set(-.13,.38,0);l2.position.set(.13,.38,0);group.add(l1,l2);
 group.position.set(x,0,z);
 const axis=r()<.5?'x':'z',speed=.7+r()*.65,dir=r()<.5?-1:1;
 return{key,group,hostile,axis,speed,dir,home:{x,z},money:8+Math.floor(r()*48),caught:false,legs:[l1,l2],phase:r()*6.28}
}
function addCollider(key,x,z,w,d,type){colliders.push({key,minX:x-w/2-.4,maxX:x+w/2+.4,minZ:z-d/2-.4,maxZ:z+d/2+.4,type})}
function unloadChunk(key){
 const g=chunks.get(key);if(!g)return;scene.remove(g);chunks.delete(key);
 colliders=colliders.filter(x=>x.key!==key);pickups=pickups.filter(x=>x.userData.key!==key);shops=shops.filter(x=>x.key!==key);npcs=npcs.filter(x=>x.key!==key);enemies=enemies.filter(x=>x.key!==key)
}
function ensureChunks(force=false){
 const {cx,cz}=currentChunk();
 for(let x=cx-LOAD_RADIUS;x<=cx+LOAD_RADIUS;x++)for(let z=cz-LOAD_RADIUS;z<=cz+LOAD_RADIUS;z++)createChunk(x,z);
 for(const [key,g] of chunks){if(Math.abs(g.userData.cx-cx)>UNLOAD_RADIUS||Math.abs(g.userData.cz-cz)>UNLOAD_RADIUS)unloadChunk(key)}
 if(force)drawMinimap()
}

function collides(x,z){return colliders.some(c=>x+PLAYER_RADIUS>c.minX&&x-PLAYER_RADIUS<c.maxX&&z+PLAYER_RADIUS>c.minZ&&z-PLAYER_RADIUS<c.maxZ)}
function movePlayer(dx,dz){let nx=state.pos.x+dx,nz=state.pos.z+dz;if(!collides(nx,state.pos.z))state.pos.x=nx;if(!collides(state.pos.x,nz))state.pos.z=nz}
function updateCamera(t=0){
 const bob=(Math.abs(moveStick.x)+Math.abs(moveStick.y)>.1)?Math.sin(t*.012)*.025:0;
 camera.position.set(state.pos.x,1.72+bob,state.pos.z);
 const cp=Math.cos(state.pitch),sp=Math.sin(state.pitch),sy=Math.sin(state.yaw),cy=Math.cos(state.yaw);
 camera.lookAt(state.pos.x+sy*cp,1.72+sp+bob,state.pos.z-cy*cp)
}
function animate(){
 if(!renderer)return;requestAnimationFrame(animate);
 const dt=Math.min(.033,clock.getDelta()),now=performance.now();
 if(state.mode==='3d'){
   // Correct axes: joystick up = forward, right = strafe right.
   const forwardAmount=-moveStick.y,strafeAmount=moveStick.x;
   const fx=Math.sin(state.yaw),fz=-Math.cos(state.yaw),rx=Math.cos(state.yaw),rz=Math.sin(state.yaw);
   movePlayer((fx*forwardAmount+rx*strafeAmount)*5.15*dt,(fz*forwardAmount+rz*strafeAmount)*5.15*dt);
   // Right joystick: right looks right, up looks up.
   state.yaw+=lookStick.x*2.05*dt;
   state.pitch=clamp(state.pitch-lookStick.y*1.55*dt,-1.08,1.08);
   updateCamera(now);updateNPCs(dt,now);animatePickups(dt,now);
   if(now-spawnTick>700){ensureChunks();spawnTick=now}
   checkInteractions();
   if(now-minimapTick>100){drawMinimap();minimapTick=now}
   state.alert=Math.max(0,state.alert-dt*1.5);
   renderer.render(scene,camera);updateHUD();
 }
}
function animatePickups(dt,now){for(const m of pickups){if(!m.parent)continue;m.rotation.y+=dt;m.position.y=(m.userData.type==='artifact'?.7:.45)+Math.sin(now/450+m.position.x)*.08}}
function updateNPCs(dt,now){
 for(const n of npcs){
   const span=23,offset=n.axis==='x'?n.group.position.x-n.home.x:n.group.position.z-n.home.z;
   if(Math.abs(offset)>span)n.dir*=-1;
   if(n.axis==='x')n.group.position.x+=n.dir*n.speed*dt;else n.group.position.z+=n.dir*n.speed*dt;
   n.group.rotation.y=n.axis==='x'?(n.dir>0?Math.PI/2:-Math.PI/2):(n.dir>0?0:Math.PI);
   n.legs[0].rotation.x=Math.sin(now*.006*n.speed+n.phase)*.6;n.legs[1].rotation.x=-n.legs[0].rotation.x
 }
 for(const e of enemies){
   if(e===activeEnemyEntity)continue;
   const dx=state.pos.x-e.group.position.x,dz=state.pos.z-e.group.position.z,d=Math.hypot(dx,dz);
   if(d<11||state.alert>65){
     const s=e.speed*1.3*dt;e.group.position.x+=dx/(d||1)*s;e.group.position.z+=dz/(d||1)*s;e.group.rotation.y=Math.atan2(dx,dz);
     if(d<1.65&&!activeEnemy)startCombat(e)
   }else{
     const span=18,off=e.axis==='x'?e.group.position.x-e.home.x:e.group.position.z-e.home.z;if(Math.abs(off)>span)e.dir*=-1;
     if(e.axis==='x')e.group.position.x+=e.dir*e.speed*dt;else e.group.position.z+=e.dir*e.speed*dt
   }
 }
}
function nearest(arr,maxD){
 let best=null,bd=maxD;
 for(const x of arr){const p=x.group?x.group.position:x.position,d=Math.hypot(state.pos.x-p.x,state.pos.z-p.z);if(d<bd){best=x;bd=d}}
 return best
}
function checkInteractions(){
 if(activeEnemy)return hidePrompt();
 const loot=nearest(pickups.filter(x=>x.parent),1.65);
 if(loot)return setPrompt(pickupName(loot.userData.type),pickupDesc(loot.userData.type),'RAMASSER',()=>collectPickup(loot));
 const shop=nearest(shops,2.45);
 if(shop)return setPrompt('Boutique de quartier','Entre pour acheter du matériel avec l’argent trouvé.','ENTRER',()=>openPhysicalShop(shop));
 const civ=nearest(npcs,1.55);
 if(civ)return setPrompt('Passant','Tu peux tenter de lui faire les poches. Risque de te faire repérer.','FAIRE LES POCHES',()=>pickpocket(civ));
 hidePrompt()
}
function setPrompt(t,d,b,fn){$('#promptTitle').textContent=t;$('#promptText').textContent=d;$('#promptBtn').textContent=b;$('#promptBtn').onclick=fn;$('#prompt').classList.remove('hidden')}
function hidePrompt(){$('#prompt').classList.add('hidden')}
function pickupName(t){return{coins:'Billets trouvés',scrap:'Composant',medkit:'Kit de soin',rare:'Cache rare',artifact:city().artifact}[t]}
function pickupDesc(t){return{coins:'Argent abandonné dans la rue.',scrap:'Se revend automatiquement.',medkit:'+40 PV dans le sac.',rare:'Contient des crédits et de l’XP.',artifact:'Objet principal de la ville.'}[t]}
function collectPickup(m){
 const t=m.userData.type,id=m.userData.id;if(state.collected.includes(id))return;
 if((t==='medkit')&&invCount()>=state.bagMax)return toast('Sac plein.');
 state.collected.push(id);
 if(t==='coins'){const n=8+Math.floor(Math.random()*38);state.coins+=n;toast(`+${n} crédits`)}
 if(t==='scrap'){state.coins+=22;state.xp+=10;toast('+22 crédits')}
 if(t==='medkit'){addInv('medkit');toast('Kit de soin récupéré')}
 if(t==='rare'){const n=55+Math.floor(Math.random()*75);state.coins+=n;state.xp+=35;toast(`Cache rare : +${n} crédits`)}
 if(t==='artifact'&&!state.artifacts.includes(state.cityId)){state.artifacts.push(state.cityId);state.coins+=250;state.xp+=180;toast(`${city().artifact} récupéré ! +250 crédits`)}
 if(m.parent)m.parent.remove(m);pickups=pickups.filter(x=>x!==m);hidePrompt();levelCheck();save();updateHUD()
}

function pickpocket(n){
 if(n.caught)return toast('Cette personne est déjà sur ses gardes.');
 const success=clamp(.62+state.stealth*.11-state.alert*.003,.25,.9);
 if(Math.random()<success){
   const amount=n.money;state.coins+=amount;state.pickpockets++;n.money=0;n.caught=true;n.speed*=1.9;toast(`Vol réussi : +${amount} crédits`);
 }else{
   n.caught=true;n.speed*=2.2;state.alert=clamp(state.alert+32,0,100);toast('Repéré ! Niveau d’alerte augmenté.');
   if(state.alert>45)spawnHunterNearPlayer()
 }
 save();hidePrompt();updateHUD()
}
function spawnHunterNearPlayer(){
 if(!THREE)return;const {cx,cz}=currentChunk(),key=chunkKey(cx,cz),g=chunks.get(key);if(!g)return;
 const r=rngFor(key+':hunter:'+Date.now()),e=createPerson(true,key,state.pos.x+6,state.pos.z+5,r);e.speed=1.5;e.name='Sentinelle urbaine';g.add(e.group);enemies.push(e)
}

function startCombat(entity){
 activeEnemyEntity=entity;activeEnemy={name:entity.name||choice(['Rôdeur hostile','Mercenaire','Sentinelle urbaine']),level:Math.max(1,state.level+choice([-1,0,0,1])),hp:42+state.level*16,maxHp:42+state.level*16,damage:6+state.level*3,reward:25+state.level*15};
 $('#combat').classList.remove('hidden');renderCombat();hidePrompt()
}
function renderCombat(){if(!activeEnemy)return;$('#enemyName').textContent=activeEnemy.name;$('#enemyLvl').textContent=`Niv. ${activeEnemy.level}`;$('#enemyBar').style.width=`${Math.max(0,activeEnemy.hp/activeEnemy.maxHp*100)}%`}
function attack(){
 if(!activeEnemy)return;const dmg=weapon().damage+state.level*2+Math.floor(Math.random()*7);activeEnemy.hp-=dmg;toast(`${weapon().name} : ${dmg} dégâts`);
 if(activeEnemy.hp<=0){state.coins+=activeEnemy.reward;state.xp+=55+activeEnemy.level*10;state.kills++;if(activeEnemyEntity?.group.parent)activeEnemyEntity.group.parent.remove(activeEnemyEntity.group);enemies=enemies.filter(x=>x!==activeEnemyEntity);activeEnemy=null;activeEnemyEntity=null;$('#combat').classList.add('hidden');levelCheck();save();return}
 let hit=activeEnemy.damage+Math.floor(Math.random()*4),absorbed=Math.min(state.armor,hit);state.armor-=absorbed;hit-=absorbed;state.hp-=hit;
 if(state.hp<=0){state.hp=state.maxHp;state.coins=Math.max(0,state.coins-75);state.alert=0;activeEnemy=null;activeEnemyEntity=null;$('#combat').classList.add('hidden');state.pos={x:0,z:4};toast('K.O. — retour au refuge, -75 crédits')}else renderCombat();save()
}
function flee(){if(!activeEnemy)return;if(Math.random()<.7){activeEnemy=null;activeEnemyEntity=null;$('#combat').classList.add('hidden');toast('Fuite réussie')}else{toast('Fuite ratée');attack()}}

function drawMinimap(){
 const c=$('#minimap'),ctx=c.getContext('2d'),W=c.width,H=c.height,scale=2.15,R=36;
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#07111d';ctx.fillRect(0,0,W,H);
 ctx.save();ctx.translate(W/2,H/2);
 // roads
 const minX=state.pos.x-R,maxX=state.pos.x+R,minZ=state.pos.z-R,maxZ=state.pos.z+R;
 const cminX=Math.floor(minX/CHUNK)-1,cmaxX=Math.floor(maxX/CHUNK)+1,cminZ=Math.floor(minZ/CHUNK)-1,cmaxZ=Math.floor(maxZ/CHUNK)+1;
 ctx.strokeStyle='#3b4a54';ctx.lineWidth=18/scale;
 for(let cx=cminX;cx<=cmaxX;cx++){const x=(cx*CHUNK-state.pos.x)*scale;ctx.beginPath();ctx.moveTo(x,-H);ctx.lineTo(x,H);ctx.stroke()}
 for(let cz=cminZ;cz<=cmaxZ;cz++){const y=(cz*CHUNK-state.pos.z)*scale;ctx.beginPath();ctx.moveTo(-W,y);ctx.lineTo(W,y);ctx.stroke()}
 // nearby colliders/buildings
 ctx.fillStyle='#657583';
 colliders.forEach(b=>{const cx=(b.minX+b.maxX)/2,cz=(b.minZ+b.maxZ)/2;if(Math.abs(cx-state.pos.x)>R||Math.abs(cz-state.pos.z)>R)return;ctx.fillRect((b.minX-state.pos.x)*scale,(b.minZ-state.pos.z)*scale,(b.maxX-b.minX)*scale,(b.maxZ-b.minZ)*scale)});
 // shop
 ctx.fillStyle='#63e2b0';for(const s of shops){if(Math.abs(s.x-state.pos.x)<R&&Math.abs(s.z-state.pos.z)<R){ctx.beginPath();ctx.arc((s.x-state.pos.x)*scale,(s.z-state.pos.z)*scale,5,0,Math.PI*2);ctx.fill()}}
 // pickups
 for(const p of pickups){if(!p.parent)continue;const dx=p.position.x-state.pos.x,dz=p.position.z-state.pos.z;if(Math.abs(dx)>R||Math.abs(dz)>R)continue;ctx.fillStyle=p.userData.type==='artifact'?'#6edcff':p.userData.type==='coins'?'#ffd45d':'#a7b7c3';ctx.beginPath();ctx.arc(dx*scale,dz*scale,p.userData.type==='artifact'?4:2.5,0,Math.PI*2);ctx.fill()}
 // NPCs
 ctx.fillStyle='#79c995';for(const n of npcs){const dx=n.group.position.x-state.pos.x,dz=n.group.position.z-state.pos.z;if(Math.abs(dx)<R&&Math.abs(dz)<R){ctx.beginPath();ctx.arc(dx*scale,dz*scale,2.5,0,Math.PI*2);ctx.fill()}}
 ctx.fillStyle='#ff6078';for(const e of enemies){const dx=e.group.position.x-state.pos.x,dz=e.group.position.z-state.pos.z;if(Math.abs(dx)<R&&Math.abs(dz)<R){ctx.beginPath();ctx.arc(dx*scale,dz*scale,3,0,Math.PI*2);ctx.fill()}}
 // player arrow
 ctx.rotate(state.yaw);ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(5,6);ctx.lineTo(0,3);ctx.lineTo(-5,6);ctx.closePath();ctx.fill();ctx.restore();
}

function updateHUD(){
 const m=mission(),{cx,cz}=currentChunk();$('#hp').textContent=Math.round(state.hp);$('#armor').textContent=Math.round(state.armor);$('#coins').textContent=state.coins;$('#alert').textContent=Math.round(state.alert);
 $('#district').textContent=`${city().name.toUpperCase()} • SECTEUR ${cx},${cz}`;$('#missionTitle').textContent=m.t;$('#missionText').textContent=m.d
}

function makeJoystick(baseSel,knobSel,target){
 const base=$(baseSel),knob=$(knobSel);let pid=null;
 const move=e=>{const r=base.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),max=30,len=Math.hypot(dx,dy)||1,k=Math.min(1,max/len);target.x=dx/max*k;target.y=dy/max*k;knob.style.transform=`translate(${dx*k}px,${dy*k}px)`};
 const reset=()=>{pid=null;target.x=target.y=0;knob.style.transform='translate(0,0)'};
 base.addEventListener('pointerdown',e=>{pid=e.pointerId;base.setPointerCapture(pid);move(e)});
 base.addEventListener('pointermove',e=>{if(e.pointerId===pid)move(e)});
 base.addEventListener('pointerup',reset);base.addEventListener('pointercancel',reset)
}
makeJoystick('#moveJoy','#moveKnob',moveStick);makeJoystick('#lookJoy','#lookKnob',lookStick);

function scan(){
 let best=null,bd=999;
 for(const p of pickups){if(!p.parent)continue;const d=Math.hypot(state.pos.x-p.position.x,state.pos.z-p.position.z);if(p.userData.type==='artifact'&&d<bd){best=p;bd=d}}
 if(best)toast(`Artefact : ${bd<8?'TRÈS PROCHE':bd<22?'PROCHE':bd<50?'DANS LE QUARTIER':'LOINTAIN'} • ${Math.round(bd)} m`);
 else toast('Aucun signal d’artefact dans les quartiers chargés. Continue à explorer.')
}

function openPhysicalShop(shop){
 openSheet('physicalShop');$('#sheetTitle').textContent='Boutique de quartier';$('#sheetBody').innerHTML=shopItemsHTML();bindShopButtons()
}
function shopItemsHTML(){return `<div class="card"><span class="shopBadge">BOUTIQUE PHYSIQUE</span><h3 style="margin-top:7px">${state.coins} crédits disponibles</h3><p class="sub">Tu dois revenir près d’une boutique dans le monde pour acheter.</p></div><div class="card">${SHOP_ITEMS.map(x=>`<div class="item"><div class="itemIcon">${x.icon}</div><div class="itemMain"><b>${x.name}</b><small>${x.desc} • ${x.price} crédits</small></div><button class="menuBtn buy" data-id="${x.id}" ${x.type==='weapon'&&state.ownedWeapons.includes(x.id)?'disabled':''}>${x.type==='weapon'&&state.ownedWeapons.includes(x.id)?'Acheté':'Acheter'}</button></div>`).join('')}</div>`}
function bindShopButtons(){$$('.buy').forEach(b=>b.onclick=()=>buy(b.dataset.id))}
function buy(id){
 const x=SHOP_ITEMS.find(i=>i.id===id);if(!x||state.coins<x.price)return toast('Pas assez de crédits');
 if(x.type==='weapon'&&state.ownedWeapons.includes(id))return;
 if(id==='medkit'&&invCount()>=state.bagMax)return toast('Sac plein');
 state.coins-=x.price;
 if(x.type==='weapon'){state.ownedWeapons.push(id);state.equipped=id}
 if(id==='medkit')addInv('medkit');if(id==='armor')state.armor=clamp(state.armor+30,0,100);if(id==='bag')state.bagMax+=5;if(id==='stealth')state.stealth++;
 save();updateHUD();$('#sheetBody').innerHTML=shopItemsHTML();bindShopButtons();toast(`${x.name} acheté`)
}

function openSheet(panel){
 $('#sheet').classList.remove('hidden');$$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.panel===panel));
 const title=$('#sheetTitle'),body=$('#sheetBody');
 if(panel==='world'){title.textContent='Monde';body.innerHTML=worldHTML()}
 if(panel==='bag'){title.textContent='Inventaire';body.innerHTML=bagHTML()}
 if(panel==='shops'){title.textContent='Boutiques';body.innerHTML=`<div class="card"><h3>Boutiques physiques</h3><p class="sub">Les boutiques sont directement dans les rues et apparaissent sur la mini-carte en vert. Approche-toi d’une enseigne BOUTIQUE puis appuie sur ENTRER.</p></div>`}
 if(panel==='quests'){title.textContent='Quêtes';body.innerHTML=questHTML()}
 if(panel==='settings'){title.textContent='Réglages';body.innerHTML=settingsHTML()}
 bindSheet(panel)
}
function worldHTML(){return `<div class="card"><h3>Ville procédurale</h3><p class="sub">La ville n’a plus de petite plateforme fermée : les quartiers se chargent et se déchargent autour de toi à mesure que tu avances.</p></div><div class="card"><h3>Changer de ville</h3>${CITIES.map(c=>`<button class="menuBtn cityBtn" data-city="${c.id}" style="width:100%;margin-bottom:7px">${c.name}<small>${state.artifacts.includes(c.id)?'✅ Artefact trouvé':c.artifact}</small></button>`).join('')}</div><div class="card"><h3>Street View</h3><div class="grid2"><button class="menuBtn primary" id="streetMode">🧭 Street View<small>Nécessite une clé Google Maps.</small></button><button class="menuBtn" id="mode3d">🏙️ Mode 3D<small>Retour à la ville texturée.</small></button></div></div>`}
function bagHTML(){
 const weps=state.ownedWeapons.map(id=>WEAPONS[id]).map(w=>`<div class="item"><div class="itemIcon">${w.icon}</div><div class="itemMain"><b>${w.name}</b><small>Dégâts ${w.damage}</small></div><button class="menuBtn equip" data-w="${w.id}">${state.equipped===w.id?'Équipé':'Équiper'}</button></div>`).join('');
 const meds=state.inventory.length?state.inventory.map(i=>`<div class="item"><div class="itemIcon">🩹</div><div class="itemMain"><b>Kit de soin</b><small>×${i.qty}</small></div><button class="menuBtn useMed">Utiliser</button></div>`).join(''):'<p class="sub">Aucun consommable.</p>';
 return `<div class="card"><h3>Armes</h3>${weps}</div><div class="card"><h3>Sac ${invCount()}/${state.bagMax}</h3>${meds}</div><div class="card"><h3>Statistiques</h3><p class="sub">Niveau ${state.level} • ${state.kills} adversaires vaincus • ${state.pickpockets} vols réussis • discrétion +${state.stealth}</p></div>`
}
function questHTML(){return `<div class="card"><h3>${mission().t}</h3><p class="sub">${mission().d}</p></div><div class="card"><h3>Artefacts</h3>${CITIES.map(c=>`<div class="item"><div class="itemIcon">${state.artifacts.includes(c.id)?'✅':'❔'}</div><div class="itemMain"><b>${c.name}</b><small>${c.artifact}</small></div></div>`).join('')}</div>`}
function settingsHTML(){return `<div class="warning">Street View est optionnel. Pour l’utiliser, ajoute une clé Google Maps JavaScript API restreinte à ton adresse GitHub Pages.</div><div class="card" style="margin-top:9px"><h3>Clé Google Maps</h3><input id="keyInput" class="codeInput" type="password" value="${state.googleKey||''}" placeholder="AIza…"><div class="grid2" style="margin-top:8px"><button class="menuBtn primary" id="saveKey">Enregistrer</button><button class="menuBtn red" id="clearKey">Effacer</button></div></div><div class="card"><button class="menuBtn red" id="resetGame">Nouvelle partie</button></div>`}
function bindSheet(panel){
 if(panel==='world'){
   $$('.cityBtn').forEach(b=>b.onclick=()=>switchCity(b.dataset.city));$('#streetMode').onclick=enterStreet;$('#mode3d').onclick=exitStreet
 }
 if(panel==='bag'){$$('.equip').forEach(b=>b.onclick=()=>{state.equipped=b.dataset.w;save();openSheet('bag')});$$('.useMed').forEach(b=>b.onclick=useMed)}
 if(panel==='settings'){ $('#saveKey').onclick=()=>{state.googleKey=$('#keyInput').value.trim();save();toast('Clé enregistrée sur cet appareil')};$('#clearKey').onclick=()=>{state.googleKey='';save();$('#keyInput').value=''};$('#resetGame').onclick=()=>{if(confirm('Effacer toute la partie ?')){localStorage.removeItem('sq3d-v3');location.reload()}}}
}
function switchCity(id){state.cityId=id;state.pos={x:0,z:4};state.yaw=0;state.pitch=0;for(const [k] of [...chunks])unloadChunk(k);ensureChunks(true);save();closeSheet();toast(`Bienvenue à ${city().name}`)}
function useMed(){const x=state.inventory.find(i=>i.id==='medkit');if(!x)return toast('Aucun kit');if(state.hp>=state.maxHp)return toast('PV déjà au maximum');x.qty--;state.hp=clamp(state.hp+40,0,state.maxHp);if(x.qty<=0)state.inventory=state.inventory.filter(i=>i!==x);save();updateHUD();openSheet('bag')}

let panorama=null;
async function loadGoogle(){if(!state.googleKey)return toast('Ajoute une clé Google Maps dans Réglages'),false;if(window.google?.maps)return true;return new Promise(resolve=>{window.__sq3dGoogle=()=>resolve(true);const s=document.createElement('script');s.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(state.googleKey)}&callback=__sq3dGoogle&v=weekly`;s.async=true;s.onerror=()=>{toast('Impossible de charger Google Maps');resolve(false)};document.head.appendChild(s)})}
async function enterStreet(){closeSheet();if(!(await loadGoogle()))return;state.mode='street';$('#threeHost').classList.add('hidden');$('#controls').classList.add('hidden');$('#streetHost').classList.remove('hidden');$('#streetControls').classList.remove('hidden');const presets={paris:{lat:48.8706,lng:2.3326},rome:{lat:41.8902,lng:12.4922},nyc:{lat:40.758,lng:-73.9855},tokyo:{lat:35.6595,lng:139.7005},london:{lat:51.5007,lng:-.1246}},p=presets[state.cityId];panorama=new google.maps.StreetViewPanorama($('#streetHost'),{position:p,pov:{heading:0,pitch:0},zoom:1,addressControl:false,fullscreenControl:false,motionTracking:false,motionTrackingControl:false});panorama.addListener('position_changed',streetEvent);save()}
function exitStreet(){state.mode='3d';$('#streetHost').classList.add('hidden');$('#streetControls').classList.add('hidden');$('#threeHost').classList.remove('hidden');$('#controls').classList.remove('hidden');panorama=null;save();closeSheet()}
function angleDiff(a,b){let d=Math.abs(a-b)%360;return d>180?360-d:d}
function streetForward(){if(!panorama)return;const links=panorama.getLinks()||[];if(!links.length)return toast('Aucun passage disponible');const h=panorama.getPov().heading,b=links.reduce((a,x)=>angleDiff(x.heading,h)<angleDiff(a.heading,h)?x:a,links[0]);panorama.setPano(b.pano);panorama.setPov({heading:b.heading,pitch:0})}
function streetTurn(dir){if(!panorama)return;const p=panorama.getPov();panorama.setPov({heading:(p.heading+dir*40+360)%360,pitch:p.pitch})}
function streetEvent(){state.streetCounter++;if(state.streetCounter%4===0&&Math.random()<.55){const r=Math.random();if(r<.45){const n=8+Math.floor(Math.random()*35);state.coins+=n;toast(`Tu trouves ${n} crédits dans cette zone Street View`)}else if(r<.75)toast('Un objet virtuel est détecté dans cette zone');else toast('Présence hostile détectée dans le secteur')}save();updateHUD()}

function closeSheet(){$('#sheet').classList.add('hidden')}
let toastTimer;function toast(m){const t=$('#toast');t.textContent=m;t.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.add('hidden'),2200)}

$('#scanBtn').onclick=scan;$('#interactBtn').onclick=()=>toast('Approche-toi d’un objet, d’un passant ou d’une boutique.');
$('#attackBtn').onclick=attack;$('#fleeBtn').onclick=flee;$('#menuBtn').onclick=()=>openSheet('world');$('#closeSheet').onclick=closeSheet;
$('#sheet').addEventListener('click',e=>{if(e.target===$('#sheet'))closeSheet()});$$('.nav').forEach(b=>b.onclick=()=>openSheet(b.dataset.panel));
$('#stForward').onclick=streetForward;$('#stLeft').onclick=()=>streetTurn(-1);$('#stRight').onclick=()=>streetTurn(1);$('#stScan').onclick=()=>toast('Scan Street View : événements virtuels apparaissent au fil de l’exploration.');
document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});document.addEventListener('gesturechange',e=>e.preventDefault(),{passive:false});document.addEventListener('gestureend',e=>e.preventDefault(),{passive:false});
let lastTouch=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-lastTouch<320)e.preventDefault();lastTouch=n},{passive:false});
addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>document.hidden&&save());

updateHUD();init();