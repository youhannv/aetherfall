const THREE_URL='https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
let THREE=null;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),choice=a=>a[Math.floor(Math.random()*a.length)];
const HUBS=[
{id:'paris',name:'Paris — Opéra',lat:48.8706,lng:2.3326,theme:'L’Archive oubliée',artifact:'Fragment d’Azur'},
{id:'rome',name:'Rome — Colisée',lat:41.8902,lng:12.4922,theme:'Les Cendres de l’Empire',artifact:'Sceau solaire'},
{id:'nyc',name:'New York — Times Square',lat:40.7580,lng:-73.9855,theme:'Signal fantôme',artifact:'Noyau néon'},
{id:'tokyo',name:'Tokyo — Shibuya',lat:35.6595,lng:139.7005,theme:'Le Protocole Shibuya',artifact:'Éclat quantique'},
{id:'london',name:'Londres — Westminster',lat:51.5007,lng:-0.1246,theme:'La Clé de Brume',artifact:'Clé d’obsidienne'}];
const WEAPONS={
fists:{id:'fists',name:'Poings',icon:'👊',damage:7,price:0},
baton:{id:'baton',name:'Bâton électrique',icon:'⚡',damage:15,price:120},
blaster:{id:'blaster',name:'Blaster ionique',icon:'🔫',damage:24,price:350},
pulse:{id:'pulse',name:'Carabine à impulsion',icon:'✨',damage:38,price:760},
relic:{id:'relic',name:'Lame relique',icon:'🗡️',damage:55,price:1400}};
const SHOP=[
{id:'medkit',name:'Kit de soin',icon:'🩹',price:60,type:'consumable',desc:'+40 PV'},
{id:'armor',name:'Plaque d’armure',icon:'🛡️',price:90,type:'consumable',desc:'+30 armure'},
...Object.values(WEAPONS).filter(w=>w.price>0).map(w=>({...w,type:'weapon',desc:`Dégâts ${w.damage}`})),
{id:'bag',name:'Extension de sac',icon:'🎒',price:250,type:'upgrade',desc:'+5 places'}];
const base={version:1,mode:'3d',hubId:'paris',hp:100,maxHp:100,armor:0,coins:180,bagMax:20,inventory:[],ownedWeapons:['fists'],equipped:'fists',artifacts:[],kills:0,xp:0,level:1,googleKey:'',streetPos:null,enemy:null};
let state=load();
function load(){try{return {...structuredClone(base),...JSON.parse(localStorage.getItem('sq3d-save')||'{}')}}catch{return structuredClone(base)}}
function save(){localStorage.setItem('sq3d-save',JSON.stringify(state))}
function hub(){return HUBS.find(h=>h.id===state.hubId)||HUBS[0]}function weapon(){return WEAPONS[state.equipped]||WEAPONS.fists}
function bagCount(){return state.inventory.reduce((a,x)=>a+(x.qty||1),0)}
function distMeters(a,b){const R=6371000,rad=x=>x*Math.PI/180,dLat=rad(b.lat-a.lat),dLon=rad(b.lng-a.lng),q=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(q))}
function currentQuest(){const h=hub();return state.artifacts.includes(h.id)?{title:`${h.name} sécurisé`,progress:'Artefact récupéré — choisis une autre ville.'}:{title:`Trouver : ${h.artifact}`,progress:`Joystick = marcher • glisse sur l’écran = regarder • 📡 = scanner.`}}
function updateHUD(){const q=currentQuest();$('#hpText').textContent=Math.round(state.hp);$('#armorText').textContent=Math.round(state.armor);$('#coinsText').textContent=state.coins;$('#bagText').textContent=`${bagCount()}/${state.bagMax}`;$('#questTitle').textContent=q.title;$('#questProgress').textContent=q.progress;$('#modeLabel').textContent=state.mode==='street'?'STREET VIEW':'MODE 3D'}
let scene,camera,renderer,clock,cityGroup,lootMeshes=[],enemyMesh=null,playerPos={x:0,z:4},yaw=0,pitch=0,joy={x:0,y:0,active:false,pid:null},look={active:false,pid:null,lastX:0,lastY:0},lastSpawn=0,colliders=[];
async function init3D(){try{THREE=await import(THREE_URL)}catch{showToast('Connexion requise au premier lancement du moteur 3D.');return}const host=$('#threeHost');scene=new THREE.Scene();scene.background=new THREE.Color(0x071019);scene.fog=new THREE.Fog(0x071019,18,75);camera=new THREE.PerspectiveCamera(67,host.clientWidth/host.clientHeight,.1,150);camera.position.set(playerPos.x,1.72,playerPos.z);renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(host.clientWidth,host.clientHeight);host.appendChild(renderer.domElement);clock=new THREE.Clock();scene.add(new THREE.HemisphereLight(0xa7d8ff,0x182018,2.5));const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(10,18,6);scene.add(sun);buildCity();addEventListener('resize',resize3d);animate()}
function buildCity(){
 if(!THREE)return;
 if(cityGroup)scene.remove(cityGroup);
 cityGroup=new THREE.Group();lootMeshes=[];enemyMesh=null;colliders=[];
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshStandardMaterial({color:0x18242d,roughness:1}));
 ground.rotation.x=-Math.PI/2;cityGroup.add(ground);

 const roadMat=new THREE.MeshStandardMaterial({color:0x292f35,roughness:.96});
 for(let i=-2;i<=2;i++){
   let r=new THREE.Mesh(new THREE.BoxGeometry(8,.05,120),roadMat);r.position.set(i*22,.03,0);cityGroup.add(r);
   r=new THREE.Mesh(new THREE.BoxGeometry(120,.05,8),roadMat);r.position.set(0,.031,i*22);cityGroup.add(r);
 }

 const cols=[0x28465b,0x30495a,0x3c4553,0x334c43,0x4a3d46,0x3c5362];
 for(let x=-50;x<=50;x+=11){
  for(let z=-50;z<=50;z+=11){
   const nearRoad=[-44,-22,0,22,44].some(v=>Math.abs(x-v)<5||Math.abs(z-v)<5);
   if(nearRoad)continue;
   const w=7.4+Math.random()*1.8,d=7.4+Math.random()*1.8,h=4+Math.random()*15;
   const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:choice(cols),roughness:.83,metalness:.05}));
   b.position.set(x,h/2,z);cityGroup.add(b);
   colliders.push({minX:x-w/2-.45,maxX:x+w/2+.45,minZ:z-d/2-.45,maxZ:z+d/2+.45});
   // simple lit windows
   if(Math.random()>.28){
     const winMat=new THREE.MeshBasicMaterial({color:0xaad6e8,transparent:true,opacity:.22});
     for(let wy=2;wy<h-1.5;wy+=2.5){
       const win=new THREE.Mesh(new THREE.PlaneGeometry(w*.72,.65),winMat);
       win.position.set(x,wy,z+d/2+.011);cityGroup.add(win);
     }
   }
  }
 }

 const shop=new THREE.Mesh(new THREE.BoxGeometry(6,4,6),new THREE.MeshStandardMaterial({color:0x125b58,emissive:0x063936,emissiveIntensity:.7}));
 shop.position.set(10,2,-8);cityGroup.add(shop);
 colliders.push({minX:6.55,maxX:13.45,minZ:-11.45,maxZ:-4.55,shop:true});

 scene.add(cityGroup);
 playerPos={x:0,z:4};yaw=0;pitch=0;
 camera.position.set(playerPos.x,1.72,playerPos.z);
 spawnWorldObjects()
}
function spawnWorldObjects(){const h=hub(),positions=[[7,7],[-12,8],[18,18],[-19,-15],[4,-18],[25,-10],[-28,22]];positions.forEach((p,i)=>{const type=i===0&&!state.artifacts.includes(h.id)?'artifact':i%3===0?'medkit':'scrap',mesh=new THREE.Mesh(type==='artifact'?new THREE.OctahedronGeometry(.7):new THREE.BoxGeometry(.75,.75,.75),new THREE.MeshStandardMaterial({color:type==='artifact'?0x72dcff:type==='medkit'?0x62e5a5:0xffd166,emissive:type==='artifact'?0x135e75:0x000000,emissiveIntensity:1}));mesh.position.set(p[0],.8,p[1]);mesh.userData={lootType:type};cityGroup.add(mesh);lootMeshes.push(mesh)})}
function resize3d(){if(!renderer)return;const h=$('#threeHost');camera.aspect=h.clientWidth/h.clientHeight;camera.updateProjectionMatrix();renderer.setSize(h.clientWidth,h.clientHeight)}
function collidesAt(x,z){
 const radius=.34;
 return colliders.some(c=>x+radius>c.minX&&x-radius<c.maxX&&z+radius>c.minZ&&z-radius<c.maxZ);
}
function tryMove(dx,dz){
 const nx=clamp(playerPos.x+dx,-57,57), nz=clamp(playerPos.z+dz,-57,57);
 // slide along walls instead of fully stopping
 if(!collidesAt(nx,playerPos.z))playerPos.x=nx;
 if(!collidesAt(playerPos.x,nz))playerPos.z=nz;
}
function updateCamera(){
 if(!camera)return;
 camera.position.set(playerPos.x,1.72,playerPos.z);
 const cp=Math.cos(pitch),sp=Math.sin(pitch),sy=Math.sin(yaw),cy=Math.cos(yaw);
 camera.lookAt(playerPos.x+sy*cp,1.72+sp,playerPos.z-cy*cp);
}
function animate(){
 if(!renderer)return;
 requestAnimationFrame(animate);
 const dt=Math.min(.033,clock.getDelta());
 if(state.mode==='3d'){
   const speed=4.9;
   const forwardX=Math.sin(yaw), forwardZ=-Math.cos(yaw);
   const rightX=Math.cos(yaw), rightZ=Math.sin(yaw);
   const dx=(forwardX*joy.y + rightX*joy.x)*speed*dt;
   const dz=(forwardZ*joy.y + rightZ*joy.x)*speed*dt;
   tryMove(dx,dz);
   updateCamera();
   lootMeshes.forEach(m=>{m.rotation.y+=dt*.8;m.position.y=.8+Math.sin(performance.now()/500+m.position.x)*.15});
   if(enemyMesh)enemyMesh.rotation.y+=dt;
   checkNearby();
   renderer.render(scene,camera)
 }
}
function checkNearby(){if(state.enemy)return;let near=null,bd=2.3;for(const m of lootMeshes){if(!m.parent)continue;const d=Math.hypot(playerPos.x-m.position.x,playerPos.z-m.position.z);if(d<bd){near=m;bd=d}}near?showLoot(near):hideLoot();$('#interactBtn').dataset.action=Math.hypot(playerPos.x-10,playerPos.z+4.2)<2.2?'shop':'';if(performance.now()-lastSpawn>13000&&Math.random()<.006){spawnEnemy3D();lastSpawn=performance.now()}}
function spawnEnemy3D(){if(state.enemy)return;state.enemy=createEnemy();enemyMesh=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshStandardMaterial({color:0xd62f54,emissive:0x5c1024,emissiveIntensity:.8}));enemyMesh.position.set(playerPos.x+choice([-6,6]),1,playerPos.z+choice([-5,5]));cityGroup.add(enemyMesh);showEnemy()}
function createEnemy(){const lv=Math.max(1,state.level+choice([-1,0,0,1])),max=35+lv*18;return{name:choice(['Drone hostile','Spectre urbain','Gardien fractal','Rôdeur synthétique']),level:lv,hp:max,maxHp:max,damage:5+lv*3,reward:18+lv*13}}
function showLoot(mesh){const t=mesh.userData.lootType,h=hub(),names={artifact:h.artifact,medkit:'Kit de soin',scrap:'Composant ancien'};$('#lootName').textContent=names[t];$('#lootDesc').textContent=t==='artifact'?'Objet de mission':t==='medkit'?'+40 PV':'Se revend automatiquement';$('#lootBtn').onclick=()=>collectMesh(mesh);$('#lootPrompt').classList.remove('hidden')}function hideLoot(){$('#lootPrompt').classList.add('hidden')}
function collectMesh(mesh){if(bagCount()>=state.bagMax&&mesh.userData.lootType!=='artifact'){showToast('Sac plein.');return}const t=mesh.userData.lootType;if(t==='artifact'){const h=hub();state.artifacts.push(h.id);state.coins+=180;state.xp+=120;showToast(`${h.artifact} récupéré ! +180🪙`)}else if(t==='medkit'){addInv('medkit',1);showToast('Kit de soin récupéré.')}else{state.coins+=25;state.xp+=15;showToast('+25 crédits')}if(mesh.parent)mesh.parent.remove(mesh);lootMeshes=lootMeshes.filter(x=>x!==mesh);hideLoot();levelCheck();save();updateHUD()}
function addInv(id,qty){const x=state.inventory.find(i=>i.id===id);x?x.qty+=qty:state.inventory.push({id,qty})}
function levelCheck(){const n=1+Math.floor(state.xp/180);if(n>state.level){state.level=n;state.maxHp+=8;state.hp=state.maxHp;showToast(`Niveau ${n} !`)}}
function showEnemy(){const e=state.enemy;if(!e)return;$('#enemyName').textContent=e.name;$('#enemyLevel').textContent=`Niv. ${e.level}`;$('#enemyHpBar').style.width=`${e.hp/e.maxHp*100}%`;$('#enemyPanel').classList.remove('hidden');hideLoot()}
function attack(){const e=state.enemy;if(!e)return;const dmg=weapon().damage+Math.floor(Math.random()*8)+state.level*2;e.hp-=dmg;showToast(`${weapon().name} : ${dmg} dégâts`);if(e.hp<=0){state.coins+=e.reward;state.xp+=45+e.level*12;state.kills++;if(enemyMesh?.parent)enemyMesh.parent.remove(enemyMesh);enemyMesh=null;state.enemy=null;$('#enemyPanel').classList.add('hidden');levelCheck();save();updateHUD();return}let hit=e.damage+Math.floor(Math.random()*5),abs=Math.min(state.armor,hit);state.armor-=abs;hit-=abs;state.hp-=hit;if(state.hp<=0){state.hp=state.maxHp;state.coins=Math.max(0,state.coins-80);state.enemy=null;if(enemyMesh?.parent)enemyMesh.parent.remove(enemyMesh);enemyMesh=null;$('#enemyPanel').classList.add('hidden');playerPos={x:0,z:4};showToast('K.O. — retour au refuge, -80🪙')}else showEnemy();save();updateHUD()}
function flee(){if(Math.random()<.7){state.enemy=null;if(enemyMesh?.parent)enemyMesh.parent.remove(enemyMesh);enemyMesh=null;$('#enemyPanel').classList.add('hidden');showToast('Fuite réussie.')}else{showToast('Fuite ratée.');attack()}save()}
let panorama=null;
async function loadGoogle(){const key=state.googleKey.trim();if(!key){showToast('Ajoute ta clé Google Maps dans Réglages.');return false}if(window.google?.maps)return true;return new Promise(resolve=>{window.__sqInit=()=>resolve(true);const s=document.createElement('script');s.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=__sqInit&v=weekly`;s.async=true;s.onerror=()=>{showToast('Vérifie la clé/API Google Maps.');resolve(false)};document.head.appendChild(s)})}
async function enterStreet(){if(!(await loadGoogle()))return;const h=hub();state.mode='street';save();$('#threeHost').classList.add('hidden');$('#streetHost').classList.remove('hidden');$('#controls3d').classList.add('hidden');$('#streetControls').classList.remove('hidden');const pos=state.streetPos&&state.streetPos.hubId===h.id?state.streetPos:{lat:h.lat,lng:h.lng};panorama=new google.maps.StreetViewPanorama($('#streetHost'),{position:pos,pov:{heading:0,pitch:0},zoom:1,addressControl:false,fullscreenControl:false,motionTracking:false,motionTrackingControl:false,linksControl:true,panControl:false,zoomControl:false});panorama.addListener('position_changed',()=>{const p=panorama.getPosition();if(!p)return;state.streetPos={hubId:h.id,lat:p.lat(),lng:p.lng()};save();streetEncounterCheck()});updateHUD()}
function exitStreet(){state.mode='3d';save();$('#streetHost').classList.add('hidden');$('#threeHost').classList.remove('hidden');$('#controls3d').classList.remove('hidden');$('#streetControls').classList.add('hidden');panorama=null;updateHUD()}
function angleDiff(a,b){let d=Math.abs(a-b)%360;return d>180?360-d:d}
function streetStep(){if(!panorama)return;const links=panorama.getLinks()||[];if(!links.length){showToast('Aucun passage Street View.');return}const heading=panorama.getPov().heading,chosen=links.reduce((best,l)=>angleDiff(l.heading,heading)<angleDiff(best.heading,heading)?l:best,links[0]);panorama.setPano(chosen.pano);panorama.setPov({heading:chosen.heading,pitch:0})}
function streetTurn(dir){if(!panorama)return;const p=panorama.getPov();panorama.setPov({heading:(p.heading+dir*40+360)%360,pitch:p.pitch})}
function streetEncounterCheck(){if(!state.streetPos)return;const h=hub(),d=distMeters(state.streetPos,h);if(!state.artifacts.includes(h.id)&&d<220&&Math.random()<.18){$('#lootName').textContent=h.artifact;$('#lootDesc').textContent='Signal virtuel détecté';$('#lootBtn').onclick=collectStreetArtifact;$('#lootPrompt').classList.remove('hidden')}if(!state.enemy&&Math.random()<.06){state.enemy=createEnemy();showEnemy()}}
function collectStreetArtifact(){const h=hub();if(!state.artifacts.includes(h.id)){state.artifacts.push(h.id);state.coins+=180;state.xp+=120;levelCheck();showToast(`${h.artifact} récupéré !`)}hideLoot();save();updateHUD()}
function streetScan(){if(!state.streetPos){showToast('Position indisponible.');return}const h=hub(),d=Math.round(distMeters(state.streetPos,h));showToast(state.artifacts.includes(h.id)?'Artefact déjà trouvé.':`Signal ${d<250?'TRÈS PROCHE':d<700?'PROCHE':'LOINTAIN'} — ${d} m`);if(!state.artifacts.includes(h.id)&&d<180){$('#lootName').textContent=h.artifact;$('#lootDesc').textContent='Détection réussie';$('#lootBtn').onclick=collectStreetArtifact;$('#lootPrompt').classList.remove('hidden')}}
function openSheet(panel){$$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.panel===panel));$('#sheet').classList.remove('hidden');renderSheet(panel)}function closeSheet(){$('#sheet').classList.add('hidden')}
function renderSheet(panel){const b=$('#sheetBody'),t=$('#sheetTitle');if(panel==='world'){t.textContent='Carte du monde';b.innerHTML=worldHTML()}if(panel==='inventory'){t.textContent='Inventaire';b.innerHTML=inventoryHTML()}if(panel==='shop'){t.textContent='Boutique';b.innerHTML=shopHTML()}if(panel==='quests'){t.textContent='Quêtes';b.innerHTML=questsHTML()}if(panel==='settings'){t.textContent='Réglages';b.innerHTML=settingsHTML()}bindSheet(panel)}
function worldHTML(){return `<div class="card"><h3>Mode d’exploration</h3><p class="sub">Le mode 3D fonctionne immédiatement. Street View nécessite ta clé Google Maps.</p><div class="grid2"><button class="menuBtn ${state.mode==='3d'?'green':''}" id="mode3d">🏙️ Monde 3D<small>Ville procédurale.</small></button><button class="menuBtn ${state.mode==='street'?'green':''}" id="modeStreet">🧭 Street View<small>Exploration via Google Maps.</small></button></div></div><div class="card mapList"><h3>Voyage rapide</h3>${HUBS.map(h=>`<button class="city ${h.id===state.hubId?'active':''}" data-hub="${h.id}"><b>${h.name}</b><small>${h.theme} • ${state.artifacts.includes(h.id)?'✅ récupéré':h.artifact}</small></button>`).join('')}</div>`}
function inventoryHTML(){const inv=state.inventory.length?state.inventory.map(i=>`<div class="item"><div class="itemIcon">🩹</div><div class="itemMain"><b>Kit de soin</b><small>Quantité ×${i.qty}</small></div><button class="menuBtn useMed">Utiliser</button></div>`).join(''):'<p class="sub">Sac vide.</p>',ws=state.ownedWeapons.map(id=>WEAPONS[id]).map(w=>`<div class="item"><div class="itemIcon">${w.icon}</div><div class="itemMain"><b>${w.name}</b><small>Dégâts ${w.damage}</small></div><button class="menuBtn equip" data-w="${w.id}">${state.equipped===w.id?'Équipé':'Équiper'}</button></div>`).join('');return `<div class="card"><h3>Équipement</h3>${ws}</div><div class="card"><h3>Sac ${bagCount()}/${state.bagMax}</h3>${inv}</div><div class="card"><h3>Artefacts</h3>${state.artifacts.length?state.artifacts.map(id=>`<span class="tag">${HUBS.find(h=>h.id===id).artifact}</span>`).join(' '):'<span class="sub">Aucun.</span>'}</div>`}
function shopHTML(){return `<div class="card"><h3>Marché clandestin</h3><p class="sub">${state.coins} 🪙 disponibles</p></div><div class="card">${SHOP.map(x=>`<div class="item"><div class="itemIcon">${x.icon}</div><div class="itemMain"><b>${x.name}</b><small>${x.desc} • ${x.price} 🪙</small></div><button class="menuBtn buy" data-id="${x.id}" ${x.type==='weapon'&&state.ownedWeapons.includes(x.id)?'disabled':''}>${x.type==='weapon'&&state.ownedWeapons.includes(x.id)?'Acheté':'Acheter'}</button></div>`).join('')}</div>`}
function questsHTML(){return `<div class="card"><h3>${currentQuest().title}</h3><p class="sub">${currentQuest().progress}</p></div><div class="card"><h3>Progression</h3><p class="sub">Artefacts ${state.artifacts.length}/${HUBS.length} • Ennemis vaincus ${state.kills} • Niveau ${state.level}</p></div>${HUBS.map(x=>`<div class="card"><b>${state.artifacts.includes(x.id)?'✅':'🔒'} ${x.theme}</b><p class="sub">${x.name} — ${x.artifact}</p></div>`).join('')}`}
function settingsHTML(){return `<div class="warning">Google Maps Platform demande une clé API. Restreins-la à ton site GitHub Pages et à Maps JavaScript API.</div><div class="card"><h3>Clé Google Maps</h3><p class="sub">Elle est enregistrée uniquement sur cet iPhone dans le stockage local du jeu.</p><input id="keyInput" class="codeInput" type="password" value="${state.googleKey||''}" placeholder="AIza…"><div class="grid2"><button class="menuBtn primary" id="saveKey">Enregistrer</button><button class="menuBtn red" id="clearKey">Effacer</button></div></div><div class="card"><button class="menuBtn red" id="resetGame">Nouvelle partie</button></div>`}
function bindSheet(panel){if(panel==='world'){ $('#mode3d').onclick=()=>{exitStreet();closeSheet()};$('#modeStreet').onclick=async()=>{closeSheet();await enterStreet()};$$('.city').forEach(b=>b.onclick=()=>{state.hubId=b.dataset.hub;state.streetPos=null;save();if(state.mode==='3d'){buildCity();closeSheet()}else{closeSheet();enterStreet()}updateHUD()})}if(panel==='inventory'){$$('.equip').forEach(b=>b.onclick=()=>{state.equipped=b.dataset.w;save();renderSheet('inventory')});$$('.useMed').forEach(b=>b.onclick=useMedkit)}if(panel==='shop')$$('.buy').forEach(b=>b.onclick=()=>buy(b.dataset.id));if(panel==='settings'){$('#saveKey').onclick=()=>{state.googleKey=$('#keyInput').value.trim();save();showToast('Clé enregistrée.')};$('#clearKey').onclick=()=>{state.googleKey='';save();$('#keyInput').value=''};$('#resetGame').onclick=()=>{if(confirm('Effacer toute la partie ?')){localStorage.removeItem('sq3d-save');location.reload()}}}}
function useMedkit(){const x=state.inventory.find(i=>i.id==='medkit');if(!x||x.qty<1)return showToast('Aucun kit.');if(state.hp>=state.maxHp)return showToast('PV déjà au maximum.');x.qty--;state.hp=clamp(state.hp+40,0,state.maxHp);if(x.qty<=0)state.inventory=[];save();updateHUD();renderSheet('inventory')}
function buy(id){const x=SHOP.find(i=>i.id===id);if(!x||state.coins<x.price)return showToast('Pas assez de crédits.');if(x.type==='weapon'&&state.ownedWeapons.includes(id))return;state.coins-=x.price;if(x.type==='weapon'){state.ownedWeapons.push(id);state.equipped=id}if(id==='medkit'){if(bagCount()>=state.bagMax){state.coins+=x.price;return showToast('Sac plein.')}addInv('medkit',1)}if(id==='armor')state.armor=clamp(state.armor+30,0,100);if(id==='bag')state.bagMax+=5;save();updateHUD();renderSheet('shop');showToast(`${x.name} acheté.`)}
let toastTimer;function showToast(m){const t=$('#toast');t.textContent=m;t.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.add('hidden'),2300)}
function setupJoystick(){const b=$('#joystick'),k=$('#joyKnob'),reset=()=>{joy={x:0,y:0,active:false,pid:null};k.style.transform='translate(0,0)'},move=e=>{const r=b.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),max=32,len=Math.hypot(dx,dy)||1,q=Math.min(1,max/len);joy.x=dx/max*q;joy.y=dy/max*q;k.style.transform=`translate(${dx*q}px,${dy*q}px)`};b.addEventListener('pointerdown',e=>{joy.active=true;joy.pid=e.pointerId;b.setPointerCapture(e.pointerId);move(e)});b.addEventListener('pointermove',e=>joy.active&&e.pointerId===joy.pid&&move(e));b.addEventListener('pointerup',reset);b.addEventListener('pointercancel',reset)}

setupJoystick();

function setupLook(){
 const host=$('#threeHost');
 host.addEventListener('pointerdown',e=>{
   // Ignore touches that start on the virtual controls.
   if(e.target.closest?.('#joystick,.rightControls,.bottomNav,.hudTop,.questCard,.enemyPanel,.lootPrompt'))return;
   look.active=true;look.pid=e.pointerId;look.lastX=e.clientX;look.lastY=e.clientY;
   try{host.setPointerCapture(e.pointerId)}catch{}
 });
 host.addEventListener('pointermove',e=>{
   if(!look.active||e.pointerId!==look.pid)return;
   const dx=e.clientX-look.lastX,dy=e.clientY-look.lastY;
   look.lastX=e.clientX;look.lastY=e.clientY;
   yaw-=dx*.006;
   pitch=clamp(pitch-dy*.0045,-1.05,1.05);
 });
 const stop=e=>{if(e.pointerId===look.pid){look.active=false;look.pid=null}};
 host.addEventListener('pointerup',stop);
 host.addEventListener('pointercancel',stop);
}
setupLook();

// Block iOS page zoom gestures while playing.
let lastTouchEnd=0;
document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
document.addEventListener('gesturechange',e=>e.preventDefault(),{passive:false});
document.addEventListener('gestureend',e=>e.preventDefault(),{passive:false});
document.addEventListener('touchend',e=>{
  const now=Date.now();
  if(now-lastTouchEnd<=320)e.preventDefault();
  lastTouchEnd=now;
},{passive:false});
$('#interactBtn').onclick=()=>$('#interactBtn').dataset.action==='shop'?openSheet('shop'):showToast('Regarde autour de toi avec le doigt et approche-toi d’un objet.');$('#scanBtn').onclick=()=>{const t=lootMeshes.find(m=>m.userData.lootType==='artifact'&&m.parent);if(t){const d=Math.round(Math.hypot(playerPos.x-t.position.x,playerPos.z-t.position.z));showToast(`Signal ${d<6?'TRÈS PROCHE':d<14?'PROCHE':'LOINTAIN'} — ${d} m`)}else showToast('Aucun signal.')};$('#attackBtn').onclick=attack;$('#fleeBtn').onclick=flee;$('#streetForward').onclick=streetStep;$('#streetLeft').onclick=()=>streetTurn(-1);$('#streetRight').onclick=()=>streetTurn(1);$('#streetScan').onclick=streetScan;$('#menuBtn').onclick=()=>openSheet('world');$('#closeSheet').onclick=closeSheet;$('#sheet').onclick=e=>e.target===$('#sheet')&&closeSheet();$$('.nav').forEach(b=>b.onclick=()=>openSheet(b.dataset.panel));addEventListener('pagehide',save);updateHUD();init3D();