const THREE_URL='https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
let THREE=null;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),choice=a=>a[Math.floor(Math.random()*a.length)];
const CHUNK=72,LOAD=2,UNLOAD=3,RADIUS=.34;
const DISTRICTS=[
 {id:'central',name:'Centre',style:'urban',bonus:'Commerces fréquents'},
 {id:'garden',name:'Quartier des Jardins',style:'green',bonus:'Plus de caches et de PNJ amicaux'},
 {id:'harbor',name:'Canal',style:'industrial',bonus:'Butin rare et adversaires légèrement plus présents'},
 {id:'old',name:'Vieille Ville',style:'old',bonus:'Quêtes et appartements'}
];
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
const SHOPS={
 corner:{name:'Épicerie Nova',icon:'🥤',stock:[
  {id:'medkit',name:'Kit de soin',icon:'🩹',price:55,desc:'+40 PV'},
  {id:'snack',name:'Snack énergétique',icon:'🥪',price:22,desc:'+15 PV'},
  {id:'bag',name:'Sac renforcé',icon:'🎒',price:240,desc:'+5 places'}
 ]},
 gear:{name:'Atelier Horizon',icon:'🧰',stock:[
  {id:'armor',name:'Plaque d’armure',icon:'🛡️',price:85,desc:'+30 armure'},
  {id:'baton',name:'Bâton électrique',icon:'⚡',price:120,desc:'15 dégâts'},
  {id:'blaster',name:'Blaster ionique',icon:'🔫',price:360,desc:'24 dégâts'},
  {id:'stealth',name:'Gants discrets',icon:'🧤',price:420,desc:'Meilleure discrétion'}
 ]},
 rare:{name:'Relics & Co',icon:'💎',stock:[
  {id:'pulse',name:'Carabine à impulsion',icon:'✨',price:780,desc:'38 dégâts'},
  {id:'relic',name:'Lame relique',icon:'🗡️',price:1450,desc:'55 dégâts'},
  {id:'map',name:'Scanner longue portée',icon:'📡',price:600,desc:'Scanner amélioré'}
 ]}
};
const QUESTS=[
 {id:'welcome',title:'Premiers pas',text:'Récupère 50 crédits en faisant les poches des passants.',goal:'stolenCoins',target:50,reward:100},
 {id:'helper',title:'Bon voisin',text:'Accomplis une mission donnée par un PNJ.',goal:'npcMissions',target:1,reward:140},
 {id:'explorer',title:'Explorateur',text:'Découvre 6 quartiers.',goal:'districtsSeen',target:6,reward:180},
 {id:'treasure',title:'Chasseur de caches',text:'Ouvre 5 coffres ou poubelles.',goal:'containersOpened',target:5,reward:160},
 {id:'conquer',title:'Conquête tranquille',text:'Sécurise 3 quartiers en réalisant leurs objectifs.',goal:'districtsOwned',target:3,reward:350}
];
const base={
 cityId:'paris',hp:100,maxHp:100,armor:0,coins:120,level:1,xp:0,wanted:0,
 pos:{x:2,z:8},yaw:0,pitch:0,inventory:[],bagMax:20,ownedWeapons:['fists'],equipped:'fists',
 stealth:0,scanner:0,collected:[],artifacts:[],kills:0,pickpockets:0,coinsEarned:0,stolenCoins:0,
 npcMissions:0,containersOpened:0,ownedDistricts:[],seenDistricts:[],completedQuests:[],
 activeNpcMission:null,timeOfDay:9.5,weather:'clear',interior:null,returnPos:null
};
let state=loadState();
function loadState(){try{return {...structuredClone(base),...JSON.parse(localStorage.getItem('sq3d-v4-1')||'{}')}}catch{return structuredClone(base)}}
function save(){localStorage.setItem('sq3d-v4-1',JSON.stringify(state))}
function city(){return CITIES.find(c=>c.id===state.cityId)||CITIES[0]}
function weapon(){return WEAPONS[state.equipped]||WEAPONS.fists}
function invCount(){return state.inventory.reduce((a,x)=>a+x.qty,0)}
function addInv(id,qty=1){const x=state.inventory.find(i=>i.id===id);x?x.qty+=qty:state.inventory.push({id,qty})}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rngFor(s){let a=hashStr(s);return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function ck(cx,cz){return `${state.cityId}:${cx}:${cz}`}
function currentChunk(){return{cx:Math.floor(state.pos.x/CHUNK),cz:Math.floor(state.pos.z/CHUNK)}}
function districtFor(cx,cz){const idx=Math.abs((cx*7+cz*11)%DISTRICTS.length);return DISTRICTS[idx]}
function districtId(cx,cz){return `${state.cityId}:${cx}:${cz}`}
function progress(goal){if(goal==='stolenCoins')return state.stolenCoins;if(goal==='coinsEarned')return state.coinsEarned;if(goal==='npcMissions')return state.npcMissions;if(goal==='districtsSeen')return state.seenDistricts.length;if(goal==='containersOpened')return state.containersOpened;if(goal==='districtsOwned')return state.ownedDistricts.length;return 0}
function activeQuest(){return QUESTS.find(q=>!state.completedQuests.includes(q.id))||{id:'free',title:'Légende urbaine',text:'Explore librement, collectionne les artefacts et sécurise les quartiers.',goal:'districtsOwned',target:999}}
function checkQuests(){for(const q of QUESTS){if(state.completedQuests.includes(q.id))continue;if(progress(q.goal)>=q.target){state.completedQuests.push(q.id);state.coins+=q.reward;toast(`Quête terminée : ${q.title} +${q.reward} crédits`)}}}

let scene,camera,renderer,clock,textures={},chunks=new Map(),colliders=[],pickups=[],shops=[],apartments=[],containers=[],npcs=[],enemies=[],cars=[];
let activeEnemy=null,activeEnemyEntity=null,moveStick={x:0,y:0},lookStick={x:0,y:0},weaponRig=null,interiorGroup=null,lastChunkTick=0,lastMapTick=0,lastWeatherTick=0;

async function init(){
 try{THREE=await import(THREE_URL)}catch{return toast('Connexion requise au premier lancement du moteur 3D')}
 const host=$('#threeHost');scene=new THREE.Scene();scene.background=new THREE.Color(0x8facbd);scene.fog=new THREE.Fog(0x8facbd,70,220);
 camera=new THREE.PerspectiveCamera(72,host.clientWidth/host.clientHeight,.06,260);
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(host.clientWidth,host.clientHeight);host.appendChild(renderer.domElement);clock=new THREE.Clock();
 scene.add(new THREE.HemisphereLight(0xd8eeff,0x334030,2.1));const sun=new THREE.DirectionalLight(0xfff0ce,1.9);sun.name='sun';sun.position.set(50,80,30);scene.add(sun);
 textures=createTextures();weaponRig=createWeaponRig();camera.add(weaponRig);scene.add(camera);
 ensureChunks(true);updateHUD();animate();
 addEventListener('resize',()=>{camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)});
}
function tex(draw,rx=4,ry=4){const c=document.createElement('canvas');c.width=c.height=256;const q=c.getContext('2d');draw(q,256,256);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}
function createTextures(){
 const asphalt=tex(q=>{q.fillStyle='#30363a';q.fillRect(0,0,256,256);for(let i=0;i<1800;i++){const g=40+Math.random()*35;q.fillStyle=`rgb(${g},${g},${g})`;q.fillRect(Math.random()*256,Math.random()*256,1,1)}},5,5);
 const pave=tex(q=>{q.fillStyle='#a39f95';q.fillRect(0,0,256,256);q.strokeStyle='#77736b';q.lineWidth=2;for(let i=0;i<9;i++){q.beginPath();q.moveTo(i*32,0);q.lineTo(i*32,256);q.stroke();q.beginPath();q.moveTo(0,i*32);q.lineTo(256,i*32);q.stroke()}},6,6);
 const grass=tex(q=>{q.fillStyle='#416a48';q.fillRect(0,0,256,256);for(let i=0;i<1700;i++){q.fillStyle=Math.random()>.5?'#527b55':'#345c3d';q.fillRect(Math.random()*256,Math.random()*256,1,3)}},7,7);
 const brick=tex(q=>{q.fillStyle='#7c5f57';q.fillRect(0,0,256,256);q.strokeStyle='#523e39';for(let y=0;y<256;y+=22){q.beginPath();q.moveTo(0,y);q.lineTo(256,y);q.stroke();for(let x=(y/22)%2?16:0;x<256;x+=32){q.beginPath();q.moveTo(x,y);q.lineTo(x,y+22);q.stroke()}}for(let y=10;y<250;y+=44)for(let x=10;x<245;x+=42){q.fillStyle='#92b6c8';q.fillRect(x,y,18,20)}},3,4);
 const modern=tex(q=>{q.fillStyle='#657584';q.fillRect(0,0,256,256);for(let y=8;y<250;y+=34)for(let x=8;x<250;x+=30){q.fillStyle=Math.random()>.2?'#9fc5d9':'#2e3b48';q.fillRect(x,y,17,20);q.fillStyle='#d7e5ec44';q.fillRect(x+2,y+2,13,3)}},3,4);
 return{asphalt,pave,grass,brick,modern}
}
function createWeaponRig(){
 const g=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color:0x38424d,metalness:.6,roughness:.35});
 const body=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,.72),mat);body.position.set(.31,-.26,-.72);body.rotation.x=-.08;g.add(body);
 const grip=new THREE.Mesh(new THREE.BoxGeometry(.12,.32,.13),new THREE.MeshStandardMaterial({color:0x171b20}));grip.position.set(.31,-.39,-.53);grip.rotation.x=-.3;g.add(grip);g.visible=state.equipped!=='fists';return g
}

