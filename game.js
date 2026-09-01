const THREE_URL='https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
let THREE=null;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),choice=a=>a[Math.floor(Math.random()*a.length)];
const CHUNK=72,LOAD=1,UNLOAD=2,RADIUS=.34;
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
SHOPS.home={name:'Maison & Co',icon:'🪑',stock:[
  {id:'wallKit',name:'Module de cloison',icon:'🧱',price:140,desc:'Aménager la base'},
  {id:'chest',name:'Coffre simple',icon:'📦',price:150,desc:'Rangement maison'},
  {id:'safe',name:'Coffre sécurisé',icon:'🗄️',price:240,desc:'Déposer tes crédits'},
  {id:'sofa',name:'Canapé',icon:'🛋️',price:130,desc:'Meuble de salon'},
  {id:'table',name:'Table',icon:'🪵',price:90,desc:'Mobilier'},
  {id:'lamp',name:'Lampe',icon:'💡',price:55,desc:'Décoration'},
  {id:'plant',name:'Plante',icon:'🪴',price:45,desc:'Décoration verte'},
  {id:'wardrobe',name:'Armoire',icon:'🧰',price:175,desc:'Grand rangement'}
]};
const HOME_ITEMS={
 wallKit:{id:'wallKit',name:'Cloison',icon:'🧱'},
 chest:{id:'chest',name:'Coffre simple',icon:'📦'},
 safe:{id:'safe',name:'Coffre sécurisé',icon:'🗄️'},
 sofa:{id:'sofa',name:'Canapé',icon:'🛋️'},
 table:{id:'table',name:'Table',icon:'🪵'},
 lamp:{id:'lamp',name:'Lampe',icon:'💡'},
 plant:{id:'plant',name:'Plante',icon:'🪴'},
 wardrobe:{id:'wardrobe',name:'Armoire',icon:'🧰'}
};
const HOME_SLOTS=[
 {x:-5.5,z:-4.2},{x:-2.1,z:-4.0},{x:1.3,z:-4.0},{x:4.8,z:-4.0},
 {x:-5.2,z:-.6},{x:-1.8,z:-.8},{x:1.7,z:-.8},{x:5.0,z:-.8},
 {x:-5.0,z:2.8},{x:-1.6,z:2.7},{x:1.8,z:2.8},{x:5.1,z:2.7},
 {x:-5.2,z:5.4},{x:-1.6,z:5.4},{x:1.8,z:5.4},{x:5.2,z:5.4}
];
const HOME_PLOT_PRICE=850;
const HOME_UPGRADE_COST={2:650,3:1450};
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
 activeNpcMission:null,timeOfDay:9.5,weather:'clear',interior:null,returnPos:null,policeCaught:0,
 landOwned:false,homeLevel:1,homeBank:0,homeStorage:{medkit:0},homeStock:[],homePlaced:[],reputation:0,restCount:0,artifactBag:[]
};
let state=loadState();
function loadState(){try{const raw=JSON.parse(localStorage.getItem('sq3d-v9')||'{}');return {...structuredClone(base),...raw,pos:{...base.pos,...(raw.pos||{})},homeStorage:{...base.homeStorage,...(raw.homeStorage||{})},homeStock:raw.homeStock||[],homePlaced:raw.homePlaced||[]}}catch{return structuredClone(base)}}
function save(){localStorage.setItem('sq3d-v9',JSON.stringify(state))}
function city(){return CITIES.find(c=>c.id===state.cityId)||CITIES[0]}
function weapon(){return WEAPONS[state.equipped]||WEAPONS.fists}
function invCount(){return state.inventory.reduce((a,x)=>a+x.qty,0)}
function addStack(list,id,qty=1){const x=list.find(i=>i.id===id);x?x.qty+=qty:list.push({id,qty})}
function removeStack(list,id,qty=1){const x=list.find(i=>i.id===id);if(!x||x.qty<qty)return false;x.qty-=qty;if(x.qty<=0)list.splice(list.indexOf(x),1);return true}
function stackCount(list,id){return (list.find(i=>i.id===id)||{qty:0}).qty}
function addInv(id,qty=1){addStack(state.inventory,id,qty)}
function addHomeItem(id,qty=1){addStack(state.homeStock,id,qty)}
function homeQty(id){return stackCount(state.homeStock,id)}
function hasPlaced(id){return state.homePlaced.includes(id)}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rngFor(s){let a=hashStr(s);return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function ck(cx,cz){return `${state.cityId}:${cx}:${cz}`}
function currentChunk(){return{cx:Math.floor(state.pos.x/CHUNK),cz:Math.floor(state.pos.z/CHUNK)}}
function districtFor(cx,cz){const idx=Math.abs((cx*7+cz*11)%DISTRICTS.length);return DISTRICTS[idx]}
function districtId(cx,cz){return `${state.cityId}:${cx}:${cz}`}
function progress(goal){if(goal==='stolenCoins')return state.stolenCoins;if(goal==='coinsEarned')return state.coinsEarned;if(goal==='npcMissions')return state.npcMissions;if(goal==='districtsSeen')return state.seenDistricts.length;if(goal==='containersOpened')return state.containersOpened;if(goal==='districtsOwned')return state.ownedDistricts.length;return 0}
function activeQuest(){return QUESTS.find(q=>!state.completedQuests.includes(q.id))||{id:'free',title:'Légende urbaine',text:'Explore librement, collectionne les artefacts et sécurise les quartiers.',goal:'districtsOwned',target:999}}
function checkQuests(){for(const q of QUESTS){if(state.completedQuests.includes(q.id))continue;if(progress(q.goal)>=q.target){state.completedQuests.push(q.id);state.coins+=q.reward;toast(`Quête terminée : ${q.title} +${q.reward} crédits`)}}}

let scene,camera,renderer,clock,textures={},chunks=new Map(),colliders=[],pickups=[],shops=[],apartments=[],containers=[],npcs=[],enemies=[],police=[],cars=[],hidingZones=[],homePlots=[],trafficLights=[],alleys=[],clouds=[];
let activeEnemy=null,activeEnemyEntity=null,moveStick={x:0,y:0},lookStick={x:0,y:0},weaponRig=null,interiorGroup=null,lastChunkTick=0,lastMapTick=0,lastWeatherTick=0,selectedNPC=null,targetMarker=null,tailTheft=null,policeSeeing=false,hiddenTimer=0,lastCarHit=0,rainSystem=null,raycaster=null,tapStart=null,currentInteractFn=null,lastViewportHeight=window.innerHeight,keys={};

async function init(){
 try{THREE=await import(THREE_URL)}catch{return toast('Connexion requise au premier lancement du moteur 3D')}
 const host=$('#threeHost');scene=new THREE.Scene();scene.background=new THREE.Color(0x8facbd);scene.fog=new THREE.Fog(0x8facbd,70,220);
 camera=new THREE.PerspectiveCamera(72,host.clientWidth/host.clientHeight,.06,260);
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(host.clientWidth,host.clientHeight);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 host.appendChild(renderer.domElement);clock=new THREE.Clock();raycaster=new THREE.Raycaster();
 scene.add(new THREE.HemisphereLight(0xd8eeff,0x334030,2.15));
 const sun=new THREE.DirectionalLight(0xffefd0,2.0);sun.name='sun';sun.position.set(45,75,28);scene.add(sun);
 const fill=new THREE.DirectionalLight(0x8dc8ff,.32);fill.position.set(-35,30,-25);scene.add(fill);
 textures=createTextures();weaponRig=createWeaponRig();camera.add(weaponRig);scene.add(camera);
 createAtmosphere();setupWorldTap();setupDesktopControls();setupMapUI();
 ensureChunks(true);updateHUD();animate();
 addEventListener('resize',()=>{camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)});
 if(window.visualViewport){
   const syncViewport=()=>{const h=Math.round(window.visualViewport.height);if(Math.abs(h-lastViewportHeight)>12){lastViewportHeight=h;camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);lookStick.x=0;lookStick.y=0}}
   visualViewport.addEventListener('resize',syncViewport);visualViewport.addEventListener('scroll',syncViewport)
 }
 addEventListener('blur',()=>{moveStick.x=moveStick.y=lookStick.x=lookStick.y=0});
}
function tex(draw,rx=4,ry=4){const c=document.createElement('canvas');c.width=c.height=256;const q=c.getContext('2d');draw(q,256,256);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}
function createTextures(){
 const asphalt=tex(q=>{q.fillStyle='#2c3236';q.fillRect(0,0,256,256);for(let i=0;i<2300;i++){const g=30+Math.random()*45;q.fillStyle=`rgba(${g},${g},${g},${.18+Math.random()*.3})`;q.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*2,1+Math.random()*2)}for(let i=0;i<18;i++){q.strokeStyle='#15191c55';q.beginPath();q.moveTo(Math.random()*256,Math.random()*256);q.lineTo(Math.random()*256,Math.random()*256);q.stroke()}},5,5);
 const pave=tex(q=>{q.fillStyle='#aaa69c';q.fillRect(0,0,256,256);q.strokeStyle='#757168';q.lineWidth=2;for(let y=0;y<=256;y+=32){q.beginPath();q.moveTo(0,y);q.lineTo(256,y);q.stroke()}for(let x=0;x<=256;x+=32){q.beginPath();q.moveTo(x,0);q.lineTo(x,256);q.stroke()}for(let i=0;i<220;i++){q.fillStyle='#ffffff10';q.fillRect(Math.random()*256,Math.random()*256,2,2)}},6,6);
 const grass=tex(q=>{q.fillStyle='#3e6847';q.fillRect(0,0,256,256);for(let i=0;i<2500;i++){q.fillStyle=Math.random()>.5?'#57835c':'#2d5739';q.fillRect(Math.random()*256,Math.random()*256,1,2+Math.random()*3)}},7,7);
 const brick=tex(q=>{q.fillStyle='#77584f';q.fillRect(0,0,256,256);q.strokeStyle='#4e3934';for(let y=0;y<256;y+=20){q.beginPath();q.moveTo(0,y);q.lineTo(256,y);q.stroke();for(let x=(y/20)%2?15:0;x<256;x+=30){q.beginPath();q.moveTo(x,y);q.lineTo(x,y+20);q.stroke()}}for(let y=8;y<250;y+=42)for(let x=8;x<248;x+=38){const on=Math.random()>.42;q.fillStyle=on?'#e7c67a':'#6fa0b9';q.fillRect(x,y,16,19);q.fillStyle='#1d2a31';q.fillRect(x+2,y+2,12,2)}},3,4);
 const modern=tex(q=>{const gr=q.createLinearGradient(0,0,256,0);gr.addColorStop(0,'#526879');gr.addColorStop(.5,'#718594');gr.addColorStop(1,'#4b6172');q.fillStyle=gr;q.fillRect(0,0,256,256);for(let y=7;y<250;y+=31)for(let x=7;x<250;x+=27){q.fillStyle=Math.random()>.3?'#9cc5dc':'#253746';q.fillRect(x,y,17,19);q.fillStyle='#d7f0ff44';q.fillRect(x+2,y+2,12,3)}},3,4);
 const stone=tex(q=>{q.fillStyle='#b1aa9d';q.fillRect(0,0,256,256);for(let y=0;y<256;y+=26){q.strokeStyle='#817b70';q.beginPath();q.moveTo(0,y);q.lineTo(256,y);q.stroke()}for(let x=0;x<256;x+=52){q.beginPath();q.moveTo(x,0);q.lineTo(x,256);q.stroke()}},3,4);
 return{asphalt,pave,grass,brick,modern,stone}
}
function createWeaponRig(){
 const g=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color:0x38424d,metalness:.6,roughness:.35});
 const body=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,.72),mat);body.position.set(.31,-.26,-.72);body.rotation.x=-.08;g.add(body);
 const grip=new THREE.Mesh(new THREE.BoxGeometry(.12,.32,.13),new THREE.MeshStandardMaterial({color:0x171b20}));grip.position.set(.31,-.39,-.53);grip.rotation.x=-.3;g.add(grip);g.visible=state.equipped!=='fists';return g
}

function createAtmosphere(){
 // lightweight clouds
 for(let i=0;i<9;i++){
   const gr=new THREE.Group();
   const mat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.18,depthWrite:false});
   for(let j=0;j<4;j++){const s=new THREE.Mesh(new THREE.SphereGeometry(4+Math.random()*3,8,6),mat);s.scale.y=.45;s.position.set((j-1.5)*4+Math.random()*2,Math.random()*1.2,Math.random()*2);gr.add(s)}
   gr.position.set((Math.random()-.5)*160,32+Math.random()*13,(Math.random()-.5)*160);scene.add(gr);clouds.push(gr)
 }
 // rain points are shown only during rain
 const count=420,pos=new Float32Array(count*3);
 for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*50;pos[i*3+1]=Math.random()*25;pos[i*3+2]=(Math.random()-.5)*50}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
 rainSystem=new THREE.Points(geo,new THREE.PointsMaterial({color:0xc8e8ff,size:.065,transparent:true,opacity:.55}));
 rainSystem.visible=false;scene.add(rainSystem)
}
function updateAtmosphere(dt){
 for(const c of clouds){c.position.x+=dt*.55;if(c.position.x-state.pos.x>100)c.position.x-=200;c.position.z+=(state.weather==='cloudy'?.04:.015)}
 if(rainSystem){
   rainSystem.visible=state.weather==='rain'&&!state.interior;
   rainSystem.position.set(state.pos.x,0,state.pos.z);
   if(rainSystem.visible){const a=rainSystem.geometry.attributes.position.array;for(let i=0;i<a.length;i+=3){a[i+1]-=dt*18;if(a[i+1]<0)a[i+1]=25}rainSystem.geometry.attributes.position.needsUpdate=true}
 }
}

