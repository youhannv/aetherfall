const THREE_URL='https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
let THREE=null;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),choice=a=>a[Math.floor(Math.random()*a.length)];
const CHUNK=72,LOAD=1,UNLOAD=2,RADIUS=.34;
const DISTRICTS=[
 {id:'docks',name:'Les Docks',tier:'poor',style:'poor',bonus:'Loyers bas • délinquance élevée',wealth:.48,rentMult:.58,buyMult:.56,policeRate:.045,crimeRate:.18,density:1.42,cashMult:.62,itemMult:.72,propertyDemand:.72},
 {id:'popular',name:'Quartier Populaire',tier:'working',style:'old',bonus:'Immobilier accessible • vie de quartier',wealth:.72,rentMult:.78,buyMult:.76,policeRate:.075,crimeRate:.12,density:1.30,cashMult:.82,itemMult:.88,propertyDemand:.86},
 {id:'central',name:'Centre',tier:'mid',style:'central',bonus:'Commerces • prix soutenus',wealth:1.0,rentMult:1.05,buyMult:1.10,policeRate:.11,crimeRate:.075,density:1.18,cashMult:1.0,itemMult:1.0,propertyDemand:1.0},
 {id:'garden',name:'Quartier des Jardins',tier:'rich',style:'green',bonus:'Calme • maisons • police présente',wealth:1.35,rentMult:1.38,buyMult:1.48,policeRate:.16,crimeRate:.038,density:.88,cashMult:1.42,itemMult:1.22,propertyDemand:1.15},
 {id:'heights',name:'Les Hauteurs',tier:'luxury',style:'luxury',bonus:'Très riche • villas • très surveillé',wealth:1.78,rentMult:1.88,buyMult:2.05,policeRate:.22,crimeRate:.018,density:.70,cashMult:1.90,itemMult:1.42,propertyDemand:1.28},
 {id:'workshops',name:'Faubourg des Ateliers',tier:'working',style:'industrial',bonus:'Entrepôts • maisons modestes',wealth:.68,rentMult:.72,buyMult:.70,policeRate:.07,crimeRate:.13,density:1.34,cashMult:.78,itemMult:.90,propertyDemand:.82}
];
const PROPERTY_TYPES={
 studio:{name:'Studio',icon:'🚪',baseArea:24,areaVar:10,rooms:1,baseRent:42,baseBuy:620},
 flat2:{name:'Appartement T2',icon:'🏢',baseArea:43,areaVar:14,rooms:2,baseRent:68,baseBuy:1080},
 flat3:{name:'Appartement T3',icon:'🏢',baseArea:67,areaVar:20,rooms:3,baseRent:102,baseBuy:1780},
 house:{name:'Maison',icon:'🏠',baseArea:88,areaVar:34,rooms:4,baseRent:145,baseBuy:2850},
 villa:{name:'Villa',icon:'🏡',baseArea:150,areaVar:70,rooms:6,baseRent:285,baseBuy:6100}
};
function districtTierLabel(d){return d.tier==='poor'?'POPULAIRE / PAUVRE':d.tier==='working'?'MODESTE':d.tier==='rich'?'AISÉ':d.tier==='luxury'?'TRÈS RICHE':'CENTRAL'}
function districtTierClass(d){return d.tier==='poor'?'districtPoor':d.tier==='working'||d.tier==='mid'?'districtMid':d.tier==='rich'?'districtRich':'districtLuxury'}

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


const CONSUMABLES={
 water:{id:'water',name:"Bouteille d’eau",icon:'💧',price:3,thirst:42,hunger:0,hygiene:0,desc:'+42 soif'},
 sandwich:{id:'sandwich',name:'Sandwich',icon:'🥪',price:6,thirst:0,hunger:34,hygiene:0,desc:'+34 faim'},
 meal:{id:'meal',name:'Repas complet',icon:'🍲',price:11,thirst:8,hunger:62,hygiene:0,desc:'+62 faim'},
 soda:{id:'soda',name:'Soda',icon:'🥤',price:4,thirst:28,hunger:5,hygiene:0,desc:'+28 soif'},
 hygieneKit:{id:'hygieneKit',name:"Kit d’hygiène",icon:'🧼',price:8,thirst:0,hunger:0,hygiene:40,desc:'+40 propreté'}
};

const STREET_ITEMS={
 phone:{id:'phone',name:'Téléphone',icon:'📱',value:95},
 watch:{id:'watch',name:'Montre',icon:'⌚',value:80},
 earbuds:{id:'earbuds',name:'Écouteurs',icon:'🎧',value:55},
 ring:{id:'ring',name:'Bague',icon:'💍',value:130},
 camera:{id:'camera',name:'Petit appareil photo',icon:'📷',value:110},
 glasses:{id:'glasses',name:'Lunettes',icon:'🕶️',value:45},
 perfume:{id:'perfume',name:'Parfum',icon:'🧴',value:65},
 walletItem:{id:'walletItem',name:'Portefeuille',icon:'👛',value:35}
};
const STREET_ITEM_IDS=Object.keys(STREET_ITEMS);
function itemInfo(id){return id==='medkit'?{id:'medkit',name:'Kit de soin',icon:'🩹',value:0}:CONSUMABLES[id]||STREET_ITEMS[id]||{id,name:id,icon:'📦',value:0}}

const SHOPS={
 corner:{name:'Épicerie Nova',icon:'🛒',stock:[
  {id:'water',name:"Bouteille d’eau",icon:'💧',price:3,desc:'+42 soif'},
  {id:'sandwich',name:'Sandwich',icon:'🥪',price:6,desc:'+34 faim'},
  {id:'meal',name:'Repas complet',icon:'🍲',price:11,desc:'+62 faim'},
  {id:'soda',name:'Soda',icon:'🥤',price:4,desc:'+28 soif'},
  {id:'hygieneKit',name:"Kit d’hygiène",icon:'🧼',price:8,desc:'+40 propreté'},
  {id:'medkit',name:'Kit de soin',icon:'🩹',price:28,desc:'+40 PV'}
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
SHOPS.housing={name:'Agence Habitat',icon:'🔑',stock:[]};
SHOPS.pawn={name:'Comptoir Seconde Main',icon:'🏪',stock:[
  {id:'medkit',name:'Kit de soin',icon:'🩹',price:60,desc:'+40 PV'},
  {id:'bag',name:'Sac renforcé',icon:'🎒',price:260,desc:'+5 places'}
]};
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
const HOME_PLOT_PRICE=1800;
const HOME_UPGRADE_COST={2:650,3:1450};
const QUESTS=[
 {id:'welcome',title:'Premier billet',text:'Gagne ou récupère 100 crédits.',goal:'coinsEarned',target:100,reward:60},
 {id:'roof',title:'Un toit',text:'Loue ton premier studio.',goal:'housingStage',target:1,reward:100},
 {id:'helper',title:'Bon voisin',text:'Accomplis une mission donnée par un PNJ.',goal:'npcMissions',target:1,reward:140},
 {id:'explorer',title:'Explorateur',text:'Découvre 6 quartiers.',goal:'districtsSeen',target:6,reward:180},
 {id:'treasure',title:'Chasseur de caches',text:'Ouvre 5 coffres ou poubelles.',goal:'containersOpened',target:5,reward:160},
 {id:'conquer',title:'Conquête tranquille',text:'Sécurise 3 quartiers en réalisant leurs objectifs.',goal:'districtsOwned',target:3,reward:350}
];
const base={
 cityId:'paris',hp:100,maxHp:100,armor:0,coins:0,level:1,xp:0,wanted:0,
 pos:{x:2,z:8},yaw:0,pitch:0,inventory:[],bagMax:20,ownedWeapons:['fists'],equipped:'fists',
 stealth:0,scanner:0,collected:[],artifacts:[],kills:0,pickpockets:0,coinsEarned:0,stolenCoins:0,
 npcMissions:0,containersOpened:0,ownedDistricts:[],seenDistricts:[],completedQuests:[],
 activeNpcMission:null,timeOfDay:9.5,weather:'clear',interior:null,returnPos:null,policeCaught:0,
 landOwned:false,housingStage:0,homeLevel:1,homeBank:0,homeStorage:{medkit:0},homeStock:[],homePlaced:[],reputation:0,restCount:0,artifactBag:[],discoveredShops:[],hunger:70,thirst:70,hygiene:60,worldLayoutVersion:120,
 gameDay:1,gameMonth:1,propertyCatalog:[],propertyPortfolio:[],residenceId:null,propertyCredit:0,monthlyLedger:'',missedRent:0
};
let state=loadState();
function loadState(){
 try{
   let raw=JSON.parse(localStorage.getItem('sq3d-v12')||'null');
   let migrated=false;
   if(!raw){
     raw=JSON.parse(localStorage.getItem('sq3d-v11')||'{}');
     migrated=!!Object.keys(raw).length
   }
   const loaded={
     ...structuredClone(base),...raw,
     pos:{...base.pos,...(raw.pos||{})},
     homeStorage:{...base.homeStorage,...(raw.homeStorage||{})},
     homeStock:raw.homeStock||[],homePlaced:raw.homePlaced||[],
     artifactBag:raw.artifactBag||[],discoveredShops:raw.discoveredShops||[],
     propertyCatalog:raw.propertyCatalog||[],propertyPortfolio:raw.propertyPortfolio||[]
   };
   if(loaded.interior){
     loaded.pos=raw.returnPos&&Number.isFinite(raw.returnPos.x)&&Number.isFinite(raw.returnPos.z)?{x:raw.returnPos.x,z:raw.returnPos.z}:{...base.pos};
     loaded.interior=null;loaded.returnPos=null
   }
   if(migrated){
     const oldStage=raw.housingStage||0;
     loaded.propertyCredit=(raw.propertyCredit||0)+(oldStage===1?180:oldStage===2?1030:oldStage>=3?2830:0);
     loaded.housingStage=0;loaded.landOwned=false;
     loaded.propertyPortfolio=[];loaded.propertyCatalog=[];loaded.residenceId=null;
     loaded.worldLayoutVersion=120
   }
   if(raw.worldLayoutVersion!==120){
     loaded.discoveredShops=[];loaded.propertyCatalog=[];loaded.worldLayoutVersion=120
   }
   return loaded
 }catch{return structuredClone(base)}
}
function save(){
 const snapshot={...state};
 if(state.interior){
   snapshot.pos=state.returnPos?{...state.returnPos}:{...base.pos};
   snapshot.interior=null;snapshot.returnPos=null
 }
 localStorage.setItem('sq3d-v12',JSON.stringify(snapshot))
}
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
function districtFor(cx,cz){
 if(cx===0&&cz===0)return DISTRICTS.find(d=>d.id==='central');
 if(cx>=1&&cx<=2&&cz>=-1&&cz<=1)return DISTRICTS.find(d=>d.id==='garden');
 if(cx<=-1&&cx>=-2&&cz>=-1&&cz<=1)return DISTRICTS.find(d=>d.id==='docks');
 if(cz<=-1&&cz>=-2&&Math.abs(cx)<=1)return DISTRICTS.find(d=>d.id==='popular');
 if(cz>=1&&cz<=2&&Math.abs(cx)<=1)return DISTRICTS.find(d=>d.id==='heights');
 const rx=Math.floor(cx/2),rz=Math.floor(cz/2),idx=hashStr(`${state.cityId}:district:${rx}:${rz}`)%DISTRICTS.length;
 return DISTRICTS[idx]
}
function districtId(cx,cz){return `${state.cityId}:${cx}:${cz}`}
function progress(goal){if(goal==='stolenCoins')return state.stolenCoins;if(goal==='coinsEarned')return state.coinsEarned;if(goal==='npcMissions')return state.npcMissions;if(goal==='districtsSeen')return state.seenDistricts.length;if(goal==='containersOpened')return state.containersOpened;if(goal==='districtsOwned')return state.ownedDistricts.length;if(goal==='housingStage')return state.housingStage||0;return 0}
function activeQuest(){return QUESTS.find(q=>!state.completedQuests.includes(q.id))||{id:'free',title:'Légende urbaine',text:'Explore librement, collectionne les artefacts et sécurise les quartiers.',goal:'districtsOwned',target:999}}
function checkQuests(){for(const q of QUESTS){if(state.completedQuests.includes(q.id))continue;if(progress(q.goal)>=q.target){state.completedQuests.push(q.id);state.coins+=q.reward;toast(`Quête terminée : ${q.title} +${q.reward} crédits`)}}}

let scene,camera,renderer,clock,textures={},chunks=new Map(),colliders=[],interiorColliders=[],pickups=[],shops=[],apartments=[],properties=[],containers=[],npcs=[],enemies=[],police=[],cars=[],hidingZones=[],homePlots=[],trafficLights=[],alleys=[],clouds=[];
let activeEnemy=null,activeEnemyEntity=null,moveStick={x:0,y:0},lookStick={x:0,y:0},weaponRig=null,interiorGroup=null,lastChunkTick=0,lastMapTick=0,lastWeatherTick=0,selectedNPC=null,targetMarker=null,tailTheft=null,policeSeeing=false,hiddenTimer=0,lastCarHit=0,rainSystem=null,raycaster=null,tapStart=null,currentInteractFn=null,lastViewportHeight=window.innerHeight,keys={},lastPromptSig='',lastToastMessage='',lastToastAt=0,playerTrail=[],selectedProperty=null,bigMapZoom=.42,interiorBounds={x:8.5,z:8.5};

async function init(){
 try{THREE=await import(THREE_URL)}catch{return toast('Connexion requise au premier lancement du moteur 3D')}
 // Extra recovery guard for older saves or interrupted updates.
 if(state.interior){
   state.pos=state.returnPos&&Number.isFinite(state.returnPos.x)&&Number.isFinite(state.returnPos.z)?{...state.returnPos}:{...base.pos};
   state.interior=null;state.returnPos=null;save()
 }
 const host=$('#threeHost');scene=new THREE.Scene();scene.background=new THREE.Color(0x5f7898);scene.fog=new THREE.Fog(0x5f7898,68,230);
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
 ensureChunks(true);ensureOutdoorPositionClear();updateHUD();animate();
 addEventListener('resize',()=>{camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)});
 if(window.visualViewport){
   const syncViewport=()=>{const h=Math.round(window.visualViewport.height);if(Math.abs(h-lastViewportHeight)>12){lastViewportHeight=h;camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);lookStick.x=0;lookStick.y=0}}
   visualViewport.addEventListener('resize',syncViewport);visualViewport.addEventListener('scroll',syncViewport)
 }
 addEventListener('blur',()=>{moveStick.x=moveStick.y=lookStick.x=lookStick.y=0});
}
function tex(draw,rx=4,ry=4){const c=document.createElement('canvas');c.width=c.height=256;const q=c.getContext('2d');draw(q,256,256);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}

function createTextures(){
 const asphalt=tex(q=>{
   const g=q.createLinearGradient(0,0,256,256);g.addColorStop(0,'#1a2631');g.addColorStop(.55,'#243340');g.addColorStop(1,'#16222c');
   q.fillStyle=g;q.fillRect(0,0,256,256);
   for(let i=0;i<2600;i++){const c=45+Math.random()*35;q.fillStyle=`rgba(${c},${c+8},${c+18},${.08+Math.random()*.18})`;q.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*2,1+Math.random()*2)}
   for(let i=0;i<14;i++){q.strokeStyle='rgba(140,220,255,.05)';q.lineWidth=1+Math.random()*1.6;q.beginPath();q.moveTo(Math.random()*256,Math.random()*256);q.lineTo(Math.random()*256,Math.random()*256);q.stroke()}
 },5,5);
 const pave=tex(q=>{
   q.fillStyle='#aeb8c1';q.fillRect(0,0,256,256);
   for(let y=0;y<=256;y+=28){q.strokeStyle='rgba(79,95,110,.65)';q.lineWidth=2;q.beginPath();q.moveTo(0,y);q.lineTo(256,y);q.stroke()}
   for(let x=0;x<=256;x+=28){q.beginPath();q.moveTo(x,0);q.lineTo(x,256);q.stroke()}
   for(let i=0;i<280;i++){q.fillStyle='rgba(255,255,255,.10)';q.fillRect(Math.random()*256,Math.random()*256,2,2)}
 },6,6);
 const grass=tex(q=>{
   q.fillStyle='#365845';q.fillRect(0,0,256,256);
   for(let i=0;i<2900;i++){q.fillStyle=Math.random()>.5?'#4d7a5d':'#294d38';q.fillRect(Math.random()*256,Math.random()*256,1,2+Math.random()*3)}
 },7,7);
 const brick=tex(q=>{
   q.fillStyle='#5d4a50';q.fillRect(0,0,256,256);q.strokeStyle='#3e3035';q.lineWidth=1.5;
   for(let y=0;y<256;y+=18){q.beginPath();q.moveTo(0,y);q.lineTo(256,y);q.stroke();for(let x=(y/18)%2?14:0;x<256;x+=28){q.beginPath();q.moveTo(x,y);q.lineTo(x,y+18);q.stroke()}}
   for(let y=7;y<250;y+=34)for(let x=8;x<248;x+=32){const col=Math.random()>.45?'#d1c2a0':'#7db4d5';q.fillStyle=col;q.fillRect(x,y,13,16);q.fillStyle='rgba(8,18,26,.55)';q.fillRect(x+1,y+1,11,2)}
 },3,4);
 const modern=tex(q=>{
   const gr=q.createLinearGradient(0,0,256,256);gr.addColorStop(0,'#486985');gr.addColorStop(.5,'#7ca8c5');gr.addColorStop(1,'#24384c');
   q.fillStyle=gr;q.fillRect(0,0,256,256);
   for(let y=6;y<252;y+=24){for(let x=6;x<252;x+=22){q.fillStyle=Math.random()>.32?'#c6f6ff':'#13293b';q.fillRect(x,y,14,16);q.fillStyle='rgba(255,255,255,.14)';q.fillRect(x+1,y+1,12,2)}}
   for(let y=0;y<256;y+=42){q.fillStyle='rgba(125,238,255,.11)';q.fillRect(0,y,256,2)}
 },3,4);
 const stone=tex(q=>{
   const gr=q.createLinearGradient(0,0,256,0);gr.addColorStop(0,'#bbb6ae');gr.addColorStop(1,'#938d86');q.fillStyle=gr;q.fillRect(0,0,256,256);
   q.strokeStyle='rgba(109,104,99,.7)';q.lineWidth=1.5;
   for(let y=0;y<256;y+=24){q.beginPath();q.moveTo(0,y);q.lineTo(256,y);q.stroke()}
   for(let x=0;x<256;x+=40){q.beginPath();q.moveTo(x,0);q.lineTo(x,256);q.stroke()}
 },3,4);
 const neonGlass=tex(q=>{
   const gr=q.createLinearGradient(0,0,256,256);gr.addColorStop(0,'#102131');gr.addColorStop(.55,'#23455e');gr.addColorStop(1,'#0b1a28');
   q.fillStyle=gr;q.fillRect(0,0,256,256);
   for(let y=9;y<250;y+=20)for(let x=10;x<248;x+=20){q.fillStyle=Math.random()>.26?'#9fe8ff':'#102336';q.fillRect(x,y,12,12);q.fillStyle='rgba(140,255,255,.18)';q.fillRect(x,y+12,12,1)}
   q.fillStyle='rgba(138,111,255,.14)';for(let y=0;y<256;y+=56)q.fillRect(0,y,256,2);
 },3,4);
 const panel=tex(q=>{
   q.fillStyle='#738194';q.fillRect(0,0,256,256);
   for(let y=0;y<256;y+=32){for(let x=0;x<256;x+=32){q.strokeStyle='rgba(20,31,45,.35)';q.strokeRect(x+1,y+1,30,30);q.fillStyle=Math.random()>.5?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)';q.fillRect(x+3,y+3,26,26)}}
   q.fillStyle='rgba(120,225,255,.08)';q.fillRect(0,30,256,3);q.fillRect(0,158,256,3);
 },3,4);
 const residential=tex(q=>{
   q.fillStyle='#7c7167';q.fillRect(0,0,256,256);
   for(let y=14;y<246;y+=30)for(let x=16;x<240;x+=30){q.fillStyle=Math.random()>.36?'#d7dfd7':'#5a7185';q.fillRect(x,y,14,14);q.fillStyle='rgba(20,20,20,.38)';q.fillRect(x+2,y+2,10,2)}
   q.fillStyle='rgba(255,255,255,.06)';for(let y=0;y<256;y+=60)q.fillRect(0,y,256,2)
 },3,4);
 return{asphalt,pave,grass,brick,modern,stone,neonGlass,panel,residential}
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
 const roadM=new THREE.MeshStandardMaterial({map:textures.asphalt,roughness:state.weather==='rain'?.52:.88,metalness:state.weather==='rain'?.18:.05});
 const paveM=new THREE.MeshStandardMaterial({map:textures.pave,roughness:.96});
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

 const curbM=new THREE.MeshStandardMaterial({color:0xc4c8cd,roughness:1});
 const curbs=[
  [x0+roadW+.08,z0+(CHUNK+roadW)/2,.18,CHUNK-roadW],
  [x0+CHUNK-.08,z0+(CHUNK+roadW)/2,.18,CHUNK-roadW],
  [x0+(CHUNK+roadW)/2,z0+roadW+.08,CHUNK-roadW,.18],
  [x0+(CHUNK+roadW)/2,z0+CHUNK-.08,CHUNK-roadW,.18]
 ];
 for(const c of curbs){const m=new THREE.Mesh(new THREE.BoxGeometry(c[2],.16,c[3]),curbM);m.position.set(c[0],.08,c[1]);g.add(m)}

 const laneMat=new THREE.MeshBasicMaterial({color:0xf3f1de});
 for(let i=0;i<6;i++){
   let m=new THREE.Mesh(new THREE.PlaneGeometry(.16,4.2),laneMat);m.rotation.x=-Math.PI/2;m.position.set(x0+roadW/2,.028,z0+20+i*8.5);g.add(m);
   m=new THREE.Mesh(new THREE.PlaneGeometry(4.2,.16),laneMat);m.rotation.x=-Math.PI/2;m.position.set(x0+20+i*8.5,.029,z0+roadW/2);g.add(m)
 }

 const zebra=new THREE.MeshBasicMaterial({color:0xffffff});
 for(let k=0;k<8;k++){
   let s=new THREE.Mesh(new THREE.PlaneGeometry(roadW-.75,.56),zebra);s.rotation.x=-Math.PI/2;s.position.set(x0+roadW/2,.038,z0+12.75+k*.83);g.add(s);
   let t=new THREE.Mesh(new THREE.PlaneGeometry(.56,roadW-.75),zebra);t.rotation.x=-Math.PI/2;t.position.set(x0+12.75+k*.83,.039,z0+roadW/2);g.add(t)
 }

 let stop=new THREE.Mesh(new THREE.PlaneGeometry(roadW-.6,.28),laneMat);stop.rotation.x=-Math.PI/2;stop.position.set(x0+roadW/2,.041,z0+11.75);g.add(stop);
 stop=new THREE.Mesh(new THREE.PlaneGeometry(.28,roadW-.6),laneMat);stop.rotation.x=-Math.PI/2;stop.position.set(x0+11.75,.042,z0+roadW/2);g.add(stop);

 const neoLine=new THREE.MeshBasicMaterial({color:0x69d7ff});
 const segs=[[x0+15.5,z0+15.5,3,.12],[x0+15.5,z0+56.5,3,.12],[x0+56.5,z0+15.5,.12,3],[x0+56.5,z0+56.5,.12,3]];
 for(const s of segs){const m=new THREE.Mesh(new THREE.PlaneGeometry(s[2],s[3]),neoLine);m.rotation.x=-Math.PI/2;m.position.set(s[0],.058,s[1]);g.add(m)}

 for(const [lx,lz] of [[15,21],[15,53],[42,15],[61,15],[69,38],[38,69]])addLamp(g,x0+lx,z0+lz);
 addBench(g,x0+18,z0+20);

 // V13: slimmer poles placed inside the sidewalk corners, avoiding overlap with buildings.
 addTrafficLight(g,x0+13.35,z0+13.35,'vertical',Math.PI);
 addTrafficLight(g,x0+1.05,z0+13.35,'vertical',0);
 addTrafficLight(g,x0+13.35,z0+1.05,'horizontal',Math.PI/2);
 addTrafficLight(g,x0+1.05,z0+1.05,'horizontal',-Math.PI/2)
}
function addTrafficLight(g,x,z,axis,rot=0){
 const group=new THREE.Group(),metal=new THREE.MeshStandardMaterial({color:0x20272e,metalness:.65,roughness:.35});
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,2.9,10),metal);pole.position.y=1.45;group.add(pole);
 const arm=new THREE.Mesh(new THREE.BoxGeometry(.42,.08,.08),metal);arm.position.set(0,2.45,.18);group.add(arm);
 const box=new THREE.Mesh(new THREE.BoxGeometry(.34,.88,.28),new THREE.MeshStandardMaterial({color:0x0f151a,roughness:.55,metalness:.18}));box.position.set(0,2.46,.28);group.add(box);
 const hoodMat=new THREE.MeshStandardMaterial({color:0x0a0f13,roughness:.8});
 for(const yy of [2.69,2.25]){const hood=new THREE.Mesh(new THREE.BoxGeometry(.2,.1,.09),hoodMat);hood.position.set(0,yy,.42);group.add(hood)}
 const mkLens=(y,col)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.05,16),new THREE.MeshBasicMaterial({color:col}));m.rotation.x=Math.PI/2;m.position.set(0,y,.42);group.add(m);return m};
 const red=mkLens(2.69,0x5a1a21),green=mkLens(2.25,0x173e29);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(.13,.15,.12,10),new THREE.MeshStandardMaterial({color:0x2b343c,roughness:.8}));base.position.y=.06;group.add(base);
 group.position.set(x,0,z);group.rotation.y=rot;g.add(group);trafficLights.push({group,red,green,axis})
}


