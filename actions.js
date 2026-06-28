"use strict";
/* ============================== MODAL + FORM ENGINE ============================== */
function closeModal(){$('#modal-root').innerHTML='';}
function openModal(title,body,foot,wide){
  $('#modal-root').innerHTML=`<div class="modal-scrim" onclick="if(event.target===this)closeModal()"><div class="modal ${wide?'wide':''}" role="dialog" aria-modal="true">
    <div class="modal-head"><h3>${esc(title)}</h3><button class="x" onclick="closeModal()" aria-label="Close">${ico('x')}</button></div>
    <div class="modal-body">${body}</div>${foot?`<div class="modal-foot">${foot}</div>`:''}</div></div>`;
}
let FORM_CB=null;
function formModal(title,fields,onSubmit,opts){
  opts=opts||{};
  const body=fields.map(fieldHTML).join('');
  const foot=`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn ${opts.danger?'btn-danger':'btn-primary'}" onclick="submitForm()">${esc(opts.submitLabel||'Save')}</button>`;
  openModal(title,`<form id="theform" onsubmit="submitForm();return false">${body}${opts.note?`<p class="hint">${esc(opts.note)}</p>`:''}</form>`,foot,opts.wide);
  FORM_CB={fields,onSubmit};
  setTimeout(()=>{const el=document.querySelector('#theform input,#theform select,#theform textarea');if(el)el.focus();},50);
}
function fieldHTML(f){
  const id='f_'+f.name;
  if(f.type==='hidden')return `<input type="hidden" id="${id}" value="${esc(f.value||'')}">`;
  if(f.type==='static')return `<div class="field"><label>${esc(f.label)}</label><div style="font-weight:600">${f.value}</div></div>`;
  let input='';
  if(f.type==='select')input=`<select class="input" id="${id}">${f.options.map(o=>`<option value="${esc(o.v)}" ${String(o.v)===String(f.value)?'selected':''}>${esc(o.l)}</option>`).join('')}</select>`;
  else if(f.type==='textarea')input=`<textarea class="input" id="${id}" placeholder="${esc(f.placeholder||'')}">${esc(f.value||'')}</textarea>`;
  else if(f.type==='checkbox')return `<div class="field"><label class="check"><input type="checkbox" id="${id}" ${f.value?'checked':''}><span>${esc(f.label)}</span></label>${f.hint?`<div class="hint">${esc(f.hint)}</div>`:''}</div>`;
  else input=`<input class="input" type="${f.type||'text'}" id="${id}" value="${esc(f.value==null?'':f.value)}" placeholder="${esc(f.placeholder||'')}" ${f.step?`step="${f.step}"`:''}>`;
  return `<div class="field">${f.label?`<label>${esc(f.label)}${f.required?' <span class="req">*</span>':''}</label>`:''}${input}${f.hint?`<div class="hint">${esc(f.hint)}</div>`:''}</div>`;
}
function submitForm(){
  if(!FORM_CB)return;const vals={};let ok=true;
  FORM_CB.fields.forEach(f=>{if(f.type==='static')return;const el=document.getElementById('f_'+f.name);if(!el)return;
    let v=f.type==='checkbox'?el.checked:el.value;
    if(f.required&&(v===''||v==null)){el.style.borderColor='var(--red)';ok=false;}
    if(f.type==='number')v=v===''?'':Number(v);vals[f.name]=v;});
  if(!ok){toast('Please fill the required fields');return;}
  const cb=FORM_CB.onSubmit;closeModal();FORM_CB=null;cb(vals);
}
function toast(msg,ok){
  const el=document.createElement('div');el.className='toast';
  el.innerHTML=`${ico(ok?'check':'bolt')}<span>${esc(msg)}</span>`;
  $('#toast-root').appendChild(el);
  setTimeout(()=>{el.style.opacity='0';el.style.transform='translateX(16px)';el.style.transition='all .3s';setTimeout(()=>el.remove(),300);},3000);
}
function openConfirm(title,msg,onYes,danger){
  openModal(title,`<p style="font-size:14px;color:var(--fg-muted)">${esc(msg)}</p>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn ${danger?'btn-danger':'btn-primary'}" id="cfm">Confirm</button>`);
  setTimeout(()=>{const b=document.getElementById('cfm');if(b)b.onclick=()=>{closeModal();onYes();};},40);
}

/* ============================== AWKWARD-ASK COMPOSER ============================== */
let COMPOSER={ctx:{},tone:'firm',sit:'deposit'};
const ASK_SITUATIONS=[
  {v:'deposit',l:'Ask for a deposit'},{v:'late',l:'Chase a late payment'},{v:'overage',l:'Bill a revision overage'},
  {v:'changeorder',l:'Bill a change order'},{v:'killfee',l:'Send a kill fee'},{v:'raise',l:'Propose a rate increase'},
];
function composeText(sit,tone,c){
  const n=c.name||'there',proj=c.project||'your project',amt=c.amount?fmt(c.amount):'the agreed amount',days=c.days||0,biz=c.biz||state.settings.businessName,terms=state.settings.paymentTerms;
  const T={
    deposit:{
      warm:`Hi ${n}, I'm really looking forward to ${proj}. To lock your date I just need the ${amt} deposit. The moment it lands, the date is yours. Want me to send the payment link?`,
      firm:`Hi ${n}, to confirm ${proj} I need the ${amt} deposit. The date stays open to other inquiries until the deposit clears, so the sooner the better.`,
      final:`Hi ${n}, the hold on your date for ${proj} releases soon unless the ${amt} deposit is paid. After that I'll have to open the slot to other bookings.`},
    late:{
      warm:`Hi ${n}, friendly nudge that the invoice for ${proj} (${amt}) is a little past due. Let me know if you need the payment link again.`,
      firm:`Hi ${n}, the invoice for ${proj} is now ${days} days overdue (${amt}). Please arrange payment this week so I can keep your files live.`,
      final:`Hi ${n}, final notice: ${amt} for ${proj} is ${days} days overdue. The delivered files stay locked, and the account moves to collections if it isn't settled.`},
    overage:{
      warm:`Hi ${n}, quick heads-up before I start the next round: we've used the revision rounds included in ${proj}. Further changes run ${amt} each. Happy to keep going once you confirm.`,
      firm:`Hi ${n}, ${proj} has reached its included revision rounds. The next round is ${amt}. I'll begin as soon as it's approved.`,
      final:`Hi ${n}, I can't start the requested changes until the ${amt} overage on ${proj} is settled, since it's beyond the agreed scope.`},
    changeorder:{
      warm:`Hi ${n}, happy to add that to ${proj}. It's outside the original scope, so it's a ${amt} change order. Approve it and I'll get started.`,
      firm:`Hi ${n}, the requested addition to ${proj} is a ${amt} change order beyond the agreed scope. I'll proceed once it's approved.`,
      final:`Hi ${n}, I'll need the ${amt} change order on ${proj} approved before I start the new work.`},
    killfee:{
      warm:`Hi ${n}, I'm sorry ${proj} can't go ahead. Per our agreement a ${amt} cancellation fee applies for this timing. The invoice is attached, and I'd love to find a new date.`,
      firm:`Hi ${n}, as ${proj} was cancelled within the agreed window, a ${amt} kill fee applies. The invoice is attached, due in ${terms} days.`,
      final:`Hi ${n}, the ${amt} cancellation fee for ${proj} is now due per the signed terms. Please settle it at your earliest convenience.`},
    raise:{
      warm:`Hi ${n}, it's been over a year on the ${proj} retainer and I'd love to keep it going. Starting next cycle the rate moves to ${amt}. Everything else stays the same.`,
      firm:`Hi ${n}, effective the next cycle the ${proj} retainer rate is ${amt}, reflecting the scope we've grown into. Glad to talk it through.`,
      final:`Hi ${n}, confirming the ${proj} retainer renews at ${amt} from next month.`},
  };
  const link=(state.settings.payLink&&sit!=='raise')?`\n\nPay here (GCash / Maya / card): ${state.settings.payLink}`:'';
  return ((T[sit]||T.deposit)[tone]||'')+link+`\n\nThank you,\n${biz}`;
}
function composerRegen(){
  const sit=document.getElementById('c-sit').value;COMPOSER.sit=sit;
  const out=document.getElementById('c-out');if(out)out.value=composeText(sit,COMPOSER.tone,COMPOSER.ctx);
}

