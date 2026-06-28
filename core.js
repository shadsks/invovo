"use strict";
/* ============================== ICONS (uniform 1.75 stroke) ============================== */
const I={
  bolt:'<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
  doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15H4a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 6 9.4a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 11 4.6V4a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 11H20a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  alertT:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  arrowL:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
  send:'<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
  trash:'<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  receipt:'<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
  layers:'<path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
  scale:'<path d="M12 3v18M5 21h14M7 7l-4 7h8L7 7zM17 7l-4 7h8l-4-7z"/>',
  money:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  trend:'<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
  flame:'<path d="M12 2c1 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-2-1-3-1-5 0-1 0-2 0-3z"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  link:'<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/>',
  copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  wallet:'<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M16 12h.01M3 9h18"/>',
  qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h.01M21 17v4M17 21h4"/>',
  gauge:'<path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M3.5 18a9 9 0 1 1 17 0"/><path d="m13.4 12.6 4-4"/>',
  split:'<path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7"/>',
  arrowUp:'<path d="M12 19V5M5 12l7-7 7 7"/>',
  zap:'<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>',
  star:'<path d="M12 2l3 6.5 7 .9-5 4.7 1.3 6.9L12 17.8 5.4 21l1.3-6.9-5-4.7 7-.9L12 2z"/>',
  cards:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  chat:'<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  database:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5M3 12a9 3 0 0 0 18 0"/>',
};
function ico(n,c){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ${c?`class="${c}"`:''}>${I[n]||''}</svg>`;}

const LEVERAGE=[
  {t:'Friendly reminder',d:'A polite nudge that the invoice is past due.'},
  {t:'Re-apply watermark to delivered files',d:'Watermarks return to the gallery or review link until payment clears.'},
  {t:'Revoke gallery / review access',d:'The client loses access to the deliverable entirely.'},
  {t:'Formal final notice',d:'A written demand before the account moves to collections.'},
];
const TURNAROUND=[
  {v:'standard',l:'Standard, 2 to 3 weeks',pct:0},
  {v:'1week',l:'1-week delivery',pct:20},
  {v:'48h',l:'48-hour rush',pct:35},
  {v:'sde',l:'Same-Day Edit (SDE)',pct:50},
];
const PAY_METHODS=[{v:'gcash',l:'GCash'},{v:'maya',l:'Maya'},{v:'instapay',l:'InstaPay'},{v:'pesonet',l:'PESONet'},{v:'bank',l:'Bank transfer'}];
function payMethodLabel(v){return (PAY_METHODS.find(m=>m.v===v)||{l:v}).l;}
function payMethodPill(v){const c=v==='gcash'?'pill-blue':v==='maya'?'pill-accent':'pill-neutral';return `<span class="pill ${c}">${esc(payMethodLabel(v))}</span>`;}
/* Outbound channels PH clients actually use. Deep links, no backend. */
const SEND_CHANNELS=[
  {v:'messenger',l:'Messenger',ico:'chat'},
  {v:'viber',l:'Viber',ico:'send'},
  {v:'sms',l:'SMS',ico:'doc'},
  {v:'email',l:'Email',ico:'send'},
];
function sendLink(channel,text,opts){
  opts=opts||{};const t=encodeURIComponent(text||'');
  const phone=(opts.phone||'').replace(/[^\d+]/g,'');
  if(channel==='messenger')return state.settings.fbPage?`https://m.me/${encodeURIComponent(state.settings.fbPage)}`:'https://www.messenger.com/';
  if(channel==='viber')return `viber://forward?text=${t}`;
  if(channel==='sms')return `sms:${phone}${/iPhone|iPad|Mac/.test(navigator.userAgent)?'&':'?'}body=${t}`;
  if(channel==='email')return `mailto:${encodeURIComponent(opts.email||'')}?subject=${encodeURIComponent(opts.subject||'')}&body=${t}`;
  return '#';
}
/* Parse a pasted GCash / Maya "paid na po" text for a reference no. + amount. */
function parsePaymentText(txt){
  txt=String(txt||'');
  const refM=txt.match(/(?:ref(?:erence)?(?:\s*(?:no|number|#))?\.?\s*:?\s*)([A-Z0-9]{6,})/i)||txt.match(/\b([A-Z]{0,3}\d{7,})\b/);
  const amtM=txt.match(/(?:php|₱|p)\s*([\d,]+(?:\.\d{1,2})?)/i)||txt.match(/\b([\d,]{3,}(?:\.\d{2})?)\b/);
  let method='';if(/gcash/i.test(txt))method='gcash';else if(/maya|paymaya/i.test(txt))method='maya';else if(/instapay/i.test(txt))method='instapay';else if(/pesonet/i.test(txt))method='pesonet';
  return {ref:refM?refM[1].toUpperCase():'',amount:amtM?Number(amtM[1].replace(/,/g,'')):0,method};
}

/* ============================== AI (NVIDIA NIM via local key-hiding proxy) ============================== */
/* The browser never sees the NVIDIA key. It talks to a local proxy (ai-proxy.mjs) that holds the
   key and forwards to NVIDIA's OpenAI-compatible endpoint. See AI settings + ai-proxy.mjs. */
function aiCfg(){return (state&&state.settings&&state.settings.ai)||{};}
function aiReady(){const a=aiCfg();return !!(a.enabled&&a.proxyUrl);}
function aiModel(role){const a=aiCfg();return (a.models&&a.models[role])||'';}
async function aiChat(role,messages,opts){
  opts=opts||{};const a=aiCfg();
  if(!a.proxyUrl)throw new Error('No AI proxy URL set (Settings → AI features).');
  const model=opts.model||aiModel(role);
  if(!model)throw new Error('No model configured for "'+role+'" (Settings → AI features).');
  const res=await fetch(a.proxyUrl.replace(/\/+$/,'')+'/v1/chat/completions',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model,messages,temperature:opts.temperature==null?0.2:opts.temperature,max_tokens:opts.max_tokens||1024})});
  if(!res.ok){let t='';try{t=await res.text();}catch(e){}throw new Error('AI '+res.status+': '+String(t).slice(0,300));}
  const data=await res.json();
  return (data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content)||'';
}
/* Pull the first JSON object out of a model reply (tolerates ```json fences and stray prose). */
function aiParseJSON(txt){
  txt=String(txt||'').trim();
  const fence=txt.match(/```(?:json)?\s*([\s\S]*?)```/i);if(fence)txt=fence[1].trim();
  const s=txt.indexOf('{'),e=txt.lastIndexOf('}');
  if(s>=0&&e>s)txt=txt.slice(s,e+1);
  try{return JSON.parse(txt);}catch(err){return null;}
}
/* Served from a real http(s) host (e.g. Vercel) → talk to the same-origin /api function.
   Run locally (file:// or localhost) → talk to the local ai-proxy.mjs on :8787. */
function aiProxyDefault(){try{if(typeof location!=='undefined'&&/^https?:$/.test(location.protocol)&&!/^(127\.0\.0\.1|localhost)$/.test(location.hostname))return '/api';}catch(e){}return 'http://127.0.0.1:8787';}
function aiDefaults(){return {enabled:false,proxyUrl:aiProxyDefault(),models:{
  vision:'nvidia/nemotron-nano-12b-v2-vl',followup:'meta/llama-3.3-70b-instruct',scope:'nvidia/llama-3.3-nemotron-super-49b-v1'}};}
/* Slugs that shipped as defaults but don't resolve on NVIDIA — remap to verified-working ids. */
const AI_SLUG_FIXES={'deepseek-ai/deepseek-v4-pro':'meta/llama-3.3-70b-instruct','qwen/qwen3.5-122b-a10b':'nvidia/llama-3.3-nemotron-super-49b-v1'};

/* ============================== UTIL ============================== */
const uid=p=>(p||'id')+'_'+Math.random().toString(36).slice(2,9);
const $=s=>document.querySelector(s);
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fmt(n){const cur=(state&&state.settings&&state.settings.currency)||'₱';return cur+Number(n||0).toLocaleString('en-US',{maximumFractionDigits:0});}
function todayD(){const d=new Date();d.setHours(0,0,0,0);return d;}
function parseD(s){if(s instanceof Date)return s;const d=new Date(s+'T00:00:00');return isNaN(d)?todayD():d;}
function iso(d){d=d instanceof Date?d:parseD(d);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function addDays(d,n){d=new Date(parseD(d));d.setDate(d.getDate()+n);return d;}
function addMonths(d,n){d=new Date(parseD(d));const day=d.getDate();d.setMonth(d.getMonth()+n);if(d.getDate()<day)d.setDate(0);return d;}
function daysBetween(a,b){return Math.round((parseD(b)-parseD(a))/86400000);}
function fmtDate(s){if(!s)return 'not set';return parseD(s).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});}
function relDays(n){if(n===0)return 'today';if(n===1)return 'in 1 day';if(n>1)return 'in '+n+' days';if(n===-1)return '1 day ago';return Math.abs(n)+' days ago';}
function hoursBetween(t1,t2){const[a,b]=t1.split(':').map(Number);const[c,d]=t2.split(':').map(Number);let m=(c*60+d)-(a*60+b);if(m<0)m+=1440;return m/60;}
function monthLabel(d){return parseD(d).toLocaleDateString('en-US',{month:'short'});}