function makeRoad(g,x0,z0){
 const roadM=new THREE.MeshStandardMaterial({map:textures.asphalt,roughness:state.weather==='rain'?.58:.95,metalness:state.weather==='rain'?.14:0});
 const paveM=new THREE.MeshStandardMaterial({map:textures.pave,roughness:.98});
 const roadW=11,walk=3;

 let a=new THREE.Mesh(new THREE.PlaneGeometry(roadW,CHUNK),roadM);a.rotation.x=-Math.PI/2;a.position.set(x0+roadW/2,.01,z0+CHUNK/2);g.add(a);
 a=new THREE.Mesh(new THREE.PlaneGeometry(CHUNK,roadW),roadM);a.rotation.x=-Math.PI/2;a.position.set(x0+CHUNK/2,.012,z0+roadW/2);g.add(a);

 const sidewalks=[
   [x0+roadW+walk/2,z0+(CHUNK+roadW)/2,walk,CHUNK-roadW],
   [x0+CHUNK-walk/2,z0+(CHUNK+roadW)/2,walk,CHUNK-roadW],
   [x0+(CHUNK+roadW)/2,z0+roadW+walk/2,CHUNK-roadW,walk],
   [x0+(CHUNK+roadW)/2,z0+CHUNK-walk/2,CHUNK-roadW,walk]
 ];
 for(const s of sidewalks){const m=new THREE.Mesh(new THREE.PlaneGeometry(s[2],s[3]),paveM);m.rotation.x=-Math.PI/2;m.position.set(s[0],.052,s[1]);g.add(m)}

 const curbM=new THREE.MeshStandardMaterial({color:0xc7c4b8,roughness:1});
 const curbs=[
  [x0+roadW+.08,z0+(CHUNK+roadW)/2,.18,CHUNK-roadW],
  [x0+CHUNK-.08,z0+(CHUNK+roadW)/2,.18,CHUNK-roadW],
  [x0+(CHUNK+roadW)/2,z0+roadW+.08,CHUNK-roadW,.18],
  [x0+(CHUNK+roadW)/2,z0+CHUNK-.08,CHUNK-roadW,.18]
 ];
 for(const c of curbs){const m=new THREE.Mesh(new THREE.BoxGeometry(c[2],.16,c[3]),curbM);m.position.set(c[0],.08,c[1]);g.add(m)}

 const white=new THREE.MeshBasicMaterial({color:0xf4efda});
 for(let i=0;i<6;i++){
   let m=new THREE.Mesh(new THREE.PlaneGeometry(.16,4.2),white);m.rotation.x=-Math.PI/2;m.position.set(x0+roadW/2,.028,z0+20+i*8.5);g.add(m);
   m=new THREE.Mesh(new THREE.PlaneGeometry(4.2,.16),white);m.rotation.x=-Math.PI/2;m.position.set(x0+20+i*8.5,.029,z0+roadW/2);g.add(m)
 }

 const zebra=new THREE.MeshBasicMaterial({color:0xffffff});
 for(let k=0;k<8;k++){
   let s=new THREE.Mesh(new THREE.PlaneGeometry(roadW-.75,.56),zebra);s.rotation.x=-Math.PI/2;s.position.set(x0+roadW/2,.038,z0+12.75+k*.83);g.add(s);
   let t=new THREE.Mesh(new THREE.PlaneGeometry(.56,roadW-.75),zebra);t.rotation.x=-Math.PI/2;t.position.set(x0+12.75+k*.83,.039,z0+roadW/2);g.add(t)
 }
 let stop=new THREE.Mesh(new THREE.PlaneGeometry(roadW-.6,.28),white);stop.rotation.x=-Math.PI/2;stop.position.set(x0+roadW/2,.041,z0+11.75);g.add(stop);
 stop=new THREE.Mesh(new THREE.PlaneGeometry(.28,roadW-.6),white);stop.rotation.x=-Math.PI/2;stop.position.set(x0+11.75,.042,z0+roadW/2);g.add(stop);

 for(const [lx,lz] of [[15,21],[15,53],[42,15],[61,15],[69,38],[38,69]])addLamp(g,x0+lx,z0+lz);
 addBench(g,x0+18,z0+20);

 // V9 : 4 feux distincts par intersection, un sur chacun des 4 coins.
 // Les deux feux "vertical" commandent les deux sens de l'axe vertical.
 // Les deux feux "horizontal" commandent les deux sens de l'axe horizontal.
 addTrafficLight(g,x0+12.55,z0+12.55,'vertical',Math.PI);
 addTrafficLight(g,x0-1.55,z0-1.55,'vertical',0);
 addTrafficLight(g,x0-1.55,z0+12.55,'horizontal',-Math.PI/2);
 addTrafficLight(g,x0+12.55,z0-1.55,'horizontal',Math.PI/2)
}
function addTrafficLight(g,x,z,axis,rot=0){
 const group=new THREE.Group(),metal=new THREE.MeshStandardMaterial({color:0x252d32,metalness:.58,roughness:.48});
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.065,.085,2.9,8),metal);pole.position.y=1.45;group.add(pole);
 const arm=new THREE.Mesh(new THREE.BoxGeometry(.86,.075,.075),metal);arm.position.set(.37,2.86,0);group.add(arm);
 const box=new THREE.Mesh(new THREE.BoxGeometry(.40,.98,.36),new THREE.MeshStandardMaterial({color:0x11171a,roughness:.65}));box.position.set(.73,2.56,0);group.add(box);
 const shade1=new THREE.Mesh(new THREE.BoxGeometry(.31,.12,.18),metal);shade1.position.set(.73,2.84,.19);group.add(shade1);
 const shade2=shade1.clone();shade2.position.y=2.31;group.add(shade2);
 const red=new THREE.Mesh(new THREE.SphereGeometry(.095,10,8),new THREE.MeshBasicMaterial({color:0x52151b}));red.position.set(.73,2.82,.20);group.add(red);
 const green=new THREE.Mesh(new THREE.SphereGeometry(.095,10,8),new THREE.MeshBasicMaterial({color:0x16462b}));green.position.set(.73,2.30,.20);group.add(green);
 group.position.set(x,0,z);group.rotation.y=rot;g.add(group);trafficLights.push({group,red,green,axis})
}
function createChunk(cx,cz){
 const key=ck(cx,cz);if(chunks.has(key))return;const r=rngFor(key),g=new THREE.Group();g.userData={key,cx,cz};scene.add(g);chunks.set(key,g);
 const x0=cx*CHUNK,z0=cz*CHUNK,d=districtFor(cx,cz),grass=new THREE.Mesh(new THREE.PlaneGeometry(CHUNK,CHUNK),new THREE.MeshStandardMaterial({map:textures.grass,roughness:1}));
 grass.rotation.x=-Math.PI/2;grass.position.set(x0+CHUNK/2,-.04,z0+CHUNK/2);g.add(grass);makeRoad(g,x0,z0);
 addAlleyNetwork(g,key,x0,z0,d,r);
 const id=districtId(cx,cz);if(!state.seenDistricts.includes(id))state.seenDistricts.push(id);

 const startChunk=cx===0&&cz===0;
 // Lots kept away from both major sidewalks and the central alley cross.
 const lots=[
  [21.5,21.5],[31.5,21.5],[53.5,21.5],[63.5,21.5],
  [21.5,31.5],[63.5,31.5],
  [21.5,53.5],[63.5,53.5],
  [21.5,63.0],[31.5,63.0],[53.5,63.0],[63.5,63.0]
 ];
 let made=0;
 lots.forEach((p,i)=>{
   if(startChunk&&i===0){addShop(g,key,x0+p[0],z0+p[1],r,'corner');made++;return}
   if(startChunk&&i===2){addShop(g,key,x0+p[0],z0+p[1],r,'home');made++;return}
   if(startChunk&&i===8){addHomePlot(g,key,x0+p[0],z0+p[1]);made++;return}
   if(d.style==='green'&&r()<.11){addPocketGarden(g,key,x0+p[0],z0+p[1],r);return}
   if(r()<.08&&made>5)return;
   addDenseBuilding(g,key,x0+p[0],z0+p[1],d,r,i);
   made++
 });

 const trees=3+Math.floor(r()*(d.style==='green'?7:3));for(let i=0;i<trees;i++){const p=randomGreenPoint(x0,z0,r);addTree(g,p.x,p.z,r)}
 for(let i=0;i<(d.style==='green'?5:2);i++){const p=randomGreenPoint(x0,z0,r);addBush(g,key,p.x,p.z,r)}

 const cont=1+Math.floor(r()*3);for(let i=0;i<cont;i++){const p=r()<.35?randomAlleyPoint(x0,z0,r):randomSidewalk(x0,z0,r),type=r()<.72?'bin':'chest',idc=`${key}:container:${i}`;if(!state.collected.includes(idc))addContainer(g,key,idc,p.x,p.z,type)}
 const lootN=1+Math.floor(r()*3);for(let i=0;i<lootN;i++){const p=r()<.32?randomAlleyPoint(x0,z0,r):randomSidewalk(x0,z0,r),type=r()<.67?'medkit':'rare',idl=`${key}:loot:${i}`;if(!state.collected.includes(idl))addPickup(g,key,idl,p.x,p.z,type)}
 if(!state.artifacts.includes(state.cityId)&&((Math.abs(cx)+Math.abs(cz)>1&&r()<.055)||(cx===3&&cz===-2))){const p=randomAlleyPoint(x0,z0,r),idl=`${key}:artifact`;if(!state.collected.includes(idl))addPickup(g,key,idl,p.x,p.z,'artifact')}

 const npcN=5+Math.floor(r()*4);
 for(let i=0;i<npcN;i++){const p=randomPedestrianPath(x0,z0,r);addNPC(g,key,p.x,p.z,r,p)}
 if(r()<.05){const p=randomPedestrianPath(x0,z0,r);addEnemy(g,key,p.x,p.z,r,p)}
 if(r()<.12){const p=randomPedestrianPath(x0,z0,r);addPolice(g,key,p.x,p.z,r,p)}

 const carN=2+Math.floor(r()*2);for(let i=0;i<carN;i++)addCar(g,key,x0,z0,r,i);
 if(r()<.55)addParkedCar(g,key,x0,z0,r)
}
function randomSidewalk(x0,z0,r){
 const side=Math.floor(r()*4);
 if(side===0)return{x:x0+12.5,z:z0+18+r()*(CHUNK-24),axis:'z',min:z0+17,max:z0+CHUNK-5};
 if(side===1)return{x:x0+CHUNK-1.5,z:z0+18+r()*(CHUNK-24),axis:'z',min:z0+17,max:z0+CHUNK-5};
 if(side===2)return{x:x0+18+r()*(CHUNK-24),z:z0+12.5,axis:'x',min:x0+17,max:x0+CHUNK-5};
 return{x:x0+18+r()*(CHUNK-24),z:z0+CHUNK-1.5,axis:'x',min:x0+17,max:x0+CHUNK-5}
}
function randomAlleyPoint(x0,z0,r){
 if(r()<.5)return{x:x0+43,z:z0+18+r()*48};
 return{x:x0+18+r()*48,z:z0+43}
}
function randomPedestrianPath(x0,z0,r){
 // 75% boulevard loop, 25% ruelle loop. Waypoints create real turns without teleporting.
 if(r()<.75){
   const route=[
    {x:x0+12.5,z:z0+18},{x:x0+12.5,z:z0+67},
    {x:x0+67,z:z0+70.5},{x:x0+70.5,z:z0+67},
    {x:x0+70.5,z:z0+18},{x:x0+67,z:z0+12.5},
    {x:x0+18,z:z0+12.5},{x:x0+12.5,z:z0+18}
   ];
   const idx=Math.floor(r()*(route.length-1)),p=route[idx];
   return{x:p.x,z:p.z,route,routeIndex:(idx+1)%route.length}
 }
 const route=[
   {x:x0+43,z:z0+17},{x:x0+43,z:z0+43},{x:x0+66,z:z0+43},
   {x:x0+66,z:z0+66},{x:x0+43,z:z0+66},{x:x0+43,z:z0+43},
   {x:x0+20,z:z0+43},{x:x0+20,z:z0+20},{x:x0+43,z:z0+20}
 ];
 const idx=Math.floor(r()*route.length),p=route[idx];
 return{x:p.x,z:p.z,route,routeIndex:(idx+1)%route.length}
}
function randomGreenPoint(x0,z0,r){return{x:x0+22+r()*(CHUNK-31),z:z0+22+r()*(CHUNK-31)}}

function addAlleyNetwork(g,key,x0,z0,d,r){
 const alleyM=new THREE.MeshStandardMaterial({map:textures.pave,roughness:1});
 const v=new THREE.Mesh(new THREE.PlaneGeometry(3.8,51),alleyM);v.rotation.x=-Math.PI/2;v.position.set(x0+43,.055,z0+43);g.add(v);
 const h=new THREE.Mesh(new THREE.PlaneGeometry(51,3.8),alleyM);h.rotation.x=-Math.PI/2;h.position.set(x0+43,.056,z0+43);g.add(h);
 // Small darker service lane branches.
 if(r()<.7){
   const branch=new THREE.Mesh(new THREE.PlaneGeometry(18,2.5),new THREE.MeshStandardMaterial({color:0x77766f,roughness:1}));
   branch.rotation.x=-Math.PI/2;branch.position.set(x0+52,.057,z0+32);g.add(branch)
 }
 alleys.push({key,x:x0+43,z:z0+43})
}
function addDenseBuilding(g,key,x,z,d,r,i){
 const central=d.style==='central',green=d.style==='green',old=d.style==='old';
 const isHouse=green||old ? r()<.58 : r()<.16;
 const w=isHouse?7.2+r()*1.8:7.8+r()*1.8,dep=isHouse?7.0+r()*1.8:7.8+r()*1.8;
 const h=isHouse?(4.2+r()*3.0):(central?14+r()*25:9+r()*15);
 const texChoice=old?textures.brick:(d.style==='harbor'?textures.stone:(r()<.6?textures.modern:textures.brick));
 const mat=new THREE.MeshStandardMaterial({map:texChoice,roughness:.87,metalness:d.style==='harbor'?.04:0});
 const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,dep),mat);b.position.set(x,h/2,z);g.add(b);
 addBuildingDetails(g,x,z,w,dep,h,r,d);
 if(isHouse){
   const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,dep)*.68,1.5,4),new THREE.MeshStandardMaterial({color:choice([0x58483f,0x4a5056,0x6a493c]),roughness:.96}));
   roof.rotation.y=Math.PI/4;roof.position.set(x,h+.72,z);g.add(roof);
   const door=new THREE.Mesh(new THREE.PlaneGeometry(.9,1.8),new THREE.MeshStandardMaterial({color:0x4b3427,roughness:.85}));
   door.position.set(x,1.0,z-dep/2-.014);door.rotation.y=Math.PI;g.add(door)
 }
 colliders.push({key,minX:x-w/2-.28,maxX:x+w/2+.28,minZ:z-dep/2-.28,maxZ:z+dep/2+.28,type:isHouse?'house':'building'});
 if(!isHouse&&i%5===0&&r()<.4)addApartmentDoor(g,key,x,z,dep)
}
function addPocketGarden(g,key,x,z,r){
 const p=new THREE.Mesh(new THREE.PlaneGeometry(8,8),new THREE.MeshStandardMaterial({map:textures.grass,roughness:1}));p.rotation.x=-Math.PI/2;p.position.set(x,.06,z);g.add(p);
 addTree(g,x-1.7,z-1.6,r);addBush(g,key,x+1.4,z+1.3,r);addBench(g,x-1.3,z+1.8)
}

