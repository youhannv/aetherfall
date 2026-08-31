(() => {
'use strict';
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha:false });
const W=1280,H=720, TAU=Math.PI*2;
let scale=1, ox=0, oy=0, last=performance.now(), paused=false, showInventory=false, showMap=false;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const rnd=(a,b)=>a+Math.random()*(b-a);
const lerp=(a,b,t)=>a+(b-a)*t;
const hit=(a,b,r)=>Math.hypot(a.x-b.x,a.y-b.y)<r;
function resize(){ const dpr=Math.min(devicePixelRatio||1,2); canvas.width=innerWidth*dpr; canvas.height=innerHeight*dpr; scale=Math.min(canvas.width/W,canvas.height/H); ox=(canvas.width-W*scale)/2; oy=(canvas.height-H*scale)/2; }
addEventListener('resize',resize); resize();

const COLORS={ bg:'#07101d', grass:'#163b31', forest:'#102f2a', ruins:'#292638', sanct:'#17172a', water:'#153b57', gold:'#ffd76b', red:'#ff667a', blue:'#6bc8ff', violet:'#ad82ff', white:'#f4f7ff', ink:'#0a0f19' };
const zones=[
 {id:0,name:'Valebrume',w:3200,h:2200,bg:'#17372e',accent:'#78d9a8',spawn:{x:620,y:1080},gate:{x:2920,y:1080,to:1}},
 {id:1,name:'Forêt d’Éclat',w:3600,h:2400,bg:'#0e2c27',accent:'#55d9c1',spawn:{x:300,y:1200},gate:{x:3320,y:1200,to:2}},
 {id:2,name:'Ruines d’Obsidienne',w:3600,h:2400,bg:'#292638',accent:'#bc9aff',spawn:{x:300,y:1200},gate:{x:3320,y:1200,to:3}},
 {id:3,name:'Sanctuaire du Néant',w:3000,h:2100,bg:'#17172a',accent:'#ff7dbf',spawn:{x:300,y:1050},gate:{x:2700,y:1050,to:0}}
];

const baseSave={zone:0,x:620,y:1080,hp:100,maxHp:100,level:1,xp:0,nextXp:80,coins:0,shards:0,potions:3,attack:18,quest:0,bossDead:false,chests:[],kills:0,playTime:0};
function load(){ try{return {...baseSave,...JSON.parse(localStorage.getItem('aetherfall-save')||'{}')}}catch{return {...baseSave}} }
const save=load();
const player={x:save.x,y:save.y,r:22,speed:240,hp:save.hp,maxHp:save.maxHp,level:save.level,xp:save.xp,nextXp:save.nextXp,coins:save.coins,shards:save.shards,potions:save.potions,attack:save.attack,invul:0,attackCd:0,dodgeCd:0,dodge:0,dir:0,zone:save.zone,kills:save.kills};
let quest=save.quest,bossDead=save.bossDead,playTime=save.playTime, enemies=[],npcs=[],chests=[],particles=[],projectiles=[],texts=[],decor=[],zoneBanner=3, boss=null;
function persist(){ localStorage.setItem('aetherfall-save',JSON.stringify({zone:player.zone,x:player.x,y:player.y,hp:player.hp,maxHp:player.maxHp,level:player.level,xp:player.xp,nextXp:player.nextXp,coins:player.coins,shards:player.shards,potions:player.potions,attack:player.attack,quest,bossDead,chests:save.chests,kills:player.kills,playTime})); }
setInterval(persist,8000); addEventListener('pagehide',persist); document.addEventListener('visibilitychange',()=>{if(document.hidden)persist()});

let audio=null; function sound(freq=440,dur=.08,type='sine',gain=.04){ try{audio ||= new (AudioContext||webkitAudioContext)(); const o=audio.createOscillator(),g=audio.createGain(); o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(gain,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+dur);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+dur);}catch{} }

