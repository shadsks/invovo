"use strict";
/* ============================== INVOICES ============================== */
function invTypePill(t){const m={standard:['pill-neutral','Standard'],deposit:['pill-blue','Deposit'],'kill-fee':['pill-red','Kill fee'],overage:['pill-amber','Overage'],'retainer-overage':['pill-amber','Retainer OT'],'change-order':['pill-amber','Change order'],milestone:['pill-blue','Milestone'],overtime:['pill-blue','Overtime']};const[c,l]=m[t]||['pill-neutral',t];return `<span class="pill ${c}">${esc(l)}</span>`;}
function invStatusPill(s){const m={draft:['pill-neutral','Draft'],sent:['pill-blue','Sent'],paid:['pill-accent','Paid'],overdue:['pill-red','Overdue']};const[c,l]=m[s]||['pill-neutral',s];return `<span class="pill ${c}">${l==='Paid'?ico('check'):''}${l}</span>`;}
function viewInvoices(){
  const rows=[...state.invoices].sort((a,b)=>parseD(b.issueDate)-parseD(a.issueDate)).map(i=>`
    <tr class="clickable" onclick="go('#/invoice/${i.id}')">
      <td><div style="font-weight:600">${i.number}</div><div class="sub">${fmtDate(i.issueDate)}</div></td>
      <td>${esc(clientLabel(i.clientId))}<div class="sub">${esc((projectById(i.projectId)||{}).title||'')}</div></td>
      <td>${invTypePill(i.type)}</td><td>${invStatusPill(invoiceStatus(i))}</td>
      <td class="num" style="font-weight:600">${fmt(invoiceTotal(i).total)}</td>
    </tr>`).join('');
  const paid=state.invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+invoiceTotal(i).total,0);
  const unpaid=state.invoices.filter(i=>['sent','overdue'].includes(invoiceStatus(i))).reduce((s,i)=>s+invoiceTotal(i).total,0);
  const mx=`<span class="cur">${state.settings.currencyCode}</span>`;
  return `
  <div class="page-head"><div><h1>Invoices</h1><p class="sub">Fee, products, and reimbursables itemized for every project.</p></div><button class="btn btn-primary" onclick="App.newInvoice()">${ico('plus')} New invoice</button></div>
  <div class="grid cols-3 stagger" style="margin-bottom:18px">
    <div class="kpi is-accent"><div class="label">${ico('check')} Collected</div><div class="val">${fmt(paid)}${mx}</div></div>
    <div class="kpi"><div class="label">${ico('send')} Sent and unpaid</div><div class="val">${fmt(unpaid)}${mx}</div></div>
    <div class="kpi"><div class="label">${ico('edit')} Drafts</div><div class="val">${state.invoices.filter(i=>i.status==='draft').length}</div></div>
  </div>
  <div class="card stagger"><table class="tbl">
    <thead><tr><th>Invoice</th><th>Client</th><th>Type</th><th>Status</th><th class="num">Total</th></tr></thead>
    <tbody>${rows||`<tr><td colspan="5"><div class="empty">${ico('doc')}<h4>No invoices yet</h4></div></td></tr>`}</tbody>
  </table></div>`;
}

