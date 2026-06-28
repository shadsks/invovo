"use strict";
/* ============================== ROUTER ============================== */
function go(h){location.hash=h;}
window.addEventListener('hashchange',render);
function render(){
  if(!location.hash)location.hash='#/';
  const route=location.hash.slice(2)||'',[seg,arg]=route.split('/');
  let v='';
  if(seg===''||seg==='dashboard')v=viewDashboard();
  else if(seg==='projects')v=viewProjects();
  else if(seg==='project')v=viewProject(arg);
  else if(seg==='invoices')v=viewInvoices();
  else if(seg==='invoice')v=viewInvoice(arg);
  else if(seg==='insights')v=viewInsights();
  else if(seg==='clients')v=viewClients();
  else if(seg==='settings')v=viewSettings();
  else v=viewDashboard();
  $('#app').innerHTML=shell(seg||'dashboard',v);
}
function navIcon(n){return {dashboard:'grid',projects:'folder',invoices:'doc',insights:'trend',clients:'users',settings:'gear'}[n]||'doc';}
function shell(active,inner){
  const open=buildAlerts().filter(a=>a.sev==='red'||a.sev==='amber').length;
  const dark=document.documentElement.getAttribute('data-theme')==='dark';
  const link=(name,label,badge)=>`<a class="nav-link ${active===name?'active':''}" href="#/${name==='dashboard'?'':name}">${ico(navIcon(name))}<span>${label}</span>${badge?`<span class="badge">${badge}</span>`:''}</a>`;
  const ml=(name,label)=>`<a class="${active===name?'active':''}" href="#/${name==='dashboard'?'':name}">${ico(navIcon(name))}<span>${label}</span></a>`;
  return `
  <aside class="sidebar">
    <div class="brand"><div class="brand-mark">${ico('bolt')}</div><div><div class="brand-name">Invoice Studio</div><div class="brand-sub">Billing for creatives</div></div></div>
    <nav class="nav">
      ${link('dashboard','Action Center',open)}
      ${link('projects','Projects')}
      ${link('invoices','Invoices')}
      ${link('insights','Insights')}
      ${link('clients','Clients')}
      ${link('settings','Settings')}
    </nav>
    <div class="nav-foot"><div class="who"><b>${esc(state.settings.businessName)}</b>${state.settings.currencyCode} . saved locally</div>
      <button class="theme-btn" onclick="App.toggleTheme()" aria-label="Toggle theme">${ico(dark?'sun':'moon')}</button></div>
  </aside>
  <main class="main">
    <div class="topbar"><div class="topbar-l"><div class="topbar-mark">${ico('bolt')}</div><span class="brand-name">Invoice Studio</span></div>
      <div class="topbar-r"><button class="theme-btn" onclick="go('#/settings')" aria-label="Settings">${ico('gear')}</button><button class="theme-btn" onclick="App.toggleTheme()" aria-label="Toggle theme">${ico(dark?'sun':'moon')}</button></div></div>
    <div class="content">${inner}</div>
  </main>
  <nav class="mobile-nav">${ml('dashboard','Actions')}${ml('projects','Projects')}${ml('invoices','Invoices')}${ml('insights','Insights')}${ml('clients','Clients')}</nav>`;
}

/* ============================== DASHBOARD ============================== */
function viewDashboard(){
  const alerts=buildAlerts();
  const outstanding=state.invoices.filter(i=>['sent','overdue'].includes(invoiceStatus(i))).reduce((s,i)=>s+invoiceTotal(i).total,0);
  const overdueInv=state.invoices.filter(i=>invoiceStatus(i)==='overdue');
  const overdueAmt=overdueInv.reduce((s,i)=>s+invoiceTotal(i).total,0);
  const collected=state.invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+invoiceTotal(i).total,0);
  const recoverable=alerts.reduce((s,a)=>s+Number(a.money||0),0);
  const mx=`<span class="cur">${state.settings.currencyCode}</span>`;
  const kpis=`<div class="grid cols-4 stagger" style="margin-bottom:18px">
    <div class="kpi"><div class="label">${ico('wallet')} Outstanding</div><div class="val">${fmt(outstanding)}${mx}</div><div class="meta">${state.invoices.filter(i=>['sent','overdue'].includes(invoiceStatus(i))).length} unpaid invoices</div></div>
    <div class="kpi is-red"><div class="label">${ico('alertT')} Overdue</div><div class="val">${fmt(overdueAmt)}${mx}</div><div class="meta">${overdueInv.length} past due</div></div>
    <div class="kpi is-accent"><div class="label">${ico('check')} Collected</div><div class="val">${fmt(collected)}${mx}</div><div class="meta">paid to date</div></div>
    <div class="kpi is-accent"><div class="label">${ico('trend')} Recoverable now</div><div class="val">${fmt(recoverable)}${mx}</div><div class="meta">${alerts.length} open actions</div></div>
  </div>`;
  const list=alerts.length?alerts.map(a=>`
    <div class="alert">
      <div class="alert-ico ${a.sev}">${ico(a.icon)}</div>
      <div class="alert-body">
        <div class="t">${esc(a.title)} ${a.money?`<span class="alert-money">+${fmt(a.money)}</span>`:''}</div>
        <div class="d">${esc(a.detail)}</div>
        <div class="alert-actions">${a.actions.map(ac=>`<button class="btn btn-sm ${ac.primary?'btn-primary':''}" onclick="${ac.fn}">${esc(ac.label)}</button>`).join('')}</div>
      </div>
    </div>`).join(''):`<div class="empty">${ico('check')}<h4>You're all caught up</h4><p>No overdue invoices, expiring holds, overages, or payouts right now.</p></div>`;
  return `
  <div class="page-head">
    <div><h1>Action Center</h1><p class="sub">Money you're owed, surfaced the moment it's billable: expiring date holds, kill fees, overages, change orders, retainer overruns, crew payouts, and overdue invoices with teeth.</p></div>
    <div style="display:flex;gap:8px"><button class="btn" onclick="App.composeAsk()">${ico('chat')} Compose ask</button>${aiReady()?`<button class="btn" onclick="App.aiProposal()">${ico('bolt')} AI quote</button>`:''}<button class="btn btn-primary" onclick="App.newProject()">${ico('plus')} Project</button></div>
  </div>
  ${kpis}
  <div class="card"><div class="card-head"><h3>${ico('bolt')} Needs your attention</h3><span class="pill pill-neutral">${alerts.length} open</span></div>${list}</div>`;
}