function plannedShopType(cx,cz){
 const fixed={
  '0,0':'corner',
  '1,0':'housing',
  '-1,0':'pawn',
  '0,1':'home',
  '0,-1':'gear',
  '1,1':'rare'
 };
 const fk=`${cx},${cz}`;if(fixed[fk])return fixed[fk];
 // About one commercial block every 5 chunks, deterministic.
 const h=hashStr(`${state.cityId}:shop-plan:${cx}:${cz}`);
 if(h%100>=19)return null;
 const pool=['corner','corner','gear','pawn','home','rare'];
 return pool[(h>>>8)%pool.length]
}
function generateIrregularLots(x0,z0,r,startChunk,d){
 const zones=[[17,40,17,40],[46,69,17,40],[17,40,46,69],[46,69,46,69]],out=[];
 for(let qi=0;qi<zones.length;qi++){
   if(startChunk&&qi===3)continue;
   const [xmin,xmax,zmin,zmax]=zones[qi];
   const baseCount=d.tier==='luxury'?1:d.tier==='rich'?1+(r()<.45?1:0):d.tier==='poor'?3+Math.floor(r()*2):2+Math.floor(r()*2);
   const wanted=Math.max(1,Math.round(baseCount*d.density));
   let made=0,tries=0;
   const minDist=d.tier==='luxury'?12.5:d.tier==='rich'?11.2:d.tier==='poor'?7.3:8.4;
   while(made<wanted&&tries++<55){
     const x=x0+xmin+2.2+r()*(xmax-xmin-4.4),z=z0+zmin+2.2+r()*(zmax-zmin-4.4);
     if(out.some(p=>Math.hypot(p.x-x,p.z-z)<minDist))continue;
     out.push({x,z,qi,variant:Math.floor(r()*5)});made++
   }
 }
 return out
}

function createChunk(cx,cz){
 const key=ck(cx,cz);if(chunks.has(key))return;
 const r=rngFor(key),g=new THREE.Group();g.userData={key,cx,cz};scene.add(g);chunks.set(key,g);
 const x0=cx*CHUNK,z0=cz*CHUNK,d=districtFor(cx,cz);
 const grass=new THREE.Mesh(new THREE.PlaneGeometry(CHUNK,CHUNK),new THREE.MeshStandardMaterial({map:textures.grass,roughness:1}));
 grass.rotation.x=-Math.PI/2;grass.position.set(x0+CHUNK/2,-.04,z0+CHUNK/2);g.add(grass);
 makeRoad(g,x0,z0);addAlleyNetwork(g,key,x0,z0,d,r);
 const id=districtId(cx,cz);if(!state.seenDistricts.includes(id))state.seenDistricts.push(id);

 const startChunk=cx===0&&cz===0;
 const plannedShop=plannedShopType(cx,cz);
 const lots=generateIrregularLots(x0,z0,r,startChunk,d);
 let shopIndex=plannedShop?Math.floor(r()*Math.max(1,lots.length)):-1;

 // Start block keeps the grocery away from the player's house plot.
 if(startChunk&&plannedShop&&lots.length)shopIndex=Math.min(lots.length-1,0);

 lots.forEach((p,i)=>{
   if(plannedShop&&i===shopIndex){addShop(g,key,p.x,p.z,r,plannedShop);return}
   if(d.style==='green'&&r()<.13){addPocketGarden(g,key,p.x,p.z,r);return}
   addDenseBuilding(g,key,p.x,p.z,d,r,i,p.variant)
 });

 if(startChunk)addHomePlot(g,key,x0+58,z0+58);

 const trees=2+Math.floor(r()*(d.style==='green'?7:4));
 for(let i=0;i<trees;i++){const p=randomGreenPoint(x0,z0,r);if(!entityBlocked(p.x,p.z,1.1))addTree(g,p.x,p.z,r)}
 for(let i=0;i<(d.style==='green'?5:2);i++){const p=randomGreenPoint(x0,z0,r);if(!entityBlocked(p.x,p.z,.9))addBush(g,key,p.x,p.z,r)}

 const cont=1+Math.floor(r()*3);
 for(let i=0;i<cont;i++){const p=r()<.42?randomAlleyPoint(x0,z0,r):randomSidewalk(x0,z0,r),type=r()<.72?'bin':'chest',idc=`${key}:container:${i}`;if(!state.collected.includes(idc))addContainer(g,key,idc,p.x,p.z,type)}
 const lootN=1+Math.floor(r()*3);
 for(let i=0;i<lootN;i++){const p=r()<.38?randomAlleyPoint(x0,z0,r):randomSidewalk(x0,z0,r),type=r()<.67?'medkit':'rare',idl=`${key}:loot:${i}`;if(!state.collected.includes(idl))addPickup(g,key,idl,p.x,p.z,type)}
 if(!state.artifacts.includes(state.cityId)&&((Math.abs(cx)+Math.abs(cz)>1&&r()<.055)||(cx===3&&cz===-2))){
   const p=randomAlleyPoint(x0,z0,r),idl=`${key}:artifact`;if(!state.collected.includes(idl))addPickup(g,key,idl,p.x,p.z,'artifact')
 }

 const npcN=4+Math.floor(r()*4)+(d.tier==='luxury'?2:0);
 for(let i=0;i<npcN;i++){const p=randomPedestrianPath(x0,z0,r);p.district=d.id;addNPC(g,key,p.x,p.z,r,p)}
 if(r()<d.crimeRate){const p=randomPedestrianPath(x0,z0,r);p.district=d.id;addEnemy(g,key,p.x,p.z,r,p)}
 const policeN=d.policeRate>.18?2:(r()<d.policeRate*5?1:0);
 for(let i=0;i<policeN;i++){const p=randomPedestrianPath(x0,z0,r);p.district=d.id;addPolice(g,key,p.x,p.z,r,p)}

 const trafficBase=d.style==='central'?5:d.tier==='luxury'?3:d.tier==='poor'?4:d.style==='green'?3:4;
 const carN=trafficBase+Math.floor(r()*3);for(let i=0;i<carN;i++)addCar(g,key,x0,z0,r,i);
 if(r()<.48)addParkedCar(g,key,x0,z0,r)
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
 if(r()<.72){
   const route=[
    {x:x0+12.5,z:z0+18},{x:x0+12.5,z:z0+32},{x:x0+12.5,z:z0+50},{x:x0+12.5,z:z0+67},
    {x:x0+28,z:z0+70.5},{x:x0+48,z:z0+70.5},{x:x0+67,z:z0+70.5},
    {x:x0+70.5,z:z0+60},{x:x0+70.5,z:z0+40},{x:x0+70.5,z:z0+18},
    {x:x0+58,z:z0+12.5},{x:x0+38,z:z0+12.5},{x:x0+18,z:z0+12.5}
   ];
   const idx=Math.floor(r()*route.length),p=route[idx];return{x:p.x,z:p.z,route,routeIndex:(idx+1)%route.length}
 }
 const route=[
  {x:x0+43,z:z0+18},{x:x0+43,z:z0+30},{x:x0+43,z:z0+43},
  {x:x0+55,z:z0+43},{x:x0+67,z:z0+43},{x:x0+55,z:z0+43},
  {x:x0+43,z:z0+43},{x:x0+43,z:z0+56},{x:x0+43,z:z0+67},
  {x:x0+43,z:z0+56},{x:x0+43,z:z0+43},{x:x0+30,z:z0+43},{x:x0+19,z:z0+43}
 ];
 const idx=Math.floor(r()*route.length),p=route[idx];return{x:p.x,z:p.z,route,routeIndex:(idx+1)%route.length}
}
function randomGreenPoint(x0,z0,r){return{x:x0+22+r()*(CHUNK-31),z:z0+22+r()*(CHUNK-31)}}

