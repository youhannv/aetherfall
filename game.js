const THREE_URL='https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
let THREE=null;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),choice=a=>a[Math.floor(Math.random()*a.length)];
const CHUNK=72,LOAD=1,UNLOAD=2,RADIUS=.34;

const DISTRICTS=[
 {id:'docks',name:'Les Docks',tier:'poor',style:'poor',bonus:'Loyers très bas • délinquance élevée',wealth:.42,rentMult:.52,buyMult:.50,policeRate:.04,crimeRate:.20,density:1.56,cashMult:.58,itemMult:.78,propertyDemand:.68},
 {id:'popular',name:'Quartier Populaire',tier:'working',style:'old',bonus:'Immobilier accessible • vie de quartier',wealth:.74,rentMult:.79,buyMult:.77,policeRate:.08,crimeRate:.12,density:1.36,cashMult:.84,itemMult:.92,propertyDemand:.90},
 {id:'central',name:'Centre',tier:'mid',style:'central',bonus:'Commerces • tours modernes',wealth:1.02,rentMult:1.10,buyMult:1.16,policeRate:.12,crimeRate:.07,density:1.26,cashMult:1.04,itemMult:1.02,propertyDemand:1.06},
 {id:'garden',name:'Quartier des Jardins',tier:'rich',style:'green',bonus:'Calme • maisons • jardins',wealth:1.40,rentMult:1.46,buyMult:1.58,policeRate:.17,crimeRate:.035,density:.92,cashMult:1.46,itemMult:1.26,propertyDemand:1.18},
 {id:'heights',name:'Les Hauteurs',tier:'luxury',style:'luxury',bonus:'Très riche • villas • sécurité renforcée',wealth:1.96,rentMult:2.04,buyMult:2.30,policeRate:.24,crimeRate:.015,density:.74,cashMult:2.02,itemMult:1.50,propertyDemand:1.34},
 {id:'workshops',name:'Faubourg des Ateliers',tier:'working',style:'industrial',bonus:'Entrepôts • ateliers • maisons modestes',wealth:.66,rentMult:.71,buyMult:.69,policeRate:.07,crimeRate:.14,density:1.42,cashMult:.76,itemMult:.94,propertyDemand:.84}
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


const AVATAR_DEFAULT={
 skin:'#c89570',hair:'#2b211b',hairStyle:'short',
 top:'#355f8a',pants:'#202a34',shoes:'#11151a',
 accessory:'none',build:'standard'
};
const COSMETIC_ITEMS={
 cap_black:{id:'cap_black',name:'Casquette noire',icon:'🧢',price:55,kind:'accessory',value:'cap'},
 glasses_black:{id:'glasses_black',name:'Lunettes urbaines',icon:'🕶️',price:70,kind:'accessory',value:'glasses'},
 backpack_city:{id:'backpack_city',name:'Sac NeoCity',icon:'🎒',price:90,kind:'accessory',value:'backpack'},
 top_red:{id:'top_red',name:'Veste rouge',icon:'🧥',price:85,kind:'top',value:'#9b3d4a'},
 top_purple:{id:'top_purple',name:'Veste violette',icon:'🧥',price:110,kind:'top',value:'#6553a8'},
 top_black:{id:'top_black',name:'Veste noire',icon:'🧥',price:125,kind:'top',value:'#202733'},
 shoes_white:{id:'shoes_white',name:'Sneakers blanches',icon:'👟',price:80,kind:'shoes',value:'#e7edf1'}
};
function normalizedAvatar(a={}){
 const okHex=v=>/^#[0-9a-fA-F]{6}$/.test(v||'');
 const hairStyles=['short','buzz','long','curly'],accessories=['none','cap','glasses','backpack'],builds=['slim','standard','strong'];
 return{
  skin:okHex(a.skin)?a.skin:AVATAR_DEFAULT.skin,
  hair:okHex(a.hair)?a.hair:AVATAR_DEFAULT.hair,
  hairStyle:hairStyles.includes(a.hairStyle)?a.hairStyle:'short',
  top:okHex(a.top)?a.top:AVATAR_DEFAULT.top,
  pants:okHex(a.pants)?a.pants:AVATAR_DEFAULT.pants,
  shoes:okHex(a.shoes)?a.shoes:AVATAR_DEFAULT.shoes,
  accessory:accessories.includes(a.accessory)?a.accessory:'none',
  build:builds.includes(a.build)?a.build:'standard'
 }
}
function avatarPayload(){return {...normalizedAvatar(state.avatar),version:state.avatarVersion||1}}

SHOPS.clothes={name:'NeoStyle',icon:'👕',stock:Object.values(COSMETIC_ITEMS).map(x=>({id:x.id,name:x.name,icon:x.icon,price:x.price,desc:'Apparence multijoueur'}))};

const EDUCATION_PROGRAMS={
 vocational:{id:'vocational',name:'Certificat technique',icon:'🔧',cost:90,days:8,desc:'Nécessaire pour devenir mécanicien.'},
 police:{id:'police',name:'Académie de police',icon:'👮',cost:150,days:12,desc:'Formation pour intégrer la police.'},
 nursing:{id:'nursing',name:'École de soins',icon:'🩺',cost:220,days:16,desc:'Formation pour travailler dans les soins.'},
 university:{id:'university',name:'Diplôme universitaire',icon:'🎓',cost:320,days:22,desc:'Ouvre les emplois qualifiés de l’enseignement.'}
};
const JOB_DEFS={
 courier:{id:'courier',name:'Coursier',icon:'📦',sector:'private',company:'neoexpress',salary:115,qualification:null,mission:'delivery'},
 retail:{id:'retail',name:'Employé de commerce',icon:'🛒',sector:'private',company:'novamarket',salary:105,qualification:null,mission:'store'},
 mechanic:{id:'mechanic',name:'Mécanicien',icon:'🔧',sector:'private',company:'mecalab',salary:175,qualification:'vocational',mission:'repair'},
 nurse:{id:'nurse',name:'Soignant',icon:'🩺',sector:'public',company:'hospital',salary:205,qualification:'nursing',mission:'clinic'},
 policeOfficer:{id:'policeOfficer',name:'Policier',icon:'👮',sector:'public',company:'city',salary:220,qualification:'police',mission:'patrol'},
 teacher:{id:'teacher',name:'Enseignant',icon:'📚',sector:'public',company:'city',salary:235,qualification:'university',mission:'school'}
};
const COMPANY_TEMPLATES={
 neoexpress:{id:'neoexpress',name:'NeoExpress',sector:'private',cash:2200,npcWorkers:12,monthlyNpcRevenue:900},
 novamarket:{id:'novamarket',name:'Nova Market',sector:'private',cash:2600,npcWorkers:16,monthlyNpcRevenue:1150},
 mecalab:{id:'mecalab',name:'MécaLab',sector:'private',cash:3100,npcWorkers:10,monthlyNpcRevenue:1250},
 hospital:{id:'hospital',name:'Hôpital Horizon',sector:'public',cash:0,npcWorkers:24,monthlyNpcRevenue:0},
 city:{id:'city',name:'Ville',sector:'public',cash:0,npcWorkers:46,monthlyNpcRevenue:0}
};
const NPC_JOB_NAMES=['Livreur','Employé de commerce','Mécanicien','Soignant','Policier','Enseignant','Agent d’entretien','Employé de bureau','Restaurateur','Étudiant'];
function freshCompanies(){return Object.fromEntries(Object.entries(COMPANY_TEMPLATES).map(([k,v])=>[k,{...v}]))}
function absoluteGameDay(){return ((state.gameMonth||1)-1)*30+(state.gameDay||1)}
function jobDef(){return state.job?JOB_DEFS[state.job.id]||null:null}
function hasQualification(id){return !id||(state.education?.completed||[]).includes(id)}
function currentGrossSalary(){const j=jobDef();return j?j.salary:0}
function progressiveTax(amount){if(amount<=100)return Math.round(amount*.04);if(amount<=200)return Math.round(amount*.08);return Math.round(amount*.12)}
function pickNpcOccupation(socio,r){
 const roll=r();
 if(roll<.08)return{title:'Sans emploi',employer:null,boss:false};
 if(roll<.16)return{title:'Étudiant',employer:'École municipale',boss:false};
 const title=choice(NPC_JOB_NAMES.slice(0,-1)),boss=r()<(.035+socio.wealth*.025);
 return{title:boss?`Patron — ${title}`:title,employer:boss?'Entreprise locale':choice(['NeoExpress','Nova Market','MécaLab','Hôpital Horizon','Ville']),boss}
}


SHOPS.school={name:'Campus Municipal',icon:'🎓',stock:[]};
SHOPS.jobcenter={name:'Maison de l’Emploi',icon:'💼',stock:[]};
SHOPS.clinic={name:'Hôpital Horizon',icon:'🏥',stock:[]};

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
 landOwned:false,housingStage:0,homeLevel:1,homeBank:0,homeStorage:{medkit:0},homeStock:[],homePlaced:[],reputation:0,restCount:0,artifactBag:[],discoveredShops:[],hunger:70,thirst:70,hygiene:60,worldLayoutVersion:191,
 gameDay:1,gameMonth:1,agendaCustom:[],knownNpcOccupations:[],soundEnabled:true,avatarVersion:1,propertyCatalog:[],propertyPortfolio:[],residenceId:null,propertyCredit:0,monthlyLedger:'',missedRent:0,education:{current:null,completed:[]},job:null,workMission:null,companies:freshCompanies(),cityTreasury:4800,taxPaid:0,salaryHistory:[],workCompleted:0,schoolDays:0,avatar:{...AVATAR_DEFAULT},avatarCreated:false,cosmeticsUnlocked:[]
};
let state=loadState();
function loadState(){
 try{
   let raw=JSON.parse(localStorage.getItem('sq3d-v19')||'null');if(!raw)raw=JSON.parse(localStorage.getItem('sq3d-v18')||'null');if(!raw)raw=JSON.parse(localStorage.getItem('sq3d-v17')||'null');if(!raw)raw=JSON.parse(localStorage.getItem('sq3d-v16')||'null');if(!raw)raw=JSON.parse(localStorage.getItem('sq3d-v15')||'null');
   let migrated=false;
   if(!raw){raw=JSON.parse(localStorage.getItem('sq3d-v12')||'null');migrated=!!raw}
   if(!raw){raw=JSON.parse(localStorage.getItem('sq3d-v11')||'{}');migrated=!!Object.keys(raw).length}
   const loaded={
     ...structuredClone(base),...raw,
     pos:{...base.pos,...(raw.pos||{})},homeStorage:{...base.homeStorage,...(raw.homeStorage||{})},
     homeStock:raw.homeStock||[],homePlaced:raw.homePlaced||[],artifactBag:raw.artifactBag||[],discoveredShops:raw.discoveredShops||[],
     propertyCatalog:raw.propertyCatalog||[],propertyPortfolio:raw.propertyPortfolio||[],
     education:{current:null,completed:[],...(raw.education||{})},companies:{...freshCompanies(),...(raw.companies||{})},salaryHistory:raw.salaryHistory||[],agendaCustom:raw.agendaCustom||[],knownNpcOccupations:raw.knownNpcOccupations||[],soundEnabled:raw.soundEnabled!==false,avatar:normalizedAvatar(raw.avatar||AVATAR_DEFAULT),avatarCreated:!!raw.avatarCreated,avatarVersion:raw.avatarVersion||1,cosmeticsUnlocked:raw.cosmeticsUnlocked||[]
   };
   if(loaded.interior){loaded.pos=raw.returnPos&&Number.isFinite(raw.returnPos.x)&&Number.isFinite(raw.returnPos.z)?{x:raw.returnPos.x,z:raw.returnPos.z}:{...base.pos};loaded.interior=null;loaded.returnPos=null}
   if(migrated&&raw.housingStage){loaded.propertyCredit=(loaded.propertyCredit||0)+(raw.housingStage===1?180:raw.housingStage===2?1030:raw.housingStage>=3?2830:0);loaded.housingStage=0;loaded.landOwned=false}
   if((raw.worldLayoutVersion||0)!==191){
     loaded.propertyCatalog=[];
     loaded.discoveredShops=[];
     loaded.worldLayoutVersion=191;
   }
   return loaded
 }catch{return structuredClone(base)}
}
function save(){
 const snapshot={...state};
 if(state.interior){snapshot.pos=state.returnPos?{...state.returnPos}:{...base.pos};snapshot.interior=null;snapshot.returnPos=null}
 localStorage.setItem('sq3d-v19',JSON.stringify(snapshot))
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
function progress(goal){if(goal==='stolenCoins')return state.stolenCoins;if(goal==='coinsEarned')return state.coinsEarned;if(goal==='npcMissions')return state.npcMissions;if(goal==='districtsSeen')return state.seenDistricts.length;if(goal==='containersOpened')return state.containersOpened;if(goal==='districtsOwned')return state.ownedDistricts.length;if(goal==='housingStage')return state.residenceId?1:0;return 0}
function activeQuest(){return QUESTS.find(q=>!state.completedQuests.includes(q.id))||{id:'free',title:'Légende urbaine',text:'Explore librement, collectionne les artefacts et sécurise les quartiers.',goal:'districtsOwned',target:999}}
function checkQuests(){}

let scene,camera,renderer,clock,textures={},chunks=new Map(),colliders=[],interiorColliders=[],pickups=[],shops=[],apartments=[],properties=[],containers=[],npcs=[],enemies=[],police=[],cars=[],hidingZones=[],homePlots=[],trafficLights=[],alleys=[],entranceZones=[],pedNetworks=new Map(),clouds=[],starSystem=null,ambientGlowSystem=null;
let activeEnemy=null,activeEnemyEntity=null,moveStick={x:0,y:0},lookStick={x:0,y:0},weaponRig=null,interiorGroup=null,interiorSeller=null,lastChunkTick=0,lastMapTick=0,lastWeatherTick=0,selectedNPC=null,targetMarker=null,tailTheft=null,policeSeeing=false,hiddenTimer=0,lastCarHit=0,rainSystem=null,raycaster=null,tapStart=null,currentInteractFn=null,lastViewportHeight=window.innerHeight,keys={},lastPromptSig='',lastToastMessage='',lastToastAt=0,playerTrail=[],selectedProperty=null,bigMapZoom=.42,mapCenterOverride=null,mapFocusPropertyId=null,interiorBounds={x:8.5,z:8.5},mpSocket=null,remotePlayers=new Map(),mpLastSend=0,mpLastX=0,mpLastZ=0,mpLastYaw=0,mpLastProfileSync=0,mpStatusMessage='Hors ligne',mpRoomCount=0,currentPanel=null,conversationNPC=null,selectedRemotePlayerId=null,voiceEnabled=false,localVoiceStream=null,voicePeers=new Map(),mutedPlayers=new Set(),uiAudioCtx=null;


function mpServerUrl(){return 'https://streetquest-multiplayer.onrender.com'}
function mpNickname(){return (localStorage.getItem('sq-mp-name')||'Joueur'+Math.floor(100+Math.random()*900)).slice(0,18)}
function makeRemoteName(text){const c=document.createElement('canvas');c.width=256;c.height=64;const q=c.getContext('2d');q.fillStyle='rgba(5,16,25,.8)';q.fillRect(8,8,240,48);q.fillStyle='#dff7ff';q.font='700 24px system-ui';q.textAlign='center';q.textBaseline='middle';q.fillText(text,128,32);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));s.scale.set(2.8,.7,1);s.position.y=2.45;return s}
function buildRemoteAvatarMesh(p){
 const a=normalizedAvatar(p.avatar||{}),g=new THREE.Group();
 const skin=new THREE.MeshStandardMaterial({color:a.skin,roughness:.92});
 const top=new THREE.MeshStandardMaterial({color:a.top,roughness:.78});
 const pants=new THREE.MeshStandardMaterial({color:a.pants,roughness:.88});
 const shoes=new THREE.MeshStandardMaterial({color:a.shoes,roughness:.94});
 const hairM=new THREE.MeshStandardMaterial({color:a.hair,roughness:.95});
 const buildScale=a.build==='strong'?1.18:a.build==='slim'?.86:1;
 const armX=.35*buildScale,legX=.13*buildScale;
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.28*buildScale,.75,5,8),top);body.position.y=1.04;g.add(body);
 const shoulder=new THREE.Mesh(new THREE.BoxGeometry(.70*buildScale,.17,.28),top);shoulder.position.y=1.34;g.add(shoulder);
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.11,10),skin);neck.position.y=1.50;g.add(neck);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.25,16,14),skin);head.position.y=1.76;g.add(head);
 // Four deliberately distinct hair meshes so every hairstyle is visible remotely.
 if(a.hairStyle==='buzz'){
   const h=new THREE.Mesh(new THREE.SphereGeometry(.257,14,10),hairM);h.scale.set(1,.22,1);h.position.set(0,1.94,.01);g.add(h)
 }else if(a.hairStyle==='long'){
   const crown=new THREE.Mesh(new THREE.SphereGeometry(.262,14,11),hairM);crown.scale.set(1,.52,1);crown.position.set(0,1.92,.02);g.add(crown);
   const back=new THREE.Mesh(new THREE.BoxGeometry(.42,.48,.18),hairM);back.position.set(0,1.66,.15);g.add(back)
 }else if(a.hairStyle==='curly'){
   for(const [x,y,z,s] of [[0,1.96,0,.17],[-.16,1.90,0,.13],[.16,1.90,0,.13],[-.10,2.04,.02,.12],[.10,2.04,.02,.12]]){
     const curl=new THREE.Mesh(new THREE.SphereGeometry(s,10,8),hairM);curl.position.set(x,y,z);g.add(curl)
   }
 }else{
   const h=new THREE.Mesh(new THREE.SphereGeometry(.259,14,11),hairM);h.scale.set(1,.48,1);h.position.set(0,1.92,.01);g.add(h)
 }
 const fc=document.createElement('canvas');fc.width=96;fc.height=96;const f=fc.getContext('2d');
 f.fillStyle='#14181c';f.beginPath();f.arc(31,39,5,0,Math.PI*2);f.arc(65,39,5,0,Math.PI*2);f.fill();
 f.strokeStyle='#74404a';f.lineWidth=5;f.beginPath();f.moveTo(35,66);f.quadraticCurveTo(48,72,61,66);f.stroke();
 const ft=new THREE.CanvasTexture(fc);ft.colorSpace=THREE.SRGBColorSpace;
 const face=new THREE.Mesh(new THREE.PlaneGeometry(.235,.235),new THREE.MeshBasicMaterial({map:ft,transparent:true,depthWrite:false,side:THREE.DoubleSide}));face.position.set(0,1.75,-.252);face.rotation.y=Math.PI;g.add(face);
 for(const sx of [-armX,armX]){const arm=new THREE.Mesh(new THREE.BoxGeometry(.12*buildScale,.56,.12),skin);arm.position.set(sx,1.02,0);g.add(arm)}
 for(const sx of [-legX,legX]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.15*buildScale,.67,.17),pants);leg.position.set(sx,.38,0);g.add(leg);const shoe=new THREE.Mesh(new THREE.BoxGeometry(.17*buildScale,.09,.27),shoes);shoe.position.set(sx,.04,-.03);g.add(shoe)}
 if(a.accessory==='cap'){
   const capM=new THREE.MeshStandardMaterial({color:0x20252b,roughness:.9});const cap=new THREE.Mesh(new THREE.CylinderGeometry(.29,.29,.10,12),capM);cap.position.y=2.00;g.add(cap);const visor=new THREE.Mesh(new THREE.BoxGeometry(.38,.04,.18),capM);visor.position.set(0,1.96,-.22);g.add(visor)
 }else if(a.accessory==='glasses'){
   const glM=new THREE.MeshStandardMaterial({color:0x15191e,metalness:.25});for(const x of [-.105,.105]){const lens=new THREE.Mesh(new THREE.TorusGeometry(.10,.018,6,12),glM);lens.position.set(x,1.78,-.235);lens.rotation.y=Math.PI;g.add(lens)}const bridge=new THREE.Mesh(new THREE.BoxGeometry(.09,.025,.025),glM);bridge.position.set(0,1.78,-.24);g.add(bridge)
 }else if(a.accessory==='backpack'){
   const bp=new THREE.Mesh(new THREE.BoxGeometry(.42*buildScale,.52,.18),new THREE.MeshStandardMaterial({color:0x303944,roughness:.9}));bp.position.set(0,1.02,.27);g.add(bp)
 }
 g.add(makeRemoteName(p.name||'Joueur'));return g
}

function avatarSignature(a){const n=normalizedAvatar(a||{});return [n.skin,n.hair,n.hairStyle,n.top,n.pants,n.shoes,n.accessory,n.build].join('|')}
function applyRemoteProfile(p){
 let r=remotePlayers.get(p.id);if(!r){createRemoteAvatar(p);return remotePlayers.get(p.id)}
 const incomingSig=avatarSignature(p.avatar),incomingVersion=Number(p.avatarVersion||p.avatar?.version||1);
 if(incomingSig!==r.avatarSignature||incomingVersion>Number(r.avatarVersion||1)){refreshRemoteAvatar(p);r=remotePlayers.get(p.id)}
 if(r){r.voice=!!p.voice;r.interior=!!p.interior;r.group.visible=!state.interior&&!r.interior&&!r.interior}
 return r
}

