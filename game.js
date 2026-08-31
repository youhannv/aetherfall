
(() => {
'use strict';

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const round=(v,d=1)=>Number(v.toFixed(d));
const choice=a=>a[Math.floor(Math.random()*a.length)];
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);
const fmtDate=()=>new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium'}).format(new Date());
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const LABS = {
  hb:{label:'Hémoglobine',unit:'g/dL',lo:12,hi:16},
  neut:{label:'Neutrophiles',unit:'G/L',lo:1.5,hi:7.5},
  plt:{label:'Plaquettes',unit:'G/L',lo:150,hi:400},
  creat:{label:'Créatinine',unit:'µmol/L',lo:55,hi:105},
  egfr:{label:'DFG estimé',unit:'mL/min',lo:60,hi:130},
  calcium:{label:'Calcium corrigé',unit:'mmol/L',lo:2.2,hi:2.6},
  albumin:{label:'Albumine',unit:'g/L',lo:35,hi:50},
  b2m:{label:'β2-microglobuline',unit:'mg/L',lo:0.8,hi:2.4},
  ldh:{label:'LDH',unit:'UI/L',lo:120,hi:250},
  mprotein:{label:'Pic monoclonal',unit:'g/L',lo:0,hi:0},
  flc:{label:'Ratio chaînes légères',unit:'ratio',lo:0.26,hi:1.65},
  crp:{label:'CRP',unit:'mg/L',lo:0,hi:5}
};

const CYTO = [
  {k:'standard', label:'Risque standard', mods:{sensitivity:1.0,resistance:0.7,relapse:0.85}},
  {k:'del17p', label:'del(17p)', mods:{sensitivity:.84,resistance:1.4,relapse:1.45}},
  {k:'t414', label:'t(4;14)', mods:{sensitivity:.9,resistance:1.25,relapse:1.28}},
  {k:'gain1q', label:'gain 1q', mods:{sensitivity:.9,resistance:1.2,relapse:1.22}},
  {k:'del1p', label:'del(1p32)', mods:{sensitivity:.88,resistance:1.25,relapse:1.28}},
  {k:'double', label:'Double anomalie haut risque', mods:{sensitivity:.76,resistance:1.7,relapse:1.7}}
];

const FIRST = ['Camille','Alexandre','Sophie','Nicolas','Leïla','Thomas','Élodie','Julien','Sarah','Mehdi','Claire','Lucas','Nadia','Antoine','Emma','Romain'];
const LAST = ['Martin','Bernard','Robert','Petit','Durand','Moreau','Simon','Laurent','Michel','Leroy','Roux','Fournier','Girard','Andre'];
const SEX = ['F','M'];

function randn(){
  let u=0,v=0; while(!u)u=Math.random(); while(!v)v=Math.random();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
}
function jitter(v, sd){ return v + randn()*sd; }

function newPatient(preset='random'){
  const age = preset==='renal'?62:preset==='high'?55:preset==='standard'?47:Math.floor(38+Math.random()*28);
  const cy = preset==='high'?choice(CYTO.slice(1)):preset==='standard'?CYTO[0]:choice(Math.random()<.55?[CYTO[0],CYTO[0],...CYTO.slice(1)]:CYTO);
  const burden = preset==='renal'?.72:preset==='high'?.67:.45+Math.random()*.34;
  const renal = preset==='renal'?.65:Math.max(0, burden-.6+Math.random()*.18);
  const bone = .35+burden*.55+Math.random()*.2;
  const lesions = Math.max(0, Math.round(bone*8 + randn()*1.3));
  const p = {
    id:uid(), name:choice(FIRST)+' '+choice(LAST), age, sex:choice(SEX),
    diagnosis:'Myélome multiple nouvellement diagnostiqué',
    cyto:cy.k, cytoLabel:cy.label,
    phase:'diagnosis', cycle:0, month:0, day:1,
    burden, resistance:.06+Math.random()*.13*cy.mods.resistance, renal, bone,
    marrow:clamp(25+burden*55+jitter(0,5),10,92),
    lesions, lesionMap:makeLesions(lesions),
    toxicity:0, qol:clamp(82-burden*25-renal*16,35,92),
    infections:0, thrombosis:0, neuropathy:0, cardiac:0,
    stemCells:false, collected:false, asctCount:0,
    mrd5:null, mrd6:null, response:'Non évaluée',
    alive:true, status:'En cours', remissionMonths:0,
    treatmentLog:[], history:[], labsHistory:[], exams:{blood:false,imaging:false,marrow:false,cyto:true},
    supportive:{antiviral:false,thrombo:false,bone:false},
    score:1000, researchMode:false, selectedTreatment:null, trialPath:null,
    end:null, seed:Math.random()
  };
  p.labs = calcLabs(p);
  log(p,'Diagnostic','Patient virtuel créé. Bilan initial à compléter.');
  return p;
}

function makeLesions(n){
  const sites=[
    [50,42,'crâne'],[47,87,'rachis cervical'],[52,125,'rachis thoracique'],[50,166,'rachis lombaire'],
    [28,112,'côte gauche'],[72,112,'côte droite'],[37,178,'bassin gauche'],[64,178,'bassin droit'],
    [23,218,'fémur gauche'],[78,218,'fémur droit'],[18,105,'humérus gauche'],[82,105,'humérus droit']
  ];
  const arr=[]; const pool=[...sites];
  for(let i=0;i<n && pool.length;i++){
    const idx=Math.floor(Math.random()*pool.length), s=pool.splice(idx,1)[0];
    arr.push({x:s[0]+jitter(0,2),y:s[1]+jitter(0,3),site:s[2],size:round(5+Math.random()*16,0)});
  }
  return arr;
}

function cytoMods(p){ return (CYTO.find(c=>c.k===p.cyto)||CYTO[0]).mods; }

function calcLabs(p){
  const b=p.burden, r=p.renal, t=p.toxicity;
  const hb=clamp(14.2 - b*5.5 - t*1.8 + jitter(0,.25),6.2,15.8);
  const neut=clamp(4.4 - t*3.2 - p.infections*.35 + jitter(0,.25),.15,8);
  const plt=clamp(275 - b*80 - t*170 + jitter(0,15),15,420);
  const creat=clamp(76 + r*180 + b*25 + jitter(0,6),48,460);
  const egfr=clamp(118 - (creat-60)*.45 - p.age*.32 + jitter(0,3),8,125);
  const calcium=clamp(2.31 + p.bone*.42 + b*.22 - (p.supportive.bone?.07:0) + jitter(0,.025),1.9,3.45);
  const albumin=clamp(43 - b*9 - p.infections*1.2 + jitter(0,.7),24,49);
  const b2m=clamp(1.5 + b*7.2 + r*4.2 + jitter(0,.3),1.1,18);
  const ldh=clamp(170 + b*220*cytoMods(p).relapse + jitter(0,18),100,730);
  const mprotein=clamp(b*58 + jitter(0,1.2),0,74);
  const flc=clamp(1 + b*b*170*cytoMods(p).relapse + jitter(0,4),.1,250);
  const crp=clamp(2 + p.infections*11 + t*6 + jitter(0,1.4),0,120);
  return {hb,neut,plt,creat,egfr,calcium,albumin,b2m,ldh,mprotein,flc,crp};
}

function responseCategory(p){
  const m0=p.labsHistory[0]?.vals?.mprotein ?? Math.max(1,p.labs.mprotein);
  const reduction=1-(p.labs.mprotein/Math.max(1,m0));
  if(p.burden<.000001 && p.mrd6===false) return 'sCR / MRD 10⁻⁶ négative';
  if(p.burden<.003 && p.mrd5===false) return 'CR / MRD négative';
  if(reduction>=.9 || p.burden<.08) return 'VGPR';
  if(reduction>=.5 || p.burden<.28) return 'PR';
  if(p.burden>Math.max(.75,(1-reduction)*.95)) return 'PD';
  return 'SD';
}

function recalc(p, snapshot=true){
  p.burden=clamp(p.burden,0,1.25); p.resistance=clamp(p.resistance,0,1.2);
  p.renal=clamp(p.renal,0,1); p.bone=clamp(p.bone,0,1); p.toxicity=clamp(p.toxicity,0,1);
  p.qol=clamp(p.qol,0,100); p.marrow=clamp(4+p.burden*84+jitter(0,2),0,95);
  p.labs=calcLabs(p); p.response=responseCategory(p);
  if(snapshot){
    p.labsHistory.push({month:p.month,cycle:p.cycle,vals:{...p.labs},burden:p.burden,response:p.response});
    if(p.labsHistory.length>80)p.labsHistory.shift();
  }
}

function log(p,title,text){
  p.history.unshift({id:uid(),month:p.month,cycle:p.cycle,title,text,date:fmtDate()});
  if(p.history.length>120)p.history.pop();
}

function assessSafety(p){
  const l=p.labs;
  const danger=[];
  if(l.neut<.5) danger.push('neutropénie sévère');
  if(l.plt<25) danger.push('thrombopénie sévère');
  if(l.hb<7) danger.push('anémie sévère');
  if(l.egfr<15) danger.push('insuffisance rénale majeure');
  if(l.calcium>3.1) danger.push('hypercalcémie majeure');
  if(p.cardiac>=3) danger.push('toxicité cardiaque importante');
  return danger;
}

function maybeEvent(p, regimen){
  let event=null;
  const tox=p.toxicity;
  const r=Math.random();
  if(regimen==='isakrd' && r<.07+tox*.05){p.infections++;p.toxicity+=.08;event='Épisode infectieux simulé sous traitement.';}
  else if(regimen==='isakrd' && r<.12+tox*.07){p.cardiac++;p.toxicity+=.07;event='Signal de toxicité cardiovasculaire simulée.';}
  else if(regimen==='asct' && r<.22){p.infections++;p.toxicity+=.13;event='Fièvre/neutropénie post-autogreffe simulée.';}
  else if(regimen==='tandem' && r<.32){p.infections++;p.toxicity+=.18;event='Complication infectieuse après stratégie intensive.';}
  if(!p.supportive.thrombo && ['isakrd','len','isaiber'].includes(regimen) && Math.random()<.035){p.thrombosis++;p.toxicity+=.08;event='Événement thrombotique simulé.';}
  if(event)log(p,'Événement indésirable',event);
}

function treatmentEffect(p,key){
  if(!p.alive)return;
  const mods=cytoMods(p), before=p.burden;
  let kill=0,tox=0,months=1,label='',resInc=.01;
  if(key==='isakrd'){
    kill=(.34+.12*Math.random())*mods.sensitivity*(1-p.resistance*.55);
    tox=.065+.055*Math.random(); label='Cycle Isa-KRd'; resInc=.018;
  } else if(key==='asct'){
    kill=(.68+.16*Math.random())*mods.sensitivity*(1-p.resistance*.35);
    tox=.22+.10*Math.random(); label='Autogreffe (ASCT)'; months=2; p.asctCount++; resInc=.006;
  } else if(key==='tandem'){
    kill=(.78+.13*Math.random())*mods.sensitivity*(1-p.resistance*.3);
    tox=.34+.12*Math.random(); label='Tandem ASCT'; months=3; p.asctCount+=2; resInc=.008;
  } else if(key==='len'){
    kill=(.06+.05*Math.random())*mods.sensitivity*(1-p.resistance*.7);
    tox=.025+.025*Math.random(); label='Maintenance lénalidomide'; resInc=.008;
  } else if(key==='isaiber'){
    kill=(.10+.07*Math.random())*mods.sensitivity*(1-p.resistance*.6);
    tox=.045+.03*Math.random(); label='Maintenance Isa + iberdomide'; resInc=.006;
  } else if(key==='observe'){
    kill=-.025*mods.relapse*(1+p.resistance); tox=-.035; label='Surveillance sans traitement'; resInc=.012;
  }
  if(key==='asct' && !p.collected){toast('Recueil de cellules souches requis avant ASCT.');return;}
  if(key==='tandem' && !p.collected){toast('Recueil de cellules souches requis avant tandem ASCT.');return;}

  if(kill>=0) p.burden *= Math.max(.0000002,1-kill);
  else p.burden *= 1-kill;
  p.toxicity += tox;
  p.resistance += resInc*mods.resistance*(before>.08?1:.5);
  p.renal += p.burden*.025 - (p.burden<.15?.025:0);
  p.bone += p.burden*.012 - (p.supportive.bone?.02:0);
  p.qol += (p.burden<before?4:-5) - tox*28;
  p.month += months; p.cycle += 1;
  maybeEvent(p,key);
  recovery(p,months);
  recalc(p,true);
  p.treatmentLog.push({month:p.month,key,label,before,after:p.burden,tox:p.toxicity,response:p.response});
  log(p,label,`Réponse simulée : ${p.response}. Charge tumorale du modèle ${Math.round(before*100)}% → ${Math.max(.0001,p.burden*100).toFixed(p.burden<.01?2:0)}%.`);

  const danger=assessSafety(p);
  if(danger.length){
    p.score-=90*danger.length;
    log(p,'Alerte sécurité',danger.join(', ')+'.');
  }
  mortalityCheck(p,key);
  updatePhase(p);
  autoSave();
}

function recovery(p,months){
  p.toxicity=Math.max(0,p.toxicity-.035*months);
  if(p.supportive.antiviral)p.infections=Math.max(0,p.infections-(Math.random()<.2?1:0));
  if(p.supportive.bone)p.bone=Math.max(0,p.bone-.008*months);
}

function mortalityCheck(p,key){
  let risk=0;
  const l=p.labs;
  risk += p.toxicity>.8?.08:0;
  risk += l.neut<.3?.045:0; risk += l.plt<15?.04:0; risk += l.egfr<10?.035:0;
  risk += p.infections>=3?.025:0;
  if(key==='tandem')risk+=.012;
  if(Math.random()<risk){
    p.alive=false;p.status='Décès simulé';p.end='death';p.score-=500;
    log(p,'Fin de simulation','Le patient virtuel est décédé d’une complication du modèle.');
  }
}

function updatePhase(p){
  if(!p.alive)return;
  if(p.phase==='diagnosis' && p.exams.blood && p.exams.imaging && p.exams.marrow) {
    p.phase='induction';p.cycle=0;log(p,'Parcours','Bilan initial complet. Phase d’induction ouverte.');
  }
  if(p.phase==='induction' && p.treatmentLog.filter(x=>x.key==='isakrd').length>=6){
    p.phase='mrd1'; p.mrd5 = p.burden >= .00001;
    log(p,'MRD post-induction',p.mrd5?'MRD NGS 10⁻⁵ : POSITIVE.':'MRD NGS 10⁻⁵ : NÉGATIVE.');
  }
  if(p.phase==='consolidation'){
    const cons=p.treatmentLog.filter(x=>x.month>=p.consolidationStart);
    const path=p.trialPath;
    const done = path==='A' ? cons.filter(x=>x.key==='isakrd').length>=6 :
                 path==='B' ? p.asctCount>=1 && cons.filter(x=>x.key==='isakrd').length>=2 :
                 path==='C' ? p.asctCount>=1 && cons.filter(x=>x.key==='isakrd').length>=2 :
                 path==='D' ? p.asctCount>=2 : false;
    if(done){
      p.phase='mrd2';p.mrd6=p.burden>=.000001;
      log(p,'MRD pré-maintenance',p.mrd6?'MRD NGS 10⁻⁶ : POSITIVE.':'MRD NGS 10⁻⁶ : NÉGATIVE.');
    }
  }
  if(p.phase==='maintenance' && p.month>=42){
    p.status = (p.mrd6===false && p.burden<.00001)?'Rémission profonde durable':'Suivi terminé';
    p.end='completed';
    p.score += p.mrd6===false?500:220;
    log(p,'Fin de partie',p.status+'. Le terme « guéri » n’est pas utilisé comme conclusion clinique : le jeu récompense une rémission profonde durable.');
  }
  if(p.burden>1.05){
    p.status='Progression majeure';p.end='progression';p.score-=350;
    log(p,'Progression','Progression importante du myélome virtuel.');
  }
}

function runExam(p,type){
  if(!p.alive)return;
  if(type==='blood'){
    p.exams.blood=true;recalc(p,true);p.score+=20;
    log(p,'Biologie','NFS, fonction rénale, calcium, albumine, LDH, β2M et marqueurs monoclonaux actualisés.');
  } else if(type==='imaging'){
    p.exams.imaging=true;
    const target=Math.max(0,Math.round(p.bone*8+p.burden*3));
    if(target<p.lesionMap.length)p.lesionMap=p.lesionMap.slice(0,target);
    else if(target>p.lesionMap.length)p.lesionMap=[...p.lesionMap,...makeLesions(target-p.lesionMap.length)];
    p.lesions=p.lesionMap.length;p.score+=20;log(p,'Imagerie','Imagerie corps entier simulée actualisée.');
  } else if(type==='marrow'){
    p.exams.marrow=true;p.marrow=clamp(4+p.burden*84+jitter(0,2),0,95);p.score+=20;
    if(p.phase==='mrd1'){p.mrd5=p.burden>=.00001;}
    if(p.phase==='mrd2'){p.mrd6=p.burden>=.000001;}
    log(p,'Myélogramme / MRD',`Plasmocytose médullaire simulée : ${p.marrow.toFixed(1)}%.`);
  } else if(type==='collect'){
    if(p.phase!=='induction'){toast('Le recueil est proposé pendant l’induction dans ce simulateur.');return;}
    p.collected=true;p.stemCells=true;p.score+=30;
    log(p,'Mobilisation / recueil','Cellules souches virtuelles recueillies (G-CSF ± plerixafor dans la logique MIDAS).');
  }
  updatePhase(p);autoSave();render();
}

function choosePath(p,path){
  if(p.phase!=='mrd1')return;
  const valid = p.mrd5===false ? ['A','B'] : ['C','D'];
  if(!valid.includes(path)){toast('Cette branche ne correspond pas au statut MRD du patient dans la logique MIDAS.');return;}
  p.trialPath=path;p.phase='consolidation';p.consolidationStart=p.month;
  log(p,'Consolidation',`Branche ${path} choisie par le joueur.`);
  autoSave();render();
}
function startMaintenance(p){
  if(p.phase!=='mrd2')return;
  p.phase='maintenance';p.maintenanceStart=p.month;
  log(p,'Maintenance','Phase de maintenance débutée.');
  autoSave();render();
}
function supportive(p,key){
  if(key==='antiviral')p.supportive.antiviral=!p.supportive.antiviral;
  if(key==='thrombo')p.supportive.thrombo=!p.supportive.thrombo;
  if(key==='bone')p.supportive.bone=!p.supportive.bone;
  if(key==='gcsf'){p.toxicity=Math.max(0,p.toxicity-.03);p.labs.neut+=.7;p.score-=5;log(p,'Support','G-CSF simulé administré.');}
  if(key==='transfusion'){p.labs.hb+=1.4;p.qol+=4;p.score-=5;log(p,'Support','Transfusion virtuelle administrée.');}
  if(key==='hydration'){p.renal=Math.max(0,p.renal-.07);p.score-=3;log(p,'Support','Mesures d’hydratation/support rénal simulées.');}
  recalc(p,false);autoSave();render();
}

const baseState={patients:[],activeId:null,tab:'patient',version:2};
let state=loadState();
function loadState(){
  try{
    const s=JSON.parse(localStorage.getItem('myeloma-lab-save-v2')||'null');
    return s?{...baseState,...s}:structuredClone(baseState);
  }catch{return structuredClone(baseState)}
}
function autoSave(){localStorage.setItem('myeloma-lab-save-v2',JSON.stringify(state));}
addEventListener('pagehide',autoSave);document.addEventListener('visibilitychange',()=>document.hidden&&autoSave());

function active(){return state.patients.find(p=>p.id===state.activeId)||null}
function addPatient(preset){
  if(state.patients.length>=6){toast('Maximum 6 patients dans la cohorte.');return;}
  const p=newPatient(preset);state.patients.push(p);state.activeId=p.id;autoSave();render();
}
function removePatient(id){
  state.patients=state.patients.filter(p=>p.id!==id);
  if(state.activeId===id)state.activeId=state.patients[0]?.id||null;
  autoSave();render();
}

function render(){
  const p=active(); $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));
  if(!p){renderWelcome();return;}
  if(state.tab==='patient')renderPatient(p);
  if(state.tab==='labs')renderLabs(p);
  if(state.tab==='imaging')renderImaging(p);
  if(state.tab==='treatment')renderTreatment(p);
  if(state.tab==='history')renderHistory(p);
}