function addPark(g,x,z,r,key){
 const m=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshStandardMaterial({map:textures.grass,roughness:1}));m.rotation.x=-Math.PI/2;m.position.set(x,.026,z);g.add(m);
 for(let i=0;i<4;i++)addTree(g,x+(r()-.5)*15,z+(r()-.5)*15,r);
 for(let i=0;i<3;i++)addBush(g,key,x+(r()-.5)*13,z+(r()-.5)*13,r);
 addBench(g,x-4,z+4);addBench(g,x+4,z-4)
}
function addTree(g,x,z,r){
 const tree=new THREE.Group(),trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.25,2.5,8),new THREE.MeshStandardMaterial({color:0x654632,roughness:1}));trunk.position.y=1.25;tree.add(trunk);
 const crownMat=new THREE.MeshStandardMaterial({color:choice([0x3c7b49,0x4d8e58,0x346a41]),roughness:.92});
 for(let i=0;i<3;i++){const crown=new THREE.Mesh(new THREE.SphereGeometry(.85+r()*.45,9,7),crownMat);crown.position.set((i-1)*.55,2.7+Math.random()*.35,(i%2-.5)*.35);tree.add(crown)}
 tree.position.set(x,0,z);g.add(tree)
}
function addBush(g,key,x,z,r){
 const bush=new THREE.Group(),mat=new THREE.MeshStandardMaterial({color:choice([0x326b42,0x3f7e4c,0x4a8954]),roughness:1});
 for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.55+r()*.22,8,6),mat);m.scale.y=.7;m.position.set((i-1)*.45,.48,(i%2)*.25);bush.add(m)}
 bush.position.set(x,0,z);g.add(bush);hidingZones.push({key,x,z,radius:1.25})
}
function addLamp(g,x,z){
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.055,.08,3.25,7),new THREE.MeshStandardMaterial({color:0x303943,metalness:.5,roughness:.5}));pole.position.set(x,1.63,z);g.add(pole);
 const glow=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),new THREE.MeshBasicMaterial({color:0xffe8a0}));glow.position.set(x,3.18,z);g.add(glow)
}
function addBench(g,x,z){
 const mat=new THREE.MeshStandardMaterial({color:0x604a36,roughness:.9}),metal=new THREE.MeshStandardMaterial({color:0x292f33,metalness:.5});
 const seat=new THREE.Mesh(new THREE.BoxGeometry(1.7,.12,.5),mat);seat.position.set(x,.55,z);g.add(seat);
 const back=new THREE.Mesh(new THREE.BoxGeometry(1.7,.55,.1),mat);back.position.set(x,.86,z+.22);g.add(back);
 for(const dx of [-.65,.65]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.09,.55,.09),metal);leg.position.set(x+dx,.28,z);g.add(leg)}
}
function addBuildingDetails(g,x,z,w,d,h,r,dist){
 const roof=new THREE.Mesh(new THREE.BoxGeometry(w*.34,.8,d*.3),new THREE.MeshStandardMaterial({color:0x4d5357,roughness:.85}));roof.position.set(x,h+.4,z);g.add(roof);
 const cornice=new THREE.Mesh(new THREE.BoxGeometry(w+.18,.22,d+.18),new THREE.MeshStandardMaterial({color:0x77736d,roughness:.9}));cornice.position.set(x,h-.1,z);g.add(cornice);
 if(dist.style==='old'&&h>12){for(let fy=4;fy<h-2;fy+=5){const balcony=new THREE.Mesh(new THREE.BoxGeometry(w*.38,.12,.85),new THREE.MeshStandardMaterial({color:0x4b5052,metalness:.25}));balcony.position.set(x,fy,z-d/2-.43);g.add(balcony)}}
}
function addParkedCar(g,key,x0,z0,r){
 const group=createCarVisual(choice([0x2d506d,0x7c4242,0x4b4f55,0x657954]));group.scale.set(.9,.9,.9);group.position.set(x0+18+r()*32,0,z0+15.4);group.rotation.y=-Math.PI/2;g.add(group)
}
function addHomePlot(g,key,x,z){
 const plot=new THREE.Group();
 const grass=new THREE.Mesh(new THREE.PlaneGeometry(16,14),new THREE.MeshStandardMaterial({color:0x4e744a,roughness:1}));grass.rotation.x=-Math.PI/2;grass.position.set(0,.03,0);plot.add(grass);
 const path=new THREE.Mesh(new THREE.PlaneGeometry(2.3,5),new THREE.MeshStandardMaterial({color:0xc8bea7,roughness:1}));path.rotation.x=-Math.PI/2;path.position.set(0,.04,-4.5);plot.add(path);
 const fenceM=new THREE.MeshStandardMaterial({color:0x8a6547,roughness:.95});
 [[0,.55,-7,16,.28],[0,.55,7,16,.28],[-8,.55,0,.28,14],[8,.55,0,.28,14]].forEach(f=>{const m=new THREE.Mesh(new THREE.BoxGeometry(f[3],1.1,f[4]),fenceM);m.position.set(f[0],f[1],f[2]);plot.add(m)});
 const sign=makeSign(state.landOwned?`🏠 CHEZ TOI N.${state.homeLevel}`:`🏡 TERRAIN ${HOME_PLOT_PRICE}`,'#9ef1ff');sign.position.set(0,3.3,-6.25);plot.add(sign);
 if(state.landOwned){
   const lv=state.homeLevel||1,w=lv===1?5:lv===2?7:9,d=lv===1?5:lv===2?6.5:8,h=lv===1?3.2:lv===2?4.2:5.0;
   const house=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({map:lv===1?textures.stone:textures.brick,roughness:.92}));house.position.set(0,h/2,.2);plot.add(house);
   const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.72,1.25,4),new THREE.MeshStandardMaterial({color:0x4a4f53,roughness:.9}));roof.rotation.y=Math.PI/4;roof.position.set(0,h+.62,.2);plot.add(roof);
   const door=new THREE.Mesh(new THREE.PlaneGeometry(1.15,2.05),new THREE.MeshStandardMaterial({color:0x513a29}));door.position.set(0,1.05,-d/2-.012);door.rotation.y=Math.PI;plot.add(door);
   if(lv>=2){for(const sx of [-2,2]){const win=new THREE.Mesh(new THREE.PlaneGeometry(1.15,.9),new THREE.MeshStandardMaterial({color:0x8fc8df,metalness:.2,roughness:.2}));win.position.set(sx,2.2,-d/2-.018);win.rotation.y=Math.PI;plot.add(win)}}
 }
 plot.position.set(x,0,z);g.add(plot);homePlots.push({key,x,z,price:HOME_PLOT_PRICE})
}
function makeSign(text,color='#ffdb77'){const c=document.createElement('canvas');c.width=512;c.height=128;const q=c.getContext('2d');q.fillStyle='#10222a';q.fillRect(0,0,512,128);q.fillStyle=color;q.font='bold 44px system-ui';q.textAlign='center';q.textBaseline='middle';q.fillText(text,256,64);const t=new THREE.CanvasTexture(c),s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true}));s.scale.set(5.2,1.3,1);return s}
function addShop(g,key,x,z,r,forcedType=null){
 const pool=Object.keys(SHOPS),type=forcedType||choice(pool),shop=SHOPS[type],group=new THREE.Group();
 const body=new THREE.Mesh(new THREE.BoxGeometry(10,5.4,9),new THREE.MeshStandardMaterial({color:type==='corner'?0x456e58:type==='gear'?0x56636e:0x685072,roughness:.72}));body.position.y=2.7;group.add(body);
 const frame=new THREE.Mesh(new THREE.BoxGeometry(5.2,3.1,.18),new THREE.MeshStandardMaterial({color:0x202c34,metalness:.3}));frame.position.set(0,1.75,-4.56);group.add(frame);
 const glass=new THREE.Mesh(new THREE.PlaneGeometry(4.5,2.6),new THREE.MeshStandardMaterial({color:0x8ed5ee,transparent:true,opacity:.44,metalness:.25,roughness:.18}));glass.position.set(0,1.75,-4.66);glass.rotation.y=Math.PI;group.add(glass);
 const awning=new THREE.Mesh(new THREE.BoxGeometry(6.2,.28,1.1),new THREE.MeshStandardMaterial({color:type==='corner'?0xe4bd55:type==='gear'?0xd46a53:0x9c77d2}));awning.position.set(0,3.35,-4.85);group.add(awning);
 const sign=makeSign(`${shop.icon} ${shop.name}`);sign.position.set(0,4.72,-4.72);group.add(sign);group.position.set(x,0,z);g.add(group);
 colliders.push({key,minX:x-5.2,maxX:x+5.2,minZ:z-4.7,maxZ:z+4.7,type:'shop'});
 shops.push({key,x,z,type,group,door:{x,z:z-5.05}})
}
function addApartmentDoor(g,key,x,z,dep){
 const door=new THREE.Mesh(new THREE.PlaneGeometry(1.6,2.6),new THREE.MeshStandardMaterial({color:0x49362b,roughness:.75}));door.position.set(x,1.4,z-dep/2-.012);door.rotation.y=Math.PI;g.add(door);
 const light=new THREE.Mesh(new THREE.SphereGeometry(.09,7,6),new THREE.MeshBasicMaterial({color:0xffe4a6}));light.position.set(x+1.1,2.35,z-dep/2-.08);g.add(light);
 apartments.push({key,x,z:z-dep/2-.85,id:`${key}:apt`})
}
function addContainer(g,key,id,x,z,type){const mesh=new THREE.Mesh(type==='bin'?new THREE.CylinderGeometry(.42,.48,.9,10):new THREE.BoxGeometry(.9,.55,.65),new THREE.MeshStandardMaterial({color:type==='bin'?0x335d45:0x74572e}));mesh.position.set(x,type==='bin'?.45:.28,z);mesh.userData={key,id,type};g.add(mesh);containers.push(mesh)}
function addPickup(g,key,id,x,z,type){const color={coins:0xffd15b,medkit:0x62e3a4,rare:0xa68cff,artifact:0x60d8ff}[type],geo=type==='artifact'?new THREE.OctahedronGeometry(.65):type==='coins'?new THREE.CylinderGeometry(.34,.34,.12,16):new THREE.BoxGeometry(.6,.6,.6),m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,emissive:type==='artifact'?0x15536a:0x000000,emissiveIntensity:1}));m.position.set(x,type==='artifact'?.72:.43,z);m.userData={key,id,type};g.add(m);pickups.push(m)}
function addNPC(g,key,x,z,r,path){const n=createPerson('civilian',key,x,z,r,path);g.add(n.group);npcs.push(n)}
function addEnemy(g,key,x,z,r,path){const n=createPerson('hostile',key,x,z,r,path);n.speed*=1.08;g.add(n.group);enemies.push(n)}
function addPolice(g,key,x,z,r,path){const n=createPerson('police',key,x,z,r,path);n.speed=.72+r()*.28;g.add(n.group);police.push(n)}
function createPerson(role,key,x,z,r,path=null){
 const hostile=role==='hostile',isPolice=role==='police',group=new THREE.Group();
 const cloth=new THREE.MeshStandardMaterial({color:isPolice?0x1f4f83:(hostile?0x6d2434:choice([0x315f7b,0x486d45,0x6a4e75,0x785f42,0xa05d43])),roughness:.82});
 const skinColor=choice([0xd5a47c,0xc38e68,0xe0b18d,0xb97d5c]),skin=new THREE.MeshStandardMaterial({color:skinColor,roughness:.92});
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.27,.72,5,8),cloth);body.position.y=1.05;group.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.24,14,12),skin);head.position.y=1.72;group.add(head);

 const hair=new THREE.Mesh(new THREE.SphereGeometry(.247,11,9),new THREE.MeshStandardMaterial({color:choice([0x31251f,0x5a4131,0x22262b,0x8d6a41]),roughness:.95}));
 hair.scale.y=.54;hair.position.set(0,1.865,.01);group.add(hair);

 // V9: one face plane slightly in front of the head => no z-fighting / blinking eyes.
 const fc=document.createElement('canvas');fc.width=96;fc.height=96;const f=fc.getContext('2d');
 f.clearRect(0,0,96,96);f.fillStyle='#14181c';f.beginPath();f.arc(31,39,5,0,Math.PI*2);f.arc(65,39,5,0,Math.PI*2);f.fill();
 f.strokeStyle=hostile?'#6b1e29':'#7e4047';f.lineWidth=5;f.lineCap='round';f.beginPath();f.moveTo(36,66);f.quadraticCurveTo(48,72,60,66);f.stroke();
 const ft=new THREE.CanvasTexture(fc);ft.colorSpace=THREE.SRGBColorSpace;
 const face=new THREE.Mesh(new THREE.PlaneGeometry(.235,.235),new THREE.MeshBasicMaterial({map:ft,transparent:true,depthWrite:false,alphaTest:.08}));
 face.position.set(0,1.71,-.242);face.renderOrder=5;group.add(face);

 if(isPolice){
   const cap=new THREE.Mesh(new THREE.CylinderGeometry(.29,.29,.09,10),new THREE.MeshStandardMaterial({color:0x153b63}));cap.position.y=1.96;group.add(cap);
   const badge=new THREE.Mesh(new THREE.BoxGeometry(.09,.12,.025),new THREE.MeshBasicMaterial({color:0xffd260}));badge.position.set(.12,1.25,-.27);group.add(badge)
 }

 // Arms now use the SAME skin material as the face/head.
 const a1=new THREE.Mesh(new THREE.BoxGeometry(.13,.58,.13),skin),a2=a1.clone();
 a1.position.set(-.34,1.06,0);a2.position.set(.34,1.06,0);group.add(a1,a2);
 // Small sleeves remain clothing-colored, but exposed arms are skin-colored.
 const sl1=new THREE.Mesh(new THREE.BoxGeometry(.17,.25,.17),cloth),sl2=sl1.clone();
 sl1.position.set(-.34,1.39,0);sl2.position.set(.34,1.39,0);group.add(sl1,sl2);

 const lm=new THREE.MeshStandardMaterial({color:0x222b34}),l1=new THREE.Mesh(new THREE.BoxGeometry(.15,.67,.17),lm),l2=l1.clone();
 l1.position.set(-.13,.38,0);l2.position.set(.13,.38,0);group.add(l1,l2);group.position.set(x,0,z);

 const hasCash=r()<.50;
 const n={
   key,group,role,hostile,isPolice,
   axis:path?.axis||(r()<.5?'x':'z'),pathMin:path?.min??null,pathMax:path?.max??null,
   route:path?.route||null,routeIndex:path?.routeIndex||0,
   speed:.55+r()*.55,dir:r()<.5?-1:1,home:{x,z},
   money:hasCash?(2+Math.floor(r()*34)):0,
   legs:[l1,l2],arms:[a1,a2],phase:r()*6.2,
   name:isPolice?choice(['Brigadier Morel','Agent Diaz','Agent Leroy']):(hostile?'Rôdeur hostile':choice(['Lina','Noah','Maya','Nino','Sara','Eliott','Inès','Adam','Jade','Milo'])),
   missionGiven:false,caught:false,pickpocketed:false,heading:0,alertness:75+r()*45,chasing:false,lastSeen:0,aggroTime:0,lastHit:0,calledPolice:false
 };
 group.traverse(o=>{o.userData.person=n;o.frustumCulled=false});
 return n
}
function createCarVisual(color){
 const group=new THREE.Group(),body=new THREE.Mesh(new THREE.BoxGeometry(1.75,.62,3.55),new THREE.MeshStandardMaterial({color,metalness:.35,roughness:.38}));body.position.y=.66;group.add(body);
 const top=new THREE.Mesh(new THREE.BoxGeometry(1.45,.58,1.8),new THREE.MeshStandardMaterial({color:0x7893a5,transparent:true,opacity:.72,metalness:.3,roughness:.15}));top.position.set(0,1.18,-.18);group.add(top);
 const bumperM=new THREE.MeshStandardMaterial({color:0x1b1f22,metalness:.5}),lampM=new THREE.MeshBasicMaterial({color:0xfff0bc});
 for(const x of [-.58,.58]){const lamp=new THREE.Mesh(new THREE.BoxGeometry(.28,.16,.05),lampM);lamp.position.set(x,.72,-1.79);group.add(lamp)}
 for(const x of [-.72,.72])for(const z of [-1.12,1.12]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.27,.27,.18,10),new THREE.MeshStandardMaterial({color:0x151719,roughness:1}));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.34,z);group.add(wheel)}
 return group
}
function addCar(g,key,x0,z0,r,i){
 const mode=r()<.5?'v':'h',dir=mode==='v'?(r()<.5?-1:1):(r()<.5?-1:1),group=createCarVisual(choice([0xc44b4b,0x4b6fc4,0x444b52,0xe0d3b4,0x4f9c68,0x9c7443]));
 if(mode==='v'){
   const laneX=dir>0?x0+3.2:x0+7.8;
   group.position.set(laneX,0,z0+18+i*18);
   group.rotation.y=dir>0?Math.PI:0;
 }else{
   const laneZ=dir>0?z0+7.8:z0+3.2;
   group.position.set(x0+18+i*17,0,laneZ);
   group.rotation.y=dir>0?-Math.PI/2:Math.PI/2;
 }
 g.add(group);
 cars.push({key,group,mode,dir,speed:4.1+r()*2.1,lastHit:0,turnCooldown:.6+Math.random(),turnSeed:Math.random()})
}