function createRemoteAvatar(p){
 if(!scene||remotePlayers.has(p.id))return;
 const g=buildRemoteAvatarMesh(p);g.position.set(p.x||0,0,p.z||0);g.rotation.y=p.yaw||0;g.visible=!state.interior&&!p.interior;scene.add(g);
 remotePlayers.set(p.id,{id:p.id,group:g,targetX:p.x||0,targetZ:p.z||0,targetYaw:p.yaw||0,name:p.name,avatar:normalizedAvatar(p.avatar||{}),avatarSignature:avatarSignature(p.avatar),avatarVersion:Number(p.avatarVersion||p.avatar?.version||1),voice:!!p.voice,interior:!!p.interior})
}
function refreshRemoteAvatar(p){
 const old=remotePlayers.get(p.id);if(!old)return createRemoteAvatar(p);
 const pos=old.group.position.clone(),rot=old.group.rotation.y,targetX=old.targetX,targetZ=old.targetZ,targetYaw=old.targetYaw,voice=old.voice,inside=old.interior;
 scene.remove(old.group);remotePlayers.delete(p.id);
 createRemoteAvatar({...p,x:pos.x,z:pos.z,yaw:rot,voice:p.voice??voice,interior:p.interior??inside});
 const r=remotePlayers.get(p.id);if(r){r.targetX=Number.isFinite(p.x)?p.x:targetX;r.targetZ=Number.isFinite(p.z)?p.z:targetZ;r.targetYaw=Number.isFinite(p.yaw)?p.yaw:targetYaw}
}
function removeRemoteAvatar(id){
 const r=remotePlayers.get(id);
 if(r?.group?.parent)scene.remove(r.group);
 remotePlayers.delete(id)
}
function updateRemotePlayers(dt){
 for(const r of remotePlayers.values()){
   if(!r?.group)continue;
   r.group.position.x+=(r.targetX-r.group.position.x)*Math.min(1,dt*10);
   r.group.position.z+=(r.targetZ-r.group.position.z)*Math.min(1,dt*10);
   let dy=((r.targetYaw-r.group.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;
   r.group.rotation.y+=dy*Math.min(1,dt*10);
   r.group.visible=!state.interior
 }
}
function addChatLine(name,msg,system=false){
 const box=$('#chatMessages');if(!box)return;
 const p=document.createElement('p');p.className=system?'system':'';
 p.innerHTML=system?String(msg):`<b>${String(name).replace(/[<>]/g,'')}</b> : ${String(msg).replace(/[<>]/g,'')}`;
 box.appendChild(p);
 while(box.children.length>30)box.removeChild(box.firstChild);
 box.scrollTop=box.scrollHeight
}
function setMpStatus(ok,count=0,message=''){
 const b=$('#onlineBtn');if(b)b.classList.toggle('connected',ok);
 const c=$('#onlineCount');if(c)c.textContent=ok?count:0;
 mpRoomCount=ok?count:0;
 mpStatusMessage=message||(ok?'Connecté':'Hors ligne');
 const s=$('#mpLiveStatus');if(s)s.textContent=mpStatusMessage;
 const rc=$('#mpRoomCount');if(rc)rc.textContent=String(mpRoomCount)
}


function playUiTone(kind='tap'){
 if(!state.soundEnabled)return;
 try{uiAudioCtx=uiAudioCtx||new (window.AudioContext||window.webkitAudioContext)();if(uiAudioCtx.state==='suspended')uiAudioCtx.resume();const o=uiAudioCtx.createOscillator(),g=uiAudioCtx.createGain();o.type='sine';o.frequency.value=kind==='confirm'?660:kind==='alert'?260:440;g.gain.setValueAtTime(.0001,uiAudioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.035,uiAudioCtx.currentTime+.008);g.gain.exponentialRampToValueAtTime(.0001,uiAudioCtx.currentTime+.10);o.connect(g);g.connect(uiAudioCtx.destination);o.start();o.stop(uiAudioCtx.currentTime+.11)}catch{}
}
function voiceLabel(){return voiceEnabled?'🎙️ Vocal actif':'🎙️ Activer le vocal'}
function closeVoicePeer(id){const v=voicePeers.get(id);if(!v)return;try{v.pc?.close()}catch{};if(v.audio?.parentNode)v.audio.remove();voicePeers.delete(id)}
function closeAllVoicePeers(){for(const id of [...voicePeers.keys()])closeVoicePeer(id)}
function voicePeer(id){
 let v=voicePeers.get(id);if(v)return v;
 const pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});
 const audio=document.createElement('audio');audio.autoplay=true;audio.playsInline=true;audio.dataset.peer=id;$('#audioHost')?.appendChild(audio);
 v={pc,audio,pendingIce:[]};voicePeers.set(id,v);
 if(localVoiceStream)for(const tr of localVoiceStream.getTracks())pc.addTrack(tr,localVoiceStream);
 pc.onicecandidate=e=>{if(e.candidate&&mpSocket?.connected)mpSocket.emit('voice:signal',{to:id,kind:'ice',candidate:e.candidate})};
 pc.ontrack=e=>{audio.srcObject=e.streams[0];audio.play().catch(()=>{})};
 pc.onconnectionstatechange=()=>{if(['failed','closed'].includes(pc.connectionState))closeVoicePeer(id)};
 return v
}
async function flushVoiceIce(v){if(!v?.pc.remoteDescription)return;for(const c of v.pendingIce.splice(0)){try{await v.pc.addIceCandidate(c)}catch{}}}
async function voiceMaybeConnect(id){
 if(!voiceEnabled||!mpSocket?.connected||!id||id===mpSocket.id)return;
 const r=remotePlayers.get(id);if(!r?.voice||voicePeers.has(id))return;
 if(String(mpSocket.id)>String(id))return; // one deterministic initiator
 try{const v=voicePeer(id),offer=await v.pc.createOffer();await v.pc.setLocalDescription(offer);mpSocket.emit('voice:signal',{to:id,kind:'offer',sdp:v.pc.localDescription})}catch(e){console.warn('voice offer',e)}
}
async function handleVoiceSignal(m){
 if(!voiceEnabled||!m?.from)return;
 try{
   const v=voicePeer(m.from);
   if(m.kind==='offer'){await v.pc.setRemoteDescription(m.sdp);await flushVoiceIce(v);const answer=await v.pc.createAnswer();await v.pc.setLocalDescription(answer);mpSocket.emit('voice:signal',{to:m.from,kind:'answer',sdp:v.pc.localDescription})}
   else if(m.kind==='answer'){await v.pc.setRemoteDescription(m.sdp);await flushVoiceIce(v)}
   else if(m.kind==='ice'&&m.candidate){if(v.pc.remoteDescription)await v.pc.addIceCandidate(m.candidate);else v.pendingIce.push(m.candidate)}
 }catch(e){console.warn('voice signal',e)}
}
async function enableVoice(){
 if(voiceEnabled)return;
 if(!navigator.mediaDevices?.getUserMedia)return toast('Le micro n’est pas disponible sur ce navigateur.');
 try{localVoiceStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});voiceEnabled=true;mpSocket?.emit('voice:state',{enabled:true});for(const [id,r] of remotePlayers)if(r.voice)voiceMaybeConnect(id);playUiTone('confirm');toast('🎙️ Vocal de proximité activé.');if(currentPanel==='social')openSheet('social')}
 catch(e){console.warn(e);toast('Autorisation micro refusée ou indisponible.')}
}
function disableVoice(){voiceEnabled=false;mpSocket?.emit('voice:state',{enabled:false});closeAllVoicePeers();if(localVoiceStream){for(const t of localVoiceStream.getTracks())t.stop();localVoiceStream=null}toast('Micro coupé.');if(currentPanel==='social')openSheet('social')}
function updateVoiceVolumes(){
 for(const [id,v] of voicePeers){const r=remotePlayers.get(id);if(!r||!v.audio)continue;const d=Math.hypot(state.pos.x-r.group.position.x,state.pos.z-r.group.position.z);let vol=(state.interior||r.interior)?0:(d<=5?1:d>=25?0:1-(d-5)/20);if(mutedPlayers.has(id))vol=0;v.audio.volume=clamp(vol,0,1)}
}
function nearestRemotePlayer(max=2.4){let best=null,bd=max;for(const [id,r] of remotePlayers){if(!r?.group?.parent)continue;const d=Math.hypot(state.pos.x-r.group.position.x,state.pos.z-r.group.position.z);if(d<bd){best={id,...r,d};bd=d}}return best}
function openPlayerInteraction(id){if(!remotePlayers.has(id))return toast('Ce joueur n’est plus ici.');selectedRemotePlayerId=id;openSheet('player')}
function playerInteractionHTML(){
 const r=remotePlayers.get(selectedRemotePlayerId);if(!r)return `<div class="card"><p class="sub">Ce joueur n’est plus à proximité.</p></div>`;
 const d=Math.hypot(state.pos.x-r.group.position.x,state.pos.z-r.group.position.z),muted=mutedPlayers.has(selectedRemotePlayerId);
 return `<div class="card playerIdentity"><div class="sectionKicker">JOUEUR À ${d.toFixed(1)} M</div><h3>👤 ${r.name}</h3><p class="sub">${r.voice?'🎙️ Vocal disponible':'🔇 Micro non actif'} • ${streetCoords()}</p></div>
 <div class="card"><div class="grid2"><button class="menuBtn playerWave">👋 Saluer</button><button class="menuBtn playerCoords">📍 Partager ma position</button><button class="menuBtn playerGroup">👥 Inviter au groupe</button><button class="menuBtn playerMute">${muted?'🔊 Réactiver':'🔇 Couper sa voix'}</button></div></div>
 <div class="card"><label class="sub">Message privé</label><div class="directRow"><input id="directMsg" class="lifeInput" maxlength="100" placeholder="Écrire à ${r.name}"><button class="menuBtn primary sendDirect">Envoyer</button></div></div>`
}
function bindPlayerInteraction(){
 const id=selectedRemotePlayerId,r=remotePlayers.get(id);if(!r)return;
 $('.playerWave')?.addEventListener('click',()=>{mpSocket?.emit('player:interaction',{to:id,type:'wave'});mpSocket?.emit('player:emote',{emote:'👋'});toast(`Tu salues ${r.name}.`)});
 $('.playerCoords')?.addEventListener('click',()=>{mpSocket?.emit('player:interaction',{to:id,type:'coords',text:streetCoords()});toast('Position partagée.')});
 $('.playerGroup')?.addEventListener('click',()=>{mpSocket?.emit('player:interaction',{to:id,type:'group'});toast('Invitation envoyée.')});
 $('.playerMute')?.addEventListener('click',()=>{mutedPlayers.has(id)?mutedPlayers.delete(id):mutedPlayers.add(id);updateVoiceVolumes();openSheet('player')});
 $('.sendDirect')?.addEventListener('click',()=>{const i=$('#directMsg'),m=i?.value.trim();if(!m)return;mpSocket?.emit('chat:direct',{to:id,message:m});addChatLine(`🔒 Moi → ${r.name}`,m);i.value='';toast('Message privé envoyé.')})
}

function disconnectMultiplayer(){disableVoice();if(mpSocket){mpSocket.disconnect();mpSocket=null}for(const id of [...remotePlayers.keys()])removeRemoteAvatar(id);setMpStatus(false,0);addChatLine('', 'Mode solo.',true)}
function connectMultiplayer(_url=mpServerUrl(),name=mpNickname()){
 const url='https://streetquest-multiplayer.onrender.com';
 localStorage.setItem('sq-mp-url',url);
 localStorage.setItem('sq-mp-name',(name||'Joueur').slice(0,18));
 if(!window.io){
   setMpStatus(false,0,'Client Socket.IO non chargé');
   toast('Le module multijoueur ne s’est pas chargé. Recharge la page.');
   return
 }
 if(mpSocket){try{mpSocket.removeAllListeners();mpSocket.disconnect()}catch{}mpSocket=null}
 for(const id of [...remotePlayers.keys()])removeRemoteAvatar(id);
 setMpStatus(false,0,'Connexion au serveur…');
 mpSocket=window.io(url,{
   path:'/socket.io',
   transports:['polling','websocket'],
   upgrade:true,
   timeout:20000,
   reconnection:true,
   reconnectionAttempts:Infinity,
   reconnectionDelay:1000,
   reconnectionDelayMax:5000,
   forceNew:true
 });
 mpSocket.on('connect',()=>{
   setMpStatus(true,1,'Connecté — inscription dans '+state.cityId);
   mpSocket.emit('player:join',{name:(name||mpNickname()).slice(0,18),city:state.cityId,x:state.pos.x,z:state.pos.z,yaw:state.yaw,color:0x5fa7d8,avatar:avatarPayload(),avatarVersion:state.avatarVersion||1});
   if(voiceEnabled)setTimeout(()=>mpSocket?.emit('voice:state',{enabled:true}),80);
   addChatLine('',`Connecté au serveur comme ${name||mpNickname()}. Ville : ${state.cityId}.`,true)
 });
 mpSocket.on('world:players',list=>{
   for(const id of [...remotePlayers.keys()])removeRemoteAvatar(id);
   for(const p of list||[])if(p.id!==mpSocket.id){createRemoteAvatar(p);if(voiceEnabled&&p.voice)voiceMaybeConnect(p.id)};
   setMpStatus(true,(list||[]).length,`Connecté • ${(list||[]).length} joueur(s) à ${state.cityId}`)
 });
 mpSocket.on('world:count',n=>setMpStatus(true,n,`Connecté • ${n} joueur(s) à ${state.cityId}`));
 mpSocket.on('player:joined',p=>{
   if(p.id!==mpSocket.id){createRemoteAvatar(p);if(voiceEnabled&&p.voice)voiceMaybeConnect(p.id)}
   addChatLine('',`${p.name} arrive dans ${state.cityId}.`,true)
 });
 mpSocket.on('player:left',p=>{closeVoicePeer(p.id);removeRemoteAvatar(p.id);addChatLine('',`${p.name||'Un joueur'} est parti.`,true)});
 mpSocket.on('player:appearance',p=>{if(p.id!==mpSocket.id)applyRemoteProfile(p)});
 mpSocket.on('player:presence',p=>{if(p.id!==mpSocket.id){const r=applyRemoteProfile(p);if(r){r.interior=!!p.interior;r.group.visible=!state.interior&&!r.interior}}});
 mpSocket.on('player:moved',p=>{
   if(p.id===mpSocket.id)return;
   const r=applyRemoteProfile(p);
   if(r){r.targetX=p.x;r.targetZ=p.z;r.targetYaw=p.yaw;r.interior=!!p.interior;r.group.visible=!state.interior&&!r.interior}
 });
 mpSocket.on('chat:message',m=>addChatLine(m.name,m.message));
 mpSocket.on('player:emote',m=>{const r=remotePlayers.get(m.id);if(r)toast(`${m.name} ${m.emote}`)});
 mpSocket.on('player:voice',p=>{const r=remotePlayers.get(p.id);if(r){r.voice=!!p.voice;if(r.voice&&voiceEnabled)voiceMaybeConnect(p.id);if(!r.voice)closeVoicePeer(p.id)}if(currentPanel==='social')openSheet('social')});
 mpSocket.on('voice:signal',handleVoiceSignal);
 mpSocket.on('chat:direct',m=>{addChatLine(`🔒 ${m.name}`,m.message);toast(`Message privé de ${m.name}`)});
 mpSocket.on('player:interaction',m=>{if(m.type==='wave')toast(`${m.name} te salue 👋`);if(m.type==='coords'){addChatLine('',`${m.name} partage sa position : ${m.text}`,true);toast(`📍 Position reçue de ${m.name}`)}if(m.type==='group')toast(`👥 ${m.name} t’invite dans son groupe.`)});
 mpSocket.on('disconnect',reason=>{closeAllVoicePeers();setMpStatus(false,0,'Déconnecté : '+reason)});
 mpSocket.on('connect_error',err=>{
   setMpStatus(false,0,'Connexion impossible : '+(err?.message||'erreur'));
   console.warn('StreetQuest multiplayer',err?.message||err)
 })
}
function multiplayerTick(t,dt){
 updateRemotePlayers(dt);updateVoiceVolumes();
 if(!mpSocket?.connected)return;
 if(t-mpLastProfileSync>5000){
   mpLastProfileSync=t;mpSocket.emit('player:profile-sync',{avatar:avatarPayload(),avatarVersion:state.avatarVersion||1,interior:!!state.interior})
 }
 if(state.interior)return;
 if(t-mpLastSend<100)return;
 const moved=Math.hypot(state.pos.x-mpLastX,state.pos.z-mpLastZ)>.03||Math.abs(state.yaw-mpLastYaw)>.02;
 if(moved){
   mpLastSend=t;mpLastX=state.pos.x;mpLastZ=state.pos.z;mpLastYaw=state.yaw;
   mpSocket.emit('player:move',{city:state.cityId,x:state.pos.x,z:state.pos.z,yaw:state.yaw,interior:false})
 }
}
function multiplayerSettingsHTML(){
 const connected=!!mpSocket?.connected;
 return `<div class="card">
   <h3>🌐 Multijoueur StreetQuest</h3>
   <p class="sub">Le serveur est configuré automatiquement. Aucun lien à saisir.</p>
   <div class="item">
     <div class="itemIcon">🛰️</div>
     <div class="itemMain"><b id="mpLiveStatus">${mpStatusMessage}</b><small>Serveur officiel Render</small></div>
     <span class="propertyTag">${connected?'🟢 En ligne':'⚪ Hors ligne'}</span>
   </div>
   <div class="item">
     <div class="itemIcon">🌍</div>
     <div class="itemMain"><b>Salle : ${state.cityId}</b><small>Pour vous voir, les joueurs doivent être dans la même ville.</small></div>
     <span class="propertyTag"><span id="mpRoomCount">${mpRoomCount}</span> 👤</span>
   </div>
   <label class="sub" for="mpName">Ton pseudo</label>
   <input class="lifeInput mpNameInput" id="mpName" value="${mpNickname()}" maxlength="18" autocomplete="nickname" autocapitalize="words" spellcheck="false" placeholder="Ex : Youhann">
   <div class="grid2" style="margin-top:8px">
     <button class="menuBtn primary" id="mpConnect">🌐 RECONNECTER</button>
     <button class="menuBtn red" id="mpDisconnect">Déconnecter</button>
   </div>
   <p class="sub">Important : Paris et Rome sont deux salles différentes. Deux joueurs dans des villes différentes ne peuvent pas se voir.</p>
 </div>`
}


function show3DFatal(message){
 console.error('StreetQuest 3D fatal:',message);
 let d=$('#renderFatal');
 if(!d){
   d=document.createElement('div');d.id='renderFatal';
   d.style.cssText='position:absolute;z-index:90;left:10px;right:10px;top:240px;padding:12px;border-radius:12px;background:#541c25;color:white;border:1px solid #ff7187;font:700 12px system-ui;white-space:pre-wrap';
   $('#viewport')?.appendChild(d)
 }
 d.textContent='ERREUR 3D : '+String(message)
}

async function init(){
 try{THREE=await import(THREE_URL)}catch{return toast('Connexion requise au premier lancement du moteur 3D')}
 // Extra recovery guard for older saves or interrupted updates.
 if(state.interior){
   state.pos=state.returnPos&&Number.isFinite(state.returnPos.x)&&Number.isFinite(state.returnPos.z)?{...state.returnPos}:{...base.pos};
   state.interior=null;state.returnPos=null;save()
 }
 const host=$('#threeHost');scene=new THREE.Scene();scene.background=new THREE.Color(0x5f7898);scene.fog=new THREE.Fog(0x5f7898,68,230);
 camera=new THREE.PerspectiveCamera(72,host.clientWidth/host.clientHeight,.06,260);
 try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}catch(err){show3DFatal(err?.message||err);return}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(host.clientWidth,host.clientHeight);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 host.appendChild(renderer.domElement);clock=new THREE.Clock();raycaster=new THREE.Raycaster();
 scene.add(new THREE.HemisphereLight(0xd8eeff,0x334030,2.15));
 const sun=new THREE.DirectionalLight(0xffefd0,2.0);sun.name='sun';sun.position.set(45,75,28);scene.add(sun);
 const fill=new THREE.DirectionalLight(0x8dc8ff,.32);fill.position.set(-35,30,-25);scene.add(fill);
 textures=createTextures();weaponRig=createWeaponRig();camera.add(weaponRig);scene.add(camera);
 createAtmosphere();setupWorldTap();setupDesktopControls();setupMapUI();
 localStorage.setItem('sq-mp-url','https://streetquest-multiplayer.onrender.com');
 updateCamera();updateHUD();animate();
 try{ensureChunks(true);ensureOutdoorPositionClear()}
 catch(err){console.error('StreetQuest world startup',err);toast('⚠️ Rechargement de la ville…');setTimeout(()=>{try{ensureChunks(true)}catch(e){console.error(e)}},450)}
 setTimeout(()=>connectMultiplayer(mpServerUrl(),mpNickname()),1600);setTimeout(()=>{if(!state.avatarCreated)openSheet('avatar')},2300);
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
 // layered cloud clusters
 for(let i=0;i<12;i++){
   const gr=new THREE.Group();
   const mat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.15,depthWrite:false});
   for(let j=0;j<5;j++){
     const s=new THREE.Mesh(new THREE.SphereGeometry(3.5+Math.random()*3.4,9,7),mat);
     s.scale.y=.34+.1*Math.random();
     s.position.set((j-2)*3.5+Math.random()*2,Math.random()*1.8,Math.random()*2.5);
     gr.add(s)
   }
   gr.position.set((Math.random()-.5)*180,30+Math.random()*16,(Math.random()-.5)*180);scene.add(gr);clouds.push(gr)
 }
 // rain system
 const count=480,pos=new Float32Array(count*3);
 for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*56;pos[i*3+1]=Math.random()*28;pos[i*3+2]=(Math.random()-.5)*56}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
 rainSystem=new THREE.Points(geo,new THREE.PointsMaterial({color:0xc8e8ff,size:.065,transparent:true,opacity:.55}));
 rainSystem.visible=false;scene.add(rainSystem);
 // night stars
 const sCount=420,sPos=new Float32Array(sCount*3);
 for(let i=0;i<sCount;i++){sPos[i*3]=(Math.random()-.5)*260;sPos[i*3+1]=54+Math.random()*42;sPos[i*3+2]=(Math.random()-.5)*260}
 const sGeo=new THREE.BufferGeometry();sGeo.setAttribute('position',new THREE.BufferAttribute(sPos,3));
 starSystem=new THREE.Points(sGeo,new THREE.PointsMaterial({color:0xe4f5ff,size:.12,transparent:true,opacity:.72,depthWrite:false}));
 scene.add(starSystem);
 // small ambient cyber glows floating around the player
 const gCount=120,gPos=new Float32Array(gCount*3);
 for(let i=0;i<gCount;i++){gPos[i*3]=(Math.random()-.5)*36;gPos[i*3+1]=.4+Math.random()*4.5;gPos[i*3+2]=(Math.random()-.5)*36}
 const gGeo=new THREE.BufferGeometry();gGeo.setAttribute('position',new THREE.BufferAttribute(gPos,3));
 ambientGlowSystem=new THREE.Points(gGeo,new THREE.PointsMaterial({color:0x7fe2ff,size:.11,transparent:true,opacity:.18,depthWrite:false}));
 scene.add(ambientGlowSystem)
}
function updateAtmosphere(dt){
 const day=Math.max(.06,Math.sin((state.timeOfDay-6)/24*Math.PI*2)*.5+.5);
 for(const c of clouds){c.position.x+=dt*.55;c.position.z+=(state.weather==='cloudy'?.06:.02);if(c.position.x-state.pos.x>110)c.position.x-=220;if(c.position.z-state.pos.z>110)c.position.z-=220}
 if(rainSystem){
   rainSystem.visible=state.weather==='rain'&&!state.interior;
   rainSystem.position.set(state.pos.x,0,state.pos.z);
   if(rainSystem.visible){const a=rainSystem.geometry.attributes.position.array;for(let i=0;i<a.length;i+=3){a[i+1]-=dt*18;if(a[i+1]<0)a[i+1]=28}rainSystem.geometry.attributes.position.needsUpdate=true}
 }
 if(starSystem){starSystem.visible=!state.interior;starSystem.material.opacity=(1-day)*.9;starSystem.position.set(state.pos.x,0,state.pos.z)}
 if(ambientGlowSystem){ambientGlowSystem.visible=!state.interior;ambientGlowSystem.material.opacity=.06+(1-day)*.06+(state.weather==='rain'?.03:0);ambientGlowSystem.position.set(state.pos.x,0,state.pos.z);const a=ambientGlowSystem.geometry.attributes.position.array;for(let i=0;i<a.length;i+=3){a[i+1]+=Math.sin((performance.now()/800)+(i*.1))*0.0025}ambientGlowSystem.geometry.attributes.position.needsUpdate=true}
}



function addRoadStripe(g,x,z,w,d,mat,y=.038){
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);m.rotation.x=-Math.PI/2;m.position.set(x,y,z);g.add(m);return m
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
 for(let i=0;i<7;i++){
   addRoadStripe(g,x0+roadW/2,z0+24+i*8.2,.14,3.6,laneMat,.028);
   addRoadStripe(g,x0+24+i*8.2,z0+roadW/2,3.6,.14,laneMat,.029)
 }

 const zebra=new THREE.MeshBasicMaterial({color:0xffffff});
 for(let k=0;k<7;k++){
   const off=k*.82;
   addRoadStripe(g,x0+roadW/2,z0+14.0+off,roadW-.8,.50,zebra,.040);
   addRoadStripe(g,x0+roadW/2,z0-8.9+off,roadW-.8,.50,zebra,.040);
   addRoadStripe(g,x0+14.0+off,z0+roadW/2,.50,roadW-.8,zebra,.041);
   addRoadStripe(g,x0-8.9+off,z0+roadW/2,.50,roadW-.8,zebra,.041)
 }

 // Stop lines correspond exactly to the V19 simulation.
 addRoadStripe(g,x0+7.8,z0-10.0,3.4,.27,laneMat,.044);   // northbound
 addRoadStripe(g,x0+3.2,z0+20.0,3.4,.27,laneMat,.044);   // southbound
 addRoadStripe(g,x0-10.0,z0+3.2,.27,3.4,laneMat,.045);   // eastbound
 addRoadStripe(g,x0+20.0,z0+7.8,.27,3.4,laneMat,.045);   // westbound

 for(const [lx,lz] of [[15.2,25],[15.2,54],[49,15.2],[66,15.2],[82.7,39],[39,82.7]])addLamp(g,x0+lx,z0+lz);
 addBench(g,x0+18,z0+23);

 // V19.1 — primary French-style signal: right side of the driver's approach, BEFORE the crossing.
 // Local signal face = +Z.
 // Northbound (+Z): right side = east, signal faces south (-Z).
 addTrafficLight(g,x0+11.70,z0-10.15,'vertical',Math.PI,'northbound');
 // Southbound (-Z): right side = west, signal faces north (+Z).
 addTrafficLight(g,x0-.70,z0+20.15,'vertical',0,'southbound');
 // Eastbound (+X): right side = south, signal faces west (-X).
 addTrafficLight(g,x0-10.15,z0-.70,'horizontal',-Math.PI/2,'eastbound');
 // Westbound (-X): right side = north, signal faces east (+X).
 addTrafficLight(g,x0+20.15,z0+11.70,'horizontal',Math.PI/2,'westbound')
}
function addTrafficLight(g,x,z,axis,rot=0,approach=''){
 const group=new THREE.Group();
 const metal=new THREE.MeshStandardMaterial({color:0x20272e,metalness:.62,roughness:.38});
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.045,.055,2.72,10),metal);
 pole.position.y=1.36;group.add(pole);

 // Head sits slightly toward the road from the pole.
 const box=new THREE.Mesh(
   new THREE.BoxGeometry(.34,.82,.25),
   new THREE.MeshStandardMaterial({color:0x10161b,roughness:.60,metalness:.15})
 );
 box.position.set(0,2.34,.18);group.add(box);

 // PlaneGeometry front normal is +Z. FrontSide means lights cannot be seen through the back.
 const lens=(y,color)=>{
   const m=new THREE.Mesh(
     new THREE.CircleGeometry(.074,18),
     new THREE.MeshBasicMaterial({color,side:THREE.FrontSide})
   );
   m.position.set(0,y,.312);group.add(m);return m
 };
 const red=lens(2.54,0x59151d),green=lens(2.15,0x163b25);

 // Visor above each lens, also on the front only.
 const hoodMat=new THREE.MeshStandardMaterial({color:0x070b0f,roughness:.88});
 for(const yy of [2.61,2.22]){
   const hood=new THREE.Mesh(new THREE.BoxGeometry(.23,.07,.13),hoodMat);
   hood.position.set(0,yy,.35);group.add(hood)
 }

 // Back plate makes the rear obviously different from the signal face.
 const back=new THREE.Mesh(
   new THREE.PlaneGeometry(.26,.70),
   new THREE.MeshStandardMaterial({color:0x05080a,side:THREE.FrontSide})
 );
 back.rotation.y=Math.PI;back.position.set(0,2.34,.045);group.add(back);

 const base=new THREE.Mesh(
   new THREE.CylinderGeometry(.10,.13,.09,10),
   new THREE.MeshStandardMaterial({color:0x2b343c,roughness:.8})
 );
 base.position.y=.045;group.add(base);

 group.position.set(x,0,z);group.rotation.y=rot;
 g.add(group);trafficLights.push({group,red,green,axis,approach})
}
function plannedShopType(cx,cz){
 const fixed={
  '0,0':'corner',
  '1,0':'housing',
  '-1,0':'pawn',
  '0,1':'home',
  '0,-1':'gear',
  '1,1':'rare',
  '2,0':'school',
  '-2,0':'jobcenter',
  '2,1':'clinic',
  '-1,1':'clothes'
 };
 const fk=`${cx},${cz}`;if(fixed[fk])return fixed[fk];
 // About one commercial block every 5 chunks, deterministic.
 const h=hashStr(`${state.cityId}:shop-plan:${cx}:${cz}`);
 if(h%100>=26)return null;
 const pool=['corner','corner','gear','pawn','home','rare','clothes'];
 return pool[(h>>>8)%pool.length]
}