function makeRoad(g,x0,z0){
 const roadM=new THREE.MeshStandardMaterial({map:textures.asphalt,roughness:1}),paveM=new THREE.MeshStandardMaterial({map:textures.pave,roughness:1});
 const roadW=11,walk=3;
 let a=new THREE.Mesh(new THREE.PlaneGeometry(roadW,CHUNK),roadM);a.rotation.x=-Math.PI/2;a.position.set(x0+roadW/2,.01,z0+CHUNK/2);g.add(a);
 a=new THREE.Mesh(new THREE.PlaneGeometry(CHUNK,roadW),roadM);a.rotation.x=-Math.PI/2;a.position.set(x0+CHUNK/2,.012,z0+roadW/2);g.add(a);
 a=new THREE.Mesh(new THREE.PlaneGeometry(walk,CHUNK-roadW),paveM);a.rotation.x=-Math.PI/2;a.position.set(x0+roadW+walk/2,.02,z0+(CHUNK+roadW)/2);g.add(a);
 a=new THREE.Mesh(new THREE.PlaneGeometry(CHUNK-roadW,walk),paveM);a.rotation.x=-Math.PI/2;a.position.set(x0+(CHUNK+roadW)/2,.021,z0+roadW+walk/2);g.add(a);
 const white=new THREE.MeshBasicMaterial({color:0xe9e4d0});
 for(let i=0;i<6;i++){let m=new THREE.Mesh(new THREE.PlaneGeometry(.16,4),white);m.rotation.x=-Math.PI/2;m.position.set(x0+roadW/2,.025,z0+17+i*9);g.add(m);m=new THREE.Mesh(new THREE.PlaneGeometry(4,.16),white);m.rotation.x=-Math.PI/2;m.position.set(x0+17+i*9,.026,z0+roadW/2);g.add(m)}
 // crosswalks
 for(let k=0;k<5;k++){let s=new THREE.Mesh(new THREE.PlaneGeometry(.7,4.7),white);s.rotation.x=-Math.PI/2;s.position.set(x0+13+k*1.4,.027,z0+7.6);g.add(s);let t=new THREE.Mesh(new THREE.PlaneGeometry(4.7,.7),white);t.rotation.x=-Math.PI/2;t.position.set(x0+7.6,.028,z0+13+k*1.4);g.add(t)}
}
function createChunk(cx,cz){
 const key=ck(cx,cz);if(chunks.has(key))return;const r=rngFor(key),g=new THREE.Group();g.userData={key,cx,cz};scene.add(g);chunks.set(key,g);
 const x0=cx*CHUNK,z0=cz*CHUNK,d=districtFor(cx,cz),grass=new THREE.Mesh(new THREE.PlaneGeometry(CHUNK,CHUNK),new THREE.MeshStandardMaterial({map:textures.grass,roughness:1}));grass.rotation.x=-Math.PI/2;grass.position.set(x0+CHUNK/2,-.04,z0+CHUNK/2);g.add(grass);makeRoad(g,x0,z0);
 const id=districtId(cx,cz);if(!state.seenDistricts.includes(id))state.seenDistricts.push(id);

 // building lots are always INSIDE blocks, never roads or sidewalks
 const lots=[[25,25],[51,25],[25,51],[51,51]];
 lots.forEach((p,i)=>{
   if(r()<.19){addPark(g,x0+p[0],z0+p[1],r);return}
   const w=14+r()*6,dep=14+r()*6,h=(d.style==='central'?16:8)+r()*(d.style==='central'?24:18);
   const x=x0+p[0]+(r()-.5)*2,z=z0+p[1]+(r()-.5)*2;
   const mat=new THREE.MeshStandardMaterial({map:d.style==='old'?textures.brick:(r()<.5?textures.modern:textures.brick),roughness:.87});
   const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,dep),mat);b.position.set(x,h/2,z);g.add(b);colliders.push({key,minX:x-w/2-.35,maxX:x+w/2+.35,minZ:z-dep/2-.35,maxZ:z+dep/2+.35,type:'building'});
   if(i===0&&r()<.34)addApartmentDoor(g,key,x,z,dep);
 });
 // shops are separate storefronts placed in reserved lot edge, not sidewalks/roads
 if((cx===0&&cz===0)||r()<.25)addShop(g,key,x0+19,z0+20,r);
 // vegetation
 const trees=3+Math.floor(r()*(d.style==='green'?10:5));for(let i=0;i<trees;i++){const p=randomGreenPoint(x0,z0,r);addTree(g,p.x,p.z,r)}
 // bins / chests
 const cont=1+Math.floor(r()*3);for(let i=0;i<cont;i++){const p=randomSidewalk(x0,z0,r),type=r()<.72?'bin':'chest',idc=`${key}:container:${i}`;if(!state.collected.includes(idc))addContainer(g,key,idc,p.x,p.z,type)}
 // loot
 const lootN=2+Math.floor(r()*4);for(let i=0;i<lootN;i++){const p=randomSidewalk(x0,z0,r),type=r()<.68?'medkit':'rare',idl=`${key}:loot:${i}`;if(!state.collected.includes(idl))addPickup(g,key,idl,p.x,p.z,type)}
 // artifact, sparse, across city
 if(!state.artifacts.includes(state.cityId)&&((Math.abs(cx)+Math.abs(cz)>1&&r()<.055)||(cx===3&&cz===-2))){const p=randomSidewalk(x0,z0,r),idl=`${key}:artifact`;if(!state.collected.includes(idl))addPickup(g,key,idl,p.x,p.z,'artifact')}
 // NPCs, more civilians, much fewer enemies
 const npcN=3+Math.floor(r()*4);for(let i=0;i<npcN;i++){const p=randomSidewalk(x0,z0,r);addNPC(g,key,p.x,p.z,r)}
 if(r()<.10){const p=randomSidewalk(x0,z0,r);addEnemy(g,key,p.x,p.z,r)}
 // traffic
 const carN=1+Math.floor(r()*2);for(let i=0;i<carN;i++)addCar(g,key,x0,z0,r,i);
}
function randomSidewalk(x0,z0,r){return r()<.5?{x:x0+14.2,z:z0+17+r()*(CHUNK-22)}:{x:x0+17+r()*(CHUNK-22),z:z0+14.2}}
function randomGreenPoint(x0,z0,r){return{x:x0+19+r()*(CHUNK-24),z:z0+19+r()*(CHUNK-24)}}
function addPark(g,x,z,r){const m=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshStandardMaterial({map:textures.grass,roughness:1}));m.rotation.x=-Math.PI/2;m.position.set(x,.025,z);g.add(m);for(let i=0;i<4;i++)addTree(g,x+(r()-.5)*15,z+(r()-.5)*15,r)}
function addTree(g,x,z,r){const tree=new THREE.Group(),trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.24,2.4,8),new THREE.MeshStandardMaterial({color:0x684834}));trunk.position.y=1.2;tree.add(trunk);const crown=new THREE.Mesh(new THREE.SphereGeometry(1.15+r()*.6,10,8),new THREE.MeshStandardMaterial({color:choice([0x3f7c4c,0x4d8b57,0x356a43])}));crown.position.y=2.8;tree.add(crown);tree.position.set(x,0,z);g.add(tree)}
function makeSign(text,color='#ffdb77'){const c=document.createElement('canvas');c.width=512;c.height=128;const q=c.getContext('2d');q.fillStyle='#10222a';q.fillRect(0,0,512,128);q.fillStyle=color;q.font='bold 44px system-ui';q.textAlign='center';q.textBaseline='middle';q.fillText(text,256,64);const t=new THREE.CanvasTexture(c),s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true}));s.scale.set(5.2,1.3,1);return s}
function addShop(g,key,x,z,r){const type=choice(Object.keys(SHOPS)),shop=SHOPS[type],group=new THREE.Group(),body=new THREE.Mesh(new THREE.BoxGeometry(9,5,8),new THREE.MeshStandardMaterial({color:type==='corner'?0x3d6e57:type==='gear'?0x4f5964:0x5c4768,roughness:.75}));body.position.y=2.5;group.add(body);const glass=new THREE.Mesh(new THREE.PlaneGeometry(4,2.5),new THREE.MeshBasicMaterial({color:0x8ed5ee,transparent:true,opacity:.5}));glass.position.set(0,1.8,4.01);group.add(glass);const sign=makeSign(`${shop.icon} ${shop.name}`);sign.position.set(0,4.6,4.12);group.add(sign);group.position.set(x,0,z);g.add(group);colliders.push({key,minX:x-4.6,maxX:x+4.6,minZ:z-4.2,maxZ:z+4.2,type:'shop'});shops.push({key,x,z,type,group,door:{x,z:z+4.7}})}
function addApartmentDoor(g,key,x,z,dep){const door=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.5),new THREE.MeshBasicMaterial({color:0x35271f}));door.position.set(x,1.35,z+dep/2+.011);g.add(door);apartments.push({key,x,z:z+dep/2+.9,id:`${key}:apt`})}
function addContainer(g,key,id,x,z,type){const mesh=new THREE.Mesh(type==='bin'?new THREE.CylinderGeometry(.42,.48,.9,10):new THREE.BoxGeometry(.9,.55,.65),new THREE.MeshStandardMaterial({color:type==='bin'?0x335d45:0x74572e}));mesh.position.set(x,type==='bin'?.45:.28,z);mesh.userData={key,id,type};g.add(mesh);containers.push(mesh)}
function addPickup(g,key,id,x,z,type){const color={coins:0xffd15b,medkit:0x62e3a4,rare:0xa68cff,artifact:0x60d8ff}[type],geo=type==='artifact'?new THREE.OctahedronGeometry(.65):type==='coins'?new THREE.CylinderGeometry(.34,.34,.12,16):new THREE.BoxGeometry(.6,.6,.6),m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,emissive:type==='artifact'?0x15536a:0x000000,emissiveIntensity:1}));m.position.set(x,type==='artifact'?.72:.43,z);m.userData={key,id,type};g.add(m);pickups.push(m)}
function addNPC(g,key,x,z,r){const n=createPerson(false,key,x,z,r);g.add(n.group);npcs.push(n)}
function addEnemy(g,key,x,z,r){const n=createPerson(true,key,x,z,r);n.speed*=1.1;g.add(n.group);enemies.push(n)}
function createPerson(hostile,key,x,z,r){const group=new THREE.Group(),cloth=new THREE.MeshStandardMaterial({color:hostile?0x6d2434:choice([0x315f7b,0x486d45,0x6a4e75,0x785f42])}),skin=new THREE.MeshStandardMaterial({color:0xd5a47c}),body=new THREE.Mesh(new THREE.CapsuleGeometry(.27,.72,5,8),cloth);body.position.y=1.05;group.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.24,9,9),skin);head.position.y=1.72;group.add(head);const lm=new THREE.MeshStandardMaterial({color:0x222b34}),l1=new THREE.Mesh(new THREE.BoxGeometry(.15,.67,.17),lm),l2=l1.clone();l1.position.set(-.13,.38,0);l2.position.set(.13,.38,0);group.add(l1,l2);group.position.set(x,0,z);const hasCash=r()<.56;return{key,group,hostile,axis:r()<.5?'x':'z',speed:.55+r()*.55,dir:r()<.5?-1:1,home:{x,z},money:hasCash?(5+Math.floor(r()*46)):0,legs:[l1,l2],phase:r()*6.2,name:hostile?'Rôdeur hostile':choice(['Lina','Noah','Maya','Nino','Sara','Eliott','Inès','Adam']),missionGiven:false,caught:false,pickpocketed:false}}
function addCar(g,key,x0,z0,r,i){const vertical=r()<.5,group=new THREE.Group(),body=new THREE.Mesh(new THREE.BoxGeometry(1.65,.65,3.4),new THREE.MeshStandardMaterial({color:choice([0xc44b4b,0x4b6fc4,0x444b52,0xe0d3b4,0x4f9c68]),metalness:.25,roughness:.45}));body.position.y=.65;group.add(body);const top=new THREE.Mesh(new THREE.BoxGeometry(1.4,.55,1.75),new THREE.MeshStandardMaterial({color:0x607b8c,transparent:true,opacity:.82}));top.position.set(0,1.18,-.15);group.add(top);group.position.set(vertical?x0+3.2:x0+15+i*14,.0,vertical?z0+18+i*18:z0+3.2);if(!vertical)group.rotation.y=Math.PI/2;g.add(group);cars.push({key,group,vertical,dir:r()<.5?-1:1,speed:4+r()*2.3,x0,z0})}