/* ============================== STATE ============================== */
const LS_KEY='invoice_studio_v4';
let state=null;
function defaultLadder(){return[{minDaysOut:14,pct:25},{minDaysOut:7,pct:50},{minDaysOut:2,pct:75},{minDaysOut:0,pct:100}];}

function seed(){
  const t=todayD();
  const clients=[
    {id:'c_kape',name:'Andrea Salazar',company:'Kape Republik',email:'andrea@kaperepublik.ph',address:'Legaspi Village, Makati City',phone:'0917 555 0142',referredBy:''},
    {id:'c_atlas',name:'Marco Reyes',company:'Atlas Land Group',email:'marco@atlasland.ph',address:'9th Ave, BGC, Taguig City',phone:'0917 555 0188',referredBy:''},
    {id:'c_maple',name:'Dana Cole',company:'Maple & Co',email:'dana@mapleco.ph',address:'Cebu IT Park, Cebu City',phone:'0917 555 0199',referredBy:''},
    {id:'c_cruz',name:'Patricia Cruz',company:'',email:'patricia.cruz@gmail.com',address:'Loyola Heights, Quezon City',phone:'0917 555 0210',referredBy:''},
    {id:'c_lim',name:'Bianca Lim',company:'',email:'bianca.lim@gmail.com',address:'Kapitolyo, Pasig City',phone:'0917 555 0222',referredBy:'HABI-AND15'},
  ];
  const projects=[
    {id:'p_kape',clientId:'c_kape',title:'Kape Republik "Summer Pour"',type:'photo',
     shootDate:iso(addDays(t,-40)),status:'delivered',creativeFee:82000,hoursLogged:9,
     turnaround:{tier:'standard',billed:false},installments:[],
     cancellationLadder:defaultLadder(),
     revision:{included:2,perRoundFee:4500,rounds:[{n:1,date:iso(addDays(t,-30)),note:'Color round'},{n:2,date:iso(addDays(t,-28)),note:'Crop tweaks'}]},
     overtime:{dayRate:82000,halfDayRate:45000,thresholdHours:10,multiplier:1.5,callTime:'',wrapTime:''},
     passThroughs:[
       {id:uid('pt'),label:'Studio rental (Daylight A)',category:'Studio',cost:15000,markupPct:15,billable:true},
       {id:uid('pt'),label:'Camera + lighting package',category:'Equipment',cost:22000,markupPct:0,billable:true},
       {id:uid('pt'),label:'Catering (crew of 6)',category:'Catering',cost:5500,markupPct:0,billable:true},
     ],
     deliverable:{type:'Gallery (Pixieset)',url:'https://gallery.example/kape-summer',locked:false,watermarked:false,opened:true,downloads:3,lastViewed:iso(addDays(t,-17))},
     milestones:[],changeOrders:[],collaborators:[],closeout:{referralCode:'HABI-AND15',reviewRequested:false}},
    {id:'p_atlas',clientId:'c_atlas',title:'Atlas Land Brand Film Series',type:'video',
     shootDate:iso(addDays(t,-45)),status:'delivered',creativeFee:165000,hoursLogged:64,
     turnaround:{tier:'1week',billed:false},installments:[],
     cancellationLadder:defaultLadder(),
     revision:{included:2,perRoundFee:11000,rounds:[
       {n:1,date:iso(addDays(t,-20)),note:'Rough cut notes'},
       {n:2,date:iso(addDays(t,-12)),note:'Music and pacing'},
       {n:3,date:iso(addDays(t,-3)),note:'New CTA end-card (out of scope)',overage:true},
     ]},
     overtime:{dayRate:110000,halfDayRate:62000,thresholdHours:10,multiplier:1.5,callTime:'07:30',wrapTime:'20:15'},
     passThroughs:[{id:uid('pt'),label:'Drone operator (1 day)',category:'Crew',cost:12000,markupPct:10,billable:true}],
     deliverable:{type:'Frame.io review link',url:'https://f.io/atlas-brand-v3',locked:true,watermarked:true,opened:true,downloads:2,lastViewed:iso(addDays(t,-19))},
     milestones:[
       {id:uid('ms'),label:'Deposit',amount:49500,status:'invoiced'},
       {id:uid('ms'),label:'Rough cut delivered',amount:66000,status:'pending'},
       {id:uid('ms'),label:'Final delivery',amount:49500,status:'pending'},
     ],
     changeOrders:[{id:uid('co'),desc:'Add 30s social cutdown',amount:18000,status:'approved',billed:false}],
     collaborators:[
       {id:uid('cl'),name:'Sofia Marin',role:'Second shooter',cutType:'pct',cutValue:12,paidOut:false},
       {id:uid('cl'),name:'Diego Ortiz',role:'Editor',cutType:'flat',cutValue:28000,paidOut:false},
     ],closeout:{referralCode:'HABI-MAR21',reviewRequested:false}},
    {id:'p_maple',clientId:'c_maple',title:'Maple & Co Monthly Social Retainer',type:'retainer',
     shootDate:'',status:'active',creativeFee:0,hoursLogged:0,turnaround:{tier:'standard',billed:false},installments:[],
     cancellationLadder:defaultLadder(),revision:{included:0,perRoundFee:0,rounds:[]},
     overtime:{dayRate:0,halfDayRate:0,thresholdHours:10,multiplier:1.5,callTime:'',wrapTime:''},
     passThroughs:[],deliverable:{type:'',url:'',locked:false,watermarked:false},milestones:[],changeOrders:[],collaborators:[],
     retainer:{period:'June 2026',allowanceUnit:'short-form videos',allowanceQty:10,rate:65000,overageRate:5500,lastRaise:iso(addMonths(t,-14)),raiseMonths:12,consumed:[
       {id:uid('rc'),date:iso(addDays(t,-22)),qty:4,note:'Launch week batch'},
       {id:uid('rc'),date:iso(addDays(t,-14)),qty:4,note:'Product drop'},
       {id:uid('rc'),date:iso(addDays(t,-5)),qty:4,note:'Founder Q&A series'},
     ]}},
    {id:'p_wedding',clientId:'c_cruz',title:'Patricia & Miguel Wedding Film',type:'video',
     shootDate:iso(addDays(t,-10)),status:'delivered',creativeFee:85000,hoursLogged:18,
     turnaround:{tier:'sde',billed:true},
     installments:[
       {id:uid('in'),label:'Reservation',amount:30000,dueDate:iso(addDays(t,-60)),status:'paid',gate:false,method:'gcash',paidRef:'GC7741209',paidDate:iso(addDays(t,-58)),reminderSent:false},
       {id:uid('in'),label:'Mid-payment',amount:40000,dueDate:iso(addDays(t,4)),status:'pending',gate:false,reminderSent:false},
       {id:uid('in'),label:'Balance before release',amount:57500,dueDate:iso(addDays(t,9)),status:'pending',gate:true,reminderSent:false},
     ],
     cancellationLadder:defaultLadder(),revision:{included:2,perRoundFee:6000,rounds:[]},
     overtime:{dayRate:85000,halfDayRate:48000,thresholdHours:12,multiplier:1.5,callTime:'',wrapTime:''},
     passThroughs:[],deliverable:{type:'Gallery + SDE link',url:'https://gallery.example/cruz-wedding',locked:true,watermarked:true,opened:true,downloads:1,lastViewed:iso(addDays(t,-9))},
     milestones:[],changeOrders:[],collaborators:[
       {id:uid('cl'),name:'Joaquin Tan',role:'Second shooter',cutType:'flat',cutValue:12000,paidOut:false},
     ],closeout:{referralCode:'HABI-PAT08',reviewRequested:false}},
    {id:'p_debut',clientId:'c_lim',title:"Bianca's 18th Debut",type:'photo',
     shootDate:iso(addDays(t,14)),status:'booked',creativeFee:45000,hoursLogged:0,
     turnaround:{tier:'48h',billed:false},
     installments:[
       {id:uid('in'),label:'Reservation',amount:15000,dueDate:iso(addDays(t,-5)),status:'paid',gate:false,method:'maya',paidRef:'MY5582910',paidDate:iso(addDays(t,-5)),reminderSent:false},
       {id:uid('in'),label:'Balance on shoot day',amount:30000,dueDate:iso(addDays(t,14)),status:'pending',gate:true,reminderSent:false},
     ],
     cancellationLadder:defaultLadder(),revision:{included:2,perRoundFee:3000,rounds:[]},
     overtime:{dayRate:45000,halfDayRate:25000,thresholdHours:8,multiplier:1.5,callTime:'',wrapTime:''},
     passThroughs:[],deliverable:{type:'',url:'',locked:true,watermarked:true},milestones:[],changeOrders:[],collaborators:[],closeout:{referralCode:'HABI-BIA31',reviewRequested:false},
     reschedulePolicy:{freeCount:1,reblockFee:6000},
     reschedules:[{id:uid('rs'),date:iso(addDays(t,-3)),from:iso(addDays(t,7)),to:iso(addDays(t,14)),reason:'typhoon',note:'Signal #2, venue flooded',billed:false}],
     splitPayers:[
       {id:uid('sp'),name:'Bianca Lim',share:15000,status:'paid',method:'gcash',ref:'GC9087712',paidDate:iso(addDays(t,-4))},
       {id:uid('sp'),name:'Ninang Tessa',share:7500,status:'pending',method:'',ref:''},
       {id:uid('sp'),name:'Ninong Rey',share:7500,status:'pending',method:'',ref:''},
     ]},
  ];
  const invoices=[
    {id:uid('inv'),number:'INV-1014',projectId:'p_kape',clientId:'c_kape',type:'standard',
     issueDate:iso(addDays(t,-30)),dueDate:iso(addDays(t,0)),status:'paid',paidDate:iso(addDays(t,-18)),
     payment:{method:'gcash',ref:'GC8842137',date:iso(addDays(t,-18))},
     lineItems:[
       {kind:'creative',label:'Creative / production fee',detail:'Half-day campaign shoot, 12 finished images',qty:1,rate:82000,amount:82000},
       {kind:'passthrough',label:'Studio rental (Daylight A)',detail:'Reimbursable plus 15% coordination',qty:1,rate:17250,amount:17250},
       {kind:'passthrough',label:'Camera + lighting package',detail:'Reimbursable at cost',qty:1,rate:22000,amount:22000},
       {kind:'passthrough',label:'Catering (crew of 6)',detail:'Reimbursable at cost',qty:1,rate:5500,amount:5500},
     ],notes:''},
    {id:uid('inv'),number:'INV-1021',projectId:'p_atlas',clientId:'c_atlas',type:'milestone',
     issueDate:iso(addDays(t,-38)),dueDate:iso(addDays(t,-23)),status:'sent',
     lineItems:[{kind:'milestone',label:'Milestone 1, Deposit',detail:'30% of project value to begin',qty:1,rate:49500,amount:49500}],notes:''},
    {id:uid('inv'),number:'INV-0992',projectId:'p_atlas',clientId:'c_atlas',type:'standard',
     issueDate:iso(addDays(t,-120)),dueDate:iso(addDays(t,-90)),status:'paid',paidDate:iso(addDays(t,-66)),payment:{method:'instapay',ref:'IP330021',date:iso(addDays(t,-66))},
     lineItems:[{kind:'creative',label:'Scout day + treatment',detail:'Pre-production',qty:1,rate:32000,amount:32000}],notes:''},
    {id:uid('inv'),number:'INV-0961',projectId:'p_atlas',clientId:'c_atlas',type:'standard',
     issueDate:iso(addDays(t,-200)),dueDate:iso(addDays(t,-170)),status:'paid',paidDate:iso(addDays(t,-150)),payment:{method:'bank',ref:'BPI-99210',date:iso(addDays(t,-150))},
     lineItems:[{kind:'creative',label:'Brand stills, Q1',detail:'Half day',qty:1,rate:48000,amount:48000}],notes:''},
  ];
  return {schema:5,settings:{businessName:'Habi Studios',email:'hello@habistudios.ph',address:'Unit 5 Brixton Lane, Kapitolyo, Pasig City',currency:'₱',currencyCode:'PHP',invoiceSeq:1022,paymentTerms:15,
    fbPage:'habistudios',payLink:'',lastBackup:'',ai:aiDefaults(),
    pay:{gcashName:'Habi Studios',gcashNumber:'0917 555 0142',mayaNumber:'0998 555 0142',bankName:'BPI',bankAccount:'1234 5678 90',qr:''}},clients,projects,invoices};
}
function load(){try{const r=localStorage.getItem(LS_KEY);if(r)return migrate(JSON.parse(r));}catch(e){}return null;}
/* Backfill fields added in newer schema versions so old saves keep working. */
function migrate(st){
  if(!st||!st.settings)return st;
  const s=st.settings;
  if(s.fbPage==null)s.fbPage=(s.businessName||'').replace(/\s+/g,'').toLowerCase();
  if(s.payLink==null)s.payLink='';
  if(s.lastBackup==null)s.lastBackup='';
  delete s.taxRate;delete s.taxLabel;/* tax/VAT removed */
  if(!s.ai)s.ai=aiDefaults();else{const d=aiDefaults();if(s.ai.proxyUrl==null)s.ai.proxyUrl=d.proxyUrl;if(typeof s.ai.enabled!=='boolean')s.ai.enabled=false;if(!s.ai.models)s.ai.models={};['vision','followup','scope'].forEach(k=>{if(s.ai.models[k]==null)s.ai.models[k]=d.models[k];if(AI_SLUG_FIXES[s.ai.models[k]])s.ai.models[k]=AI_SLUG_FIXES[s.ai.models[k]];});}
  (st.clients||[]).forEach(c=>{if(c.phone==null)c.phone='';if(c.referredBy==null)c.referredBy='';});
  (st.projects||[]).forEach(p=>{
    if(!p.reschedulePolicy)p.reschedulePolicy={freeCount:1,reblockFee:0};
    if(!Array.isArray(p.reschedules))p.reschedules=[];
    if(!Array.isArray(p.splitPayers))p.splitPayers=[];
    if(!Array.isArray(p.changeOrders))p.changeOrders=[];
    if(!Array.isArray(p.collaborators))p.collaborators=[];
    if(!Array.isArray(p.milestones))p.milestones=[];
    if(!Array.isArray(p.passThroughs))p.passThroughs=[];
    if(!Array.isArray(p.installments))p.installments=[];
    if(!p.deliverable)p.deliverable={type:'',url:'',locked:true,watermarked:true};
    if(!p.closeout)p.closeout={referralCode:'',reviewRequested:false};
  });
  st.schema=5;
  return st;
}
function save(){try{localStorage.setItem(LS_KEY,JSON.stringify(state));}catch(e){}}
function commit(){save();render();}