function addAlleyNetwork(g,key,x0,z0,d,r){
 const alleyM=new THREE.MeshStandardMaterial({map:textures.pave,roughness:1});
 const v=new THREE.Mesh(new THREE.PlaneGeometry(4.4,52),alleyM);v.rotation.x=-Math.PI/2;v.position.set(x0+43,.055,z0+43);g.add(v);
 const h=new THREE.Mesh(new THREE.PlaneGeometry(52,4.4),alleyM);h.rotation.x=-Math.PI/2;h.position.set(x0+43,.056,z0+43);g.add(h);
 alleys.push({key,axis:'z',x:x0+43,min:z0+17,max:z0+69,width:3.1});
 alleys.push({key,axis:'x',z:z0+43,min:x0+17,max:x0+69,width:3.1});
 if(r()<.62){
   const branch=new THREE.Mesh(new THREE.PlaneGeometry(18,3.0),new THREE.MeshStandardMaterial({color:0x77766f,roughness:1}));
   branch.rotation.x=-Math.PI/2;branch.position.set(x0+52,.057,z0+32);g.add(branch);
   alleys.push({key,axis:'x',z:z0+32,min:x0+43,max:x0+61,width:2.4})
 }
}

function makePropertyListing(key,x,z,isHouse,d,r,serial=0){
 const id=`${key}:property:${serial}:${Math.round(x)}:${Math.round(z)}`;
 const pr=rngFor(id);
 let type;
 if(isHouse){
   if(d.tier==='luxury')type=pr()<.62?'villa':'house';
   else type=pr()<.86?'house':'flat3'
 }else{
   const roll=pr();
   if(d.tier==='poor')type=roll<.52?'studio':roll<.88?'flat2':'flat3';
   else if(d.tier==='luxury')type=roll<.18?'flat2':roll<.68?'flat3':'villa';
   else type=roll<.34?'studio':roll<.76?'flat2':'flat3'
 }
 const t=PROPERTY_TYPES[type],area=Math.round(t.baseArea+pr()*t.areaVar);
 const quality=.82+pr()*.36+(d.wealth-1)*.12;
 const rent=Math.max(12,Math.round(t.baseRent*d.rentMult*(area/t.baseArea)*quality));
 const buyPrice=Math.max(220,Math.round(t.baseBuy*d.buyMult*(area/t.baseArea)*quality/10)*10);
 const rooms=type==='studio'?1:type==='flat2'?2:type==='flat3'?3:type==='house'?4+Math.floor(pr()*2):6+Math.floor(pr()*3);
 return{id,cityId:state.cityId,key,cx:Math.floor(x/CHUNK),cz:Math.floor(z/CHUNK),x,z,type,area,rooms,rent,buyPrice,districtId:d.id,districtName:d.name,tier:d.tier,demand:d.propertyDemand}
}
function rememberProperty(p){
 const i=state.propertyCatalog.findIndex(x=>x.id===p.id);
 if(i<0)state.propertyCatalog.push({...p});else state.propertyCatalog[i]={...state.propertyCatalog[i],...p}
}
function addPropertyEntrance(g,key,x,z,dep,isHouse,d,r,serial){
 const p=makePropertyListing(key,x,z-dep/2-.82,isHouse,d,r,serial);
 const door=new THREE.Mesh(new THREE.PlaneGeometry(isHouse?1.05:1.45,isHouse?2.15:2.45),new THREE.MeshStandardMaterial({color:isHouse?0x553b2d:0x42362f,roughness:.82}));
 door.position.set(x,1.15,z-dep/2-.014);door.rotation.y=Math.PI;g.add(door);
 const plaque=makeFacadeSign(`${PROPERTY_TYPES[p.type].icon} ${p.area}m²`,'#d8f7ff');plaque.scale.set(.34,.34,.34);plaque.position.set(x,2.52,z-dep/2-.028);g.add(plaque);
 properties.push({...p,key,doorX:x,doorZ:p.z});rememberProperty(p)
}
function portfolioRecord(id){return state.propertyPortfolio.find(p=>p.id===id)||null}
function propertyFromCatalog(id){return state.propertyCatalog.find(p=>p.id===id)||properties.find(p=>p.id===id)||null}
function propertyAcquired(p){return !!portfolioRecord(p.id)}


function addDenseBuilding(g,key,x,z,d,r,i,variant=0){
 const central=d.style==='central',green=d.style==='green',poor=d.style==='poor',lux=d.style==='luxury';
 const houseChance=lux?.78:green?.66:poor?.14:d.style==='old'?.38:.20;
 const isHouse=r()<houseChance;
 const scale=[.76,.92,1.08,.86,1.16][variant]||1;
 const w=(isHouse?(lux?8.8:6.3)+r()*(lux?4.8:2.6):(poor?5.8:6.7)+r()*(poor?2.4:3.8))*scale;
 const dep=(isHouse?(lux?8.5:6.2)+r()*(lux?5.0:2.7):(poor?6.2:7.0)+r()*3.2)*(variant===2?.86:1);
 const h=isHouse?(lux?5.4+r()*4.6:4.0+r()*3.3):(central?14+r()*34:lux?16+r()*30:poor?8+r()*14:9+r()*20);
 x+=(r()-.5)*(lux?3.9:2.4);z+=(r()-.5)*(lux?3.9:2.4);
 const texChoice=poor?choice([textures.brick,textures.residential,textures.panel]):lux?choice([textures.neonGlass,textures.stone,textures.modern]):central?choice([textures.neonGlass,textures.modern,textures.panel]):d.style==='industrial'?choice([textures.panel,textures.stone,textures.modern]):choice([textures.residential,textures.brick,textures.modern]);
 const isGlass=texChoice===textures.neonGlass||texChoice===textures.modern;
 const bodyMat=new THREE.MeshStandardMaterial({map:texChoice,roughness:isGlass?.32:.82,metalness:isGlass?.22:.05,emissive:isGlass?0x0f2236:0x000000,emissiveIntensity:isGlass?.22:0});
 const styleRoll=!isHouse?Math.floor(r()*4):0;
 const main=new THREE.Mesh(new THREE.BoxGeometry(w,h,dep),bodyMat);main.position.set(x,h/2,z);g.add(main);
 if(!isHouse&&styleRoll===1&&h>16){const crown=new THREE.Mesh(new THREE.BoxGeometry(w*.72,Math.max(3,h*.14),dep*.72),bodyMat);crown.position.set(x,h+Math.max(1.5,h*.07),z);g.add(crown)}
 if(!isHouse&&styleRoll===2&&h>14){const podium=new THREE.Mesh(new THREE.BoxGeometry(w*1.16,3.2,dep*1.12),new THREE.MeshStandardMaterial({map:textures.panel,roughness:.72,metalness:.1}));podium.position.set(x,1.6,z);g.add(podium)}
 if(!isHouse&&styleRoll===3&&h>18){for(const sx of [-1,1]){const fin=new THREE.Mesh(new THREE.BoxGeometry(.2,h*.72,dep*.9),new THREE.MeshStandardMaterial({color:0x83dfff,emissive:0x2d5a71,emissiveIntensity:.55}));fin.position.set(x+sx*(w/2+.18),h*.48,z);g.add(fin)}}
 addBuildingDetails(g,x,z,w,dep,h,r,d,isHouse,styleRoll);
 if(isHouse){
   const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,dep)*.70,1.38+r()*(lux?1.0:.5),4),new THREE.MeshStandardMaterial({color:lux?choice([0x434d59,0x4d4a63,0x31424b]):choice([0x5f4942,0x495663,0x4d4d58]),roughness:.86}));
   roof.rotation.y=Math.PI/4;roof.position.set(x,h+.72,z);g.add(roof);
   const porch=new THREE.Mesh(new THREE.BoxGeometry(Math.min(2.4,w*.34),.15,1.0),new THREE.MeshStandardMaterial({color:0xa6daff,emissive:0x17354a,emissiveIntensity:.32}));porch.position.set(x,2.2,z-dep/2-.08);g.add(porch);
   if(lux){
     const lawn=new THREE.Mesh(new THREE.PlaneGeometry(w+4,dep+4),new THREE.MeshStandardMaterial({map:textures.grass,roughness:1}));lawn.rotation.x=-Math.PI/2;lawn.position.set(x,.018,z);g.add(lawn);
     if(r()<.7)addTree(g,x+w/2+1.3,z,r)
   }
 }
 colliders.push({key,minX:x-w/2-.30,maxX:x+w/2+.30,minZ:z-dep/2-.30,maxZ:z+dep/2+.30,type:isHouse?'house':'building'});
 const propChance=isHouse?.94:(poor?.42:lux?.72:.56);
 if(r()<propChance)addPropertyEntrance(g,key,x,z,dep,isHouse,d,r,i)
}
function addBuildingDetails(g,x,z,w,d,h,r,dist,isHouse=false,styleRoll=0){
 const accent=dist.tier==='luxury'?0xb79bff:dist.style==='central'?0x80e2ff:dist.style==='poor'?0xffb78a:0x8df0b3;
 const roof=new THREE.Mesh(new THREE.BoxGeometry(w*.34,.65,d*.3),new THREE.MeshStandardMaterial({color:0x424b57,roughness:.72,metalness:.18}));roof.position.set(x,h+.34,z);g.add(roof);
 const cornice=new THREE.Mesh(new THREE.BoxGeometry(w+.12,.18,d+.12),new THREE.MeshStandardMaterial({color:0x67717a,roughness:.8}));cornice.position.set(x,h-.08,z);g.add(cornice);
 if(!isHouse){
   const stripMat=new THREE.MeshStandardMaterial({color:accent,emissive:accent,emissiveIntensity:.32,roughness:.24,metalness:.2});
   if(h>12){for(let fy=3.6;fy<h-2;fy+=Math.max(4.8,Math.min(8.5,h/4))){const band=new THREE.Mesh(new THREE.BoxGeometry(w*.86,.1,.09),stripMat);band.position.set(x,fy,z-d/2-.03);g.add(band);const band2=band.clone();band2.position.z=z+d/2+.03;g.add(band2)}}
   if(styleRoll===0&&h>14){for(const sx of [-1,1]){const col=new THREE.Mesh(new THREE.BoxGeometry(.16,h*.85,.12),stripMat);col.position.set(x+sx*(w/2-.18),h*.46,z-d/2-.06);g.add(col)}}
   if(styleRoll===1&&h>18){const cap=new THREE.Mesh(new THREE.CylinderGeometry(Math.min(w,d)*.16,Math.min(w,d)*.16,1.2,12),new THREE.MeshStandardMaterial({color:0xa9dfff,emissive:0x27465a,emissiveIntensity:.35,roughness:.38}));cap.position.set(x,h+1.0,z);g.add(cap)}
   if(dist.style==='old'&&h>12){for(let fy=4;fy<h-2;fy+=5){const balcony=new THREE.Mesh(new THREE.BoxGeometry(w*.32,.10,.72),new THREE.MeshStandardMaterial({color:0x4d5358,metalness:.18,roughness:.7}));balcony.position.set(x,fy,z-d/2-.37);g.add(balcony)}}
 }
}
function addPocketGarden(g,key,x,z,r){
 const p=new THREE.Mesh(new THREE.PlaneGeometry(8,8),new THREE.MeshStandardMaterial({map:textures.grass,roughness:1}));p.rotation.x=-Math.PI/2;p.position.set(x,.06,z);g.add(p);
 addTree(g,x-1.7,z-1.6,r);addBush(g,key,x+1.4,z+1.3,r);addBench(g,x-1.3,z+1.8)
}

function addParkedCar(g,key,x0,z0,r){
 const group=createCarVisual(choice([0x2d506d,0x7c4242,0x4b4f55,0x657954]));group.scale.set(.9,.9,.9);group.position.set(x0+18+r()*32,0,z0+15.4);group.rotation.y=-Math.PI/2;g.add(group)
}
function addHomePlot(g,key,x,z){
 const plot=new THREE.Group();
 const grass=new THREE.Mesh(new THREE.PlaneGeometry(16,14),new THREE.MeshStandardMaterial({color:0x4e744a,roughness:1}));grass.rotation.x=-Math.PI/2;grass.position.set(0,.03,0);plot.add(grass);
 const path=new THREE.Mesh(new THREE.PlaneGeometry(2.5,5.4),new THREE.MeshStandardMaterial({color:0xc8bea7,roughness:1}));path.rotation.x=-Math.PI/2;path.position.set(0,.04,-4.4);plot.add(path);

 const fenceM=new THREE.MeshStandardMaterial({color:0x8a6547,roughness:.95});
 const fenceParts=[
   [0,.55,7,16,.28],
   [-8,.55,0,.28,14],[8,.55,0,.28,14],
   [-4.9,.55,-7,6.2,.28],[4.9,.55,-7,6.2,.28]
 ];
 fenceParts.forEach(f=>{const m=new THREE.Mesh(new THREE.BoxGeometry(f[3],1.1,f[4]),fenceM);m.position.set(f[0],f[1],f[2]);plot.add(m)});
 // Physics for fence, with a real gate opening at the south side.
 colliders.push({key,minX:x-8.15,maxX:x-7.75,minZ:z-7,maxZ:z+7,type:'fence'});
 colliders.push({key,minX:x+7.75,maxX:x+8.15,minZ:z-7,maxZ:z+7,type:'fence'});
 colliders.push({key,minX:x-8,maxX:x+8,minZ:z+6.85,maxZ:z+7.15,type:'fence'});
 colliders.push({key,minX:x-8,maxX:x-1.8,minZ:z-7.15,maxZ:z-6.85,type:'fence'});
 colliders.push({key,minX:x+1.8,maxX:x+8,minZ:z-7.15,maxZ:z-6.85,type:'fence'});

 const sign=makeSign(state.landOwned?`🏠 CHEZ TOI N.${state.homeLevel}`:`🏡 TERRAIN ${HOME_PLOT_PRICE}`,'#9ef1ff');sign.position.set(0,3.3,-6.25);plot.add(sign);

 let doorZ=z-7.55;
 if(state.landOwned){
   const lv=state.homeLevel||1,w=lv===1?5:lv===2?7:9,d=lv===1?5:lv===2?6.5:8,h=lv===1?3.2:lv===2?4.2:5.0;
   const house=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({map:lv===1?textures.stone:textures.brick,roughness:.92}));house.position.set(0,h/2,.7);plot.add(house);
   const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.72,1.25,4),new THREE.MeshStandardMaterial({color:0x4a4f53,roughness:.9}));roof.rotation.y=Math.PI/4;roof.position.set(0,h+.62,.7);plot.add(roof);
   const door=new THREE.Mesh(new THREE.PlaneGeometry(1.15,2.05),new THREE.MeshStandardMaterial({color:0x513a29}));door.position.set(0,1.05,.7-d/2-.012);door.rotation.y=Math.PI;plot.add(door);
   if(lv>=2){for(const sx of [-2,2]){const win=new THREE.Mesh(new THREE.PlaneGeometry(1.15,.9),new THREE.MeshStandardMaterial({color:0x8fc8df,metalness:.2,roughness:.2}));win.position.set(sx,2.2,.7-d/2-.018);win.rotation.y=Math.PI;plot.add(win)}}
   // The house itself is solid.
   colliders.push({key,minX:x-w/2-.25,maxX:x+w/2+.25,minZ:z+.7-d/2-.25,maxZ:z+.7+d/2+.25,type:'playerHome'});
   doorZ=z+.7-d/2-.9
 }
 plot.position.set(x,0,z);g.add(plot);
 homePlots.push({key,x,z:state.landOwned?doorZ:z-7.55,centerX:x,centerZ:z,price:HOME_PLOT_PRICE})
}
function makeSign(text,color='#ffdb77'){const c=document.createElement('canvas');c.width=512;c.height=128;const q=c.getContext('2d');q.fillStyle='#10222a';q.fillRect(0,0,512,128);q.fillStyle=color;q.font='bold 44px system-ui';q.textAlign='center';q.textBaseline='middle';q.fillText(text,256,64);const t=new THREE.CanvasTexture(c),s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true}));s.scale.set(5.2,1.3,1);return s}


function makeFacadeSign(text,color='#9fe9ff'){
 const c=document.createElement('canvas');c.width=512;c.height=120;const q=c.getContext('2d');
 q.clearRect(0,0,c.width,c.height);
 q.fillStyle='rgba(7,18,29,.84)';q.fillRect(10,18,492,84);
 q.strokeStyle='rgba(126,208,255,.35)';q.lineWidth=4;q.strokeRect(10,18,492,84);
 q.fillStyle='rgba(157,139,255,.14)';q.fillRect(10,18,492,12);
 q.fillStyle=color;q.font='700 34px system-ui';q.textAlign='center';q.textBaseline='middle';q.fillText(text,c.width/2,62);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(4.2,.9),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide,depthWrite:false}));
 m.rotation.y=Math.PI;return m
}