function unload(key){const g=chunks.get(key);if(!g)return;scene.remove(g);chunks.delete(key);colliders=colliders.filter(x=>x.key!==key);pickups=pickups.filter(x=>x.userData.key!==key);shops=shops.filter(x=>x.key!==key);apartments=apartments.filter(x=>x.key!==key);containers=containers.filter(x=>x.userData.key!==key);npcs=npcs.filter(x=>x.key!==key);enemies=enemies.filter(x=>x.key!==key);cars=cars.filter(x=>x.key!==key)}
function ensureChunks(force=false){if(state.interior)return;const {cx,cz}=currentChunk();for(let x=cx-LOAD;x<=cx+LOAD;x++)for(let z=cz-LOAD;z<=cz+LOAD;z++)createChunk(x,z);for(const[k,g]of chunks){if(Math.abs(g.userData.cx-cx)>UNLOAD||Math.abs(g.userData.cz-cz)>UNLOAD)unload(k)}if(force)drawMap()}
function collides(x,z){if(state.interior)return Math.abs(x)>8.5||z<-8.5||z>8.5;return colliders.some(c=>x+RADIUS>c.minX&&x-RADIUS<c.maxX&&z+RADIUS>c.minZ&&z-RADIUS<c.maxZ)}
function movePlayer(dx,dz){const nx=state.pos.x+dx,nz=state.pos.z+dz;if(!collides(nx,state.pos.z))state.pos.x=nx;if(!collides(state.pos.x,nz))state.pos.z=nz}
function updateCamera(t=0){const bob=(Math.abs(moveStick.x)+Math.abs(moveStick.y)>.15)?Math.sin(t*.012)*.022:0;camera.position.set(state.pos.x,1.72+bob,state.pos.z);const cp=Math.cos(state.pitch),sp=Math.sin(state.pitch),sy=Math.sin(state.yaw),cy=Math.cos(state.yaw);camera.lookAt(state.pos.x+sy*cp,1.72+sp+bob,state.pos.z-cy*cp)}
function updateWorldLight(dt){
 state.timeOfDay=(state.timeOfDay+dt*.028)%24;const sun=scene.getObjectByName('sun'),day=Math.max(.08,Math.sin((state.timeOfDay-6)/24*Math.PI*2)*.5+.5);sun.intensity=.15+day*1.9;scene.children.find(x=>x.isHemisphereLight).intensity=.35+day*1.8;
 const sky=new THREE.Color().setRGB(.05+.45*day,.08+.58*day,.12+.62*day);scene.background.copy(sky);scene.fog.color.copy(sky);
 if(performance.now()-lastWeatherTick>45000){lastWeatherTick=performance.now();const r=Math.random();state.weather=r<.68?'clear':r<.85?'cloudy':'rain'}
}
function updateCars(dt){for(const c of cars){if(c.vertical){c.group.position.z+=c.dir*c.speed*dt;if(c.group.position.z<c.z0+8||c.group.position.z>c.z0+CHUNK-6)c.dir*=-1}else{c.group.position.x+=c.dir*c.speed*dt;if(c.group.position.x<c.x0+8||c.group.position.x>c.x0+CHUNK-6)c.dir*=-1}}}
function updatePeople(dt,t){for(const n of [...npcs,...enemies]){if(n===activeEnemyEntity)continue;const dx=state.pos.x-n.group.position.x,dz=state.pos.z-n.group.position.z,dist=Math.hypot(dx,dz);if(n.hostile&&dist<8.5){n.group.position.x+=dx/(dist||1)*n.speed*1.25*dt;n.group.position.z+=dz/(dist||1)*n.speed*1.25*dt;if(dist<1.55&&!activeEnemy)startCombat(n)}else{const off=n.axis==='x'?n.group.position.x-n.home.x:n.group.position.z-n.home.z;if(Math.abs(off)>19)n.dir*=-1;if(n.axis==='x')n.group.position.x+=n.dir*n.speed*dt;else n.group.position.z+=n.dir*n.speed*dt}n.legs[0].rotation.x=Math.sin(t*.006*n.speed+n.phase)*.55;n.legs[1].rotation.x=-n.legs[0].rotation.x}}
function animatePickups(dt,t){for(const p of pickups){if(!p.parent)continue;p.rotation.y+=dt;p.position.y=(p.userData.type==='artifact'?.72:.43)+Math.sin(t/450+p.position.x)*.07}}
function animate(){
 if(!renderer)return;requestAnimationFrame(animate);const dt=Math.min(.033,clock.getDelta()),t=performance.now();
 const forward=-moveStick.y,strafe=moveStick.x,fx=Math.sin(state.yaw),fz=-Math.cos(state.yaw),rx=Math.cos(state.yaw),rz=Math.sin(state.yaw);movePlayer((fx*forward+rx*strafe)*4.8*dt,(fz*forward+rz*strafe)*4.8*dt);state.yaw+=lookStick.x*2.0*dt;state.pitch=clamp(state.pitch-lookStick.y*1.5*dt,-1.06,1.06);
 updateCamera(t);if(!state.interior){updatePeople(dt,t);updateCars(dt);animatePickups(dt,t);if(t-lastChunkTick>650){ensureChunks();lastChunkTick=t}}updateWorldLight(dt);checkInteraction();if(t-lastMapTick>100){drawMap();lastMapTick=t}state.wanted=Math.max(0,state.wanted-dt*.5);updateHUD();renderer.render(scene,camera)
}