function seedZone(){ enemies=[];npcs=[];chests=[];decor=[];projectiles=[];boss=null; const z=zones[player.zone];
 for(let i=0;i<90;i++) decor.push({x:rnd(90,z.w-90),y:rnd(90,z.h-90),r:rnd(10,38),kind:i%4});
 if(player.zone===0){ npcs.push({x:780,y:1010,name:'Elyra',role:'Ancienne'}); npcs.push({x:1120,y:1320,name:'Marek',role:'Marchand'}); }
 if(player.zone===1) npcs.push({x:620,y:1450,name:'Nox',role:'Éclaireur'});
 if(player.zone===2) npcs.push({x:660,y:1120,name:'Sira',role:'Archiviste'});
 const count=[10,16,20,10][player.zone]; for(let i=0;i<count;i++) spawnEnemy(rnd(700,z.w-500),rnd(260,z.h-260), player.zone===3&&i>5?'shade':'normal');
 for(let i=0;i<5;i++){ const id=player.zone+'-'+i; chests.push({id,x:rnd(700,z.w-400),y:rnd(250,z.h-250),open:(save.chests||[]).includes(id)}); }
 if(player.zone===3 && !bossDead){ boss={x:2200,y:1050,r:62,hp:620,maxHp:620,phase:1,cd:1.5,name:'Gardien du Néant',dead:false}; }
}
function spawnEnemy(x,y,type='normal'){ const lv=player.zone+1; enemies.push({x,y,r:type==='shade'?27:22,hp:45+lv*24,maxHp:45+lv*24,speed:70+lv*12,damage:8+lv*4,cd:rnd(.2,1.2),type,flash:0}); }
seedZone();

function gainXp(n){ player.xp+=n; while(player.xp>=player.nextXp){player.xp-=player.nextXp;player.level++;player.nextXp=Math.round(player.nextXp*1.35);player.maxHp+=16;player.hp=player.maxHp;player.attack+=4;toast('NIVEAU '+player.level+' !',COLORS.gold);burst(player.x,player.y,COLORS.gold,35);sound(760,.25,'triangle',.08)} }
function toast(t,c=COLORS.white){texts.push({x:W/2,y:115,text:t,color:c,life:2,screen:true});}
function floatText(x,y,t,c=COLORS.white){texts.push({x,y,text:t,color:c,life:1,screen:false});}
function burst(x,y,c,n=12){ for(let i=0;i<n;i++)particles.push({x,y,vx:rnd(-170,170),vy:rnd(-170,170),life:rnd(.3,.8),c,r:rnd(2,6)}); }

const input={mx:0,my:0,attack:false,dodge:false,interact:false,potion:false};
const touches=new Map(); const joy={id:null,cx:155,cy:555,x:155,y:555};
const btns={attack:{x:1110,y:560,r:70},dodge:{x:965,y:610,r:48},interact:{x:1105,y:405,r:46},potion:{x:850,y:620,r:42},inventory:{x:1160,y:70,r:32},map:{x:1080,y:70,r:32}};
function toGame(clientX,clientY){const r=canvas.getBoundingClientRect(),px=(clientX-r.left)*(canvas.width/r.width),py=(clientY-r.top)*(canvas.height/r.height);return{x:(px-ox)/scale,y:(py-oy)/scale};}
function pointIn(p,b){return Math.hypot(p.x-b.x,p.y-b.y)<=b.r;}
canvas.addEventListener('pointerdown',e=>{ e.preventDefault(); try{audio&&audio.resume()}catch{} const p=toGame(e.clientX,e.clientY); touches.set(e.pointerId,p);
 if(p.x<390&&p.y>350&&joy.id===null){joy.id=e.pointerId;joy.x=p.x;joy.y=p.y;calcJoy();return}
 if(pointIn(p,btns.attack)){input.attack=true;return} if(pointIn(p,btns.dodge)){input.dodge=true;return} if(pointIn(p,btns.interact)){input.interact=true;return} if(pointIn(p,btns.potion)){input.potion=true;return}
 if(pointIn(p,btns.inventory)){showInventory=!showInventory;showMap=false;return} if(pointIn(p,btns.map)){showMap=!showMap;showInventory=false;return}
});
canvas.addEventListener('pointermove',e=>{ if(!touches.has(e.pointerId))return; const p=toGame(e.clientX,e.clientY);touches.set(e.pointerId,p);if(joy.id===e.pointerId){joy.x=p.x;joy.y=p.y;calcJoy();}});
function endPointer(e){touches.delete(e.pointerId);if(joy.id===e.pointerId){joy.id=null;joy.x=joy.cx;joy.y=joy.cy;input.mx=input.my=0;}}
canvas.addEventListener('pointerup',endPointer);canvas.addEventListener('pointercancel',endPointer);
function calcJoy(){let dx=joy.x-joy.cx,dy=joy.y-joy.cy,d=Math.hypot(dx,dy);if(d>72){dx=dx/d*72;dy=dy/d*72;joy.x=joy.cx+dx;joy.y=joy.cy+dy;}input.mx=dx/72;input.my=dy/72;}
addEventListener('keydown',e=>{ if(e.key==='w'||e.key==='ArrowUp')input.my=-1;if(e.key==='s'||e.key==='ArrowDown')input.my=1;if(e.key==='a'||e.key==='ArrowLeft')input.mx=-1;if(e.key==='d'||e.key==='ArrowRight')input.mx=1;if(e.key===' ')input.attack=true;if(e.key==='e')input.interact=true;if(e.key==='q')input.dodge=true;});
addEventListener('keyup',e=>{ if(['w','s','ArrowUp','ArrowDown'].includes(e.key))input.my=0;if(['a','d','ArrowLeft','ArrowRight'].includes(e.key))input.mx=0;});