function addShop(g,key,x,z,r,forcedType=null){
 const pool=Object.keys(SHOPS),type=forcedType||choice(pool),shop=SHOPS[type],group=new THREE.Group();
 const shopColor={corner:0x1e5f56,gear:0x46576d,rare:0x56408b,pawn:0x1d6072,home:0x5a4d76,housing:0x5b6947}[type]||0x3e5567;
 const body=new THREE.Mesh(new THREE.BoxGeometry(10,5.4,9),new THREE.MeshStandardMaterial({color:shopColor,roughness:.42,metalness:.18}));body.position.y=2.7;group.add(body);
 const trim=new THREE.Mesh(new THREE.BoxGeometry(10.25,.22,9.25),new THREE.MeshStandardMaterial({color:0x8fe4ff,emissive:0x23495f,emissiveIntensity:.45,roughness:.35}));trim.position.set(0,5.05,0);group.add(trim);
 const frame=new THREE.Mesh(new THREE.BoxGeometry(5.4,3.3,.16),new THREE.MeshStandardMaterial({color:0x0c1720,metalness:.35,roughness:.55}));frame.position.set(0,1.75,-4.56);group.add(frame);
 const glass=new THREE.Mesh(new THREE.PlaneGeometry(4.7,2.7),new THREE.MeshStandardMaterial({color:0xb6eeff,transparent:true,opacity:.40,metalness:.55,roughness:.10}));glass.position.set(0,1.75,-4.66);glass.rotation.y=Math.PI;group.add(glass);
 const awning=new THREE.Mesh(new THREE.BoxGeometry(6.2,.18,1.0),new THREE.MeshStandardMaterial({color:type==='corner'?0x63d7a7:type==='gear'?0xff8a69:type==='housing'?0xffde77:0xa98dff,emissive:0x0d1320,roughness:.35}));awning.position.set(0,3.35,-4.82);group.add(awning);
 const sign=makeFacadeSign(`${shop.icon} ${shop.name}`);sign.position.set(0,4.45,-4.53);group.add(sign);
 if(type==='rare'||type==='gear'){const holo=new THREE.Mesh(new THREE.PlaneGeometry(1.0,1.0),new THREE.MeshBasicMaterial({color:type==='rare'?0xb28fff:0x7de5ff,transparent:true,opacity:.22,side:THREE.DoubleSide}));holo.position.set(3.1,2.1,-4.68);holo.rotation.y=Math.PI;group.add(holo)}
 group.position.set(x,0,z);g.add(group);
 colliders.push({key,minX:x-5.2,maxX:x+5.2,minZ:z-4.7,maxZ:z+4.7,type:'shop'});
 shops.push({key,x,z,type,group,door:{x,z:z-5.05}});
 const sid=`${state.cityId}:${Math.round(x)}:${Math.round(z)}:${type}`;
 if(!state.discoveredShops.some(s=>s.id===sid))state.discoveredShops.push({id:sid,cityId:state.cityId,x,z,type})
}

function addApartmentDoor(g,key,x,z,dep){/* V12: replaced by physical property entrances */}
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
 const face=new THREE.Mesh(new THREE.PlaneGeometry(.235,.235),new THREE.MeshBasicMaterial({map:ft,transparent:true,depthWrite:false,alphaTest:.04,side:THREE.DoubleSide}));
 face.position.set(0,1.71,-.247);face.rotation.y=Math.PI;face.renderOrder=10;group.add(face);
 // 3D nose fallback makes the face direction obvious even if the texture is tiny.
 const nose=new THREE.Mesh(new THREE.ConeGeometry(.022,.065,7),skin);nose.rotation.x=-Math.PI/2;nose.position.set(0,1.69,-.265);group.add(nose);

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

 const socio=districtFor(Math.floor(x/CHUNK),Math.floor(z/CHUNK));
 const hasCash=r()<clamp(.34+socio.wealth*.20,.32,.82);
 const pocketItems=[];
 if(r()<clamp(.48*socio.itemMult,.30,.88))pocketItems.push(choice(STREET_ITEM_IDS));
 if(r()<clamp(.16*socio.itemMult,.07,.42))pocketItems.push(choice(STREET_ITEM_IDS));
 if(r()<clamp(.045*socio.itemMult,.02,.17))pocketItems.push(choice(STREET_ITEM_IDS));
 const n={
   key,group,role,hostile,isPolice,
   axis:path?.axis||(r()<.5?'x':'z'),pathMin:path?.min??null,pathMax:path?.max??null,
   route:path?.route||null,routeIndex:path?.routeIndex||0,
   speed:.55+r()*.55,dir:r()<.5?-1:1,home:{x,z},
   money:hasCash?Math.max(1,Math.round((2+r()*38)*socio.cashMult)):0,pocketItems,
   legs:[l1,l2],arms:[a1,a2],phase:r()*6.2,
   name:isPolice?choice(['Brigadier Morel','Agent Diaz','Agent Leroy']):(hostile?'Rôdeur hostile':choice(['Lina','Noah','Maya','Nino','Sara','Eliott','Inès','Adam','Jade','Milo'])),
   missionGiven:false,caught:false,pickpocketed:false,heading:0,alertness:75+r()*45,chasing:false,lastSeen:0,aggroTime:0,lastHit:0,calledPolice:false,following:false,trust:.25+r()*.7,courage:.2+r()*.75,followDoubt:r()*.55,routeStuck:0,followStuck:0,lastSafe:{x,z}
 };
 group.traverse(o=>{o.userData.person=n;o.frustumCulled=false});
 return n
}
function createCarVisual(color,kind='car'){
 const group=new THREE.Group();
 const dims=kind==='van'?[1.9,.86,4.15]:kind==='compact'?[1.55,.58,3.05]:kind==='taxi'?[1.72,.62,3.55]:[1.75,.62,3.55];
 const body=new THREE.Mesh(new THREE.BoxGeometry(dims[0],dims[1],dims[2]),new THREE.MeshStandardMaterial({color,metalness:.35,roughness:.38}));body.position.y=.66;group.add(body);
 const top=new THREE.Mesh(new THREE.BoxGeometry(dims[0]*.82,kind==='van'?.78:.58,dims[2]*.5),new THREE.MeshStandardMaterial({color:0x7893a5,transparent:true,opacity:.72,metalness:.3,roughness:.15}));top.position.set(0,kind==='van'?1.38:1.18,-.18);group.add(top);
 const lampM=new THREE.MeshBasicMaterial({color:0xfff0bc});
 for(const x of [-dims[0]*.33,dims[0]*.33]){const lamp=new THREE.Mesh(new THREE.BoxGeometry(.28,.16,.05),lampM);lamp.position.set(x,.72,-dims[2]/2-.01);group.add(lamp)}
 for(const x of [-dims[0]*.41,dims[0]*.41])for(const z of [-dims[2]*.31,dims[2]*.31]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.27,.27,.18,10),new THREE.MeshStandardMaterial({color:0x151719,roughness:1}));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.34,z);group.add(wheel)}
 if(kind==='taxi'){const sign=new THREE.Mesh(new THREE.BoxGeometry(.55,.17,.28),new THREE.MeshBasicMaterial({color:0xffd85e}));sign.position.set(0,1.58,0);group.add(sign)}
 return group
}
function addCar(g,key,x0,z0,r,i){
 const mode=r()<.5?'v':'h',dir=r()<.5?-1:1;
 const kind=r()<.18?'van':r()<.42?'compact':r()<.58?'taxi':'car';
 const colors=kind==='taxi'?[0xd9bd39,0xe4c447]:[0xc44b4b,0x4b6fc4,0x444b52,0xe0d3b4,0x4f9c68,0x9c7443,0x6a5b9c];
 const group=createCarVisual(choice(colors),kind);
 if(mode==='v'){
   const laneX=dir>0?x0+3.2:x0+7.8;
   group.position.set(laneX,0,z0+16+(i%4)*13);
   group.rotation.y=dir>0?Math.PI:0
 }else{
   const laneZ=dir>0?z0+7.8:z0+3.2;
   group.position.set(x0+16+(i%4)*13,0,laneZ);
   group.rotation.y=dir>0?-Math.PI/2:Math.PI/2
 }
 g.add(group);
 const baseSpeed=kind==='van'?3.3:kind==='compact'?5.4:kind==='taxi'?4.8:4.2;
 cars.push({key,group,mode,dir,kind,speed:baseSpeed+r()*1.45,lastHit:0,turnCooldown:1+Math.random()*1.5,turnSeed:r()})
}

function unload(key){
 const g=chunks.get(key);if(!g)return;
 if(selectedNPC?.key===key)clearTarget();
 scene.remove(g);chunks.delete(key);
 colliders=colliders.filter(x=>x.key!==key);pickups=pickups.filter(x=>x.userData.key!==key);shops=shops.filter(x=>x.key!==key);apartments=apartments.filter(x=>x.key!==key);properties=properties.filter(x=>x.key!==key);containers=containers.filter(x=>x.userData.key!==key);npcs=npcs.filter(x=>x.key!==key);enemies=enemies.filter(x=>x.key!==key);police=police.filter(x=>x.key!==key);cars=cars.filter(x=>x.key!==key);hidingZones=hidingZones.filter(x=>x.key!==key);homePlots=homePlots.filter(x=>x.key!==key);trafficLights=trafficLights.filter(x=>x.group.parent!==g);alleys=alleys.filter(x=>x.key!==key)
}
function ensureChunks(force=false){if(state.interior)return;const {cx,cz}=currentChunk();for(let x=cx-LOAD;x<=cx+LOAD;x++)for(let z=cz-LOAD;z<=cz+LOAD;z++)createChunk(x,z);for(const[k,g]of chunks){if(Math.abs(g.userData.cx-cx)>UNLOAD||Math.abs(g.userData.cz-cz)>UNLOAD)unload(k)}if(force)drawMap()}
function collides(x,z){
 if(state.interior)return Math.abs(x)>interiorBounds.x||Math.abs(z)>interiorBounds.z||interiorColliders.some(c=>x+RADIUS>c.minX&&x-RADIUS<c.maxX&&z+RADIUS>c.minZ&&z-RADIUS<c.maxZ);
 return colliders.some(c=>x+RADIUS>c.minX&&x-RADIUS<c.maxX&&z+RADIUS>c.minZ&&z-RADIUS<c.maxZ)
}
function blockedByPerson(x,z){
 for(const n of [...npcs,...police,...enemies]){
   if(!n?.group?.parent)continue;
   if(Math.hypot(x-n.group.position.x,z-n.group.position.z)<.62)return true
 }
 return false
}
function entityBlocked(x,z,pad=.3){return colliders.some(c=>x+pad>c.minX&&x-pad<c.maxX&&z+pad>c.minZ&&z-pad<c.maxZ)}
function movePlayer(dx,dz){const nx=state.pos.x+dx,nz=state.pos.z+dz;if(!collides(nx,state.pos.z)&&!blockedByPerson(nx,state.pos.z))state.pos.x=nx;if(!collides(state.pos.x,nz)&&!blockedByPerson(state.pos.x,nz))state.pos.z=nz}
function moveEntity(n,dx,dz,pad=.28){
 const step=Math.hypot(dx,dz);if(step<.00001)return true;
 const tries=[
   [dx,dz],
   [dx*.70-dz*.72,dz*.70+dx*.72],
   [dx*.70+dz*.72,dz*.70-dx*.72],
   [-dz,dz?dx:step],
   [dz,dz?-dx:-step]
 ];
 for(const [tx,tz] of tries){
   let moved=false,x=n.group.position.x,z=n.group.position.z;
   if(!entityBlocked(x+tx,z,pad)){n.group.position.x=x+tx;moved=true}
   x=n.group.position.x;z=n.group.position.z;
   if(!entityBlocked(x,z+tz,pad)){n.group.position.z=z+tz;moved=true}
   if(moved){n.stuckFrames=0;return true}
 }
 n.stuckFrames=(n.stuckFrames||0)+1;
 // A waypoint can occasionally sit just behind street furniture.
 // Skip it after repeated failed steering instead of freezing forever.
 if(n.stuckFrames>24&&n.route?.length){
   n.routeIndex=(n.routeIndex+1)%n.route.length;n.stuckFrames=0
 }
 return false
}
function updateCamera(t=0){const bob=(Math.abs(moveStick.x)+Math.abs(moveStick.y)>.15)?Math.sin(t*.012)*.022:0;camera.position.set(state.pos.x,1.72+bob,state.pos.z);const cp=Math.cos(state.pitch),sp=Math.sin(state.pitch),sy=Math.sin(state.yaw),cy=Math.cos(state.yaw);camera.lookAt(state.pos.x+sy*cp,1.72+sp+bob,state.pos.z-cy*cp)}

function spendFromFunds(amount){
 let left=amount;
 const fromBank=Math.min(state.homeBank,left);state.homeBank-=fromBank;left-=fromBank;
 const fromCoins=Math.min(state.coins,left);state.coins-=fromCoins;left-=fromCoins;
 return left<=0
}
function processMonthlyFinances(){
 let income=0,expense=0,events=[];
 const rentRec=state.propertyPortfolio.find(p=>p.id===state.residenceId&&p.tenure==='rent');
 if(rentRec){
   if(spendFromFunds(rentRec.rent)){expense+=rentRec.rent;state.missedRent=0;events.push(`loyer -${rentRec.rent}`)}
   else{
     state.missedRent=(state.missedRent||0)+1;events.push('loyer IMPAYÉ');
     if(state.missedRent>=2){
       state.propertyPortfolio=state.propertyPortfolio.filter(p=>p.id!==rentRec.id);state.residenceId=null;state.missedRent=0;events.push('expulsion')
     }
   }
 }
 for(const rec of state.propertyPortfolio.filter(p=>p.tenure==='owned'&&p.listed)){
   const market=rec.marketRent||rec.rent||40,ratio=(rec.askingRent||market)/market;
   if(!rec.tenant){
     const chance=clamp((rec.demand||1)*(1.28-ratio)*.78,.08,.90);
     if(Math.random()<chance){rec.tenant=true;events.push(`locataire trouvé : ${rec.label||'bien'}`)}
   }
   if(rec.tenant){
     if(ratio>1.42&&Math.random()<.30){rec.tenant=false;events.push(`locataire parti : ${rec.label||'bien'}`)}
     else{const got=rec.askingRent||market;state.homeBank+=got;income+=got}
   }
 }
 state.monthlyLedger=`Mois ${state.gameMonth} : +${income} / -${expense}${events.length?' • '+events.join(' • '):''}`;
 if(income||expense||events.length)toast(`📅 ${state.monthlyLedger}`);
 save()
}
function advanceDay(days=1){
 for(let i=0;i<days;i++){
   state.gameDay=(state.gameDay||1)+1;
   if(state.gameDay>30){state.gameDay=1;state.gameMonth=(state.gameMonth||1)+1;processMonthlyFinances()}
 }
}