/* ============================== INVOICE DETAIL ============================== */
function viewInvoice(id){
  const inv=invoiceById(id);if(!inv)return notFound('Invoice');
  const c=clientById(inv.clientId),p=projectById(inv.projectId),st=invoiceStatus(inv),tot=invoiceTotal(inv);
  const groups={
    fee:{title:'Creative / Production',kinds:['creative','milestone','killfee','overtime','overage','change-order'],items:[]},
    goods:{title:'Products & Prints',kinds:['goods'],items:[]},
    reimb:{title:'Reimbursable Pass-Throughs',kinds:['passthrough'],items:[]},
  };
  inv.lineItems.forEach(li=>{for(const g in groups){if(groups[g].kinds.includes(li.kind)){groups[g].items.push(li);break;}}});
  const groupHtml=Object.values(groups).filter(g=>g.items.length).map(g=>{
    const sum=g.items.reduce((s,li)=>s+Number(li.amount),0);
    return `<div class="li-group"><div class="gh"><span>${g.title}</span><span class="mono">${fmt(sum)}</span></div>
      ${g.items.map(li=>`<div class="li"><div class="desc">${esc(li.label)}${li.detail?`<div class="d2">${esc(li.detail)}</div>`:''}</div><div class="amt">${fmt(li.amount)}</div></div>`).join('')}</div>`;}).join('');
  const leverageHtml=st==='overdue'?renderLeverage(inv):'';
  return `
  <a class="back-link" href="#/invoices">${ico('arrowL')} All invoices</a>
  <div class="page-head">
    <div><h1>${inv.number}</h1><p class="sub">${esc(clientLabel(inv.clientId))}, issued ${fmtDate(inv.issueDate)}, due ${fmtDate(inv.dueDate)}</p>
    <div class="tag-row" style="margin-top:10px">${invTypePill(inv.type)} ${invStatusPill(st)}</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${inv.status==='draft'?`<button class="btn" onclick="App.sendInvoice('${inv.id}')">${ico('send')} Mark sent</button>`:''}
      ${inv.status!=='paid'?`<button class="btn btn-accent" onclick="App.markPaid('${inv.id}')">${ico('check')} Mark paid</button>`:''}
      <button class="btn" onclick="App.composeAsk('${inv.clientId}','${inv.id}')">${ico('chat')} Compose ask</button>
      <button class="btn" onclick="window.print()">${ico('download')} Print</button>
      <button class="btn btn-danger" onclick="App.deleteInvoice('${inv.id}')">${ico('trash')}</button>
    </div>
  </div>
  ${leverageHtml}
  ${renderPayment(inv)}
  <div class="doc stagger">
    <div class="doc-top">
      <div class="biz"><strong>${esc(state.settings.businessName)}</strong><br>${esc(state.settings.address)}<br>${esc(state.settings.email)}</div>
      <div class="doc-meta"><div class="n">${inv.number}</div>Issued ${fmtDate(inv.issueDate)}<br>Due ${fmtDate(inv.dueDate)}<br>${invStatusPill(st)}</div>
    </div>
    <div class="bill-grid">
      <div><div class="lbl">Billed to</div><div style="font-weight:600">${esc(c?(c.company||c.name):'Unknown')}</div><div class="muted" style="font-size:13px">${esc(c?c.name:'')}<br>${esc(c?c.address:'')}<br>${esc(c?c.email:'')}</div></div>
      <div><div class="lbl">Project</div><div style="font-weight:600">${esc(p?p.title:'')}</div><div class="muted" style="font-size:13px">${p&&p.shootDate?'Shoot date '+fmtDate(p.shootDate):''}</div></div>
    </div>
    ${groupHtml||'<p class="muted">No line items.</p>'}
    <div class="totals">
      <div class="tr grand"><span>Total due</span><span class="mono">${fmt(tot.total)} ${state.settings.currencyCode}</span></div>
    </div>
    <div class="doc-note">Payment terms: net ${state.settings.paymentTerms} days. Reimbursable pass-throughs are billed at cost. ${p&&p.deliverable&&p.deliverable.url?'Final files release from the deliverable gate automatically on payment.':''}</div>
  </div>`;
}
function renderLeverage(inv){
  const d=daysOverdue(inv),stage=leverageStage(d),p=projectById(inv.projectId);
  const recv=p&&p.deliverable&&p.deliverable.opened?`The client downloaded the files ${relDays(daysBetween(p.deliverable.lastViewed,todayD()))} but has not paid.`:'';
  const steps=LEVERAGE.map((s,i)=>{
    const done=i<stage,active=i===stage;let action='';
    if(active){
      if(i===0)action=`<button class="btn btn-sm" onclick="App.composeAsk('${inv.clientId}','${inv.id}')">${ico('chat')} Draft reminder</button>`;
      if(i===1)action=`<button class="btn btn-sm" onclick="App.leverageWatermark('${inv.id}')">${ico('eye')} Re-apply watermark</button>`;
      if(i===2)action=`<button class="btn btn-sm btn-danger" onclick="App.leverageRevoke('${inv.id}')">${ico('lock')} Revoke access</button>`;
      if(i===3)action=`<button class="btn btn-sm btn-danger" onclick="App.composeAsk('${inv.clientId}','${inv.id}','final')">${ico('doc')} Draft final notice</button>`;
    }
    return `<div class="step ${done?'done':''} ${active?'active':''}"><div class="step-dot">${done?ico('check'):i+1}</div>
      <div class="step-body"><div class="st">${esc(s.t)}</div><div class="sd">${esc(s.d)}</div>${action?`<div style="margin-top:8px">${action}</div>`:''}</div></div>`;
  }).join('');
  return `<div class="card" style="margin-bottom:18px;border-color:var(--red)">
    <div class="card-head" style="background:var(--red-soft);border-radius:var(--r) var(--r) 0 0;border-color:var(--red-soft)"><h3 style="color:var(--red-soft-fg)">${ico('alertT')} Late-payment leverage, ${d} days overdue</h3><span class="pill pill-red">${fmt(invoiceTotal(inv).total)} owed</span></div>
    <div class="card-pad">${recv?`<div class="callout blue" style="margin-bottom:12px">${ico('eye')} ${recv}</div>`:''}<div class="stepper">${steps}</div>${aiReady()?`<button class="btn btn-sm btn-block" style="margin-top:10px" onclick="App.aiReminderLadder('${inv.id}')">${ico('bolt')} AI: draft all 4 reminders</button>`:''}<p class="hint" style="margin-top:8px">Reminders are table stakes. These steps tie payment to file access.</p></div></div>`;
}