function patientSelect(p){
  return `<select id="patientSelect" class="selector" aria-label="Choisir un patient">
    ${state.patients.map(x=>`<option value="${x.id}" ${x.id===p.id?'selected':''}>${esc(x.name)} — ${x.age} ans — ${esc(x.status)}</option>`).join('')}
  </select>`;
}

function renderWelcome(){
  $('#main').innerHTML=`
    <section class="card">
      <div class="hero"><div class="avatar">🧬</div><div class="hero-main">
        <h2>Créer un patient virtuel</h2>
        <p>Simulateur éducatif de myélome multiple, inspiré du parcours MRD-adapté de MIDAS.</p>
      </div></div>
    </section>
    <section class="warning">⚠️ Simulation pédagogique uniquement. Les résultats, toxicités et probabilités sont volontairement simplifiés et ne doivent jamais servir à traiter un vrai patient.</section>
    <div style="height:12px"></div>
    <section class="card">
      <h3>Choisis un profil de départ</h3>
      <div class="actions">
        <button class="btn primary newp" data-preset="random">🎲 Patient aléatoire<small>Âge, risque, atteinte osseuse et biologique générés dynamiquement.</small></button>
        <button class="btn newp" data-preset="standard">🟢 Risque standard<small>Patient transplantable avec cytogénétique standard.</small></button>
        <button class="btn newp" data-preset="high">🔴 Haut risque<small>Anomalie cytogénétique défavorable et risque de résistance accru.</small></button>
        <button class="btn newp" data-preset="renal">🟠 Atteinte rénale<small>Présentation initiale avec insuffisance rénale plus marquée.</small></button>
      </div>
    </section>
    <section class="card"><h3>Objectif du jeu</h3><p class="sub">Compléter le diagnostic, conduire l’induction, recueillir les cellules souches, évaluer la MRD, choisir une consolidation puis une maintenance. Ton score dépend de la profondeur de réponse, de la sécurité, des examens réalisés et des complications évitées.</p></section>`;
  $$('.newp').forEach(b=>b.addEventListener('click',()=>addPatient(b.dataset.preset)));
}