function unload(key){
 const g=chunks.get(key);if(!g)return;
 if(selectedNPC?.key===key)clearTarget();
 scene.remove(g);chunks.delete(key);
 colliders=colliders.filter(x=>x.key!==key);pickups=pickups.filter(x=>x.userData.key!==key);shops=shops.filter(x=>x.key!==key);apartments=apartments.filter(x=>x.key!==key);containers=containers.filter(x=>x.userData.key!==key);npcs=npcs.filter(x=>x.key!==key);enemies=enemies.filter(x=>x.key!==key);police=police.filter(x=>x.key!==key);cars=cars.filter(x=>x.key!==key);hidingZones=hidingZones.filter(x=>x.key!==key);homePlots=homePlots.filter(x=>x.key!==key);trafficLights=trafficLights.filter(x=>x.group.parent!==g);alleys=alleys.filter(x=>x.key!==key)
}
function ensureChunks(force=false){if(state.interior)return;const {cx,cz}=currentChunk();for(let x=cx-LOAD;x<=cx+LOAD;x++)for(let z=cz-LOAD;z<=cz+LOAD;z++)createChunk(x,z);for(const[k,g]of chunks){if(Math.abs(g.userData.cx-cx)>UNLOAD||Math.abs(g.userData.cz-cz)>UNLOAD)unload(k)}if(force)drawMap()}
function collides(x,z){if(state.interior)return Math.abs(x)>8.5||z<-8.5||z>8.5;return colliders.some(c=>x+RADIUS>c.minX&&x-RADIUS<c.maxX&&z+RADIUS>c.minZ&&z-RADIUS<c.maxZ)}
function entityBlocked(x,z,pad=.3){return colliders.some(c=>x+pad>c.minX&&x-pad<c.maxX&&z+pad>c.minZ&&z-pad<c.maxZ)}
function movePlayer(dx,dz){const nx=state.pos.x+dx,nz=state.pos.z+dz;if(!collides(nx,state.pos.z))state.pos.x=nx;if(!collides(state.pos.x,nz))state.pos.z=nz}
function moveEntity(n,dx,dz,pad=.28){
 let moved=false,x=n.group.position.x,z=n.group.position.z;
 if(!entityBlocked(x+dx,z,pad)){n.group.position.x=x+dx;moved=true}
 x=n.group.position.x;z=n.group.position.z;
 if(!entityBlocked(x,z+dz,pad)){n.group.position.z=z+dz;moved=true}
 if(!moved)n.dir*=-1;
 return moved
}
function updateCamera(t=0){const bob=(Math.abs(moveStick.x)+Math.abs(moveStick.y)>.15)?Math.sin(t*.012)*.022:0;camera.position.set(state.pos.x,1.72+bob,state.pos.z);const cp=Math.cos(state.pitch),sp=Math.sin(state.pitch),sy=Math.sin(state.yaw),cy=Math.cos(state.yaw);camera.lookAt(state.pos.x+sy*cp,1.72+sp+bob,state.pos.z-cy*cp)}
function updateWorldLight(dt){
 state.timeOfDay=(state.timeOfDay+dt*.025)%24;
 const sun=scene.getObjectByName('sun'),hemi=scene.children.find(x=>x.isHemisphereLight),day=Math.max(.06,Math.sin((state.timeOfDay-6)/24*Math.PI*2)*.5+.5);
 sun.intensity=.12+day*1.95;hemi.intensity=.28+day*1.9;
 const cloudDim=state.weather==='cloudy'?.78:state.weather==='rain'?.58:1;
 sun.intensity*=cloudDim;
 const sky=new THREE.Color().setRGB(.035+.47*day*cloudDim,.055+.61*day*cloudDim,.09+.68*day*cloudDim);scene.background.copy(sky);scene.fog.color.copy(sky);
 if(performance.now()-lastWeatherTick>42000){lastWeatherTick=performance.now();const r=Math.random();state.weather=r<.66?'clear':r<.84?'cloudy':'rain'}
}
function updateTrafficLights(t){
 const phase=(Math.floor(t/6500)%2)===0; // true: vertical traffic gets green
 for(const l of trafficLights){
   const green=(l.axis==='vertical')===phase;
   l.green.material.color.setHex(green?0x39e47b:0x163f28);
   l.red.material.color.setHex(green?0x48171b:0xff4055)
 }
 return phase
}
function updateCars(dt,t){
 const verticalGreen=updateTrafficLights(t);
 for(const c of cars){
   c.turnCooldown=Math.max(0,(c.turnCooldown||0)-dt);

   let cx=Math.floor(c.group.position.x/CHUNK),cz=Math.floor(c.group.position.z/CHUNK),x0=cx*CHUNK,z0=cz*CHUNK;
   const newKey=ck(cx,cz);
   if(newKey!==c.key&&chunks.has(newKey)){
     chunks.get(newKey).add(c.group);
     c.key=newKey
   }
   const localX=c.group.position.x-x0,localZ=c.group.position.z-z0;

   if(c.mode==='v'){
     // +Z uses west lane, -Z uses east lane.
     const laneX=c.dir>0?x0+3.0:x0+8.0;
     c.group.position.x+=(laneX-c.group.position.x)*Math.min(1,dt*8);
     const nearIntersection=localZ<11.2&&localZ>1.0;
     const red=nearIntersection&&!verticalGreen;
     if(!red)c.group.position.z+=c.dir*c.speed*dt;

     const turnZone=Math.abs(localZ-5.5)<1.1;
     if(turnZone&&c.turnCooldown<=0&&Math.random()<.055){
       const right=Math.random()<.62;
       if(c.dir>0){c.mode='h';c.dir=right?-1:1;c.group.position.z=right?z0+3.0:z0+8.0}
       else{c.mode='h';c.dir=right?1:-1;c.group.position.z=right?z0+8.0:z0+3.0}
       c.turnCooldown=2.2
     }
     c.group.rotation.y=c.dir>0?Math.PI:0
   }else{
     // +X uses north lane, -X uses south lane.
     const laneZ=c.dir>0?z0+8.0:z0+3.0;
     c.group.position.z+=(laneZ-c.group.position.z)*Math.min(1,dt*8);
     const nearIntersection=localX<11.2&&localX>1.0;
     const red=nearIntersection&&verticalGreen;
     if(!red)c.group.position.x+=c.dir*c.speed*dt;

     const turnZone=Math.abs(localX-5.5)<1.1;
     if(turnZone&&c.turnCooldown<=0&&Math.random()<.055){
       const right=Math.random()<.62;
       if(c.dir>0){c.mode='v';c.dir=right?1:-1;c.group.position.x=right?x0+3.0:x0+8.0}
       else{c.mode='v';c.dir=right?-1:1;c.group.position.x=right?x0+8.0:x0+3.0}
       c.turnCooldown=2.2
     }
     c.group.rotation.y=c.dir>0?-Math.PI/2:Math.PI/2
   }

   if(!state.interior&&t-c.lastHit>1250){
     const dx=Math.abs(state.pos.x-c.group.position.x),dz=Math.abs(state.pos.z-c.group.position.z);
     const hit=c.mode==='v'?(dx<1.15&&dz<2.15):(dx<2.15&&dz<1.15);
     if(hit){c.lastHit=t;hitByCar(c)}
   }
 }
}
function hitByCar(c){
 const raw=18+Math.floor(Math.random()*11),abs=Math.min(state.armor,Math.floor(raw*.35));state.armor-=abs;state.hp-=raw-abs;
 const k=2.4;c.mode==='v'?state.pos.z+=c.dir*k:state.pos.x+=c.dir*k;
 toast(`🚗 Percuté ! -${raw-abs} PV`);
 if(state.hp<=0){state.hp=state.maxHp;state.wanted=0;state.pos={x:2,z:8};clearTarget();toast('K.O. après l’accident — retour au refuge')}
 save()
}
function setHeading(n,dx,dz){
 if(Math.abs(dx)+Math.abs(dz)<.001)return;
 // Local face points toward -Z. This converts a movement vector to that exact orientation.
 n.heading=Math.atan2(-dx,-dz);n.group.rotation.y=n.heading
}
function patrolPerson(n,dt){
 if(n.route?.length){
   let target=n.route[n.routeIndex%n.route.length],dx=target.x-n.group.position.x,dz=target.z-n.group.position.z,dist=Math.hypot(dx,dz);
   if(dist<.48){
     n.routeIndex=(n.routeIndex+1)%n.route.length;
     target=n.route[n.routeIndex];dx=target.x-n.group.position.x;dz=target.z-n.group.position.z;dist=Math.hypot(dx,dz)
   }
   if(dist>.001){
     const sx=dx/dist*n.speed*dt,sz=dz/dist*n.speed*dt;
     if(moveEntity(n,sx,sz,.3))setHeading(n,sx,sz)
   }
   return
 }
 const current=n.axis==='x'?n.group.position.x:n.group.position.z;
 if(n.pathMin!=null&&n.pathMax!=null){
   if(current<n.pathMin+.35)n.dir=1;
   if(current>n.pathMax-.35)n.dir=-1
 }
 const dx=n.axis==='x'?n.dir*n.speed*dt:0,dz=n.axis==='z'?n.dir*n.speed*dt:0;
 if(moveEntity(n,dx,dz,.3))setHeading(n,dx,dz)
}
function updateAngryCivilian(n,dt,t){
 const dx=state.pos.x-n.group.position.x,dz=state.pos.z-n.group.position.z,dist=Math.hypot(dx,dz);
 n.aggroTime=Math.max(0,n.aggroTime-dt);
 if(!n.calledPolice){n.calledPolice=true;toast('🗣️ Au voleur !');callNearbyPolice(n,t)}
 if(dist>1.05){
   const sx=dx/(dist||1)*n.speed*1.35*dt,sz=dz/(dist||1)*n.speed*1.35*dt;
   if(moveEntity(n,sx,sz,.32))setHeading(n,sx,sz)
 }else if(t-n.lastHit>900){
   n.lastHit=t;
   const raw=5+Math.floor(Math.random()*5),abs=Math.min(state.armor,Math.floor(raw*.35));
   state.armor-=abs;state.hp-=raw-abs;toast(`👊 ${n.name} te frappe ! -${raw-abs} PV`);
   if(state.hp<=0){state.hp=state.maxHp;state.wanted=0;state.pos={x:2,z:8};clearTarget();toast('K.O. — retour au refuge')}
 }
 if(n.aggroTime<=0){n.calledPolice=false;n.caught=true}
}
function callNearbyPolice(n,t){
 let found=false;
 for(const p of police){
   const d=Math.hypot(p.group.position.x-n.group.position.x,p.group.position.z-n.group.position.z);
   if(d<18){p.chasing=true;p.lastSeen=t;found=true}
 }
 if(found)state.wanted=Math.max(2,state.wanted); else state.wanted=Math.max(1,state.wanted)
}