/* ============================== APP ============================== */
const App={
  toast:m=>toast(m,true),
  toggleTheme(){const cur=document.documentElement.getAttribute('data-theme')==='dark'?'dark':'light';const next=cur==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',next);try{localStorage.setItem('is_theme',next);}catch(e){}render();},

  composeAsk(clientId,invId,forceTone){
    const inv=invId?invoiceById(invId):null,c=clientId?clientById(clientId):null,p=inv?projectById(inv.projectId):null;
    COMPOSER={tone:forceTone||'firm',sit:inv?'late':'deposit',ctx:{name:c?c.name:'',company:c?c.company:'',project:p?p.title:'',amount:inv?invoiceTotal(inv).total:0,days:inv?daysOverdue(inv):0,biz:state.settings.businessName,phone:c?c.phone:'',email:c?c.email:''}};
    const seg=t=>`<button class="${COMPOSER.tone===t?'on':''}" data-tone="${t}" onclick="App._tone('${t}')">${t[0].toUpperCase()+t.slice(1)}</button>`;
    const body=`
      <div class="field"><label>Situation</label><select class="input" id="c-sit" onchange="composerRegen()">${ASK_SITUATIONS.map(s=>`<option value="${s.v}" ${s.v===COMPOSER.sit?'selected':''}>${s.l}</option>`).join('')}</select></div>
      <div class="field"><label>Tone</label><div class="seg" id="c-seg">${seg('warm')}${seg('firm')}${seg('final')}</div></div>
      ${aiReady()?`<div class="field"><label>Their recent messages (optional — for AI tone match)</label><textarea class="input" id="c-thread" style="min-height:56px" placeholder="Paste the client's last few messages so the AI matches their Taglish / formality."></textarea></div>`:''}
      <div class="field"><label>Message</label><textarea class="input" id="c-out" style="min-height:170px;line-height:1.55"></textarea></div>
      <div class="hint">${state.settings.payLink?'Your pay link is appended automatically.':'Add a Pay Link in Settings and it rides on every ask.'} Sending copies the text first, then opens the app.</div>`;
    const send=SEND_CHANNELS.map(ch=>`<button class="btn btn-sm" onclick="App._sendVia('${ch.v}')">${ico(ch.ico)} ${ch.l}</button>`).join('');
    const foot=`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-right:auto">${send}</div>${aiReady()?`<button class="btn" id="c-aidraft" onclick="App.aiDraft()">${ico('bolt')} AI draft</button><button class="btn" id="c-tonecheck" onclick="App.aiToneCheck()">${ico('check')} Tone check</button>`:''}<button class="btn" onclick="App._copyAsk()">${ico('copy')} Copy</button>`;
    openModal('Compose &amp; send the ask',body,foot,true);
    setTimeout(composerRegen,30);
  },
  _tone(t){COMPOSER.tone=t;document.querySelectorAll('#c-seg button').forEach(b=>b.classList.toggle('on',b.dataset.tone===t));composerRegen();},
  _copyAsk(){const out=document.getElementById('c-out');if(out){navigator.clipboard&&navigator.clipboard.writeText(out.value);toast('Message copied to clipboard',true);}},
  _sendVia(channel){const out=document.getElementById('c-out');const text=out?out.value:'';
    navigator.clipboard&&navigator.clipboard.writeText(text);
    const url=sendLink(channel,text,{phone:COMPOSER.ctx.phone,email:COMPOSER.ctx.email,subject:(COMPOSER.ctx.project||'Invoice')+' — '+state.settings.businessName});
    try{window.open(url,'_blank');}catch(e){}
    toast(channel==='messenger'?'Copied. Paste into Messenger chat.':'Message copied, opening '+channel,true);},

  /* clients */
  newClient(){formModal('New client',[{name:'company',label:'Company',placeholder:'Acme Inc.'},{name:'name',label:'Contact name',required:true},{name:'email',label:'Email',type:'email'},{name:'phone',label:'Mobile (for SMS / Viber)',placeholder:'0917 555 0142'},{name:'address',label:'Address',type:'textarea'},{name:'referredBy',label:'Referral code used (optional)',placeholder:'e.g. HABI-AND15'}],v=>{state.clients.push({id:uid('c'),...v});toast('Client added',true);commit();});},
  editClient(id){const c=clientById(id);formModal('Edit client',[{name:'company',label:'Company',value:c.company},{name:'name',label:'Contact name',value:c.name,required:true},{name:'email',label:'Email',type:'email',value:c.email},{name:'phone',label:'Mobile (for SMS / Viber)',value:c.phone},{name:'address',label:'Address',type:'textarea',value:c.address},{name:'referredBy',label:'Referral code used (optional)',value:c.referredBy}],v=>{Object.assign(c,v);toast('Client updated',true);commit();});},

  /* projects */
  newProject(){if(!state.clients.length){toast('Add a client first');return App.newClient();}
    formModal('New project',[
      {name:'title',label:'Project title',required:true,placeholder:'Spring Campaign'},
      {name:'clientId',label:'Client',type:'select',options:state.clients.map(c=>({v:c.id,l:c.company||c.name}))},
      {name:'type',label:'Type',type:'select',options:[{v:'photo',l:'Photo'},{v:'video',l:'Video'},{v:'illustration',l:'Illustration'},{v:'design',l:'Design'},{v:'retainer',l:'Retainer'}]},
      {name:'creativeFee',label:'Creative / production fee',type:'number',value:0},
      {name:'shootDate',label:'Shoot date (if booking)',type:'date'},
    ],v=>{
      const p={id:uid('p'),clientId:v.clientId,title:v.title,type:v.type,shootDate:v.shootDate||'',status:v.type==='retainer'?'active':(v.shootDate?'booked':'active'),creativeFee:Number(v.creativeFee)||0,hoursLogged:0,
        cancellationLadder:defaultLadder(),revision:{included:2,perRoundFee:0,rounds:[]},
        overtime:{dayRate:Number(v.creativeFee)||0,halfDayRate:Math.round((Number(v.creativeFee)||0)/2),thresholdHours:10,multiplier:1.5,callTime:'',wrapTime:''},
        passThroughs:[],deliverable:{type:'',url:'',locked:true,watermarked:true},milestones:[],changeOrders:[],collaborators:[]};
      if(v.shootDate&&v.type!=='retainer'){const sd=suggestedDeposit(v.clientId);p.hold={depositPct:sd.pct,depositAmount:Math.round((Number(v.creativeFee)||0)*sd.pct/100),deadline:iso(addDays(todayD(),7)),requested:false};if(sd.pct>30)toast(`${sd.label}: suggested ${sd.pct}% deposit`,true);}
      if(v.type==='retainer')p.retainer={period:new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'}),allowanceUnit:'deliverables',allowanceQty:10,rate:Number(v.creativeFee)||0,overageRate:0,lastRaise:iso(todayD()),raiseMonths:12,consumed:[]};
      state.projects.push(p);toast('Project created',true);go('#/project/'+p.id);commit();
    });
  },
  editProject(id){const p=projectById(id);formModal('Edit project',[
    {name:'title',label:'Title',value:p.title,required:true},
    {name:'clientId',label:'Client',type:'select',value:p.clientId,options:state.clients.map(c=>({v:c.id,l:c.company||c.name}))},
    {name:'type',label:'Type',type:'select',value:p.type,options:[{v:'photo',l:'Photo'},{v:'video',l:'Video'},{v:'illustration',l:'Illustration'},{v:'design',l:'Design'},{v:'retainer',l:'Retainer'}]},
    {name:'creativeFee',label:'Creative / production fee',type:'number',value:p.creativeFee},
    {name:'hoursLogged',label:'Hours logged (for profitability)',type:'number',value:p.hoursLogged||0},
    {name:'shootDate',label:'Shoot date',type:'date',value:p.shootDate},
    {name:'status',label:'Status',type:'select',value:p.status,options:['booked','shot','delivered','wrapped','active','cancelled'].map(s=>({v:s,l:s}))},
  ],v=>{Object.assign(p,{title:v.title,clientId:v.clientId,type:v.type,creativeFee:Number(v.creativeFee)||0,hoursLogged:Number(v.hoursLogged)||0,shootDate:v.shootDate,status:v.status});toast('Project updated',true);commit();});},

  /* deposit hold */
  requestDeposit(id){const p=projectById(id);if(!p.hold)return;
    const inv=createInvoice(p,'deposit',[{kind:'creative',label:'Booking deposit',detail:`${p.hold.depositPct}% to confirm ${fmtDate(p.shootDate)}`,qty:1,rate:p.hold.depositAmount,amount:p.hold.depositAmount}]);
    inv.status='sent';p.hold.requested=true;toast('Deposit request sent, date held',true);commit();},
  markHoldPaid(id){const p=projectById(id);const dep=projectInvoices(id).filter(i=>i.type==='deposit').sort((a,b)=>parseD(b.issueDate)-parseD(a.issueDate))[0];
    if(!dep){return App.requestDeposit(id);}
    dep.status='paid';dep.paidDate=iso(todayD());toast('Deposit cleared, date confirmed',true);commit();},
  editHold(id){const p=projectById(id);formModal('Edit date hold',[
    {name:'depositPct',label:'Deposit %',type:'number',value:p.hold.depositPct},
    {name:'depositAmount',label:'Deposit amount',type:'number',value:p.hold.depositAmount},
    {name:'deadline',label:'Hold deadline',type:'date',value:p.hold.deadline},
  ],v=>{p.hold.depositPct=Number(v.depositPct);p.hold.depositAmount=Number(v.depositAmount);p.hold.deadline=v.deadline;toast('Hold updated',true);commit();});},

  /* revisions */
  logRevision(id){const p=projectById(id),rev=p.revision,next=rev.rounds.length+1,isOver=next>rev.included;
    formModal(`Log revision round ${next}`,[{name:'note',label:'What changed?',placeholder:'e.g. Color grade, new end-card'},...(isOver?[{name:'warn',type:'static',label:'Heads up',value:`<span style="color:var(--red)">Round ${next} is beyond the ${rev.included} included. It will be flagged as a ${fmt(rev.perRoundFee)} overage to bill before work starts.</span>`}]:[])],
    v=>{rev.rounds.push({n:next,date:iso(todayD()),note:v.note,overage:isOver,billed:false});toast(isOver?'Overage round logged':'Round logged',true);commit();});},
  editRevisionSettings(id){const p=projectById(id),rev=p.revision;formModal('Revision allowance',[{name:'included',label:'Rounds included',type:'number',value:rev.included},{name:'perRoundFee',label:'Overage rate per round',type:'number',value:rev.perRoundFee}],
    v=>{rev.included=Number(v.included);rev.perRoundFee=Number(v.perRoundFee);rev.rounds.forEach((r,i)=>{r.overage=(i+1)>rev.included;});toast('Updated',true);commit();});},
  billRevisionOverage(id){const p=projectById(id),rev=p.revision,pend=rev.rounds.filter(r=>r.overage&&!r.billed);
    if(!pend.length){toast('No overage to bill');return;}
    const inv=createInvoice(p,'overage',pend.map(r=>({kind:'overage',label:`Revision overage, round ${r.n}`,detail:r.note||'Beyond included rounds',qty:1,rate:rev.perRoundFee,amount:rev.perRoundFee})));
    pend.forEach(r=>r.billed=true);toast('Overage invoice drafted',true);go('#/invoice/'+inv.id);commit();},

  /* change orders */
  addChangeOrder(id){const p=projectById(id);formModal('Add change order',[{name:'desc',label:'What was added?',required:true,placeholder:'e.g. Extra 30s social cutdown'},{name:'amount',label:'Amount',type:'number',value:0,required:true}],
    v=>{p.changeOrders.push({id:uid('co'),desc:v.desc,amount:Number(v.amount)||0,status:'proposed',billed:false});toast('Change order logged',true);commit();});},
  approveChangeOrder(pid,cid){const p=projectById(pid),co=p.changeOrders.find(c=>c.id===cid);if(co)co.status='approved';toast('Change order approved',true);commit();},
  removeChangeOrder(pid,cid){const p=projectById(pid);p.changeOrders=p.changeOrders.filter(c=>c.id!==cid);toast('Removed');commit();},
  billChangeOrders(id){const p=projectById(id),pend=changeOrdersPending(p);if(!pend.length){toast('Nothing to bill');return;}
    const inv=createInvoice(p,'change-order',pend.map(co=>({kind:'change-order',label:`Change order, ${co.desc}`,detail:'Approved scope addition',qty:1,rate:co.amount,amount:co.amount})));
    pend.forEach(co=>co.billed=true);toast('Change-order invoice drafted',true);go('#/invoice/'+inv.id);commit();},

  /* retainer */
  logConsumption(id){const p=projectById(id);formModal('Log retainer delivery',[{name:'qty',label:`How many ${esc(p.retainer.allowanceUnit)}?`,type:'number',value:1},{name:'note',label:'Note',placeholder:'e.g. Product launch batch'}],
    v=>{p.retainer.consumed.push({id:uid('rc'),date:iso(todayD()),qty:Number(v.qty)||0,note:v.note});const rs=retainerStats(p);toast(rs.over>0?`Over cap by ${rs.over}`:'Logged',true);commit();});},
  billRetainerOverage(id){const p=projectById(id),rs=retainerStats(p);if(rs.over<=0){toast('No overage');return;}
    const inv=createInvoice(p,'retainer-overage',[{kind:'overage',label:`Retainer overage, ${p.retainer.period}`,detail:`${rs.over} ${p.retainer.allowanceUnit} beyond the ${p.retainer.allowanceQty} included`,qty:rs.over,rate:p.retainer.overageRate,amount:rs.overFee}]);
    toast('Retainer overage invoice drafted',true);go('#/invoice/'+inv.id);commit();},
  proposeRaise(id){const p=projectById(id);if(!p.retainer)return;
    const newRate=Math.round(p.retainer.rate*1.08/500)*500;p.retainer.rate=newRate;p.retainer.lastRaise=iso(todayD());
    toast(`Rate raised to ${fmt(newRate)}`,true);commit();
    App.composeAsk(p.clientId,null,'firm');COMPOSER.sit='raise';COMPOSER.ctx.project=p.title;COMPOSER.ctx.amount=newRate;setTimeout(()=>{const s=document.getElementById('c-sit');if(s){s.value='raise';composerRegen();}},60);},

  /* overtime */
  logWrap(id){const p=projectById(id),o=p.overtime;formModal('Shoot-day overtime',[
    {name:'dayRate',label:'Day rate',type:'number',value:o.dayRate},{name:'thresholdHours',label:'Standard day length (hours)',type:'number',value:o.thresholdHours},
    {name:'multiplier',label:'OT multiplier',type:'number',step:'0.1',value:o.multiplier},{name:'callTime',label:'Call time',type:'time',value:o.callTime||'08:00'},{name:'wrapTime',label:'Wrap time',type:'time',value:o.wrapTime||'18:00'},
  ],v=>{Object.assign(o,{dayRate:Number(v.dayRate),thresholdHours:Number(v.thresholdHours),multiplier:Number(v.multiplier),callTime:v.callTime,wrapTime:v.wrapTime,billed:false});const ot=computeOT(o);toast(ot&&ot.otFee>0?`${ot.otHours}h OT = ${fmt(ot.otFee)}`:'Within the standard day',true);commit();});},
  billOvertime(id){const p=projectById(id),ot=computeOT(p.overtime);if(!ot||ot.otFee<=0){toast('No overtime to bill');return;}
    const inv=createInvoice(p,'overtime',[{kind:'overtime',label:'Shoot-day overtime',detail:`${ot.otHours}h beyond ${p.overtime.thresholdHours}h day at ${fmt(ot.hourly)}/hr times ${p.overtime.multiplier}`,qty:1,rate:ot.otFee,amount:ot.otFee}]);
    p.overtime.billed=true;toast('Overtime invoice drafted',true);go('#/invoice/'+inv.id);commit();},

  /* pass-throughs */
  addPT(id){const p=projectById(id);formModal('Add pass-through cost',[
    {name:'label',label:'Description',required:true,placeholder:'Studio rental'},
    {name:'category',label:'Category',type:'select',options:['Studio','Equipment','Crew','Catering','Location','Props','Travel','Other'].map(c=>({v:c,l:c}))},
    {name:'cost',label:'Your cost',type:'number',value:0,required:true},
    {name:'markupPct',label:'Markup %',type:'number',value:0,hint:'0 bills at cost. Add a coordination markup if you want.'},
  ],v=>{p.passThroughs.push({id:uid('pt'),label:v.label,category:v.category,cost:Number(v.cost)||0,markupPct:Number(v.markupPct)||0,billable:true});toast('Pass-through added',true);commit();});},
  removePT(pid,id){const p=projectById(pid);p.passThroughs=p.passThroughs.filter(x=>x.id!==id);toast('Removed');commit();},

  /* deliverable */
  editDeliverable(id){const p=projectById(id),d=p.deliverable||{};formModal('Deliverable gate',[
    {name:'type',label:'Deliverable type',type:'select',value:d.type,options:['Gallery (Pixieset)','Frame.io review link','Google Drive folder','Dropbox','Hosted file','Other'].map(x=>({v:x,l:x}))},
    {name:'url',label:'Link',value:d.url,placeholder:'https://'},
    {name:'locked',label:'Locked (files withheld until paid)',type:'checkbox',value:d.locked!==false},
    {name:'watermarked',label:'Watermark preview',type:'checkbox',value:d.watermarked!==false},
  ],v=>{p.deliverable={...d,type:v.type,url:v.url,locked:!!v.locked,watermarked:!!v.watermarked};toast('Deliverable saved',true);commit();});},
  toggleLock(id){const p=projectById(id);p.deliverable.locked=!p.deliverable.locked;p.deliverable.watermarked=p.deliverable.locked;toast(p.deliverable.locked?'Files locked':'Files released',true);commit();},
  simulateView(id){const p=projectById(id),d=p.deliverable;d.opened=true;d.downloads=(d.downloads||0)+1;d.lastViewed=iso(todayD());toast('Client view recorded',true);commit();},

  /* collaborators */
  addCollaborator(id){const p=projectById(id);formModal('Add collaborator',[
    {name:'name',label:'Name',required:true,placeholder:'Second shooter name'},
    {name:'role',label:'Role',type:'select',options:['Second shooter','Assistant','Editor','Retoucher','Colorist','Producer','Other'].map(x=>({v:x,l:x}))},
    {name:'cutType',label:'Cut type',type:'select',options:[{v:'pct',l:'% of creative fee'},{v:'flat',l:'Flat amount'}]},
    {name:'cutValue',label:'Cut value (% or amount)',type:'number',value:0,required:true},
  ],v=>{p.collaborators.push({id:uid('cl'),name:v.name,role:v.role,cutType:v.cutType,cutValue:Number(v.cutValue)||0,paidOut:false});toast('Collaborator added',true);commit();});},
  settlePayouts(id){const p=projectById(id);(p.collaborators||[]).forEach(c=>c.paidOut=true);toast('Payouts marked settled',true);commit();},

  /* milestones */
  invoiceMilestone(pid,mid){const p=projectById(pid),m=p.milestones.find(x=>x.id===mid);if(!m)return;
    const inv=createInvoice(p,'milestone',[{kind:'milestone',label:`Milestone, ${m.label}`,detail:'Project value installment',qty:1,rate:m.amount,amount:m.amount}]);
    m.status='invoiced';toast('Milestone invoice drafted',true);go('#/invoice/'+inv.id);commit();},
  approveMilestone(pid,mid){const p=projectById(pid),idx=p.milestones.findIndex(x=>x.id===mid);if(idx<0)return;
    p.milestones[idx].status='approved';if(p.milestones[idx+1]&&p.milestones[idx+1].status==='pending')p.milestones[idx+1].status='ready';
    toast('Approved, next milestone unlocked',true);commit();},

  /* kill fee */
  editLadder(id){const p=projectById(id),L=[...p.cancellationLadder].sort((a,b)=>b.minDaysOut-a.minDaysOut),fields=[];
    L.forEach((t,i)=>{fields.push({name:'min'+i,label:`Tier ${i+1}, min days before shoot`,type:'number',value:t.minDaysOut});fields.push({name:'pct'+i,label:`Tier ${i+1}, fee %`,type:'number',value:t.pct});});
    formModal('Cancellation ladder',fields,v=>{p.cancellationLadder=L.map((t,i)=>({minDaysOut:Number(v['min'+i]),pct:Number(v['pct'+i])}));toast('Ladder updated',true);commit();},{note:'More days = earlier cancellation = lower fee. Inside the smallest tier = 100%.'});},
  cancelBooking(id){const p=projectById(id);
    formModal('Client cancelled, generate kill fee',[{name:'cancelDate',label:'Date client cancelled',type:'date',value:iso(todayD()),required:true},{name:'preview',type:'static',label:'Computed kill fee',value:'<span id="kfprev">not set</span>'}],
    v=>{const kf=killFee(p,v.cancelDate);const inv=createInvoice(p,'kill-fee',[{kind:'killfee',label:'Cancellation / kill fee',detail:`Cancelled ${kf.daysOut} day(s) before shoot, ${kf.pct}% of ${fmt(p.creativeFee)} creative fee`,qty:1,rate:kf.fee,amount:kf.fee}]);
      p.status='cancelled';toast(`Kill fee invoice ${fmt(kf.fee)} (${kf.pct}%)`,true);go('#/invoice/'+inv.id);commit();},{submitLabel:'Generate kill-fee invoice'});
    setTimeout(()=>{const el=document.getElementById('f_cancelDate');const upd=()=>{const kf=killFee(p,el.value);const pr=document.getElementById('kfprev');if(pr)pr.innerHTML=`<b style="color:var(--accent-soft-fg)">${fmt(kf.fee)}</b>, ${kf.pct}% (${kf.daysOut} days before shoot)`;};if(el){el.addEventListener('change',upd);upd();}},60);
  },

  /* weather reschedules */
  logReschedule(id){const p=projectById(id),rs=rescheduleStats(p),next=rs.used+1,chargeable=next>rs.free;
    formModal(`Log reschedule #${next}`,[
      {name:'reason',label:'Why',type:'select',options:[{v:'typhoon',l:'Typhoon / weather'},{v:'client',l:'Client request'},{v:'venue',l:'Venue conflict'},{v:'health',l:'Health'},{v:'other',l:'Other'}]},
      {name:'to',label:'New date',type:'date',value:p.shootDate,required:true},
      {name:'note',label:'Note',placeholder:'e.g. Signal #2, venue flooded'},
      ...(chargeable?[{name:'warn',type:'static',label:'Heads up',value:`<span style="color:var(--amber-soft-fg,var(--amber))">Move #${next} is past the ${rs.free} free. A ${fmt(rs.reblockFee)} re-block fee will be flagged to bill.</span>`}]:[]),
    ],v=>{p.reschedules.push({id:uid('rs'),date:iso(todayD()),from:p.shootDate,to:v.to,reason:v.reason,note:v.note,billed:false});p.shootDate=v.to;
      toast(chargeable?`Rescheduled, ${fmt(rs.reblockFee)} re-block to bill`:'Rescheduled, free move',true);commit();});},
  editReschedulePolicy(id){const p=projectById(id),pol=p.reschedulePolicy||{freeCount:1,reblockFee:0};
    formModal('Reschedule policy',[{name:'freeCount',label:'Free reschedules',type:'number',value:pol.freeCount},{name:'reblockFee',label:'Re-block fee after that',type:'number',value:pol.reblockFee}],
    v=>{p.reschedulePolicy={freeCount:Number(v.freeCount)||0,reblockFee:Number(v.reblockFee)||0};toast('Policy updated',true);commit();},{note:'A weather reschedule moves the date and re-holds your slot. It is not a cancellation, so it is separate from the kill-fee ladder.'});},
  billReschedule(id){const p=projectById(id),rs=rescheduleStats(p);if(rs.feeDue<=0){toast('No re-block fee to bill');return;}
    const inv=createInvoice(p,'standard',rs.unbilled.map(r=>({kind:'creative',label:'Date re-block fee',detail:`${reasonLabel(r.reason)} reschedule to ${fmtDate(r.to)}, re-holding your slot`,qty:1,rate:rs.reblockFee,amount:rs.reblockFee})));
    rs.unbilled.forEach(r=>r.billed=true);toast('Re-block fee invoiced',true);go('#/invoice/'+inv.id);commit();},

  /* barkada / multi-payer split */
  createSplit(id){const p=projectById(id);const total=Number(p.creativeFee)||0,half=Math.round(total/2);
    p.splitPayers=[{id:uid('sp'),name:clientById(p.clientId).name,share:total-half,status:'pending',method:'',ref:''},{id:uid('sp'),name:'Second payer',share:half,status:'pending',method:'',ref:''}];
    toast('Split created, edit the payers',true);commit();App.addSplitPayer(id);},
  addSplitPayer(id){const p=projectById(id);formModal('Add payer',[{name:'name',label:'Name',required:true,placeholder:'e.g. Ninang Tessa'},{name:'share',label:'Share',type:'number',value:0,required:true}],
    v=>{p.splitPayers.push({id:uid('sp'),name:v.name,share:Number(v.share)||0,status:'pending',method:'',ref:''});toast('Payer added',true);commit();});},
  removeSplitPayer(pid,sid){const p=projectById(pid);p.splitPayers=p.splitPayers.filter(x=>x.id!==sid);toast('Removed');commit();},
  paySplitPayer(pid,sid){const p=projectById(pid),x=(p.splitPayers||[]).find(s=>s.id===sid);if(!x)return;
    formModal(`Record ${x.name}'s share`,[
      ...(aiReady()?[{name:'shot',type:'static',label:'Read a screenshot',value:`<button type="button" class="btn btn-sm" onclick="App.readShot({ref:'f_ref',method:'f_method',note:'aishot',expected:${Number(x.share)||0}})">${ico('upload')} Read GCash / Maya screenshot</button><div id="aishot" class="hint" style="margin-top:6px"></div>`}]:[]),
      {name:'paste',label:'…or paste their GCash / Maya message (optional)',type:'textarea',placeholder:'GCash: You received PHP 7,500.00. Ref No. 9087712...'},
      {name:'method',label:'Paid via',type:'select',value:'gcash',options:PAY_METHODS.map(m=>({v:m.v,l:m.l}))},
      {name:'ref',label:'Reference number',placeholder:'auto-filled from paste'},
    ],v=>{const parsed=parsePaymentText(v.paste);x.status='paid';x.method=parsed.method||v.method;x.ref=v.ref||parsed.ref;x.paidDate=iso(todayD());
      const sp=splitStats(p);
      if(sp.allPaid&&p.deliverable&&p.deliverable.url){p.deliverable.locked=false;p.deliverable.watermarked=false;toast('Final share in, files released',true);}else toast(`${x.name}'s share recorded`,true);commit();},{submitLabel:'Record share'});
    setTimeout(()=>App._wireParse(),60);},
  chaseSplit(id){const p=projectById(id),sp=splitStats(p);if(!sp||sp.allPaid){toast('All shares are in');return;}
    App.composeAsk(p.clientId);COMPOSER.sit='late';COMPOSER.ctx.project=p.title+' (share: '+sp.pending.map(x=>x.name).join(', ')+')';COMPOSER.ctx.amount=sp.remaining;
    setTimeout(()=>{const s=document.getElementById('c-sit');if(s){s.value='late';composerRegen();}},50);},

  /* invoices */
  newInvoice(){if(!state.projects.length){toast('Create a project first');return App.newProject();}
    formModal('New invoice',[{name:'projectId',label:'Project',type:'select',options:state.projects.map(p=>({v:p.id,l:p.title+', '+clientLabel(p.clientId)}))}],v=>{App.buildInvoice(v.projectId);});},
  buildInvoice(pid){const p=projectById(pid);
    formModal('Build invoice',[
      {name:'creative',label:`Creative / production fee (${fmt(p.creativeFee)})`,type:'checkbox',value:p.creativeFee>0},
      {name:'passthrough',label:'Pass-through costs (reimbursable)',type:'checkbox',value:(p.passThroughs||[]).length>0},
      {name:'overtime',label:'Shoot-day overtime',type:'checkbox',value:!!(computeOT(p.overtime)&&computeOT(p.overtime).otFee>0)},
      {name:'goods',label:'Print / product sale amount',type:'number',value:0,hint:'Optional: tangible goods like prints or albums.'},
    ],v=>{
      const items=[];
      if(v.creative&&p.creativeFee>0)items.push({kind:'creative',label:'Creative / production fee',detail:p.title,qty:1,rate:p.creativeFee,amount:p.creativeFee});
      if(v.overtime){const ot=computeOT(p.overtime);if(ot&&ot.otFee>0){items.push({kind:'overtime',label:'Shoot-day overtime',detail:`${ot.otHours}h OT`,qty:1,rate:ot.otFee,amount:ot.otFee});p.overtime.billed=true;}}
      if(Number(v.goods)>0)items.push({kind:'goods',label:'Prints / product sale',detail:'Tangible goods',qty:1,rate:Number(v.goods),amount:Number(v.goods)});
      if(v.passthrough)(p.passThroughs||[]).forEach(x=>{const billed=Math.round(Number(x.cost)*(1+Number(x.markupPct||0)/100));items.push({kind:'passthrough',label:x.label,detail:x.markupPct>0?`Reimbursable plus ${x.markupPct}%`:'Reimbursable at cost',qty:1,rate:billed,amount:billed});});
      if(!items.length){toast('Nothing selected to bill');return;}
      const inv=createInvoice(p,'standard',items);toast('Invoice created',true);go('#/invoice/'+inv.id);commit();
    },{submitLabel:'Create invoice'});
  },
  sendInvoice(id){const inv=invoiceById(id);inv.status='sent';inv.issueDate=iso(todayD());inv.dueDate=iso(addDays(todayD(),state.settings.paymentTerms));toast('Invoice marked sent',true);commit();},
  markPaid(id){const inv=invoiceById(id);inv.status='paid';inv.paidDate=iso(todayD());
    const p=projectById(inv.projectId);
    if(p&&p.deliverable&&p.deliverable.url){p.deliverable.locked=false;p.deliverable.watermarked=false;toast('Paid, deliverable released automatically',true);}else toast('Marked paid',true);commit();},
  deleteInvoice(id){const inv=invoiceById(id);openConfirm('Delete invoice?',`${inv.number} will be permanently removed.`,()=>{state.invoices=state.invoices.filter(i=>i.id!==id);toast('Invoice deleted');go('#/invoices');commit();},true);},

  /* leverage */
  leverageWatermark(id){const inv=invoiceById(id),p=projectById(inv.projectId);if(p&&p.deliverable)p.deliverable.watermarked=true;toast('Watermark re-applied',true);commit();},
  leverageRevoke(id){const inv=invoiceById(id),p=projectById(inv.projectId);if(p&&p.deliverable){p.deliverable.locked=true;p.deliverable.watermarked=true;}toast('Access revoked',true);commit();},

  /* GCash / Maya reconciler */
  recordPayment(invId){const inv=invoiceById(invId),tot=invoiceTotal(inv).total;
    formModal('Record payment',[
      ...(aiReady()?[{name:'shot',type:'static',label:'Read a screenshot',value:`<button type="button" class="btn btn-sm" onclick="App.readShot({ref:'f_ref',method:'f_method',note:'pmatch',expected:${tot}})">${ico('upload')} Read GCash / Maya screenshot</button>`}]:[]),
      {name:'paste',label:'…or paste the "paid na po" message',type:'textarea',placeholder:'GCash: You have received PHP 82,000.00 from... Ref. No. 8842137',hint:'Drop the GCash / Maya text and the reference, amount, and method auto-fill.'},
      {name:'match',type:'static',label:'',value:'<span id="pmatch" class="hint"></span>'},
      {name:'method',label:'Paid via',type:'select',options:PAY_METHODS.map(m=>({v:m.v,l:m.l}))},
      {name:'ref',label:'Reference number',required:true,placeholder:'e.g. GCash ref 8842137'},
      {name:'proof',label:'Proof screenshot (optional)',type:'file'},
    ],v=>{inv.payment={method:v.method,ref:v.ref,date:iso(todayD()),proof:v.proof||''};inv.status='paid';inv.paidDate=iso(todayD());
      const p=projectById(inv.projectId);if(p&&p.deliverable&&p.deliverable.url){p.deliverable.locked=false;p.deliverable.watermarked=false;}
      toast(`Reconciled ${inv.number} via ${payMethodLabel(v.method)}`,true);go('#/invoice/'+inv.id);commit();},{submitLabel:'Mark reconciled'});
    setTimeout(()=>App._wireParse(tot),60);},
  _wireParse(expected){const ta=document.getElementById('f_paste');if(!ta)return;
    const apply=()=>{const r=parsePaymentText(ta.value);const ref=document.getElementById('f_ref'),m=document.getElementById('f_method'),note=document.getElementById('pmatch');
      if(r.ref&&ref)ref.value=r.ref;if(r.method&&m)m.value=r.method;
      if(note){if(!ta.value.trim())note.textContent='';else if(expected&&r.amount){const ok=Math.abs(r.amount-expected)<1;note.innerHTML=ok?`<span style="color:var(--accent-soft-fg)">${ico('check')} Amount ${fmt(r.amount)} matches the invoice.</span>`:`<span style="color:var(--red)">${ico('alertT')} Paste shows ${fmt(r.amount)}, invoice is ${fmt(expected)}. Check before reconciling.</span>`;}else note.textContent=r.ref?'Reference detected.':'No reference detected yet.';}};
    ta.addEventListener('input',apply);apply();},

  /* Turnaround / SDE rush */
  setTurnaround(pid,tier){const p=projectById(pid);p.turnaround={tier,billed:false};toast('Turnaround set to '+turnaroundRow(p).l,true);commit();},
  billRush(pid){const p=projectById(pid);const fee=turnaroundFee(p);if(fee<=0){toast('No rush premium at standard turnaround');return;}
    const inv=createInvoice(p,'standard',[{kind:'creative',label:'Rush delivery surcharge',detail:turnaroundRow(p).l+' (+'+turnaroundRow(p).pct+'%)',qty:1,rate:fee,amount:fee}]);
    p.turnaround.billed=true;toast('Rush surcharge invoiced',true);go('#/invoice/'+inv.id);commit();},

  /* Hulugan installments */
  createInstallments(pid){const p=projectById(pid);const total=Number(p.creativeFee)||0,t=todayD();
    const sd=suggestedDeposit(p.clientId),res=Math.round(total*sd.pct/100),mid=Math.round(total*0.3);
    p.installments=[
      {id:uid('in'),label:'Reservation',amount:res,dueDate:iso(t),status:'pending',gate:false,reminderSent:false},
      {id:uid('in'),label:'Mid-payment',amount:mid,dueDate:iso(addDays(t,30)),status:'pending',gate:false,reminderSent:false},
      {id:uid('in'),label:'Balance before release',amount:total-res-mid,dueDate:iso(addDays(t,60)),status:'pending',gate:true,reminderSent:false},
    ];toast(`Hulugan plan created, ${sd.pct}% reservation (${sd.label})`,true);commit();App.editInstallments(pid);},
  editInstallments(pid){const p=projectById(pid);const plan=p.installments||[];if(!plan.length)return App.createInstallments(pid);const fields=[];
    plan.forEach((i,idx)=>{fields.push({name:'amt'+idx,label:i.label+' amount',type:'number',value:i.amount});fields.push({name:'due'+idx,label:i.label+' due date',type:'date',value:i.dueDate});});
    formModal('Edit hulugan plan',fields,v=>{plan.forEach((i,idx)=>{i.amount=Number(v['amt'+idx])||0;i.dueDate=v['due'+idx];});toast('Plan updated',true);commit();},{note:'The last installment is the balance-before-release that gates the final files.'});},
  payInstallment(pid,inId){const p=projectById(pid);const inst=(p.installments||[]).find(x=>x.id===inId);if(!inst)return;
    formModal(`Record "${inst.label}" payment`,[
      ...(aiReady()?[{name:'shot',type:'static',label:'Read a screenshot',value:`<button type="button" class="btn btn-sm" onclick="App.readShot({ref:'f_ref',method:'f_method',note:'aishot',expected:${Number(inst.amount)||0}})">${ico('upload')} Read GCash / Maya screenshot</button><div id="aishot" class="hint" style="margin-top:6px"></div>`}]:[]),
      {name:'method',label:'Paid via',type:'select',options:PAY_METHODS.map(m=>({v:m.v,l:m.l}))},
      {name:'ref',label:'Reference number',required:true,placeholder:'e.g. GCash ref'},
    ],v=>{inst.status='paid';inst.method=v.method;inst.paidRef=v.ref;inst.paidDate=iso(todayD());
      if(inst.gate&&p.deliverable&&p.deliverable.url){p.deliverable.locked=false;p.deliverable.watermarked=false;toast('Balance cleared, files released',true);}else toast(`${inst.label} marked paid`,true);
      commit();},{submitLabel:'Mark paid'});},
  sendInstallmentReminder(pid,inId){const p=projectById(pid);const inst=(p.installments||[]).find(x=>x.id===inId);if(inst)inst.reminderSent=true;
    App.composeAsk(p.clientId);COMPOSER.sit='late';COMPOSER.ctx.project=p.title;COMPOSER.ctx.amount=inst?inst.amount:0;
    setTimeout(()=>{const s=document.getElementById('c-sit');if(s)s.value='late';composerRegen();},50);},

  /* Post-payment review & referral */
  requestReview(pid){const p=projectById(pid),c=clientById(p.clientId),co=p.closeout||(p.closeout={});co.reviewRequested=true;
    const fb='facebook.com/'+state.settings.businessName.replace(/\s+/g,'');
    const text=`Hi ${c?c.name:'there'}, salamat for trusting ${state.settings.businessName} with ${p.title}. It was a joy to work with you.\n\nIf you have a minute, a short review means the world to a small studio:\nFacebook: ${fb} (Reviews tab)\nGoogle: search "${state.settings.businessName}" and tap Reviews\n\nAnd a little thank-you: share code ${co.referralCode} with a friend and you both get a discount on your next booking.\n\nWith gratitude,\n${state.settings.businessName}`;
    openModal('Review and referral request',`<p class="muted" style="font-size:13px;margin-bottom:10px">Sent at the goodwill peak: delivered and paid.</p><textarea class="input" style="min-height:230px;font-size:13px" readonly>${esc(text)}</textarea>`,
      `<button class="btn" onclick="closeModal()">Close</button><button class="btn btn-primary" data-t="${esc(text)}" onclick="navigator.clipboard&&navigator.clipboard.writeText(this.dataset.t);App.toast('Copied to clipboard')">${ico('copy')} Copy message</button>`,true);
    save();},

  /* ===== AI: Feature 1 — payment screenshot reader (vision model) ===== */
  _pickImage(cb){const inp=document.createElement('input');inp.type='file';inp.accept='image/*';
    inp.onchange=()=>{const f=inp.files&&inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>cb(r.result,f);r.readAsDataURL(f);};inp.click();},
  _shrinkImage(dataUrl,cb){try{const img=new Image();img.onload=()=>{const max=1400;let w=img.width,h=img.height;const sc=Math.min(1,max/Math.max(w,h));const cw=Math.max(1,Math.round(w*sc)),ch=Math.max(1,Math.round(h*sc));const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;cv.getContext('2d').drawImage(img,0,0,cw,ch);try{cb(cv.toDataURL('image/jpeg',0.85));}catch(e){cb(dataUrl);}};img.onerror=()=>cb(dataUrl);img.src=dataUrl;}catch(e){cb(dataUrl);}},
  readShot(t){t=t||{};
    if(!aiReady()){toast('Turn on AI in Settings → AI features first');return;}
    const note=t.note&&document.getElementById(t.note);
    App._pickImage((raw)=>App._shrinkImage(raw,async(dataUrl)=>{
      if(note)note.innerHTML='<span class="muted">'+ico('clock')+' Reading screenshot…</span>';
      try{
        const content=[{type:'text',text:'This is a Philippine e-wallet or bank payment receipt screenshot (GCash, Maya, InstaPay, PESONet, or a bank app). Extract the payment details. Respond with ONLY a JSON object, no prose: {"ref":string,"amount":number,"method":"gcash|maya|instapay|pesonet|bank","date":"YYYY-MM-DD or empty","sender":string}. "amount" is a plain number, no commas or currency sign. Use "" (or 0 for amount) for anything not visible.'},{type:'image_url',image_url:{url:dataUrl}}];
        const out=await aiChat('vision',[{role:'user',content}],{temperature:0,max_tokens:300});
        const j=aiParseJSON(out);
        if(!j){if(note)note.innerHTML='<span style="color:var(--red)">'+ico('alertT')+' Could not read that screenshot. Enter the details manually.</span>';return;}
        const ref=t.ref&&document.getElementById(t.ref),m=t.method&&document.getElementById(t.method),amt=t.amount&&document.getElementById(t.amount);
        if(ref&&j.ref)ref.value=String(j.ref).toUpperCase();
        if(m&&j.method)m.value=j.method;
        if(amt&&j.amount)amt.value=Number(j.amount)||0;
        if(note){const okAmt=(t.expected&&j.amount)?(Math.abs(Number(j.amount)-t.expected)<1):null;
          note.innerHTML=`Read: ref <b>${esc(String(j.ref||'—'))}</b>, ${fmt(Number(j.amount||0))} via ${esc(payMethodLabel(j.method)||'?')}${j.sender?', from '+esc(j.sender):''}.`+
            (okAmt===false?` <span style="color:var(--red)">${ico('alertT')} Does not match ${fmt(t.expected)}.</span>`:okAmt===true?` <span style="color:var(--accent-soft-fg)">${ico('check')} Matches the amount due.</span>`:'');}
      }catch(e){if(note)note.innerHTML='<span style="color:var(--red)">'+esc(String(e.message||e))+'</span>';}
    }));},

  /* ===== AI: Feature 3 — register-matched follow-up draft (writes into the composer) ===== */
  async aiDraft(){
    if(!aiReady()){toast('Turn on AI in Settings → AI features first');return;}
    const thread=(document.getElementById('c-thread')||{}).value||'';
    const out=document.getElementById('c-out'),sitSel=document.getElementById('c-sit');
    const sit=sitSel?sitSel.value:COMPOSER.sit,c=COMPOSER.ctx,tone=COMPOSER.tone;
    const sitLabel=(ASK_SITUATIONS.find(s=>s.v===sit)||{}).l||sit;
    const btn=document.getElementById('c-aidraft');if(btn){btn.disabled=true;btn.innerHTML=ico('clock')+' Drafting…';}
    try{
      const sys='You are a Filipino creative freelancer writing a short client message. Match the SAME language register the client uses (Taglish, English, or Tagalog) and the SAME formality (po/opo vs. casual barkada). Be warm but firm; respect hiya without being a pushover. Keep it concise. Never invent amounts, dates, or facts beyond what is given. Output ONLY the message text — no preamble, no quotes, no notes.';
      const usr=`Task: ${sitLabel}.\nDesired firmness: ${tone}.\nClient name: ${c.name||'(unknown)'}.\nProject: ${c.project||'(unspecified)'}.\nAmount involved: ${c.amount?fmt(c.amount):'(none)'}.\nDays overdue: ${c.days||0}.\nSign off as: ${c.biz||state.settings.businessName}.\n`+
        ((state.settings.payLink&&sit!=='raise')?('Include this pay link near the end: '+state.settings.payLink+'\n'):'')+
        (thread.trim()?('\nThe client\'s recent messages — match their register and tone exactly:\n"""\n'+thread.trim()+'\n"""\n'):'\n(No sample messages given — use polite Taglish suitable for a Filipino client.)\n')+
        '\nWrite my message now.';
      const reply=await aiChat('followup',[{role:'system',content:sys},{role:'user',content:usr}],{temperature:0.5,max_tokens:500});
      if(out&&reply.trim())out.value=reply.trim();
      toast('AI draft ready — review before sending',true);
    }catch(e){toast(String(e.message||e));}
    finally{const b=document.getElementById('c-aidraft');if(b){b.disabled=false;b.innerHTML=ico('bolt')+' AI draft';}}},

  /* ===== AI: Feature 4 — scope-creep / revision detector ===== */
  checkScope(pid){const p=projectById(pid);
    if(!aiReady()){toast('Turn on AI in Settings → AI features first');return;}
    const rev=p.revision||{included:0,perRoundFee:0};
    openModal('Check a client request',`
      <div class="field"><label>Paste the client's new request</label><textarea class="input" id="sc-req" style="min-height:90px" placeholder="e.g. Pwede pa-edit ng konti yung color, tas dagdag 3 more photos? Salamat!"></textarea></div>
      <div class="hint">AI weighs it against this project's agreed scope: ${rev.included} revision round(s) included, ${fmt(rev.perRoundFee)} per extra round, ${(rev.rounds||[]).length} logged.</div>
      <div id="sc-out" style="margin-top:12px"></div>`,
      `<button class="btn" onclick="closeModal()">Close</button><button class="btn btn-primary" id="sc-go" onclick="App.runScope('${pid}')">${ico('bolt')} Check request</button>`,true);},
  async runScope(pid){const p=projectById(pid),cli=clientById(p.clientId);
    const req=(document.getElementById('sc-req')||{}).value||'';
    if(!req.trim()){toast('Paste the request first');return;}
    const go=document.getElementById('sc-go'),out=document.getElementById('sc-out');
    if(go){go.disabled=true;go.innerHTML=ico('clock')+' Checking…';}
    try{
      const rev=p.revision||{included:0,perRoundFee:0},usedRounds=(rev.rounds||[]).length;
      const sys='You are a senior Filipino creative freelancer protecting your scope. Decide if a client request is INSIDE the agreed scope or a BILLABLE add-on (a revision overage or a new change order). Be fair, not greedy: minor fixes a client reasonably expects are in-scope; new deliverables, extra outputs, or work beyond the included revision rounds are billable. Respond with ONLY JSON, no prose: {"verdict":"in-scope|billable","kind":"revision|change-order|none","reason":string (one plain-English sentence),"suggestedCharge":number (PHP, 0 if in-scope),"draftReply":string (a short warm Taglish message to the client; if billable, gently explain the add-on and price; if in-scope, confirm you will do it)}.';
      const usr=`Project type: ${p.type}. Creative fee: ${fmt(p.creativeFee)}.\nRevision policy: ${rev.included} rounds included at ${fmt(rev.perRoundFee)} per extra round; ${usedRounds} round(s) already logged.\nDeliverable: ${(p.deliverable&&p.deliverable.type)||'not set'}.\nClient name: ${cli?cli.name:'(client)'}.\nFor a billable extra revision, suggestedCharge should be ${rev.perRoundFee}; for a new change order, estimate a fair PHP amount.\n\nClient request:\n"""\n${req.trim()}\n"""`;
      const reply=await aiChat('scope',[{role:'system',content:sys},{role:'user',content:usr}],{temperature:0.2,max_tokens:600});
      const j=aiParseJSON(reply);
      if(!j){out.innerHTML='<div class="callout amber">Could not parse the AI response. Try again.</div>';return;}
      const billable=j.verdict==='billable',charge=Number(j.suggestedCharge||0);
      out.innerHTML=`
        <div class="callout ${billable?'amber':'accent'}"><b>${billable?'Billable add-on':'In scope'}</b>${billable&&charge?` — suggested ${fmt(charge)}`:''}<br><span style="font-size:13px">${esc(j.reason||'')}</span></div>
        <div class="field" style="margin-top:10px"><label>Draft reply (review before sending)</label><textarea class="input" id="sc-reply" style="min-height:90px">${esc(j.draftReply||'')}</textarea></div>
        <div class="field-row">
          <button class="btn btn-sm btn-block" onclick="navigator.clipboard&&navigator.clipboard.writeText(document.getElementById('sc-reply').value);App.toast('Reply copied')">${ico('copy')} Copy reply</button>
          ${billable?`<button class="btn btn-sm btn-primary btn-block" onclick="App.scopeToCO('${pid}',${charge},this)">${ico('plus')} Create change order</button>`:''}
        </div>`;
    }catch(e){out.innerHTML='<div class="callout red">'+esc(String(e.message||e))+'</div>';}
    finally{const g=document.getElementById('sc-go');if(g){g.disabled=false;g.innerHTML=ico('bolt')+' Check request';}}},
  scopeToCO(pid,amount,btn){const p=projectById(pid);const desc=((document.getElementById('sc-req')||{}).value||'Scope addition').trim().slice(0,90);
    p.changeOrders.push({id:uid('co'),desc,amount:Number(amount)||0,status:'proposed',billed:false});
    save();toast('Change order logged (proposed)',true);if(btn){btn.disabled=true;btn.innerHTML=ico('check')+' Added';}},

  /* ===== AI helpers shared by features 6–23 ===== */
  _spin(id,txt){const b=document.getElementById(id);if(b){b.disabled=true;b._orig=b.innerHTML;b.innerHTML=ico('clock')+' '+esc(txt||'Working…');}},
  _unspin(id){const b=document.getElementById(id);if(b){b.disabled=false;if(b._orig!=null)b.innerHTML=b._orig;}},
  _aiErr(hostId,e){const o=document.getElementById(hostId);if(o)o.innerHTML='<div class="callout red">'+esc(String((e&&e.message)||e))+'</div>';},

  /* ===== AI #6 — proposal / quote generator ===== */
  aiProposal(){
    if(!aiReady()){toast('Turn on AI in Settings → AI features first');return;}
    openModal('AI quote / proposal',`
      <div class="field"><label>Client / company (optional)</label><input class="input" id="q-client" placeholder="e.g. Kape Republik"></div>
      <div class="field"><label>Project type</label><select class="input" id="q-type">${['Photo','Video','Illustration','Design','Retainer','Event coverage'].map(x=>`<option>${x}</option>`).join('')}</select></div>
      <div class="field"><label>Scope — what they want</label><textarea class="input" id="q-scope" style="min-height:90px" placeholder="e.g. Half-day product shoot, 15 finished photos, 1 location, 2 revision rounds"></textarea></div>
      <div class="field"><label>Budget hint (optional)</label><input class="input" id="q-budget" placeholder="e.g. around 40k, or leave blank"></div>
      <div id="q-out" style="margin-top:12px"></div>`,
      `<button class="btn" onclick="closeModal()">Close</button><button class="btn btn-primary" id="q-go" onclick="App.runProposal()">${ico('bolt')} Generate quote</button>`,true);
  },
  async runProposal(){
    const type=(document.getElementById('q-type')||{}).value||'Photo',scope=(document.getElementById('q-scope')||{}).value||'',client=(document.getElementById('q-client')||{}).value||'',budget=(document.getElementById('q-budget')||{}).value||'';
    if(!scope.trim()){toast('Describe the scope first');return;}
    App._spin('q-go','Generating…');const out=document.getElementById('q-out');
    try{
      const sys='You are a senior Filipino creative freelancer writing a professional but warm price quote for a prospective client. Produce a clear itemized quote in PHP (₱): a one-line intro, an itemized list (deliverable + price each), a subtotal, recommended terms (reservation %, balance, revision rounds included, turnaround), and a friendly close. Follow PH norms (GCash/bank, 30–50% reservation). If a budget hint is given, fit the scope to it honestly. Do not invent client details. Output plain text ready to send.';
      const usr=`Studio: ${state.settings.businessName}.\nClient: ${client||'(prospect)'}.\nProject type: ${type}.\nScope:\n${scope}\nBudget hint: ${budget||'(none)'}.\nCurrency: PHP.`;
      const reply=await aiChat('followup',[{role:'system',content:sys},{role:'user',content:usr}],{temperature:0.4,max_tokens:800});
      out.innerHTML=`<div class="field"><label>Quote — review &amp; edit</label><textarea class="input" id="q-res" style="min-height:240px;font-size:13px;line-height:1.5">${esc(reply.trim())}</textarea></div>
        <button class="btn btn-sm btn-block" onclick="navigator.clipboard&&navigator.clipboard.writeText(document.getElementById('q-res').value);App.toast('Quote copied')">${ico('copy')} Copy quote</button>`;
    }catch(e){App._aiErr('q-out',e);}
    finally{App._unspin('q-go');}
  },

  /* ===== AI #7 — supplier-receipt OCR → pass-through ===== */
  scanReceipt(pid){
    if(!aiReady()){toast('Turn on AI in Settings → AI features first');return;}
    const CATS=['Studio','Equipment','Crew','Catering','Location','Props','Travel','Other'];
    App._pickImage((raw)=>App._shrinkImage(raw,async(dataUrl)=>{
      toast('Reading receipt…');
      try{
        const content=[{type:'text',text:'This is a supplier/vendor receipt or expense for a creative production (studio rental, equipment, catering, crew, location, props, travel, etc). Extract it. Respond with ONLY JSON, no prose: {"label":string (short description, e.g. "Studio rental - Daylight A"),"category":"Studio|Equipment|Crew|Catering|Location|Props|Travel|Other","cost":number (plain number, no commas or currency sign)}. Use "" or 0 for anything not visible.'},{type:'image_url',image_url:{url:dataUrl}}];
        const outTxt=await aiChat('vision',[{role:'user',content}],{temperature:0,max_tokens:200});
        const j=aiParseJSON(outTxt);
        if(!j){toast('Could not read that receipt — add it manually');return;}
        const p=projectById(pid);
        formModal('Confirm pass-through cost',[
          {name:'label',label:'Description',value:j.label||'',required:true},
          {name:'category',label:'Category',type:'select',value:CATS.indexOf(j.category)>=0?j.category:'Other',options:CATS.map(c=>({v:c,l:c}))},
          {name:'cost',label:'Your cost',type:'number',value:Number(j.cost)||0,required:true},
          {name:'markupPct',label:'Markup %',type:'number',value:0,hint:'0 bills at cost.'},
        ],v=>{p.passThroughs.push({id:uid('pt'),label:v.label,category:v.category,cost:Number(v.cost)||0,markupPct:Number(v.markupPct)||0,billable:true});toast('Pass-through added from receipt',true);commit();},{note:'Read from your screenshot by AI — check the numbers before saving.'});
      }catch(e){toast(String((e&&e.message)||e));}
    }));
  },

  /* ===== AI #8 — escalating reminder ladder ===== */
  async aiReminderLadder(invId){
    if(!aiReady()){toast('Turn on AI in Settings → AI features first');return;}
    const inv=invoiceById(invId),c=clientById(inv.clientId),p=projectById(inv.projectId);
    const d=daysOverdue(inv),amt=invoiceTotal(inv).total;
    openModal('AI reminder ladder',`<div id="rl-out" class="hint">${ico('clock')} Drafting four escalating reminders…</div>`,`<button class="btn" onclick="closeModal()">Close</button>`,true);
    try{
      const sys='You are a Filipino creative freelancer. Write FOUR escalating payment-reminder messages for one overdue invoice in warm-but-firm Taglish suitable for a PH client. Respect hiya but get paid. Return ONLY JSON: {"friendly":string,"firm":string,"final":string,"formal":string}. friendly=gentle nudge; firm=clear ask with a deadline; final=files-stay-locked warning; formal=written final notice before collections. Never invent amounts or dates beyond what is given.';
      const usr=`Client: ${c?c.name:'(client)'}.\nProject: ${p?p.title:''}.\nAmount: ${fmt(amt)}.\nDays overdue: ${d}.\nSign off: ${state.settings.businessName}.${state.settings.payLink?'\nPay link: '+state.settings.payLink:''}`;
      const reply=await aiChat('followup',[{role:'system',content:sys},{role:'user',content:usr}],{temperature:0.5,max_tokens:900});
      const j=aiParseJSON(reply)||{};
      const block=(k,t)=>`<div class="field"><label>${t}</label><textarea class="input" style="min-height:84px;font-size:13px;line-height:1.5">${esc(j[k]||'')}</textarea></div>`;
      const host=document.getElementById('rl-out');
      if(host)host.outerHTML=`<div>${block('friendly','1 · Friendly nudge')}${block('firm','2 · Firm reminder')}${block('final','3 · Files-locked warning')}${block('formal','4 · Formal final notice')}<p class="hint">Copy whichever fits the stage. Every box is editable.</p></div>`;
    }catch(e){App._aiErr('rl-out',e);}
  },

  /* ===== AI #9 — payment-risk briefing ===== */
  async aiRiskBriefing(){
    if(!aiReady()){toast('Turn on AI in Settings → AI features first');return;}
    const data=state.clients.map(c=>{const r=clientRisk(c.id);return {name:c.company||c.name,avg:r.avg,n:r.n||0};});
    openModal('AI payment-risk briefing',`<div id="rb-out" class="hint">${ico('clock')} Analyzing your clients…</div>`,`<button class="btn" onclick="closeModal()">Close</button>`,true);
    try{
      const sys='You are a financial advisor for a Filipino creative freelancer. Given each client\'s average days-late and paid-invoice count, write a short briefing: who to watch, who to trust, and concrete terms to set per risky client (reservation %, net days, whether to gate files). Be specific and PH-appropriate. Plain text, short paragraphs or bullets.';
      const usr='Clients (avg days late; negative = pays early; n = paid invoices):\n'+(data.length?data.map(d=>`- ${d.name}: ${d.avg==null?'no history':d.avg+' days, n='+d.n}`).join('\n'):'(no clients)');
      const reply=await aiChat('scope',[{role:'system',content:sys},{role:'user',content:usr}],{temperature:0.3,max_tokens:700});
      const host=document.getElementById('rb-out');if(host)host.outerHTML=`<textarea class="input" style="min-height:280px;font-size:13px;line-height:1.5">${esc(reply.trim())}</textarea>`;
    }catch(e){App._aiErr('rb-out',e);}
  },

  /* ===== AI #10 — cash-flow forecast explainer ===== */
  async aiForecast(){
    if(!aiReady()){toast('Turn on AI in Settings → AI features first');return;}
    const fc=forecast();const open=buildAlerts().filter(a=>a.money).slice(0,8).map(a=>`${a.title} (${fmt(a.money)})`);
    openModal('AI cash-flow read',`<div id="fc-out" class="hint">${ico('clock')} Reading your forecast…</div>`,`<button class="btn" onclick="closeModal()">Close</button>`,true);
    try{
      const sys='You are a cash-flow advisor for a Filipino creative freelancer. Given a 3-month projected-income forecast and the current billable open items, explain in plain language which months are thin or strong and the 2–3 most important actions to take this week to smooth cash flow. Be concrete and reference amounts. Keep it short.';
      const usr='Forecast (PHP):\n'+fc.map(b=>`- ${b.label}: ${fmt(b.amount)}`).join('\n')+'\n\nOpen billable items:\n'+(open.join('\n')||'(none)');
      const reply=await aiChat('followup',[{role:'system',content:sys},{role:'user',content:usr}],{temperature:0.4,max_tokens:600});
      const host=document.getElementById('fc-out');if(host)host.outerHTML=`<textarea class="input" style="min-height:240px;font-size:13px;line-height:1.5">${esc(reply.trim())}</textarea>`;
    }catch(e){App._aiErr('fc-out',e);}
  },

  /* ===== AI #11 — outgoing-message tone guard ===== */
  async aiToneCheck(){
    if(!aiReady()){toast('Turn on AI in Settings → AI features first');return;}
    const out=document.getElementById('c-out');if(!out||!out.value.trim()){toast('Write or generate a message first');return;}
    App._spin('c-tonecheck','Checking…');
    try{
      const sys='You are a communications coach for a Filipino freelancer. Assess whether an outgoing client message is professional and relationship-safe (not hostile, passive-aggressive, or unclear), considering PH hiya/po culture. Return ONLY JSON: {"rating":"good|caution|risky","issue":string (one sentence; empty if good),"rewrite":string (a softer, still-firm version; empty if already good)}.';
      const reply=await aiChat('followup',[{role:'system',content:sys},{role:'user',content:'Message:\n"""\n'+out.value.trim()+'\n"""'}],{temperature:0.3,max_tokens:500});
      const j=aiParseJSON(reply)||{rating:'good'};
      const cls=j.rating==='risky'?'red':j.rating==='caution'?'amber':'accent';
      let host=document.getElementById('tone-res');if(!host){host=document.createElement('div');host.id='tone-res';host.style.marginTop='10px';out.parentNode.appendChild(host);}
      host.innerHTML=`<div class="callout ${cls}"><b>${j.rating==='good'?'Reads well':j.rating==='caution'?'Use caution':'Could damage the relationship'}</b>${j.issue?'<br><span style="font-size:13px">'+esc(j.issue)+'</span>':''}</div>`+
        (j.rewrite?`<button class="btn btn-sm btn-block" style="margin-top:8px" data-r="${esc(j.rewrite)}" onclick="document.getElementById('c-out').value=this.dataset.r;App.toast('Replaced with softer version')">${ico('check')} Use softer rewrite</button>`:'');
    }catch(e){toast(String((e&&e.message)||e));}
    finally{App._unspin('c-tonecheck');}
  },

  /* ===== AI #16 — discount / "pa-tawad" coach ===== */
  aiHaggle(pid){
    if(!aiReady()){toast('Turn on AI in Settings → AI features first');return;}
    const p=projectById(pid);
    openModal('Handle a discount request',`
      <div class="field"><label>Paste what the client said</label><textarea class="input" id="hg-req" style="min-height:90px" placeholder="e.g. Ang mahal naman po, pwede ba 30k na lang? Budget lang talaga namin."></textarea></div>
      <div class="hint">This project's fee: ${fmt(p.creativeFee)}. The AI holds your value — it trades scope, not price.</div>
      <div id="hg-out" style="margin-top:12px"></div>`,
      `<button class="btn" onclick="closeModal()">Close</button><button class="btn btn-primary" id="hg-go" onclick="App.runHaggle('${pid}')">${ico('bolt')} Get replies</button>`,true);
  },
  async runHaggle(pid){
    const p=projectById(pid),req=(document.getElementById('hg-req')||{}).value||'';
    if(!req.trim()){toast('Paste the request first');return;}
    App._spin('hg-go','Thinking…');const out=document.getElementById('hg-out');
    try{
      const sys='You are a senior Filipino creative freelancer asked for a discount ("tawad"). Coach the freelancer to hold their rate gracefully — prefer trading scope (fewer outputs, simpler package, off-peak date, longer turnaround) over cutting price; a small goodwill concession is OK only if reasonable. Return ONLY JSON: {"strategy":string (one sentence on how to handle this),"replies":[{"label":string,"text":string}] (2–3 warm Taglish reply options the freelancer can send)}.';
      const usr=`Project: ${p.title} (${p.type}). Quoted fee: ${fmt(p.creativeFee)}.\nClient message:\n"""\n${req.trim()}\n"""`;
      const reply=await aiChat('followup',[{role:'system',content:sys},{role:'user',content:usr}],{temperature:0.5,max_tokens:700});
      const j=aiParseJSON(reply);
      if(!j||!j.replies){out.innerHTML='<div class="callout amber">Could not parse the AI response. Try again.</div>';return;}
      out.innerHTML=`<div class="callout accent" style="margin-bottom:10px"><b>Strategy</b><br><span style="font-size:13px">${esc(j.strategy||'')}</span></div>`+
        j.replies.map((r,i)=>`<div class="field"><label>${esc(r.label||('Option '+(i+1)))}</label><textarea class="input" style="min-height:78px;font-size:13px">${esc(r.text||'')}</textarea></div>`).join('');
    }catch(e){App._aiErr('hg-out',e);}
    finally{App._unspin('hg-go');}
  },

  /* ===== AI #17 — closeout assistant ===== */
  async aiCloseout(pid){
    if(!aiReady()){toast('Turn on AI in Settings → AI features first');return;}
    const p=projectById(pid),facts=[];
    const ot=computeOT(p.overtime);if(ot&&ot.otFee>0&&!p.overtime.billed)facts.push(`Unbilled shoot overtime: ${fmt(ot.otFee)}`);
    if(p.turnaround&&p.turnaround.tier!=='standard'&&!p.turnaround.billed)facts.push(`Unbilled rush surcharge: ${fmt(turnaroundFee(p))}`);
    (p.revision&&p.revision.rounds||[]).filter(r=>r.overage&&!r.billed).forEach(r=>facts.push(`Unbilled revision overage round ${r.n}: ${fmt(p.revision.perRoundFee)}`));
    changeOrdersPending(p).forEach(co=>facts.push(`Approved unbilled change order "${co.desc}": ${fmt(co.amount)}`));
    const rs=rescheduleStats(p);if(rs.feeDue>0)facts.push(`Unbilled re-block fee: ${fmt(rs.feeDue)}`);
    const sp=splitStats(p);if(sp&&!sp.allPaid)facts.push(`Split payment outstanding: ${fmt(sp.remaining)}`);
    const inst=installmentStats(p);if(inst&&inst.remaining>0)facts.push(`Installment balance remaining: ${fmt(inst.remaining)}`);
    const due=payoutsDue(p);if(due.length)facts.push(`Crew payouts owed: ${due.map(c=>c.name).join(', ')}`);
    const rsr=retainerStats(p);if(rsr&&rsr.over>0)facts.push(`Retainer overage: ${fmt(rsr.overFee)}`);
    projectInvoices(p.id).forEach(i=>{if(invoiceStatus(i)==='overdue')facts.push(`Overdue invoice ${i.number}: ${fmt(invoiceTotal(i).total)}`);});
    openModal('AI closeout check',`<div id="cl-out" class="hint">${ico('clock')} Reviewing what's still billable…</div>`,`<button class="btn" onclick="closeModal()">Close</button>`,true);
    try{
      const sys='You are a billing assistant for a Filipino creative freelancer about to close a project. Given the list of unbilled/outstanding items, write a short checklist of what to bill or collect BEFORE marking the project delivered, ordered by amount. If nothing is outstanding, say clearly they are clear to close. End with a one-line warm Taglish message they could send the client if a balance remains. Plain text.';
      const usr=`Project: ${p.title} (${p.type}). Status: ${p.status}.\nOutstanding items:\n${facts.length?facts.map(f=>'- '+f).join('\n'):'(none found)'}`;
      const reply=await aiChat('scope',[{role:'system',content:sys},{role:'user',content:usr}],{temperature:0.3,max_tokens:600});
      const host=document.getElementById('cl-out');if(host)host.outerHTML=`<textarea class="input" style="min-height:240px;font-size:13px;line-height:1.5">${esc(reply.trim())}</textarea>`;
    }catch(e){App._aiErr('cl-out',e);}
  },

  /* ===== AI #20 — reschedule / typhoon message ===== */
  async aiReschedule(pid){
    if(!aiReady()){toast('Turn on AI in Settings → AI features first');return;}
    const p=projectById(pid),c=clientById(p.clientId),rs=rescheduleStats(p);
    const list=p.reschedules||[],last=list[list.length-1];
    openModal('AI reschedule message',`<div id="rs-out" class="hint">${ico('clock')} Drafting…</div>`,`<button class="btn" onclick="closeModal()">Close</button>`,true);
    try{
      const sys='You are a Filipino creative freelancer. Write a warm, empathetic but clear Taglish message to a client about rescheduling a shoot (often due to typhoon/weather). Acknowledge the situation kindly, confirm the new date if given, and gently explain whether this move is free or incurs a re-block fee to re-hold the slot. Respect hiya. Output ONLY the message text.';
      const usr=`Client: ${c?c.name:'(client)'}.\nProject: ${p.title}.\nReason: ${last?reasonLabel(last.reason):'weather'}.\nNew date: ${last&&last.to?fmtDate(last.to):'to be confirmed'}.\nFree moves: ${rs.used} used of ${rs.free} free.\nRe-block fee: ${fmt(rs.reblockFee)}.\nThis move is ${rs.feeDue>0?'chargeable ('+fmt(rs.reblockFee)+' re-block fee)':'free'}.\nSign off: ${state.settings.businessName}.`;
      const reply=await aiChat('followup',[{role:'system',content:sys},{role:'user',content:usr}],{temperature:0.5,max_tokens:500});
      const host=document.getElementById('rs-out');if(host)host.outerHTML=`<textarea class="input" id="rs-res" style="min-height:200px;font-size:13px;line-height:1.5">${esc(reply.trim())}</textarea><button class="btn btn-sm btn-block" style="margin-top:8px" onclick="navigator.clipboard&&navigator.clipboard.writeText(document.getElementById('rs-res').value);App.toast('Copied')">${ico('copy')} Copy</button>`;
    }catch(e){App._aiErr('rs-out',e);}
  },

  /* ===== AI #22 — "describe your studio" onboarding ===== */
  aiOnboard(){
    if(!aiReady()){toast('Turn on AI in Settings → AI features first');return;}
    openModal('Describe your studio',`
      <div class="field"><label>Tell me about your business in a sentence or two</label><textarea class="input" id="ob-text" style="min-height:100px" placeholder="e.g. We're a Cebu-based wedding & events video studio, mostly couples and debuts. We usually need 50% reservation and deliver in 2–3 weeks."></textarea></div>
      <div id="ob-out" style="margin-top:12px"></div>`,
      `<button class="btn" onclick="closeModal()">Close</button><button class="btn btn-primary" id="ob-go" onclick="App.runOnboard()">${ico('bolt')} Suggest setup</button>`,true);
  },
  async runOnboard(){
    const txt=(document.getElementById('ob-text')||{}).value||'';
    if(!txt.trim()){toast('Describe your studio first');return;}
    App._spin('ob-go','Thinking…');const out=document.getElementById('ob-out');
    try{
      const sys='You configure a billing app for a Filipino creative freelancer from a short business description. Return ONLY JSON: {"businessName":string,"paymentTerms":number (net days, e.g. 15),"defaultReservationPct":number (e.g. 50),"includedRevisions":number,"summary":string (one sentence describing the suggested setup)}. Infer sensible PH defaults when unstated.';
      const reply=await aiChat('followup',[{role:'system',content:sys},{role:'user',content:txt.trim()}],{temperature:0.3,max_tokens:400});
      const j=aiParseJSON(reply);
      if(!j){out.innerHTML='<div class="callout amber">Could not parse the AI response. Try again.</div>';return;}
      out.innerHTML=`<div class="callout accent" style="margin-bottom:10px"><b>Suggested setup</b><br><span style="font-size:13px">${esc(j.summary||'')}</span></div>
        <div class="li"><div class="desc">Business name</div><div class="amt">${esc(j.businessName||state.settings.businessName)}</div></div>
        <div class="li"><div class="desc">Payment terms</div><div class="amt">net ${Number(j.paymentTerms)||state.settings.paymentTerms} days</div></div>
        <div class="li"><div class="desc">Suggested reservation</div><div class="amt">${Number(j.defaultReservationPct)||50}%</div></div>
        <div class="li"><div class="desc">Included revision rounds</div><div class="amt">${Number(j.includedRevisions)||2}</div></div>
        <button class="btn btn-primary btn-block" style="margin-top:12px" data-j="${esc(JSON.stringify({businessName:j.businessName||'',paymentTerms:Number(j.paymentTerms)||0}))}" onclick="App.applyOnboard(this.dataset.j)">${ico('check')} Apply to settings</button>`;
    }catch(e){App._aiErr('ob-out',e);}
    finally{App._unspin('ob-go');}
  },
  applyOnboard(jstr){try{const j=JSON.parse(jstr);if(j.businessName)state.settings.businessName=j.businessName;if(Number(j.paymentTerms))state.settings.paymentTerms=Number(j.paymentTerms);closeModal();toast('Settings updated',true);commit();}catch(e){toast('Could not apply');}},

  /* ===== AI #23 — review request + testimonial co-writer ===== */
  async aiReviewDraft(pid){
    if(!aiReady()){toast('Turn on AI in Settings → AI features first');return;}
    const p=projectById(pid),c=clientById(p.clientId),co=p.closeout||(p.closeout={});
    openModal('AI review &amp; testimonial',`<div id="rv-out" class="hint">${ico('clock')} Writing…</div>`,`<button class="btn" onclick="closeModal()">Close</button>`,true);
    try{
      const sys='You are a Filipino creative freelancer asking a happy client for a review at the goodwill peak (delivered & paid). Return ONLY JSON: {"ask":string (a warm Taglish message asking for a Facebook/Google review and sharing a referral code),"testimonial":string (a short first-person testimonial draft the client can edit and post, sounding like a real PH client)}.';
      const usr=`Client: ${c?c.name:'(client)'}.\nProject: ${p.title} (${p.type}).\nStudio: ${state.settings.businessName}.\nReferral code: ${co.referralCode||'(none)'}.\nFacebook: facebook.com/${(state.settings.fbPage||state.settings.businessName.replace(/\s+/g,''))}`;
      const reply=await aiChat('followup',[{role:'system',content:sys},{role:'user',content:usr}],{temperature:0.6,max_tokens:600});
      const j=aiParseJSON(reply)||{};
      const host=document.getElementById('rv-out');
      if(host)host.outerHTML=`<div class="field"><label>Review request — to send the client</label><textarea class="input" id="rv-ask" style="min-height:140px;font-size:13px;line-height:1.5">${esc(j.ask||'')}</textarea><button class="btn btn-sm btn-block" style="margin-top:6px" onclick="navigator.clipboard&&navigator.clipboard.writeText(document.getElementById('rv-ask').value);App.toast('Copied')">${ico('copy')} Copy ask</button></div>
        <div class="field" style="margin-top:10px"><label>Suggested testimonial — client can edit &amp; post</label><textarea class="input" id="rv-test" style="min-height:110px;font-size:13px;line-height:1.5">${esc(j.testimonial||'')}</textarea><button class="btn btn-sm btn-block" style="margin-top:6px" onclick="navigator.clipboard&&navigator.clipboard.writeText(document.getElementById('rv-test').value);App.toast('Copied')">${ico('copy')} Copy testimonial</button></div>`;
      co.reviewRequested=true;save();
    }catch(e){App._aiErr('rv-out',e);}
  },

  /* settings / data */
  saveSettings(){const s=state.settings;s.businessName=$('#set-name').value;s.email=$('#set-email').value;s.address=$('#set-addr').value;s.fbPage=$('#set-fbpage').value;s.currency=$('#set-cur').value||'₱';s.currencyCode=$('#set-code').value||'PHP';s.paymentTerms=Number($('#set-terms').value)||15;toast('Settings saved',true);commit();},
  savePayments(){const p=state.settings.pay;p.gcashName=$('#pay-gname').value;p.gcashNumber=$('#pay-gnum').value;p.mayaNumber=$('#pay-maya').value;p.bankName=$('#pay-bank').value;p.bankAccount=$('#pay-acct').value;state.settings.payLink=$('#pay-link').value;toast('Payment details saved',true);commit();},
  saveAI(){const a=state.settings.ai||(state.settings.ai=aiDefaults());a.enabled=$('#ai-enabled').checked;a.proxyUrl=$('#ai-proxy').value.trim()||'http://127.0.0.1:8787';a.models=a.models||{};a.models.vision=$('#ai-m-vision').value.trim();a.models.followup=$('#ai-m-followup').value.trim();a.models.scope=$('#ai-m-scope').value.trim();toast('AI settings saved',true);commit();},
  async testAI(){const btn=$('#ai-test'),note=$('#ai-test-note');if(btn){btn.disabled=true;btn.textContent='Testing…';}
    try{const url=($('#ai-proxy').value.trim()||'http://127.0.0.1:8787').replace(/\/+$/,'');
      const r=await fetch(url+'/health');if(!r.ok)throw new Error('proxy returned '+r.status);
      if(note)note.innerHTML='<span style="color:var(--accent-soft-fg)">'+ico('check')+' Proxy reachable and the key is loaded. Save, then try a screenshot or AI draft.</span>';
    }catch(e){if(note)note.innerHTML='<span style="color:var(--red)">'+ico('alertT')+' Cannot reach the proxy. Run <code>node ai-proxy.mjs</code> in the project folder first. ('+esc(String(e.message||e))+')</span>';}
    finally{if(btn){btn.disabled=false;btn.textContent='Test connection';}}},
  exportData(){try{state.settings.lastBackup=iso(todayD());save();
    const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='invoice-studio-backup-'+iso(todayD())+'.json';document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Backup downloaded',true);render();}catch(e){toast('Backup failed');}},
  importData(ev){const f=ev.target.files&&ev.target.files[0];if(!f)return;const r=new FileReader();
    r.onload=()=>{try{const data=migrate(JSON.parse(r.result));if(!data||!data.settings||!Array.isArray(data.projects))throw 0;
      openConfirm('Restore this backup?','This replaces all current data with the file contents. Export your current data first if unsure.',()=>{state=data;toast('Backup restored',true);go('#/');commit();},true);
    }catch(e){toast('That file is not a valid Invoice Studio backup');}};
    r.readAsText(f);ev.target.value='';},
  uploadQR(ev){const f=ev.target.files&&ev.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{state.settings.pay.qr=r.result;toast('QR uploaded',true);commit();};r.readAsDataURL(f);},
  resetDemo(){openConfirm('Reset to demo data?','This replaces everything with the seeded demo studio.',()=>{state=seed();toast('Demo data restored',true);go('#/');commit();});},
  wipe(){openConfirm('Wipe all data?','This clears everything and cannot be undone.',()=>{const s=seed().settings;state={settings:s,clients:[],projects:[],invoices:[]};state.settings.invoiceSeq=1000;toast('All data wiped');go('#/');commit();},true);},
};

/* ============================== BOOT ============================== */
(function(){
  let th=null;try{th=localStorage.getItem('is_theme');}catch(e){}
  if(!th)th=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  document.documentElement.setAttribute('data-theme',th);
})();
state=load()||seed();
render();