function nearestInteract(){ let best=null,bd=95; for(const n of npcs){let d=dist(player,n);if(d<bd){bd=d;best={type:'npc',o:n}}} for(const c of chests){let d=dist(player,c);if(d<bd&&!c.open){bd=d;best={type:'chest',o:c}}} const g=zones[player.zone].gate; let d=Math.hypot(player.x-g.x,player.y-g.y);if(d<110&&d<bd)best={type:'gate',o:g}; return best; }
function interact(){ const a=nearestInteract(); if(!a)return;
 if(a.type==='npc'){ const n=a.o; if(n.name==='Elyra'){ if(quest===0){quest=1;toast('QUÊTE : Les Éclats perdus',COLORS.gold);} else if(quest===1&&player.shards>=5){player.shards-=5;quest=2;player.coins+=120;gainXp(100);toast('PASSAGE VERS LA FORÊT DÉBLOQUÉ',COLORS.gold);} else if(quest===1)toast('Elyra : rapporte-moi 5 Éclats.'); else toast('Elyra : le Néant s’agite à l’est...'); }
 else if(n.name==='Marek'){ if(player.coins>=40){player.coins-=40;player.potions++;toast('Potion achetée (-40 or)',COLORS.blue)}else toast('Marek : une potion coûte 40 or.'); }
 else if(n.name==='Nox'){ if(quest<3){quest=3;gainXp(60);toast('QUÊTE : Traverser les ruines',COLORS.gold)}else toast('Nox : les ruines cachent la clef du Sanctuaire.'); }
 else if(n.name==='Sira'){ if(quest<4){quest=4;gainXp(80);toast('LE SANCTUAIRE EST OUVERT',COLORS.gold)}else toast('Sira : détruis le Gardien du Néant.'); }
 sound(500,.08,'triangle'); }
 if(a.type==='chest'){ a.o.open=true;save.chests ||= [];save.chests.push(a.o.id);const coins=Math.floor(rnd(25,70));player.coins+=coins;if(Math.random()<.55)player.potions++;if(Math.random()<.5)player.shards++;toast('Coffre : +'+coins+' or',COLORS.gold);burst(a.o.x,a.o.y,COLORS.gold,22);sound(900,.15,'square'); }
 if(a.type==='gate'){ const req=[2,2,4,5][player.zone]; if(player.zone===3&&bossDead){changeZone(0);return} if(player.zone<3&&quest>=req)changeZone(a.o.to); else if(player.zone===3)toast('Le Gardien verrouille le passage.',COLORS.red); else toast('Le passage est encore scellé.',COLORS.red); }
}
function changeZone(z){player.zone=z;const s=zones[z].spawn;player.x=s.x;player.y=s.y;seedZone();zoneBanner=3;persist();sound(320,.35,'sine',.06)}
function usePotion(){if(player.potions<=0){toast('Plus de potions.',COLORS.red);return}if(player.hp>=player.maxHp)return;player.potions--;player.hp=Math.min(player.maxHp,player.hp+55);burst(player.x,player.y,COLORS.blue,20);floatText(player.x,player.y-35,'+55 PV',COLORS.blue);sound(620,.18,'sine',.07)}
function attack(){ if(player.attackCd>0)return;player.attackCd=.38; const ax=Math.cos(player.dir),ay=Math.sin(player.dir);sound(170,.07,'sawtooth',.04);
 for(const e of enemies){const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy),dot=(dx*ax+dy*ay)/(d||1);if(d<105&&dot>.15){const dmg=Math.round(player.attack*rnd(.85,1.2));e.hp-=dmg;e.flash=.12;e.x+=ax*26;e.y+=ay*26;floatText(e.x,e.y-25,'-'+dmg,COLORS.white);burst(e.x,e.y,COLORS.red,6)}}
 if(boss&&!boss.dead){const dx=boss.x-player.x,dy=boss.y-player.y,d=Math.hypot(dx,dy),dot=(dx*ax+dy*ay)/(d||1);if(d<145&&dot>.05){const dmg=Math.round(player.attack*rnd(.8,1.15));boss.hp-=dmg;floatText(boss.x,boss.y-70,'-'+dmg,COLORS.white);burst(boss.x,boss.y,COLORS.violet,8)}}
}
function hurt(n,kx=0,ky=0){if(player.invul>0)return;player.hp-=n;player.invul=.65;player.x+=kx;player.y+=ky;floatText(player.x,player.y-30,'-'+n,COLORS.red);burst(player.x,player.y,COLORS.red,12);sound(90,.12,'square',.06);if(player.hp<=0)die();}
function die(){player.hp=player.maxHp;player.coins=Math.max(0,player.coins-50);const s=zones[player.zone].spawn;player.x=s.x;player.y=s.y;toast('Vous vous réveillez au dernier sanctuaire. -50 or',COLORS.red);}