function updatePeople(dt,t){
 policeSeeing=false;
 for(const n of npcs){
   if(n.aggroTime>0) updateAngryCivilian(n,dt,t);
   else patrolPerson(n,dt);
   n.legs[0].rotation.x=Math.sin(t*.006*n.speed+n.phase)*.55;n.legs[1].rotation.x=-n.legs[0].rotation.x;
   if(n.arms){n.arms[0].rotation.x=-n.legs[0].rotation.x*.7;n.arms[1].rotation.x=-n.legs[1].rotation.x*.7}
 }
 for(const n of enemies){
   if(n===activeEnemyEntity)continue;
   const dx=state.pos.x-n.group.position.x,dz=state.pos.z-n.group.position.z,dist=Math.hypot(dx,dz);
   if(dist<8){const sx=dx/(dist||1)*n.speed*1.18*dt,sz=dz/(dist||1)*n.speed*1.18*dt;if(moveEntity(n,sx,sz,.3))setHeading(n,sx,sz);if(dist<1.5&&!activeEnemy)startCombat(n)}else patrolPerson(n,dt);
   n.legs[0].rotation.x=Math.sin(t*.006*n.speed+n.phase)*.55;n.legs[1].rotation.x=-n.legs[0].rotation.x;
   if(n.arms){n.arms[0].rotation.x=-n.legs[0].rotation.x*.7;n.arms[1].rotation.x=-n.legs[1].rotation.x*.7}
 }
 for(const p of police){
   const dx=state.pos.x-p.group.position.x,dz=state.pos.z-p.group.position.z,dist=Math.hypot(dx,dz);
   const canSee=dist<13.5&&hasLineOfSight(p.group.position.x,p.group.position.z,state.pos.x,state.pos.z)&&(!isPlayerHidden()||dist<3.2);
   const crime=!!tailTheft?.active||state.wanted>0;
   if(canSee&&crime){policeSeeing=true;p.lastSeen=t;p.chasing=true;if(tailTheft?.active&&tailTheft.validStealTime>.25){state.wanted=Math.max(1,state.wanted);tailTheft.policeObserved=true}}
   if(p.chasing&&(state.wanted>0||t-p.lastSeen<5000)){
     const sx=dx/(dist||1)*p.speed*1.75*dt,sz=dz/(dist||1)*p.speed*1.75*dt;if(moveEntity(p,sx,sz,.32))setHeading(p,sx,sz);
     if(dist<1.35)policeCatch(p)
   }else{p.chasing=false;patrolPerson(p,dt)}
   p.legs[0].rotation.x=Math.sin(t*.006*p.speed+p.phase)*.55;p.legs[1].rotation.x=-p.legs[0].rotation.x;
   if(p.arms){p.arms[0].rotation.x=-p.legs[0].rotation.x*.7;p.arms[1].rotation.x=-p.legs[1].rotation.x*.7}
 }
 updateTailTheft(dt,t);
 if(state.wanted>0){
   if(policeSeeing){hiddenTimer=0}
   else{hiddenTimer+=dt;if(hiddenTimer>6.5){state.wanted=Math.max(0,state.wanted-1);hiddenTimer=0;toast(state.wanted?'Tu restes caché : recherche diminuée':'Tu as semé la police')}}
 }
}
function isPlayerHidden(){return hidingZones.some(h=>Math.hypot(state.pos.x-h.x,state.pos.z-h.z)<h.radius)}
function hasLineOfSight(ax,az,bx,bz){
 for(const c of colliders){if(segmentRect(ax,az,bx,bz,c.minX,c.minZ,c.maxX,c.maxZ))return false}
 return true
}
function segmentRect(x1,y1,x2,y2,minX,minY,maxX,maxY){
 const dx=x2-x1,dy=y2-y1;let t0=0,t1=1;
 for(const [p,q] of [[-dx,x1-minX],[dx,maxX-x1],[-dy,y1-minY],[dy,maxY-y1]]){
   if(Math.abs(p)<1e-9){if(q<0)return false;continue}
   const r=q/p;if(p<0){if(r>t1)return false;if(r>t0)t0=r}else{if(r<t0)return false;if(r<t1)t1=r}
 }
 return true
}
function policeCatch(){
 if(state.interior)return;
 const fine=Math.min(state.coins,Math.max(12,Math.round(state.coins*(.10+state.wanted*.055))));
 state.coins-=fine;state.policeCaught++;state.wanted=0;hiddenTimer=0;
 if(tailTheft)stopTailTheft('La police t’a attrapé.',true);
 clearTarget();state.pos={x:2,z:8};toast(`👮 Attrapé : -${fine} crédits`);save()
}function animatePickups(dt,t){for(const p of pickups){if(!p.parent)continue;p.rotation.y+=dt;p.position.y=(p.userData.type==='artifact'?.72:.43)+Math.sin(t/450+p.position.x)*.07}}
function animate(){
 if(!renderer)return;requestAnimationFrame(animate);const dt=Math.min(.033,clock.getDelta()),t=performance.now();
 const keyForward=(keys['ArrowUp']?1:0)-(keys['ArrowDown']?1:0);
 const keyStrafe=(keys['ArrowRight']?1:0)-(keys['ArrowLeft']?1:0);
 const forward=clamp(-moveStick.y+keyForward,-1,1),strafe=clamp(moveStick.x+keyStrafe,-1,1);
 const fx=Math.sin(state.yaw),fz=-Math.cos(state.yaw),rx=Math.cos(state.yaw),rz=Math.sin(state.yaw);
 movePlayer((fx*forward+rx*strafe)*4.8*dt,(fz*forward+rz*strafe)*4.8*dt);
 state.yaw+=lookStick.x*1.8*dt;
 state.pitch=clamp(state.pitch-lookStick.y*1.2*dt,-.58,.52);if(Math.abs(lookStick.y)<.02)state.pitch*=Math.max(.0,1-dt*2.1)
 updateCamera(t);if(!state.interior){updatePeople(dt,t);updateCars(dt,t);animatePickups(dt,t);if(t-lastChunkTick>650){ensureChunks();lastChunkTick=t}}updateWorldLight(dt);updateAtmosphere(dt);checkInteraction();if(t-lastMapTick>100){drawMap();lastMapTick=t}updateHUD();renderer.render(scene,camera)
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
 if(activeEnemy||!$('#dialogue').classList.contains('hidden'))return hidePrompt();
 if(state.interior){
   if(state.interior.type==='shop'){
     if(state.pos.z<-4.6)return setPrompt('Comptoir',`Voir le stock de ${SHOPS[state.interior.shopType].name}.`,'ACHETER',()=>openSheet('physicalShop'));
     if(state.pos.z>5.5)return setPrompt('Sortie','Retourner dans la rue.','SORTIR',leaveInterior);
     return hidePrompt()
   }
   if(state.interior.type==='home'){
     if(state.pos.z<-4.9)return setPrompt('Atelier de base','Gérer le terrain, les meubles, le coffre et le stockage.','GÉRER',()=>openSheet('home'));
     if(state.pos.z>5.5)return setPrompt('Sortie','Retourner dans la rue.','SORTIR',leaveInterior);
     return hidePrompt()
   }
   if(state.pos.z>5.5)return setPrompt('Sortie','Retourner dans la rue.','SORTIR',leaveInterior);
   return hidePrompt()
 }
 if(tailTheft?.active)return hidePrompt();

 if(selectedNPC&&selectedNPC.group.parent){
   const d=Math.hypot(state.pos.x-selectedNPC.group.position.x,state.pos.z-selectedNPC.group.position.z);
   if(d<2.25){
     const behind=isBehindTarget(selectedNPC);
     if(behind)return setPrompt(`Cible : ${selectedNPC.name}`,'Reste derrière et proche de la cible. La fouille démarre automatiquement.','SUIVRE',()=>startTailTheft(selectedNPC));
     return setPrompt(`Cible : ${selectedNPC.name}`,'Place-toi derrière la personne. La fouille démarre toute seule quand tu es bien placé.','SUIVRE',()=>toast('Passe derrière la cible sans la dépasser.'))
   }
 }
 const hp=nearest(homePlots,2.35);if(hp)return setPrompt(state.landOwned?'Ton terrain':'Terrain à vendre',state.landOwned?'Entrer dans ta base pour stocker tes gains et aménager ton chez-toi.':`Acheter ce terrain pour ${HOME_PLOT_PRICE} crédits.` ,state.landOwned?'ENTRER':'ACHETER',()=>state.landOwned?enterInterior('home',hp):buyLand());
 const p=nearest(pickups.filter(x=>x.parent),1.6);if(p)return setPrompt(pickupName(p.userData.type),'Objet trouvé dans la rue.','RAMASSER',()=>collectPickup(p));
 const c=nearest(containers.filter(x=>x.parent),1.7);if(c)return setPrompt(c.userData.type==='bin'?'Poubelle':'Coffre',c.userData.type==='bin'?'Fouiller du matériel.':'Ouvrir le coffre.','FOUILLER',()=>openContainer(c));
 const s=shops.reduce((b,x)=>{const d=Math.hypot(state.pos.x-x.door.x,state.pos.z-x.door.z);return !b||d<b.d?{x,d}:b},null);if(s&&s.d<1.8)return setPrompt(SHOPS[s.x.type].name,'Entrer dans la boutique.','ENTRER',()=>enterInterior('shop',s.x));
 const a=nearest(apartments,1.6);if(a)return setPrompt('Immeuble résidentiel','Entrer dans le hall.','ENTRER',()=>enterInterior('apartment',a));
 const n=nearest(npcs,1.5);if(n)return setPrompt(n.name,'Touche le passant pour le choisir comme cible, ou ouvre le dialogue.','PARLER',()=>talkNPC(n));
 hidePrompt()
}
function setPrompt(t,d,b,fn){currentInteractFn=fn;$('#promptTitle').textContent=t;$('#promptText').textContent=d;$('#promptBtn').textContent=b;$('#promptBtn').onclick=fn;$('#prompt').classList.remove('hidden')}
function hidePrompt(){currentInteractFn=null;$('#prompt').classList.add('hidden')}
function pickupName(t){return{medkit:'Kit de soin',rare:'Cache de matériel',artifact:city().artifact}[t]}
function artifactLabel(id){return (CITIES.find(c=>c.id===id)||{artifact:id}).artifact}
function artifactCount(id){return state.artifactBag.filter(x=>x===id).length}
function sellArtifact(id){
 const idx=state.artifactBag.indexOf(id);
 if(idx<0)return toast('Aucun artefact à vendre');
 state.artifactBag.splice(idx,1);
 state.coins+=500;
 save();toast(`${artifactLabel(id)} vendu : +500 crédits`);
 if($('#sheetTitle')?.textContent===SHOPS[state.interior?.shopType]?.name){$('#sheetBody').innerHTML=physicalShopHTML();bindShop()}
 else openSheet('bag')
}
function collectPickup(m){
 const{id,type}=m.userData;if(state.collected.includes(id))return;
 if(type==='medkit'&&invCount()>=state.bagMax)return toast('Sac plein');
 state.collected.push(id);
 if(type==='medkit'){addInv('medkit');toast('Kit de soin récupéré')}
 if(type==='rare'){state.xp+=35;if(Math.random()<.45&&invCount()<state.bagMax){addInv('medkit');toast('Cache : kit de soin + XP')}else{state.armor=clamp(state.armor+12,0,100);toast('Cache : matériel de protection + XP')}}
 if(type==='artifact'&&!state.artifacts.includes(state.cityId)){state.artifacts.push(state.cityId);state.artifactBag.push(state.cityId);state.xp+=180;toast(`${city().artifact} récupéré ! Tu peux le vendre 500 crédits en boutique.`)}
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
 openSheet('npc');$('#sheetTitle').textContent=n.name;$('#sheetBody').innerHTML=`<div class="card"><h3>Que faire ?</h3><div class="grid2"><button class="menuBtn primary" id="talkAgain">💬 Discuter</button><button class="menuBtn" id="pickpocket" ${n.pickpocketed||n.caught?'disabled':''}>🫳 Faire les poches<small>${n.pickpocketed?'Déjà fouillé':n.caught?'Sur ses gardes':'Tu la sélectionnes puis la fouille démarre quand tu restes derrière elle.'}</small></button></div></div>`;
 $('#talkAgain').onclick=()=>{closeSheet();showDialogue(n.name,'Profite du quartier, il y a toujours quelque chose à découvrir.',hideDialogue)};const pp=$('#pickpocket');if(pp)pp.onclick=()=>{closeSheet();selectTarget(n);toast('Cible sélectionnée : suis-la et place-toi derrière.')}
}
function assignNpcMission(n){const opts=[{kind:'pockets',text:'récupère 30 crédits sur des passants',target:30,start:state.stolenCoins,reward:90},{kind:'container',text:'fouille 2 caches ou poubelles',target:2,start:state.containersOpened,reward:110},{kind:'explore',text:'découvre 2 nouveaux quartiers',target:2,start:state.seenDistricts.length,reward:120}];state.activeNpcMission={...choice(opts),giver:n.name};save()}
function npcMissionProgress(){const m=state.activeNpcMission;if(!m)return null;const now=m.kind==='pockets'?state.stolenCoins:m.kind==='container'?state.containersOpened:state.seenDistricts.length;return now-m.start}
function maybeCompleteNpcMission(){const m=state.activeNpcMission;if(!m)return;if(npcMissionProgress()>=m.target){state.coins+=m.reward;state.npcMissions++;state.reputation=(state.reputation||0)+2;toast(`Mission de ${m.giver} terminée +${m.reward}`);state.activeNpcMission=null;checkQuests();save()}}
function selectTarget(n){
 if(!n||n.hostile||n.isPolice)return;
 clearTarget(false);selectedNPC=n;
 const marker=makeSign('▼ CIBLE','#8ee8ff');marker.scale.set(2.8,.7,1);marker.position.set(0,2.55,0);n.group.add(marker);targetMarker=marker;
 $('#targetCard').classList.remove('hidden');$('#targetName').textContent=n.name;$('#targetInfo').textContent='Suis-la. Dès que tu es bien derrière, la fouille démarre automatiquement.';updateTargetHUD()
}
function clearTarget(show=true){
 if(tailTheft?.active)stopTailTheft('Filature annulée.');
 if(targetMarker?.parent)targetMarker.parent.remove(targetMarker);targetMarker=null;selectedNPC=null;$('#targetCard').classList.add('hidden');if(show)toast('Cible désélectionnée')
}
function isBehindTarget(n){
 const vx=state.pos.x-n.group.position.x,vz=state.pos.z-n.group.position.z,d=Math.hypot(vx,vz)||1;
 const fx=-Math.sin(n.heading),fz=-Math.cos(n.heading);
 return (fx*(vx/d)+fz*(vz/d))<-.38
}
function startTailTheft(n){
 if(tailTheft?.npc===n)return;
 if(!n||n.pickpocketed)return;
 const d=Math.hypot(state.pos.x-n.group.position.x,state.pos.z-n.group.position.z);if(d>2.1)return;
 if(!isBehindTarget(n))return;
 tailTheft={npc:n,suspicion:0,validStealTime:0,lostTime:0,nextCoin:.65+Math.random()*.55,emptyTimer:0,policeObserved:false,stolen:0};
 document.body.classList.add('crime-active');$('#targetInfo').textContent='Vol en cours : reste derrière, proche et hors de vue de la police.'
}
function updateTailTheft(dt,t){
 if(!tailTheft?.active&&tailTheft)tailTheft.active=true;
 if(!tailTheft?.active)return;
 const n=tailTheft.npc;
 if(!n?.group?.parent)return stopTailTheft('La cible est partie.');
 const d=Math.hypot(state.pos.x-n.group.position.x,state.pos.z-n.group.position.z),behind=isBehindTarget(n),hidden=isPlayerHidden();
 const ideal=d>=.62&&d<=1.65&&behind;
 if(d>2.2){tailTheft.lostTime+=dt;if(tailTheft.lostTime>1.3)return stopTailTheft('Tu as perdu la cible.')}else tailTheft.lostTime=Math.max(0,tailTheft.lostTime-dt*2);

 if(ideal){
   tailTheft.validStealTime+=dt;tailTheft.nextCoin-=dt;
   tailTheft.suspicion=Math.max(0,tailTheft.suspicion-dt*(5+state.stealth*2));
   if(n.money<=0){
     tailTheft.emptyTimer+=dt;if(tailTheft.emptyTimer>1.15){n.pickpocketed=true;return stopTailTheft(tailTheft.stolen>0?'Tu as vidé ses poches.':'Poches vides : rien à récupérer.')}
   }else if(tailTheft.nextCoin<=0){
     const take=Math.min(n.money,1+Math.floor(Math.random()*(3+Math.min(2,state.stealth))));n.money-=take;state.coins+=take;state.coinsEarned+=take;state.stolenCoins+=take;tailTheft.stolen+=take;
     tailTheft.nextCoin=.72+Math.random()*.72;$('#targetLoot').textContent=`🪙 +${tailTheft.stolen}`;checkQuests();maybeCompleteNpcMission()
   }
 }else{
   tailTheft.validStealTime=Math.max(0,tailTheft.validStealTime-dt*.35);
   tailTheft.suspicion+=dt*(behind?14:32)+(d<.55?dt*35:0);
 }
 tailTheft.suspicion+=dt*Math.max(0,(tailTheft.validStealTime-5.5))*1.8;
 if(tailTheft.policeObserved)return theftSpottedByPolice();
 if(tailTheft.suspicion>=n.alertness)return targetNotices();
 updateTargetHUD();save()
}
function targetNotices(){
 const n=tailTheft.npc;
 n.caught=true;n.aggroTime=8+Math.random()*3;n.calledPolice=false;state.wanted=Math.max(1,state.wanted);
 stopTailTheft(`${n.name} s’est aperçu du vol !`,true);n.speed=Math.max(n.speed,1.25)
}
function theftSpottedByPolice(){
 state.wanted=Math.max(1,state.wanted);stopTailTheft('Un policier t’a vu faire les poches !',true)
}
function stopTailTheft(msg,caught=false){
 if(!tailTheft)return;const n=tailTheft.npc,stolen=tailTheft.stolen||0;
 if(stolen>0&&!n._counted){state.pickpockets++;n._counted=true}
 tailTheft=null;document.body.classList.remove('crime-active');$('#targetInfo').textContent=caught?'Repéré ! Cache-toi et coupe la ligne de vue.':'Filature interrompue.';if(msg)toast(msg);save()
}
function updateTargetHUD(){
 if(!selectedNPC?.group?.parent){if(selectedNPC)clearTarget(false);return}
 const d=Math.hypot(state.pos.x-selectedNPC.group.position.x,state.pos.z-selectedNPC.group.position.z);
 $('#targetDistance').textContent=`${d.toFixed(1)} m`;
 const s=tailTheft?.npc===selectedNPC?tailTheft.suspicion:0;$('#suspicionBar').style.width=`${clamp(s/selectedNPC.alertness*100,0,100)}%`;
 if(!tailTheft)$('#targetLoot').textContent=selectedNPC.pickpocketed?'🪙 fouillé':'🪙 ?';
 const behind=isBehindTarget(selectedNPC);
 if(!tailTheft && !selectedNPC.pickpocketed && d>=.62 && d<=1.65 && behind) startTailTheft(selectedNPC);
 if(tailTheft){
   $('#targetInfo').textContent=policeSeeing?'👮 Police en vue ! Cache-toi.':(!behind?'⚠️ Reviens derrière la cible.':(isPlayerHidden()?'🌿 Caché — poursuis la fouille.':'🫳 Fouille en cours…'));
 }else{
   $('#targetInfo').textContent=selectedNPC.pickpocketed?'Cette personne a déjà été fouillée.':(behind&&d<=1.65?'La fouille démarre toute seule.':'Suis-la puis place-toi derrière elle.')
 }
}
function setupWorldTap(){
 const canvas=renderer.domElement;
 canvas.addEventListener('pointerdown',e=>{tapStart={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId}});
 canvas.addEventListener('pointerup',e=>{
   if(!tapStart||tapStart.id!==e.pointerId)return;
   const moved=Math.hypot(e.clientX-tapStart.x,e.clientY-tapStart.y),elapsed=performance.now()-tapStart.t;tapStart=null;
   if(moved>12||elapsed>350||state.interior)return;
   const r=canvas.getBoundingClientRect(),pt=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
   raycaster.setFromCamera(pt,camera);const hits=raycaster.intersectObjects(npcs.map(n=>n.group),true);
   const n=hits.map(h=>h.object.userData.person).find(Boolean);if(n){selectTarget(n);toast('Cible choisie : suis-la et place-toi derrière elle.')}
 })
}