function phaseLabel(p){
  return ({diagnosis:'Diagnostic',induction:'Induction',mrd1:'MRD post-induction',consolidation:'Consolidation',mrd2:'MRD pré-maintenance',maintenance:'Maintenance'})[p.phase]||'Suivi';
}
function timelineHTML(p){
  const phases=[['diagnosis','Diagnostic'],['induction','Induction'],['mrd1','MRD 10⁻⁵'],['consolidation','Consolidation'],['mrd2','MRD 10⁻⁶'],['maintenance','Maintenance']];
  const order=phases.map(x=>x[0]), idx=order.indexOf(p.phase);
  return `<div class="timeline">${phases.map((x,i)=>`<div class="phase ${i<idx?'done':''} ${i===idx?'current':''}"><b>${x[1]}</b><small>${i<idx?'✓ terminé':i===idx?'en cours':'à venir'}</small></div>`).join('')}</div>`;
}

function renderPatient(p){
  $('#main').innerHTML=`
    ${patientSelect(p)}
    <div style="height:10px"></div>
    <section class="card">
      <div class="hero">
        <div class="avatar">${p.sex==='F'?'👩‍⚕️':'👨‍⚕️'}</div>
        <div class="hero-main"><div class="pillrow"><span class="badge blue">${phaseLabel(p)}</span><span class="badge ${p.alive?'green':'red'}">${esc(p.status)}</span></div>
          <h2>${esc(p.name)}</h2>
          <p>${p.age} ans • ${p.sex==='F'?'Femme':'Homme'} • ${esc(p.cytoLabel)}</p>
        </div>
      </div>
      <div class="grid3" style="margin-top:13px">
        <div class="metric"><div class="k">Réponse</div><div class="v" style="font-size:15px">${esc(p.response)}</div></div>
        <div class="metric"><div class="k">Cycle</div><div class="v">${p.cycle}</div><div class="u">mois ${p.month}</div></div>
        <div class="metric"><div class="k">Score</div><div class="v">${Math.round(p.score)}</div><div class="u">points</div></div>
        <div class="metric"><div class="k">Qualité de vie</div><div class="v">${Math.round(p.qol)}</div><div class="u">/100</div></div>
        <div class="metric"><div class="k">Toxicité</div><div class="v">${Math.round(p.toxicity*100)}%</div></div>
        <div class="metric"><div class="k">Lésions</div><div class="v">${p.lesions}</div><div class="u">foyers simulés</div></div>
      </div>
    </section>
    <section class="card"><h3>Parcours thérapeutique</h3>${timelineHTML(p)}</section>
    <section class="card">
      <div class="section-title"><h2>Bilan rapide</h2><span class="sub">Dernières valeurs</span></div>
      <div class="grid3">
        ${miniMetric('Hb',p.labs.hb.toFixed(1),'g/dL',flagFor('hb',p.labs.hb))}
        ${miniMetric('DFG',Math.round(p.labs.egfr),'mL/min',flagFor('egfr',p.labs.egfr))}
        ${miniMetric('Ca',p.labs.calcium.toFixed(2),'mmol/L',flagFor('calcium',p.labs.calcium))}
        ${miniMetric('Pic M',p.labs.mprotein.toFixed(1),'g/L',p.labs.mprotein<3?'green':'red')}
        ${miniMetric('Moelle',p.marrow.toFixed(1),'%',p.marrow<5?'green':'red')}
        ${miniMetric('MRD',mrdText(p),'',p.mrd6===false||p.mrd5===false?'green':(p.mrd5===true||p.mrd6===true?'red':'blue'))}
      </div>
    </section>
    <section class="card">
      <div class="section-title"><h2>Cohorte virtuelle</h2><span class="badge blue">${state.patients.length}/6 patients</span></div>
      <div class="actions">
        <button class="btn newPatientMenu" ${state.patients.length>=6?'disabled':''}>➕ Nouveau patient<small>Ajoute un nouveau dossier virtuel à la cohorte.</small></button>
        <button class="btn" id="cohortOverview">👥 Vue cohorte<small>Compare rapidement tous les patients actifs.</small></button>
      </div>
    </section>
    <section class="card">
      <div class="section-title"><h2>Actions rapides</h2></div>
      <div class="actions">
        <button class="btn exam" data-exam="blood">🧪 Refaire le bilan sanguin<small>Actualise NFS, rein, calcium et marqueurs.</small></button>
        <button class="btn exam" data-exam="imaging">🩻 Refaire l’imagerie<small>Actualise les lésions osseuses virtuelles.</small></button>
        <button class="btn exam" data-exam="marrow">🔬 Myélogramme / MRD<small>Évalue moelle et MRD selon la phase.</small></button>
        <button class="btn danger" id="deletePatient">🗑️ Supprimer ce patient<small>Efface uniquement ce dossier virtuel.</small></button>
      </div>
    </section>`;
  bindCommon(p);
  $$('.exam').forEach(b=>b.addEventListener('click',()=>runExam(p,b.dataset.exam)));
  $('#deletePatient').addEventListener('click',()=>confirmModal('Supprimer le patient ?',`Le dossier de ${esc(p.name)} sera définitivement supprimé de cette simulation.`,()=>removePatient(p.id)));
  const np=$('.newPatientMenu'); if(np)np.addEventListener('click',showNewPatientMenu);
  const co=$('#cohortOverview'); if(co)co.addEventListener('click',showCohort);
}
function miniMetric(k,v,u,c){return `<div class="metric"><div class="k">${k}</div><div class="v ${c||''}">${v}</div><div class="u">${u}</div></div>`}
function mrdText(p){if(p.mrd6!==null)return p.mrd6?'10⁻⁶ +':'10⁻⁶ −';if(p.mrd5!==null)return p.mrd5?'10⁻⁵ +':'10⁻⁵ −';return 'ND'}
function flagFor(key,v){
  const x=LABS[key]; if(!x)return 'ok';
  if(key==='mprotein')return v<=0?'ok':'high';
  return v<x.lo?'low':v>x.hi?'high':'ok';
}
function bindCommon(p){
  const s=$('#patientSelect'); if(s)s.addEventListener('change',e=>{state.activeId=e.target.value;autoSave();render();});
}