function entityPos(x){
 if(!x)return null;
 if(x.group?.position)return x.group.position;
 if(x.position)return x.position;
 if(Number.isFinite(x.x)&&Number.isFinite(x.z))return x;
 if(x.door&&Number.isFinite(x.door.x)&&Number.isFinite(x.door.z))return x.door;
 return null
}
function nearest(arr,max){
 let best=null,d0=max;
 for(const x of arr){
   const p=entityPos(x);if(!p)continue;
   const d=Math.hypot(state.pos.x-p.x,state.pos.z-p.z);
   if(d<d0){best=x;d0=d}
 }
 return best
}
function checkInteraction(){
 if(activeEnemy||!$('#dialogue').classList.contains('hidden')||!$('#theft').classList.contains('hidden'))return hidePrompt();
 if(state.interior){
   if(state.interior.type==='shop'){
     if(state.pos.z<-4.6)return setPrompt('Comptoir',`Voir le stock de ${SHOPS[state.interior.shopType].name}.`,'ACHETER',()=>openSheet('physicalShop'));
     if(state.pos.z>5.5)return setPrompt('Sortie','Retourner dans la rue.','SORTIR',leaveInterior);
     return hidePrompt()
   }
   if(state.pos.z>5.5)return setPrompt('Sortie','Retourner dans la rue.','SORTIR',leaveInterior);
   return hidePrompt()
 }
 const p=nearest(pickups.filter(x=>x.parent),1.6);if(p)return setPrompt(pickupName(p.userData.type),'Objet trouvé dans la rue.','RAMASSER',()=>collectPickup(p));
 const c=nearest(containers.filter(x=>x.parent),1.7);if(c)return setPrompt(c.userData.type==='bin'?'Poubelle':'Coffre',c.userData.type==='bin'?'Fouiller discrètement.':'Ouvrir le coffre.','FOUILLER',()=>openContainer(c));
 const s=shops.reduce((b,x)=>{const d=Math.hypot(state.pos.x-x.door.x,state.pos.z-x.door.z);return !b||d<b.d?{x,d}:b},null);if(s&&s.d<1.8)return setPrompt(SHOPS[s.x.type].name,'Entrer réellement dans la boutique.','ENTRER',()=>enterInterior('shop',s.x));
 const a=nearest(apartments,1.6);if(a)return setPrompt('Immeuble résidentiel','Entrer dans le hall et explorer un appartement.','ENTRER',()=>enterInterior('apartment',a));
 const n=nearest(npcs,1.55);if(n)return setPrompt(n.name,'Parler, demander une mission ou tenter un vol à la tire.','PARLER',()=>talkNPC(n));
 hidePrompt()
}
function setPrompt(t,d,b,fn){$('#promptTitle').textContent=t;$('#promptText').textContent=d;$('#promptBtn').textContent=b;$('#promptBtn').onclick=fn;$('#prompt').classList.remove('hidden')}
function hidePrompt(){$('#prompt').classList.add('hidden')}
function pickupName(t){return{medkit:'Kit de soin',rare:'Cache de matériel',artifact:city().artifact}[t]}
function collectPickup(m){
 const{id,type}=m.userData;if(state.collected.includes(id))return;
 if(type==='medkit'&&invCount()>=state.bagMax)return toast('Sac plein');
 state.collected.push(id);
 if(type==='medkit'){addInv('medkit');toast('Kit de soin récupéré')}
 if(type==='rare'){state.xp+=35;if(Math.random()<.45&&invCount()<state.bagMax){addInv('medkit');toast('Cache : kit de soin + XP')}else{state.armor=clamp(state.armor+12,0,100);toast('Cache : matériel de protection + XP')}}
 if(type==='artifact'&&!state.artifacts.includes(state.cityId)){state.artifacts.push(state.cityId);state.xp+=180;toast(`${city().artifact} récupéré !`)}
 if(m.parent)m.parent.remove(m);pickups=pickups.filter(x=>x!==m);levelCheck();checkQuests();save();hidePrompt()
}
function openContainer(m){
 const{id,type}=m.userData;if(state.collected.includes(id))return;
 state.collected.push(id);state.containersOpened++;
 const roll=Math.random();
 if(roll<.38&&invCount()<state.bagMax){addInv('medkit');toast(`${type==='chest'?'Coffre':'Poubelle'} : kit de soin`)}
 else if(roll<.72){state.armor=clamp(state.armor+(type==='chest'?16:7),0,100);toast(`${type==='chest'?'Coffre':'Poubelle'} : matériel de protection`)}
 else{state.xp+=type==='chest'?35:15;toast(`${type==='chest'?'Coffre':'Poubelle'} : matériel ancien + XP`)}
 if(m.parent)m.parent.remove(m);containers=containers.filter(x=>x!==m);checkQuests();save();hidePrompt()
}