function showDialogue(name,text,next){$('#dialogueName').textContent=name;$('#dialogueText').textContent=text;$('#dialogueIcon').textContent='🙂';$('#dialogue').classList.remove('hidden');$('#dialogueNext').onclick=next}
function hideDialogue(){$('#dialogue').classList.add('hidden')}

function enterInterior(type,obj){
 state.returnPos={...state.pos};state.interior={type,shopType:obj?.type||null};for(const[,g]of chunks)g.visible=false;
 if(interiorGroup)scene.remove(interiorGroup);interiorGroup=new THREE.Group();scene.add(interiorGroup);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(18,18),new THREE.MeshStandardMaterial({color:type==='shop'?0x786f60:type==='home'?0x7b6c5d:0x6b665f,roughness:1}));floor.rotation.x=-Math.PI/2;interiorGroup.add(floor);
 const wallM=new THREE.MeshStandardMaterial({color:type==='shop'?0xc8c0aa:type==='home'?0xd7cfbf:0xd2cbc1});[[0,2.5,-9,18,.25],[0,2.5,9,18,.25],[-9,2.5,0,.25,18],[9,2.5,0,.25,18]].forEach(w=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w[3],5,w[4]),wallM);m.position.set(w[0],w[1],w[2]);interiorGroup.add(m)});
 if(type==='shop')buildShopInterior(obj.type);else if(type==='home')buildHomeInterior();else buildApartmentInterior();
 state.pos={x:0,z:6.5};state.yaw=0;state.pitch=0;hidePrompt();save()
}
function buildShopInterior(type){
 const shelfM=new THREE.MeshStandardMaterial({color:0x4c3c2d});for(let i=-1;i<=1;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.8,5),shelfM);s.position.set(i*4,1,0);interiorGroup.add(s)}
 const counter=new THREE.Mesh(new THREE.BoxGeometry(5,1.2,1.2),new THREE.MeshStandardMaterial({color:0x2f4855}));counter.position.set(0,.6,-6);interiorGroup.add(counter);
 const sign=makeSign(`${SHOPS[type].icon} ${SHOPS[type].name}`);sign.position.set(0,3,-8.5);interiorGroup.add(sign)
}
function buildApartmentInterior(){
 const couch=new THREE.Mesh(new THREE.BoxGeometry(3,.8,1.1),new THREE.MeshStandardMaterial({color:0x5a6675}));couch.position.set(-3,.5,-3);interiorGroup.add(couch);
 const table=new THREE.Mesh(new THREE.BoxGeometry(1.6,.7,1.2),new THREE.MeshStandardMaterial({color:0x6e523a}));table.position.set(2,.4,-2);interiorGroup.add(table);
 const plant=new THREE.Group();const pot=new THREE.Mesh(new THREE.CylinderGeometry(.3,.4,.5,10),new THREE.MeshStandardMaterial({color:0x80543a}));pot.position.y=.25;plant.add(pot);const leaf=new THREE.Mesh(new THREE.SphereGeometry(.65,9,8),new THREE.MeshStandardMaterial({color:0x3f7c4d}));leaf.position.y=1.15;plant.add(leaf);plant.position.set(4,0,3);interiorGroup.add(plant)
}
function makeHomeProp(id){
 const g=new THREE.Group();
 if(id==='wallKit'){const m=new THREE.Mesh(new THREE.BoxGeometry(3.2,2.6,.18),new THREE.MeshStandardMaterial({color:0xd0c7b5}));m.position.y=1.3;g.add(m)}
 if(id==='sofa'){const base=new THREE.Mesh(new THREE.BoxGeometry(2.6,.55,1.05),new THREE.MeshStandardMaterial({color:0x566a7e}));base.position.y=.32;g.add(base);const back=new THREE.Mesh(new THREE.BoxGeometry(2.6,.75,.18),new THREE.MeshStandardMaterial({color:0x566a7e}));back.position.set(0,.72,.43);g.add(back)}
 if(id==='table'){const top=new THREE.Mesh(new THREE.BoxGeometry(1.6,.14,1.1),new THREE.MeshStandardMaterial({color:0x734f34}));top.position.y=.72;g.add(top);for(const dx of [-.6,.6])for(const dz of [-.35,.35]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.09,.7,.09),new THREE.MeshStandardMaterial({color:0x543a27}));leg.position.set(dx,.35,dz);g.add(leg)}}
 if(id==='lamp'){const stand=new THREE.Mesh(new THREE.CylinderGeometry(.05,.08,1.45,8),new THREE.MeshStandardMaterial({color:0x434b52}));stand.position.y=.72;g.add(stand);const shade=new THREE.Mesh(new THREE.ConeGeometry(.33,.42,12),new THREE.MeshStandardMaterial({color:0xf2dfab}));shade.position.set(0,1.45,0);g.add(shade)}
 if(id==='plant'){const pot=new THREE.Mesh(new THREE.CylinderGeometry(.26,.34,.42,10),new THREE.MeshStandardMaterial({color:0x8a5c40}));pot.position.y=.21;g.add(pot);const leaf=new THREE.Mesh(new THREE.SphereGeometry(.58,10,8),new THREE.MeshStandardMaterial({color:0x498455}));leaf.scale.y=1.1;leaf.position.y=1.0;g.add(leaf)}
 if(id==='wardrobe'){const m=new THREE.Mesh(new THREE.BoxGeometry(1.6,2.35,.7),new THREE.MeshStandardMaterial({color:0x8d6c4e}));m.position.y=1.18;g.add(m)}
 if(id==='chest'){const box=new THREE.Mesh(new THREE.BoxGeometry(1.25,.75,.82),new THREE.MeshStandardMaterial({color:0x6a4a30}));box.position.y=.38;g.add(box);const lid=new THREE.Mesh(new THREE.BoxGeometry(1.3,.16,.88),new THREE.MeshStandardMaterial({color:0x80583a}));lid.position.set(0,.82,0);g.add(lid)}
 if(id==='safe'){const box=new THREE.Mesh(new THREE.BoxGeometry(1.15,1.35,.95),new THREE.MeshStandardMaterial({color:0x59636c,metalness:.35,roughness:.55}));box.position.y=.68;g.add(box);const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.08,10),new THREE.MeshStandardMaterial({color:0xd4dbe2,metalness:.7,roughness:.25}));wheel.rotation.x=Math.PI/2;wheel.position.set(.22,.75,.49);g.add(wheel)}
 return g
}
function buildHomeInterior(){
 const sign=makeSign(`🏠 TA BASE — NIVEAU ${state.homeLevel||1}`,'#8fe8ff');sign.position.set(0,3.2,-8.45);interiorGroup.add(sign);
 const desk=new THREE.Mesh(new THREE.BoxGeometry(4.1,1,1.1),new THREE.MeshStandardMaterial({color:0x56422f}));desk.position.set(0,.5,-6.2);interiorGroup.add(desk);
 const rug=new THREE.Mesh(new THREE.PlaneGeometry(5.4,3.5),new THREE.MeshStandardMaterial({color:0x31576c,roughness:1}));rug.rotation.x=-Math.PI/2;rug.position.set(0,.02,-1);interiorGroup.add(rug);
 const maxSlots=state.homeLevel===1?8:state.homeLevel===2?12:16;
 state.homePlaced.slice(0,maxSlots).forEach((id,i)=>{const slot=HOME_SLOTS[i],p=makeHomeProp(id);p.position.set(slot.x,0,slot.z);if(slot.rot)p.rotation.y=slot.rot;interiorGroup.add(p)});
 if(state.artifacts.length){
   const shelf=new THREE.Mesh(new THREE.BoxGeometry(5,.16,.65),new THREE.MeshStandardMaterial({color:0x66482f}));shelf.position.set(0,1.25,7.9);interiorGroup.add(shelf);
   state.artifacts.slice(0,5).forEach((id,i)=>{const art=new THREE.Mesh(new THREE.OctahedronGeometry(.32),new THREE.MeshStandardMaterial({color:0x61d7ff,emissive:0x15546c,emissiveIntensity:.9}));art.position.set(-2+i,1.65,7.85);interiorGroup.add(art)})
 }
}
function exitInterior(){leaveInterior()}
function leaveInterior(){if(interiorGroup){scene.remove(interiorGroup);interiorGroup=null}for(const[,g]of chunks)g.visible=true;state.interior=null;state.pos=state.returnPos||{x:2,z:8};state.returnPos=null;save();hidePrompt()}
function physicalShopHTML(){
 const s=SHOPS[state.interior.shopType];
 const arts=[...new Set(state.artifactBag)];
 return `<div class="card"><h3>${s.icon} ${s.name}</h3><p class="sub">${state.coins} crédits disponibles. ${state.reputation?`Réputation ${state.reputation} : remise jusqu’à ${Math.min(15,state.reputation)}%.`:''}</p></div>
 <div class="card">${s.stock.map(x=>`<div class="item"><div class="itemIcon">${x.icon}</div><div class="itemMain"><b>${x.name}</b><small>${x.desc} • ${x.price} crédits</small></div><button class="menuBtn buy" data-id="${x.id}" data-price="${x.price}">Acheter</button></div>`).join('')}</div>
 <div class="card"><h3>💎 Vente d’artefacts</h3>${arts.length?arts.map(id=>`<div class="item"><div class="itemIcon">💎</div><div class="itemMain"><b>${artifactLabel(id)}</b><small>En sac ×${artifactCount(id)} • 500 crédits pièce</small></div><button class="menuBtn sellArtifact" data-id="${id}">Vendre</button></div>`).join(''):'<p class="sub">Aucun artefact à vendre pour le moment.</p>'}</div>
 <button class="menuBtn red" id="leaveShop" style="width:100%">🚪 Sortir de la boutique</button>`
}
function buy(id,price){const discount=Math.min(.15,(state.reputation||0)*.01),finalPrice=Math.max(1,Math.round(price*(1-discount)));if(state.coins<finalPrice)return toast('Pas assez de crédits');if(WEAPONS[id]&&state.ownedWeapons.includes(id))return toast('Déjà acheté');state.coins-=finalPrice;if(WEAPONS[id]){state.ownedWeapons.push(id);state.equipped=id;weaponRig.visible=true}if(id==='medkit')addInv('medkit');if(id==='snack'){state.hp=clamp(state.hp+15,0,state.maxHp)}if(id==='armor')state.armor=clamp(state.armor+30,0,100);if(id==='bag')state.bagMax+=5;if(id==='stealth')state.stealth++;if(id==='map')state.scanner=1;if(HOME_ITEMS[id])addHomeItem(id);save();updateHUD();toast('Achat effectué');$('#sheetBody').innerHTML=physicalShopHTML();bindShop()}
function bindShop(){$$('.buy').forEach(b=>b.onclick=()=>buy(b.dataset.id,Number(b.dataset.price)));$('#leaveShop').onclick=()=>{closeSheet();leaveInterior()}}