/* ---- GCash / Maya QR + proof-of-payment reconciler ---- */
function qrViz(seed){
  seed=String(seed||'pay');let h=2166136261;for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}
  function rnd(){h^=h<<13;h>>>=0;h^=h>>>17;h^=h<<5;h>>>=0;return h/4294967296;}
  const N=21,cell=6,pad=8,size=N*cell+pad*2;let rects='';
  const finder=(x,y)=>{let s='';for(let i=0;i<7;i++)for(let j=0;j<7;j++){const on=(i===0||i===6||j===0||j===6)||(i>=2&&i<=4&&j>=2&&j<=4);if(on)s+=`<rect x="${pad+(x+j)*cell}" y="${pad+(y+i)*cell}" width="${cell}" height="${cell}"/>`;}return s;};
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){if((x<8&&y<8)||(x>=N-8&&y<8)||(x<8&&y>=N-8))continue;if(rnd()>0.52)rects+=`<rect x="${pad+x*cell}" y="${pad+y*cell}" width="${cell}" height="${cell}"/>`;}
  rects+=finder(0,0)+finder(N-7,0)+finder(0,N-7);
  return `<svg viewBox="0 0 ${size} ${size}" width="148" height="148" role="img" aria-label="Payment QR placeholder"><rect width="${size}" height="${size}" rx="10" fill="var(--surface)"/><g fill="var(--fg)">${rects}</g></svg>`;
}
function renderPayment(inv){
  if(inv.status==='paid'){const pm=inv.payment;
    return `<div class="card stagger" style="margin-bottom:18px"><div class="card-pad" style="display:flex;align-items:center;gap:13px">
      <div class="alert-ico accent">${ico('check')}</div>
      <div><div style="font-weight:600">Payment received${pm?' via '+payMethodLabel(pm.method):''}</div><div class="muted" style="font-size:13px">${pm&&pm.ref?'Ref '+esc(pm.ref)+', ':''}${fmtDate(inv.paidDate)}. Reconciled to ${inv.number}.</div></div>
    </div></div>`;}
  if(inv.status==='draft')return '';
  const pay=state.settings.pay||{};
  const qr=pay.qr?`<img src="${esc(pay.qr)}" alt="Payment QR" style="width:148px;height:148px;border-radius:10px;object-fit:cover">`:qrViz(pay.gcashNumber||inv.number);
  return `<div class="card stagger" style="margin-bottom:18px">
    <div class="card-head"><h3>${ico('qr')} Pay this invoice</h3><span class="pill pill-blue">GCash / Maya / InstaPay</span></div>
    <div class="card-pad paygrid">
      <div class="qrwrap">${qr}<div class="muted" style="font-size:11.5px;text-align:center;margin-top:8px;max-width:160px">${pay.qr?'Scan with GCash or Maya':'Demo QR, upload your QR Ph in Settings'}</div></div>
      <div class="paydetails">
        <div class="payrow"><span class="muted">GCash</span><b>${esc(pay.gcashNumber||'set in Settings')}</b><span class="paysub">${esc(pay.gcashName||'')}</span></div>
        <div class="payrow"><span class="muted">Maya</span><b>${esc(pay.mayaNumber||'-')}</b></div>
        <div class="payrow"><span class="muted">${esc(pay.bankName||'Bank')} via InstaPay / PESONet</span><b>${esc(pay.bankAccount||'-')}</b></div>
        <button class="btn btn-primary btn-block" style="margin-top:14px" onclick="App.recordPayment('${inv.id}')">${ico('check')} Record payment, paste reference</button>
        <p class="hint" style="margin-top:8px">Client sent a "paid na po" screenshot? Drop the GCash reference here and it reconciles to this invoice.</p>
      </div>
    </div>
  </div>`;
}