function updateWorldLight(dt){
 const prevTime=state.timeOfDay;state.timeOfDay=(state.timeOfDay+dt*.025)%24;if(state.timeOfDay<prevTime)advanceDay(1);
 const sun=scene.getObjectByName('sun'),hemi=scene.children.find(x=>x.isHemisphereLight),day=Math.max(.06,Math.sin((state.timeOfDay-6)/24*Math.PI*2)*.5+.5);
 sun.intensity=.12+day*1.95;hemi.intensity=.28+day*1.9;
 const cloudDim=state.weather==='cloudy'?.78:state.weather==='rain'?.58:1;
 sun.intensity*=cloudDim;
 const sky=new THREE.Color().setRGB(.03+.32*day*cloudDim,.05+.42*day*cloudDim,.08+.56*day*cloudDim);scene.background.copy(sky);scene.fog.color.copy(sky);
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
   if(newKey!==c.key&&chunks.has(newKey)){chunks.get(newKey).add(c.group);c.key=newKey}
   const localX=c.group.position.x-x0,localZ=c.group.position.z-z0;

   if(c.mode==='v'){
     const laneX=c.dir>0?x0+3.2:x0+7.8;c.group.position.x+=(laneX-c.group.position.x)*Math.min(1,dt*8);
     // Red-light stop lines are before the pedestrian crossing.
     const stopAt=c.dir>0?z0+CHUNK-2.4:z0+13.2;
     const distance=c.dir>0?stopAt-c.group.position.z:c.group.position.z-stopAt;
     const mustStop=!verticalGreen&&distance>=0&&distance<6.2;
     if(mustStop){
       if(c.dir>0)c.group.position.z=Math.min(c.group.position.z,stopAt);
       else c.group.position.z=Math.max(c.group.position.z,stopAt)
     }else{
       c.group.position.z+=c.dir*c.speed*dt
     }

     // Turn only once the vehicle has entered the intersection on green.
     const turnZone=c.dir>0?(localZ<7&&localZ>3):(localZ<8&&localZ>3);
     if(verticalGreen&&turnZone&&c.turnCooldown<=0&&Math.random()<.035){
       const right=c.turnSeed<.62;
       if(c.dir>0){c.mode='h';c.dir=right?-1:1;c.group.position.z=right?z0+3.2:z0+7.8}
       else{c.mode='h';c.dir=right?1:-1;c.group.position.z=right?z0+7.8:z0+3.2}
       c.turnCooldown=2.8;c.turnSeed=Math.random()
     }
     c.group.rotation.y=c.dir>0?Math.PI:0
   }else{
     const laneZ=c.dir>0?z0+7.8:z0+3.2;c.group.position.z+=(laneZ-c.group.position.z)*Math.min(1,dt*8);
     const stopAt=c.dir>0?x0+CHUNK-2.4:x0+13.2;
     const distance=c.dir>0?stopAt-c.group.position.x:c.group.position.x-stopAt;
     const mustStop=verticalGreen&&distance>=0&&distance<6.2;
     if(mustStop){
       if(c.dir>0)c.group.position.x=Math.min(c.group.position.x,stopAt);
       else c.group.position.x=Math.max(c.group.position.x,stopAt)
     }else{
       c.group.position.x+=c.dir*c.speed*dt
     }

     const turnZone=c.dir>0?(localX<7&&localX>3):(localX<8&&localX>3);
     if(!verticalGreen&&turnZone&&c.turnCooldown<=0&&Math.random()<.035){
       const right=c.turnSeed<.62;
       if(c.dir>0){c.mode='v';c.dir=right?1:-1;c.group.position.x=right?x0+3.2:x0+7.8}
       else{c.mode='v';c.dir=right?-1:1;c.group.position.x=right?x0+7.8:x0+3.2}
       c.turnCooldown=2.8;c.turnSeed=Math.random()
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
   let target=n.route[n.routeIndex%n.route.length];
   let dx=target.x-n.group.position.x,dz=target.z-n.group.position.z,dist=Math.hypot(dx,dz);
   if(dist<.48){
     n.routeIndex=(n.routeIndex+1)%n.route.length;
     target=n.route[n.routeIndex];dx=target.x-n.group.position.x;dz=target.z-n.group.position.z;dist=Math.hypot(dx,dz)
   }
   if(dist>.001){
     const sx=dx/dist*n.speed*dt,sz=dz/dist*n.speed*dt;
     if(moveEntity(n,sx,sz,.29)){
       n.routeStuck=0;n.lastSafe={x:n.group.position.x,z:n.group.position.z};setHeading(n,sx,sz)
     }else{
       n.routeStuck+=dt;
       if(n.routeStuck>1.15){
         // Route nodes themselves are generated only on clear pedestrian lanes.
         n.routeIndex=(n.routeIndex+1)%n.route.length;
         if(n.lastSafe&&!entityBlocked(n.lastSafe.x,n.lastSafe.z,.3)){
           n.group.position.set(n.lastSafe.x,0,n.lastSafe.z)
         }
         n.routeStuck=0
       }
     }
   }
   return
 }
 const dx=n.axis==='x'?n.dir*n.speed*dt:0,dz=n.axis==='z'?n.dir*n.speed*dt:0;
 if(moveEntity(n,dx,dz,.29))setHeading(n,dx,dz);else n.dir*=-1
}
function updatePlayerTrail(){
 if(state.interior)return;
 const last=playerTrail[playerTrail.length-1];
 if(!last||Math.hypot(state.pos.x-last.x,state.pos.z-last.z)>.62){
   playerTrail.push({x:state.pos.x,z:state.pos.z});
   if(playerTrail.length>150){
     playerTrail.shift();
     for(const n of npcs)if(n.following)n.followTrailIndex=Math.max(0,(n.followTrailIndex||0)-1)
   }
 }
}
function updateFollower(n,dt){
 const pd=Math.hypot(state.pos.x-n.group.position.x,state.pos.z-n.group.position.z);
 if(pd>20){n.following=false;removeFollowMarker(n);toast(`${n.name} t’a perdu.`);return}
 if(pd<1.25){n.followStuck=0;return}
 if(!playerTrail.length)updatePlayerTrail();
 n.followTrailIndex=Math.min(n.followTrailIndex||0,Math.max(0,playerTrail.length-1));
 let target=playerTrail[n.followTrailIndex]||state.pos;
 let dx=target.x-n.group.position.x,dz=target.z-n.group.position.z,dist=Math.hypot(dx,dz);
 if(dist<.75&&n.followTrailIndex<playerTrail.length-1){
   n.followTrailIndex++;
   target=playerTrail[n.followTrailIndex]||state.pos;
   dx=target.x-n.group.position.x;dz=target.z-n.group.position.z;dist=Math.hypot(dx,dz)
 }
 if(dist>.08){
   const sx=dx/(dist||1)*n.speed*1.34*dt,sz=dz/(dist||1)*n.speed*1.34*dt;
   if(moveEntity(n,sx,sz,.29)){n.followStuck=0;n.lastSafe={x:n.group.position.x,z:n.group.position.z};setHeading(n,sx,sz)}
   else{
     n.followStuck+=dt;
     if(n.followStuck>1.4){
       // Rare recovery: put the follower back on a recent walkable breadcrumb.
       const idx=Math.max(0,playerTrail.length-7),p=playerTrail[idx];
       if(p&&!entityBlocked(p.x,p.z,.35)){n.group.position.set(p.x,0,p.z);n.followTrailIndex=idx}
       n.followStuck=0
     }
   }
 }
}
function isInAlley(x,z){
 return alleys.some(a=>{
   if(a.axis==='z')return Math.abs(x-a.x)<=a.width&&z>=a.min&&z<=a.max;
   return Math.abs(z-a.z)<=a.width&&x>=a.min&&x<=a.max
 })
}

function currentFollower(){return npcs.find(n=>n.following&&n.group?.parent)||null}
function updateFollowerCard(){
 const n=currentFollower(),card=$('#followerCard');if(!card)return;
 if(!n){card.classList.add('hidden');return}
 card.classList.remove('hidden');$('#followerName').textContent=n.name;
 const near=Math.hypot(state.pos.x-n.group.position.x,state.pos.z-n.group.position.z)<3.2;
 const secluded=isInAlley(state.pos.x,state.pos.z)||isInAlley(n.group.position.x,n.group.position.z);
 const btn=$('#robFollowerBtn');
 if(secluded&&near){
   $('#followerStatus').textContent='Vous êtes dans une ruelle, à l’écart.';
   btn.textContent='⚠️ BRAQUER';btn.disabled=false;btn.classList.add('ready');btn.onclick=()=>robFollower(n)
 }else{
   $('#followerStatus').textContent=secluded?'Attends qu’il/elle se rapproche.':'Emmène cette personne dans une ruelle.';
   btn.textContent=secluded?'🚶 ATTENDRE':'🌃 TROUVER UNE RUELLE';btn.disabled=true;btn.classList.remove('ready');btn.onclick=null
 }
}
function dismissFollower(){
 const n=currentFollower();if(!n)return;
 n.following=false;removeFollowMarker(n);$('#followerCard').classList.add('hidden');toast(`${n.name} ne te suit plus.`)
}

function addFollowMarker(n){
 removeFollowMarker(n);
 const m=makeSign('🚶 TE SUIT','#9effc7');m.scale.set(2.5,.62,1);m.position.set(0,2.72,0);n.group.add(m);n.followMarker=m
}
function removeFollowMarker(n){if(n?.followMarker?.parent)n.followMarker.parent.remove(n.followMarker);if(n)n.followMarker=null}

function askFollow(n){
 if(n.following)return toast(`${n.name} te suit déjà.`);const existing=currentFollower();if(existing&&existing!==n)return toast(`${existing.name} te suit déjà. Fais-lui d’abord signe de partir.`);
 const doubt=clamp(n.followDoubt+state.wanted*.12-(state.reputation||0)*.015,0,.95);
 const hygieneBonus=(state.hygiene-50)/180;const chance=clamp(n.trust-doubt+.28+hygieneBonus,.05,.92);
 closeSheet();
 if(Math.random()<chance){
   n.following=true;n.route=null;n.caught=false;playerTrail=[];updatePlayerTrail();n.followTrailIndex=0;addFollowMarker(n);
   closeSheet();toast(`${n.name} te suit maintenant. Emmène-le/la où tu veux.`)
 }else{
   n.trust=Math.max(0,n.trust-.1);
   toast(`${n.name} refuse : il/elle se méfie.`)
 }
}
function transferPocketLoot(n,all=false){
 let coins=0,items=[];
 if(n.money>0){coins=all?n.money:Math.min(n.money,8+Math.floor(Math.random()*14));n.money-=coins;state.coins+=coins;state.coinsEarned+=coins;state.stolenCoins+=coins}
 const takeCount=all?Math.min(n.pocketItems.length,2):Math.min(n.pocketItems.length,1);
 for(let i=0;i<takeCount&&invCount()<state.bagMax;i++){const id=n.pocketItems.shift();addInv(id);items.push(id)}
 return {coins,items}
}
function robFollower(n){
 if(!n.following)return;
 if(!(isInAlley(state.pos.x,state.pos.z)||isInAlley(n.group.position.x,n.group.position.z)))return toast('Emmène la personne dans une ruelle.');if(Math.hypot(state.pos.x-n.group.position.x,state.pos.z-n.group.position.z)>3.2)return toast('Attends que la personne se rapproche.');
 const compliance=clamp(.58+(weapon().damage>10?.12:0)-n.courage*.38+(state.reputation||0)*.005,.12,.88);
 n.following=false;removeFollowMarker(n);n.pickpocketed=true;n.caught=true;
 if(Math.random()<compliance){
   const loot=transferPocketLoot(n,true);
   const names=loot.items.map(id=>itemInfo(id).name);
   toast(`Butin : ${loot.coins?loot.coins+' crédits':''}${loot.coins&&names.length?' + ':''}${names.join(', ')||(!loot.coins?'rien':'')}`);
   if(n.courage>.55&&Math.random()<.35){n.aggroTime=6;n.calledPolice=false;state.wanted=Math.max(1,state.wanted)}
 }else{
   n.aggroTime=9;n.calledPolice=false;state.wanted=Math.max(1,state.wanted);
   toast(`${n.name} refuse et appelle à l’aide !`)
 }
 save()
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
   else if(n.following) updateFollower(n,dt);
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
 let seized='';
 const carried=state.inventory.filter(i=>STREET_ITEMS[i.id]&&i.qty>0);
 if(carried.length&&Math.random()<.65){const x=choice(carried);removeStack(state.inventory,x.id,1);seized=itemInfo(x.id).name}
 state.coins-=fine;state.policeCaught++;state.wanted=0;hiddenTimer=0;
 if(tailTheft)stopTailTheft('La police t’a attrapé.',true);
 clearTarget();state.pos={x:2,z:8};toast(`👮 Attrapé : -${fine} crédits${seized?` • ${seized} confisqué`:''}`);save()
}function animatePickups(dt,t){for(const p of pickups){if(!p.parent)continue;p.rotation.y+=dt;p.position.y=(p.userData.type==='artifact'?.72:.43)+Math.sin(t/450+p.position.x)*.07}}

function needsSpeedMultiplier(){
 const low=Math.min(state.hunger,state.thirst);
 return low<10?.68:low<25?.82:1
}
function updateNeeds(dt){
 if(state.interior&&state.interior.type==='shop')return;
 state.hunger=clamp(state.hunger-dt*.030,0,100);
 state.thirst=clamp(state.thirst-dt*.046,0,100);
 state.hygiene=clamp(state.hygiene-dt*.018,0,100);
 if(state.hunger<=0||state.thirst<=0){
   state.hp=Math.max(1,state.hp-dt*(state.thirst<=0?1.35:.65))
 }
}
function useConsumable(id){
 const c=CONSUMABLES[id];if(!c||!removeStack(state.inventory,id,1))return;
 state.hunger=clamp(state.hunger+(c.hunger||0),0,100);
 state.thirst=clamp(state.thirst+(c.thirst||0),0,100);
 state.hygiene=clamp(state.hygiene+(c.hygiene||0),0,100);
 toast(`${c.icon} ${c.name} utilisé`);save();openSheet('bag')
}

function ensureInteriorConsistency(){
 if(state.interior&&!interiorGroup){
   const p=state.returnPos&&Number.isFinite(state.returnPos.x)&&Number.isFinite(state.returnPos.z)?state.returnPos:base.pos;
   state.pos={x:p.x,z:p.z};state.interior=null;state.returnPos=null;
   for(const[,g]of chunks)g.visible=true;
   save();toast('Intérieur restauré après une erreur de chargement.')
 }
}

function animate(){
 if(!renderer)return;requestAnimationFrame(animate);ensureInteriorConsistency();const dt=Math.min(.033,clock.getDelta()),t=performance.now();
 const keyForward=(keys['ArrowUp']?1:0)-(keys['ArrowDown']?1:0);
 const keyStrafe=(keys['ArrowRight']?1:0)-(keys['ArrowLeft']?1:0);
 const forward=clamp(-moveStick.y+keyForward,-1,1),strafe=clamp(moveStick.x+keyStrafe,-1,1);
 const fx=Math.sin(state.yaw),fz=-Math.cos(state.yaw),rx=Math.cos(state.yaw),rz=Math.sin(state.yaw);
 const moveSpeed=4.8*needsSpeedMultiplier();movePlayer((fx*forward+rx*strafe)*moveSpeed*dt,(fz*forward+rz*strafe)*moveSpeed*dt);updatePlayerTrail();
 state.yaw+=lookStick.x*1.8*dt;
 state.pitch=clamp(state.pitch-lookStick.y*1.2*dt,-.58,.52);if(Math.abs(lookStick.y)<.02)state.pitch*=Math.max(.0,1-dt*2.1)
 updateNeeds(dt);updateCamera(t);if(!state.interior){updatePeople(dt,t);updateCars(dt,t);animatePickups(dt,t);if(t-lastChunkTick>650){ensureChunks();lastChunkTick=t}}updateWorldLight(dt);updateAtmosphere(dt);checkInteraction();if(t-lastMapTick>100){drawMap();lastMapTick=t}updateHUD();renderer.render(scene,camera)
}


function ensureOutdoorPositionClear(){
 if(state.interior||!collides(state.pos.x,state.pos.z))return;
 const {cx,cz}=currentChunk(),x0=cx*CHUNK,z0=cz*CHUNK;
 const candidates=[
  {x:x0+12.5,z:z0+22},{x:x0+22,z:z0+12.5},
  {x:x0+12.5,z:z0+48},{x:x0+48,z:z0+12.5},
  {x:x0+43,z:z0+43}
 ];
 const p=candidates.find(p=>!collides(p.x,p.z))||base.pos;
 state.pos={x:p.x,z:p.z};save();toast('Position ajustée après la nouvelle génération de la ville.')
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

 const follower=nearest(npcs.filter(n=>n.following),3.2);
 if(follower&&(isInAlley(state.pos.x,state.pos.z)||isInAlley(follower.group.position.x,follower.group.position.z)))
   return setPrompt(follower.name,'Vous êtes à l’écart.','BRAQUER',()=>robFollower(follower));

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
 const pr=nearest(properties,1.75);
 if(pr){
   const rec=portfolioRecord(pr.id);
   if(rec)return setPrompt(propertyLabel(pr),rec.tenure==='rent'?`${rec.rent} crédits/mois`:'Bien dont tu es propriétaire.','ENTRER',()=>enterInterior('property',pr));
   return setPrompt(propertyLabel(pr),`${pr.districtName} • ${pr.rent}/mois ou ${pr.buyPrice} à l’achat.`,'VOIR',()=>{selectedProperty=pr;openSheet('property')})
 }
 const n=nearest(npcs,1.5);if(n)return setPrompt(n.name,'Touche le passant pour le choisir comme cible, ou ouvre le dialogue.','PARLER',()=>talkNPC(n));
 hidePrompt()
}
function setPrompt(t,d,b,fn){
 currentInteractFn=fn;const sig=`${t}|${d}|${b}`;
 if(sig!==lastPromptSig){lastPromptSig=sig;$('#promptTitle').textContent=t;$('#promptText').textContent=d;$('#promptBtn').textContent=b}
 $('#promptBtn').onclick=fn;$('#prompt').classList.remove('hidden')
}
function hidePrompt(){currentInteractFn=null;lastPromptSig='';if(!$('#prompt').classList.contains('hidden'))$('#prompt').classList.add('hidden')}
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
 const dirty=state.hygiene<25;
 const lines=dirty
   ?['Tu as l’air de sortir d’une longue journée…','Tout va bien ? Tu devrais peut-être te laver un peu.']
   :[`Salut ! ${city().name} est tranquille aujourd’hui.`,`Je connais quelques ruelles et commerces dans le quartier.`,`On trouve toujours quelque chose à faire ici.`];
 showDialogue(n.name,choice(lines),()=>showNpcChoices(n))
}
function showNpcChoices(n){
 $('#dialogue').classList.add('hidden');
 openSheet('npc');$('#sheetTitle').textContent=n.name;
 $('#sheetBody').innerHTML=`<div class="card"><div class="grid2">
 <button class="menuBtn primary" id="talkAgain">💬 Discuter</button>
 <button class="menuBtn primary" id="askFollow" ${n.caught||n.following?'disabled':''}>🚶 SUIS-MOI<small>${n.following?'Cette personne te suit':'Lui demander de venir avec toi'}</small></button>
 <button class="menuBtn" id="askMission">📋 Petit boulot<small>${n.missionGiven?'Déjà proposé':'Demander une mission'}</small></button>
 <button class="menuBtn" id="pickpocket" ${n.pickpocketed||n.caught?'disabled':''}>🫳 Cibler<small>${n.pickpocketed?'Déjà fouillé':'Le/la suivre discrètement'}</small></button>
 </div></div>`;
 $('#talkAgain').onclick=()=>{closeSheet();showDialogue(n.name,'Bonne route.',hideDialogue)};
 const af=$('#askFollow');if(af)af.onclick=()=>askFollow(n);
 const am=$('#askMission');if(am)am.onclick=()=>{
   closeSheet();
   if(n.missionGiven)return toast('Cette personne t’a déjà proposé quelque chose.');
   n.missionGiven=true;assignNpcMission(n);showDialogue(n.name,`J’ai un petit boulot : ${state.activeNpcMission.text}`,hideDialogue)
 };
 const pp=$('#pickpocket');if(pp)pp.onclick=()=>{closeSheet();selectTarget(n);toast('Cible sélectionnée.')}
}
function assignNpcMission(n){const opts=[{kind:'pockets',text:'récupère 30 crédits sur des passants',target:30,start:state.stolenCoins,reward:90},{kind:'container',text:'fouille 2 caches ou poubelles',target:2,start:state.containersOpened,reward:110},{kind:'explore',text:'découvre 2 nouveaux quartiers',target:2,start:state.seenDistricts.length,reward:120}];state.activeNpcMission={...choice(opts),giver:n.name};save()}
function npcMissionProgress(){const m=state.activeNpcMission;if(!m)return null;const now=m.kind==='pockets'?state.stolenCoins:m.kind==='container'?state.containersOpened:state.seenDistricts.length;return now-m.start}
function maybeCompleteNpcMission(){const m=state.activeNpcMission;if(!m)return;if(npcMissionProgress()>=m.target){state.coins+=m.reward;state.npcMissions++;state.reputation=(state.reputation||0)+2;toast(`Mission de ${m.giver} terminée +${m.reward}`);state.activeNpcMission=null;checkQuests();save()}}
function selectTarget(n){
 if(!n||n.hostile||n.isPolice)return;
 clearTarget(false);selectedNPC=n;
 const marker=makeSign('▼ CIBLE','#8ee8ff');marker.scale.set(2.8,.7,1);marker.position.set(0,2.55,0);n.group.add(marker);targetMarker=marker;
 $('#targetCard').classList.remove('hidden');$('#targetName').textContent=n.name;$('#targetInfo').textContent='Suis la cible et reste derrière.';updateTargetHUD()
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
 tailTheft={npc:n,suspicion:0,validStealTime:0,lostTime:0,nextCoin:.55+Math.random()*.35,emptyTimer:0,policeObserved:false,stolen:0,items:[],firstLoot:true};
 document.body.classList.add('crime-active');$('#targetInfo').textContent='Fouille en cours.'
}
function updateTailTheft(dt,t){
 if(!tailTheft?.active&&tailTheft)tailTheft.active=true;
 if(!tailTheft?.active)return;
 const n=tailTheft.npc;
 if(!n?.group?.parent)return stopTailTheft('Cible perdue.');
 const d=Math.hypot(state.pos.x-n.group.position.x,state.pos.z-n.group.position.z),behind=isBehindTarget(n);
 const ideal=d>=.62&&d<=1.65&&behind;
 if(d>2.2){tailTheft.lostTime+=dt;if(tailTheft.lostTime>1.3)return stopTailTheft('Cible perdue.')}else tailTheft.lostTime=Math.max(0,tailTheft.lostTime-dt*2);

 if(ideal){
   tailTheft.validStealTime+=dt;tailTheft.nextCoin-=dt;
   tailTheft.suspicion=Math.max(0,tailTheft.suspicion-dt*(5+state.stealth*2));

   const hasMoney=n.money>0,hasItems=n.pocketItems.length>0;
   if(!hasMoney&&!hasItems){
     tailTheft.emptyTimer+=dt;
     if(tailTheft.emptyTimer>1.0){n.pickpocketed=true;return stopTailTheft((tailTheft.stolen||tailTheft.items.length)?'Poches vidées.':'Poches vides.')}
   }else if(tailTheft.nextCoin<=0){
     const stealItem=hasItems&&(tailTheft.firstLoot||!hasMoney||Math.random()<.55);
     if(stealItem){
       if(invCount()>=state.bagMax)return stopTailTheft('Sac plein.');
       const id=n.pocketItems.shift();addInv(id);tailTheft.items.push(id);tailTheft.firstLoot=false;
       $('#targetLoot').textContent=`🪙 ${tailTheft.stolen} • 🎒 ${tailTheft.items.length}`;
       toast(`${itemInfo(id).icon} Volé : ${itemInfo(id).name}`)
     }else if(hasMoney){
       const take=Math.min(n.money,1+Math.floor(Math.random()*(3+Math.min(2,state.stealth))));
       n.money-=take;state.coins+=take;state.coinsEarned+=take;state.stolenCoins+=take;tailTheft.stolen+=take;tailTheft.firstLoot=false;
       $('#targetLoot').textContent=`🪙 ${tailTheft.stolen} • 🎒 ${tailTheft.items.length}`
     }
     tailTheft.nextCoin=.72+Math.random()*.72;checkQuests();maybeCompleteNpcMission()
   }
 }else{
   tailTheft.validStealTime=Math.max(0,tailTheft.validStealTime-dt*.35);
   tailTheft.suspicion+=dt*(behind?14:32)+(d<.55?dt*35:0)
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
 if((stolen>0||(tailTheft.items?.length||0)>0)&&!n._counted){state.pickpockets++;n._counted=true}
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
   $('#targetInfo').textContent=selectedNPC.pickpocketed?'Déjà fouillé.':(behind&&d<=1.65?'Fouille automatique.':'Reste derrière.')
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
   const n=hits.map(h=>h.object.userData.person).find(Boolean);
   if(n){
     const d=Math.hypot(state.pos.x-n.group.position.x,state.pos.z-n.group.position.z);
     if(d>4.2)return toast('Approche-toi pour lui parler.');
     showNpcChoices(n)
   }
 })
}