const clientById=id=>state.clients.find(c=>c.id===id);
const projectById=id=>state.projects.find(p=>p.id===id);
const invoiceById=id=>state.invoices.find(i=>i.id===id);
const projectInvoices=pid=>state.invoices.filter(i=>i.projectId===pid);
function clientLabel(id){const c=clientById(id);return c?(c.company||c.name):'Unknown';}

/* ============================== CALCS ============================== */
function killFee(p,cancelISO){
  const daysOut=daysBetween(cancelISO,p.shootDate);
  const tiers=[...(p.cancellationLadder||defaultLadder())].sort((a,b)=>b.minDaysOut-a.minDaysOut);
  const tier=tiers.find(t=>daysOut>=t.minDaysOut)||tiers[tiers.length-1];
  return {daysOut,pct:tier.pct,fee:Math.round(Number(p.creativeFee||0)*tier.pct/100)};
}
function computeOT(o){
  if(!o||!o.callTime||!o.wrapTime)return null;
  const hrs=hoursBetween(o.callTime,o.wrapTime);
  const thr=Number(o.thresholdHours)||10,dr=Number(o.dayRate)||0;
  const otHours=Math.max(0,hrs-thr),hourly=dr/thr;
  return {hours:+hrs.toFixed(2),otHours:+otHours.toFixed(2),hourly:Math.round(hourly),otFee:Math.round(otHours*hourly*(Number(o.multiplier)||1.5))};
}
function retainerStats(p){
  const r=p.retainer;if(!r)return null;
  const used=(r.consumed||[]).reduce((s,c)=>s+Number(c.qty||0),0);
  const remaining=Number(r.allowanceQty)-used,over=Math.max(0,-remaining);
  return {used,remaining,over,overFee:over*Number(r.overageRate||0)};
}
function invoiceTotal(inv){
  const sub=inv.lineItems.reduce((s,li)=>s+Number(li.amount||0),0);
  return {sub,total:sub};
}
function invoiceStatus(inv){
  if(inv.status==='paid')return 'paid';
  if(inv.status==='sent'&&daysBetween(inv.dueDate,todayD())>0)return 'overdue';
  return inv.status;
}
function daysOverdue(inv){return Math.max(0,daysBetween(inv.dueDate,todayD()));}
function leverageStage(d){if(d<=0)return -1;if(d<=3)return 0;if(d<=10)return 1;if(d<=21)return 2;return 3;}
function createInvoice(p,type,lineItems){
  const num='INV-'+(state.settings.invoiceSeq++);
  const inv={id:uid('inv'),number:num,projectId:p.id,clientId:p.clientId,type,issueDate:iso(todayD()),dueDate:iso(addDays(todayD(),state.settings.paymentTerms)),status:'draft',lineItems,notes:''};
  state.invoices.push(inv);return inv;
}
function holdState(p){
  if(!p.hold)return null;
  const depPaid=projectInvoices(p.id).some(i=>i.type==='deposit'&&i.status==='paid');
  if(depPaid)return 'confirmed';
  if(daysBetween(p.hold.deadline,todayD())>0)return 'released';
  return 'tentative';
}
/* ---- Turnaround / SDE rush ---- */
function turnaroundRow(p){return TURNAROUND.find(x=>x.v===(p.turnaround&&p.turnaround.tier))||TURNAROUND[0];}
function turnaroundFee(p){return Math.round(Number(p.creativeFee||0)*turnaroundRow(p).pct/100);}
/* ---- Installments (hulugan) ---- */
function installmentStats(p){
  const plan=p.installments||[];if(!plan.length)return null;
  const total=plan.reduce((s,i)=>s+Number(i.amount||0),0);
  const paid=plan.filter(i=>i.status==='paid').reduce((s,i)=>s+Number(i.amount||0),0);
  const next=plan.filter(i=>i.status!=='paid').sort((a,b)=>parseD(a.dueDate)-parseD(b.dueDate))[0]||null;
  const gateUnpaid=plan.some(i=>i.gate&&i.status!=='paid');
  return {total,paid,remaining:total-paid,next,gateUnpaid,count:plan.length,paidCount:plan.filter(i=>i.status==='paid').length};
}
/* ---- Closeout / review ---- */
function projectUnpaid(p){return projectInvoices(p.id).some(i=>['sent','overdue'].includes(invoiceStatus(i)));}
function fullyDelivered(p){
  const inst=installmentStats(p);
  const instClear=!inst||inst.remaining<=0;
  const sp=splitStats(p);const splitClear=!sp||sp.allPaid;
  return ['delivered','wrapped'].includes(p.status)&&!projectUnpaid(p)&&instClear&&splitClear&&!!(p.deliverable&&p.deliverable.url);
}
function reviewDue(p){return fullyDelivered(p)&&p.closeout&&!p.closeout.reviewRequested;}
/* ---- Client Payment-Risk Score ---- */
function clientRisk(id){
  const paid=state.invoices.filter(i=>i.clientId===id&&i.status==='paid'&&i.paidDate);
  if(!paid.length)return {tier:'new',label:'No history',cls:'pill-neutral',level:0,avg:null,advice:'Standard terms until they build a record.'};
  const avg=Math.round(paid.reduce((s,i)=>s+daysBetween(i.dueDate,i.paidDate),0)/paid.length);
  let tier,label,cls,level,advice;
  if(avg<=0){tier='ontime';label='Pays on time';cls='pill-accent';level=1;advice='Standard terms are fine.';}
  else if(avg<=7){tier='watch';label='Slightly late';cls='pill-blue';level=2;advice='Standard terms, send the reminder early.';}
  else if(avg<=20){tier='slow';label='Slow payer';cls='pill-amber';level=3;advice='Require a 30 to 50% reservation, net-14.';}
  else{tier='risk';label='Payment risk';cls='pill-red';level=4;advice='Require 50% reservation up front, net-14, gate the files.';}
  return {tier,label,cls,level,avg,n:paid.length,advice};
}
/* ---- Profitability ---- */
function effectiveRate(p){
  const h=Number(p.hoursLogged||0);if(h<=0)return null;
  let rev=Number(p.creativeFee||0);
  if(p.turnaround&&p.turnaround.billed)rev+=turnaroundFee(p);
  const ot=computeOT(p.overtime);if(ot&&p.overtime.billed)rev+=ot.otFee;
  (p.revision&&p.revision.rounds||[]).forEach(r=>{if(r.overage&&r.billed)rev+=Number(p.revision.perRoundFee);});
  (p.changeOrders||[]).forEach(co=>{if(co.status==='approved')rev+=Number(co.amount);});
  return {rev,hours:h,hourly:Math.round(rev/h)};
}
/* ---- Forecast ---- */
function forecast(){
  const t=todayD(),buckets=[];
  for(let m=0;m<3;m++){
    const start=new Date(t.getFullYear(),t.getMonth()+m,1),end=new Date(t.getFullYear(),t.getMonth()+m+1,1);
    let amt=0;
    state.invoices.forEach(i=>{if(['sent','overdue','draft'].includes(invoiceStatus(i))){const d=parseD(i.dueDate);if(d>=start&&d<end)amt+=invoiceTotal(i).total;}});
    state.projects.forEach(p=>{if(p.retainer)amt+=Number(p.retainer.rate||0);(p.installments||[]).forEach(i=>{if(i.status!=='paid'){const d=parseD(i.dueDate);if(d>=start&&d<end)amt+=Number(i.amount||0);}});});
    buckets.push({label:monthLabel(start),amount:amt});
  }
  return buckets;
}
/* ---- Collaborator payouts ---- */
function projectPayouts(p){const fee=Number(p.creativeFee||0);return (p.collaborators||[]).map(c=>({...c,owed:c.cutType==='pct'?Math.round(fee*Number(c.cutValue)/100):Number(c.cutValue)}));}
function payoutsDue(p){const anyPaid=projectInvoices(p.id).some(i=>i.status==='paid')||(installmentStats(p)&&installmentStats(p).paid>0);if(!anyPaid)return [];return projectPayouts(p).filter(c=>!c.paidOut);}
/* ---- Renewal ratchet ---- */
function renewalDue(p){if(!p.retainer||!p.retainer.lastRaise)return false;return daysBetween(addMonths(p.retainer.lastRaise,Number(p.retainer.raiseMonths||12)),todayD())>=0;}
/* ---- Change orders ---- */
function changeOrdersPending(p){return (p.changeOrders||[]).filter(c=>c.status==='approved'&&!c.billed);}
/* ---- Typhoon / weather reschedules (distinct from a kill fee) ---- */
function rescheduleStats(p){
  const pol=p.reschedulePolicy||{freeCount:1,reblockFee:0};
  const list=p.reschedules||[];const used=list.length;
  const free=Number(pol.freeCount||0),chargeable=Math.max(0,used-free);
  const unbilled=list.filter((r,i)=>i>=free&&!r.billed);
  return {used,free,remaining:Math.max(0,free-used),chargeable,reblockFee:Number(pol.reblockFee||0),unbilled,feeDue:unbilled.length*Number(pol.reblockFee||0)};
}
/* ---- Barkada / multi-payer split (one amount, many payers, all-must-clear gate) ---- */
function splitStats(p){
  const list=p.splitPayers||[];if(!list.length)return null;
  const total=list.reduce((s,x)=>s+Number(x.share||0),0);
  const paid=list.filter(x=>x.status==='paid').reduce((s,x)=>s+Number(x.share||0),0);
  const pending=list.filter(x=>x.status!=='paid');
  return {total,paid,remaining:total-paid,count:list.length,paidCount:list.length-pending.length,pending,allPaid:pending.length===0};
}
/* ---- Risk-based deposit suggestion (wired from clientRisk) ---- */
function suggestedDeposit(clientId){
  const r=clientRisk(clientId);
  const pct=r.level>=4?50:r.level===3?40:r.level===2?30:r.level===1?25:30;
  return {pct,reason:r.advice,tier:r.tier,label:r.label,cls:r.cls};
}
/* ---- Suki / referral conversion tracking ---- */
function referralConversions(){
  const byCode={};
  state.projects.forEach(p=>{(p.closeout&&p.closeout.referralCode)&&(byCode[p.closeout.referralCode]=byCode[p.closeout.referralCode]||{code:p.closeout.referralCode,owner:p.clientId,bookings:0,revenue:0});});
  state.clients.forEach(c=>{
    if(!c.referredBy)return;const code=c.referredBy;byCode[code]=byCode[code]||{code,owner:'',bookings:0,revenue:0};
    const projs=state.projects.filter(p=>p.clientId===c.id);byCode[code].bookings+=projs.length;
    projs.forEach(p=>{byCode[code].revenue+=state.invoices.filter(i=>i.projectId===p.id&&i.status==='paid').reduce((s,i)=>s+invoiceTotal(i).total,0);});
  });
  return Object.values(byCode).filter(x=>x.bookings>0).sort((a,b)=>b.revenue-a.revenue);
}