function talkNPC(n){
 const lines=[`Salut ! ${city().name} est tranquille si tu prends le temps de l’explorer.`,`J’ai entendu parler d’une cache dans le quartier.`,`Les commerces changent selon les secteurs.`,`Évite les rôdeurs, ils sont rares mais parfois coriaces.`];
 showDialogue(n.name,choice(lines),()=>{
  if(!n.missionGiven&&Math.random()<.55){n.missionGiven=true;assignNpcMission(n);showDialogue(n.name,`J’ai un service à te demander : ${state.activeNpcMission.text}`,hideDialogue)}
  else showDialogue(n.name,'Bonne balade !',()=>showNpcChoices(n))
 })
}
function showNpcChoices(n){
 $('#dialogue').classList.add('hidden');
 openSheet('npc');$('#sheetTitle').textContent=n.name;$('#sheetBody').innerHTML=`<div class="card"><h3>Que faire ?</h3><div class="grid2"><button class="menuBtn primary" id="talkAgain">💬 Discuter</button><button class="menuBtn" id="pickpocket" ${n.pickpocketed||n.caught?'disabled':''}>🫳 Faire les poches<small>${n.pickpocketed?'Déjà fouillé':n.caught?'Sur ses gardes':'Maintiens puis relâche au bon moment.'}</small></button></div></div>`;
 $('#talkAgain').onclick=()=>{closeSheet();showDialogue(n.name,'Profite du quartier, il y a toujours quelque chose à découvrir.',hideDialogue)};const pp=$('#pickpocket');if(pp)pp.onclick=()=>{closeSheet();startPickpocket(n)}
}
function assignNpcMission(n){const opts=[{kind:'pockets',text:'récupère 30 crédits sur des passants',target:30,start:state.stolenCoins,reward:90},{kind:'container',text:'fouille 2 caches ou poubelles',target:2,start:state.containersOpened,reward:110},{kind:'explore',text:'découvre 2 nouveaux quartiers',target:2,start:state.seenDistricts.length,reward:120}];state.activeNpcMission={...choice(opts),giver:n.name};save()}
function npcMissionProgress(){const m=state.activeNpcMission;if(!m)return null;const now=m.kind==='pockets'?state.stolenCoins:m.kind==='container'?state.containersOpened:state.seenDistricts.length;return now-m.start}
function maybeCompleteNpcMission(){const m=state.activeNpcMission;if(!m)return;if(npcMissionProgress()>=m.target){state.coins+=m.reward;state.npcMissions++;toast(`Mission de ${m.giver} terminée +${m.reward}`);state.activeNpcMission=null;checkQuests();save()}}
let theftState=null,theftRAF=0;
function startPickpocket(n){
 if(n.pickpocketed)return toast('Tu as déjà vérifié ses poches');
 if(n.caught)return toast('Cette personne est sur ses gardes');
 const distance=Math.hypot(state.pos.x-n.group.position.x,state.pos.z-n.group.position.z);
 if(distance>1.8)return toast('Approche-toi davantage');
 hidePrompt();
 n._theftSpeed=n.speed;n.speed=0;
 const required=950+Math.random()*420-Math.min(260,state.stealth*85);
 const detection=Math.max(required+380,required+650+Math.random()*850+state.stealth*150-state.wanted*80);
 theftState={npc:n,required,detection,start:0,holding:false};
 $('#theftName').textContent=n.name;$('#theftText').textContent='Maintiens le bouton. Relâche dans la zone verte. Trop tôt = rien, trop tard = repéré.';
 $('#theftBar').style.width='0%';
 const sweetStart=required/detection*100;
 const sweetWidth=Math.max(10,Math.min(28,(detection-required)/detection*100));
 $('#theftSweet').style.left=`${sweetStart}%`;$('#theftSweet').style.width=`${sweetWidth}%`;
 $('#theftStatus').textContent='Prêt…';$('#theftHold').className='theftHold';$('#theft').classList.remove('hidden')
}
function theftBegin(e){
 if(!theftState||theftState.holding)return;
 e.preventDefault();theftState.holding=true;theftState.start=performance.now();$('#theftStatus').textContent='Doucement…';theftLoop()
}
function theftRelease(e){
 if(!theftState||!theftState.holding)return;
 e?.preventDefault();const elapsed=performance.now()-theftState.start;theftState.holding=false;cancelAnimationFrame(theftRAF);
 if(elapsed<theftState.required){
   $('#theftBar').style.width='0%';$('#theftStatus').textContent='Trop tôt. Réessaie sans traîner.';$('#theftHold').className='theftHold';return
 }
 if(elapsed<theftState.detection)return theftSuccess()
}
function theftLoop(){
 if(!theftState||!theftState.holding)return;
 const n=theftState.npc,dist=Math.hypot(state.pos.x-n.group.position.x,state.pos.z-n.group.position.z);
 if(dist>1.95)return cancelTheft('Tu t’es trop éloigné.');
 const elapsed=performance.now()-theftState.start,pct=clamp(elapsed/theftState.detection*100,0,100);
 $('#theftBar').style.width=`${pct}%`;
 if(elapsed>=theftState.required){$('#theftStatus').textContent='BON MOMENT — RELÂCHE !';$('#theftHold').className='theftHold ready'}
 else if(elapsed>theftState.required*.7){$('#theftStatus').textContent='Presque…';$('#theftHold').className='theftHold'}
 if(elapsed>=theftState.detection)return theftCaught();
 theftRAF=requestAnimationFrame(theftLoop)
}
function theftSuccess(){
 const n=theftState.npc,amount=n.money;n.pickpocketed=true;n.money=0;restoreTheftNPC();
 $('#theft').classList.add('hidden');theftState=null;
 if(amount>0){state.coins+=amount;state.coinsEarned+=amount;state.stolenCoins+=amount;state.pickpockets++;toast(`Poches réussies : +${amount} crédits`)}
 else toast('Poches vides — cette personne n’avait pas d’argent.');
 checkQuests();maybeCompleteNpcMission();save()
}
function theftCaught(){
 const n=theftState.npc;n.caught=true;n.pickpocketed=true;restoreTheftNPC(true);
 state.wanted=clamp(state.wanted+1,0,5);$('#theft').classList.add('hidden');theftState=null;
 toast('Trop long ! Tu as été repéré 🚨');
 if(state.wanted>=2)spawnSecurity();
 save()
}
function cancelTheft(msg='Vol annulé'){
 if(!theftState)return;cancelAnimationFrame(theftRAF);restoreTheftNPC();theftState=null;$('#theft').classList.add('hidden');toast(msg)
}
function restoreTheftNPC(run=false){
 if(!theftState?.npc)return;const n=theftState.npc;n.speed=n._theftSpeed||n.speed;if(run)n.speed*=1.8;delete n._theftSpeed
}
function spawnSecurity(){
 const {cx,cz}=currentChunk(),key=ck(cx,cz),g=chunks.get(key);if(!g||!THREE)return;
 const r=rngFor(key+':security:'+Math.floor(performance.now())),n=createPerson(true,key,state.pos.x+5,state.pos.z+5,r);n.name='Agent de sécurité';n.speed=1.35;g.add(n.group);enemies.push(n)
}