function buyLand(){if(state.landOwned)return enterInterior('home',{});if(state.coins<HOME_PLOT_PRICE)return toast('Pas assez de crédits pour acheter ce terrain');state.coins-=HOME_PLOT_PRICE;state.landOwned=true;toast('Terrain acheté ! Tu as maintenant une base.');save();for(const[k] of [...chunks]){unload(k)}ensureChunks(true)}
function homeHTML(){
 if(!state.landOwned)return `<div class="card"><h3>Terrain personnel</h3><p class="sub">Dans le quartier de départ, un terrain est en vente. Achète-le pour créer ta base, sécuriser tes gains et aménager ton propre chez-toi.</p><button class="menuBtn green" id="buyLandBtn" style="width:100%">🏡 Acheter le terrain — ${HOME_PLOT_PRICE} crédits</button></div>`;
 const maxSlots=state.homeLevel===1?8:state.homeLevel===2?12:16;
 const placeable=state.homeStock.length?state.homeStock.map(it=>`<div class="item"><div class="itemIcon">${HOME_ITEMS[it.id].icon}</div><div class="itemMain"><b>${HOME_ITEMS[it.id].name}</b><small>En stock ×${it.qty}</small></div><button class="menuBtn placeHome" data-id="${it.id}">Placer</button></div>`).join(''):'<p class="sub">Aucun meuble en stock. Va chez Maison & Co.</p>';
 const placed=state.homePlaced.length?state.homePlaced.map((id,i)=>`<div class="item"><div class="itemIcon">${HOME_ITEMS[id].icon}</div><div class="itemMain"><b>${HOME_ITEMS[id].name}</b><small>Emplacement ${i+1}</small></div></div>`).join(''):'<p class="sub">Ta base est encore vide.</p>';
 const canSecure=hasPlaced('safe')||hasPlaced('chest');
 const nextLevel=(state.homeLevel||1)+1,nextCost=HOME_UPGRADE_COST[nextLevel];
 return `<div class="card"><h3>🏠 Ta base — niveau ${state.homeLevel}</h3><span class="reputationBadge">🤝 Réputation ${state.reputation||0}</span><p class="sub">Crédits sur toi : ${state.coins} • Crédits sécurisés : ${state.homeBank} • Medkits : ${state.homeStorage.medkit||0}</p>
 ${nextCost?`<button class="menuBtn primary" id="upgradeHome" style="width:100%;margin-top:8px">🔨 Agrandir la maison — ${nextCost} crédits<small>${nextLevel===2?'12 emplacements et maison plus grande':'16 emplacements et grande maison'}</small></button>`:'<p class="sub">✅ Maison au niveau maximum.</p>'}</div>
 <div class="card"><h3>🧱 Aménagement ${state.homePlaced.length}/${maxSlots}</h3>${placed}<div class="placeGrid"><button class="menuBtn" id="storeAllHome">Tout ranger</button><button class="menuBtn" id="enterHomeBtn">Entrer dans la base</button></div></div>
 <div class="card"><h3>📦 Stock maison</h3>${placeable}</div>
 <div class="card"><h3>🗄️ Coffre</h3><p class="sub">${canSecure?'Ton argent déposé ici est protégé des amendes de police.':'Place un coffre ou coffre sécurisé pour activer le stockage.'}</p>
 <div class="placeGrid"><button class="menuBtn deposit50" ${canSecure?'':'disabled'}>Déposer 50</button><button class="menuBtn withdraw50" ${canSecure?'':'disabled'}>Retirer 50</button><button class="menuBtn depositMed" ${canSecure&&stackCount(state.inventory,'medkit')>0?'':'disabled'}>Déposer medkit</button><button class="menuBtn withdrawMed" ${(canSecure&&(state.homeStorage.medkit||0)>0)?'':'disabled'}>Retirer medkit</button></div></div>
 <div class="card"><h3>🛏️ Repos</h3><p class="sub">Dormir restaure tous tes PV, fait avancer le temps et réduit la recherche policière.</p><button class="menuBtn green" id="restHome" style="width:100%">Dormir à la maison</button></div>
 <div class="card"><h3>🏆 Collection</h3><p class="sub">${state.artifacts.length}/${CITIES.length} artefacts exposés automatiquement dans ta base.</p></div>`
}
function placeHomeItem(id){
 if(!state.landOwned)return toast('Achète d’abord le terrain');
 const maxSlots=state.homeLevel===1?8:state.homeLevel===2?12:16;if(state.homePlaced.length>=maxSlots)return toast('Base pleine : agrandis la maison ou range un objet');
 if(!removeStack(state.homeStock,id,1))return toast('Objet indisponible');
 state.homePlaced.push(id);save();toast(`${HOME_ITEMS[id].name} placé dans la base`);openSheet('home')
}
function storeAllHome(){for(const id of state.homePlaced)addHomeItem(id,1);state.homePlaced=[];save();toast('Tous les objets ont été rangés');openSheet('home')}
function upgradeHome(){
 const next=(state.homeLevel||1)+1,cost=HOME_UPGRADE_COST[next];if(!cost)return toast('Maison déjà au niveau maximum');if(state.coins<cost)return toast('Pas assez de crédits');
 state.coins-=cost;state.homeLevel=next;save();toast(`Maison améliorée au niveau ${next}`);for(const[k]of[...chunks])unload(k);ensureChunks(true);openSheet('home')
}
function restAtHome(){
 if(!state.landOwned)return;state.hp=state.maxHp;state.wanted=Math.max(0,state.wanted-2);state.timeOfDay=7.5;state.restCount=(state.restCount||0)+1;save();toast('Tu as dormi : PV restaurés et recherche réduite');openSheet('home')
}
function depositCoins(amount=50){if(!(hasPlaced('safe')||hasPlaced('chest')))return toast('Place d’abord un coffre');if(state.coins<amount)return toast('Pas assez de crédits sur toi');state.coins-=amount;state.homeBank+=amount;save();openSheet('home')}
function withdrawCoins(amount=50){if(state.homeBank<amount)return toast('Pas assez dans le coffre');state.homeBank-=amount;state.coins+=amount;save();openSheet('home')}
function depositMedkit(){if(!(hasPlaced('safe')||hasPlaced('chest')))return toast('Place d’abord un coffre');if(!removeStack(state.inventory,'medkit',1))return toast('Aucun medkit à déposer');state.homeStorage.medkit=(state.homeStorage.medkit||0)+1;save();openSheet('home')}
function withdrawMedkit(){if((state.homeStorage.medkit||0)<=0)return toast('Aucun medkit stocké');if(invCount()>=state.bagMax)return toast('Sac plein');state.homeStorage.medkit--;addInv('medkit',1);save();openSheet('home')}

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

function renderMapTo(canvas,zoom=2.0){
 if(!canvas)return;
 const q=canvas.getContext('2d'),W=canvas.width,H=canvas.height,S=zoom,R=W/(zoom*2.2);
 q.clearRect(0,0,W,H);q.fillStyle='#07111d';q.fillRect(0,0,W,H);q.save();q.translate(W/2,H/2);
 if(state.interior){q.fillStyle='#8594a0';q.fillRect(-W*.18,-H*.18,W*.36,H*.36);q.fillStyle='#fff';q.beginPath();q.arc(0,0,6,0,Math.PI*2);q.fill();q.restore();return}
 q.strokeStyle='#47555e';q.lineWidth=11*(zoom/2);const minCx=Math.floor((state.pos.x-R)/CHUNK)-1,maxCx=Math.floor((state.pos.x+R)/CHUNK)+1,minCz=Math.floor((state.pos.z-R)/CHUNK)-1,maxCz=Math.floor((state.pos.z+R)/CHUNK)+1;
 for(let cx=minCx;cx<=maxCx;cx++){const x=(cx*CHUNK-state.pos.x)*S;q.beginPath();q.moveTo(x,-H);q.lineTo(x,H);q.stroke()}for(let cz=minCz;cz<=maxCz;cz++){const y=(cz*CHUNK-state.pos.z)*S;q.beginPath();q.moveTo(-W,y);q.lineTo(W,y);q.stroke()}
 q.fillStyle='#6a7680';for(const b of colliders){const x=(b.minX-state.pos.x)*S,y=(b.minZ-state.pos.z)*S,w=(b.maxX-b.minX)*S,h=(b.maxZ-b.minZ)*S;if(Math.abs(x)>W||Math.abs(y)>H)continue;q.fillRect(x,y,w,h)}
 q.fillStyle='#63e2b0';for(const s of shops){const dx=(s.x-state.pos.x)*S,dz=(s.z-state.pos.z)*S;if(Math.abs(dx)<W/2&&Math.abs(dz)<H/2){q.beginPath();q.arc(dx,dz,5*(zoom/2),0,Math.PI*2);q.fill()}}
 q.fillStyle='#f0cf63';for(const h of homePlots){const dx=(h.x-state.pos.x)*S,dz=(h.z-state.pos.z)*S;if(Math.abs(dx)<W/2&&Math.abs(dz)<H/2){q.fillRect(dx-4*(zoom/2),dz-4*(zoom/2),8*(zoom/2),8*(zoom/2))}}
 q.fillStyle='#ff6c7e';for(const e of enemies){const dx=(e.group.position.x-state.pos.x)*S,dz=(e.group.position.z-state.pos.z)*S;if(Math.abs(dx)<W/2&&Math.abs(dz)<H/2){q.beginPath();q.arc(dx,dz,3*(zoom/2),0,Math.PI*2);q.fill()}}
 q.fillStyle='#4ea8ff';for(const p of police){
   const dx=(p.group.position.x-state.pos.x)*S,dz=(p.group.position.z-state.pos.z)*S;
   if(Math.abs(dx)<W/2&&Math.abs(dz)<H/2){
     if(state.wanted>0||tailTheft?.active){
       const ang=p.heading-Math.PI/2,len=20*S;q.fillStyle='rgba(78,168,255,.12)';q.beginPath();q.moveTo(dx,dz);q.arc(dx,dz,len,ang-.34,ang+.34);q.closePath();q.fill();q.fillStyle='#4ea8ff'
     }
     q.beginPath();q.arc(dx,dz,3.5*(zoom/2),0,Math.PI*2);q.fill()
   }
 }
 q.fillStyle='#7ccf9c';for(const n of npcs){const dx=(n.group.position.x-state.pos.x)*S,dz=(n.group.position.z-state.pos.z)*S;if(Math.abs(dx)<W/2&&Math.abs(dz)<H/2){q.beginPath();q.arc(dx,dz,2.3*(zoom/2),0,Math.PI*2);q.fill()}}
 if(selectedNPC?.group?.parent){const dx=(selectedNPC.group.position.x-state.pos.x)*S,dz=(selectedNPC.group.position.z-state.pos.z)*S;q.strokeStyle='#8ee8ff';q.lineWidth=2*(zoom/2);q.beginPath();q.arc(dx,dz,6*(zoom/2),0,Math.PI*2);q.stroke()}
 q.rotate(state.yaw);q.fillStyle='#fff';q.beginPath();q.moveTo(0,-8*(zoom/2));q.lineTo(5*(zoom/2),6*(zoom/2));q.lineTo(0,3*(zoom/2));q.lineTo(-5*(zoom/2),6*(zoom/2));q.closePath();q.fill();q.restore()
}
function drawMap(){renderMapTo($('#minimap'),2.0);if(!$('#mapOverlay').classList.contains('hidden'))renderMapTo($('#bigMinimap'),4.2)}
function updateHUD(){
 const {cx,cz}=currentChunk(),d=districtFor(cx,cz),aq=activeQuest(),prog=Math.min(aq.target,progress(aq.goal));$('#hp').textContent=Math.round(state.hp);$('#armor').textContent=Math.round(state.armor);$('#coins').textContent=state.coins;$('#level').textContent=state.level;$('#wanted').textContent=state.wanted;
 $('#district').textContent=state.interior?'INTÉRIEUR':`${city().name.toUpperCase()} • ${d.name.toUpperCase()}`;$('#missionTitle').textContent=aq.title;$('#missionText').textContent=aq.id==='free'?aq.text:`${aq.text} (${prog}/${aq.target})`;
 const icon=state.weather==='clear'?'☀️':state.weather==='cloudy'?'☁️':'🌧️',period=state.timeOfDay<6||state.timeOfDay>20?'NUIT':state.timeOfDay<9?'MATIN':state.timeOfDay>17?'SOIR':'JOUR';$('#weatherChip').textContent=`${icon} ${period}`;
 maybeCompleteNpcMission();updateTargetHUD()
}