function projectOpenItems(p){
  let n=0;
  const rev=p.revision;if(rev&&rev.rounds)n+=rev.rounds.filter(r=>r.overage&&!r.billed).length;
  const rs=retainerStats(p);if(rs&&rs.over>0)n++;
  const ot=computeOT(p.overtime);if(ot&&ot.otFee>0&&!p.overtime.billed)n++;
  n+=changeOrdersPending(p).length;
  n+=payoutsDue(p).length;
  const resc=rescheduleStats(p);if(resc.feeDue>0)n++;
  const sp=splitStats(p);if(sp&&!sp.allPaid)n++;
  (p.milestones||[]).forEach(m=>{if(m.status==='ready')n++;});
  if(renewalDue(p))n++;
  const inst=installmentStats(p);if(inst&&inst.next&&daysBetween(todayD(),inst.next.dueDate)<=7)n++;
  if(reviewDue(p))n++;
  projectInvoices(p.id).forEach(i=>{if(invoiceStatus(i)==='overdue')n++;});
  return n;
}

/* ============================== ACTION CENTER ============================== */
function buildAlerts(){
  const alerts=[];
  state.invoices.forEach(inv=>{
    if(invoiceStatus(inv)==='overdue'){
      const d=daysOverdue(inv),st=leverageStage(d);const p=projectById(inv.projectId);
      const recv=p&&p.deliverable&&p.deliverable.opened?` Files downloaded ${relDays(daysBetween(p.deliverable.lastViewed,todayD()))}.`:'';
      alerts.push({sev:st>=2?'red':'amber',icon:'alertT',title:`Invoice ${inv.number} overdue ${d} days`,
        detail:`${clientLabel(inv.clientId)}.${recv} Next leverage step: ${LEVERAGE[st].t}.`,money:invoiceTotal(inv).total,
        actions:[{label:'Open invoice',fn:`go('#/invoice/${inv.id}')`,primary:true},{label:'Record payment',fn:`App.recordPayment('${inv.id}')`}]});
    }
  });
  state.projects.forEach(p=>{
    const inst=installmentStats(p);
    if(inst&&inst.next){const dd=daysBetween(todayD(),inst.next.dueDate);if(dd<=7)alerts.push({sev:dd<0?'red':'amber',icon:'cards',
      title:`Installment ${dd<0?'overdue':'due'}, ${clientLabel(p.clientId)}`,
      detail:`${p.title}. "${inst.next.label}" of ${fmt(inst.next.amount)} ${dd<0?'was due '+relDays(dd):'due '+relDays(dd)}.${inst.next.gate?' Files stay locked until this clears.':''}`,
      money:inst.next.amount,
      actions:[{label:'Send GCash reminder',fn:`App.sendInstallmentReminder('${p.id}','${inst.next.id}')`,primary:true},{label:'Record payment',fn:`App.payInstallment('${p.id}','${inst.next.id}')`}]});}
    if(reviewDue(p))alerts.push({sev:'accent',icon:'star',title:`Ask ${clientLabel(p.clientId)} for a review`,
      detail:`${p.title} is delivered and fully paid. This is the moment to capture a Facebook review and hand out a referral code.`,money:0,
      actions:[{label:'Send review request',fn:`App.requestReview('${p.id}')`,primary:true},{label:'View project',fn:`go('#/project/${p.id}')`}]});
    if(p.turnaround&&p.turnaround.tier!=='standard'&&!p.turnaround.billed&&p.status!=='booked')alerts.push({sev:'blue',icon:'zap',
      title:`Rush surcharge unbilled, ${clientLabel(p.clientId)}`,
      detail:`${p.title} was delivered on ${turnaroundRow(p).l} (+${turnaroundRow(p).pct}%) but the rush premium is not on an invoice.`,money:turnaroundFee(p),
      actions:[{label:'Bill rush surcharge',fn:`App.billRush('${p.id}')`,primary:true},{label:'View project',fn:`go('#/project/${p.id}')`}]});
    const rev=p.revision;if(rev&&rev.rounds){const pend=rev.rounds.filter(r=>r.overage&&!r.billed);
      if(pend.length)alerts.push({sev:'amber',icon:'layers',title:`Revision overage to bill, ${clientLabel(p.clientId)}`,
        detail:`${p.title}. ${pend.length} round(s) beyond the ${rev.included} included, at ${fmt(rev.perRoundFee)} each.`,money:pend.length*Number(rev.perRoundFee),
        actions:[{label:'Bill overage',fn:`App.billRevisionOverage('${p.id}')`,primary:true},{label:'View project',fn:`go('#/project/${p.id}')`}]});}
    changeOrdersPending(p).forEach(co=>alerts.push({sev:'amber',icon:'split',title:`Approved change order to bill, ${clientLabel(p.clientId)}`,
      detail:`${p.title}. "${co.desc}" was approved and is not on an invoice yet.`,money:co.amount,
      actions:[{label:'Bill change orders',fn:`App.billChangeOrders('${p.id}')`,primary:true},{label:'View project',fn:`go('#/project/${p.id}')`}]}));
    const resc=rescheduleStats(p);if(resc.feeDue>0)alerts.push({sev:'amber',icon:'calendar',title:`Re-block fee unbilled, ${clientLabel(p.clientId)}`,
      detail:`${p.title}. ${resc.used} reschedule(s), ${resc.free} free. ${resc.unbilled.length} chargeable move(s) at ${fmt(resc.reblockFee)} to re-hold the date.`,money:resc.feeDue,
      actions:[{label:'Bill re-block fee',fn:`App.billReschedule('${p.id}')`,primary:true},{label:'View project',fn:`go('#/project/${p.id}')`}]});
    const sp=splitStats(p);if(sp&&!sp.allPaid)alerts.push({sev:sp.paid>0?'blue':'amber',icon:'users',title:`Split payment outstanding, ${clientLabel(p.clientId)}`,
      detail:`${p.title}. ${fmt(sp.paid)} of ${fmt(sp.total)} in (${sp.paidCount}/${sp.count} payers). Waiting on ${sp.pending.map(x=>x.name).join(', ')}. Files stay gated until all shares clear.`,money:sp.remaining,
      actions:[{label:'Chase payers',fn:`App.chaseSplit('${p.id}')`,primary:true},{label:'View project',fn:`go('#/project/${p.id}')`}]});
    const rs=retainerStats(p);if(rs&&rs.over>0)alerts.push({sev:'amber',icon:'flame',title:`Retainer over budget, ${clientLabel(p.clientId)}`,
      detail:`${rs.used} of ${p.retainer.allowanceQty} ${p.retainer.allowanceUnit} used (${rs.over} over). Auto-bill at ${fmt(p.retainer.overageRate)} per unit.`,money:rs.overFee,
      actions:[{label:'Bill retainer overage',fn:`App.billRetainerOverage('${p.id}')`,primary:true},{label:'View project',fn:`go('#/project/${p.id}')`}]});
    if(renewalDue(p))alerts.push({sev:'blue',icon:'arrowUp',title:`Rate increase due, ${clientLabel(p.clientId)}`,
      detail:`The ${p.retainer.period} retainer has not had a raise in ${p.retainer.raiseMonths}+ months. Propose a new rate at renewal.`,money:Math.round(p.retainer.rate*0.08),
      actions:[{label:'Propose increase',fn:`App.proposeRaise('${p.id}')`,primary:true},{label:'View project',fn:`go('#/project/${p.id}')`}]});
    const ot=computeOT(p.overtime);if(ot&&ot.otFee>0&&!p.overtime.billed)alerts.push({sev:'blue',icon:'clock',title:`Unbilled shoot overtime, ${clientLabel(p.clientId)}`,
      detail:`${p.title}. Wrapped after ${ot.hours}h (${ot.otHours}h OT at ${fmt(ot.hourly)}/hr times ${p.overtime.multiplier}).`,money:ot.otFee,
      actions:[{label:'Add OT to invoice',fn:`App.billOvertime('${p.id}')`,primary:true},{label:'View project',fn:`go('#/project/${p.id}')`}]});
    const due=payoutsDue(p);if(due.length)alerts.push({sev:'blue',icon:'split',title:`Crew payout owed, ${clientLabel(p.clientId)}`,
      detail:`${p.title} has cleared payment. You owe ${due.length} collaborator(s): ${due.map(c=>c.name).join(', ')}.`,money:due.reduce((s,c)=>s+c.owed,0),
      actions:[{label:'Settle payouts',fn:`App.settlePayouts('${p.id}')`,primary:true},{label:'View project',fn:`go('#/project/${p.id}')`}]});
    (p.milestones||[]).forEach(m=>{if(m.status==='ready')alerts.push({sev:'blue',icon:'check',title:`Milestone ready to invoice, ${clientLabel(p.clientId)}`,
      detail:`${p.title}. "${m.label}" unlocked after the prior deliverable was approved.`,money:m.amount,
      actions:[{label:'Generate milestone invoice',fn:`App.invoiceMilestone('${p.id}','${m.id}')`,primary:true},{label:'View project',fn:`go('#/project/${p.id}')`}]});});
  });
  const order={red:0,amber:1,blue:2,accent:3};
  alerts.sort((a,b)=>(order[a.sev]-order[b.sev])||(Number(b.money||0)-Number(a.money||0)));
  return alerts;
}