function renderLabs(p){
  const vals=p.labs;
  $('#main').innerHTML=`
    ${patientSelect(p)}<div style="height:10px"></div>
    <section class="card">
      <div class="section-title"><h2>Biologie</h2><span class="badge blue">Mois ${p.month}</span></div>
      ${Object.entries(LABS).map(([k,m])=>labRow(k,m,vals[k])).join('')}
      <div style="margin-top:12px"><button class="btn primary" id="refreshLabs" style="width:100%">🧪 Prescrire / actualiser le bilan</button></div>
    </section>
    <section class="card">
      <h3>Évolution du pic monoclonal</h3>
      <canvas id="labChart" class="chart" width="720" height="280"></canvas>
    </section>
    <section class="card">
      <h3>Interprétation simulée</h3>
      <div class="report">${esc(labInterpretation(p))}</div>
    </section>`;
  bindCommon(p);$('#refreshLabs').addEventListener('click',()=>runExam(p,'blood'));drawChart(p);
}
function labRow(k,m,v){
  let flag=flagFor(k,v),symbol=flag==='ok'?'●':flag==='high'?'↑':'↓';
  const digits=['plt','creat','egfr','ldh','crp'].includes(k)?0:(k==='calcium'?2:1);
  const ref=k==='mprotein'?'attendu : indétectable':`${m.lo}–${m.hi} ${m.unit}`;
  return `<div class="lab-row"><div><div class="lab-name">${m.label}</div><div class="lab-ref">${ref}</div></div><div class="lab-value">${Number(v).toFixed(digits)} <span class="lab-ref">${m.unit}</span></div><div class="flag ${flag}">${symbol}</div></div>`;
}
function labInterpretation(p){
  const l=p.labs,out=[];
  if(l.hb<10)out.push('• Anémie significative.');
  if(l.neut<1)out.push('• Neutropénie : risque infectieux augmenté dans le modèle.');
  if(l.plt<75)out.push('• Thrombopénie importante.');
  if(l.egfr<45)out.push('• Fonction rénale altérée.');
  if(l.calcium>2.75)out.push('• Hypercalcémie.');
  if(l.mprotein>20)out.push('• Composante monoclonale encore importante.');
  else if(l.mprotein<3)out.push('• Composante monoclonale très basse.');
  if(p.mrd5===false)out.push('• MRD 10⁻⁵ négative après induction.');
  if(p.mrd6===false)out.push('• MRD 10⁻⁶ négative avant maintenance.');
  if(!out.length)out.push('• Pas de signal majeur sur les paramètres affichés.');
  return out.join('\n');
}
function drawChart(p){
  const c=$('#labChart');if(!c)return;const ctx=c.getContext('2d'),W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#091522';ctx.fillRect(0,0,W,H);
  const hist=p.labsHistory.slice(-24); if(hist.length<2){ctx.fillStyle='#91a5bd';ctx.font='22px system-ui';ctx.fillText('Pas encore assez de mesures',28,55);return}
  const vals=hist.map(x=>x.vals.mprotein),max=Math.max(5,...vals)*1.1;
  ctx.strokeStyle='#24384d';ctx.lineWidth=1;for(let i=1;i<5;i++){let y=H-30-i*(H-55)/5;ctx.beginPath();ctx.moveTo(45,y);ctx.lineTo(W-18,y);ctx.stroke()}
  ctx.strokeStyle='#5cc8ff';ctx.lineWidth=5;ctx.beginPath();
  hist.forEach((x,i)=>{const px=45+i*(W-70)/(hist.length-1),py=H-30-(x.vals.mprotein/max)*(H-55);i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.stroke();
  hist.forEach((x,i)=>{const px=45+i*(W-70)/(hist.length-1),py=H-30-(x.vals.mprotein/max)*(H-55);ctx.fillStyle='#dff5ff';ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill()});
  ctx.fillStyle='#91a5bd';ctx.font='17px system-ui';ctx.fillText(max.toFixed(0)+' g/L',8,25);ctx.fillText('0',23,H-22);
}

function renderImaging(p){
  $('#main').innerHTML=`
    ${patientSelect(p)}<div style="height:10px"></div>
    <section class="card">
      <div class="section-title"><h2>Imagerie osseuse</h2><span class="badge ${p.lesions?'red':'green'}">${p.lesions} lésion(s)</span></div>
      <div class="skeleton">${skeletonSVG(p)}</div>
      <button class="btn primary" id="refreshImaging" style="width:100%;margin-top:10px">🩻 Nouvelle imagerie corps entier</button>
    </section>
    <section class="card"><h3>Compte rendu radiologique simulé</h3><div class="report">${esc(imagingReport(p))}</div></section>
    <section class="card"><h3>Sites décrits</h3><div class="pillrow">${p.lesionMap.length?p.lesionMap.map(x=>`<span class="badge red">${esc(x.site)} • ${x.size} mm</span>`).join(''):'<span class="badge green">Aucun foyer focal visible</span>'}</div></section>`;
  bindCommon(p);$('#refreshImaging').addEventListener('click',()=>runExam(p,'imaging'));
}
function skeletonSVG(p){
  return `<svg viewBox="0 0 100 270" aria-label="Schéma osseux">
  <g fill="none" stroke="#b8c8d8" stroke-width="2.3" opacity=".78">
    <circle cx="50" cy="25" r="13"/><path d="M50 38 L50 118 M50 55 L24 96 M50 55 L76 96 M50 118 L33 180 M50 118 L67 180 M33 180 L29 245 M67 180 L71 245"/>
    <path d="M35 55 Q50 72 65 55 M32 72 Q50 90 68 72 M38 117 Q50 129 62 117"/>
    <path d="M42 120 Q50 137 58 120 M46 40 L54 40"/>
  </g>
  ${p.lesionMap.map(l=>`<circle class="lesion" cx="${l.x}" cy="${l.y}" r="${Math.max(2.4,Math.min(5,l.size/4))}"><title>${esc(l.site)} ${l.size} mm</title></circle>`).join('')}
  </svg>`;
}
function imagingReport(p){
  if(!p.lesionMap.length)return 'IMAGERIE CORPS ENTIER — SIMULATION\nPas de lésion focale osseuse visible dans le modèle actuel.\nPas de fracture pathologique simulée.';
  const sites=p.lesionMap.map(x=>`${x.site} (${x.size} mm)`).join(', ');
  const severity=p.lesionMap.length>=6?'atteinte multifocale importante':p.lesionMap.length>=3?'atteinte multifocale modérée':'atteinte focale limitée';
  return `IMAGERIE CORPS ENTIER — SIMULATION\n${severity.toUpperCase()}\nFoyers représentés : ${sites}.\nCharge osseuse modélisée : ${Math.round(p.bone*100)}%.\nCe dessin est un schéma de jeu, pas une image médicale réelle.`;
}

function renderTreatment(p){
  const disabled=!p.alive||!!p.end;
  $('#main').innerHTML=`
    ${patientSelect(p)}<div style="height:10px"></div>
    <section class="card"><div class="section-title"><h2>Traitement</h2><span class="badge blue">${phaseLabel(p)}</span></div>${treatmentPanel(p,disabled)}</section>
    <section class="card">
      <h3>Soins de support</h3>
      <div class="actions">
        ${supportToggle(p,'antiviral','🛡️ Prophylaxie antivirale','Réduit certains événements infectieux du modèle.')}
        ${supportToggle(p,'thrombo','🩸 Prévention thrombotique','Réduit le risque thrombotique simulé.')}
        ${supportToggle(p,'bone','🦴 Support osseux','Diminue progressivement l’atteinte osseuse simulée.')}
        <button class="btn support" data-s="gcsf">🧬 G-CSF de support<small>Soutien ponctuel des neutrophiles.</small></button>
        <button class="btn support" data-s="transfusion">🩸 Transfusion<small>Soutien ponctuel de l’hémoglobine.</small></button>
        <button class="btn support" data-s="hydration">💧 Support rénal<small>Hydratation/support rénal simplifié.</small></button>
      </div>
    </section>
    <section class="card">
      <div class="switchrow"><div><h3 style="margin-bottom:4px">Mode recherche</h3><div class="sub">Affiche les variables cachées du moteur, uniquement pour comprendre la simulation.</div></div><input id="researchSwitch" class="switch" type="checkbox" ${p.researchMode?'checked':''}></div>
      ${p.researchMode?`<div class="grid3" style="margin-top:12px">
        ${miniMetric('Charge modèle',(p.burden*100).toFixed(p.burden<.01?3:1),'%','')}
        ${miniMetric('Résistance',(p.resistance*100).toFixed(1),'%','')}
        ${miniMetric('Atteinte rénale',(p.renal*100).toFixed(0),'%','')}
      </div>
      <div class="warning" style="margin-top:12px">🧪 Bac à sable : ces boutons autorisent des décisions hors séquence MIDAS uniquement sur le patient virtuel.</div>
      <div class="actions" style="margin-top:10px">
        <button class="btn experiment" data-e="isakrd">🧬 Tester Isa-KRd<small>Action virtuelle hors phase si nécessaire.</small></button>
        <button class="btn experiment" data-e="asct">🏥 Tester ASCT<small>Nécessite un recueil de cellules souches.</small></button>
        <button class="btn experiment" data-e="len">💊 Tester lénalidomide<small>Effet de maintenance simplifié.</small></button>
        <button class="btn experiment" data-e="observe">⏸️ Arrêter / observer<small>Observe la dynamique sans traitement actif.</small></button>
      </div>`:''}
    </section>`;
  bindCommon(p);
  $$('.treat').forEach(b=>b.addEventListener('click',()=>confirmTreatment(p,b.dataset.t)));
  $$('.support').forEach(b=>b.addEventListener('click',()=>supportive(p,b.dataset.s)));
  $$('.supToggle').forEach(b=>b.addEventListener('click',()=>supportive(p,b.dataset.s)));
  $$('.experiment').forEach(b=>b.addEventListener('click',()=>confirmModal('Expérience virtuelle',`Appliquer ${b.dataset.e} hors parcours standard ?\n\nCette action ne concerne que le modèle de jeu.`,()=>{treatmentEffect(p,b.dataset.e);render();})));
  $('#researchSwitch').addEventListener('change',e=>{p.researchMode=e.target.checked;autoSave();render()});
}
function supportToggle(p,key,title,desc){
  return `<button class="btn supToggle ${p.supportive[key]?'success':''}" data-s="${key}">${title}<small>${desc} ${p.supportive[key]?'ACTIF':'INACTIF'}</small></button>`
}
function treatmentPanel(p,disabled){
  if(p.end)return `<div class="empty"><div class="big">${p.end==='death'?'🕯️':p.end==='progression'?'📉':'🏆'}</div><h3>${esc(p.status)}</h3><p class="sub">Score final : ${Math.round(p.score)} points.</p></div>`;
  if(p.phase==='diagnosis')return `
    <p class="sub">Complète le bilan avant de débuter l’induction.</p>
    <div class="actions">
      <button class="btn exam" data-exam="blood">🧪 Biologie <small>${p.exams.blood?'✓ réalisée':'à réaliser'}</small></button>
      <button class="btn exam" data-exam="imaging">🩻 Imagerie <small>${p.exams.imaging?'✓ réalisée':'à réaliser'}</small></button>
      <button class="btn exam" data-exam="marrow">🔬 Moelle <small>${p.exams.marrow?'✓ réalisée':'à réaliser'}</small></button>
    </div>`;
  if(p.phase==='induction'){
    const count=p.treatmentLog.filter(x=>x.key==='isakrd').length;
    return `<div class="treat-card selected"><h3>Induction Isa-KRd</h3><p>Schéma de jeu inspiré de MIDAS : 6 cycles d’induction avant évaluation MRD.</p><div class="pillrow"><span class="badge blue">${count}/6 cycles</span><span class="badge ${p.collected?'green':'yellow'}">${p.collected?'cellules recueillies':'recueil à prévoir'}</span></div></div>
      <div class="actions"><button class="btn primary treat" data-t="isakrd" ${disabled||count>=6?'disabled':''}>▶️ Administrer un cycle<small>Fait avancer la simulation d’un cycle.</small></button>
      <button class="btn ${p.collected?'success':''} exam" data-exam="collect" ${p.collected?'disabled':''}>🧬 Mobiliser / recueillir<small>Logique MIDAS : recueil au cours de l’induction.</small></button></div>`;
  }
  if(p.phase==='mrd1'){
    const neg=p.mrd5===false;
    return `<div class="report">MRD NGS 10⁻⁵ : ${neg?'NÉGATIVE':'POSITIVE'}\n\nChoisis une stratégie de consolidation inspirée de MIDAS.</div><div style="height:10px"></div>
      ${neg?
      `<button class="btn treat-path" data-path="A" style="width:100%;margin-bottom:8px">Branche A — Isa-KRd × 6 supplémentaires</button>
       <button class="btn treat-path" data-path="B" style="width:100%">Branche B — ASCT + Isa-KRd × 2</button>`:
      `<button class="btn treat-path" data-path="C" style="width:100%;margin-bottom:8px">Branche C — ASCT + Isa-KRd × 2</button>
       <button class="btn treat-path" data-path="D" style="width:100%">Branche D — Tandem ASCT</button>`}`;
  }
  if(p.phase==='consolidation'){
    const path=p.trialPath;
    let html=`<div class="treat-card selected"><h3>Branche ${path}</h3><p>${pathDesc(path)}</p></div><div class="actions">`;
    if(path==='A')html+=`<button class="btn primary treat" data-t="isakrd">▶️ Isa-KRd<small>Cycle de consolidation.</small></button>`;
    if(path==='B'||path==='C')html+=`<button class="btn treat" data-t="asct" ${p.asctCount>=1?'disabled':''}>🏥 ASCT<small>Autogreffe virtuelle.</small></button><button class="btn primary treat" data-t="isakrd">▶️ Isa-KRd<small>Cycle post-ASCT.</small></button>`;
    if(path==='D')html+=`<button class="btn danger treat" data-t="tandem" ${p.asctCount>=2?'disabled':''}>🏥 Tandem ASCT<small>Stratégie intensive virtuelle.</small></button>`;
    return html+'</div>';
  }
  if(p.phase==='mrd2'){
    return `<div class="report">MRD NGS 10⁻⁶ : ${p.mrd6===false?'NÉGATIVE':'POSITIVE'}\nRéponse : ${esc(p.response)}</div>
      <button class="btn primary" id="startMaintenance" style="width:100%;margin-top:10px">Passer en maintenance</button>`;
  }
  if(p.phase==='maintenance'){
    const med=(p.trialPath==='A'||p.trialPath==='B')?'len':'isaiber';
    const title=med==='len'?'Lénalidomide':'Isatuximab + iberdomide';
    return `<div class="treat-card selected"><h3>Maintenance — ${title}</h3><p>Suivi simulé jusqu’au mois 42 environ.</p><div class="pillrow"><span class="badge blue">mois ${p.month}/42</span><span class="badge ${p.mrd6===false?'green':'yellow'}">${mrdText(p)}</span></div></div>
      <div class="actions"><button class="btn primary treat" data-t="${med}">▶️ Mois suivant<small>Poursuit la maintenance.</small></button><button class="btn treat" data-t="observe">⏸️ Observer sans traiter<small>Expérience de simulation : risque de repousse clonale.</small></button></div>`;
  }
  return '';
}
function pathDesc(path){
  return {A:'6 cycles supplémentaires d’Isa-KRd puis maintenance lénalidomide.',B:'ASCT puis 2 cycles d’Isa-KRd, puis maintenance lénalidomide.',C:'ASCT puis 2 cycles d’Isa-KRd, puis maintenance Isa + iberdomide.',D:'Tandem ASCT puis maintenance Isa + iberdomide.'}[path]||'';
}
function confirmTreatment(p,key){
  const names={isakrd:'Isa-KRd',asct:'ASCT',tandem:'Tandem ASCT',len:'maintenance lénalidomide',isaiber:'maintenance Isa + iberdomide',observe:'surveillance sans traitement'};
  confirmModal('Confirmer la décision',`Administrer : ${names[key]||key} ?\n\nLe moteur générera une réponse et des toxicités virtuelles.`,()=>{treatmentEffect(p,key);render();});
  if(p.phase==='mrd1')bindPaths(p);
}
function bindPaths(p){$$('.treat-path').forEach(b=>b.addEventListener('click',()=>choosePath(p,b.dataset.path)))}

function renderHistory(p){
  $('#main').innerHTML=`
    ${patientSelect(p)}<div style="height:10px"></div>
    <section class="card">
      <div class="section-title"><h2>Historique clinique</h2><span class="badge blue">${p.history.length} événements</span></div>
      ${p.history.length?p.history.map(h=>`<div class="hist"><b>M${h.month} • C${h.cycle} — ${esc(h.title)}</b><p>${esc(h.text)}</p></div>`).join(''):'<div class="empty">Aucun événement.</div>'}
    </section>
    <section class="card">
      <h3>Résumé de performance</h3>
      <div class="grid2">
        <div class="metric"><div class="k">Score</div><div class="score ${p.score>1200?'good':p.score>700?'mid':'bad'}">${Math.round(p.score)}</div></div>
        <div class="metric"><div class="k">Réponse actuelle</div><div class="v" style="font-size:14px">${esc(p.response)}</div></div>
        <div class="metric"><div class="k">Infections</div><div class="v">${p.infections}</div></div>
        <div class="metric"><div class="k">ASCT</div><div class="v">${p.asctCount}</div></div>
      </div>
    </section>
    <section class="card"><button class="btn" id="exportSummary" style="width:100%">📄 Afficher le résumé du dossier</button></section>`;
  bindCommon(p);
  $('#exportSummary').addEventListener('click',()=>showSummary(p));
}

function showNewPatientMenu(){
  showModal(`<h2>Nouveau patient virtuel</h2><p class="sub">Choisis un profil. Tous les paramètres sont générés artificiellement.</p>
    <div class="actions" style="margin-top:12px">
      <button class="btn createPreset" data-p="random">🎲 Aléatoire<small>Profil complet généré dynamiquement.</small></button>
      <button class="btn createPreset" data-p="standard">🟢 Risque standard<small>Cytogénétique standard.</small></button>
      <button class="btn createPreset" data-p="high">🔴 Haut risque<small>Biologie plus résistante.</small></button>
      <button class="btn createPreset" data-p="renal">🟠 Atteinte rénale<small>Fonction rénale plus altérée au départ.</small></button>
    </div><div class="modal-actions"><button class="btn closeModal">Annuler</button></div>`);
  $$('.createPreset',$('#modal')).forEach(b=>b.addEventListener('click',()=>{hideModal();addPatient(b.dataset.p)}));
}
function showCohort(){
  const rows=state.patients.map(x=>`<button class="btn cohortPick" data-id="${x.id}" style="width:100%;margin-bottom:8px">
    ${esc(x.name)} — ${x.age} ans
    <small>${esc(x.cytoLabel)} • ${phaseLabel(x)} • ${esc(x.response)} • score ${Math.round(x.score)}</small>
  </button>`).join('');
  showModal(`<h2>Cohorte virtuelle</h2><p class="sub">${state.patients.length} patient(s). Touche un dossier pour l’ouvrir.</p><div style="margin-top:12px">${rows}</div><div class="modal-actions"><button class="btn closeModal">Fermer</button></div>`);
  $$('.cohortPick',$('#modal')).forEach(b=>b.addEventListener('click',()=>{state.activeId=b.dataset.id;hideModal();autoSave();render()}));
}

function showSummary(p){
  const s=`DOSSIER VIRTUEL — MYELOMA LAB
${p.name}, ${p.age} ans
Cytogénétique : ${p.cytoLabel}
Phase : ${phaseLabel(p)}
Réponse : ${p.response}
MRD : ${mrdText(p)}
Hb : ${p.labs.hb.toFixed(1)} g/dL
DFG : ${p.labs.egfr.toFixed(0)} mL/min
Calcium : ${p.labs.calcium.toFixed(2)} mmol/L
Pic monoclonal : ${p.labs.mprotein.toFixed(1)} g/L
Plasmocytose médullaire : ${p.marrow.toFixed(1)} %
Lésions osseuses : ${p.lesions}
Score : ${Math.round(p.score)}

SIMULATION PÉDAGOGIQUE — PAS UN DOSSIER MÉDICAL RÉEL.`;
  showModal(`<h2>Résumé du patient</h2><div class="report">${esc(s)}</div><div class="modal-actions"><button class="btn primary closeModal">Fermer</button></div>`);
}

function showModal(html){const m=$('#modal');m.innerHTML=`<div class="modal-box">${html}</div>`;m.classList.remove('hidden');$$('.closeModal',m).forEach(b=>b.addEventListener('click',hideModal));}
function hideModal(){$('#modal').classList.add('hidden');$('#modal').innerHTML=''}
function confirmModal(title,text,ok){showModal(`<h2>${esc(title)}</h2><p class="sub" style="white-space:pre-line">${esc(text)}</p><div class="modal-actions"><button class="btn closeModal">Annuler</button><button class="btn primary" id="confirmOk">Confirmer</button></div>`);$('#confirmOk').addEventListener('click',()=>{hideModal();ok()});}
let toastTimer=null;function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.add('hidden'),2400)}