function showDialogue(name,text,next){$('#dialogueName').textContent=name;$('#dialogueText').textContent=text;$('#dialogueIcon').textContent='🙂';$('#dialogue').classList.remove('hidden');$('#dialogueNext').onclick=next}
function hideDialogue(){$('#dialogue').classList.add('hidden')}

function enterInterior(type,obj){
 state.returnPos={...state.pos};state.interior={type,shopType:obj.type||null};for(const[,g]of chunks)g.visible=false;
 if(interiorGroup)scene.remove(interiorGroup);interiorGroup=new THREE.Group();scene.add(interiorGroup);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(18,18),new THREE.MeshStandardMaterial({color:type==='shop'?0x786f60:0x6b665f,roughness:1}));floor.rotation.x=-Math.PI/2;interiorGroup.add(floor);
 const wallM=new THREE.MeshStandardMaterial({color:type==='shop'?0xc8c0aa:0xd2cbc1});[[0,2.5,-9,18,.25],[0,2.5,9,18,.25],[-9,2.5,0,.25,18],[9,2.5,0,.25,18]].forEach(w=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w[3],5,w[4]),wallM);m.position.set(w[0],w[1],w[2]);interiorGroup.add(m)});
 if(type==='shop')buildShopInterior(obj.type);else buildApartmentInterior();
 state.pos={x:0,z:6.5};state.yaw=0;state.pitch=0;hidePrompt();save()
}
function buildShopInterior(type){const shelfM=new THREE.MeshStandardMaterial({color:0x4c3c2d});for(let i=-1;i<=1;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.8,5),shelfM);s.position.set(i*4,1,0);interiorGroup.add(s)}const counter=new THREE.Mesh(new THREE.BoxGeometry(5,1.2,1.2),new THREE.MeshStandardMaterial({color:0x2f4855}));counter.position.set(0,.6,-6);interiorGroup.add(counter);const sign=makeSign(`${SHOPS[type].icon} ${SHOPS[type].name}`);sign.position.set(0,3,-8.5);interiorGroup.add(sign)}
function buildApartmentInterior(){const couch=new THREE.Mesh(new THREE.BoxGeometry(3,.8,1.1),new THREE.MeshStandardMaterial({color:0x5a6675}));couch.position.set(-3,.5,-3);interiorGroup.add(couch);const table=new THREE.Mesh(new THREE.BoxGeometry(1.6,.7,1.2),new THREE.MeshStandardMaterial({color:0x6e523a}));table.position.set(2,.4,-2);interiorGroup.add(table);const plant=new THREE.Group();const pot=new THREE.Mesh(new THREE.CylinderGeometry(.3,.4,.5,10),new THREE.MeshStandardMaterial({color:0x80543a}));pot.position.y=.25;plant.add(pot);const leaf=new THREE.Mesh(new THREE.SphereGeometry(.65,9,8),new THREE.MeshStandardMaterial({color:0x3f7c4d}));leaf.position.y=1.15;plant.add(leaf);plant.position.set(4,0,3);interiorGroup.add(plant)}
function exitInterior(){leaveInterior()}
function leaveInterior(){if(interiorGroup){scene.remove(interiorGroup);interiorGroup=null}for(const[,g]of chunks)g.visible=true;state.interior=null;state.pos=state.returnPos||{x:2,z:8};state.returnPos=null;save();hidePrompt()}
function physicalShopHTML(){const s=SHOPS[state.interior.shopType];return `<div class="card"><h3>${s.icon} ${s.name}</h3><p class="sub">${state.coins} crédits disponibles.</p></div><div class="card">${s.stock.map(x=>`<div class="item"><div class="itemIcon">${x.icon}</div><div class="itemMain"><b>${x.name}</b><small>${x.desc} • ${x.price} crédits</small></div><button class="menuBtn buy" data-id="${x.id}" data-price="${x.price}">Acheter</button></div>`).join('')}</div><button class="menuBtn red" id="leaveShop" style="width:100%">🚪 Sortir de la boutique</button>`}
function buy(id,price){if(state.coins<price)return toast('Pas assez de crédits');if(WEAPONS[id]&&state.ownedWeapons.includes(id))return toast('Déjà acheté');state.coins-=price;if(WEAPONS[id]){state.ownedWeapons.push(id);state.equipped=id;weaponRig.visible=true}if(id==='medkit')addInv('medkit');if(id==='snack'){state.hp=clamp(state.hp+15,0,state.maxHp)}if(id==='armor')state.armor=clamp(state.armor+30,0,100);if(id==='bag')state.bagMax+=5;if(id==='stealth')state.stealth++;if(id==='map')state.scanner=1;save();updateHUD();toast('Achat effectué');$('#sheetBody').innerHTML=physicalShopHTML();bindShop()}
function bindShop(){$$('.buy').forEach(b=>b.onclick=()=>buy(b.dataset.id,Number(b.dataset.price)));$('#leaveShop').onclick=()=>{closeSheet();leaveInterior()}}