function showDialogue(name,text,next){$('#dialogueName').textContent=name;$('#dialogueText').textContent=text;$('#dialogueIcon').textContent='🙂';$('#dialogue').classList.remove('hidden');$('#dialogueNext').onclick=next}
function hideDialogue(){$('#dialogue').classList.add('hidden')}

function enterInterior(type,obj){
 state.returnPos={...state.pos};
 state.interior={type,shopType:obj?.type||null,propertyId:type==='property'?obj?.id:null};
 interiorColliders=[];for(const[,g]of chunks)g.visible=false;
 if(interiorGroup)scene.remove(interiorGroup);interiorGroup=new THREE.Group();scene.add(interiorGroup);

 let width=18,depth=18;
 if(type==='property'){
   const p=propertyFromCatalog(obj.id)||obj;
   const dims=propertyInteriorDims(p);width=dims.width;depth=dims.depth
 }
 interiorBounds={x:width/2-.5,z:depth/2-.5};
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),new THREE.MeshStandardMaterial({color:type==='shop'?0x786f60:type==='property'?0x8d8172:0x7b6c5d,roughness:1}));floor.rotation.x=-Math.PI/2;interiorGroup.add(floor);
 const wallM=new THREE.MeshStandardMaterial({color:type==='shop'?0xc8c0aa:type==='property'?0xd8d1c7:0xd7cfbf});
 [[0,2.5,-depth/2,width,.25],[0,2.5,depth/2,width,.25],[-width/2,2.5,0,.25,depth],[width/2,2.5,0,.25,depth]].forEach(w=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w[3],5,w[4]),wallM);m.position.set(w[0],w[1],w[2]);interiorGroup.add(m)});

 if(type==='shop')buildShopInterior(obj.type);
 else if(type==='property')buildPropertyInterior(propertyFromCatalog(obj.id)||obj);
 else if(type==='home')buildHomeInterior();
 else buildApartmentInterior();
 state.pos={x:0,z:depth/2-2.1};state.yaw=0;state.pitch=0;hidePrompt();save()
}
function propertyInteriorDims(p){
 if(p.type==='studio')return{width:9,depth:8};
 if(p.type==='flat2')return{width:12,depth:10};
 if(p.type==='flat3')return{width:15,depth:12};
 if(p.type==='house')return{width:18,depth:15};
 return{width:22,depth:18}
}
function addInteriorBox(x,y,z,w,h,d,color=0x765438){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.9}));m.position.set(x,y,z);interiorGroup.add(m);interiorColliders.push({minX:x-w/2-.08,maxX:x+w/2+.08,minZ:z-d/2-.08,maxZ:z+d/2+.08});return m
}
function buildPropertyInterior(p){
 const dims=propertyInteriorDims(p),t=PROPERTY_TYPES[p.type],rich=p.tier==='rich'||p.tier==='luxury';
 const sign=makeSign(`${t.icon} ${p.area} m²`,'#d8f4ff');sign.position.set(0,3,-dims.depth/2+.2);interiorGroup.add(sign);
 if(p.type==='studio'){
   addInteriorBox(-2.3,.3,-1.5,2.2,.55,1.25,0x5b6f80);addInteriorBox(2,.4,-1.4,1.35,.75,.9,0x704e34)
 }else{
   // room partitions scale with property size
   const part=new THREE.Mesh(new THREE.BoxGeometry(.16,2.6,dims.depth*.46),new THREE.MeshStandardMaterial({color:0xc7c0b5}));part.position.set(0,1.3,-1);interiorGroup.add(part);interiorColliders.push({minX:-.13,maxX:.13,minZ:-dims.depth*.23-1,maxZ:dims.depth*.23-1});
   addInteriorBox(-dims.width*.25,.32,-dims.depth*.18,p.type==='villa'?3.6:2.8,.58,1.3,rich?0x587184:0x566876);
   addInteriorBox(dims.width*.24,.4,-dims.depth*.18,1.6,.75,1.0,rich?0x86654a:0x715137);
   if(p.type==='house'||p.type==='villa'){
     addInteriorBox(-dims.width*.27,.38,dims.depth*.20,2.6,.72,1.0,rich?0x6b5b83:0x53687a);
     const plant=new THREE.Mesh(new THREE.SphereGeometry(.6,9,7),new THREE.MeshStandardMaterial({color:0x43815a}));plant.position.set(dims.width*.28,1,dims.depth*.22);interiorGroup.add(plant)
   }
 }
 if(rich){
   const rug=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(6,dims.width*.42),Math.min(4,dims.depth*.34)),new THREE.MeshStandardMaterial({color:0x765d7d,roughness:1}));rug.rotation.x=-Math.PI/2;rug.position.set(0,.02,1);interiorGroup.add(rug)
 }
}
function buildShopInterior(type){
 const shelfM=new THREE.MeshStandardMaterial({color:0x4c3c2d});for(let i=-1;i<=1;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.8,5),shelfM);s.position.set(i*4,1,0);interiorGroup.add(s);interiorColliders.push({minX:i*4-.95,maxX:i*4+.95,minZ:-2.55,maxZ:2.55})}
 const counter=new THREE.Mesh(new THREE.BoxGeometry(5,1.2,1.2),new THREE.MeshStandardMaterial({color:0x2f4855}));counter.position.set(0,.6,-6);interiorGroup.add(counter);interiorColliders.push({minX:-2.55,maxX:2.55,minZ:-6.65,maxZ:-5.35});
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
 const stage=state.housingStage||0;
 const title=stage===1?'🔑 STUDIO':stage===2?'🏢 APPARTEMENT':`🏠 MAISON NIVEAU ${state.homeLevel||1}`;
 const sign=makeSign(title,'#8fe8ff');sign.position.set(0,3.2,-8.45);interiorGroup.add(sign);
 if(stage===1||stage===2){
   const bed=new THREE.Mesh(new THREE.BoxGeometry(stage===1?2.2:2.8,.5,1.3),new THREE.MeshStandardMaterial({color:0x586c7a}));bed.position.set(-4,.3,-2);interiorGroup.add(bed);interiorColliders.push({minX:-5.5,maxX:-2.5,minZ:-2.9,maxZ:-1.1});
   const table=new THREE.Mesh(new THREE.BoxGeometry(1.5,.75,1.0),new THREE.MeshStandardMaterial({color:0x765438}));table.position.set(2,.4,-2);interiorGroup.add(table);interiorColliders.push({minX:1.1,maxX:2.9,minZ:-2.65,maxZ:-1.35});
   if(stage===2){const sofa=new THREE.Mesh(new THREE.BoxGeometry(2.8,.75,1.1),new THREE.MeshStandardMaterial({color:0x4e6578}));sofa.position.set(3,.42,2);interiorGroup.add(sofa);interiorColliders.push({minX:1.5,maxX:4.5,minZ:1.3,maxZ:2.7})}
   return
 }
 const desk=new THREE.Mesh(new THREE.BoxGeometry(4.1,1,1.1),new THREE.MeshStandardMaterial({color:0x56422f}));desk.position.set(0,.5,-6.2);interiorGroup.add(desk);
 const rug=new THREE.Mesh(new THREE.PlaneGeometry(5.4,3.5),new THREE.MeshStandardMaterial({color:0x31576c,roughness:1}));rug.rotation.x=-Math.PI/2;rug.position.set(0,.02,-1);interiorGroup.add(rug);
 const maxSlots=state.homeLevel===1?8:state.homeLevel===2?12:16;
 state.homePlaced.slice(0,maxSlots).forEach((id,i)=>{
   const slot=HOME_SLOTS[i],p=makeHomeProp(id);p.position.set(slot.x,0,slot.z);if(slot.rot)p.rotation.y=slot.rot;interiorGroup.add(p);
   const sizes={wallKit:[1.7,.25],sofa:[1.45,.75],table:[.95,.75],lamp:[.35,.35],plant:[.55,.55],wardrobe:[.9,.5],chest:[.75,.55],safe:[.7,.6]};
   const s=sizes[id]||[.5,.5];interiorColliders.push({minX:slot.x-s[0],maxX:slot.x+s[0],minZ:slot.z-s[1],maxZ:slot.z+s[1]})
 });
 if(state.artifacts.length){
   const shelf=new THREE.Mesh(new THREE.BoxGeometry(5,.16,.65),new THREE.MeshStandardMaterial({color:0x66482f}));shelf.position.set(0,1.25,7.9);interiorGroup.add(shelf);
   state.artifacts.slice(0,5).forEach((id,i)=>{const art=new THREE.Mesh(new THREE.OctahedronGeometry(.32),new THREE.MeshStandardMaterial({color:0x61d7ff,emissive:0x15546c,emissiveIntensity:.9}));art.position.set(-2+i,1.65,7.85);interiorGroup.add(art)})
 }
}
function exitInterior(){leaveInterior()}
function leaveInterior(){if(interiorGroup){scene.remove(interiorGroup);interiorGroup=null}interiorColliders=[];interiorBounds={x:8.5,z:8.5};for(const[,g]of chunks)g.visible=true;state.interior=null;state.pos=state.returnPos||{x:2,z:8};state.returnPos=null;save();hidePrompt()}
function physicalShopHTML(){
 const s=SHOPS[state.interior.shopType],arts=[...new Set(state.artifactBag)];
 if(state.interior.shopType==='housing')return `${housingAgencyHTML()}<button class="menuBtn red" id="leaveShop" style="width:100%">🚪 Sortir</button>`;
 const valuables=state.inventory.filter(i=>STREET_ITEMS[i.id]&&i.qty>0);
 const resale=state.interior.shopType==='pawn'
   ?`<div class="card"><h3>📦 Revente d’objets</h3>${valuables.length?valuables.map(i=>{const info=itemInfo(i.id);return `<div class="item"><div class="itemIcon">${info.icon}</div><div class="itemMain"><b>${info.name}</b><small>×${i.qty} • ${info.value} crédits pièce</small></div><button class="menuBtn sellLoot" data-id="${i.id}">Vendre</button></div>`}).join(''):'<p class="sub">Aucun objet revendable.</p>'}</div>`
   :'';
 return `<div class="card"><h3>${s.icon} ${s.name}</h3><p class="sub">${state.coins} crédits${state.reputation?` • remise ${Math.min(15,state.reputation)}%`:''}</p></div>
 <div class="card">${s.stock.map(x=>`<div class="item"><div class="itemIcon">${x.icon}</div><div class="itemMain"><b>${x.name}</b><small>${x.desc} • ${x.price}</small></div><button class="menuBtn buy" data-id="${x.id}" data-price="${x.price}">Acheter</button></div>`).join('')}</div>
 ${resale}
 <div class="card"><h3>💎 Artefacts</h3>${arts.length?arts.map(id=>`<div class="item"><div class="itemIcon">💎</div><div class="itemMain"><b>${artifactLabel(id)}</b><small>×${artifactCount(id)} • 500 crédits</small></div><button class="menuBtn sellArtifact" data-id="${id}">Vendre</button></div>`).join(''):'<p class="sub">Aucun artefact.</p>'}</div>
 <button class="menuBtn red" id="leaveShop" style="width:100%">🚪 Sortir</button>`
}
function buy(id,price){const discount=Math.min(.15,(state.reputation||0)*.01),finalPrice=Math.max(1,Math.round(price*(1-discount)));if(state.coins<finalPrice)return toast('Pas assez de crédits');if(WEAPONS[id]&&state.ownedWeapons.includes(id))return toast('Déjà acheté');state.coins-=finalPrice;if(WEAPONS[id]){state.ownedWeapons.push(id);state.equipped=id;weaponRig.visible=true}if(id==='medkit')addInv('medkit');if(CONSUMABLES[id])addInv(id);if(id==='armor')state.armor=clamp(state.armor+30,0,100);if(id==='bag')state.bagMax+=5;if(id==='stealth')state.stealth++;if(id==='map')state.scanner=1;if(HOME_ITEMS[id])addHomeItem(id);save();updateHUD();toast('Achat effectué');$('#sheetBody').innerHTML=physicalShopHTML();bindShop()}
function sellLoot(id){
 const info=STREET_ITEMS[id];if(!info||!removeStack(state.inventory,id,1))return;
 state.coins+=info.value;save();toast(`${info.name} vendu : +${info.value}`);
 $('#sheetBody').innerHTML=physicalShopHTML();bindShop()
}
function bindShop(){
 $$('.inspectProperty').forEach(b=>b.onclick=()=>{const p=propertyFromCatalog(b.dataset.id);if(p){selectedProperty=p;openSheet('property')}});
 $$('.buy').forEach(b=>b.onclick=()=>buy(b.dataset.id,Number(b.dataset.price)));
 $$('.sellLoot').forEach(b=>b.onclick=()=>sellLoot(b.dataset.id));
 $$('.sellArtifact').forEach(b=>b.onclick=()=>sellArtifact(b.dataset.id));
 $('#leaveShop').onclick=()=>{closeSheet();leaveInterior()}
}