/* ============================== INSIGHTS ============================== */
function viewInsights(){
  const fc=forecast(),maxF=Math.max(1,...fc.map(b=>b.amount));
  const fcHtml=fc.map(b=>`<div class="fc-col"><div class="fc-val">${fmt(b.amount)}</div><div class="fc-bar" style="height:${Math.max(6,Math.round(b.amount/maxF*120))}px"></div><div class="fc-lbl">${b.label}</div></div>`).join('');
  const projs=state.projects.map(p=>({p,er:effectiveRate(p)})).filter(x=>x.er).sort((a,b)=>b.er.hourly-a.er.hourly);
  const profRows=projs.map(x=>`<div class="li" style="grid-template-columns:1fr auto auto;gap:12px">
    <div class="desc"><div style="font-weight:600">${esc(x.p.title)}</div><div class="d2">${esc(clientLabel(x.p.clientId))}, ${x.er.hours}h logged</div></div>
    ${typePill(x.p.type)}<div class="amt" style="color:var(--accent-soft-fg)">${fmt(x.er.hourly)}/hr</div></div>`).join('');
  const byType={};projs.forEach(x=>{(byType[x.p.type]=byType[x.p.type]||[]).push(x.er.hourly);});
  const typeRows=Object.keys(byType).map(t=>{const avg=Math.round(byType[t].reduce((s,v)=>s+v,0)/byType[t].length);return `<div class="li"><div class="desc">${typePill(t)}</div><div class="amt">${fmt(avg)}/hr avg</div></div>`;}).join('');
  const clientRows=state.clients.map(c=>{const r=clientRisk(c.id);return {c,r};}).sort((a,b)=>b.r.level-a.r.level).map(({c,r})=>`
    <div class="li" style="grid-template-columns:1fr auto;gap:12px">
      <div class="desc"><div style="font-weight:600">${esc(c.company||c.name)}</div><div class="d2">${r.avg==null?'No payment history yet':`Pays ${r.avg<=0?Math.abs(r.avg)+' days early':r.avg+' days late'} on average, ${r.n} invoice(s)`}</div>
        <div class="riskmeter">${[1,2,3,4].map(l=>`<i class="${r.level>=l?'on-'+(r.level<=1?'accent':r.level===2?'blue':r.level===3?'amber':'red'):''}"></i>`).join('')}</div></div>
      <div style="text-align:right"><span class="pill ${r.cls}">${r.label}</span><div class="muted" style="font-size:12px;margin-top:5px;max-width:200px">${esc(r.advice)}</div></div>
    </div>`).join('');
  return `
  <div class="page-head"><div><h1>Insights</h1><p class="sub">What each job actually pays you, who pays slow, and what's landing in the bank over the next quarter.</p></div></div>
  <div class="grid cols-2 stagger">
    <div class="card"><div class="card-head"><h3>${ico('trend')} Cash-flow forecast</h3><div style="display:flex;gap:8px;align-items:center">${aiReady()?`<button class="btn btn-ghost btn-sm" onclick="App.aiForecast()">${ico('bolt')} Explain</button>`:''}<span class="pill pill-neutral">next 3 months</span></div></div>
      <div class="card-pad"><div class="fc">${fcHtml}</div><p class="hint" style="margin-top:12px">Projected from unpaid invoices due, active retainers, and tentative deposit holds. Amounts in ${state.settings.currencyCode}.</p></div></div>
    <div class="card"><div class="card-head"><h3>${ico('gauge')} Effective rate by project</h3></div>
      <div class="card-pad" style="padding-top:6px">${profRows||`<div class="empty" style="padding:20px"><p>Log hours on a project to see its real hourly rate.</p></div>`}
      ${typeRows?`<div style="margin-top:14px;border-top:1px solid var(--border);padding-top:6px"><div class="hint" style="margin:6px 0 2px">Average by type</div>${typeRows}</div>`:''}</div></div>
  </div>
  <div class="card stagger" style="margin-top:16px"><div class="card-head"><h3>${ico('gauge')} Client payment-risk</h3>${aiReady()?`<button class="btn btn-ghost btn-sm" onclick="App.aiRiskBriefing()">${ico('bolt')} AI briefing</button>`:''}</div>
    <div class="card-pad" style="padding-top:6px">${clientRows}</div></div>
  ${(()=>{const conv=referralConversions();if(!conv.length)return '';
    const rows=conv.map(x=>`<div class="li" style="grid-template-columns:1fr auto auto;gap:12px">
      <div class="desc"><div style="font-weight:600">${esc(x.code)}</div><div class="d2">${x.owner?'From '+esc(clientLabel(x.owner)):'Referral code'}</div></div>
      <span class="pill pill-blue">${x.bookings} booking${x.bookings>1?'s':''}</span><div class="amt" style="color:var(--accent-soft-fg)">${fmt(x.revenue)}</div></div>`).join('');
    return `<div class="card stagger" style="margin-top:16px"><div class="card-head"><h3>${ico('star')} Suki &amp; referral conversions</h3><span class="pill pill-neutral">${conv.length} active code(s)</span></div>
      <div class="card-pad" style="padding-top:6px">${rows}<p class="hint" style="margin-top:10px">Which referral codes actually turned into paid bookings. Tag a new client's "referral code used" to credit the suki who sent them.</p></div></div>`;})()}`;
}