function startCombat(n){activeEnemyEntity=n;activeEnemy={name:n.name||'Rôdeur',level:Math.max(1,state.level+choice([-1,0,0,1])),hp:38+state.level*15,maxHp:38+state.level*15,damage:5+state.level*3,reward:22+state.level*14};$('#combat').classList.remove('hidden');renderCombat()}
function renderCombat(){if(!activeEnemy)return;$('#enemyName').textContent=activeEnemy.name;$('#enemyLvl').textContent=`Niv. ${activeEnemy.level}`;$('#enemyBar').style.width=`${Math.max(0,activeEnemy.hp/activeEnemy.maxHp*100)}%`}
function animateAttack(){if(!weaponRig)return;weaponRig.rotation.x=-.8;weaponRig.position.z=-.15;setTimeout(()=>{weaponRig.rotation.x=0;weaponRig.position.z=0},120)}
function attack(){if(!activeEnemy)return;animateAttack();const dmg=weapon().damage+state.level*2+Math.floor(Math.random()*7);activeEnemy.hp-=dmg;if(activeEnemy.hp<=0){state.xp+=50+activeEnemy.level*10;if(Math.random()<.25&&invCount()<state.bagMax)addInv('medkit');state.kills++;if(activeEnemyEntity?.group.parent)activeEnemyEntity.group.parent.remove(activeEnemyEntity.group);enemies=enemies.filter(x=>x!==activeEnemyEntity);activeEnemy=null;activeEnemyEntity=null;$('#combat').classList.add('hidden');levelCheck();checkQuests();return}let hit=activeEnemy.damage+Math.floor(Math.random()*4),a=Math.min(state.armor,hit);state.armor-=a;hit-=a;state.hp-=hit;if(state.hp<=0){state.hp=state.maxHp;state.coins=Math.max(0,state.coins-60);state.wanted=0;activeEnemy=null;activeEnemyEntity=null;$('#combat').classList.add('hidden');state.pos={x:2,z:8};toast('K.O. — retour au refuge')}else renderCombat();save()}
function flee(){if(Math.random()<.75){activeEnemy=null;activeEnemyEntity=null;$('#combat').classList.add('hidden');toast('Tu t’éloignes sans problème')}else attack()}
function levelCheck(){const n=1+Math.floor(state.xp/230);if(n>state.level){state.level=n;state.maxHp+=7;state.hp=state.maxHp;toast(`Niveau ${n} !`)}}

function secureDistrict(){
 const {cx,cz}=currentChunk(),id=districtId(cx,cz);if(state.ownedDistricts.includes(id))return toast('Quartier déjà sécurisé');
 const localContainers=state.collected.filter(x=>x.startsWith(ck(cx,cz)+':container')).length;
 if(localContainers<1)return toast('Explore davantage : ouvre au moins une cache dans ce quartier');
 state.ownedDistricts.push(id);state.coins+=90;state.xp+=55;toast('Quartier sécurisé +90 crédits');checkQuests();save()
}
function scan(){
 let art=null,bd=999;for(const p of pickups){if(!p.parent||p.userData.type!=='artifact')continue;const d=Math.hypot(state.pos.x-p.position.x,state.pos.z-p.position.z);if(d<bd){art=p;bd=d}}
 const max=state.scanner?140:70;if(art&&bd<max)toast(`Artefact ${bd<10?'TRÈS PROCHE':bd<30?'PROCHE':'DANS LE SECTEUR'} • ${Math.round(bd)} m`);else toast(`Scanner : ${state.scanner?'longue':'courte'} portée — aucun artefact détecté ici`)
}

function drawMap(){
 const c=$('#minimap'),q=c.getContext('2d'),W=c.width,H=c.height,S=2.0,R=45;q.clearRect(0,0,W,H);q.fillStyle='#07111d';q.fillRect(0,0,W,H);q.save();q.translate(W/2,H/2);
 if(state.interior){q.fillStyle='#8594a0';q.fillRect(-35,-35,70,70);q.fillStyle='#fff';q.beginPath();q.arc(0,0,4,0,Math.PI*2);q.fill();q.restore();return}
 q.strokeStyle='#47555e';q.lineWidth=11*S;const minCx=Math.floor((state.pos.x-R)/CHUNK)-1,maxCx=Math.floor((state.pos.x+R)/CHUNK)+1,minCz=Math.floor((state.pos.z-R)/CHUNK)-1,maxCz=Math.floor((state.pos.z+R)/CHUNK)+1;
 for(let cx=minCx;cx<=maxCx;cx++){const x=(cx*CHUNK-state.pos.x)*S;q.beginPath();q.moveTo(x,-H);q.lineTo(x,H);q.stroke()}for(let cz=minCz;cz<=maxCz;cz++){const y=(cz*CHUNK-state.pos.z)*S;q.beginPath();q.moveTo(-W,y);q.lineTo(W,y);q.stroke()}
 q.fillStyle='#6a7680';for(const b of colliders){const x=(b.minX-state.pos.x)*S,y=(b.minZ-state.pos.z)*S,w=(b.maxX-b.minX)*S,h=(b.maxZ-b.minZ)*S;if(Math.abs(x)>W||Math.abs(y)>H)continue;q.fillRect(x,y,w,h)}
 q.fillStyle='#63e2b0';for(const s of shops){const dx=(s.x-state.pos.x)*S,dz=(s.z-state.pos.z)*S;if(Math.abs(dx)<W/2&&Math.abs(dz)<H/2){q.beginPath();q.arc(dx,dz,5,0,Math.PI*2);q.fill()}}
 q.fillStyle='#ff6c7e';for(const e of enemies){const dx=(e.group.position.x-state.pos.x)*S,dz=(e.group.position.z-state.pos.z)*S;if(Math.abs(dx)<W/2&&Math.abs(dz)<H/2){q.beginPath();q.arc(dx,dz,3,0,Math.PI*2);q.fill()}}
 q.fillStyle='#7ccf9c';for(const n of npcs){const dx=(n.group.position.x-state.pos.x)*S,dz=(n.group.position.z-state.pos.z)*S;if(Math.abs(dx)<W/2&&Math.abs(dz)<H/2){q.beginPath();q.arc(dx,dz,2.3,0,Math.PI*2);q.fill()}}
 q.rotate(state.yaw);q.fillStyle='#fff';q.beginPath();q.moveTo(0,-8);q.lineTo(5,6);q.lineTo(0,3);q.lineTo(-5,6);q.closePath();q.fill();q.restore()
}
function updateHUD(){
 const {cx,cz}=currentChunk(),d=districtFor(cx,cz),aq=activeQuest(),prog=Math.min(aq.target,progress(aq.goal));$('#hp').textContent=Math.round(state.hp);$('#armor').textContent=Math.round(state.armor);$('#coins').textContent=state.coins;$('#level').textContent=state.level;$('#wanted').textContent=state.wanted;
 $('#district').textContent=state.interior?'INTÉRIEUR':`${city().name.toUpperCase()} • ${d.name.toUpperCase()}`;$('#missionTitle').textContent=aq.title;$('#missionText').textContent=aq.id==='free'?aq.text:`${aq.text} (${prog}/${aq.target})`;
 const icon=state.weather==='clear'?'☀️':state.weather==='cloudy'?'☁️':'🌧️',period=state.timeOfDay<6||state.timeOfDay>20?'NUIT':state.timeOfDay<9?'MATIN':state.timeOfDay>17?'SOIR':'JOUR';$('#weatherChip').textContent=`${icon} ${period}`;
 maybeCompleteNpcMission()
}

function makeJoy(baseSel,knobSel,target){const b=$(baseSel),k=$(knobSel);let pid=null;const mv=e=>{const r=b.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),max=30,len=Math.hypot(dx,dy)||1,f=Math.min(1,max/len);target.x=dx/max*f;target.y=dy/max*f;k.style.transform=`translate(${dx*f}px,${dy*f}px)`},reset=()=>{pid=null;target.x=target.y=0;k.style.transform='translate(0,0)'};b.addEventListener('pointerdown',e=>{pid=e.pointerId;b.setPointerCapture(pid);mv(e)});b.addEventListener('pointermove',e=>e.pointerId===pid&&mv(e));b.addEventListener('pointerup',reset);b.addEventListener('pointercancel',reset)}
makeJoy('#moveJoy','#moveKnob',moveStick);makeJoy('#lookJoy','#lookKnob',lookStick);