function propertyLabel(p){return `${PROPERTY_TYPES[p.type]?.name||'Logement'} ${p.area} m²`}
function propertyCreditUse(amount){
 const used=Math.min(state.propertyCredit||0,amount);state.propertyCredit=(state.propertyCredit||0)-used;return amount-used
}
function rentProperty(p){
 if(portfolioRecord(p.id))return toast('Ce bien est déjà dans ton portefeuille.');
 const cost=propertyCreditUse(p.rent);
 if(state.coins<cost){state.propertyCredit=(state.propertyCredit||0)+(p.rent-cost);return toast(`Il te manque ${cost-state.coins} crédits.`)}
 const oldRent=state.propertyPortfolio.find(x=>x.id===state.residenceId&&x.tenure==='rent');
 if(oldRent)state.propertyPortfolio=state.propertyPortfolio.filter(x=>x.id!==oldRent.id);
 state.coins-=cost;
 state.propertyPortfolio.push({...p,label:propertyLabel(p),tenure:'rent',marketRent:p.rent,listed:false,tenant:false,askingRent:p.rent});
 state.residenceId=p.id;state.missedRent=0;save();toast(`🔑 ${propertyLabel(p)} loué • ${p.rent}/mois`);openSheet('home')
}
function buyProperty(p){
 if(portfolioRecord(p.id))return toast('Bien déjà acquis.');
 const cost=propertyCreditUse(p.buyPrice);
 if(state.coins<cost){state.propertyCredit=(state.propertyCredit||0)+(p.buyPrice-cost);return toast(`Il te manque ${cost-state.coins} crédits.`)}
 state.coins-=cost;
 const rec={...p,label:propertyLabel(p),tenure:'owned',marketRent:p.rent,listed:false,tenant:false,askingRent:p.rent};
 state.propertyPortfolio.push(rec);
 if(!state.residenceId)state.residenceId=p.id;
 save();toast(`🏠 ${propertyLabel(p)} acheté`);openSheet('home')
}
function setResidence(id){
 const rec=portfolioRecord(id);if(!rec)return;
 if(rec.tenure==='owned'&&rec.listed){rec.listed=false;rec.tenant=false}
 const old=state.propertyPortfolio.find(x=>x.id===state.residenceId&&x.tenure==='rent'&&x.id!==id);
 if(old)state.propertyPortfolio=state.propertyPortfolio.filter(x=>x.id!==old.id);
 state.residenceId=id;state.missedRent=0;save();toast(`${rec.label} devient ta résidence.`);openSheet('home')
}
function endRental(id){
 const rec=portfolioRecord(id);if(!rec||rec.tenure!=='rent')return;
 state.propertyPortfolio=state.propertyPortfolio.filter(x=>x.id!==id);
 if(state.residenceId===id)state.residenceId=null;save();toast('Bail résilié.');openSheet('home')
}
function adjustAskingRent(id,delta){
 const rec=portfolioRecord(id);if(!rec||rec.tenure!=='owned')return;
 rec.askingRent=Math.max(5,Math.round((rec.askingRent||rec.marketRent)+delta));rec.tenant=false;save();openSheet('home')
}
function togglePropertyListing(id){
 const rec=portfolioRecord(id);if(!rec||rec.tenure!=='owned')return;
 if(state.residenceId===id)return toast('Choisis d’abord une autre résidence.');
 rec.listed=!rec.listed;if(rec.listed){rec.askingRent=rec.askingRent||rec.marketRent;rec.tenant=false}
 else rec.tenant=false;
 save();toast(rec.listed?'Bien proposé à la location.':'Annonce retirée.');openSheet('home')
}
function propertySheetHTML(p){
 const d=DISTRICTS.find(x=>x.id===p.districtId)||districtFor(p.cx,p.cz),rec=portfolioRecord(p.id),t=PROPERTY_TYPES[p.type];
 if(rec)return `<div class="card"><h3>${t.icon} ${propertyLabel(p)}</h3><p class="sub">${d.name} • ${districtTierLabel(d)} • ${p.rooms} pièce(s)</p><p class="sub">Valeur d’achat ${p.buyPrice} • loyer marché ${p.rent}/mois</p></div>
 <div class="card"><button class="menuBtn green enterProperty" data-id="${p.id}" style="width:100%">🚪 Entrer dans le logement</button></div>`;
 return `<div class="card"><h3>${t.icon} ${propertyLabel(p)}</h3><p class="sub">${d.name} • <span class="${districtTierClass(d)}">${districtTierLabel(d)}</span></p><p class="sub">${p.rooms} pièce(s) • ${p.area} m²</p></div>
 <div class="card"><div class="marketRow"><div><b>Louer</b><small>${p.rent} crédits chaque mois</small></div><button class="menuBtn rentProperty" data-id="${p.id}">Louer</button></div>
 <div class="marketRow"><div><b>Acheter</b><small>Paiement unique</small></div><button class="menuBtn buyProperty" data-id="${p.id}">${p.buyPrice}</button></div>
 ${state.propertyCredit?`<p class="sub">Avoir logement disponible : ${state.propertyCredit} crédits.</p>`:''}</div>`
}
function housingAgencyHTML(){
 const {cx,cz}=currentChunk(),curD=districtFor(cx,cz);
 const list=state.propertyCatalog.filter(p=>p.cityId===state.cityId).sort((a,b)=>Math.hypot(a.cx-cx,a.cz-cz)-Math.hypot(b.cx-cx,b.cz-cz)).slice(0,12);
 return `<div class="card"><h3>🔑 Marché immobilier</h3><p class="sub">${curD.name} • ${districtTierLabel(curD)}. Les prix changent réellement selon le quartier et la taille.</p></div>
 ${list.length?list.map(p=>{const d=DISTRICTS.find(x=>x.id===p.districtId)||districtFor(p.cx,p.cz);return `<div class="card"><div class="marketRow"><div><b>${PROPERTY_TYPES[p.type].icon} ${propertyLabel(p)}</b><small>${d.name} • ${p.rent}/mois • achat ${p.buyPrice}</small></div><button class="menuBtn inspectProperty" data-id="${p.id}">Voir</button></div></div>`}).join(''):'<div class="card"><p class="sub">Explore les quartiers : les logements découverts apparaîtront ici.</p></div>'}`
}

function housingName(){
 return ['Sans logement','Studio loué','Appartement propriétaire','Maison sur terrain'][state.housingStage||0]
}
function rentStudio(){
 if((state.housingStage||0)>=1)return toast('Tu as déjà un logement.');
 if(state.coins<RENT_STUDIO_PRICE)return toast(`Il te manque ${RENT_STUDIO_PRICE-state.coins} crédits.`);
 state.coins-=RENT_STUDIO_PRICE;state.housingStage=1;checkQuests();save();toast('🔑 Studio loué !');openSheet('home')
}
function buyApartment(){
 if((state.housingStage||0)<1)return toast('Loue d’abord un studio.');
 if((state.housingStage||0)>=2)return toast('Appartement déjà acquis.');
 if(state.coins<BUY_APARTMENT_PRICE)return toast(`Il te manque ${BUY_APARTMENT_PRICE-state.coins} crédits.`);
 state.coins-=BUY_APARTMENT_PRICE;state.housingStage=2;save();toast('🏢 Appartement acheté !');openSheet('home')
}
function buyLandProgression(){
 if((state.housingStage||0)<2)return toast('Achète d’abord ton appartement.');
 if(state.landOwned)return toast('Terrain déjà acheté.');
 if(state.coins<HOME_PLOT_PRICE)return toast(`Il te manque ${HOME_PLOT_PRICE-state.coins} crédits.`);
 state.coins-=HOME_PLOT_PRICE;state.housingStage=3;state.landOwned=true;save();toast('🏡 Terrain acheté !');
 for(const[k]of[...chunks])unload(k);ensureChunks(true);openSheet('home')
}
function sleepRough(){
 if((state.housingStage||0)>0)return;
 state.hp=clamp(state.hp+22,0,state.maxHp);state.hygiene=clamp(state.hygiene-12,0,100);state.hunger=clamp(state.hunger-7,0,100);state.thirst=clamp(state.thirst-10,0,100);advanceDay(1);state.timeOfDay=7.2;save();toast('Tu as dormi dehors.');openSheet('home')
}
function showerAtHome(){
 if(!state.residenceId)return toast('Tu n’as pas de douche.');
 state.hygiene=100;save();toast('🚿 Propreté restaurée.');openSheet('home')
}
function housingPanelHTML(){
 const s=state.housingStage||0;
 return `<div class="card"><h3>🏘️ Parcours logement</h3>
 <div class="housingStep ${s>=1?'done':''}"><div class="housingNum">${s>=1?'✓':'1'}</div><div class="itemMain"><b>Louer un studio</b><small>${RENT_STUDIO_PRICE} crédits</small></div>${s<1?'<button class="menuBtn rentStudio">Louer</button>':''}</div>
 <div class="housingStep ${s>=2?'done':''}"><div class="housingNum">${s>=2?'✓':'2'}</div><div class="itemMain"><b>Acheter un appartement</b><small>${BUY_APARTMENT_PRICE} crédits</small></div>${s===1?'<button class="menuBtn buyApartment">Acheter</button>':''}</div>
 <div class="housingStep ${s>=3?'done':''}"><div class="housingNum">${s>=3?'✓':'3'}</div><div class="itemMain"><b>Acheter un terrain</b><small>${HOME_PLOT_PRICE} crédits</small></div>${s===2?'<button class="menuBtn buyLandProgress">Acheter</button>':''}</div>
 </div>`
}
function bindHousingButtons(){
 $$('.rentStudio').forEach(b=>b.onclick=rentStudio);
 $$('.buyApartment').forEach(b=>b.onclick=buyApartment);
 $$('.buyLandProgress').forEach(b=>b.onclick=buyLandProgression)
}

function buyLand(){buyLandProgression()}
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
 if(!state.residenceId)return toast('Tu n’as pas de logement.');
 state.hp=state.maxHp;state.wanted=Math.max(0,state.wanted-2);state.timeOfDay=7.5;
 state.hunger=clamp(state.hunger-8,0,100);state.thirst=clamp(state.thirst-10,0,100);state.restCount=(state.restCount||0)+1;advanceDay(1);save();toast('Tu as dormi.');openSheet('home')
}
function depositCoins(amount=50){if(!state.residenceId)return toast('Aucun endroit sûr.');if(state.coins<amount)return toast('Pas assez de crédits sur toi');state.coins-=amount;state.homeBank+=amount;save();openSheet('home')}
function withdrawCoins(amount=50){if(state.homeBank<amount)return toast('Pas assez dans le coffre');state.homeBank-=amount;state.coins+=amount;save();openSheet('home')}
function depositValuable(id){if(!(hasPlaced('safe')||hasPlaced('chest')))return toast('Place d’abord un coffre');if(!removeStack(state.inventory,id,1))return;state.homeStorage[id]=(state.homeStorage[id]||0)+1;save();openSheet('home')}
function withdrawValuable(id){if((state.homeStorage[id]||0)<=0)return;if(invCount()>=state.bagMax)return toast('Sac plein');state.homeStorage[id]--;addInv(id);save();openSheet('home')}
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


function districtMapColor(d){
 return d.tier==='poor'?'rgba(124,74,62,.16)':d.tier==='working'?'rgba(113,103,82,.13)':d.tier==='rich'?'rgba(67,122,82,.15)':d.tier==='luxury'?'rgba(126,111,64,.18)':'rgba(72,92,118,.12)'
}