/* ============================== PROJECTS ============================== */
function typePill(t){const m={photo:'Photo',video:'Video',illustration:'Illustration',design:'Design',retainer:'Retainer'};return `<span class="pill pill-neutral">${esc(m[t]||t)}</span>`;}
function statusPill(s){const m={booked:['pill-blue','Booked'],shot:['pill-neutral','Shot'],delivered:['pill-neutral','Delivered'],wrapped:['pill-accent','Wrapped'],active:['pill-accent','Active'],cancelled:['pill-red','Cancelled']};const[c,l]=m[s]||['pill-neutral',s];return `<span class="pill ${c}">${esc(l)}</span>`;}
function viewProjects(){
  const rows=state.projects.map(p=>{
    const rs=retainerStats(p),open=projectOpenItems(p);const value=p.creativeFee||(p.retainer?p.retainer.rate:0);
    return `<tr class="clickable" onclick="go('#/project/${p.id}')">
      <td><div style="font-weight:600">${esc(p.title)}</div><div class="sub">${esc(clientLabel(p.clientId))}</div></td>
      <td>${typePill(p.type)}</td>
      <td class="mono">${value?fmt(value):(rs?rs.used+'/'+p.retainer.allowanceQty:'')}</td>
      <td>${open?`<span class="pill pill-amber">${open} to bill</span>`:'<span class="muted" style="font-size:12.5px">clear</span>'}</td>
      <td>${statusPill(p.status)}</td>
    </tr>`;
  }).join('');
  return `
  <div class="page-head"><div><h1>Projects</h1><p class="sub">Each project holds its fee, holds, revisions, change orders, pass-throughs, crew splits, deliverable gate, and milestones.</p></div><button class="btn btn-primary" onclick="App.newProject()">${ico('plus')} New project</button></div>
  <div class="card stagger"><table class="tbl">
    <thead><tr><th>Project</th><th>Type</th><th>Value</th><th>Open</th><th>Status</th></tr></thead>
    <tbody>${rows||`<tr><td colspan="5"><div class="empty">${ico('folder')}<h4>No projects yet</h4></div></td></tr>`}</tbody>
  </table></div>`;
}

/* ============================== PROJECT DETAIL ============================== */
function viewProject(id){
  const p=projectById(id);if(!p)return notFound('Project');
  const c=clientById(p.clientId),risk=clientRisk(p.clientId),er=effectiveRate(p);
  const hs=holdState(p);
  return `
  <a class="back-link" href="#/projects">${ico('arrowL')} All projects</a>
  <div class="page-head">
    <div><h1>${esc(p.title)}</h1><p class="sub">${esc(c?(c.company||c.name):'')}${p.shootDate?', shoot '+fmtDate(p.shootDate):''}</p>
    <div class="tag-row" style="margin-top:10px">${typePill(p.type)} ${statusPill(p.status)} <span class="pill ${risk.cls}">${ico('gauge')} ${risk.label}</span>${er?` <span class="pill pill-neutral">${fmt(er.hourly)}/hr effective</span>`:''}</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" onclick="App.editProject('${p.id}')">${ico('edit')} Edit</button>
      ${aiReady()?`<button class="btn" onclick="App.aiCloseout('${p.id}')">${ico('bolt')} AI closeout</button>`:''}
      ${p.status!=='cancelled'?`<button class="btn btn-danger" onclick="App.cancelBooking('${p.id}')">${ico('alertT')} Client cancelled</button>`:''}
      <button class="btn btn-primary" onclick="App.buildInvoice('${p.id}')">${ico('doc')} Build invoice</button>
    </div>
  </div>
  <div class="grid cols-2 stagger">
    <div style="display:flex;flex-direction:column;gap:16px">
      ${p.hold?cardHold(p,hs):''}
      ${p.type!=='retainer'?cardInstallments(p):''}
      ${cardRevision(p)}
      ${cardChangeOrders(p)}
      ${p.retainer?cardRetainer(p):''}
      ${cardOvertime(p)}
      ${cardTurnaround(p)}
      ${(p.shootDate&&p.type!=='retainer')?cardReschedule(p):''}
      ${cardKillFee(p)}
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      ${cardPassThrough(p)}
      ${cardDeliverable(p)}
      ${p.type!=='retainer'?cardSplitPayers(p):''}
      ${(p.collaborators&&p.collaborators.length)?cardCollaborators(p):''}
      ${(p.milestones&&p.milestones.length)?cardMilestones(p):''}
      ${fullyDelivered(p)?cardCloseout(p):''}
      ${cardProjectInvoices(p)}
    </div>
  </div>`;
}