function update(dt){ if(paused||showInventory||showMap)return; playTime+=dt; zoneBanner-=dt; player.invul=Math.max(0,player.invul-dt);player.attackCd=Math.max(0,player.attackCd-dt);player.dodgeCd=Math.max(0,player.dodgeCd-dt);player.dodge=Math.max(0,player.dodge-dt);
 if(input.attack){attack();input.attack=false} if(input.interact){interact();input.interact=false} if(input.potion){usePotion();input.potion=false}
 if(input.dodge){if(player.dodgeCd<=0){player.dodge=.25;player.dodgeCd=1.4;player.invul=.35;sound(260,.08,'triangle',.04)}input.dodge=false}
 let mx=input.mx,my=input.my,m=Math.hypot(mx,my);if(m>1){mx/=m;my/=m} if(m>.08){player.dir=Math.atan2(my,mx);const sp=player.speed*(player.dodge>0?2.5:1);player.x+=mx*sp*dt;player.y+=my*sp*dt;}
 const z=zones[player.zone];player.x=clamp(player.x,55,z.w-55);player.y=clamp(player.y,55,z.h-55);
 for(const e of enemies){e.cd-=dt;e.flash=Math.max(0,e.flash-dt);const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy);if(d<520){if(d>e.r+player.r+12){e.x+=dx/d*e.speed*dt;e.y+=dy/d*e.speed*dt}else if(e.cd<=0){hurt(e.damage,-dx/d*28,-dy/d*28);e.cd=1.0+rnd(0,.4)} if(e.type==='shade'&&d<410&&e.cd<=.15&&Math.random()<.025){projectiles.push({x:e.x,y:e.y,vx:dx/d*260,vy:dy/d*260,r:7,damage:e.damage,life:2.5,c:COLORS.violet});}}}
 for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(e.hp<=0){player.kills++;player.coins+=Math.floor(rnd(5,15));if(Math.random()<.28)player.shards++;gainXp(18+player.zone*8);burst(e.x,e.y,COLORS.violet,16);enemies.splice(i,1);}}
 if(boss&&!boss.dead){boss.cd-=dt;const d=dist(player,boss),dx=player.x-boss.x,dy=player.y-boss.y;if(boss.hp<boss.maxHp*.55)boss.phase=2;if(d<680){if(d>150){boss.x+=dx/d*(boss.phase===2?78:55)*dt;boss.y+=dy/d*(boss.phase===2?78:55)*dt}else if(boss.cd<=0){hurt(boss.phase===2?24:18,-dx/d*45,-dy/d*45);boss.cd=.85}if(boss.cd<=0.1&&Math.random()<.018*(boss.phase+1)){for(let a=0;a<TAU;a+=TAU/(boss.phase===2?10:7))projectiles.push({x:boss.x,y:boss.y,vx:Math.cos(a)*230,vy:Math.sin(a)*230,r:9,damage:14,life:3,c:COLORS.violet});boss.cd=1.4;}}
  if(boss.hp<=0){boss.dead=true;bossDead=true;quest=5;player.coins+=500;gainXp(450);toast('GARDIEN DU NÉANT VAINCU !',COLORS.gold);burst(boss.x,boss.y,COLORS.gold,80);sound(120,.5,'sawtooth',.1);persist();}}
 for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(hit(p,player,p.r+player.r)){hurt(p.damage);p.life=0}if(p.life<=0)projectiles.splice(i,1)}
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;p.life-=dt;if(p.life<=0)particles.splice(i,1)}
 for(let i=texts.length-1;i>=0;i--){texts[i].life-=dt;if(!texts[i].screen)texts[i].y-=22*dt;if(texts[i].life<=0)texts.splice(i,1)}
}