function rotateBlockPoint(p,turn=0,mirror=false){
 let x=p.x-43,z=p.z-43;
 if(mirror)x=-x;
 for(let i=0;i<turn;i++){const nx=-z,nz=x;x=nx;z=nz}
 return{x:x+43,z:z+43}
}
function addUrbanPlaza(g,key,x0,z0,feature,r){
 if(!feature)return;
 const x=x0+feature.x,z=z0+feature.z,size=feature.size||8;
 if(feature.type==='garden'){
   const floor=new THREE.Mesh(new THREE.CircleGeometry(size/2,20),new THREE.MeshStandardMaterial({map:textures.grass,roughness:1}));
   floor.rotation.x=-Math.PI/2;floor.position.set(x,.035,z);g.add(floor);
   for(const [dx,dz] of [[-2.5,-2],[2.4,2.0]]){
     if(!placementBlocked(x+dx,z+dz,.9))addTree(g,x+dx,z+dz,r)
   }
   if(!placementBlocked(x-2.0,z+2.3,.75))addBench(g,x-2.0,z+2.3);
   return
 }
 const mat=feature.type==='yard'
   ?new THREE.MeshStandardMaterial({color:0x596066,roughness:1})
   :new THREE.MeshStandardMaterial({color:0x9c9b94,roughness:1});
 const p=new THREE.Mesh(new THREE.PlaneGeometry(size,size),mat);
 p.rotation.x=-Math.PI/2;p.position.set(x,.025,z);g.add(p);
 if(feature.type==='plaza'){
   if(!placementBlocked(x-2.4,z+2,.75))addBench(g,x-2.4,z+2);
   if(!placementBlocked(x+2.4,z-2,.75))addBench(g,x+2.4,z-2)
 }else{
   const lineM=new THREE.MeshStandardMaterial({color:0xd6c36f,roughness:1});
   for(const dx of [-2,0,2]){
     const line=new THREE.Mesh(new THREE.PlaneGeometry(.10,size*.72),lineM);
     line.rotation.x=-Math.PI/2;line.position.set(x+dx,.032,z);g.add(line)
   }
 }
}

const CITY_BLOCK_TEMPLATES={
 courtyard:{parcels:[
   {x:26,z:26,w:20,d:20,face:'south',v:0},{x:68,z:26,w:20,d:20,face:'south',v:1},
   {x:26,z:68,w:20,d:20,face:'west',v:0},{x:68,z:68,w:20,d:20,face:'north',v:1}
  ],feature:{type:'plaza',x:43,z:43,size:9}},
 avenue:{parcels:[
   {x:25,z:25,w:19,d:18,face:'south',v:1},{x:67,z:25,w:21,d:18,face:'south',v:2},
   {x:25,z:67,w:19,d:21,face:'west',v:0},{x:67,z:67,w:21,d:21,face:'east',v:1}
  ],feature:{type:'plaza',x:43,z:43,size:8}},
 garden:{parcels:[
   {x:25,z:25,w:17,d:17,face:'south',v:3,houseBias:.95},{x:67,z:25,w:17,d:17,face:'south',v:3,houseBias:.95},
   {x:25,z:67,w:17,d:17,face:'west',v:3,houseBias:.95},{x:67,z:67,w:17,d:17,face:'north',v:3,houseBias:.95}
  ],feature:{type:'garden',x:43,z:43,size:11}},
 towers:{parcels:[
   {x:26,z:26,w:20,d:20,face:'south',v:4,houseBias:0},{x:67,z:26,w:20,d:20,face:'east',v:4,houseBias:0},
   {x:26,z:67,w:20,d:20,face:'west',v:4,houseBias:0},{x:67,z:67,w:20,d:20,face:'north',v:4,houseBias:0}
  ],feature:{type:'plaza',x:43,z:43,size:10}},
 workers:{parcels:[
   {x:25,z:25,w:18,d:18,face:'south',v:0,houseBias:.05},{x:67,z:25,w:18,d:18,face:'south',v:0,houseBias:.05},
   {x:25,z:67,w:18,d:18,face:'west',v:1,houseBias:.05},{x:67,z:67,w:18,d:18,face:'east',v:1,houseBias:.05}
  ],feature:{type:'yard',x:43,z:43,size:9}},
 service:{parcels:[
   {x:25,z:25,w:19,d:19,face:'south',v:2,houseBias:0},{x:67,z:25,w:20,d:19,face:'east',v:2,houseBias:0},
   {x:25,z:67,w:19,d:20,face:'west',v:1,houseBias:0},{x:67,z:67,w:20,d:20,face:'north',v:2,houseBias:0}
  ],feature:{type:'yard',x:43,z:43,size:11}},
 starter:{parcels:[
   {x:25,z:25,w:18,d:18,face:'south',v:0},{x:67,z:25,w:18,d:18,face:'south',v:1},
   {x:25,z:67,w:18,d:18,face:'west',v:0},{x:67,z:67,w:18,d:18,face:'north',v:1}
  ],feature:{type:'plaza',x:43,z:43,size:10}}
};
function cityTemplateNames(d,startChunk=false){
 if(startChunk)return ['starter'];
 if(d.style==='green')return ['garden','courtyard'];
 if(d.tier==='luxury')return ['garden','towers','courtyard'];
 if(d.style==='central')return ['towers','avenue','courtyard'];
 if(d.style==='industrial')return ['service','workers'];
 if(d.tier==='poor')return ['workers','avenue'];
 if(d.tier==='rich')return ['courtyard','avenue','garden'];
 return ['courtyard','avenue','starter']
}
function rotateFace(face,turn=0,mirror=false){
 let f=face;if(mirror){if(f==='east')f='west';else if(f==='west')f='east'}
 const order=['north','east','south','west'];let i=order.indexOf(f);if(i<0)return f;return order[(i+turn)%4]
}
function rotateParcel(p,turn=0,mirror=false){
 let x=p.x-43,z=p.z-43,w=p.w,d=p.d;if(mirror)x=-x;
 for(let i=0;i<turn;i++){const nx=-z,nz=x;x=nx;z=nz;const q=w;w=d;d=q}
 return{...p,x:x+43,z:z+43,w,d,face:rotateFace(p.face,turn,mirror)}
}
function buildCityBlockPlan(cx,cz,d,r,startChunk=false){
 const names=cityTemplateNames(d,startChunk),name=names[Math.floor(r()*names.length)],tpl=CITY_BLOCK_TEMPLATES[name];
 const turn=startChunk?0:Math.floor(r()*4),mirror=!startChunk&&r()<.5;
 const parcels=tpl.parcels.map((p,i)=>({...rotateParcel(p,turn,mirror),order:i}));
 const feature=tpl.feature?{...tpl.feature,...rotateBlockPoint(tpl.feature,turn,mirror)}:null;
 return{name,turn,mirror,parcels,feature}
}
function chooseCommercialParcel(plan){
 if(!plan?.parcels?.length)return -1;
 return plan.parcels.map((p,i)=>({i,score:(p.face==='south'?0:p.face==='west'?1:p.face==='east'?2:3)})).sort((a,b)=>a.score-b.score)[0]?.i??0
}


function validateGeneratedChunk(key,g){
 const buildingCount=colliders.filter(c=>c.key===key&&['building','house','shop'].includes(c.type)).length;
 const peopleCount=[...npcs,...police,...enemies].filter(n=>n.key===key&&n.group?.parent).length;
 const carCount=cars.filter(c=>c.key===key&&c.group?.parent).length;
 if(buildingCount===0||peopleCount===0||carCount===0){
   console.warn('StreetQuest chunk diagnostic',key,{buildingCount,peopleCount,carCount})
 }
 return{buildingCount,peopleCount,carCount}
}

function createChunk(cx,cz){
 const key=ck(cx,cz);if(chunks.has(key))return;
 const r=rngFor(key),g=new THREE.Group();g.userData={key,cx,cz};scene.add(g);chunks.set(key,g);
 const x0=cx*CHUNK,z0=cz*CHUNK,d=districtFor(cx,cz);
 try{
   const grass=new THREE.Mesh(new THREE.PlaneGeometry(CHUNK,CHUNK),new THREE.MeshStandardMaterial({map:textures.grass,roughness:1}));
   grass.rotation.x=-Math.PI/2;grass.position.set(x0+CHUNK/2,-.04,z0+CHUNK/2);g.add(grass);
   makeRoad(g,x0,z0);addAlleyNetwork(g,key,x0,z0,d,r);pedNetworks.set(key,buildPedNetwork(x0,z0));
   const id=districtId(cx,cz);if(!state.seenDistricts.includes(id))state.seenDistricts.push(id);

   const startChunk=cx===0&&cz===0,plannedShop=plannedShopType(cx,cz);
   let plan=null,shopIndex=-1;
   try{
     plan=buildCityBlockPlan(cx,cz,d,r,startChunk);
     shopIndex=plannedShop?chooseCommercialParcel(plan):-1;
     addUrbanPlaza(g,key,x0,z0,plan.feature,r);
     if(plannedShop&&shopIndex>=0){
       const p=plan.parcels[shopIndex];addShop(g,key,x0+p.x,z0+p.z,r,plannedShop,p)
     }
     for(let i=0;i<plan.parcels.length;i++){
       if(i===shopIndex)continue;
       const p=plan.parcels[i];addDenseBuilding(g,key,x0+p.x,z0+p.z,d,r,i,p.v,true,p)
     }
   }catch(blockErr){
     console.error('V19.1 block generation',key,blockErr)
   }

   const trees=d.style==='green'?5:d.tier==='luxury'?3:2;
   for(let i=0;i<trees;i++){const p=randomGreenPoint(x0,z0,r);if(!placementBlocked(p.x,p.z,1.2))addTree(g,p.x,p.z,r)}
   for(let i=0;i<(d.style==='green'?4:2);i++){const p=randomGreenPoint(x0,z0,r);if(!placementBlocked(p.x,p.z,.95))addBush(g,key,p.x,p.z,r)}

   if(r()<.58){const p=randomAlleyPoint(x0,z0,r),idc=`${key}:container:0`;if(!state.collected.includes(idc)&&!placementBlocked(p.x,p.z,.7))addContainer(g,key,idc,p.x,p.z,r()<.72?'bin':'chest')}
   if(r()<.52){const p=randomAlleyPoint(x0,z0,r),idl=`${key}:loot:0`;if(!state.collected.includes(idl)&&!placementBlocked(p.x,p.z,.55))addPickup(g,key,idl,p.x,p.z,r()<.72?'medkit':'rare')}

   try{
     const npcN=3+Math.floor(r()*3)+(d.style==='central'?1:0);
     for(let i=0;i<npcN;i++){const p=randomPedestrianPath(x0,z0,r);p.district=d.id;addNPC(g,key,p.x,p.z,r,p)}
     if(r()<d.crimeRate*.72){const p=randomPedestrianPath(x0,z0,r);p.district=d.id;addEnemy(g,key,p.x,p.z,r,p)}
     const policeN=r()<Math.min(.58,d.policeRate*1.8)?1:0;
     for(let i=0;i<policeN;i++){const p=randomPedestrianPath(x0,z0,r);p.district=d.id;addPolice(g,key,p.x,p.z,r,p)}
   }catch(popErr){console.error('V19.1 population generation',key,popErr)}

   try{
     const carN=(d.style==='central'?3:2)+Math.floor(r()*2);
     for(let i=0;i<carN;i++)addCar(g,key,x0,z0,r,i);
     if(r()<.24)addParkedCar(g,key,x0,z0,r)
   }catch(carErr){console.error('V19.1 traffic generation',key,carErr)}
   validateGeneratedChunk(key,g)
 }catch(err){console.error('Chunk creation error',key,err);toast("⚠️ Erreur de chargement d’un quartier")}
}
function randomSidewalk(x0,z0,r){
 const side=Math.floor(r()*4);
 if(side===0)return{x:x0+12.5,z:z0+20+r()*(CHUNK-27),axis:'z',min:z0+18,max:z0+CHUNK-2};
 if(side===1)return{x:x0+84.5,z:z0+20+r()*(CHUNK-27),axis:'z',min:z0+18,max:z0+CHUNK-2};
 if(side===2)return{x:x0+20+r()*(CHUNK-27),z:z0+12.5,axis:'x',min:x0+18,max:x0+CHUNK-2};
 return{x:x0+20+r()*(CHUNK-27),z:z0+84.5,axis:'x',min:x0+18,max:x0+CHUNK-2}
}
function randomAlleyPoint(x0,z0,r){
 if(r()<.5)return{x:x0+43,z:z0+18+r()*48};
 return{x:x0+18+r()*48,z:z0+43}
}

function buildPedNetwork(x0,z0){
 const outer=[
  {x:x0+12.5,z:z0+19},{x:x0+12.5,z:z0+43},{x:x0+12.5,z:z0+67},
  {x:x0+20,z:z0+84.5},{x:x0+43,z:z0+84.5},{x:x0+66,z:z0+84.5},
  {x:x0+84.5,z:z0+67},{x:x0+84.5,z:z0+43},{x:x0+84.5,z:z0+20},
  {x:x0+66,z:z0+12.5},{x:x0+43,z:z0+12.5},{x:x0+20,z:z0+12.5}
 ];
 const inner=[
  {x:x0+43,z:z0+18},{x:x0+43,z:z0+30},{x:x0+43,z:z0+43},
  {x:x0+55,z:z0+43},{x:x0+68,z:z0+43},{x:x0+55,z:z0+43},
  {x:x0+43,z:z0+43},{x:x0+43,z:z0+56},{x:x0+43,z:z0+68},
  {x:x0+43,z:z0+56},{x:x0+43,z:z0+43},{x:x0+31,z:z0+43},
  {x:x0+18,z:z0+43},{x:x0+31,z:z0+43},{x:x0+43,z:z0+43}
 ];
 return{outer,inner}
}
function spacedPersonPosition(x,z,min=1.45){
 for(const n of [...npcs,...police,...enemies]){
   if(!n?.group?.parent)continue;
   if(Math.hypot(x-n.group.position.x,z-n.group.position.z)<min)return false
 }
 return !entityBlocked(x,z,.38)
}
function sampleRouteStart(route,r){
 for(let tries=0;tries<20;tries++){
   const i=Math.floor(r()*route.length),a=route[i],b=route[(i+1)%route.length],t=.14+r()*.72;
   const x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t;
   if(spacedPersonPosition(x,z,1.45))return{x,z,route,routeIndex:(i+1)%route.length}
 }
 const p=route[Math.floor(r()*route.length)];
 return{x:p.x,z:p.z,route,routeIndex:(route.indexOf(p)+1)%route.length}
}
function randomPedestrianPath(x0,z0,r){
 const key=ck(Math.floor(x0/CHUNK),Math.floor(z0/CHUNK));
 const net=pedNetworks.get(key)||buildPedNetwork(x0,z0);
 return sampleRouteStart(r()<.72?net.outer:net.inner,r)
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




function structureRect(x,z,w,d,margin=.70){
 return{minX:x-w/2-margin,maxX:x+w/2+margin,minZ:z-d/2-margin,maxZ:z+d/2+margin}
}
function rectsTouch(a,b){
 return a.maxX>b.minX&&a.minX<b.maxX&&a.maxZ>b.minZ&&a.minZ<b.maxZ
}
function corridorRect(ax,az,bx,bz,width=1.55){
 if(Math.abs(ax-bx)>=Math.abs(az-bz))return{minX:Math.min(ax,bx)-.18,maxX:Math.max(ax,bx)+.18,minZ:az-width/2,maxZ:az+width/2};
 return{minX:ax-width/2,maxX:ax+width/2,minZ:Math.min(az,bz)-.18,maxZ:Math.max(az,bz)+.18}
}
function corridorBlocked(key,rect){
 for(const c of colliders){
   if(c.key!==key||!['building','house','shop','playerHome'].includes(c.type))continue;
   if(rectsTouch(rect,c))return true
 }
 for(const e of entranceZones)if(e.key===key&&rectsTouch(rect,e))return true;
 return false
}
function chooseAccessibleEntrance(key,x,z,w,d,bx0,bz0,preferredFace=null){
 const candidates=[
  {face:'west',kind:'street',doorX:x-w/2-.04,doorZ:z,pathX:bx0+12.5,pathZ:z,dist:(x-w/2)-(bx0+12.5),rot:Math.PI/2},
  {face:'east',kind:'street',doorX:x+w/2+.04,doorZ:z,pathX:bx0+84.5,pathZ:z,dist:(bx0+84.5)-(x+w/2),rot:-Math.PI/2},
  {face:'south',kind:'street',doorX:x,doorZ:z-d/2-.04,pathX:x,pathZ:bz0+12.5,dist:(z-d/2)-(bz0+12.5),rot:Math.PI},
  {face:'north',kind:'street',doorX:x,doorZ:z+d/2+.04,pathX:x,pathZ:bz0+84.5,dist:(bz0+84.5)-(z+d/2),rot:0},
  {face:'west',kind:'alley',doorX:x-w/2-.04,doorZ:z,pathX:bx0+43,pathZ:z,dist:Math.abs((x-w/2)-(bx0+43)),rot:Math.PI/2},
  {face:'east',kind:'alley',doorX:x+w/2+.04,doorZ:z,pathX:bx0+43,pathZ:z,dist:Math.abs((x+w/2)-(bx0+43)),rot:-Math.PI/2},
  {face:'south',kind:'alley',doorX:x,doorZ:z-d/2-.04,pathX:x,pathZ:bz0+43,dist:Math.abs((z-d/2)-(bz0+43)),rot:Math.PI},
  {face:'north',kind:'alley',doorX:x,doorZ:z+d/2+.04,pathX:x,pathZ:bz0+43,dist:Math.abs((z+d/2)-(bz0+43)),rot:0}
 ].filter(e=>{
   if(e.face==='west'&&e.pathX>=e.doorX)return false;if(e.face==='east'&&e.pathX<=e.doorX)return false;
   if(e.face==='south'&&e.pathZ>=e.doorZ)return false;if(e.face==='north'&&e.pathZ<=e.doorZ)return false;
   return e.dist>=0&&e.dist<18
 }).sort((a,b)=>{
   const ap=preferredFace&&a.face===preferredFace?0:1,bp=preferredFace&&b.face===preferredFace?0:1;if(ap!==bp)return ap-bp;
   const ak=a.kind==='street'?0:1,bk=b.kind==='street'?0:1;if(ak!==bk)return ak-bk;return a.dist-b.dist
 });
 for(const e of candidates){
   const c=corridorRect(e.doorX,e.doorZ,e.pathX,e.pathZ,1.75);
   if(!corridorBlocked(key,c))return{...e,corridor:c,outX:e.doorX+(e.face==='west'?-1:e.face==='east'?1:0)*.90,outZ:e.doorZ+(e.face==='south'?-1:e.face==='north'?1:0)*.90}
 }
 return null
}
function buildingSpotFree(key,x,z,w,d,bx0,bz0){
 const rect=structureRect(x,z,w,d,.78);
 // Hard setbacks from all four sidewalks.
 if(rect.minX<bx0+15.15||rect.maxX>bx0+CHUNK-4.65||rect.minZ<bz0+15.15||rect.maxZ>bz0+CHUNK-4.65)return false;
 // Central pedestrian alleys remain completely clear.
 const alleyX=bx0+43,alleyZ=bz0+43;
 if(rect.minX<alleyX+3.35&&rect.maxX>alleyX-3.35)return false;
 if(rect.minZ<alleyZ+3.35&&rect.maxZ>alleyZ-3.35)return false;
 for(const c of colliders){
   if(c.key!==key||!['building','house','shop','playerHome'].includes(c.type))continue;
   if(rectsTouch(rect,c))return false
 }
 for(const e of entranceZones)if(e.key===key&&rectsTouch(rect,e))return false;
 return !!chooseAccessibleEntrance(key,x,z,w,d,bx0,bz0)
}
function resolveBuildingSpot(key,x,z,w,d,bx0,bz0){
 const minX=bx0+16.0+w/2,maxX=bx0+CHUNK-5.45-w/2;
 const minZ=bz0+16.0+d/2,maxZ=bz0+CHUNK-5.45-d/2;
 if(minX>maxX||minZ>maxZ)return null;
 const offsets=[
  [0,0],[1.8,0],[-1.8,0],[0,1.8],[0,-1.8],
  [3.4,0],[-3.4,0],[0,3.4],[0,-3.4],
  [3.2,2.7],[-3.2,2.7],[3.2,-2.7],[-3.2,-2.7],
  [5.0,1.6],[-5.0,1.6],[5.0,-1.6],[-5.0,-1.6]
 ];
 for(const [dx,dz] of offsets){
   const px=clamp(x+dx,minX,maxX),pz=clamp(z+dz,minZ,maxZ);
   if(buildingSpotFree(key,px,pz,w,d,bx0,bz0))return{x:px,z:pz}
 }
 return null
}
function registerEntranceZone(key,e,id=''){
 if(!e?.corridor)return;
 entranceZones.push({...e.corridor,key,id,type:'entrance'})
}
function placementBlocked(x,z,pad=.6){
 const r={minX:x-pad,maxX:x+pad,minZ:z-pad,maxZ:z+pad};
 return colliders.some(c=>rectsTouch(r,c))||entranceZones.some(e=>rectsTouch(r,e))
}

function makePropertyListing(key,x,z,isHouse,d,r,serial=0){
 const id=`${key}:property:${serial}:${Math.round(x)}:${Math.round(z)}`,pr=rngFor(id);
 let type;if(isHouse){type=d.tier==='luxury'?(pr()<.62?'villa':'house'):(pr()<.86?'house':'flat3')}else{const roll=pr();if(d.tier==='poor')type=roll<.52?'studio':roll<.88?'flat2':'flat3';else if(d.tier==='luxury')type=roll<.18?'flat2':roll<.68?'flat3':'villa';else type=roll<.34?'studio':roll<.76?'flat2':'flat3'}
 const t=PROPERTY_TYPES[type],area=Math.round(t.baseArea+pr()*t.areaVar),quality=.82+pr()*.36+(d.wealth-1)*.12;
 const rent=Math.max(12,Math.round(t.baseRent*d.rentMult*(area/t.baseArea)*quality)),buyPrice=Math.max(220,Math.round(t.baseBuy*d.buyMult*(area/t.baseArea)*quality/10)*10);
 const rooms=type==='studio'?1:type==='flat2'?2:type==='flat3'?3:type==='house'?4+Math.floor(pr()*2):6+Math.floor(pr()*3);
 const marketed=pr()<.48,offer=pr()<.34?'rent':pr()<.67?'sale':'both';
 return{id,cityId:state.cityId,key,cx:Math.floor(x/CHUNK),cz:Math.floor(z/CHUNK),x,z,type,area,rooms,rent,buyPrice,districtId:d.id,districtName:d.name,tier:d.tier,demand:d.propertyDemand,marketed,offer,agency:'Agence Habitat'}
}
function rememberProperty(p){
 const i=state.propertyCatalog.findIndex(x=>x.id===p.id);
 if(i<0)state.propertyCatalog.push({...p});else state.propertyCatalog[i]={...state.propertyCatalog[i],...p}
}
function addPropertyEntrance(g,key,x,z,w,dep,isHouse,d,r,serial,entrance){
 const e=entrance||chooseAccessibleEntrance(key,x,z,w,dep,Math.floor(x/CHUNK)*CHUNK,Math.floor(z/CHUNK)*CHUNK);
 if(!e)return null;
 const p=makePropertyListing(key,e.doorX,e.doorZ,isHouse,d,r,serial);
 const mat=new THREE.MeshStandardMaterial({color:isHouse?0x553b2d:0x42362f,roughness:.82,side:THREE.DoubleSide});
 const door=new THREE.Mesh(new THREE.PlaneGeometry(isHouse?1.08:1.48,isHouse?2.15:2.45),mat);
 door.position.set(e.doorX,1.15,e.doorZ);door.rotation.y=e.rot;g.add(door);
 const step=new THREE.Mesh(new THREE.BoxGeometry(e.face==='west'||e.face==='east'?.18:1.55,.08,e.face==='west'||e.face==='east'?1.55:.18),new THREE.MeshStandardMaterial({color:0xa7afb4,roughness:1}));
 step.position.set(e.outX,.04,e.outZ);g.add(step);
 if(p.marketed){
   const txt=p.offer==='rent'?'À LOUER':p.offer==='sale'?'À VENDRE':'À VENDRE / LOUER';
   const plaque=makeFacadeSign(`${txt} • Agence Habitat`,'#e9f8ff');plaque.scale.set(.20,.20,.20);
   plaque.position.set(e.doorX+(e.face==='west'?-1:e.face==='east'?1:0)*.08,1.82,e.doorZ+(e.face==='south'?-1:e.face==='north'?1:0)*.08);
   plaque.rotation.y=e.rot;g.add(plaque)
 }
 const record={...p,key,doorX:e.outX,doorZ:e.outZ,entranceFace:e.face};
 properties.push(record);rememberProperty({...p,x:e.outX,z:e.outZ,entranceFace:e.face});
 registerEntranceZone(key,e,p.id);
 return record
}
function portfolioRecord(id){return state.propertyPortfolio.find(p=>p.id===id)||null}
function propertyFromCatalog(id){return state.propertyCatalog.find(p=>p.id===id)||properties.find(p=>p.id===id)||null}
function propertyAcquired(p){return !!portfolioRecord(p.id)}


function addDenseBuilding(g,key,x,z,d,r,i,variant=0,planned=false,parcel=null){
 const central=d.style==='central',green=d.style==='green',poor=d.style==='poor',lux=d.style==='luxury';
 const houseChance=parcel?.houseBias??(lux?.78:green?.66:poor?.14:d.style==='old'?.38:.20);
 const isHouse=r()<houseChance;
 const scale=[.76,.92,1.08,.86,1.16][variant]||1;
 let w=(isHouse?(lux?8.8:7.2)+r()*(lux?4.0:2.2):(poor?7.0:8.0)+r()*(poor?2.2:3.0))*scale;
 let dep=(isHouse?(lux?8.6:7.0)+r()*(lux?4.0:2.3):(poor?7.0:8.0)+r()*2.8)*(variant===2?.90:1);
 const h=isHouse?(lux?5.4+r()*4.3:4.2+r()*3.0):(central?15+r()*31:lux?17+r()*27:poor?9+r()*13:10+r()*18);
 const styleRoll=!isHouse?Math.floor(r()*4):0;
 if(parcel){
   const maxW=Math.max(7,parcel.w-1.25),maxD=Math.max(7,parcel.d-1.25);
   w=Math.min(w,maxW/(styleRoll===2?1.12:1));dep=Math.min(dep,maxD/(styleRoll===2?1.08:1));
   x+=(r()-.5)*.18;z+=(r()-.5)*.18
 }else if(!planned){x+=(r()-.5)*(lux?3.4:2.1);z+=(r()-.5)*(lux?3.4:2.1)}
 let outerW=styleRoll===2?w*1.12:w+.35,outerD=styleRoll===2?dep*1.08:dep+.35;
 const bx0=Math.floor(x/CHUNK)*CHUNK,bz0=Math.floor(z/CHUNK)*CHUNK;
 const resolved=resolveBuildingSpot(key,x,z,outerW,outerD,bx0,bz0);if(!resolved)return;
 x=resolved.x;z=resolved.z;
 const entrance=chooseAccessibleEntrance(key,x,z,w,dep,bx0,bz0,parcel?.face||null);if(!entrance)return;

 const texChoice=poor?choice([textures.brick,textures.residential,textures.panel]):lux?choice([textures.neonGlass,textures.stone,textures.modern]):central?choice([textures.neonGlass,textures.modern,textures.panel]):d.style==='industrial'?choice([textures.panel,textures.stone,textures.modern]):choice([textures.residential,textures.brick,textures.modern]);
 const isGlass=texChoice===textures.neonGlass||texChoice===textures.modern;
 const bodyMat=new THREE.MeshStandardMaterial({map:texChoice,roughness:isGlass?.32:.82,metalness:isGlass?.22:.05,emissive:isGlass?0x0f2236:0x000000,emissiveIntensity:isGlass?.22:0});
 const main=new THREE.Mesh(new THREE.BoxGeometry(w,h,dep),bodyMat);main.position.set(x,h/2,z);g.add(main);
 if(!isHouse&&styleRoll===1&&h>16){const crown=new THREE.Mesh(new THREE.BoxGeometry(w*.72,Math.max(3,h*.14),dep*.72),bodyMat);crown.position.set(x,h+Math.max(1.5,h*.07),z);g.add(crown)}
 if(!isHouse&&styleRoll===2&&h>14){
   const canopy=new THREE.Mesh(new THREE.BoxGeometry(w*1.12,.24,dep*1.08),new THREE.MeshStandardMaterial({map:textures.panel,roughness:.72,metalness:.1}));
   canopy.position.set(x,3.15,z);g.add(canopy)
 }
 if(!isHouse&&styleRoll===3&&h>18){for(const sx of [-1,1]){const fin=new THREE.Mesh(new THREE.BoxGeometry(.2,h*.72,dep*.9),new THREE.MeshStandardMaterial({color:0x83dfff,emissive:0x2d5a71,emissiveIntensity:.55}));fin.position.set(x+sx*(w/2+.18),h*.48,z);g.add(fin)}}
 addBuildingDetails(g,x,z,w,dep,h,r,d,isHouse,styleRoll);
 if(isHouse){
   const roofRadius=Math.min(Math.max(w,dep)*.54,Math.min(w,dep)*.68);
   const roof=new THREE.Mesh(new THREE.ConeGeometry(roofRadius,1.38+r()*(lux?1.0:.5),4),new THREE.MeshStandardMaterial({color:lux?choice([0x434d59,0x4d4a63,0x31424b]):choice([0x5f4942,0x495663,0x4d4d58]),roughness:.86}));
   roof.rotation.y=Math.PI/4;roof.position.set(x,h+.72,z);g.add(roof);
   if(lux){
     const lawn=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w+2.1,outerW),Math.min(dep+2.1,outerD)),new THREE.MeshStandardMaterial({map:textures.grass,roughness:1}));lawn.rotation.x=-Math.PI/2;lawn.position.set(x,.018,z);g.add(lawn)
   }
 }
 colliders.push({key,minX:x-outerW/2-.34,maxX:x+outerW/2+.34,minZ:z-outerD/2-.34,maxZ:z+outerD/2+.34,type:isHouse?'house':'building'});
 // Every residential building has one accessible entrance; marketing remains optional.
 addPropertyEntrance(g,key,x,z,w,dep,isHouse,d,r,i,entrance)
}
function addBuildingDetails(g,x,z,w,d,h,r,dist,isHouse=false,styleRoll=0){
 const accent=dist.tier==='luxury'?0xb79bff:dist.style==='central'?0x80e2ff:dist.style==='poor'?0xffb78a:0x8df0b3;
 const roof=new THREE.Mesh(new THREE.BoxGeometry(w*.34,.65,d*.3),new THREE.MeshStandardMaterial({color:0x424b57,roughness:.72,metalness:.18}));roof.position.set(x,h+.34,z);g.add(roof);
 const cornice=new THREE.Mesh(new THREE.BoxGeometry(w+.12,.18,d+.12),new THREE.MeshStandardMaterial({color:0x67717a,roughness:.8}));cornice.position.set(x,h-.08,z);g.add(cornice);
 if(isHouse){
   // The actual entrance is added later on the facade that really reaches a street or alley.
   for(const sx of [-1,1]){if(w<7&&sx>0)break;const win=new THREE.Mesh(new THREE.PlaneGeometry(.88,.68),new THREE.MeshStandardMaterial({color:0xa8dff3,metalness:.15,roughness:.15,side:THREE.DoubleSide}));win.position.set(x+sx*Math.min(w*.23,1.7),1.8,z-d/2-.018);win.rotation.y=Math.PI;g.add(win)}
   return
 }
 const stripMat=new THREE.MeshStandardMaterial({color:accent,emissive:accent,emissiveIntensity:.34,roughness:.24,metalness:.2});
 if(h>12){for(let fy=3.6;fy<h-2;fy+=Math.max(4.8,Math.min(8.5,h/4))){const band=new THREE.Mesh(new THREE.BoxGeometry(w*.86,.1,.09),stripMat);band.position.set(x,fy,z-d/2-.03);g.add(band);const band2=band.clone();band2.position.z=z+d/2+.03;g.add(band2)}}
 if(styleRoll===0&&h>14){for(const sx of [-1,1]){const col=new THREE.Mesh(new THREE.BoxGeometry(.16,h*.85,.12),stripMat);col.position.set(x+sx*(w/2-.18),h*.46,z-d/2-.06);g.add(col)}}
 if(styleRoll===1&&h>18){const cap=new THREE.Mesh(new THREE.CylinderGeometry(Math.min(w,d)*.16,Math.min(w,d)*.16,1.2,12),new THREE.MeshStandardMaterial({color:0xa9dfff,emissive:0x27465a,emissiveIntensity:.35,roughness:.38}));cap.position.set(x,h+1.0,z);g.add(cap)}
 if(styleRoll===2&&h>18){for(const sx of [-1,1]){const fin=new THREE.Mesh(new THREE.BoxGeometry(.2,h*.5,d*.42),new THREE.MeshStandardMaterial({color:0x202b35,metalness:.35,roughness:.4}));fin.position.set(x+sx*(w*.22),h*.45,z);g.add(fin)}}
 if(styleRoll===3&&h>16){const skybar=new THREE.Mesh(new THREE.BoxGeometry(w*.56,.18,d*.18),stripMat);skybar.position.set(x,h*.76,z-d/2-.08);g.add(skybar)}
 if(styleRoll===4&&h>14){for(let i=-1;i<=1;i+=2){const panel=new THREE.Mesh(new THREE.PlaneGeometry(.7,h*.42),new THREE.MeshBasicMaterial({color:0x7be8ff,transparent:true,opacity:.18,side:THREE.DoubleSide}));panel.position.set(x+i*(w/2+.05),h*.52,z);panel.rotation.y=i>0?-Math.PI/2:Math.PI/2;g.add(panel)}}
 if(dist.style==='old'&&h>12){for(let fy=4;fy<h-2;fy+=5){const balcony=new THREE.Mesh(new THREE.BoxGeometry(w*.32,.10,.72),new THREE.MeshStandardMaterial({color:0x4d5358,metalness:.18,roughness:.7}));balcony.position.set(x,fy,z-d/2-.37);g.add(balcony)}}
}