$$('.nav-btn').forEach(b=>b.addEventListener('click',()=>{state.tab=b.dataset.tab;autoSave();render()}));
$('#helpBtn').addEventListener('click',()=>showModal(`
  <h2>À propos de Myeloma Lab</h2>
  <p class="sub">Tu joues le rôle d’un médecin-chercheur sur des patients entièrement virtuels. Le parcours est inspiré de la stratégie MRD-adaptée de l’étude IFM 2020-02 MIDAS : induction Isa-KRd, évaluation MRD, consolidation adaptée, ASCT éventuelle et maintenance.</p>
  <div class="warning">Les valeurs, risques, probabilités, interprétations et réponses sont un moteur de jeu simplifié. Ce logiciel n’est ni un dispositif médical, ni un protocole thérapeutique, ni un outil d’aide à la décision pour un vrai patient.</div>
  <div class="modal-actions"><button class="btn primary closeModal">Compris</button></div>`));

const oldRender=render;
render=function(){
  oldRender();
  const p=active();
  if(!p)return;
  if(state.tab==='treatment'){
    $$('.exam').forEach(b=>{if(!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',()=>runExam(p,b.dataset.exam))}});
    $$('.treat-path').forEach(b=>{if(!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',()=>choosePath(p,b.dataset.path))}});
    const sm=$('#startMaintenance');if(sm)sm.addEventListener('click',()=>{startMaintenance(p);render()});
  }
};

if(!state.patients.length){
  const p1=newPatient('standard');p1.name='Claire Martin';
  state.patients.push(p1);state.activeId=p1.id;autoSave();
}
render();
})();