function renderMapTo(canvas,zoom=2.0){
 if(!canvas)return;
 const q=canvas.getContext('2d'),W=canvas.width,H=canvas.height,S=zoom,R=W/(zoom*2.2),detail=canvas.id==='bigMinimap';
 q.clearRect(0,0,W,H);
 const bg=q.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#091320');bg.addColorStop(1,'#050b14');q.fillStyle=bg;q.fillRect(0,0,W,H);
 q.save();q.translate(W/2,H/2);
 if(state.interior){q.fillStyle='#8594a0';q.fillRect(-W*.18,-H*.18,W*.36,H*.36);q.fillStyle='#fff';q.beginPath();q.arc(0,0,6,0,Math.PI*2);q.fill();q.restore();return}
 const minCx=Math.floor((state.pos.x-R)/CHUNK)-1,maxCx=Math.floor((state.pos.x+R)/CHUNK)+1,minCz=Math.floor((state.pos.z-R)/CHUNK)-1,maxCz=Math.floor((state.pos.z+R)/CHUNK)+1;
 for(let cx=minCx;cx<=maxCx;cx++)for(let cz=minCz;cz<=maxCz;cz++){
   const d=districtFor(cx,cz),x=(cx*CHUNK-state.pos.x)*S,y=(cz*CHUNK-state.pos.z)*S;
   q.fillStyle=districtMapColor(d);q.fillRect(x,y,CHUNK*S,CHUNK*S);
   if(detail&&zoom>.45){q.fillStyle='rgba(210,228,241,.78)';q.font='11px system-ui';q.fillText(d.name,x+5,y+15)}
 }
 q.strokeStyle='rgba(89,118,146,.62)';q.lineWidth=Math.max(1.5,8*(zoom/2));
 for(let cx=minCx;cx<=maxCx;cx++){const x=(cx*CHUNK-state.pos.x)*S;q.beginPath();q.moveTo(x,-H);q.lineTo(x,H);q.stroke()}
 for(let cz=minCz;cz<=maxCz;cz++){const y=(cz*CHUNK-state.pos.z)*S;q.beginPath();q.moveTo(-W,y);q.lineTo(W,y);q.stroke()}
 q.fillStyle='rgba(124,142,158,.92)';for(const b of colliders){const x=(b.minX-state.pos.x)*S,y=(b.minZ-state.pos.z)*S,w=(b.maxX-b.minX)*S,h=(b.maxZ-b.minZ)*S;if(Math.abs(x)>W||Math.abs(y)>H)continue;q.fillRect(x,y,w,h)}
 q.fillStyle='#63e2b0';
 for(const s of state.discoveredShops.filter(s=>s.cityId===state.cityId)){
   const dx=(s.x-state.pos.x)*S,dz=(s.z-state.pos.z)*S;if(Math.abs(dx)<W/2&&Math.abs(dz)<H/2){q.beginPath();q.arc(dx,dz,detail?4.4:3.2,0,Math.PI*2);q.fill()}
 }
 q.fillStyle='#d6a7ff';
 for(const p of state.propertyCatalog.filter(p=>p.cityId===state.cityId)){
   const dx=(p.x-state.pos.x)*S,dz=(p.z-state.pos.z)*S;if(Math.abs(dx)<W/2&&Math.abs(dz)<H/2){q.fillRect(dx-(detail?2.8:2.2),dz-(detail?2.8:2.2),detail?5.6:4.4,detail?5.6:4.4)}
 }
 const res=state.residenceId?propertyFromCatalog(state.residenceId):null;
 if(res){const dx=(res.x-state.pos.x)*S,dz=(res.z-state.pos.z)*S;q.strokeStyle='#ffd45c';q.lineWidth=detail?3:2;q.beginPath();q.arc(dx,dz,detail?8:6,0,Math.PI*2);q.stroke()}
 q.fillStyle='#4ea8ff';for(const p of police){const dx=(p.group.position.x-state.pos.x)*S,dz=(p.group.position.z-state.pos.z)*S;if(Math.abs(dx)<W/2&&Math.abs(dz)<H/2){q.beginPath();q.arc(dx,dz,detail?3.2:2.4,0,Math.PI*2);q.fill()}}
 q.fillStyle='#7ccf9c';for(const n of npcs){const dx=(n.group.position.x-state.pos.x)*S,dz=(n.group.position.z-state.pos.z)*S;if(Math.abs(dx)<W/2&&Math.abs(dz)<H/2){q.beginPath();q.arc(dx,dz,detail?1.9:1.4,0,Math.PI*2);q.fill()}}
 if(selectedNPC?.group?.parent){const dx=(selectedNPC.group.position.x-state.pos.x)*S,dz=(selectedNPC.group.position.z-state.pos.z)*S;q.strokeStyle='#8ee8ff';q.lineWidth=detail?2:1.4;q.beginPath();q.arc(dx,dz,detail?6:4,0,Math.PI*2);q.stroke()}
 q.rotate(state.yaw);q.fillStyle='#ffffff';q.beginPath();q.moveTo(0,-8*(zoom/2));q.lineTo(5*(zoom/2),6*(zoom/2));q.lineTo(0,3*(zoom/2));q.lineTo(-5*(zoom/2),6*(zoom/2));q.closePath();q.fill();q.restore()
}

function drawMap(){renderMapTo($('#minimap'),1.02);if(!$('#mapOverlay').classList.contains('hidden'))renderMapTo($('#bigMinimap'),bigMapZoom);const z=$('#mapZoomLabel');if(z)z.textContent=`${Math.round(bigMapZoom/.42*100)}%`}
function emergencyExit(){
 if(!state.interior)return;
 leaveInterior();toast('Retour dans la rue.')
}
function updateHUD(){
 const {cx,cz}=currentChunk(),d=districtFor(cx,cz),aq=activeQuest(),prog=Math.min(aq.target,progress(aq.goal));$('#hp').textContent=Math.round(state.hp);$('#armor').textContent=Math.round(state.armor);$('#coins').textContent=state.coins;$('#level').textContent=state.level;$('#wanted').textContent=state.wanted;
 $('#hungerVal').textContent=Math.round(state.hunger);$('#thirstVal').textContent=Math.round(state.thirst);$('#hygieneVal').textContent=Math.round(state.hygiene);
 $('#hungerBar').style.width=`${state.hunger}%`;$('#thirstBar').style.width=`${state.thirst}%`;$('#hygieneBar').style.width=`${state.hygiene}%`;
 $('#district').textContent=state.interior?'INTÉRIEUR':`${city().name.toUpperCase()} • ${d.name.toUpperCase()} • M${state.gameMonth} J${state.gameDay}`;$('#missionTitle').textContent=aq.title;$('#missionText').textContent=aq.id==='free'?aq.text:`${aq.text} (${prog}/${aq.target})`;
 const icon=state.weather==='clear'?'☀️':state.weather==='cloudy'?'☁️':'🌧️',period=state.timeOfDay<6||state.timeOfDay>20?'NUIT':state.timeOfDay<9?'MATIN':state.timeOfDay>17?'SOIR':'JOUR';$('#weatherChip').textContent=`${icon} ${period}`;
 maybeCompleteNpcMission();updateTargetHUD();updateFollowerCard()
}


function setupMapUI(){
 const open=()=>{$('#mapOverlay').classList.remove('hidden');drawMap()},close=()=>$('#mapOverlay').classList.add('hidden');
 $('#mapExpandBtn').onclick=open;$('#minimap').onclick=open;$('#closeMapOverlay').onclick=close;$('#mapOverlay').onclick=e=>e.target===$('#mapOverlay')&&close();
 const change=f=>{bigMapZoom=clamp(bigMapZoom*f,.18,2.2);drawMap()};
 $('#mapZoomIn').onclick=()=>change(1.25);$('#mapZoomOut').onclick=()=>change(.8);
 const map=$('#bigMinimap');map.addEventListener('wheel',e=>{e.preventDefault();change(e.deltaY<0?1.12:.89)},{passive:false});
 let pinchDist=0;
 map.addEventListener('touchstart',e=>{if(e.touches.length===2)pinchDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY)},{passive:true});
 map.addEventListener('touchmove',e=>{if(e.touches.length===2){e.preventDefault();const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinchDist){change(d/pinchDist);pinchDist=d}}},{passive:false})
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
 $('#sheet').classList.remove('hidden');
 $$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.panel===panel));
 const t=$('#sheetTitle'),b=$('#sheetBody');
 if(panel==='world'){t.textContent='Monde';b.innerHTML=worldHTML()}
 if(panel==='bag'){t.textContent='Inventaire';b.innerHTML=bagHTML()}
 if(panel==='home'){t.textContent='Immobilier';b.innerHTML=homeHTML()}
 if(panel==='quests'){t.textContent='Quêtes';b.innerHTML=questsHTML()}
 if(panel==='districts'){t.textContent='Quartiers';b.innerHTML=districtHTML()}
 if(panel==='settings'){t.textContent='Réglages';b.innerHTML=settingsHTML()}
 if(panel==='physicalShop'){t.textContent=SHOPS[state.interior.shopType].name;b.innerHTML=physicalShopHTML()}
 if(panel==='property'&&selectedProperty){t.textContent='Immobilier';b.innerHTML=propertySheetHTML(selectedProperty)}
 bindSheet(panel)
}
function worldHTML(){
 return `<div class="card"><h3>Vie urbaine</h3><p class="sub">Explore des quartiers pauvres, populaires, centraux, aisés et très riches. Les prix, la sécurité, les logements et le niveau de vie changent réellement.</p></div>
 <div class="card"><h3>Voyager</h3>${CITIES.map(c=>`<button class="menuBtn cityBtn" data-city="${c.id}" style="width:100%;margin-bottom:7px">${c.name}<small>${state.artifacts.includes(c.id)?'✅ Artefact trouvé':c.artifact}</small></button>`).join('')}</div>`
}
function bagHTML(){
 const ws=state.ownedWeapons.map(id=>WEAPONS[id]).map(w=>`<div class="item"><div class="itemIcon">${w.icon}</div><div class="itemMain"><b>${w.name}</b><small>${w.damage} dégâts</small></div><button class="menuBtn equip" data-w="${w.id}">${state.equipped===w.id?'Équipé':'Équiper'}</button></div>`).join('');
 const inv=state.inventory.length?state.inventory.map(i=>{
   const info=itemInfo(i.id);
   const use=CONSUMABLES[i.id]?`<button class="menuBtn useConsumable" data-id="${i.id}">Utiliser</button>`:i.id==='medkit'?'<button class="menuBtn useMed">Utiliser</button>':'';
   return `<div class="item"><div class="itemIcon">${info.icon}</div><div class="itemMain"><b>${info.name}</b><small>×${i.qty}${info.value?` • revente ${info.value}`:''}</small></div>${use}</div>`
 }).join(''):'<p class="sub">Sac vide.</p>';
 const arts=[...new Set(state.artifactBag)];
 return `<div class="card"><h3>État</h3><p class="sub">🍗 ${Math.round(state.hunger)} • 💧 ${Math.round(state.thirst)} • 🧼 ${Math.round(state.hygiene)}</p></div>
 <div class="card"><h3>Armes</h3>${ws}</div>
 <div class="card"><h3>Sac ${invCount()}/${state.bagMax}</h3>${inv}</div>
 <div class="card"><h3>Artefacts</h3>${arts.length?arts.map(id=>`<div class="item"><div class="itemIcon">💎</div><div class="itemMain"><b>${artifactLabel(id)}</b><small>×${artifactCount(id)} • 500 crédits</small></div></div>`).join(''):'<p class="sub">Aucun artefact.</p>'}</div>`
}
function questsHTML(){
 return `<div class="card"><h3>Progression générale</h3><p class="sub">Niveau ${state.level} • ${state.ownedDistricts.length} quartiers sécurisés • ${state.npcMissions} missions PNJ • ${state.artifacts.length}/${CITIES.length} artefacts.</p></div>
 ${QUESTS.map(q=>{const done=state.completedQuests.includes(q.id),p=Math.min(q.target,progress(q.goal));return `<div class="card"><h3>${done?'✅':'📌'} ${q.title}</h3><p class="sub">${q.text}</p><div class="progress"><i style="width:${p/q.target*100}%"></i></div><p class="sub">${p}/${q.target} • récompense ${q.reward} crédits</p></div>`}).join('')}
 ${state.activeNpcMission?`<div class="card"><h3>Mission de ${state.activeNpcMission.giver}</h3><p class="sub">${state.activeNpcMission.text} — ${Math.min(state.activeNpcMission.target,npcMissionProgress())}/${state.activeNpcMission.target}</p></div>`:''}`
}
function districtHTML(){
 const {cx,cz}=currentChunk(),d=districtFor(cx,cz),id=districtId(cx,cz);
 return `<div class="card"><h3>${d.name}</h3><p class="sub"><span class="${districtTierClass(d)}">${districtTierLabel(d)}</span> • richesse ${Math.round(d.wealth*100)}%</p>
 <p class="sub">${d.bonus}</p>
 <p class="sub">Immobilier : loyers ×${d.rentMult.toFixed(2)} • achat ×${d.buyMult.toFixed(2)}</p>
 <p class="sub">Police ${Math.round(d.policeRate*100)}% • délinquance ${Math.round(d.crimeRate*100)}%</p>
 <button class="menuBtn green" id="secureDistrict" style="width:100%" ${state.ownedDistricts.includes(id)?'disabled':''}>🏳️ ${state.ownedDistricts.includes(id)?'Quartier sécurisé':'Sécuriser ce quartier'}</button></div>`
}
function settingsHTML(){
 return `<div class="card"><h3>StreetQuest V13</h3><button class="menuBtn primary" id="forceUpdate" style="width:100%">↻ Vérifier la mise à jour</button></div>
 <div class="card"><h3>Immobilier</h3><p class="sub">Les loyers sont débités chaque mois. Un bien acheté est payé une seule fois puis peut devenir ta résidence ou être loué à un PNJ.</p></div>
 <div class="card"><h3>Carte</h3><p class="sub">Grande carte : +/−, molette sur PC ou pincement à deux doigts.</p></div>
 <div class="card"><h3>Réinitialisation</h3><button class="menuBtn red" id="resetGame">Nouvelle partie</button></div>`
}
function bindSheet(panel){
 if(panel==='world')$$('.cityBtn').forEach(b=>b.onclick=()=>switchCity(b.dataset.city));
 if(panel==='bag'){
   $$('.equip').forEach(b=>b.onclick=()=>{state.equipped=b.dataset.w;weaponRig.visible=b.dataset.w!=='fists';save();openSheet('bag')});
   $$('.useMed').forEach(b=>b.onclick=useMed);
   $$('.useConsumable').forEach(b=>b.onclick=()=>useConsumable(b.dataset.id))
 }
 if(panel==='home'){
   const rough=$('#sleepRough');if(rough)rough.onclick=sleepRough;
   $$('.setResidence').forEach(b=>b.onclick=()=>setResidence(b.dataset.id));
   $$('.endRental').forEach(b=>b.onclick=()=>endRental(b.dataset.id));
   $$('.toggleListing').forEach(b=>b.onclick=()=>togglePropertyListing(b.dataset.id));
   $$('.adjustRent').forEach(b=>b.onclick=()=>adjustAskingRent(b.dataset.id,Number(b.dataset.delta)))
 }
 if(panel==='districts'){const x=$('#secureDistrict');if(x)x.onclick=secureDistrict}
 if(panel==='settings'){
   const u=$('#forceUpdate');if(u)u.onclick=()=>window.streetQuestUpdate?.();
   $('#resetGame').onclick=()=>{if(confirm('Effacer toute la partie ?')){localStorage.removeItem('sq3d-v12');location.reload()}}
 }
 if(panel==='physicalShop')bindShop();
 if(panel==='property'){
   $$('.rentProperty').forEach(b=>b.onclick=()=>{const p=propertyFromCatalog(b.dataset.id);if(p)rentProperty(p)});
   $$('.buyProperty').forEach(b=>b.onclick=()=>{const p=propertyFromCatalog(b.dataset.id);if(p)buyProperty(p)});
   $$('.enterProperty').forEach(b=>b.onclick=()=>{const p=propertyFromCatalog(b.dataset.id);if(p){closeSheet();enterInterior('property',p)}})
 }
 $$('.inspectProperty').forEach(b=>b.onclick=()=>{const p=propertyFromCatalog(b.dataset.id);if(p){selectedProperty=p;openSheet('property')}})
}
function switchCity(id){clearTarget(false);state.cityId=id;state.pos={x:2,z:8};state.yaw=0;state.pitch=0;for(const[k]of[...chunks])unload(k);ensureChunks(true);save();closeSheet();toast(`Bienvenue à ${city().name}`)}
function useMed(){const x=state.inventory.find(i=>i.id==='medkit');if(!x)return toast('Aucun kit');if(state.hp>=state.maxHp)return toast('PV déjà au maximum');x.qty--;state.hp=clamp(state.hp+40,0,state.maxHp);if(x.qty<=0)state.inventory=state.inventory.filter(i=>i!==x);save();openSheet('bag')}
function closeSheet(){$('#sheet').classList.add('hidden')}
let toastTimer;function toast(m){
 const now=Date.now();if(m===lastToastMessage&&now-lastToastAt<1800)return;
 lastToastMessage=m;lastToastAt=now;
 const t=$('#toast');t.textContent=m;t.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.add('hidden'),1900)
}



$('#updateBtn').onclick=()=>window.streetQuestUpdate?.();$('#emergencyExitBtn').onclick=emergencyExit;$('#scanBtn').onclick=scan;$('#interactBtn').onclick=()=>currentInteractFn?currentInteractFn():toast(selectedNPC?'Suis ta cible : quand tu es bien derrière, la fouille démarre automatiquement.':'Touche un passant pour le sélectionner, ou approche-toi d’un objet.');$('#clearTarget').onclick=()=>clearTarget();$('#dismissFollower').onclick=dismissFollower;$('#attackBtn').onclick=attack;$('#fleeBtn').onclick=flee;$('#menuBtn').onclick=()=>openSheet('world');$('#closeSheet').onclick=closeSheet;$('#sheet').onclick=e=>e.target===$('#sheet')&&closeSheet();$$('.nav').forEach(b=>b.onclick=()=>openSheet(b.dataset.panel));
document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});document.addEventListener('gesturechange',e=>e.preventDefault(),{passive:false});document.addEventListener('gestureend',e=>e.preventDefault(),{passive:false});document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});document.addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault()},{passive:false});document.addEventListener('touchstart',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>document.hidden&&save());
init();