function addPocketGarden(g,key,x,z,r){
 const p=new THREE.Mesh(new THREE.PlaneGeometry(8,8),new THREE.MeshStandardMaterial({map:textures.grass,roughness:1}));p.rotation.x=-Math.PI/2;p.position.set(x,.06,z);g.add(p);
 addTree(g,x-1.7,z-1.6,r);addBush(g,key,x+1.4,z+1.3,r);addBench(g,x-1.3,z+1.8)
}


function addLamp(g,x,z){
 const post=new THREE.Group();
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.10,3.5,10),new THREE.MeshStandardMaterial({color:0x1d232b,roughness:.92}));
 pole.position.y=1.75;post.add(pole);
 const arm=new THREE.Mesh(new THREE.BoxGeometry(.18,.12,.75),new THREE.MeshStandardMaterial({color:0x222a33,roughness:.88}));
 arm.position.set(0,3.25,.34);post.add(arm);
 const head=new THREE.Mesh(new THREE.BoxGeometry(.34,.18,.42),new THREE.MeshStandardMaterial({color:0x2b3640,metalness:.18,roughness:.42}));
 head.position.set(0,3.20,.62);post.add(head);
 const bulb=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),new THREE.MeshBasicMaterial({color:0xfff1c4}));
 bulb.position.set(0,3.14,.64);post.add(bulb);
 post.position.set(x,0,z);g.add(post);
 colliders.push({key:g.userData?.key||'',minX:x-.18,maxX:x+.18,minZ:z-.18,maxZ:z+.18,type:'lamp'})
}
function addBench(g,x,z){
 const bench=new THREE.Group();
 const wood=new THREE.MeshStandardMaterial({color:0x7b5b3e,roughness:.95});
 const metal=new THREE.MeshStandardMaterial({color:0x2c333b,roughness:.75,metalness:.25});
 for(const yy of [.52,.78]){const slat=new THREE.Mesh(new THREE.BoxGeometry(1.2,.08,.22),wood);slat.position.set(0,yy,0);bench.add(slat)}
 const seat=new THREE.Mesh(new THREE.BoxGeometry(1.24,.08,.42),wood);seat.position.set(0,.44,0);bench.add(seat);
 for(const sx of [-.45,.45]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.10,.44,.10),metal);leg.position.set(sx,.22,0);bench.add(leg)}
 bench.position.set(x,0,z);g.add(bench);
 colliders.push({key:g.userData?.key||'',minX:x-.68,maxX:x+.68,minZ:z-.28,maxZ:z+.28,type:'bench'})
}
function addTree(g,x,z,r){
 const tree=new THREE.Group();
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.26,1.8,10),new THREE.MeshStandardMaterial({color:0x64482e,roughness:1}));
 trunk.position.y=.9;tree.add(trunk);
 const leafMat=new THREE.MeshStandardMaterial({color:choice([0x427a46,0x4f8a55,0x356b40]),roughness:.95});
 for(const p of [[0,2.05,0,.95],[.34,1.92,.18,.68],[-.32,1.84,-.16,.62],[.05,2.34,-.06,.54]]){const leaf=new THREE.Mesh(new THREE.SphereGeometry(p[3],10,8),leafMat);leaf.position.set(p[0],p[1],p[2]);tree.add(leaf)}
 tree.position.set(x,0,z);g.add(tree);
 const key=g.userData?.key||'';
 colliders.push({key,minX:x-.55,maxX:x+.55,minZ:z-.55,maxZ:z+.55,type:'tree'});
 hidingZones.push({key,x,z,radius:1.35})
}
function addBush(g,key,x,z,r){
 const bush=new THREE.Group();
 const mat=new THREE.MeshStandardMaterial({color:choice([0x457d4d,0x4f8a55,0x568f5c]),roughness:.98});
 for(const p of [[0,.36,0,.48],[.28,.30,.10,.34],[-.22,.28,-.15,.30],[.10,.26,-.24,.27]]){const m=new THREE.Mesh(new THREE.SphereGeometry(p[3],10,8),mat);m.position.set(p[0],p[1],p[2]);bush.add(m)}
 bush.position.set(x,0,z);g.add(bush);
 colliders.push({key,minX:x-.45,maxX:x+.45,minZ:z-.45,maxZ:z+.45,type:'bush'});
 hidingZones.push({key,x,z,radius:1.05})
}

function addParkedCar(g,key,x0,z0,r){
 const candidates=[
  {x:x0+20+r()*24,z:z0+15.55,rot:-Math.PI/2},
  {x:x0+20+r()*24,z:z0+69.75,rot:-Math.PI/2},
  {x:x0+15.55,z:z0+20+r()*24,rot:0},
  {x:x0+69.75,z:z0+20+r()*24,rot:0}
 ];
 for(const p of candidates){
   if(placementBlocked(p.x,p.z,1.65))continue;
   if(cars.some(c=>Math.hypot(c.group.position.x-p.x,c.group.position.z-p.z)<3.6))continue;
   const group=createCarVisual(choice([0x2d506d,0x7c4242,0x4b4f55,0x657954]));group.scale.set(.9,.9,.9);group.position.set(p.x,0,p.z);group.rotation.y=p.rot;g.add(group);return
 }
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



function addShop(g,key,x,z,r,forcedType=null,parcel=null){
 const pool=Object.keys(SHOPS),type=forcedType||choice(pool),shop=SHOPS[type];
 const bx0=Math.floor(x/CHUNK)*CHUNK,bz0=Math.floor(z/CHUNK)*CHUNK;
 const resolved=resolveBuildingSpot(key,x,z,10.7,10.7,bx0,bz0);if(!resolved){console.warn('No safe shop parcel',key,type);return false}
 x=resolved.x;z=resolved.z;
 const entrance=chooseAccessibleEntrance(key,x,z,10,9,bx0,bz0,parcel?.face||null);if(!entrance)return false;
 const group=new THREE.Group();
 const shopColor={corner:0x1e5f56,gear:0x46576d,rare:0x56408b,pawn:0x1d6072,home:0x5a4d76,housing:0x5b6947,clothes:0x684765,school:0x405e82,jobcenter:0x73633e,clinic:0x426b64}[type]||0x3e5567;
 const body=new THREE.Mesh(new THREE.BoxGeometry(10,5.4,9),new THREE.MeshStandardMaterial({color:shopColor,roughness:.42,metalness:.18}));body.position.y=2.7;group.add(body);
 const trim=new THREE.Mesh(new THREE.BoxGeometry(10.25,.22,9.25),new THREE.MeshStandardMaterial({color:0x8fe4ff,emissive:0x23495f,emissiveIntensity:.45,roughness:.35}));trim.position.set(0,5.05,0);group.add(trim);
 const frame=new THREE.Mesh(new THREE.BoxGeometry(5.4,3.3,.16),new THREE.MeshStandardMaterial({color:0x0c1720,metalness:.35,roughness:.55}));frame.position.set(0,1.75,-4.56);group.add(frame);
 const glass=new THREE.Mesh(new THREE.PlaneGeometry(4.7,2.7),new THREE.MeshStandardMaterial({color:0xb6eeff,transparent:true,opacity:.40,metalness:.55,roughness:.10}));glass.position.set(0,1.75,-4.66);glass.rotation.y=Math.PI;group.add(glass);
 const awning=new THREE.Mesh(new THREE.BoxGeometry(6.2,.18,1.0),new THREE.MeshStandardMaterial({color:type==='corner'?0x63d7a7:type==='gear'?0xff8a69:type==='housing'?0xffde77:type==='pawn'?0xffb46a:0xa98dff,emissive:0x0d1320,roughness:.35}));awning.position.set(0,3.35,-4.82);group.add(awning);
 const sign=makeFacadeSign(`${shop.icon} ${shop.name}`);sign.position.set(0,4.45,-4.53);group.add(sign);
 group.rotation.y=entrance.face==='south'?0:entrance.face==='north'?Math.PI:entrance.face==='west'?Math.PI/2:-Math.PI/2;
 group.position.set(x,0,z);g.add(group);
 const side=entrance.face==='west'||entrance.face==='east';
 const worldW=side?9:10,worldD=side?10:9;
 colliders.push({key,minX:x-worldW/2-.34,maxX:x+worldW/2+.34,minZ:z-worldD/2-.34,maxZ:z+worldD/2+.34,type:'shop'});
 shops.push({key,x,z,type,group,door:{x:entrance.outX,z:entrance.outZ},entranceFace:entrance.face});
 registerEntranceZone(key,entrance,`${key}:shop:${type}`);
 const sid=`${state.cityId}:${Math.round(x)}:${Math.round(z)}:${type}`;
 if(!state.discoveredShops.some(s=>s.id===sid))state.discoveredShops.push({id:sid,cityId:state.cityId,x:entrance.outX,z:entrance.outZ,type});
 return true
}
function addApartmentDoor(g,key,x,z,dep){/* V12: replaced by physical property entrances */}
function addContainer(g,key,id,x,z,type){const mesh=new THREE.Mesh(type==='bin'?new THREE.CylinderGeometry(.42,.48,.9,10):new THREE.BoxGeometry(.9,.55,.65),new THREE.MeshStandardMaterial({color:type==='bin'?0x335d45:0x74572e}));mesh.position.set(x,type==='bin'?.45:.28,z);mesh.userData={key,id,type};g.add(mesh);containers.push(mesh)}
function addPickup(g,key,id,x,z,type){const color={coins:0xffd15b,medkit:0x62e3a4,rare:0xa68cff,artifact:0x60d8ff}[type],geo=type==='artifact'?new THREE.OctahedronGeometry(.65):type==='coins'?new THREE.CylinderGeometry(.34,.34,.12,16):new THREE.BoxGeometry(.6,.6,.6),m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,emissive:type==='artifact'?0x15536a:0x000000,emissiveIntensity:1}));m.position.set(x,type==='artifact'?.72:.43,z);m.userData={key,id,type};g.add(m);pickups.push(m)}
function addNPC(g,key,x,z,r,path){const n=createPerson('civilian',key,x,z,r,path);g.add(n.group);npcs.push(n)}
function addEnemy(g,key,x,z,r,path){const n=createPerson('hostile',key,x,z,r,path);n.speed*=1.08;g.add(n.group);enemies.push(n)}
function addPolice(g,key,x,z,r,path){const n=createPerson('police',key,x,z,r,path);n.speed=.72+r()*.28;g.add(n.group);police.push(n)}

function createPerson(role,key,x,z,r,path=null){
 const hostile=role==='hostile',isPolice=role==='police',group=new THREE.Group();
 const clothColor=isPolice?0x1f4f83:(hostile?0x6d2434:choice([0x315f7b,0x486d45,0x6a4e75,0x785f42,0xa05d43,0x3b6c70]));
 const cloth=new THREE.MeshStandardMaterial({color:clothColor,roughness:.82});
 const clothDark=new THREE.MeshStandardMaterial({color:isPolice?0x173654:0x2d3440,roughness:.88});
 const skinColor=choice([0xd5a47c,0xc38e68,0xe0b18d,0xb97d5c]),skin=new THREE.MeshStandardMaterial({color:skinColor,roughness:.92});
 const shoeM=new THREE.MeshStandardMaterial({color:0x1b1e23,roughness:.95});
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.27,.74,5,8),cloth);body.position.y=1.04;group.add(body);
 const shoulder=new THREE.Mesh(new THREE.BoxGeometry(.72,.18,.28),cloth);shoulder.position.y=1.34;group.add(shoulder);
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.12,10),skin);neck.position.y=1.50;group.add(neck);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.25,16,14),skin);head.position.y=1.76;group.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.257,13,10),new THREE.MeshStandardMaterial({color:choice([0x31251f,0x5a4131,0x22262b,0x8d6a41]),roughness:.95}));
 hair.scale.y=.56;hair.position.set(0,1.915,.01);group.add(hair);
 const fc=document.createElement('canvas');fc.width=128;fc.height=128;const f=fc.getContext('2d');
 f.clearRect(0,0,128,128);f.fillStyle='#14181c';f.beginPath();f.arc(42,48,6,0,Math.PI*2);f.arc(86,48,6,0,Math.PI*2);f.fill();
 f.fillStyle='rgba(255,255,255,.28)';f.beginPath();f.arc(44,46,2,0,Math.PI*2);f.arc(88,46,2,0,Math.PI*2);f.fill();
 f.strokeStyle=hostile?'#6b1e29':'#7e4047';f.lineWidth=6;f.lineCap='round';f.beginPath();f.moveTo(45,82);f.quadraticCurveTo(64,92,83,82);f.stroke();
 const ft=new THREE.CanvasTexture(fc);ft.colorSpace=THREE.SRGBColorSpace;
 const face=new THREE.Mesh(new THREE.PlaneGeometry(.27,.27),new THREE.MeshBasicMaterial({map:ft,transparent:true,depthWrite:false,alphaTest:.04,side:THREE.DoubleSide}));
 face.position.set(0,1.75,-.253);face.rotation.y=Math.PI;face.renderOrder=10;group.add(face);
 const nose=new THREE.Mesh(new THREE.ConeGeometry(.024,.07,7),skin);nose.rotation.x=-Math.PI/2;nose.position.set(0,1.72,-.272);group.add(nose);
 if(isPolice){
   const cap=new THREE.Mesh(new THREE.CylinderGeometry(.29,.29,.09,10),new THREE.MeshStandardMaterial({color:0x153b63}));cap.position.y=1.99;group.add(cap);
   const visor=new THREE.Mesh(new THREE.BoxGeometry(.44,.05,.16),new THREE.MeshStandardMaterial({color:0x102538}));visor.position.set(0,1.95,-.13);group.add(visor);
   const badge=new THREE.Mesh(new THREE.BoxGeometry(.09,.12,.025),new THREE.MeshBasicMaterial({color:0xffd260}));badge.position.set(.12,1.25,-.27);group.add(badge)
 }
 const a1=new THREE.Mesh(new THREE.BoxGeometry(.13,.34,.13),skin),a2=a1.clone();
 a1.position.set(-.35,1.05,0);a2.position.set(.35,1.05,0);group.add(a1,a2);
 const fore1=new THREE.Mesh(new THREE.BoxGeometry(.11,.30,.11),skin),fore2=fore1.clone();
 fore1.position.set(-.35,.76,0);fore2.position.set(.35,.76,0);group.add(fore1,fore2);
 const hand1=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.12),skin),hand2=hand1.clone();
 hand1.position.set(-.35,.55,0);hand2.position.set(.35,.55,0);group.add(hand1,hand2);
 const sl1=new THREE.Mesh(new THREE.BoxGeometry(.17,.25,.17),cloth),sl2=sl1.clone();
 sl1.position.set(-.35,1.31,0);sl2.position.set(.35,1.31,0);group.add(sl1,sl2);
 const lm=new THREE.MeshStandardMaterial({color:0x222b34}),l1=new THREE.Mesh(new THREE.BoxGeometry(.15,.67,.18),lm),l2=l1.clone();
 l1.position.set(-.13,.38,0);l2.position.set(.13,.38,0);group.add(l1,l2);
 const sh1=new THREE.Mesh(new THREE.BoxGeometry(.16,.08,.28),shoeM),sh2=sh1.clone();sh1.position.set(-.13,.03,-.03);sh2.position.set(.13,.03,-.03);group.add(sh1,sh2);
 if(!isPolice&&r()<.26){const pack=new THREE.Mesh(new THREE.BoxGeometry(.25,.42,.14),clothDark);pack.position.set(0,1.0,.24);group.add(pack)}
 group.position.set(x,0,z);
 const socio=districtFor(Math.floor(x/CHUNK),Math.floor(z/CHUNK));
 const occupation=pickNpcOccupation(socio,r);
 const hasCash=r()<clamp(.34+socio.wealth*.20,.32,.82);
 const pocketItems=[];
 if(r()<clamp(.50*socio.itemMult,.30,.90))pocketItems.push(choice(STREET_ITEM_IDS));
 if(r()<clamp(.20*socio.itemMult,.07,.45))pocketItems.push(choice(STREET_ITEM_IDS));
 if(r()<clamp(.06*socio.itemMult,.02,.20))pocketItems.push(choice(STREET_ITEM_IDS));
 const n={
   key,group,role,hostile,isPolice,
   axis:path?.axis||(r()<.5?'x':'z'),pathMin:path?.min??null,pathMax:path?.max??null,
   route:path?.route||null,routeIndex:path?.routeIndex||0,
   speed:.55+r()*.55,dir:r()<.5?-1:1,home:{x,z},
   money:hasCash?Math.max(1,Math.round((2+r()*42)*socio.cashMult)):0,pocketItems,occupation,
   legs:[l1,l2],arms:[a1,a2],phase:r()*6.2,
   name:isPolice?choice(['Brigadier Morel','Agent Diaz','Agent Leroy']):(hostile?'Rôdeur hostile':choice(['Lina','Noah','Maya','Nino','Sara','Eliott','Inès','Adam','Jade','Milo'])),
   missionGiven:false,caught:false,pickpocketed:false,heading:0,alertness:75+r()*45,chasing:false,lastSeen:0,aggroTime:0,lastHit:0,calledPolice:false,following:false,trust:.25+r()*.7,courage:.2+r()*.75,followDoubt:r()*.55,routeStuck:0,followStuck:0,lastSafe:{x,z},talking:false
 };
 n.npcId=`${state.cityId}:${key}:${Math.round(x*10)}:${Math.round(z*10)}:${n.name}`;
 group.traverse(o=>{o.userData.person=n;o.frustumCulled=false});
 return n
}