/* ============================== CLIENTS ============================== */
function viewClients(){
  const rows=state.clients.map(c=>{
    const projs=state.projects.filter(p=>p.clientId===c.id);
    const billed=state.invoices.filter(i=>i.clientId===c.id&&i.status==='paid').reduce((s,i)=>s+invoiceTotal(i).total,0);
    const r=clientRisk(c.id);
    return `<tr><td><div style="font-weight:600">${esc(c.company||c.name)}</div><div class="sub">${esc(c.name)}, ${esc(c.email)}</div></td>
      <td><span class="pill ${r.cls}">${ico('gauge')} ${r.label}</span></td>
      <td>${projs.length}</td><td class="mono">${fmt(billed)}</td>
      <td style="text-align:right"><button class="btn btn-ghost btn-sm" onclick="App.editClient('${c.id}')">${ico('edit')}</button></td></tr>`;
  }).join('');
  return `
  <div class="page-head"><div><h1>Clients</h1><p class="sub">Who you bill, how fast they pay, and what they've paid.</p></div><button class="btn btn-primary" onclick="App.newClient()">${ico('plus')} New client</button></div>
  <div class="card stagger"><table class="tbl"><thead><tr><th>Client</th><th>Payment risk</th><th>Projects</th><th>Paid</th><th></th></tr></thead>
    <tbody>${rows||`<tr><td colspan="5"><div class="empty">${ico('users')}<h4>No clients yet</h4></div></td></tr>`}</tbody></table></div>`;
}