function setupMapUI(){
 const open=()=>{$('#mapOverlay').classList.remove('hidden');drawMap()};
 const close=()=>$('#mapOverlay').classList.add('hidden');
 $('#mapExpandBtn').onclick=open;$('#minimap').onclick=open;$('#closeMapOverlay').onclick=close;$('#mapOverlay').onclick=e=>e.target===$('#mapOverlay')&&close()
}
function setupDesktopControls(){
 document.addEventListener('keydown',e=>{
   if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
   keys[e.code]=true;
   if(e.code==='KeyE'&&currentInteractFn)currentInteractFn();
   if(e.code==='KeyM'){const overlay=$('#mapOverlay');overlay.classList.toggle('hidden');if(!overlay.classList.contains('hidden'))drawMap()}
   if(e.code==='KeyI')openSheet('bag')
 });
 document.addEventListener('keyup',e=>{keys[e.code]=false});
 // Important V9 PC behavior:
 // arrows = movement; camera = right joystick dragged with the mouse.
 // No pointer-lock and no free mouse-look.
}
function makeJoy(baseSel,knobSel,target){
 const b=$(baseSel),k=$(knobSel);let pid=null;
 const mv=e=>{const r=b.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),max=30,len=Math.hypot(dx,dy)||1,nx=clamp(dx/Math.max(len,max),-1,1)*(Math.min(len,max)/max),ny=clamp(dy/Math.max(len,max),-1,1)*(Math.min(len,max)/max);target.x=Math.abs(nx)<.05?0:nx;target.y=Math.abs(ny)<.05?0:ny;k.style.transform=`translate(${target.x*30}px,${target.y*30}px)`};
 const reset=()=>{pid=null;target.x=target.y=0;k.style.transform='translate(0,0)'};
 b.addEventListener('pointerdown',e=>{e.preventDefault();pid=e.pointerId;b.setPointerCapture(pid);mv(e)},{passive:false});
 b.addEventListener('pointermove',e=>{if(e.pointerId===pid){e.preventDefault();mv(e)}},{passive:false});
 b.addEventListener('pointerup',reset);
 b.addEventListener('pointercancel',reset);
 b.addEventListener('pointerleave',reset);
 b.addEventListener('lostpointercapture',reset);
 window.addEventListener('touchend',reset,{passive:true});
 window.addEventListener('touchcancel',reset,{passive:true});
}
makeJoy('#moveJoy','#moveKnob',moveStick);makeJoy('#lookJoy','#lookKnob',lookStick);

function openSheet(panel){
 $('#sheet').classList.remove('hidden');$$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.panel===panel));const t=$('#sheetTitle'),b=$('#sheetBody');
 if(panel==='world'){t.textContent='Monde';b.innerHTML=worldHTML()}
 if(panel==='bag'){t.textContent='Inventaire';b.innerHTML=bagHTML()}
 if(panel==='home'){t.textContent='Base';b.innerHTML=homeHTML()}
 if(panel==='quests'){t.textContent='Quêtes';b.innerHTML=questsHTML()}
 if(panel==='districts'){t.textContent='Quartiers';b.innerHTML=districtHTML()}
 if(panel==='settings'){t.textContent='Réglages';b.innerHTML=settingsHTML()}
 if(panel==='physicalShop'){t.textContent=SHOPS[state.interior.shopType].name;b.innerHTML=physicalShopHTML()}
 bindSheet(panel)
}
function worldHTML(){return `<div class="card"><h3>Exploration chill</h3><p class="sub">Explore sans chronomètre. Les quartiers se chargent au fur et à mesure, avec voitures, habitants, boutiques, appartements, parcs, terrain personnel et secrets.</p></div><div class="card"><h3>Voyager</h3>${CITIES.map(c=>`<button class="menuBtn cityBtn" data-city="${c.id}" style="width:100%;margin-bottom:7px">${c.name}<small>${state.artifacts.includes(c.id)?'✅ Artefact trouvé':c.artifact}</small></button>`).join('')}</div>`}
function bagHTML(){
 const ws=state.ownedWeapons.map(id=>WEAPONS[id]).map(w=>`<div class="item"><div class="itemIcon">${w.icon}</div><div class="itemMain"><b>${w.name}</b><small>${w.damage} dégâts</small></div><button class="menuBtn equip" data-w="${w.id}">${state.equipped===w.id?'Équipé':'Équiper'}</button></div>`).join('');
 const meds=state.inventory.length?state.inventory.map(i=>`<div class="item"><div class="itemIcon">🩹</div><div class="itemMain"><b>Kit de soin</b><small>×${i.qty}</small></div><button class="menuBtn useMed">Utiliser</button></div>`).join(''):'<p class="sub">Aucun consommable.</p>';
 const arts=[...new Set(state.artifactBag)];
 return `<div class="card"><h3>Armes</h3>${ws}</div>
 <div class="card"><h3>Sac ${invCount()}/${state.bagMax}</h3>${meds}</div>
 <div class="card"><h3>Artefacts transportés</h3>${arts.length?arts.map(id=>`<div class="item"><div class="itemIcon">💎</div><div class="itemMain"><b>${artifactLabel(id)}</b><small>×${artifactCount(id)} • valeur 500 crédits pièce en boutique</small></div></div>`).join(''):'<p class="sub">Aucun artefact sur toi.</p>'}</div>
 <div class="card"><h3>Discrétion</h3><p class="sub">${state.pickpockets} vols réussis • ${state.stolenCoins} crédits récupérés dans les poches • niveau de recherche ${state.wanted}/5 • ${state.policeCaught||0} arrestations.</p><p class="sub">Coffre maison : ${state.homeBank||0} crédits • ${state.homeStorage.medkit||0} medkits.</p></div>`
}
function questsHTML(){return `<div class="card"><h3>Progression générale</h3><p class="sub">Niveau ${state.level} • ${state.ownedDistricts.length} quartiers sécurisés • ${state.npcMissions} missions PNJ • ${state.artifacts.length}/${CITIES.length} artefacts.</p></div>${QUESTS.map(q=>{const done=state.completedQuests.includes(q.id),p=Math.min(q.target,progress(q.goal));return `<div class="card"><h3>${done?'✅':'📌'} ${q.title}</h3><p class="sub">${q.text}</p><div class="progress"><i style="width:${p/q.target*100}%"></i></div><p class="sub">${p}/${q.target} • récompense ${q.reward} crédits</p></div>`}).join('')}${state.activeNpcMission?`<div class="card"><h3>Mission de ${state.activeNpcMission.giver}</h3><p class="sub">${state.activeNpcMission.text} — ${Math.min(state.activeNpcMission.target,npcMissionProgress())}/${state.activeNpcMission.target}</p></div>`:''}`}
function districtHTML(){const {cx,cz}=currentChunk(),d=districtFor(cx,cz),id=districtId(cx,cz);return `<div class="card"><h3>${d.name}</h3><p class="sub">${d.bonus}</p><p class="sub">${state.ownedDistricts.includes(id)?'✅ Quartier sécurisé':'Explore une cache puis sécurise le quartier.'}</p><button class="menuBtn green" id="secureDistrict" style="width:100%" ${state.ownedDistricts.includes(id)?'disabled':''}>🏳️ Sécuriser ce quartier</button></div><div class="card"><h3>Conquête</h3><p class="sub">${state.ownedDistricts.length} quartiers sécurisés au total. Ta base te permet de sécuriser tes gains pendant l’aventure.</p></div>`}
function settingsHTML(){return `<div class="card"><h3>Réinitialisation</h3><button class="menuBtn red" id="resetGame">Nouvelle partie</button></div>
<div class="card"><h3>Commandes PC V9</h3><p class="sub">⬆️⬇️⬅️➡️ = déplacement. Pour regarder autour de toi, clique et déplace le <b>joystick REGARDER</b> avec la souris, comme sur téléphone. E = interagir, M = grande carte, I = sac.</p></div>
<div class="warning">V9 : 4 feux par intersection, ville plus dense, maisons et ruelles, PNJ avec bras couleur peau, visages stabilisés et déplacements avec vrais virages.</div>`}
function bindSheet(panel){
 if(panel==='world')$$('.cityBtn').forEach(b=>b.onclick=()=>switchCity(b.dataset.city));
 if(panel==='bag'){$$('.equip').forEach(b=>b.onclick=()=>{state.equipped=b.dataset.w;weaponRig.visible=b.dataset.w!=='fists';save();openSheet('bag')});$$('.useMed').forEach(b=>b.onclick=useMed)}
 if(panel==='home'){
   const buyBtn=$('#buyLandBtn'); if(buyBtn)buyBtn.onclick=buyLand;
   const enterBtn=$('#enterHomeBtn'); if(enterBtn)enterBtn.onclick=()=>{closeSheet();enterInterior('home',{})};
   const up=$('#upgradeHome'); if(up)up.onclick=upgradeHome;
   const rest=$('#restHome'); if(rest)rest.onclick=restAtHome;
   $$('.placeHome').forEach(b=>b.onclick=()=>placeHomeItem(b.dataset.id));
   const storeBtn=$('#storeAllHome'); if(storeBtn)storeBtn.onclick=storeAllHome;
   $$('.deposit50').forEach(b=>b.onclick=()=>depositCoins(50));$$('.withdraw50').forEach(b=>b.onclick=()=>withdrawCoins(50));
   $$('.depositMed').forEach(b=>b.onclick=depositMedkit);$$('.withdrawMed').forEach(b=>b.onclick=withdrawMedkit)
 }
 if(panel==='districts'){const x=$('#secureDistrict'); if(x)x.onclick=secureDistrict}
 if(panel==='settings')$('#resetGame').onclick=()=>{if(confirm('Effacer toute la partie ?')){localStorage.removeItem('sq3d-v9');location.reload()}};
 if(panel==='physicalShop')bindShop()
}
function switchCity(id){clearTarget(false);state.cityId=id;state.pos={x:2,z:8};state.yaw=0;state.pitch=0;for(const[k]of[...chunks])unload(k);ensureChunks(true);save();closeSheet();toast(`Bienvenue à ${city().name}`)}
function useMed(){const x=state.inventory.find(i=>i.id==='medkit');if(!x)return toast('Aucun kit');if(state.hp>=state.maxHp)return toast('PV déjà au maximum');x.qty--;state.hp=clamp(state.hp+40,0,state.maxHp);if(x.qty<=0)state.inventory=state.inventory.filter(i=>i!==x);save();openSheet('bag')}
function closeSheet(){$('#sheet').classList.add('hidden')}
let toastTimer;function toast(m){const t=$('#toast');t.textContent=m;t.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.add('hidden'),2200)}



$('#scanBtn').onclick=scan;$('#interactBtn').onclick=()=>currentInteractFn?currentInteractFn():toast(selectedNPC?'Suis ta cible : quand tu es bien derrière, la fouille démarre automatiquement.':'Touche un passant pour le sélectionner, ou approche-toi d’un objet.');$('#clearTarget').onclick=()=>clearTarget();$('#attackBtn').onclick=attack;$('#fleeBtn').onclick=flee;$('#menuBtn').onclick=()=>openSheet('world');$('#closeSheet').onclick=closeSheet;$('#sheet').onclick=e=>e.target===$('#sheet')&&closeSheet();$$('.nav').forEach(b=>b.onclick=()=>openSheet(b.dataset.panel));
document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});document.addEventListener('gesturechange',e=>e.preventDefault(),{passive:false});document.addEventListener('gestureend',e=>e.preventDefault(),{passive:false});document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});document.addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault()},{passive:false});document.addEventListener('touchstart',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>document.hidden&&save());
init();