function createCarVisual(color,kind='car'){
 const group=new THREE.Group();
 const dims=kind==='van'?[1.95,.88,4.2]:kind==='compact'?[1.55,.58,3.05]:kind==='taxi'?[1.78,.64,3.62]:[1.82,.64,3.72];
 const bodyMat=new THREE.MeshStandardMaterial({color,metalness:.42,roughness:.30});
 const darkGlass=new THREE.MeshStandardMaterial({color:0x7ea8c2,transparent:true,opacity:.72,metalness:.35,roughness:.15});
 const trimMat=new THREE.MeshStandardMaterial({color:0x19222d,metalness:.55,roughness:.35});
 const body=new THREE.Mesh(new THREE.BoxGeometry(dims[0],dims[1],dims[2]),bodyMat);body.position.y=.66;group.add(body);
 const top=new THREE.Mesh(new THREE.BoxGeometry(dims[0]*.82,kind==='van'?.78:.56,dims[2]*.54),darkGlass);top.position.set(0,kind==='van'?1.38:1.17,-.08);group.add(top);
 const frontBumper=new THREE.Mesh(new THREE.BoxGeometry(dims[0]*.92,.18,.18),trimMat);frontBumper.position.set(0,.42,-dims[2]/2-.04);group.add(frontBumper);
 const rearBumper=new THREE.Mesh(new THREE.BoxGeometry(dims[0]*.92,.18,.18),trimMat);rearBumper.position.set(0,.42,dims[2]/2+.04);group.add(rearBumper);
 const lampM=new THREE.MeshBasicMaterial({color:0xfff2b5});
 const tailM=new THREE.MeshBasicMaterial({color:0xff5f6f});
 for(const x of [-dims[0]*.33,dims[0]*.33]){const lamp=new THREE.Mesh(new THREE.BoxGeometry(.25,.12,.05),lampM);lamp.position.set(x,.73,-dims[2]/2-.01);group.add(lamp)}
 for(const x of [-dims[0]*.30,dims[0]*.30]){const tail=new THREE.Mesh(new THREE.BoxGeometry(.24,.12,.05),tailM);tail.position.set(x,.72,dims[2]/2+.01);group.add(tail)}
 const lightStrip=new THREE.Mesh(new THREE.BoxGeometry(dims[0]*.65,.05,.04),new THREE.MeshBasicMaterial({color:0x89e9ff}));lightStrip.position.set(0,.94,-dims[2]/2-.015);group.add(lightStrip);
 const rearStrip=new THREE.Mesh(new THREE.BoxGeometry(dims[0]*.58,.05,.04),new THREE.MeshBasicMaterial({color:0xff7aa9}));rearStrip.position.set(0,.92,dims[2]/2+.015);group.add(rearStrip);
 for(const sx of [-1,1]){const side=new THREE.Mesh(new THREE.BoxGeometry(.03,.05,dims[2]*.52),new THREE.MeshBasicMaterial({color:0x74dfff}));side.position.set(sx*(dims[0]/2+.015),.92,-.02);group.add(side)}
 for(const x of [-dims[0]*.41,dims[0]*.41])for(const z of [-dims[2]*.31,dims[2]*.31]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.27,.27,.18,12),new THREE.MeshStandardMaterial({color:0x151719,roughness:1}));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.34,z);group.add(wheel);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.19,10),new THREE.MeshStandardMaterial({color:0x97a2af,metalness:.7,roughness:.3}));hub.rotation.z=Math.PI/2;hub.position.set(x,.34,z);group.add(hub)}
 if(kind==='taxi'){const sign=new THREE.Mesh(new THREE.BoxGeometry(.55,.17,.28),new THREE.MeshBasicMaterial({color:0xffd85e}));sign.position.set(0,1.55,0);group.add(sign)}
 return group
}

function carRadius(kind){return kind==='van'?2.25:kind==='compact'?1.72:kind==='taxi'?1.92:1.98}
function carClearAt(c,x,z,margin=.18){
 const rr=carRadius(c.kind);
 for(const o of cars){
   if(o===c||!o?.group?.parent)continue;
   const min=rr+carRadius(o.kind)+margin;
   if(Math.hypot(x-o.group.position.x,z-o.group.position.z)<min)return false
 }
 return true
}
function safeCarSpawn(mode,dir,x0,z0,r,i,kind){
 const dummy={kind};
 for(let k=0;k<14;k++){
   const along=16+((i*8.7+k*5.9+r()*4.2)%50);
   const x=mode==='v'?(dir>0?x0+7.8:x0+3.2):x0+along;
   const z=mode==='v'?z0+along:(dir>0?z0+3.2:z0+7.8);
   if(carClearAt(dummy,x,z,.65))return{x,z}
 }
 return null
}
function addCar(g,key,x0,z0,r,i){
 const mode=r()<.5?'v':'h',dir=r()<.5?-1:1;
 const kind=r()<.18?'van':r()<.42?'compact':r()<.58?'taxi':'car';
 const spawn=safeCarSpawn(mode,dir,x0,z0,r,i,kind);if(!spawn)return;
 const colors=kind==='taxi'?[0xd9bd39,0xe4c447]:[0xc44b4b,0x4b6fc4,0x444b52,0xe0d3b4,0x4f9c68,0x9c7443,0x6a5b9c];
 const group=createCarVisual(choice(colors),kind);group.position.set(spawn.x,0,spawn.z);
 group.rotation.y=mode==='v'?(dir>0?Math.PI:0):(dir>0?-Math.PI/2:Math.PI/2);g.add(group);
 const baseSpeed=kind==='van'?3.15:kind==='compact'?5.15:kind==='taxi'?4.55:4.05;
 cars.push({key,group,mode,dir,kind,speed:baseSpeed+r()*1.15,currentSpeed:0,lastHit:0,turnCooldown:1+Math.random()*1.5,turnSeed:r()})
}
function unload(key){
 const g=chunks.get(key);if(!g)return;
 if(selectedNPC?.key===key)clearTarget();
 scene.remove(g);chunks.delete(key);
 colliders=colliders.filter(x=>x.key!==key);pickups=pickups.filter(x=>x.userData.key!==key);shops=shops.filter(x=>x.key!==key);apartments=apartments.filter(x=>x.key!==key);properties=properties.filter(x=>x.key!==key);containers=containers.filter(x=>x.userData.key!==key);npcs=npcs.filter(x=>x.key!==key);enemies=enemies.filter(x=>x.key!==key);police=police.filter(x=>x.key!==key);cars=cars.filter(x=>x.key!==key);hidingZones=hidingZones.filter(x=>x.key!==key);homePlots=homePlots.filter(x=>x.key!==key);trafficLights=trafficLights.filter(x=>x.group.parent!==g);alleys=alleys.filter(x=>x.key!==key);entranceZones=entranceZones.filter(x=>x.key!==key);pedNetworks.delete(key)
}
function ensureChunks(force=false){if(state.interior)return;const {cx,cz}=currentChunk();for(let x=cx-LOAD;x<=cx+LOAD;x++)for(let z=cz-LOAD;z<=cz+LOAD;z++)createChunk(x,z);for(const[k,g]of chunks){if(Math.abs(g.userData.cx-cx)>UNLOAD||Math.abs(g.userData.cz-cz)>UNLOAD)unload(k)}if(force)drawMap()}
function collides(x,z){
 if(state.interior)return Math.abs(x)>interiorBounds.x||Math.abs(z)>interiorBounds.z||interiorColliders.some(c=>x+RADIUS>c.minX&&x-RADIUS<c.maxX&&z+RADIUS>c.minZ&&z-RADIUS<c.maxZ);
 return colliders.some(c=>x+RADIUS>c.minX&&x-RADIUS<c.maxX&&z+RADIUS>c.minZ&&z-RADIUS<c.maxZ)
}
function blockedByPerson(x,z){
 for(const n of [...npcs,...police,...enemies]){
   if(!n?.group?.parent)continue;
   if(Math.hypot(x-n.group.position.x,z-n.group.position.z)<.88)return true
 }
 for(const r of remotePlayers.values()){
   if(!r?.group?.parent||r.interior)continue;
   if(Math.hypot(x-r.group.position.x,z-r.group.position.z)<.68)return true
 }
 return false
}
function entityBlocked(x,z,pad=.3){return colliders.some(c=>x+pad>c.minX&&x-pad<c.maxX&&z+pad>c.minZ&&z-pad<c.maxZ)}
function personDynamicBlocked(n,x,z,pad=.28){
 if(entityBlocked(x,z,pad))return true;
 for(const o of [...npcs,...police,...enemies]){
   if(o===n||!o?.group?.parent)continue;
   if(Math.hypot(x-o.group.position.x,z-o.group.position.z)<Math.max(1.02,pad+.62))return true
 }
 for(const c of cars){
   if(!c?.group?.parent)continue;
   if(Math.hypot(x-c.group.position.x,z-c.group.position.z)<1.35)return true
 }
 return false
}
function safeRoutePoint(n){
 const pts=n.route?.length?n.route:[];
 let best=null,bd=Infinity;
 for(const p of pts){const d=Math.hypot(n.group.position.x-p.x,n.group.position.z-p.z);if(d<bd&&!personDynamicBlocked(n,p.x,p.z,.34)){best=p;bd=d}}
 if(best)return best;
 const cx=Math.floor(n.group.position.x/CHUNK),cz=Math.floor(n.group.position.z/CHUNK),net=pedNetworks.get(ck(cx,cz));
 const all=net?[...net.outer,...net.inner]:[];
 all.sort((a,b)=>Math.hypot(n.group.position.x-a.x,n.group.position.z-a.z)-Math.hypot(n.group.position.x-b.x,n.group.position.z-b.z));
 return all.find(p=>!personDynamicBlocked(n,p.x,p.z,.34))||null
}
function recoverPerson(n){
 const p=safeRoutePoint(n);if(!p)return false;
 n.group.position.set(p.x,0,p.z);n.lastSafe={x:p.x,z:p.z};n.stuckFrames=0;n.routeStuck=0;n.followStuck=0;
 if(n.route?.length){
   let best=0,bd=Infinity;
   n.route.forEach((q,i)=>{const d=Math.hypot(q.x-p.x,q.z-p.z);if(d<bd){bd=d;best=i}});
   n.routeIndex=(best+1)%n.route.length
 }
 return true
}
function ensurePersonWalkable(n){
 if(!n?.group?.parent)return;
 if(entityBlocked(n.group.position.x,n.group.position.z,.27))recoverPerson(n)
}
function movePlayer(dx,dz){const nx=state.pos.x+dx,nz=state.pos.z+dz;if(!collides(nx,state.pos.z)&&!blockedByPerson(nx,state.pos.z))state.pos.x=nx;if(!collides(state.pos.x,nz)&&!blockedByPerson(state.pos.x,nz))state.pos.z=nz}
function moveEntity(n,dx,dz,pad=.34){
 const step=Math.hypot(dx,dz);if(step<.00001)return true;
 const len=step||1,fx=dx/len,fz=dz/len;
 const tries=[[dx,dz],[(fx*.90-fz*.28)*step,(fz*.90+fx*.28)*step],[(fx*.90+fz*.28)*step,(fz*.90-fx*.28)*step]];
 for(const [tx,tz] of tries){
   const nx=n.group.position.x+tx,nz=n.group.position.z+tz;
   if(!personDynamicBlocked(n,nx,nz,pad)){n.group.position.x=nx;n.group.position.z=nz;n.stuckFrames=0;return true}
 }
 n.stuckFrames=(n.stuckFrames||0)+1;if(n.stuckFrames>44)recoverPerson(n);return false
}
function updateCamera(t=0){const bob=(Math.abs(moveStick.x)+Math.abs(moveStick.y)>.15)?Math.sin(t*.012)*.022:0;camera.position.set(state.pos.x,1.72+bob,state.pos.z);const cp=Math.cos(state.pitch),sp=Math.sin(state.pitch),sy=Math.sin(state.yaw),cy=Math.cos(state.yaw);camera.lookAt(state.pos.x+sy*cp,1.72+sp+bob,state.pos.z-cy*cp)}