/* ============================== SETTINGS ============================== */
function viewSettings(){
  const s=state.settings,dark=document.documentElement.getAttribute('data-theme')==='dark';
  return `
  <div class="page-head"><div><h1>Settings</h1><p class="sub">Business profile, currency, appearance, and your data.</p></div></div>
  <div class="grid cols-2 stagger">
    <div class="card"><div class="card-head"><h3>${ico('gear')} Business profile</h3></div><div class="card-pad">
      <div class="field"><label>Business name</label><input class="input" id="set-name" value="${esc(s.businessName)}"></div>
      <div class="field"><label>Email</label><input class="input" id="set-email" value="${esc(s.email)}"></div>
      <div class="field"><label>Facebook page handle</label><input class="input" id="set-fbpage" value="${esc(s.fbPage||'')}" placeholder="habistudios"><div class="hint">Used for the Messenger send button (m.me/your-handle) and review links.</div></div>
      <div class="field"><label>Address</label><textarea class="input" id="set-addr">${esc(s.address)}</textarea></div>
      <div class="field-row"><div class="field"><label>Currency symbol</label><input class="input" id="set-cur" value="${esc(s.currency)}"></div>
      <div class="field"><label>Currency code</label><input class="input" id="set-code" value="${esc(s.currencyCode)}"></div></div>
      <div class="field"><label>Payment terms (days)</label><input class="input" type="number" id="set-terms" value="${s.paymentTerms}"></div>
      <button class="btn btn-primary" onclick="App.saveSettings()">${ico('check')} Save profile</button>${aiReady()?`<button class="btn" style="margin-left:8px" onclick="App.aiOnboard()">${ico('bolt')} Describe your studio (AI)</button>`:''}
    </div></div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="card"><div class="card-head"><h3>${ico('qr')} Payment details</h3><span class="pill pill-blue">on every invoice</span></div><div class="card-pad">
        <div class="field-row"><div class="field"><label>GCash name</label><input class="input" id="pay-gname" value="${esc(s.pay.gcashName)}"></div><div class="field"><label>GCash number</label><input class="input" id="pay-gnum" value="${esc(s.pay.gcashNumber)}"></div></div>
        <div class="field-row"><div class="field"><label>Maya number</label><input class="input" id="pay-maya" value="${esc(s.pay.mayaNumber)}"></div><div class="field"><label>Bank</label><input class="input" id="pay-bank" value="${esc(s.pay.bankName)}"></div></div>
        <div class="field"><label>Account number (InstaPay / PESONet)</label><input class="input" id="pay-acct" value="${esc(s.pay.bankAccount)}"></div>
        <div class="field"><label>Pay link (PayMongo / Xendit / GCash)</label><input class="input" id="pay-link" value="${esc(s.payLink||'')}" placeholder="https://paymongo.link/..."><div class="hint">Paste your hosted GCash/Maya/card checkout link. It rides on every "Compose &amp; send" message so clients pay in one tap.</div></div>
        <div class="field"><label>QR Ph image</label><input class="input" type="file" accept="image/*" onchange="App.uploadQR(event)"><div class="hint">Upload your GCash or Maya QR so it prints on every invoice.${s.pay.qr?' A QR is saved.':''}</div></div>
        <button class="btn btn-primary" onclick="App.savePayments()">${ico('check')} Save payment details</button>
      </div></div>
      <div class="card"><div class="card-head"><h3>${ico(dark?'moon':'sun')} Appearance</h3></div><div class="card-pad">
        <div class="row-between"><div><div style="font-weight:600">Theme</div><div class="muted" style="font-size:13px">Currently ${dark?'dark':'light'}. Follows your system by default.</div></div>
        <button class="btn" onclick="App.toggleTheme()">${ico(dark?'sun':'moon')} ${dark?'Light':'Dark'}</button></div>
      </div></div>
      <div class="card"><div class="card-head"><h3>${ico('database')} Backup &amp; restore</h3>${s.lastBackup?`<span class="pill ${daysBetween(s.lastBackup,todayD())>14?'pill-amber':'pill-accent'}">backed up ${relDays(daysBetween(s.lastBackup,todayD()))}</span>`:'<span class="pill pill-amber">never backed up</span>'}</div><div class="card-pad">
        ${(!s.lastBackup||daysBetween(s.lastBackup,todayD())>14)?`<div class="callout amber" style="margin-bottom:12px">${ico('alertT')} Your billing data lives only in this browser. Clearing site data or switching devices loses it. Download a backup and keep it in Drive.</div>`:''}
        <p class="muted" style="font-size:13px;margin-bottom:12px">Export a full JSON copy of every client, project, and invoice. Restore it on any device or after a wipe.</p>
        <div class="field-row"><button class="btn btn-primary btn-block" onclick="App.exportData()">${ico('download')} Download backup</button>
        <label class="btn btn-block" style="cursor:pointer">${ico('upload')} Restore from file<input type="file" accept="application/json,.json" onchange="App.importData(event)" style="display:none"></label></div>
      </div></div>
      <div class="card"><div class="card-head"><h3>${ico('bolt')} AI features (NVIDIA NIM)</h3>${(s.ai&&s.ai.enabled)?'<span class="pill pill-accent">on</span>':'<span class="pill pill-neutral">off</span>'}</div><div class="card-pad">
        <div class="callout blue" style="margin-bottom:12px">${ico('lock')} Your NVIDIA API key never touches this app or your browser. It lives only in the local proxy (<code>ai-proxy.mjs</code>). This app calls the proxy; the proxy adds the key and calls NVIDIA.</div>
        <label class="check" style="margin-bottom:10px"><input type="checkbox" id="ai-enabled" ${(s.ai&&s.ai.enabled)?'checked':''}><span>Enable AI features — screenshot &amp; receipt readers, quotes, drafts, reminder ladder, scope &amp; discount coaching, risk &amp; cash-flow briefings, closeout, reschedule &amp; review writers</span></label>
        <div class="field"><label>Proxy URL</label><input class="input" id="ai-proxy" value="${esc((s.ai&&s.ai.proxyUrl)||'http://127.0.0.1:8787')}"><div class="hint">Where the local proxy listens. Default is fine when you run it on this machine.</div></div>
        <div class="field"><label>Vision model — payment-screenshot reader</label><input class="input" id="ai-m-vision" value="${esc((s.ai&&s.ai.models&&s.ai.models.vision)||'')}" placeholder="nvidia/nemotron-nano-12b-v2-vl"></div>
        <div class="field"><label>Follow-up model — AI message drafts</label><input class="input" id="ai-m-followup" value="${esc((s.ai&&s.ai.models&&s.ai.models.followup)||'')}" placeholder="meta/llama-3.3-70b-instruct"></div>
        <div class="field"><label>Scope model — request checker</label><input class="input" id="ai-m-scope" value="${esc((s.ai&&s.ai.models&&s.ai.models.scope)||'')}" placeholder="nvidia/llama-3.3-nemotron-super-49b-v1"></div>
        <div class="hint" style="margin-bottom:10px">Copy the exact model id from build.nvidia.com (format <code>vendor/model</code>). If a call returns 404, the slug is wrong — fix it here.</div>
        <div class="field-row"><button class="btn btn-primary btn-block" onclick="App.saveAI()">${ico('check')} Save AI settings</button><button class="btn btn-block" id="ai-test" onclick="App.testAI()">Test connection</button></div>
        <div id="ai-test-note" class="hint" style="margin-top:8px"></div>
      </div></div>
      <div class="card"><div class="card-head"><h3>${ico('trash')} Data</h3></div><div class="card-pad">
        <p class="muted" style="font-size:13px;margin-bottom:12px">Reset to the demo studio, or wipe everything. Export a backup first.</p>
        <div class="field-row"><button class="btn btn-block" onclick="App.resetDemo()">${ico('bolt')} Reset demo data</button><button class="btn btn-danger btn-block" onclick="App.wipe()">${ico('trash')} Wipe all data</button></div>
      </div></div>
    </div>
  </div>`;
}
function notFound(w){return `<div class="empty" style="padding:80px">${ico('alertT')}<h4>${w} not found</h4><a class="btn" href="#/" style="margin-top:12px">${ico('arrowL')} Back to Action Center</a></div>`;}