function openSheet(panel){
 $('#sheet').classList.remove('hidden');$$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.panel===panel));const t=$('#sheetTitle'),b=$('#sheetBody');
 if(panel==='world'){t.textContent='Monde';b.innerHTML=worldHTML()}
 if(panel==='bag'){t.textContent='Inventaire';b.innerHTML=bagHTML()}
 if(panel==='quests'){t.textContent='Quêtes';b.innerHTML=questsHTML()}
 if(panel==='districts'){t.textContent='Quartiers';b.innerHTML=districtHTML()}
 if(panel==='settings'){t.textContent='Réglages';b.innerHTML=settingsHTML()}
 if(panel==='physicalShop'){t.textContent=SHOPS[state.interior.shopType].name;b.innerHTML=physicalShopHTML()}
 bindSheet(panel)
}
function worldHTML(){return `<div class="card"><h3>Exploration chill</h3><p class="sub">Explore sans chronomètre. Les quartiers se chargent au fur et à mesure, avec voitures, habitants, boutiques, appartements, parcs et secrets.</p></div><div class="card"><h3>Voyager</h3>${CITIES.map(c=>`<button class="menuBtn cityBtn" data-city="${c.id}" style="width:100%;margin-bottom:7px">${c.name}<small>${state.artifacts.includes(c.id)?'✅ Artefact trouvé':c.artifact}</small></button>`).join('')}</div>`}
function bagHTML(){const ws=state.ownedWeapons.map(id=>WEAPONS[id]).map(w=>`<div class="item"><div class="itemIcon">${w.icon}</div><div class="itemMain"><b>${w.name}</b><small>${w.damage} dégâts</small></div><button class="menuBtn equip" data-w="${w.id}">${state.equipped===w.id?'Équipé':'Équiper'}</button></div>`).join(''),meds=state.inventory.length?state.inventory.map(i=>`<div class="item"><div class="itemIcon">🩹</div><div class="itemMain"><b>Kit de soin</b><small>×${i.qty}</small></div><button class="menuBtn useMed">Utiliser</button></div>`).join(''):'<p class="sub">Aucun consommable.</p>';return `<div class="card"><h3>Armes</h3>${ws}</div><div class="card"><h3>Sac ${invCount()}/${state.bagMax}</h3>${meds}</div><div class="card"><h3>Discrétion</h3><p class="sub">${state.pickpockets} vols réussis • ${state.stolenCoins} crédits récupérés dans les poches • niveau de recherche ${state.wanted}/5.</p></div>`}
function questsHTML(){return `<div class="card"><h3>Progression générale</h3><p class="sub">Niveau ${state.level} • ${state.ownedDistricts.length} quartiers sécurisés • ${state.npcMissions} missions PNJ • ${state.artifacts.length}/${CITIES.length} artefacts.</p></div>${QUESTS.map(q=>{const done=state.completedQuests.includes(q.id),p=Math.min(q.target,progress(q.goal));return `<div class="card"><h3>${done?'✅':'📌'} ${q.title}</h3><p class="sub">${q.text}</p><div class="progress"><i style="width:${p/q.target*100}%"></i></div><p class="sub">${p}/${q.target} • récompense ${q.reward} crédits</p></div>`}).join('')}${state.activeNpcMission?`<div class="card"><h3>Mission de ${state.activeNpcMission.giver}</h3><p class="sub">${state.activeNpcMission.text} — ${Math.min(state.activeNpcMission.target,npcMissionProgress())}/${state.activeNpcMission.target}</p></div>`:''}`}
function districtHTML(){const {cx,cz}=currentChunk(),d=districtFor(cx,cz),id=districtId(cx,cz);return `<div class="card"><h3>${d.name}</h3><p class="sub">${d.bonus}</p><p class="sub">${state.ownedDistricts.includes(id)?'✅ Quartier sécurisé':'Explore une cache puis sécurise le quartier.'}</p><button class="menuBtn green" id="secureDistrict" style="width:100%" ${state.ownedDistricts.includes(id)?'disabled':''}>🏳️ Sécuriser ce quartier</button></div><div class="card"><h3>Conquête</h3><p class="sub">${state.ownedDistricts.length} quartiers sécurisés au total. La conquête apporte des récompenses, mais n’empêche jamais l’exploration libre.</p></div>`}
function settingsHTML(){return `<div class="card"><h3>Réinitialisation</h3><button class="menuBtn red" id="resetGame">Nouvelle partie</button></div><div class="warning">Street View n’est pas intégré dans cette V4 : j’ai privilégié un monde 3D texturé, procédural et réellement jouable sans dépendre d’une API externe.</div>`}
function bindSheet(panel){
 if(panel==='world')$$('.cityBtn').forEach(b=>b.onclick=()=>switchCity(b.dataset.city));
 if(panel==='bag'){$$('.equip').forEach(b=>b.onclick=()=>{state.equipped=b.dataset.w;weaponRig.visible=b.dataset.w!=='fists';save();openSheet('bag')});$$('.useMed').forEach(b=>b.onclick=useMed)}
 if(panel==='districts')$('#secureDistrict').onclick=secureDistrict;
 if(panel==='settings')$('#resetGame').onclick=()=>{if(confirm('Effacer toute la partie ?')){localStorage.removeItem('sq3d-v4-1');location.reload()}};
 if(panel==='physicalShop')bindShop()
}
function switchCity(id){state.cityId=id;state.pos={x:2,z:8};state.yaw=0;state.pitch=0;for(const[k]of[...chunks])unload(k);ensureChunks(true);save();closeSheet();toast(`Bienvenue à ${city().name}`)}
function useMed(){const x=state.inventory.find(i=>i.id==='medkit');if(!x)return toast('Aucun kit');if(state.hp>=state.maxHp)return toast('PV déjà au maximum');x.qty--;state.hp=clamp(state.hp+40,0,state.maxHp);if(x.qty<=0)state.inventory=state.inventory.filter(i=>i!==x);save();openSheet('bag')}
function closeSheet(){$('#sheet').classList.add('hidden')}
let toastTimer;function toast(m){const t=$('#toast');t.textContent=m;t.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.add('hidden'),2200)}


const theftHold=$('#theftHold');
theftHold.addEventListener('pointerdown',theftBegin);
theftHold.addEventListener('pointerup',theftRelease);
theftHold.addEventListener('pointercancel',theftRelease);
theftHold.addEventListener('pointerleave',e=>{if(theftState?.holding)theftRelease(e)});
$('#theftCancel').onclick=()=>cancelTheft();

$('#scanBtn').onclick=scan;$('#interactBtn').onclick=()=>toast('Approche-toi d’un objet, d’un habitant, d’une boutique ou d’un appartement.');$('#attackBtn').onclick=attack;$('#fleeBtn').onclick=flee;$('#menuBtn').onclick=()=>openSheet('world');$('#closeSheet').onclick=closeSheet;$('#sheet').onclick=e=>e.target===$('#sheet')&&closeSheet();$$('.nav').forEach(b=>b.onclick=()=>openSheet(b.dataset.panel));
document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});document.addEventListener('gesturechange',e=>e.preventDefault(),{passive:false});document.addEventListener('gestureend',e=>e.preventDefault(),{passive:false});let lastTouch=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-lastTouch<320)e.preventDefault();lastTouch=n},{passive:false});
addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>document.hidden&&save());
init();