function spendFromFunds(amount){
 let left=amount;
 const fromBank=Math.min(state.homeBank,left);state.homeBank-=fromBank;left-=fromBank;
 const fromCoins=Math.min(state.coins,left);state.coins-=fromCoins;left-=fromCoins;
 return left<=0
}
function processMonthlyFinances(){
 let income=0,expense=0,taxes=0,events=[];
 // Economy of private companies: NPC workers make money even if the player does nothing.
 for(const c of Object.values(state.companies)){if(c.sector==='private'){const revenue=Math.round(c.monthlyNpcRevenue*(.82+Math.random()*.35));const costs=Math.round(c.npcWorkers*24);c.cash=Math.max(0,c.cash+revenue-costs)}}
 // NPC taxes replenish public finances.
 const npcTaxes=1600+Math.round(Math.random()*800);state.cityTreasury+=npcTaxes;events.push(`impôts PNJ +${npcTaxes} ville`);
 const rentRec=state.propertyPortfolio.find(p=>p.id===state.residenceId&&p.tenure==='rent');
 if(rentRec){if(spendFromFunds(rentRec.rent)){expense+=rentRec.rent;state.missedRent=0;events.push(`loyer -${rentRec.rent}`)}else{state.missedRent=(state.missedRent||0)+1;events.push('loyer IMPAYÉ');if(state.missedRent>=2){state.propertyPortfolio=state.propertyPortfolio.filter(p=>p.id!==rentRec.id);state.residenceId=null;state.missedRent=0;events.push('expulsion')}}}
 let rentalIncome=0;
 for(const rec of state.propertyPortfolio.filter(p=>p.tenure==='owned'&&p.listed)){
   const market=rec.marketRent||rec.rent||40,ratio=(rec.askingRent||market)/market;
   if(!rec.tenant){const chance=clamp((rec.demand||1)*(1.28-ratio)*.78,.08,.90);if(Math.random()<chance){rec.tenant=true;events.push(`locataire trouvé : ${rec.label||'bien'}`)}}
   if(rec.tenant){if(ratio>1.42&&Math.random()<.30){rec.tenant=false;events.push(`locataire parti : ${rec.label||'bien'}`)}else{const got=rec.askingRent||market;rentalIncome+=got}}
 }
 if(state.job){
   const j=JOB_DEFS[state.job.id],gross=j.salary;
   let paid=0;
   if(j.sector==='public'){paid=Math.min(gross,state.cityTreasury);state.cityTreasury-=paid;if(paid<gross)events.push('⚠️ salaire public partiellement payé')}
   else{const c=state.companies[j.company];paid=Math.min(gross,c?.cash||0);if(c)c.cash-=paid;if(paid<gross)events.push(`⚠️ ${c?.name||'employeur'} manque de trésorerie`)}
   const tax=progressiveTax(paid+rentalIncome);taxes+=tax;state.taxPaid=(state.taxPaid||0)+tax;state.cityTreasury+=tax;
   const net=Math.max(0,paid-tax);state.homeBank+=net;income+=net;state.salaryHistory.push({month:state.gameMonth,gross:paid,tax,net,job:j.name});state.salaryHistory=state.salaryHistory.slice(-12);events.push(`salaire net +${net}`)
 }else if(rentalIncome){const tax=progressiveTax(rentalIncome);taxes+=tax;state.taxPaid=(state.taxPaid||0)+tax;state.cityTreasury+=tax;state.homeBank+=rentalIncome-tax;income+=rentalIncome-tax}
 if(state.job&&rentalIncome){state.homeBank+=rentalIncome;income+=rentalIncome}
 else if(!state.job&&rentalIncome===0){}
 state.monthlyLedger=`Mois ${state.gameMonth} : +${income} / -${expense} • impôts ${taxes}${events.length?' • '+events.join(' • '):''}`;
 toast(`📅 ${state.monthlyLedger}`);save()
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
function trafficSignalState(t){
 const cycle=t%16000;
 if(cycle<6500)return{vertical:true,horizontal:false,allRed:false};
 if(cycle<8000)return{vertical:false,horizontal:false,allRed:true};
 if(cycle<14500)return{vertical:false,horizontal:true,allRed:false};
 return{vertical:false,horizontal:false,allRed:true}
}
function updateTrafficLights(t){
 const st=trafficSignalState(t);
 for(const l of trafficLights){
   const green=l.axis==='vertical'?st.vertical:st.horizontal;
   l.green.material.color.setHex(green?0x39e47b:0x163f28);l.red.material.color.setHex(green?0x48171b:0xff4055)
 }
 return st
}
function intersectionForCar(c,x0,z0){
 if(c.mode==='v')return{x:x0,z:c.dir>0?z0+CHUNK:z0};
 return{x:c.dir>0?x0+CHUNK:x0,z:z0}
}
function carInsideIntersection(c,ix,iz){
 return c.group.position.x>ix-1.2&&c.group.position.x<ix+12.2&&c.group.position.z>iz-1.2&&c.group.position.z<iz+12.2
}
function intersectionClearFor(c,ix,iz){
 for(const o of cars){
   if(o===c||!o?.group?.parent)continue;if(!carInsideIntersection(o,ix,iz))continue;
   if(o.mode!==c.mode)return false;
   if(Math.hypot(o.group.position.x-c.group.position.x,o.group.position.z-c.group.position.z)<4.3)return false
 }
 return true
}
function tryMoveCar(c,dx,dz){
 const nx=c.group.position.x+dx,nz=c.group.position.z+dz;
 if(!carClearAt(c,nx,nz,.34)){c.currentSpeed=Math.max(0,c.currentSpeed-8*.016);return false}
 c.group.position.x=nx;c.group.position.z=nz;return true
}
function carAheadDistance(c,max=15){
 let best=max;
 for(const o of cars){
   if(o===c||o.mode!==c.mode||o.dir!==c.dir)continue;
   const laneGap=c.mode==='v'?Math.abs(o.group.position.x-c.group.position.x):Math.abs(o.group.position.z-c.group.position.z);
   if(laneGap>.72)continue;
   const delta=c.mode==='v'?(o.group.position.z-c.group.position.z)*c.dir:(o.group.position.x-c.group.position.x)*c.dir;
   if(delta>0&&delta<best)best=delta
 }
 return best
}
function updateCars(dt,t){
 const lights=updateTrafficLights(t);
 for(const c of cars){
   let cx=Math.floor(c.group.position.x/CHUNK),cz=Math.floor(c.group.position.z/CHUNK),x0=cx*CHUNK,z0=cz*CHUNK;
   const newKey=ck(cx,cz);if(newKey!==c.key&&chunks.has(newKey)){chunks.get(newKey).add(c.group);c.key=newKey}
   const ahead=carAheadDistance(c,15),trafficFactor=ahead<4.8?0:ahead<8.0?(ahead-4.8)/3.2:1;
   const inter=intersectionForCar(c,x0,z0),clear=intersectionClearFor(c,inter.x,inter.z);
   let distance=999,green=false;
   if(c.mode==='v'){
     const laneX=c.dir>0?x0+7.8:x0+3.2;c.group.position.x+=(laneX-c.group.position.x)*Math.min(1,dt*8);
     const stopAt=c.dir>0?z0+CHUNK-10.0:z0+20.0;distance=c.dir>0?stopAt-c.group.position.z:c.group.position.z-stopAt;green=lights.vertical
   }else{
     const laneZ=c.dir>0?z0+3.2:z0+7.8;c.group.position.z+=(laneZ-c.group.position.z)*Math.min(1,dt*8);
     const stopAt=c.dir>0?x0+CHUNK-10.0:x0+20.0;distance=c.dir>0?stopAt-c.group.position.x:c.group.position.x-stopAt;green=lights.horizontal
   }
   const approaching=distance>=0&&distance<9.0,mustStop=approaching&&(!green||!clear);
   const target=mustStop?0:c.speed*trafficFactor;c.currentSpeed+=(target-c.currentSpeed)*Math.min(1,dt*(target<c.currentSpeed?8.5:2.3));
   if(mustStop&&distance<.38)c.currentSpeed=0;
   if(c.mode==='v'){tryMoveCar(c,0,c.dir*c.currentSpeed*dt);c.group.rotation.y=c.dir>0?Math.PI:0}
   else{tryMoveCar(c,c.dir*c.currentSpeed*dt,0);c.group.rotation.y=c.dir>0?-Math.PI/2:Math.PI/2}
   if(!state.interior&&t-c.lastHit>1250){
     const dx=Math.abs(state.pos.x-c.group.position.x),dz=Math.abs(state.pos.z-c.group.position.z);
     const hit=c.mode==='v'?(dx<1.15&&dz<2.15):(dx<2.15&&dz<1.15);if(hit){c.lastHit=t;hitByCar(c)}
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
         if(!recoverPerson(n))n.routeIndex=(n.routeIndex+1)%n.route.length;
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
   ensurePersonWalkable(n);let walking=true;
   if(n.talking){
     const dx=state.pos.x-n.group.position.x,dz=state.pos.z-n.group.position.z,dist=Math.hypot(dx,dz);
     if(dist>3.6){endNpcConversation(n);patrolPerson(n,dt)}else{setHeading(n,dx,dz);walking=false}
   }else if(n.aggroTime>0) updateAngryCivilian(n,dt,t);
   else if(n.following) updateFollower(n,dt);
   else patrolPerson(n,dt);
   const swing=walking?Math.sin(t*.006*n.speed+n.phase)*.55:0;n.legs[0].rotation.x=swing;n.legs[1].rotation.x=-swing;
   if(n.arms){n.arms[0].rotation.x=-swing*.7;n.arms[1].rotation.x=swing*.7}
 }
 for(const n of enemies){
   ensurePersonWalkable(n);if(n===activeEnemyEntity)continue;
   const dx=state.pos.x-n.group.position.x,dz=state.pos.z-n.group.position.z,dist=Math.hypot(dx,dz);
   if(dist<8){const sx=dx/(dist||1)*n.speed*1.18*dt,sz=dz/(dist||1)*n.speed*1.18*dt;if(moveEntity(n,sx,sz,.3))setHeading(n,sx,sz);if(dist<1.5&&!activeEnemy)startCombat(n)}else patrolPerson(n,dt);
   n.legs[0].rotation.x=Math.sin(t*.006*n.speed+n.phase)*.55;n.legs[1].rotation.x=-n.legs[0].rotation.x;
   if(n.arms){n.arms[0].rotation.x=-n.legs[0].rotation.x*.7;n.arms[1].rotation.x=-n.legs[1].rotation.x*.7}
 }
 for(const p of police){
   ensurePersonWalkable(p);const dx=state.pos.x-p.group.position.x,dz=state.pos.z-p.group.position.z,dist=Math.hypot(dx,dz);
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
 const calm=state.interior?(state.interior.type==='shop'?.12:.38):1;
 state.hunger=clamp(state.hunger-dt*.0085*calm,0,100);
 state.thirst=clamp(state.thirst-dt*.0120*calm,0,100);
 state.hygiene=clamp(state.hygiene-dt*.0050*calm,0,100);
 if(state.hunger<=0||state.thirst<=0){
   state.hp=Math.max(1,state.hp-dt*(state.thirst<=0?.34:.18))
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
 updateNeeds(dt);updateWorkMission();updateCamera(t);if(!state.interior){updatePeople(dt,t);updateCars(dt,t);animatePickups(dt,t);if(t-lastChunkTick>650){try{ensureChunks()}catch(err){console.error('Chunk refresh',err)}lastChunkTick=t}}updateWorldLight(dt);updateAtmosphere(dt);checkInteraction();if(t-lastMapTick>100){drawMap();lastMapTick=t}updateHUD();renderer.render(scene,camera);try{multiplayerTick(t,dt)}catch(err){console.error('Multiplayer frame error',err)}
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
   const exitLine=interiorBounds.z-1.45;
   if(state.pos.z>exitLine)return state.interior?.returnTo?setPrompt('🚪 Retour à l’agence','Terminer la visite et retrouver le conseiller.','RETOUR',leaveInterior):setPrompt('🚪 Porte de sortie','Retourner dans la rue.','SORTIR',leaveInterior);
   if(state.interior.type==='shop'){
     if(interiorSeller?.group?.parent){
       const d=Math.hypot(state.pos.x-interiorSeller.group.position.x,state.pos.z-interiorSeller.group.position.z);
       if(d<3.05)return setPrompt(interiorSeller.name,`${interiorSeller.role} • ${SHOPS[state.interior.shopType].name}`,'PARLER',()=>openSheet('physicalShop'))
     }
     return hidePrompt()
   }
   if(state.interior.type==='home'&&state.pos.z<-4.9)return setPrompt('Gestion du logement','Gérer stockage et aménagement.','GÉRER',()=>openSheet('home'));
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
 const rp=nearestRemotePlayer(2.5);if(rp)return setPrompt(`👤 ${rp.name}`,`${rp.d.toFixed(1)} m • joueur en ligne`,'INTERAGIR',()=>openPlayerInteraction(rp.id));
 const hp=nearest(homePlots,2.35);if(hp)return setPrompt(state.landOwned?'Ton terrain':'Terrain à vendre',state.landOwned?'Entrer dans ta base pour stocker tes gains et aménager ton chez-toi.':`Acheter ce terrain pour ${HOME_PLOT_PRICE} crédits.` ,state.landOwned?'ENTRER':'ACHETER',()=>state.landOwned?enterInterior('home',hp):buyLand());
 const p=nearest(pickups.filter(x=>x.parent),1.6);if(p)return setPrompt(pickupName(p.userData.type),'Objet trouvé dans la rue.','RAMASSER',()=>collectPickup(p));
 const c=nearest(containers.filter(x=>x.parent),1.7);if(c)return setPrompt(c.userData.type==='bin'?'Poubelle':'Coffre',c.userData.type==='bin'?'Fouiller du matériel.':'Ouvrir le coffre.','FOUILLER',()=>openContainer(c));
 const workShop=nearestWorkShop();
 if(workShop)return setPrompt('💼 Mission professionnelle',state.workMission.text,'TRAVAILLER',completeWorkMission);
 const s=shops.reduce((b,x)=>{const d=Math.hypot(state.pos.x-x.door.x,state.pos.z-x.door.z);return !b||d<b.d?{x,d}:b},null);if(s&&s.d<1.8)return setPrompt(SHOPS[s.x.type].name,'Entrer dans le bâtiment.','ENTRER',()=>enterInterior('shop',s.x));

 const pr=nearest(properties,1.75);
 if(pr){
   const rec=portfolioRecord(pr.id);
   if(rec)return setPrompt(propertyLabel(pr),rec.tenure==='rent'?`${rec.rent} crédits/mois`:'Bien dont tu es propriétaire.','ENTRER',()=>enterInterior('property',pr));
   if(pr.marketed)return setPrompt('Panneau immobilier',`${propertyLabel(pr)} • ${pr.offer==='rent'?'à louer':pr.offer==='sale'?'à vendre':'vente/location'} • Agence Habitat.`,'LIRE',()=>toast(`🔑 Va à l’Agence Habitat pour le dossier de ce bien.`));
 }
 const n=nearest(npcs,1.5);if(n)return setPrompt(n.name,'Le connaître en discutant.','PARLER',()=>talkNPC(n));
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

function npcOccupationKnown(n){return !!n&&state.knownNpcOccupations.includes(n.npcId)}
function learnNpcOccupation(n){if(!n||npcOccupationKnown(n))return;if(!state.knownNpcOccupations.includes(n.npcId))state.knownNpcOccupations.push(n.npcId);save()}
function startNpcConversation(n){if(conversationNPC&&conversationNPC!==n)endNpcConversation(conversationNPC);conversationNPC=n;n.talking=true;const dx=state.pos.x-n.group.position.x,dz=state.pos.z-n.group.position.z;setHeading(n,dx,dz)}
function endNpcConversation(n=conversationNPC){if(n)n.talking=false;if(conversationNPC===n)conversationNPC=null}
function talkNPC(n){
 startNpcConversation(n);const dirty=state.hygiene<25;
 const lines=dirty?['Salut… grosse journée ?','Tu as l’air épuisé, tout va bien ?']:[`Salut ! Moi c’est ${n.name}.`,`Bonjour. Tu habites dans le quartier ?`,`Salut ! Belle journée à ${city().name}.`];
 showDialogue(n.name,choice(lines),()=>showNpcChoices(n))
}
function showNpcChoices(n){
 startNpcConversation(n);$('#dialogue').classList.add('hidden');openSheet('npc');$('#sheetTitle').textContent=n.name;
 const known=npcOccupationKnown(n),occ=n.occupation?.title||'Habitant',employer=n.occupation?.employer;
 $('#sheetBody').innerHTML=`<div class="card npcProfile"><div class="sectionKicker">RENCONTRE</div><h3>${n.name}</h3><p class="sub">${known?`💼 ${occ}${employer?` • ${employer}`:''}`:'💼 Métier : inconnu — demande-lui.'}</p></div><div class="card"><div class="grid2">
 <button class="menuBtn" id="talkAgain">💬 Discuter</button>
 <button class="menuBtn" id="askOccupation" ${known?'disabled':''}>💼 ${known?'Métier connu':'Tu fais quoi ?'}</button>
 <button class="menuBtn" id="askFollow" ${n.caught||n.following?'disabled':''}>🚶 Suis-moi</button>
 <button class="menuBtn" id="askMission">🧾 Petit boulot</button>
 <button class="menuBtn" id="pickpocket" ${n.pickpocketed||n.caught?'disabled':''}>🫳 Cibler discrètement</button>
 </div></div>`;
 $('#talkAgain').onclick=()=>{closeSheet();startNpcConversation(n);showDialogue(n.name,'Ça fait plaisir de discuter un peu.',hideDialogue)};
 const ao=$('#askOccupation');if(ao)ao.onclick=()=>{learnNpcOccupation(n);closeSheet();startNpcConversation(n);showDialogue(n.name,`Je travaille comme ${occ}${employer?` chez ${employer}`:''}.`,()=>showNpcChoices(n))};
 const af=$('#askFollow');if(af)af.onclick=()=>askFollow(n);
 const am=$('#askMission');if(am)am.onclick=()=>{closeSheet();startNpcConversation(n);if(n.missionGiven)return showDialogue(n.name,'Je n’ai rien d’autre pour le moment.',hideDialogue);n.missionGiven=true;assignNpcMission(n);showDialogue(n.name,`J’ai un petit boulot : ${state.activeNpcMission.text}`,hideDialogue)};
 const pp=$('#pickpocket');if(pp)pp.onclick=()=>{endNpcConversation(n);closeSheet();selectTarget(n);toast('Cible sélectionnée.')}
}
function assignNpcMission(n){const occ=n.occupation?.title||'Habitant',opts=[{kind:'pockets',text:`aide ${occ.toLowerCase()} : récupère 30 crédits sur des passants`,target:30,start:state.stolenCoins,reward:90},{kind:'container',text:`trouve 2 fournitures utiles pour ${occ.toLowerCase()}`,target:2,start:state.containersOpened,reward:110},{kind:'explore',text:`repère 2 nouveaux quartiers pour ${occ.toLowerCase()}`,target:2,start:state.seenDistricts.length,reward:120}];state.activeNpcMission={...choice(opts),giver:n.name,giverOccupation:occ};save()}
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
function hideDialogue(){$('#dialogue').classList.add('hidden');endNpcConversation()}



const SHOP_STAFF={
 corner:{name:'Maya',role:'vendeuse'},gear:{name:'Karim',role:'mécanicien'},rare:{name:'Léo',role:'vendeur'},pawn:{name:'Nora',role:'responsable revente'},
 home:{name:'Clara',role:'conseillère'},housing:{name:'Sophie',role:'conseillère immobilière'},clothes:{name:'Inès',role:'vendeuse'},
 school:{name:'Mme Martin',role:'accueil du campus'},jobcenter:{name:'Yanis',role:'conseiller emploi'},clinic:{name:'Camille',role:'agent d’accueil'}
};
function buildShopSeller(type){
 const s=SHOP_STAFF[type]||{name:'Alex',role:'vendeur'};
 const palette={housing:'#6d8061',pawn:'#426e7a',corner:'#396c5a',clothes:'#785478',gear:'#586778',clinic:'#52796d',school:'#536e93',jobcenter:'#806f4b'};
 const avatar={...AVATAR_DEFAULT,top:palette[type]||'#526b7d',pants:'#252d35',hair:'#32251f',hairStyle:type==='clothes'?'long':'short',build:'standard'};
 const g=buildRemoteAvatarMesh({name:s.name,avatar});g.position.set(0,0,-7.25);interiorGroup.add(g);
 interiorSeller={group:g,name:s.name,role:s.role,type}
}
function syncInteriorPresence(interior){
 if(mpSocket?.connected)mpSocket.emit('player:presence',{interior:!!interior,x:state.returnPos?.x??state.pos.x,z:state.returnPos?.z??state.pos.z})
}
function visitPropertyFromAgency(p){
 if(!p||state.interior?.type!=='shop'||state.interior.shopType!=='housing')return;
 closeSheet();enterInterior('property',p,{preserveReturn:true,returnTo:{type:'shop',shopType:'housing'}})
}
function openPropertyOnMap(p){
 if(!p)return;
 selectedProperty=p;mapFocusPropertyId=p.id;mapCenterOverride={x:p.x,z:p.z};
 closeSheet();$('#mapOverlay').classList.remove('hidden');drawMap()
}

function addInteriorExitDoor(width,depth){
 const frame=new THREE.Mesh(new THREE.BoxGeometry(1.8,2.65,.16),new THREE.MeshStandardMaterial({color:0x263541,metalness:.28,roughness:.45}));frame.position.set(0,1.33,depth/2-.13);interiorGroup.add(frame);
 const door=new THREE.Mesh(new THREE.PlaneGeometry(1.48,2.32),new THREE.MeshStandardMaterial({color:0x416277,metalness:.18,roughness:.4}));door.position.set(0,1.22,depth/2-.23);interiorGroup.add(door);
 const exit=makeSign('🚪 SORTIE','#9fe9ff');exit.scale.set(.45,.45,.45);exit.position.set(0,3.0,depth/2-.24);interiorGroup.add(exit)
}

function enterInterior(type,obj,opts={}){
 if(!opts.preserveReturn&&!state.interior)state.returnPos={...state.pos};
 state.interior={type,shopType:obj?.type||null,propertyId:type==='property'?obj?.id:null,returnTo:opts.returnTo||null};
 interiorColliders=[];interiorSeller=null;for(const[,g]of chunks)g.visible=false;
 if(interiorGroup)scene.remove(interiorGroup);interiorGroup=new THREE.Group();scene.add(interiorGroup);

 let width=18,depth=18;
 if(type==='property'){const p=propertyFromCatalog(obj.id)||obj;const dims=propertyInteriorDims(p);width=dims.width;depth=dims.depth}
 interiorBounds={x:width/2-.5,z:depth/2-.5};
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),new THREE.MeshStandardMaterial({color:type==='shop'?0x786f60:type==='property'?0x8d8172:0x7b6c5d,roughness:1}));floor.rotation.x=-Math.PI/2;interiorGroup.add(floor);
 const wallM=new THREE.MeshStandardMaterial({color:type==='shop'?0xc8c0aa:type==='property'?0xd8d1c7:0xd7cfbf});
 [[0,2.5,-depth/2,width,.25],[0,2.5,depth/2,width,.25],[-width/2,2.5,0,.25,depth],[width/2,2.5,0,.25,depth]].forEach(w=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w[3],5,w[4]),wallM);m.position.set(w[0],w[1],w[2]);interiorGroup.add(m)});addInteriorExitDoor(width,depth);

 if(type==='shop')buildShopInterior(obj.type);
 else if(type==='property')buildPropertyInterior(propertyFromCatalog(obj.id)||obj);
 else if(type==='home')buildHomeInterior();
 else buildApartmentInterior();
 state.pos={x:0,z:depth/2-2.1};state.yaw=0;state.pitch=0;syncInteriorPresence(true);hidePrompt();save()
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
 const dims=propertyInteriorDims(p),t=PROPERTY_TYPES[p.type],rich=p.tier==='rich'||p.tier==='luxury',lux=p.tier==='luxury',poor=p.tier==='poor';
 const sign=makeSign(`${t.icon} ${p.area} m²`,'#d8f4ff');sign.position.set(0,3,-dims.depth/2+.2);interiorGroup.add(sign);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(dims.width-1.3,dims.depth-1.3),new THREE.MeshStandardMaterial({color:lux?0x244356:rich?0x355667:poor?0x6d6657:0x575c67,roughness:1}));
 floor.rotation.x=-Math.PI/2;floor.position.set(0,.02,0);interiorGroup.add(floor);
 const backWin=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(4.8,dims.width*.42),1.35),new THREE.MeshStandardMaterial({color:0xaadcf6,transparent:true,opacity:.45,metalness:.25,roughness:.1}));backWin.position.set(0,1.8,dims.depth/2-.05);interiorGroup.add(backWin);
 if(p.type==='studio'){
   addInteriorBox(-2.4,.3,-1.4,2.4,.55,1.28,poor?0x6a6f78:0x597081);
   addInteriorBox(2.1,.4,-1.3,1.45,.75,.95,poor?0x73533c:0x7f5b3f);
   addInteriorBox(2.2,.42,2.0,1.2,.84,.72,0x4e6572)
 }else{
   const part=new THREE.Mesh(new THREE.BoxGeometry(.16,2.6,dims.depth*.46),new THREE.MeshStandardMaterial({color:rich?0xd4d7da:0xc7c0b5}));part.position.set(0,1.3,-1);interiorGroup.add(part);interiorColliders.push({minX:-.13,maxX:.13,minZ:-dims.depth*.23-1,maxZ:dims.depth*.23-1});
   addInteriorBox(-dims.width*.25,.32,-dims.depth*.18,p.type==='villa'?3.8:2.9,.58,1.3,rich?0x587184:0x566876);
   addInteriorBox(dims.width*.24,.4,-dims.depth*.18,1.7,.75,1.0,rich?0x86654a:0x715137);
   addInteriorBox(dims.width*.24,.48,.2,1.6,.95,.66,0x586977);
   if(p.type==='house'||p.type==='villa'){
     addInteriorBox(-dims.width*.27,.38,dims.depth*.20,2.6,.72,1.0,rich?0x6b5b83:0x53687a);
     const plant=new THREE.Mesh(new THREE.SphereGeometry(.6,9,7),new THREE.MeshStandardMaterial({color:0x43815a}));plant.position.set(dims.width*.28,1,dims.depth*.22);interiorGroup.add(plant)
   }
 }
 if(rich){const rug=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(6,dims.width*.42),Math.min(4,dims.depth*.34)),new THREE.MeshStandardMaterial({color:lux?0x5c4d7a:0x765d7d,roughness:1}));rug.rotation.x=-Math.PI/2;rug.position.set(0,.03,1);interiorGroup.add(rug)}
 if(lux){const art=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.0),new THREE.MeshBasicMaterial({color:0x9ee8ff}));art.position.set(-dims.width*.28,2.2,-dims.depth/2+.06);interiorGroup.add(art)}
}