function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function worldCamera(){const z=zones[player.zone];return{x:clamp(player.x-W/2,0,Math.max(0,z.w-W)),y:clamp(player.y-H/2,0,Math.max(0,z.h-H))};}
function draw(){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#030710';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.setTransform(scale,0,0,scale,ox,oy);const cam=worldCamera();drawWorld(cam);drawHUD(cam);if(showInventory)drawInventory();if(showMap)drawBigMap();}
function drawWorld(cam){const z=zones[player.zone];ctx.fillStyle=z.bg;ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(-cam.x,-cam.y);
 // ground grid / ambient
 ctx.globalAlpha=.16;ctx.strokeStyle=z.accent;ctx.lineWidth=1;for(let x=0;x<z.w;x+=160){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,z.h);ctx.stroke()}for(let y=0;y<z.h;y+=160){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(z.w,y);ctx.stroke()}ctx.globalAlpha=1;
 for(const d of decor){ctx.fillStyle=d.kind===0?'#0b241e':d.kind===1?'#234d3d':d.kind===2?'#334155':'#1e293b';ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,TAU);ctx.fill();if(d.kind===1){ctx.strokeStyle=z.accent;ctx.globalAlpha=.18;ctx.stroke();ctx.globalAlpha=1}}
 // gate
 const g=z.gate;ctx.fillStyle=z.accent;ctx.globalAlpha=.18;ctx.beginPath();ctx.arc(g.x,g.y,74+Math.sin(performance.now()/280)*8,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=z.accent;ctx.lineWidth=8;ctx.strokeRect(g.x-38,g.y-64,76,128);
 // chests
 for(const c of chests){ctx.fillStyle=c.open?'#5b4631':'#b9822f';rr(c.x-24,c.y-18,48,36,7);ctx.fillStyle=c.open?'#2d251d':COLORS.gold;ctx.fillRect(c.x-4,c.y-4,8,10)}
 // npcs
 for(const n of npcs){ctx.fillStyle='#d9d4ff';ctx.beginPath();ctx.arc(n.x,n.y,21,0,TAU);ctx.fill();ctx.strokeStyle=z.accent;ctx.lineWidth=4;ctx.stroke();ctx.fillStyle=COLORS.white;ctx.font='700 14px system-ui';ctx.textAlign='center';ctx.fillText(n.name,n.x,n.y-34)}
 // enemies
 for(const e of enemies){ctx.fillStyle=e.flash>0?'white':e.type==='shade'?'#8e68d8':'#d34f65';ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,TAU);ctx.fill();ctx.fillStyle='#090d16';ctx.beginPath();ctx.arc(e.x-7,e.y-4,3,0,TAU);ctx.arc(e.x+7,e.y-4,3,0,TAU);ctx.fill();bar(e.x-24,e.y-e.r-15,48,6,e.hp/e.maxHp,'#ff6075')}
 // boss
 if(boss&&!boss.dead){ctx.save();ctx.translate(boss.x,boss.y);ctx.rotate(performance.now()/2000);ctx.strokeStyle=COLORS.violet;ctx.lineWidth=8;ctx.beginPath();ctx.arc(0,0,boss.r+16,0,TAU);ctx.stroke();ctx.rotate(-performance.now()/1000);for(let i=0;i<6;i++){ctx.rotate(TAU/6);ctx.fillStyle='#5e3a85';ctx.fillRect(boss.r-4,-7,32,14)}ctx.restore();ctx.fillStyle='#b166d4';ctx.beginPath();ctx.arc(boss.x,boss.y,boss.r,0,TAU);ctx.fill()}
 for(const p of projectiles){ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill()}
 // player
 ctx.save();ctx.translate(player.x,player.y);ctx.rotate(player.dir);ctx.globalAlpha=player.invul>0&&Math.floor(performance.now()/70)%2?0.35:1;ctx.fillStyle='#e6f2ff';ctx.beginPath();ctx.arc(0,0,player.r,0,TAU);ctx.fill();ctx.fillStyle='#3ba7ff';ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-12,-13);ctx.lineTo(-12,13);ctx.closePath();ctx.fill();if(player.attackCd>.18){ctx.strokeStyle=COLORS.gold;ctx.lineWidth=9;ctx.beginPath();ctx.arc(0,0,72,-.7,.7);ctx.stroke()}ctx.restore();
 for(const p of particles){ctx.globalAlpha=clamp(p.life*2,0,1);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill()}ctx.globalAlpha=1;
 for(const t of texts.filter(t=>!t.screen)){ctx.globalAlpha=clamp(t.life,0,1);ctx.fillStyle=t.color;ctx.font='800 18px system-ui';ctx.textAlign='center';ctx.fillText(t.text,t.x,t.y)}ctx.globalAlpha=1;
 ctx.restore(); }