function cardHold(p,hs){
  const dd=daysBetween(todayD(),p.hold.deadline);
  const badge=hs==='confirmed'?'<span class="pill pill-accent">confirmed</span>':hs==='released'?'<span class="pill pill-red">released</span>':'<span class="pill pill-amber">tentative</span>';
  return `<div class="card">
    <div class="card-head"><h3>${ico('calendar')} Deposit-Gated Date Hold</h3>${badge}</div>
    <div class="card-pad" style="padding-top:14px">
      <div class="grid cols-2" style="gap:10px;font-size:13px">
        <div><span class="muted">Shoot date</span><div style="font-weight:600">${fmtDate(p.shootDate)}</div></div>
        <div><span class="muted">Deposit to confirm</span><div style="font-weight:600">${fmt(p.hold.depositAmount)} (${p.hold.depositPct}%)</div></div>
      </div>
      ${hs==='tentative'?`<div class="callout amber" style="margin-top:12px">Date is <b>held but not booked</b>. It auto-releases ${relDays(dd)} (${fmtDate(p.hold.deadline)}) unless the deposit clears.</div>`:''}
      ${hs==='confirmed'?`<div class="callout accent" style="margin-top:12px">Deposit cleared. The date is <b>locked in</b>.</div>`:''}
      ${hs==='released'?`<div class="callout red" style="margin-top:12px">Deadline passed unpaid. The slot is <b>open again</b> for other inquiries.</div>`:''}
      <div class="field-row" style="margin-top:12px">
        ${hs==='confirmed'?`<button class="btn btn-sm btn-block" disabled>${ico('check')} Date confirmed</button>`:
          p.hold.requested?`<button class="btn btn-sm btn-accent btn-block" onclick="App.markHoldPaid('${p.id}')">${ico('check')} Mark deposit paid</button>`:
          `<button class="btn btn-sm btn-primary btn-block" onclick="App.requestDeposit('${p.id}')">${ico('send')} Send deposit request</button>`}
        <button class="btn btn-sm btn-block" onclick="App.editHold('${p.id}')">${ico('edit')} Edit hold</button>
      </div>
    </div>
  </div>`;
}