function buildShopInterior(type){
 const service=['housing','school','jobcenter','clinic'].includes(type);
 const shelfM=new THREE.MeshStandardMaterial({color:0x4c3c2d});
 if(!service){
   for(let i=-1;i<=1;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.8,5),shelfM);s.position.set(i*4,1,0);interiorGroup.add(s);interiorColliders.push({minX:i*4-.95,maxX:i*4+.95,minZ:-2.55,maxZ:2.55})}
 }else{
   for(const x of [-4,4]){const seat=new THREE.Mesh(new THREE.BoxGeometry(2.0,.55,.75),new THREE.MeshStandardMaterial({color:0x697781,roughness:.9}));seat.position.set(x,.32,1.2);interiorGroup.add(seat);interiorColliders.push({minX:x-1.05,maxX:x+1.05,minZ:.75,maxZ:1.65})}
 }
 const counter=new THREE.Mesh(new THREE.BoxGeometry(5,1.2,1.2),new THREE.MeshStandardMaterial({color:0x2f4855}));counter.position.set(0,.6,-6);interiorGroup.add(counter);interiorColliders.push({minX:-2.55,maxX:2.55,minZ:-6.65,maxZ:-5.35});
 const sign=makeSign(`${SHOPS[type].icon} ${SHOPS[type].name}`);sign.position.set(0,3,-8.5);interiorGroup.add(sign);buildShopSeller(type)
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
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(15.6,15.6),new THREE.MeshStandardMaterial({color:stage===0?0x31495c:0x65707a,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.set(0,.018,0);interiorGroup.add(floor);
 if(stage===1||stage===2){
   const bed=new THREE.Mesh(new THREE.BoxGeometry(stage===1?2.2:2.8,.5,1.3),new THREE.MeshStandardMaterial({color:0x586c7a}));bed.position.set(-4,.3,-2);interiorGroup.add(bed);interiorColliders.push({minX:-5.5,maxX:-2.5,minZ:-2.9,maxZ:-1.1});
   const table=new THREE.Mesh(new THREE.BoxGeometry(1.5,.75,1.0),new THREE.MeshStandardMaterial({color:0x765438}));table.position.set(2,.4,-2);interiorGroup.add(table);interiorColliders.push({minX:1.1,maxX:2.9,minZ:-2.65,maxZ:-1.35});
   const kitchenette=new THREE.Mesh(new THREE.BoxGeometry(2.6,.95,.7),new THREE.MeshStandardMaterial({color:0x6a6f78}));kitchenette.position.set(4.7,.48,5.8);interiorGroup.add(kitchenette);interiorColliders.push({minX:3.4,maxX:6.0,minZ:5.4,maxZ:6.2});
   if(stage===2){const sofa=new THREE.Mesh(new THREE.BoxGeometry(2.8,.75,1.1),new THREE.MeshStandardMaterial({color:0x4e6578}));sofa.position.set(3,.42,2);interiorGroup.add(sofa);interiorColliders.push({minX:1.5,maxX:4.5,minZ:1.3,maxZ:2.7})}
   return
 }
 const desk=new THREE.Mesh(new THREE.BoxGeometry(4.1,1,1.1),new THREE.MeshStandardMaterial({color:0x56422f}));desk.position.set(0,.5,-6.2);interiorGroup.add(desk);
 const rug=new THREE.Mesh(new THREE.PlaneGeometry(5.4,3.5),new THREE.MeshStandardMaterial({color:0x31576c,roughness:1}));rug.rotation.x=-Math.PI/2;rug.position.set(0,.02,-1);interiorGroup.add(rug);
 const kitchen=new THREE.Mesh(new THREE.BoxGeometry(4.8,1.05,.9),new THREE.MeshStandardMaterial({color:0x5b646d}));kitchen.position.set(-4.1,.52,6.2);interiorGroup.add(kitchen);interiorColliders.push({minX:-6.55,maxX:-1.65,minZ:5.75,maxZ:6.65});
 const bath=new THREE.Mesh(new THREE.BoxGeometry(2.0,.8,1.2),new THREE.MeshStandardMaterial({color:0xcbd8e2}));bath.position.set(5.2,.4,6.0);interiorGroup.add(bath);interiorColliders.push({minX:4.15,maxX:6.25,minZ:5.35,maxZ:6.65});
 const maxSlots=state.homeLevel===1?8:state.homeLevel===2?12:16;
 state.homePlaced.slice(0,maxSlots).forEach((id,i)=>{
   const slot=HOME_SLOTS[i],p=makeHomeProp(id);p.position.set(slot.x,0,slot.z);if(slot.rot)p.rotation.y=slot.rot;interiorGroup.add(p);
   const sizes={wallKit:[1.7,.25],sofa:[1.45,.75],table:[.95,.75],lamp:[.35,.35],plant:[.55,.55],wardrobe:[.9,.5],chest:[.75,.55],safe:[.7,.6]};
   const s=sizes[id]||[.5,.5];interiorColliders.push({minX:slot.x-s[0],maxX:slot.x+s[0],minZ:slot.z-s[1],maxZ:slot.z+s[1]})
 });
}

function exitInterior(){leaveInterior()}
function leaveInterior(){
 const returnTo=state.interior?.returnTo||null;
 if(interiorGroup){scene.remove(interiorGroup);interiorGroup=null}interiorSeller=null;interiorColliders=[];interiorBounds={x:8.5,z:8.5};
 if(returnTo?.type==='shop'){
   state.interior=null;
   enterInterior('shop',{type:returnTo.shopType},{preserveReturn:true});
   toast('Retour à l’agence.');return
 }
 for(const[,g]of chunks)g.visible=true;state.interior=null;state.pos=state.returnPos||{x:2,z:8};state.returnPos=null;
 syncInteriorPresence(false);if(mpSocket?.connected)mpSocket.emit('player:move',{city:state.cityId,x:state.pos.x,z:state.pos.z,yaw:state.yaw,interior:false});
 save();hidePrompt()
}
function physicalShopHTML(){
 if(state.interior.shopType==='school')return `${schoolHTML()}<button class="menuBtn red" id="leaveShop" style="width:100%">🚪 Sortir</button>`;
 if(state.interior.shopType==='jobcenter')return `${employmentHTML()}${companyEconomyHTML()}<button class="menuBtn red" id="leaveShop" style="width:100%">🚪 Sortir</button>`;
 if(state.interior.shopType==='clinic')return `<div class="card"><h3>🏥 Hôpital Horizon</h3><p class="sub">Établissement public. Les salariés formés peuvent y effectuer leurs missions.</p></div><button class="menuBtn red" id="leaveShop" style="width:100%">🚪 Sortir</button>`;
 const s=SHOPS[state.interior.shopType];
 if(state.interior.shopType==='housing')return `${housingAgencyHTML()}<button class="menuBtn red" id="leaveShop" style="width:100%">🚪 Sortir</button>`;
 const valuables=state.inventory.filter(i=>STREET_ITEMS[i.id]&&i.qty>0);
 const resale=state.interior.shopType==='pawn'
   ?`<div class="card"><h3>📦 Revente d’objets</h3>${valuables.length?valuables.map(i=>{const info=itemInfo(i.id);return `<div class="item"><div class="itemIcon">${info.icon}</div><div class="itemMain"><b>${info.name}</b><small>×${i.qty} • ${info.value} crédits pièce</small></div><button class="menuBtn sellLoot" data-id="${i.id}">Vendre</button></div>`}).join(''):'<p class="sub">Aucun objet revendable.</p>'}</div>`
   :'';
 return `<div class="card"><h3>${s.icon} ${s.name}</h3><p class="sub">${state.coins} crédits${state.reputation?` • remise ${Math.min(15,state.reputation)}%`:''}</p></div>
 <div class="card">${s.stock.map(x=>`<div class="item"><div class="itemIcon">${x.icon}</div><div class="itemMain"><b>${x.name}</b><small>${x.desc} • ${x.price}</small></div><button class="menuBtn buy" data-id="${x.id}" data-price="${x.price}">Acheter</button></div>`).join('')}</div>
 ${resale}
 <button class="menuBtn red" id="leaveShop" style="width:100%">🚪 Sortir</button>`
}
function buy(id,price){const discount=Math.min(.15,(state.reputation||0)*.01),finalPrice=Math.max(1,Math.round(price*(1-discount)));if(state.coins<finalPrice)return toast('Pas assez de crédits');if(WEAPONS[id]&&state.ownedWeapons.includes(id))return toast('Déjà acheté');if(COSMETIC_ITEMS[id]&&state.cosmeticsUnlocked.includes(id))return toast('Déjà acheté');state.coins-=finalPrice;if(WEAPONS[id]){state.ownedWeapons.push(id);state.equipped=id;weaponRig.visible=true}if(id==='medkit')addInv('medkit');if(CONSUMABLES[id])addInv(id);if(id==='armor')state.armor=clamp(state.armor+30,0,100);if(id==='bag')state.bagMax+=5;if(id==='stealth')state.stealth++;if(HOME_ITEMS[id])addHomeItem(id);
 if(COSMETIC_ITEMS[id]){
   state.cosmeticsUnlocked.push(id);state.avatarVersion=(state.avatarVersion||1)+1;
   const c=COSMETIC_ITEMS[id];
   if(c.kind==='accessory')state.avatar.accessory=c.value;
   if(c.kind==='top')state.avatar.top=c.value;
   if(c.kind==='shoes')state.avatar.shoes=c.value;
   if(mpSocket?.connected)mpSocket.emit('player:appearance',{avatar:avatarPayload(),avatarVersion:state.avatarVersion})
 }
 save();updateHUD();toast(COSMETIC_ITEMS[id]?'Style acheté et équipé':'Achat effectué');$('#sheetBody').innerHTML=physicalShopHTML();bindShop()}
function sellLoot(id){
 const info=STREET_ITEMS[id];if(!info||!removeStack(state.inventory,id,1))return;
 state.coins+=info.value;save();toast(`${info.name} vendu : +${info.value}`);
 $('#sheetBody').innerHTML=physicalShopHTML();bindShop()
}
function bindShop(){
 $$('.enrollSchool').forEach(b=>b.onclick=()=>enrollSchool(b.dataset.id));const att=$('.attendSchool');if(att)att.onclick=attendSchoolDay;$$('.applyJob').forEach(b=>b.onclick=()=>applyJob(b.dataset.id));const qj=$('.quitJob');if(qj)qj.onclick=quitJob;
 $$('.inspectProperty').forEach(b=>b.onclick=()=>{const p=propertyFromCatalog(b.dataset.id);if(p){selectedProperty=p;openSheet('property')}});
 $$('.buy').forEach(b=>b.onclick=()=>buy(b.dataset.id,Number(b.dataset.price)));
 $$('.sellLoot').forEach(b=>b.onclick=()=>sellLoot(b.dataset.id));
 $$('.sellArtifact').forEach(b=>b.onclick=()=>sellArtifact(b.dataset.id));
 $('#leaveShop').onclick=()=>{closeSheet();leaveInterior()}
}




function schoolHTML(){
 const cur=state.education?.current,completed=state.education?.completed||[];
 return `<div class="card"><h3>🎓 Campus Municipal</h3><p class="sub">Une journée de cours fait avancer le calendrier d’un jour. Le coût est payé à l’inscription.</p></div>
 ${cur?`<div class="card"><h3>${EDUCATION_PROGRAMS[cur.id].icon} ${EDUCATION_PROGRAMS[cur.id].name}</h3><p class="sub">Présence : ${cur.attended}/${EDUCATION_PROGRAMS[cur.id].days} jours</p><div class="progress"><i style="width:${cur.attended/EDUCATION_PROGRAMS[cur.id].days*100}%"></i></div><button class="menuBtn primary attendSchool" style="width:100%">📚 Suivre une journée de cours</button></div>`:''}
 ${Object.values(EDUCATION_PROGRAMS).map(p=>`<div class="card"><div class="lifeStat"><div><b>${p.icon} ${p.name}</b><small>${p.desc} • ${p.days} jours • ${p.cost} crédits</small></div>${completed.includes(p.id)?'<span class="qualification done">DIPLÔMÉ</span>':cur?'<span class="qualification">FORMATION EN COURS</span>':`<button class="menuBtn enrollSchool" data-id="${p.id}">S’inscrire</button>`}</div></div>`).join('')}`
}
function enrollSchool(id){const p=EDUCATION_PROGRAMS[id];if(!p)return;if(state.education.current)return toast('Termine d’abord ta formation actuelle.');if(state.coins<p.cost)return toast(`Inscription : ${p.cost} crédits.`);state.coins-=p.cost;state.education.current={id,attended:0};save();toast(`🎓 Inscrit : ${p.name}`);openSheet('physicalShop')}
function attendSchoolDay(){const cur=state.education.current;if(!cur)return;const p=EDUCATION_PROGRAMS[cur.id];cur.attended++;state.schoolDays=(state.schoolDays||0)+1;state.hunger=clamp(state.hunger-10,0,100);state.thirst=clamp(state.thirst-12,0,100);state.hygiene=clamp(state.hygiene-3,0,100);advanceDay(1);state.timeOfDay=17.5;if(cur.attended>=p.days){if(!state.education.completed.includes(cur.id))state.education.completed.push(cur.id);state.education.current=null;toast(`🎓 Diplôme obtenu : ${p.name}`)}else toast(`Cours ${cur.attended}/${p.days}`);save();openSheet('physicalShop')}
function employmentHTML(){
 const j=jobDef();
 return `<div class="card"><h3>💼 Maison de l’Emploi</h3>${j?`<p class="sub">Emploi actuel : <b>${j.icon} ${j.name}</b> • ${j.salary}/mois • ${j.sector==='public'?'fonction publique':'entreprise privée'}</p><button class="menuBtn red quitJob" style="width:100%">Démissionner</button>`:'<p class="sub">Tu n’as actuellement aucun emploi.</p>'}</div>
 ${Object.values(JOB_DEFS).map(x=>{const ok=hasQualification(x.qualification),c=state.companies[x.company];return `<div class="card"><div class="lifeStat"><div><b>${x.icon} ${x.name}</b><small>${x.salary}/mois • ${x.sector==='public'?'public':c?.name||'privé'}${x.qualification?` • ${EDUCATION_PROGRAMS[x.qualification].name}`:''}</small></div><button class="menuBtn applyJob" data-id="${x.id}" ${!ok||state.job?'disabled':''}>Postuler</button></div></div>`}).join('')}`
}
function applyJob(id){const j=JOB_DEFS[id];if(!j||state.job)return;if(!hasQualification(j.qualification))return toast('Diplôme requis.');state.job={id:j.id,sinceMonth:state.gameMonth};state.workMission=null;save();toast(`💼 Embauché : ${j.name}`);openSheet('physicalShop')}
function quitJob(){if(!state.job)return;state.job=null;state.workMission=null;save();toast('Tu as quitté ton emploi.');openSheet('physicalShop')}
function companyEconomyHTML(){return `<div class="card"><h3>🏦 Économie locale</h3><p class="sub">Trésor public : <b>${state.cityTreasury}</b> crédits • impôts payés : ${state.taxPaid||0}</p></div>${Object.values(state.companies).map(c=>`<div class="card"><div class="lifeStat"><div><b>${c.sector==='public'?'🏛️':'🏢'} ${c.name}</b><small>${c.npcWorkers} employés PNJ</small></div><span class="jobBadge companyCash">${c.sector==='public'?'Budget public':c.cash+' cr.'}</span></div></div>`).join('')}`}
function workHTML(){const j=jobDef();if(!j)return `<div class="card"><h3>💼 Travail</h3><p class="sub">Trouve un emploi à la Maison de l’Emploi.</p></div>`;const m=state.workMission;return `<div class="card"><h3>${j.icon} ${j.name}</h3><p class="sub">Salaire ${j.salary}/mois. Les missions font fonctionner ton employeur et renforcent sa trésorerie.</p>${m?`<p class="sub"><b>Mission :</b> ${m.text}</p><div class="progress"><i style="width:${Math.min(100,(m.progress||0)/(m.target||1)*100)}%"></i></div>`:`<button class="menuBtn primary startWork" style="width:100%">▶️ Commencer une mission de travail</button>`}</div>`}
function chooseWorkTargetShop(types){const all=state.discoveredShops.filter(s=>s.cityId===state.cityId&&(!types||types.includes(s.type)));return all.length?choice(all):null}
function startWorkMission(){const j=jobDef();if(!j)return toast('Aucun emploi.');if(state.workMission)return toast('Mission déjà en cours.');let m={job:j.id,progress:0,target:1};if(j.mission==='delivery'){const s=chooseWorkTargetShop(['corner','pawn','home','gear','rare']);if(!s)return toast('Explore quelques commerces avant de travailler.');m={...m,kind:'visitShop',shopId:s.id,text:`Livre un colis à ${SHOPS[s.type].name}.`,revenue:75}}
 else if(j.mission==='store'){const s=chooseWorkTargetShop(['corner']);if(!s)return toast('Découvre une épicerie.');m={...m,kind:'visitShop',shopId:s.id,text:`Aide au réassort de ${SHOPS[s.type].name}.`,revenue:65}}
 else if(j.mission==='repair'){const s=chooseWorkTargetShop(['gear']);if(!s)return toast('Découvre l’atelier MécaLab.');m={...m,kind:'visitShop',shopId:s.id,text:'Effectue une réparation à l’atelier.',revenue:105}}
 else if(j.mission==='clinic'){const s=chooseWorkTargetShop(['clinic']);if(!s)return toast('Découvre l’Hôpital Horizon.');m={...m,kind:'visitShop',shopId:s.id,text:'Effectue une garde à l’Hôpital Horizon.',revenue:0}}
 else if(j.mission==='school'){const s=chooseWorkTargetShop(['school']);if(!s)return toast('Découvre le Campus Municipal.');m={...m,kind:'visitShop',shopId:s.id,text:'Assure une session de cours au Campus.',revenue:0}}
 else {m={...m,kind:'distance',target:350,text:'Patrouille 350 m dans la ville.',revenue:0,lastX:state.pos.x,lastZ:state.pos.z}}
 state.workMission=m;save();toast('Mission de travail commencée.');openSheet('work')}
function completeWorkMission(){const m=state.workMission,j=jobDef();if(!m||!j)return;if(j.sector==='private'){const c=state.companies[j.company];if(c)c.cash+=(m.revenue||70)}else state.cityTreasury+=25;state.workCompleted=(state.workCompleted||0)+1;state.xp+=30;state.workMission=null;save();toast('✅ Mission professionnelle terminée');checkQuests()}
function updateWorkMission(){const m=state.workMission;if(!m)return;if(m.kind==='distance'){const dx=state.pos.x-(m.lastX??state.pos.x),dz=state.pos.z-(m.lastZ??state.pos.z),d=Math.hypot(dx,dz);if(d<4){m.progress=(m.progress||0)+d}m.lastX=state.pos.x;m.lastZ=state.pos.z;if(m.progress>=m.target)completeWorkMission()}}
function nearestWorkShop(){const m=state.workMission;if(!m||m.kind!=='visitShop')return null;const target=state.discoveredShops.find(s=>s.id===m.shopId);if(!target)return null;const d=Math.hypot(state.pos.x-target.x,state.pos.z-(target.z-5.05));return d<2.4?target:null}

function propertyLabel(p){return `${PROPERTY_TYPES[p.type]?.name||'Logement'} ${p.area} m²`}
function propertyCreditUse(amount){
 const used=Math.min(state.propertyCredit||0,amount);state.propertyCredit=(state.propertyCredit||0)-used;return amount-used
}
function rentProperty(p){
 if(portfolioRecord(p.id))return toast('Ce bien est déjà dans ton portefeuille.');
 if(!state.job)return toast('Un bailleur exige un emploi avant de signer le bail.');
 if(currentGrossSalary()<p.rent*3)return toast(`Salaire insuffisant : il faut au moins ${p.rent*3} crédits/mois.`);
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
 const coords=streetCoordsAt(p.x,p.z),inAgency=state.interior?.type==='shop'&&state.interior.shopType==='housing';
 const nav=`<div class="card propertyNav"><div><b>📍 ${coords}</b><small>Entrée du bien • ${d.name}</small></div><div class="grid2"><button class="menuBtn mapProperty" data-id="${p.id}">🗺️ Voir carte</button>${inAgency?`<button class="menuBtn primary visitProperty" data-id="${p.id}">🚪 Visiter</button>`:''}</div></div>`;
 if(rec)return `<div class="card"><h3>${t.icon} ${propertyLabel(p)}</h3><p class="sub">${d.name} • ${districtTierLabel(d)} • ${p.rooms} pièce(s)</p><p class="sub">Valeur ${p.buyPrice} • loyer marché ${p.rent}/mois</p></div>${nav}<div class="card"><button class="menuBtn green enterProperty" data-id="${p.id}" style="width:100%">🚪 Entrer dans le logement</button></div>`;
 const eligible=state.job&&currentGrossSalary()>=p.rent*3;
 const rentRow=(p.offer==='rent'||p.offer==='both')?`<div class="marketRow"><div><b>Louer</b><small>${p.rent}/mois • revenu demandé ${p.rent*3}</small></div><button class="menuBtn rentProperty" data-id="${p.id}" ${eligible?'':'disabled'}>Louer</button></div>`:'';
 const buyRow=(p.offer==='sale'||p.offer==='both')?`<div class="marketRow"><div><b>Acheter</b><small>Paiement unique</small></div><button class="menuBtn buyProperty" data-id="${p.id}">${p.buyPrice}</button></div>`:'';
 return `<div class="card"><h3>${t.icon} ${propertyLabel(p)}</h3><p class="sub">${d.name} • <span class="${districtTierClass(d)}">${districtTierLabel(d)}</span></p><p class="sub">${p.rooms} pièce(s) • ${p.area} m²</p></div>${nav}<div class="card">${rentRow}${buyRow}${!eligible&&(p.offer==='rent'||p.offer==='both')?'<p class="sub">⚠️ Pour louer : emploi obligatoire et salaire brut ≥ 3× le loyer.</p>':''}</div>`
}
function housingAgencyHTML(){
 const outdoor=state.returnPos||state.pos,{cx,cz}={cx:Math.floor(outdoor.x/CHUNK),cz:Math.floor(outdoor.z/CHUNK)},curD=districtFor(cx,cz);
 const list=state.propertyCatalog.filter(p=>p.cityId===state.cityId&&p.marketed!==false&&!portfolioRecord(p.id)).sort((a,b)=>Math.hypot(a.x-outdoor.x,a.z-outdoor.z)-Math.hypot(b.x-outdoor.x,b.z-outdoor.z)).slice(0,20);
 return `<div class="card"><h3>🔑 Agence Habitat</h3><p class="sub">Sophie peut te faire visiter directement un bien. Chaque annonce affiche aussi les coordonnées exactes de son entrée.</p><p class="sub">Agence : ${curD.name} • revenu mensuel ${currentGrossSalary()} crédits.</p></div>
 ${list.length?list.map(p=>{const d=DISTRICTS.find(x=>x.id===p.districtId)||districtFor(p.cx,p.cz),offer=p.offer==='rent'?`Loyer ${p.rent}/mois`:p.offer==='sale'?`Achat ${p.buyPrice}`:`${p.rent}/mois ou ${p.buyPrice}`;return `<div class="card"><div class="marketRow"><div><b>${PROPERTY_TYPES[p.type].icon} ${propertyLabel(p)}</b><small>${d.name} • ${offer}<br>📍 ${streetCoordsAt(p.x,p.z)}</small></div><button class="menuBtn inspectProperty" data-id="${p.id}">Dossier</button></div></div>`}).join(''):'<div class="card"><p class="sub">Aucune annonce connue pour le moment. Explore davantage la ville.</p></div>'}`
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
 if(state.residenceId)return toast('Tu as déjà un logement.');
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




function streetCoordsAt(x,z){return `X ${signedCoord(x)} • Y ${signedCoord(-z)}`}
function mapShopStyle(type){
 return{
  corner:{code:'F',color:'#59d38c',label:'Nourriture'},
  pawn:{code:'R',color:'#ffad5c',label:'Revente'},
  housing:{code:'I',color:'#66d9ff',label:'Immobilier'},
  clothes:{code:'V',color:'#c68cff',label:'Vêtements'},
  clinic:{code:'+',color:'#ff6f7d',label:'Santé'},
  school:{code:'E',color:'#77aaff',label:'École'},
  jobcenter:{code:'J',color:'#ffd15c',label:'Emploi'},
  gear:{code:'A',color:'#9db5c8',label:'Atelier'},
  home:{code:'M',color:'#d6a86f',label:'Maison'},
  rare:{code:'P',color:'#ab91ff',label:'Prestige'}
 }[type]||{code:'C',color:'#63e2b0',label:'Commerce'}
}
function drawMapMarker(q,x,y,code,color,detail=false){
 q.save();q.fillStyle='rgba(5,12,20,.92)';q.strokeStyle=color;q.lineWidth=detail?2.4:1.7;
 const r=detail?8:5.5;q.beginPath();q.arc(x,y,r,0,Math.PI*2);q.fill();q.stroke();
 q.fillStyle=color;q.font=`800 ${detail?10:8}px system-ui`;q.textAlign='center';q.textBaseline='middle';q.fillText(code,x,y+.5);q.restore()
}

function districtMapColor(d){
 return d.tier==='poor'?'rgba(163,96,72,.16)':d.tier==='working'?'rgba(124,119,96,.15)':d.tier==='rich'?'rgba(74,138,102,.17)':d.tier==='luxury'?'rgba(122,102,186,.17)':'rgba(76,124,163,.15)'
}



function renderMapTo(canvas,zoom=2.0){
 if(!canvas)return;
 const q=canvas.getContext('2d'),W=canvas.width,H=canvas.height,S=zoom,R=W/(zoom*2.2),detail=canvas.id==='bigMinimap';
 q.clearRect(0,0,W,H);const bg=q.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#091320');bg.addColorStop(1,'#050b14');q.fillStyle=bg;q.fillRect(0,0,W,H);
 const outdoor=state.interior?(state.returnPos||base.pos):state.pos;
 if(state.interior&&!detail){
   q.fillStyle='#586875';q.fillRect(W*.30,H*.30,W*.40,H*.40);q.fillStyle='#fff';q.font='700 11px system-ui';q.textAlign='center';q.fillText('INTÉRIEUR',W/2,H/2+4);return
 }
 const center=detail&&mapCenterOverride?mapCenterOverride:outdoor;
 q.save();q.translate(W/2,H/2);
 const minCx=Math.floor((center.x-R)/CHUNK)-1,maxCx=Math.floor((center.x+R)/CHUNK)+1,minCz=Math.floor((center.z-R)/CHUNK)-1,maxCz=Math.floor((center.z+R)/CHUNK)+1;
 const districtLabels=new Map();
 for(let cx=minCx;cx<=maxCx;cx++)for(let cz=minCz;cz<=maxCz;cz++){
   const d=districtFor(cx,cz),x=(cx*CHUNK-center.x)*S,y=(cz*CHUNK-center.z)*S;
   q.fillStyle=districtMapColor(d);q.fillRect(x,y,CHUNK*S,CHUNK*S);
   const a=districtLabels.get(d.id)||{name:d.name,x:0,y:0,n:0};a.x+=(x+CHUNK*S/2);a.y+=(y+CHUNK*S/2);a.n++;districtLabels.set(d.id,a)
 }
 const axisScreenX=(0-center.x)*S,axisScreenZ=(0-center.z)*S;
 q.save();q.strokeStyle='rgba(240,211,92,.42)';q.lineWidth=detail?2:1;
 if(Math.abs(axisScreenX)<W/2){q.beginPath();q.moveTo(axisScreenX,-H/2);q.lineTo(axisScreenX,H/2);q.stroke()}
 if(Math.abs(axisScreenZ)<H/2){q.beginPath();q.moveTo(-W/2,axisScreenZ);q.lineTo(W/2,axisScreenZ);q.stroke()}
 if(Math.abs(axisScreenX)<W/2&&Math.abs(axisScreenZ)<H/2){q.fillStyle='#ffd45c';q.beginPath();q.arc(axisScreenX,axisScreenZ,detail?5:3,0,Math.PI*2);q.fill();if(detail){q.font='bold 12px system-ui';q.fillText('O(0,0)',axisScreenX+8,axisScreenZ-8)}}
 q.restore();

 q.strokeStyle='rgba(89,118,146,.52)';q.lineWidth=Math.max(1.2,6*(zoom/2));
 for(let cx=minCx;cx<=maxCx;cx++){const x=(cx*CHUNK-center.x)*S;q.beginPath();q.moveTo(x,-H);q.lineTo(x,H);q.stroke()}
 for(let cz=minCz;cz<=maxCz;cz++){const y=(cz*CHUNK-center.z)*S;q.beginPath();q.moveTo(-W,y);q.lineTo(W,y);q.stroke()}
 q.fillStyle='rgba(119,137,152,.88)';
 for(const b of colliders){
   if(!['building','house','shop','playerHome'].includes(b.type))continue;
   const x=(b.minX-center.x)*S,y=(b.minZ-center.z)*S,w=(b.maxX-b.minX)*S,h=(b.maxZ-b.minZ)*S;
   if(x>W/2||y>H/2||x+w<-W/2||y+h<-H/2)continue;q.fillRect(x,y,w,h)
 }

 // One label per district type in the visible map instead of one label per chunk.
 if(detail&&zoom>.34){
   q.textAlign='center';q.textBaseline='middle';
   for(const a of districtLabels.values()){
     const x=a.x/a.n,y=a.y/a.n;if(Math.abs(x)>W/2-45||Math.abs(y)>H/2-16)continue;
     q.fillStyle='rgba(4,12,20,.68)';q.fillRect(x-52,y-10,104,20);q.fillStyle='rgba(224,238,248,.88)';q.font='700 10px system-ui';q.fillText(a.name,x,y)
   }
 }

 for(const s of state.discoveredShops.filter(s=>s.cityId===state.cityId)){
   const dx=(s.x-center.x)*S,dz=(s.z-center.z)*S;if(Math.abs(dx)<W/2&&Math.abs(dz)<H/2){const st=mapShopStyle(s.type);drawMapMarker(q,dx,dz,st.code,st.color,detail)}
 }
 const res=state.residenceId?propertyFromCatalog(state.residenceId):null;
 if(res){const dx=(res.x-center.x)*S,dz=(res.z-center.z)*S;q.strokeStyle='#ffd45c';q.lineWidth=detail?3:2;q.beginPath();q.arc(dx,dz,detail?10:7,0,Math.PI*2);q.stroke()}
 const focus=mapFocusPropertyId?propertyFromCatalog(mapFocusPropertyId):null;
 if(focus){const dx=(focus.x-center.x)*S,dz=(focus.z-center.z)*S;drawMapMarker(q,dx,dz,'⌂','#ffdc6d',detail);if(detail){q.fillStyle='#ffdc6d';q.font='700 11px system-ui';q.textAlign='left';q.fillText(propertyLabel(focus),dx+12,dz-10)}}

 // Online players are useful; police and NPCs are deliberately not drawn.
 for(const [id,r] of remotePlayers){
   if(r.interior||!r?.group)continue;
   const dx=(r.group.position.x-center.x)*S,dz=(r.group.position.z-center.z)*S;
   if(Math.abs(dx)<W/2&&Math.abs(dz)<H/2){
     q.fillStyle='#65e4ff';q.strokeStyle='#eafcff';q.lineWidth=detail?2:1.2;q.beginPath();q.arc(dx,dz,detail?6:4,0,Math.PI*2);q.fill();q.stroke();
     if(detail){q.fillStyle='#dff9ff';q.font='700 10px system-ui';q.textAlign='center';q.fillText(r.name||'Joueur',dx,dz-11)}
   }
 }

 const px=(outdoor.x-center.x)*S,pz=(outdoor.z-center.z)*S;
 q.save();q.translate(px,pz);q.rotate(state.yaw);q.fillStyle='#ffffff';q.beginPath();q.moveTo(0,-8*(zoom/2));q.lineTo(5*(zoom/2),6*(zoom/2));q.lineTo(0,3*(zoom/2));q.lineTo(-5*(zoom/2),6*(zoom/2));q.closePath();q.fill();q.restore();
 q.restore()
}
function drawMap(){renderMapTo($('#minimap'),1.02);if(!$('#mapOverlay').classList.contains('hidden'))renderMapTo($('#bigMinimap'),bigMapZoom);const z=$('#mapZoomLabel');if(z)z.textContent=`${Math.round(bigMapZoom/.42*100)}%`}

function signedCoord(v){
 const n=Math.round(v);return `${n>=0?'+':''}${n}`
}
function streetCoords(){
 const p=state.interior?(state.returnPos||state.pos):state.pos;return streetCoordsAt(p.x,p.z)
}

function emergencyExit(){
 if(!state.interior)return;
 leaveInterior();toast('Retour dans la rue.')
}

const WEEKDAYS=['LUN','MAR','MER','JEU','VEN','SAM','DIM'];
function formatGameTime(v=state.timeOfDay){const h=Math.floor(v)%24,m=Math.floor((v-Math.floor(v))*60);return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`}
function weekdayName(abs=absoluteGameDay()){return WEEKDAYS[(Math.max(1,abs)-1)%7]}
function agendaWhen(absDay,time){const delta=absDay-absoluteGameDay();return `${delta===0?'Aujourd’hui':delta===1?'Demain':`J+${delta}`} • ${time}`}
function builtAgendaItems(){
 const now=absoluteGameDay(),items=[];
 if(state.job){const j=jobDef(),day=state.timeOfDay<17?now:now+1;items.push({day,time:'08:00',title:`${j.icon} Travail — ${j.name}`,note:'Journée professionnelle'})}
 if(state.education.current){const p=EDUCATION_PROGRAMS[state.education.current.id],day=state.timeOfDay<16?now:now+1;items.push({day,time:'09:00',title:`${p.icon} Formation — ${p.name}`,note:`Jour ${state.education.current.attended+1}/${p.days}`})}
 if(state.activeNpcMission)items.push({day:now,time:formatGameTime(),title:`🧾 Petit boulot — ${state.activeNpcMission.giver}`,note:state.activeNpcMission.text});
 const monthEnd=now+(31-(state.gameDay||1));items.push({day:monthEnd,time:'00:00',title:'🏦 Nouveau mois',note:'Salaire, loyer, impôts et revenus locatifs'});
 for(const e of state.agendaCustom||[])if(e.day>=now)items.push({...e,custom:true});
 return items.sort((a,b)=>a.day-b.day||a.time.localeCompare(b.time)).slice(0,12)
}
function agendaHTML(){
 const items=builtAgendaItems();return `<div class="timeHero"><div class="sectionKicker">MAINTENANT</div><b>${formatGameTime()}</b><span>${weekdayName()} • Mois ${state.gameMonth} • Jour ${state.gameDay}</span></div>
 <div class="card"><h3>À venir</h3>${items.length?items.map((e,i)=>`<div class="agendaRow"><div class="agendaDate">${agendaWhen(e.day,e.time)}</div><div class="itemMain"><b>${e.title}</b><small>${e.note||''}</small></div>${e.custom?`<button class="targetClose agendaDelete" data-day="${e.day}" data-time="${e.time}" data-title="${encodeURIComponent(e.title)}">✕</button>`:''}</div>`).join(''):'<p class="sub">Rien de prévu.</p>'}</div>
 <div class="card"><h3>Ajouter un rendez-vous</h3><input id="agendaTitle" class="lifeInput full" maxlength="40" placeholder="Ex : Retrouver Noah"><div class="agendaForm"><select id="agendaDay" class="lifeInput"><option value="0">Aujourd’hui</option><option value="1">Demain</option><option value="2">Dans 2 jours</option><option value="3">Dans 3 jours</option></select><input id="agendaTime" class="lifeInput" type="time" value="18:00"></div><button id="agendaAdd" class="menuBtn primary full">Ajouter à l’agenda</button></div>`
}
function bindAgenda(){
 $('#agendaAdd')?.addEventListener('click',()=>{const title=$('#agendaTitle')?.value.trim(),time=$('#agendaTime')?.value||'18:00',off=Number($('#agendaDay')?.value||0);if(!title)return toast('Donne un nom au rendez-vous.');state.agendaCustom.push({day:absoluteGameDay()+off,time,title,note:'Rendez-vous personnel'});save();openSheet('agenda')});
 $$('.agendaDelete').forEach(b=>b.onclick=()=>{const title=decodeURIComponent(b.dataset.title),day=Number(b.dataset.day),time=b.dataset.time;state.agendaCustom=state.agendaCustom.filter(e=>!(e.title===title&&e.day===day&&e.time===time));save();openSheet('agenda')})
}

function updateHUD(){
 const {cx,cz}=currentChunk(),d=districtFor(cx,cz);
 $('#hp').textContent=Math.round(state.hp);$('#armor').textContent=Math.round(state.armor);$('#coins').textContent=state.coins;
 $('#hungerVal').textContent=Math.round(state.hunger);$('#thirstVal').textContent=Math.round(state.thirst);$('#hygieneVal').textContent=Math.round(state.hygiene);
 $('#hungerBar').style.width=`${state.hunger}%`;$('#thirstBar').style.width=`${state.thirst}%`;$('#hygieneBar').style.width=`${state.hygiene}%`;
 $('#district').textContent=state.interior?'INTÉRIEUR':`${city().name.toUpperCase()} • ${d.name.toUpperCase()}`;
 $('#clockTime').textContent=formatGameTime();const icon=state.weather==='clear'?'☀️':state.weather==='cloudy'?'☁️':'🌧️';$('#clockMeta').textContent=`${weekdayName()} • M${state.gameMonth} J${state.gameDay} • ${icon}`;
 $('#gpsChip').textContent=streetCoords();const mg=$('#mapGpsReadout');if(mg)mg.textContent=`Origine O(0,0) • ${streetCoords()} • ${d.name}`;
 const pc=$('#policeChip');if(pc){let nearby=false,chasing=false;for(const p of police){if(!p?.group?.parent)continue;const pd=Math.hypot(state.pos.x-p.group.position.x,state.pos.z-p.group.position.z);if(pd<=45)nearby=true;if(p.chasing)chasing=true}const visible=!state.interior&&(nearby||chasing||policeSeeing);if(!visible)pc.classList.add('hidden');else{pc.classList.remove('hidden');pc.classList.toggle('chasing',chasing||policeSeeing);pc.textContent=(chasing||policeSeeing)?'🚔 POURSUITE':'👮 POLICE'}}
 maybeCompleteNpcMission();updateTargetHUD();updateFollowerCard()
}

function setupMapUI(){
 const open=()=>{mapCenterOverride=null;mapFocusPropertyId=null;$('#mapOverlay').classList.remove('hidden');drawMap()},close=()=>{mapCenterOverride=null;mapFocusPropertyId=null;$('#mapOverlay').classList.add('hidden')};
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


function avatarCreatorHTML(){
 const a=avatarPayload(),unlocked=state.cosmeticsUnlocked||[];
 const acc=[['none','Aucun',true],['cap','Casquette',unlocked.includes('cap_black')],['glasses','Lunettes',unlocked.includes('glasses_black')],['backpack','Sac à dos',unlocked.includes('backpack_city')]].filter(x=>x[2]);
 const premiumTops=[['#9b3d4a','Rouge Neo',unlocked.includes('top_red')],['#6553a8','Violet Neo',unlocked.includes('top_purple')],['#202733','Noir premium',unlocked.includes('top_black')]].filter(x=>x[2]);
 const topOptions=[['#355f8a','Bleu'],['#486d45','Vert'],['#785f42','Brun'],...premiumTops];
 const shoeOptions=[['#11151a','Noir'],['#39424c','Gris'],...(unlocked.includes('shoes_white')?[['#e7edf1','Blanc premium']]:[])];
 return `<div class="card avatarCard"><div class="sectionKicker">IDENTITÉ</div><h3>Ton personnage</h3><p class="sub">L’aperçu et l’avatar vu par les autres utilisent maintenant exactement les mêmes caractéristiques.</p>
 <div class="avatarPreview" id="avatarPreview" data-hair="${a.hairStyle}" data-build="${a.build}" style="--skin:${a.skin};--hair:${a.hair};--top:${a.top};--pants:${a.pants};--shoes:${a.shoes}">
  <div class="av"><div class="backpack ${a.accessory==='backpack'?'':'hidden'}"></div><div class="body"></div><div class="arm l"></div><div class="arm r"></div><div class="leg l"></div><div class="leg r"></div><div class="shoe l"></div><div class="shoe r"></div><div class="head"></div><div class="hair"></div><div class="cap ${a.accessory==='cap'?'':'hidden'}"></div><div class="glasses ${a.accessory==='glasses'?'':'hidden'}"></div></div>
 </div>
 <div class="avatarGrid">
  <label>Peau<select id="avSkin">${[['#f0c3a1','Claire'],['#d5a47c','Dorée'],['#c38e68','Mate'],['#9f684c','Brune'],['#714834','Foncée']].map(x=>`<option value="${x[0]}" ${a.skin===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></label>
  <label>Coiffure<select id="avHairStyle">${[['short','Courte'],['buzz','Très courte'],['long','Longue'],['curly','Bouclée']].map(x=>`<option value="${x[0]}" ${a.hairStyle===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></label>
  <label>Cheveux<input type="color" id="avHair" value="${a.hair}"></label>
  <label>Corpulence<select id="avBuild">${[['slim','Fine'],['standard','Standard'],['strong','Forte']].map(x=>`<option value="${x[0]}" ${a.build===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></label>
  <label>Haut<select id="avTop">${topOptions.map(x=>`<option value="${x[0]}" ${a.top===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></label>
  <label>Pantalon<select id="avPants">${[['#202a34','Noir'],['#3a4655','Bleu nuit'],['#564a45','Brun']].map(x=>`<option value="${x[0]}" ${a.pants===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></label>
  <label>Chaussures<select id="avShoes">${shoeOptions.map(x=>`<option value="${x[0]}" ${a.shoes===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></label>
  <label>Accessoire<select id="avAccessory">${acc.map(x=>`<option value="${x[0]}" ${a.accessory===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></label>
 </div><button class="menuBtn primary full" id="saveAvatar">Enregistrer & synchroniser</button><p class="sub">Les styles premium restent disponibles chez NeoStyle.</p></div>`
}
function readAvatarForm(){return normalizedAvatar({skin:$('#avSkin')?.value,hair:$('#avHair')?.value,hairStyle:$('#avHairStyle')?.value,top:$('#avTop')?.value,pants:$('#avPants')?.value,shoes:$('#avShoes')?.value,accessory:$('#avAccessory')?.value,build:$('#avBuild')?.value})}
function updateAvatarPreview(){
 const p=$('#avatarPreview');if(!p)return;const a=readAvatarForm();
 p.style.setProperty('--skin',a.skin);p.style.setProperty('--hair',a.hair);p.style.setProperty('--top',a.top);p.style.setProperty('--pants',a.pants);p.style.setProperty('--shoes',a.shoes);p.dataset.hair=a.hairStyle;p.dataset.build=a.build;
 p.querySelector('.cap')?.classList.toggle('hidden',a.accessory!=='cap');p.querySelector('.glasses')?.classList.toggle('hidden',a.accessory!=='glasses');p.querySelector('.backpack')?.classList.toggle('hidden',a.accessory!=='backpack')
}
function saveAvatar(){state.avatar=readAvatarForm();state.avatarCreated=true;state.avatarVersion=(state.avatarVersion||1)+1;save();if(mpSocket?.connected){mpSocket.emit('player:appearance',{avatar:avatarPayload(),avatarVersion:state.avatarVersion});setTimeout(()=>mpSocket?.emit('player:profile-sync',{avatar:avatarPayload(),avatarVersion:state.avatarVersion,interior:!!state.interior}),250)}playUiTone('confirm');toast('Apparence synchronisée avec les joueurs.');openSheet('menu')}
function bindAvatarCreator(){['#avSkin','#avHair','#avHairStyle','#avTop','#avPants','#avShoes','#avAccessory','#avBuild'].forEach(s=>$(s)?.addEventListener('input',updateAvatarPreview));const b=$('#saveAvatar');if(b)b.onclick=saveAvatar}
function applyCosmetic(id){
 const c=COSMETIC_ITEMS[id];if(!c)return;
 if(c.kind==='accessory')state.avatar.accessory=c.value;
 if(c.kind==='top')state.avatar.top=c.value;
 if(c.kind==='shoes')state.avatar.shoes=c.value
}

function openSheet(panel){
 currentPanel=panel;const s=$('#sheet'),t=$('#sheetTitle'),b=$('#sheetBody');s.classList.remove('hidden');$$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.panel===panel));
 if(panel==='menu'){t.textContent='Menu';b.innerHTML=menuHTML()}
 if(panel==='world'){t.textContent='Voyager';b.innerHTML=worldHTML()}
 if(panel==='bag'){t.textContent='Sac';b.innerHTML=bagHTML()}
 if(panel==='agenda'){t.textContent='Agenda';b.innerHTML=agendaHTML()}
 if(panel==='social'){t.textContent='Social';b.innerHTML=socialHTML()}
 if(panel==='home'){t.textContent='Logement';b.innerHTML=homeHTML()}
 if(panel==='districts'){t.textContent='Quartier';b.innerHTML=districtHTML()}
 if(panel==='settings'){t.textContent='Réglages';b.innerHTML=settingsHTML()}
 if(panel==='avatar'){t.textContent='Personnage';b.innerHTML=avatarCreatorHTML()}
 if(panel==='player'){t.textContent='Interaction';b.innerHTML=playerInteractionHTML()}
 if(panel==='physicalShop'){t.textContent=SHOPS[state.interior?.shopType]?.name||'Commerce';b.innerHTML=physicalShopHTML()}
 if(panel==='work'){t.textContent='Travail';b.innerHTML=workHTML()}
 if(panel==='property'){t.textContent='Dossier immobilier';b.innerHTML=propertySheetHTML(selectedProperty)}
 bindSheet(panel)
}
function menuHTML(){return `<div class="menuHero"><div><div class="sectionKicker">STREETQUEST V17</div><h3>${mpNickname()}</h3><p>${city().name} • ${streetCoords()} • ${formatGameTime()}</p></div><button class="avatarMiniBtn" id="menuAvatar">🎨</button></div>
 <div class="menuGrid"><button class="menuTile" data-open="avatar"><span>👤</span><b>Personnage</b><small>Apparence</small></button><button class="menuTile" data-open="home"><span>🏠</span><b>Logement</b><small>Maison & biens</small></button><button class="menuTile" data-open="work"><span>💼</span><b>Travail</b><small>Emploi actuel</small></button><button class="menuTile" data-open="districts"><span>🏙️</span><b>Quartier</b><small>Infos locales</small></button><button class="menuTile" data-open="world"><span>✈️</span><b>Voyager</b><small>Changer de ville</small></button><button class="menuTile" data-open="settings"><span>⚙️</span><b>Réglages</b><small>Audio & réseau</small></button></div>`}
function socialHTML(){
 const players=[...remotePlayers.entries()].map(([id,r])=>({id,...r,d:Math.hypot(state.pos.x-r.group.position.x,state.pos.z-r.group.position.z)})).sort((a,b)=>a.d-b.d);
 return `<div class="socialHero"><div><div class="sectionKicker">RÉSEAU</div><h3>${mpSocket?.connected?'En ligne':'Hors ligne'}</h3><p>${mpRoomCount} joueur(s) • ${city().name}</p></div><span class="liveDot ${mpSocket?.connected?'on':''}"></span></div>
 <div class="card"><div class="voiceLine"><div><b>${voiceLabel()}</b><small>Volume automatique selon la distance : plein à 5 m, coupé après 25 m.</small></div><button id="voiceToggle" class="menuBtn ${voiceEnabled?'red':'primary'}">${voiceEnabled?'Couper':'Activer'}</button></div><p class="sub">Le micro demande ton autorisation. En Wi‑Fi/4G certains réseaux peuvent nécessiter plus tard un relais TURN.</p></div>
 <div class="card"><div class="sectionRow"><h3>Joueurs proches</h3><button id="openChatSocial" class="tinyBtn">💬 Chat</button></div>${players.length?players.map(p=>`<div class="socialPlayer"><div class="socialAvatar">👤</div><div class="itemMain"><b>${p.name} ${p.voice?'🎙️':''}</b><small>${p.d.toFixed(1)} m • ${Math.round(p.group.position.x)}, ${Math.round(-p.group.position.z)}</small></div><button class="menuBtn interactRemote" data-id="${p.id}">Interagir</button></div>`).join(''):'<p class="sub">Aucun autre joueur dans cette ville pour le moment.</p>'}</div>`
}
function worldHTML(){return `<div class="card"><div class="sectionKicker">VOYAGE</div><h3>Changer de ville</h3><p class="sub">Chaque ville possède sa propre salle multijoueur. Les joueurs doivent être dans la même ville pour se voir.</p></div><div class="card">${CITIES.map(c=>`<button class="menuBtn cityBtn full" data-city="${c.id}">${c.name}<small>${c.id===state.cityId?'Ville actuelle':'Voyager'}</small></button>`).join('')}</div>`}
function bagHTML(){
 const ws=state.ownedWeapons.map(id=>WEAPONS[id]).map(w=>`<div class="item"><div class="itemIcon">${w.icon}</div><div class="itemMain"><b>${w.name}</b><small>${w.damage} dégâts</small></div><button class="menuBtn equip" data-w="${w.id}">${state.equipped===w.id?'Équipé':'Équiper'}</button></div>`).join('');
 const inv=state.inventory.length?state.inventory.map(i=>{const info=itemInfo(i.id);const use=CONSUMABLES[i.id]?`<button class="menuBtn useConsumable" data-id="${i.id}">Utiliser</button>`:i.id==='medkit'?'<button class="menuBtn useMed">Utiliser</button>':'';return `<div class="item"><div class="itemIcon">${info.icon}</div><div class="itemMain"><b>${info.name}</b><small>×${i.qty}${info.value?` • valeur ${info.value}`:''}</small></div>${use}</div>`}).join(''):'<p class="sub">Sac vide.</p>';
 return `<div class="card bagSummary"><div><b>${invCount()}/${state.bagMax}</b><small>objets</small></div><div><b>${Math.round(state.hunger)}</b><small>faim</small></div><div><b>${Math.round(state.thirst)}</b><small>soif</small></div><div><b>${Math.round(state.hygiene)}</b><small>hygiène</small></div></div><div class="card"><h3>Équipement</h3>${ws}</div><div class="card"><h3>Inventaire</h3>${inv}</div>`
}
function questsHTML(){return ''}
function districtHTML(){
 const {cx,cz}=currentChunk(),d=districtFor(cx,cz),id=districtId(cx,cz);
 return `<div class="card"><h3>${d.name}</h3><p class="sub"><span class="${districtTierClass(d)}">${districtTierLabel(d)}</span> • richesse ${Math.round(d.wealth*100)}%</p>
 <p class="sub">${d.bonus}</p>
 <p class="sub">Immobilier : loyers ×${d.rentMult.toFixed(2)} • achat ×${d.buyMult.toFixed(2)}</p>
 <p class="sub">Police ${Math.round(d.policeRate*100)}% • délinquance ${Math.round(d.crimeRate*100)}%</p>
 <button class="menuBtn green" id="secureDistrict" style="width:100%" ${state.ownedDistricts.includes(id)?'disabled':''}>🏳️ ${state.ownedDistricts.includes(id)?'Quartier sécurisé':'Sécuriser ce quartier'}</button></div>`
}
function settingsHTML(){return `<div class="card"><div class="sectionKicker">VERSION</div><h3>StreetQuest V19.1</h3><button class="menuBtn full" id="forceUpdate">↻ Vérifier les mises à jour</button></div>
 ${multiplayerSettingsHTML()}
 <div class="card"><h3>Audio</h3><div class="settingRow"><div><b>Sons d’interface</b><small>Petits retours sonores, séparés du vocal.</small></div><button id="toggleSound" class="menuBtn">${state.soundEnabled?'Activés':'Coupés'}</button></div></div>
 <div class="card"><h3>Partie</h3><button class="menuBtn red" id="resetGame">Nouvelle partie</button></div>`}
function bindSheet(panel){
 if(panel==='menu'){$$('.menuTile').forEach(b=>b.onclick=()=>openSheet(b.dataset.open));$('#menuAvatar')?.addEventListener('click',()=>openSheet('avatar'))}
 if(panel==='world')$$('.cityBtn').forEach(b=>b.onclick=()=>switchCity(b.dataset.city));
 if(panel==='bag'){$$('.equip').forEach(b=>b.onclick=()=>{state.equipped=b.dataset.w;weaponRig.visible=b.dataset.w!=='fists';save();openSheet('bag')});$$('.useMed').forEach(b=>b.onclick=useMed);$$('.useConsumable').forEach(b=>b.onclick=()=>useConsumable(b.dataset.id))}
 if(panel==='agenda')bindAgenda();
 if(panel==='social'){$('#voiceToggle')?.addEventListener('click',()=>voiceEnabled?disableVoice():enableVoice());$('#openChatSocial')?.addEventListener('click',()=>{closeSheet();$('#chatPanel').classList.remove('hidden')});$$('.interactRemote').forEach(b=>b.onclick=()=>openPlayerInteraction(b.dataset.id))}
 if(panel==='player')bindPlayerInteraction();
 if(panel==='home'){const rough=$('#sleepRough');if(rough)rough.onclick=sleepRough;$$('.setResidence').forEach(b=>b.onclick=()=>setResidence(b.dataset.id));$$('.endRental').forEach(b=>b.onclick=()=>endRental(b.dataset.id));$$('.toggleListing').forEach(b=>b.onclick=()=>togglePropertyListing(b.dataset.id));$$('.adjustRent').forEach(b=>b.onclick=()=>adjustAskingRent(b.dataset.id,Number(b.dataset.delta)))}
 if(panel==='districts'){const x=$('#secureDistrict');if(x)x.onclick=secureDistrict}
 if(panel==='avatar')bindAvatarCreator();
 if(panel==='settings'){
  $('#forceUpdate')?.addEventListener('click',()=>window.streetQuestUpdate?.());
  const ni=$('#mpName');if(ni)ni.oninput=()=>localStorage.setItem('sq-mp-name',(ni.value.trim()||'Joueur').slice(0,18));
  $('#mpConnect')?.addEventListener('click',()=>connectMultiplayer(mpServerUrl(),($('#mpName')?.value||mpNickname()).trim()||'Joueur'));
  $('#mpDisconnect')?.addEventListener('click',disconnectMultiplayer);
  $('#toggleSound')?.addEventListener('click',()=>{state.soundEnabled=!state.soundEnabled;save();if(state.soundEnabled)playUiTone('confirm');openSheet('settings')});
  $('#resetGame')?.addEventListener('click',()=>{if(confirm('Effacer toute la partie ?')){localStorage.removeItem('sq3d-v19');localStorage.removeItem('sq3d-v18');localStorage.removeItem('sq3d-v17');localStorage.removeItem('sq3d-v16');localStorage.removeItem('sq3d-v15');location.reload()}})
 }
 if(panel==='npc'){}
 if(panel==='physicalShop')bindShop();
 if(panel==='work'){const sw=$('.startWork');if(sw)sw.onclick=startWorkMission}
 if(panel==='property'){
  $$('.rentProperty').forEach(b=>b.onclick=()=>{const p=propertyFromCatalog(b.dataset.id);if(p)rentProperty(p)});
  $$('.buyProperty').forEach(b=>b.onclick=()=>{const p=propertyFromCatalog(b.dataset.id);if(p)buyProperty(p)});
  $$('.enterProperty').forEach(b=>b.onclick=()=>{const p=propertyFromCatalog(b.dataset.id);if(p){closeSheet();enterInterior('property',p)}});
  $$('.visitProperty').forEach(b=>b.onclick=()=>{const p=propertyFromCatalog(b.dataset.id);if(p)visitPropertyFromAgency(p)});
  $$('.mapProperty').forEach(b=>b.onclick=()=>{const p=propertyFromCatalog(b.dataset.id);if(p)openPropertyOnMap(p)})
 }
 $$('.inspectProperty').forEach(b=>b.onclick=()=>{const p=propertyFromCatalog(b.dataset.id);if(p){selectedProperty=p;openSheet('property')}})
}
function switchCity(id){clearTarget(false);state.cityId=id;state.pos={x:2,z:8};state.yaw=0;state.pitch=0;for(const[k]of[...chunks])unload(k);ensureChunks(true);save();closeSheet();for(const id of [...remotePlayers.keys()])removeRemoteAvatar(id);if(mpSocket?.connected){setMpStatus(true,1,'Changement de ville…');mpSocket.emit('player:join',{name:mpNickname(),city:state.cityId,x:state.pos.x,z:state.pos.z,yaw:state.yaw,avatar:avatarPayload(),avatarVersion:state.avatarVersion||1});if(voiceEnabled)setTimeout(()=>mpSocket?.emit('voice:state',{enabled:true}),80)}toast(`Bienvenue à ${city().name}`)}
function useMed(){const x=state.inventory.find(i=>i.id==='medkit');if(!x)return toast('Aucun kit');if(state.hp>=state.maxHp)return toast('PV déjà au maximum');x.qty--;state.hp=clamp(state.hp+40,0,state.maxHp);if(x.qty<=0)state.inventory=state.inventory.filter(i=>i!==x);save();openSheet('bag')}
function closeSheet(){if(currentPanel==='npc')endNpcConversation();currentPanel=null;$('#sheet').classList.add('hidden')}
let toastTimer;function toast(m){
 const now=Date.now();if(m===lastToastMessage&&now-lastToastAt<1800)return;
 lastToastMessage=m;lastToastAt=now;
 const t=$('#toast');t.textContent=m;t.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.add('hidden'),1900)
}



$('#chatBtn').onclick=()=>$('#chatPanel').classList.toggle('hidden');
$('#closeChat').onclick=()=>$('#chatPanel').classList.add('hidden');
$('#onlineBtn').onclick=()=>openSheet('social');
$('#chatForm').onsubmit=e=>{e.preventDefault();const i=$('#chatInput'),m=i.value.trim();if(!m)return;if(!mpSocket?.connected)return toast('Multijoueur non connecté.');mpSocket.emit('chat:send',{message:m});i.value=''};
$$('.emoteRow button').forEach(b=>b.onclick=()=>{if(mpSocket?.connected)mpSocket.emit('player:emote',{emote:b.dataset.emote})});
$('#emergencyExitBtn').onclick=emergencyExit;
$('#clearTarget').onclick=()=>clearTarget();$('#dismissFollower').onclick=dismissFollower;$('#attackBtn').onclick=attack;$('#fleeBtn').onclick=flee;
$('#menuBtn').onclick=()=>openSheet('menu');$('#closeSheet').onclick=closeSheet;$('#sheet').onclick=e=>e.target===$('#sheet')&&closeSheet();
$('#navMap').onclick=()=>{mapCenterOverride=null;mapFocusPropertyId=null;$('#mapOverlay').classList.remove('hidden');drawMap()};$$('.nav[data-panel]').forEach(b=>b.onclick=()=>openSheet(b.dataset.panel));
document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});document.addEventListener('gesturechange',e=>e.preventDefault(),{passive:false});document.addEventListener('gestureend',e=>e.preventDefault(),{passive:false});document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});document.addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault()},{passive:false});document.addEventListener('touchstart',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>document.hidden&&save());
init();