function bar(x,y,w,h,p,c){ctx.fillStyle='rgba(0,0,0,.55)';rr(x,y,w,h,h/2);ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w*clamp(p,0,1),h,h/2);ctx.fill()}
function drawHUD(cam){ // top status
 ctx.fillStyle='rgba(5,9,18,.78)';rr(22,18,410,92,20);ctx.fillStyle=COLORS.white;ctx.font='800 20px system-ui';ctx.textAlign='left';ctx.fillText('AETHERFALL',42,49);ctx.font='650 14px system-ui';ctx.fillStyle='#aab5c8';ctx.fillText(zones[player.zone].name+'  •  Niv. '+player.level,42,72);bar(42,82,250,12,player.hp/player.maxHp,COLORS.red);ctx.fillStyle=COLORS.white;ctx.font='700 12px system-ui';ctx.fillText(Math.ceil(player.hp)+' / '+player.maxHp+' PV',302,92);bar(42,100,250,6,player.xp/player.nextXp,COLORS.blue);
 // currencies
 ctx.fillStyle='rgba(5,9,18,.72)';rr(452,18,300,52,16);ctx.font='750 16px system-ui';ctx.fillStyle=COLORS.gold;ctx.fillText('◆ '+player.coins+' or',474,50);ctx.fillStyle=COLORS.violet;ctx.fillText('✦ '+player.shards+' éclats',580,50);ctx.fillStyle=COLORS.blue;ctx.fillText('✚ '+player.potions,704,50);
 // quest
 ctx.fillStyle='rgba(5,9,18,.72)';rr(452,80,430,58,16);ctx.fillStyle='#aab5c8';ctx.font='650 13px system-ui';ctx.fillText('OBJECTIF',472,101);ctx.fillStyle=COLORS.white;ctx.font='750 15px system-ui';ctx.fillText(questText(),472,125);
 // minimap
 ctx.fillStyle='rgba(5,9,18,.72)';rr(900,20,165,118,18);const z=zones[player.zone],mw=135,mh=84,mx=915,my=40;ctx.fillStyle=z.bg;ctx.fillRect(mx,my,mw,mh);ctx.fillStyle=z.accent;ctx.beginPath();ctx.arc(mx+player.x/z.w*mw,my+player.y/z.h*mh,5,0,TAU);ctx.fill();ctx.fillStyle=COLORS.gold;ctx.beginPath();ctx.arc(mx+z.gate.x/z.w*mw,my+z.gate.y/z.h*mh,4,0,TAU);ctx.fill();
 button(btns.map,'M',false);button(btns.inventory,'☰',false);
 // touch controls
 ctx.globalAlpha=.75;ctx.fillStyle='rgba(255,255,255,.08)';ctx.beginPath();ctx.arc(joy.cx,joy.cy,84,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.arc(joy.x,joy.y,35,0,TAU);ctx.fill();ctx.globalAlpha=1;
 button(btns.attack,'⚔',true);button(btns.dodge,'↯',true);button(btns.interact,'E',true);button(btns.potion,'✚',true);
 const a=nearestInteract();if(a){ctx.fillStyle=COLORS.white;ctx.font='800 14px system-ui';ctx.textAlign='center';ctx.fillText(a.type==='gate'?'PASSAGE':a.type==='chest'?'OUVRIR':'PARLER',btns.interact.x,btns.interact.y+68)}
 if(boss&&!boss.dead){ctx.fillStyle='rgba(5,9,18,.84)';rr(310,153,660,54,18);ctx.fillStyle=COLORS.white;ctx.font='800 16px system-ui';ctx.textAlign='center';ctx.fillText(boss.name,640,175);bar(352,185,576,10,boss.hp/boss.maxHp,COLORS.violet)}
 if(zoneBanner>0){ctx.globalAlpha=clamp(zoneBanner,0,1);ctx.fillStyle=COLORS.white;ctx.font='900 34px system-ui';ctx.textAlign='center';ctx.fillText(zones[player.zone].name.toUpperCase(),W/2,300);ctx.font='650 15px system-ui';ctx.fillStyle=zones[player.zone].accent;ctx.fillText(player.zone===0?'Le village aux portes du voile':player.zone===1?'Les arbres murmurent dans l’Éther':player.zone===2?'Une civilisation oubliée dort ici':'Le cœur du Néant',W/2,330);ctx.globalAlpha=1}
 for(const t of texts.filter(t=>t.screen)){ctx.globalAlpha=clamp(t.life,0,1);ctx.fillStyle='rgba(5,9,18,.82)';rr(W/2-250,t.y-28,500,44,16);ctx.fillStyle=t.color;ctx.font='850 18px system-ui';ctx.textAlign='center';ctx.fillText(t.text,t.x,t.y);ctx.globalAlpha=1}
}
function button(b,label,big){ctx.fillStyle='rgba(10,15,25,.68)';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle=COLORS.white;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=(big?'800 27px':'800 18px')+' system-ui';ctx.fillText(label,b.x,b.y+1);ctx.textBaseline='alphabetic'}
function questText(){ if(quest===0)return 'Parler à Elyra, l’Ancienne'; if(quest===1)return 'Rassembler 5 Éclats d’Éther ('+Math.min(5,player.shards)+'/5)'; if(quest===2)return 'Franchir le passage vers la Forêt'; if(quest===3)return 'Atteindre les Ruines d’Obsidienne'; if(quest===4)return 'Vaincre le Gardien du Néant'; return 'Le Gardien est vaincu — le monde respire à nouveau'; }
function drawInventory(){ctx.fillStyle='rgba(2,5,12,.92)';ctx.fillRect(0,0,W,H);ctx.fillStyle=COLORS.white;ctx.font='900 36px system-ui';ctx.textAlign='left';ctx.fillText('INVENTAIRE',70,90);ctx.fillStyle='#9ba7bd';ctx.font='600 16px system-ui';ctx.fillText('Touchez ☰ pour fermer',70,120);
 const cards=[['Niveau',player.level,COLORS.blue],['PV',Math.ceil(player.hp)+' / '+player.maxHp,COLORS.red],['Attaque',player.attack,COLORS.gold],['Or',player.coins,COLORS.gold],['Éclats',player.shards,COLORS.violet],['Potions',player.potions,COLORS.blue],['Ennemis vaincus',player.kills,COLORS.white],['Temps de jeu',Math.floor(playTime/60)+' min',COLORS.white]];let x=70,y=170;for(let i=0;i<cards.length;i++){ctx.fillStyle='rgba(255,255,255,.06)';rr(x,y,250,110,18);ctx.fillStyle='#9ba7bd';ctx.font='650 14px system-ui';ctx.fillText(cards[i][0],x+20,y+32);ctx.fillStyle=cards[i][2];ctx.font='900 30px system-ui';ctx.fillText(String(cards[i][1]),x+20,y+75);x+=280;if(x>950){x=70;y+=135}}
 ctx.fillStyle='rgba(255,255,255,.06)';rr(910,170,300,380,22);ctx.fillStyle=COLORS.white;ctx.font='800 20px system-ui';ctx.fillText('JOURNAL',940,210);ctx.fillStyle='#bdc7d8';ctx.font='600 15px system-ui';wrap(quest===0?'Les habitants de Valebrume parlent d’une corruption qui gagne les anciens chemins. Elyra semble en savoir davantage.':quest<4?'Les Éclats d’Éther réagissent à une force située toujours plus à l’est. Les passages antiques s’ouvrent un à un.':'Le Sanctuaire du Néant abrite le Gardien. Sa chute décidera du destin de Valebrume.',940,250,240,24);button(btns.inventory,'×',false)}
function wrap(text,x,y,max,line){const words=text.split(' ');let l='';for(const w of words){const t=l+w+' ';if(ctx.measureText(t).width>max){ctx.fillText(l,x,y);l=w+' ';y+=line}else l=t}ctx.fillText(l,x,y)}
function drawBigMap(){ctx.fillStyle='rgba(2,5,12,.94)';ctx.fillRect(0,0,W,H);ctx.fillStyle=COLORS.white;ctx.font='900 36px system-ui';ctx.textAlign='left';ctx.fillText('CARTE DU MONDE',70,80);let x=80;for(const z of zones){ctx.fillStyle=z.bg;rr(x,160,250,360,24);ctx.strokeStyle=z.id===player.zone?z.accent:'rgba(255,255,255,.12)';ctx.lineWidth=z.id===player.zone?5:2;ctx.strokeRect(x,160,250,360);ctx.fillStyle=z.accent;ctx.font='850 20px system-ui';ctx.fillText(z.name,x+20,205);ctx.fillStyle='#b8c1d1';ctx.font='600 14px system-ui';ctx.fillText(z.id<player.zone||z.id===player.zone?'Découverte':'Inconnue',x+20,235);ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(x+20,270,210,160);if(z.id===player.zone){ctx.fillStyle=COLORS.white;ctx.beginPath();ctx.arc(x+20+player.x/z.w*210,270+player.y/z.h*160,7,0,TAU);ctx.fill()}x+=285}button(btns.map,'×',false)}

function frame(now){let dt=Math.min(.033,(now-last)/1000);last=now;update(dt);draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();