function cardRevision(p){
  const rev=p.revision||{included:0,perRoundFee:0,rounds:[]};
  const used=rev.rounds.length,overUsed=Math.max(0,used-rev.included);
  const overBillable=rev.rounds.filter(r=>r.overage&&!r.billed).length;
  const dots=[];
  for(let i=0;i<Math.max(rev.included,used);i++){const r=rev.rounds[i],isOver=i>=rev.included;
    dots.push(`<div title="${r?esc(r.note||('Round '+(i+1))):'Included'}" style="width:30px;height:30px;border-radius:8px;display:grid;place-items:center;font-weight:600;font-size:12px;${r?(isOver?'background:var(--red-soft);color:var(--red-soft-fg)':'background:var(--fg);color:var(--bg)'):'background:var(--surface-2);color:var(--fg-subtle);border:1px dashed var(--border-strong)'}">${i+1}</div>`);}
  return `<div class="card">
    <div class="card-head"><h3>${ico('layers')} Revision Meter</h3><span class="pill ${overUsed?'pill-red':'pill-neutral'}">${used} used / ${rev.included} included</span></div>
    <div class="card-pad" style="padding-top:14px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">${dots.join('')||'<span class="muted">No rounds logged.</span>'}</div>
      ${overUsed?`<div class="callout red" style="margin-bottom:12px"><b>You've used your ${rev.included} included rounds.</b> Round ${used} is billable at ${fmt(rev.perRoundFee)} before work begins.</div>`:''}
      <div class="field-row">
        <button class="btn btn-sm btn-block" onclick="App.logRevision('${p.id}')">${ico('plus')} Log a round</button>
        ${overBillable?`<button class="btn btn-sm btn-primary btn-block" onclick="App.billRevisionOverage('${p.id}')">${ico('money')} Bill ${overBillable} overage</button>`:''}
      </div>
      <div class="hint" style="margin-top:8px">${rev.included} included, ${fmt(rev.perRoundFee)} per extra round. <a href="#" onclick="App.editRevisionSettings('${p.id}');return false" style="color:var(--accent-soft-fg);font-weight:500">Edit</a></div>
    </div>
  </div>`;
}

function cardChangeOrders(p){
  const cos=p.changeOrders||[];
  const rows=cos.map(co=>{const b=co.status==='approved'?(co.billed?'<span class="pill pill-accent">billed</span>':'<span class="pill pill-amber">approved</span>'):'<span class="pill pill-neutral">proposed</span>';
    return `<div class="li" style="grid-template-columns:1fr auto auto;gap:10px">
      <div class="desc"><div style="font-weight:600">${esc(co.desc)}</div><div class="d2">${b}</div></div>
      <span class="amt">${fmt(co.amount)}</span>
      ${co.status==='proposed'?`<button class="btn btn-ghost btn-sm" onclick="App.approveChangeOrder('${p.id}','${co.id}')" title="Mark approved">${ico('check')}</button>`:`<button class="btn btn-ghost btn-sm" onclick="App.removeChangeOrder('${p.id}','${co.id}')" aria-label="Remove">${ico('trash')}</button>`}
    </div>`;}).join('');
  const pend=changeOrdersPending(p);
  return `<div class="card">
    <div class="card-head"><h3>${ico('split')} Change Orders</h3>${pend.length?`<span class="pill pill-amber">${fmt(pend.reduce((s,c)=>s+c.amount,0))} to bill</span>`:'<span class="pill pill-neutral">scope locked</span>'}</div>
    <div class="card-pad" style="padding-top:6px">
      ${rows||`<div class="empty" style="padding:20px">${ico('split')}<p>Log every out-of-scope "can you also..." as a one-tap change order before you do the work.</p></div>`}
      <div class="field-row" style="margin-top:12px">
        <button class="btn btn-sm btn-block" onclick="App.addChangeOrder('${p.id}')">${ico('plus')} Add change order</button>
        ${pend.length?`<button class="btn btn-sm btn-primary btn-block" onclick="App.billChangeOrders('${p.id}')">${ico('money')} Bill ${pend.length}</button>`:''}
      </div>
      ${aiReady()?`<button class="btn btn-sm btn-block" style="margin-top:8px" onclick="App.checkScope('${p.id}')">${ico('bolt')} Check a request (AI scope check)</button><button class="btn btn-sm btn-block" style="margin-top:8px" onclick="App.aiHaggle('${p.id}')">${ico('bolt')} Handle a discount request (AI)</button>`:''}
    </div>
  </div>`;
}

function cardRetainer(p){
  const r=p.retainer,rs=retainerStats(p);
  const usedPct=Math.min(100,Math.round(rs.used/r.allowanceQty*100));
  const overSeg=rs.over>0?Math.min(40,Math.round(rs.over/r.allowanceQty*100)):0;
  const due=renewalDue(p);
  return `<div class="card">
    <div class="card-head"><h3>${ico('flame')} Retainer Burn-Down</h3><span class="pill ${rs.over>0?'pill-red':'pill-accent'}">${esc(r.period)}</span></div>
    <div class="card-pad" style="padding-top:14px">
      <div class="row-between" style="margin-bottom:8px"><span style="font-weight:600">${rs.used} / ${r.allowanceQty} ${esc(r.allowanceUnit)}</span><span class="muted" style="font-size:13px">${rs.over>0?`<b style="color:var(--red)">${rs.over} over</b>`:`${rs.remaining} left`}</span></div>
      <div class="bar"><span class="used" style="width:${usedPct-overSeg}%"></span><span class="over" style="width:${overSeg}%"></span></div>
      <div style="margin-top:12px;font-size:13px" class="muted">${fmt(r.rate)} per month, overage ${fmt(r.overageRate)} per unit</div>
      ${rs.over>0?`<div class="callout red" style="margin-top:12px"><b>${rs.over} ${esc(r.allowanceUnit)} over the cap.</b> Overage owed: ${fmt(rs.overFee)}.</div>`:''}
      ${due?`<div class="callout blue" style="margin-top:12px">No rate increase in ${r.raiseMonths}+ months. Propose a raise at renewal.</div>`:''}
      <div class="field-row" style="margin-top:12px">
        <button class="btn btn-sm btn-block" onclick="App.logConsumption('${p.id}')">${ico('plus')} Log delivery</button>
        ${rs.over>0?`<button class="btn btn-sm btn-primary btn-block" onclick="App.billRetainerOverage('${p.id}')">${ico('money')} Bill overage</button>`:`<button class="btn btn-sm btn-block" onclick="App.proposeRaise('${p.id}')">${ico('arrowUp')} Propose raise</button>`}
      </div>
    </div>
  </div>`;
}

function cardOvertime(p){
  const o=p.overtime||{},ot=computeOT(o);
  return `<div class="card">
    <div class="card-head"><h3>${ico('clock')} Shoot-Day Overtime</h3>${ot&&ot.otFee>0?`<span class="pill ${o.billed?'pill-accent':'pill-amber'}">${o.billed?'billed':'+'+fmt(ot.otFee)}</span>`:'<span class="pill pill-neutral">on schedule</span>'}</div>
    <div class="card-pad" style="padding-top:14px">
      <div class="grid cols-2" style="gap:10px;font-size:13px">
        <div><span class="muted">Day rate</span><div style="font-weight:600">${fmt(o.dayRate)} / ${o.thresholdHours}h</div></div>
        <div><span class="muted">OT multiplier</span><div style="font-weight:600">${o.multiplier}x hourly</div></div>
        <div><span class="muted">Call to wrap</span><div style="font-weight:600">${o.callTime||'not set'} to ${o.wrapTime||'not set'}</div></div>
        <div><span class="muted">Logged</span><div style="font-weight:600">${ot?ot.hours+'h':'not set'}</div></div>
      </div>
      ${ot&&ot.otFee>0?`<div class="callout blue" style="margin-top:12px">${ot.otHours}h over, billed ${ot.otHours} times ${fmt(ot.hourly)}/hr times ${o.multiplier} = <b>${fmt(ot.otFee)}</b></div>`:''}
      <div class="field-row" style="margin-top:12px">
        <button class="btn btn-sm btn-block" onclick="App.logWrap('${p.id}')">${ico('clock')} Log wrap time</button>
        ${ot&&ot.otFee>0&&!o.billed?`<button class="btn btn-sm btn-primary btn-block" onclick="App.billOvertime('${p.id}')">${ico('money')} Add to invoice</button>`:''}
      </div>
    </div>
  </div>`;
}

function cardPassThrough(p){
  const pts=p.passThroughs||[];
  const rows=pts.map(x=>{const billed=Math.round(Number(x.cost)*(1+Number(x.markupPct||0)/100));
    return `<div class="li" style="grid-template-columns:1fr auto auto;gap:10px">
      <div class="desc"><div style="font-weight:600">${esc(x.label)}</div><div class="d2">${esc(x.category)}, cost ${fmt(x.cost)}${x.markupPct>0?', plus '+x.markupPct+'% markup':', at cost'}</div></div>
      <span class="amt">${fmt(billed)}</span>
      <button class="btn btn-ghost btn-sm" onclick="App.removePT('${p.id}','${x.id}')" aria-label="Remove">${ico('trash')}</button>
    </div>`;}).join('');
  const total=pts.reduce((s,x)=>s+Math.round(Number(x.cost)*(1+Number(x.markupPct||0)/100)),0);
  return `<div class="card">
    <div class="card-head"><h3>${ico('receipt')} Pass-Through Costs</h3><span class="pill pill-neutral">${fmt(total)} billable</span></div>
    <div class="card-pad" style="padding-top:6px">
      ${rows||`<div class="empty" style="padding:20px">${ico('receipt')}<p>Tag rentals, studio, crew, catering. Bill at cost or with a per-line markup.</p></div>`}
      <button class="btn btn-block btn-sm" style="margin-top:12px" onclick="App.addPT('${p.id}')">${ico('plus')} Add pass-through cost</button>
      ${aiReady()?`<button class="btn btn-block btn-sm" style="margin-top:8px" onclick="App.scanReceipt('${p.id}')">${ico('upload')} Scan receipt (AI)</button>`:''}
    </div>
  </div>`;
}

function cardDeliverable(p){
  const d=p.deliverable||{},has=!!d.url;
  return `<div class="card">
    <div class="card-head"><h3>${ico('lock')} Deliverable Gate</h3>${has?`<span class="pill ${d.locked?'pill-red':'pill-accent'}">${d.locked?'locked':'released'}</span>`:'<span class="pill pill-neutral">no link</span>'}</div>
    <div class="card-pad" style="padding-top:6px">
      ${has?`
      <div class="gate">
        <div class="gate-vis ${d.locked?'locked':'unlocked'}">
          <div class="lockwrap">${ico(d.locked?'lock':'unlock')}<div style="font-weight:600;font-size:13px">${d.locked?'Locked until paid':'Released'}</div></div>
          ${d.watermarked?'<div class="gate-wm"><span>PREVIEW UNPAID PREVIEW UNPAID</span></div>':''}
        </div>
        <div class="gate-foot">
          <div style="min-width:0"><div style="font-weight:600;font-size:13px">${esc(d.type||'Deliverable')}</div><div class="sub" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:210px">${esc(d.url)}</div></div>
          <button class="btn btn-sm" onclick="App.toggleLock('${p.id}')">${d.locked?ico('unlock')+' Release':ico('lock')+' Lock'}</button>
        </div>
      </div>
      <div class="callout ${d.opened?'blue':''}" style="margin-top:10px;${d.opened?'':'background:var(--surface-2);color:var(--fg-muted)'}">${ico('eye')} ${d.opened?`Client opened the files, ${d.downloads} download(s), last viewed ${relDays(daysBetween(d.lastViewed,todayD()))}.`:'No client access recorded yet.'}</div>
      <button class="btn btn-block btn-sm" style="margin-top:10px" onclick="App.simulateView('${p.id}')">${ico('eye')} Simulate client view</button>
      `:`<div class="empty" style="padding:20px">${ico('link')}<p>Link the gallery, Frame.io, or Drive deliverable to gate it behind payment and track access.</p></div>`}
      <button class="btn btn-block btn-sm" style="margin-top:10px" onclick="App.editDeliverable('${p.id}')">${ico(has?'edit':'plus')} ${has?'Edit link':'Attach deliverable'}</button>
    </div>
  </div>`;
}

function cardCollaborators(p){
  const payouts=projectPayouts(p),anyPaid=projectInvoices(p.id).some(i=>i.status==='paid');
  const rows=payouts.map(c=>`<div class="li" style="grid-template-columns:1fr auto auto;gap:10px">
    <div class="desc"><div style="font-weight:600">${esc(c.name)}</div><div class="d2">${esc(c.role)}, ${c.cutType==='pct'?c.cutValue+'% of fee':'flat'}</div></div>
    ${c.paidOut?'<span class="pill pill-accent">paid out</span>':'<span class="pill pill-neutral">owed</span>'}
    <span class="amt">${fmt(c.owed)}</span></div>`).join('');
  const owed=payouts.filter(c=>!c.paidOut).reduce((s,c)=>s+c.owed,0);
  return `<div class="card">
    <div class="card-head"><h3>${ico('split')} Crew Split-Payouts</h3><span class="pill ${anyPaid&&owed?'pill-amber':'pill-neutral'}">${fmt(owed)} owed</span></div>
    <div class="card-pad" style="padding-top:6px">
      ${rows}
      ${anyPaid&&owed?`<button class="btn btn-sm btn-primary btn-block" style="margin-top:12px" onclick="App.settlePayouts('${p.id}')">${ico('check')} Mark payouts settled</button>`:`<p class="hint" style="margin-top:10px">Payouts settle once the client invoice is paid. ${anyPaid?'':'No invoice paid yet.'}</p>`}
      <button class="btn btn-block btn-sm" style="margin-top:8px" onclick="App.addCollaborator('${p.id}')">${ico('plus')} Add collaborator</button>
    </div>
  </div>`;
}

function cardMilestones(p){
  const steps=p.milestones.map((m,i)=>{
    const done=m.status==='approved',active=m.status==='ready'||m.status==='invoiced';let badge='',action='';
    if(m.status==='approved')badge='<span class="pill pill-accent">approved</span>';
    else if(m.status==='invoiced'){badge='<span class="pill pill-blue">invoiced</span>';action=`<button class="btn btn-sm" onclick="App.approveMilestone('${p.id}','${m.id}')">${ico('check')} Mark deliverable approved</button>`;}
    else if(m.status==='ready'){badge='<span class="pill pill-amber">ready</span>';action=`<button class="btn btn-sm btn-primary" onclick="App.invoiceMilestone('${p.id}','${m.id}')">${ico('doc')} Generate invoice</button>`;}
    else badge='<span class="pill pill-neutral">locked</span>';
    return `<div class="step ${done?'done':''} ${active?'active':''}"><div class="step-dot">${done?ico('check'):i+1}</div>
      <div class="step-body"><div class="st">${esc(m.label)}, ${fmt(m.amount)} ${badge}</div>${action?`<div style="margin-top:7px">${action}</div>`:`<div class="sd">${m.status==='pending'?'Unlocks when the prior deliverable is approved.':''}</div>`}</div></div>`;
  }).join('');
  return `<div class="card"><div class="card-head"><h3>${ico('check')} Milestone Chain</h3></div>
    <div class="card-pad"><div class="stepper">${steps}</div><p class="hint" style="margin-top:6px">Each invoice fires when the prior deliverable is approved, not on a calendar date.</p></div></div>`;
}

function cardReschedule(p){
  const rs=rescheduleStats(p),pol=p.reschedulePolicy||{};
  const rows=(p.reschedules||[]).map((r,i)=>{const chargeable=i>=rs.free;
    return `<div class="li"><div class="desc"><div style="font-weight:600">${esc(reasonLabel(r.reason))} ${chargeable?(r.billed?'<span class="pill pill-accent">billed</span>':'<span class="pill pill-amber">re-block due</span>'):'<span class="pill pill-neutral">free</span>'}</div><div class="d2">${fmtDate(r.from)} &rarr; ${fmtDate(r.to)}${r.note?', '+esc(r.note):''}</div></div><div class="amt" style="font-weight:500">${chargeable?fmt(rs.reblockFee):'₱0'}</div></div>`;}).join('');
  return `<div class="card">
    <div class="card-head"><h3>${ico('calendar')} Weather Reschedule</h3>${rs.feeDue>0?`<span class="pill pill-amber">+${fmt(rs.feeDue)} re-block</span>`:`<span class="pill pill-neutral">${rs.remaining} free left</span>`}</div>
    <div class="card-pad" style="padding-top:6px">
      ${rows||`<div class="empty" style="padding:18px">${ico('calendar')}<p>Typhoon or "ayaw ng panahon"? Move the date instead of killing it. First ${pol.freeCount||1} free, then ${fmt(pol.reblockFee||0)} to re-hold.</p></div>`}
      ${rs.feeDue>0?`<div class="callout amber" style="margin-top:10px">${rs.unbilled.length} chargeable reschedule(s) past the ${rs.free} free. <b>${fmt(rs.feeDue)}</b> to re-block the date, separate from any kill fee.</div>`:''}
      <div class="field-row" style="margin-top:12px">
        <button class="btn btn-sm btn-block" onclick="App.logReschedule('${p.id}')">${ico('calendar')} Log reschedule</button>
        ${rs.feeDue>0?`<button class="btn btn-sm btn-primary btn-block" onclick="App.billReschedule('${p.id}')">${ico('money')} Bill re-block</button>`:''}
      </div>
      ${aiReady()?`<button class="btn btn-sm btn-block" style="margin-top:8px" onclick="App.aiReschedule('${p.id}')">${ico('bolt')} AI reschedule message</button>`:''}
      <div class="hint" style="margin-top:8px">${pol.freeCount||1} free move(s), ${fmt(pol.reblockFee||0)} after. <a href="#" onclick="App.editReschedulePolicy('${p.id}');return false" style="color:var(--accent-soft-fg);font-weight:500">Edit policy</a></div>
    </div>
  </div>`;
}
function reasonLabel(v){return {typhoon:'Typhoon / weather',client:'Client request',venue:'Venue conflict',health:'Health',other:'Other'}[v]||v||'Reschedule';}

function cardSplitPayers(p){
  const sp=splitStats(p);
  if(!sp)return `<div class="card"><div class="card-head"><h3>${ico('users')} Barkada Split</h3><span class="pill pill-neutral">single payer</span></div>
    <div class="card-pad"><div class="empty" style="padding:20px">${ico('users')}<p>Wedding or debut paid from several pockets, the couple, ninang, parents? Split one balance across payers with their own GCash refs. Files release only when everyone clears.</p></div>
    <button class="btn btn-block btn-sm" onclick="App.createSplit('${p.id}')">${ico('plus')} Set up split payment</button></div></div>`;
  const pct=Math.round(sp.paid/sp.total*100);
  const rows=p.splitPayers.map(x=>{const paid=x.status==='paid';
    return `<div class="li" style="grid-template-columns:1fr auto auto auto;gap:10px">
      <div class="desc"><div style="font-weight:600">${esc(x.name)}</div><div class="d2">${paid?'Paid via '+payMethodLabel(x.method)+' '+esc(x.ref||''):'Unpaid'}</div></div>
      ${paid?'<span class="pill pill-accent">'+ico('check')+'paid</span>':'<span class="pill pill-neutral">owed</span>'}
      <span class="amt">${fmt(x.share)}</span>
      ${paid?`<button class="btn btn-ghost btn-sm" onclick="App.removeSplitPayer('${p.id}','${x.id}')" aria-label="Remove">${ico('trash')}</button>`:`<button class="btn btn-ghost btn-sm" onclick="App.paySplitPayer('${p.id}','${x.id}')" title="Record share">${ico('check')}</button>`}
    </div>`;}).join('');
  return `<div class="card">
    <div class="card-head"><h3>${ico('users')} Barkada Split</h3><span class="pill ${sp.allPaid?'pill-accent':'pill-amber'}">${fmt(sp.paid)} / ${fmt(sp.total)}</span></div>
    <div class="card-pad" style="padding-top:14px">
      <div class="bar" style="margin-bottom:14px"><span style="width:${pct}%;background:var(--accent)"></span></div>
      ${rows}
      ${!sp.allPaid?`<div class="callout amber" style="margin-top:12px">${ico('lock')} ${sp.paidCount}/${sp.count} shares in. Final files stay gated until ${esc(sp.pending.map(x=>x.name).join(' and '))} pay.</div>`:`<div class="callout accent" style="margin-top:12px">${ico('check')} All ${sp.count} shares cleared. Gate can release.</div>`}
      <div class="field-row" style="margin-top:12px">
        <button class="btn btn-sm btn-block" onclick="App.addSplitPayer('${p.id}')">${ico('plus')} Add payer</button>
        ${!sp.allPaid?`<button class="btn btn-sm btn-primary btn-block" onclick="App.chaseSplit('${p.id}')">${ico('send')} Chase unpaid</button>`:''}
      </div>
    </div>
  </div>`;
}

function cardKillFee(p){
  const tiers=[...(p.cancellationLadder||defaultLadder())].sort((a,b)=>b.minDaysOut-a.minDaysOut);
  const rows=tiers.map((t,i)=>{const next=tiers[i-1];const range=i===0?`More than ${t.minDaysOut} days out`:(t.minDaysOut===0?`Inside ${next.minDaysOut} days`:`${t.minDaysOut} to ${next.minDaysOut} days out`);
    return `<div class="li"><div class="desc">${esc(range)}</div><div class="amt" style="font-weight:500">${t.pct}%, ${fmt(Math.round(p.creativeFee*t.pct/100))}</div></div>`;}).join('');
  return `<div class="card"><div class="card-head"><h3>${ico('scale')} Cancellation Ladder</h3><button class="btn btn-ghost btn-sm" onclick="App.editLadder('${p.id}')">${ico('edit')}</button></div>
    <div class="card-pad" style="padding-top:6px">${rows}<p class="hint" style="margin-top:10px">If the client cancels, "Client cancelled" reads the date against this ladder and generates the kill-fee invoice in one motion.</p></div></div>`;
}

function cardProjectInvoices(p){
  const invs=projectInvoices(p.id);
  const rows=invs.map(i=>`<div class="li" style="grid-template-columns:1fr auto auto;gap:10px;cursor:pointer" onclick="go('#/invoice/${i.id}')">
    <div class="desc"><div style="font-weight:600">${i.number} ${invTypePill(i.type)}</div><div class="d2">${fmtDate(i.issueDate)}</div></div>
    ${invStatusPill(invoiceStatus(i))}<div class="amt">${fmt(invoiceTotal(i).total)}</div></div>`).join('');
  return `<div class="card"><div class="card-head"><h3>${ico('doc')} Invoices</h3><button class="btn btn-sm btn-primary" onclick="App.buildInvoice('${p.id}')">${ico('plus')} Build</button></div>
    <div class="card-pad" style="padding-top:6px">${rows||`<div class="empty" style="padding:18px"><p>No invoices for this project yet.</p></div>`}</div></div>`;
}

/* ---- Turnaround / SDE rush pricing ---- */
function cardTurnaround(p){
  const row=turnaroundRow(p),fee=turnaroundFee(p),rush=row.pct>0;
  return `<div class="card">
    <div class="card-head"><h3>${ico('zap')} Turnaround Pricing</h3>${rush?`<span class="pill ${p.turnaround.billed?'pill-accent':'pill-blue'}">${p.turnaround.billed?'billed':'+'+fmt(fee)}</span>`:'<span class="pill pill-neutral">standard</span>'}</div>
    <div class="card-pad" style="padding-top:14px">
      <div class="field" style="margin-bottom:10px"><label>Delivery speed</label>
        <select class="input" onchange="App.setTurnaround('${p.id}',this.value)">${TURNAROUND.map(x=>`<option value="${x.v}" ${x.v===row.v?'selected':''}>${esc(x.l)}${x.pct?' (+'+x.pct+'%)':''}</option>`).join('')}</select></div>
      ${rush?`<div class="callout blue">${esc(row.l)} adds <b>${fmt(fee)}</b>, that is +${row.pct}% of the ${fmt(p.creativeFee)} fee. Priced on delivery speed, separate from shoot-day overtime.</div>`:'<p class="hint">No rush premium at standard turnaround. Pick a faster SLA to price it in.</p>'}
      ${rush&&!p.turnaround.billed?`<button class="btn btn-sm btn-primary btn-block" style="margin-top:12px" onclick="App.billRush('${p.id}')">${ico('money')} Add rush to invoice</button>`:''}
    </div>
  </div>`;
}

/* ---- Hulugan installment plan ---- */
function cardInstallments(p){
  const st=installmentStats(p);
  if(!st)return `<div class="card"><div class="card-head"><h3>${ico('cards')} Hulugan Plan</h3><span class="pill pill-neutral">none</span></div>
    <div class="card-pad"><div class="empty" style="padding:20px">${ico('cards')}<p>Split this fee into a reservation, mid, and balance-before-release schedule with GCash reminders.</p></div>
    <button class="btn btn-block btn-sm" onclick="App.createInstallments('${p.id}')">${ico('plus')} Create installment plan</button></div></div>`;
  const pct=Math.round(st.paid/st.total*100);
  const rows=p.installments.map(i=>{
    const paid=i.status==='paid',dd=daysBetween(todayD(),i.dueDate);
    const badge=paid?`<span class="pill pill-accent">${ico('check')}paid</span>`:(dd<0?'<span class="pill pill-red">overdue</span>':'<span class="pill pill-neutral">due '+relDays(dd)+'</span>');
    return `<div class="li" style="grid-template-columns:1fr auto auto;gap:10px">
      <div class="desc"><div style="font-weight:600">${esc(i.label)}</div><div class="d2">${paid?'Paid via '+payMethodLabel(i.method)+' '+esc(i.paidRef||''):'Due '+fmtDate(i.dueDate)+(i.gate?', gates file release':'')}</div></div>
      ${badge}<span class="amt">${fmt(i.amount)}</span></div>`;}).join('');
  let act='';
  if(st.next)act=`<div class="field-row" style="margin-top:12px"><button class="btn btn-sm btn-block" onclick="App.sendInstallmentReminder('${p.id}','${st.next.id}')">${ico('send')} GCash reminder</button><button class="btn btn-sm btn-primary btn-block" onclick="App.payInstallment('${p.id}','${st.next.id}')">${ico('check')} Record payment</button></div>`;
  return `<div class="card">
    <div class="card-head"><h3>${ico('cards')} Hulugan Plan</h3><span class="pill ${st.remaining>0?'pill-amber':'pill-accent'}">${fmt(st.paid)} / ${fmt(st.total)}</span></div>
    <div class="card-pad" style="padding-top:14px">
      <div class="bar" style="margin-bottom:14px"><span style="width:${pct}%;background:var(--accent)"></span></div>
      ${rows}
      ${st.gateUnpaid?`<div class="callout amber" style="margin-top:12px">${ico('lock')} Final files stay locked until the balance-before-release installment clears.</div>`:''}
      ${act}
      <button class="btn btn-block btn-sm" style="margin-top:8px" onclick="App.editInstallments('${p.id}')">${ico('edit')} Edit plan</button>
    </div>
  </div>`;
}

/* ---- Post-payment review & referral ---- */
function cardCloseout(p){
  const co=p.closeout||{},done=co.reviewRequested;
  return `<div class="card">
    <div class="card-head"><h3>${ico('star')} Review & Referral</h3>${done?'<span class="pill pill-accent">requested</span>':'<span class="pill pill-amber">ready to send</span>'}</div>
    <div class="card-pad" style="padding-top:14px">
      <p class="muted" style="font-size:13px;margin-bottom:8px">Delivered and fully paid. Capture the goodwill while it peaks.</p>
      <div class="li" style="grid-template-columns:1fr auto"><div class="desc"><div style="font-weight:600">Referral code</div><div class="d2">Hand this over for a discount on their next booking</div></div><span class="amt">${esc(co.referralCode||'')}</span></div>
      <button class="btn btn-block btn-primary btn-sm" style="margin-top:12px" onclick="App.requestReview('${p.id}')">${ico('star')} ${done?'Resend review request':'Send review and referral'}</button>
      ${aiReady()?`<button class="btn btn-block btn-sm" style="margin-top:8px" onclick="App.aiReviewDraft('${p.id}')">${ico('bolt')} AI review &amp; testimonial</button>`:''}
    </div>
  </div>`;
}
