import { BASE_PILL, ASSETS, INCIDENTS, REPLAY_CASES, ACCEPTANCE_CASES, initialState } from './fixtures.mjs';

const TOP_KEYS=['schemaVersion','id','version','title','owner','domain','status','summary','context','sources','policy','guardrails','changeNote'];
const POLICY_KEYS=Object.keys(BASE_PILL.policy);
const text=(x,max=1500)=>typeof x==='string'&&x.trim().length>0&&x.length<=max;
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const allowed=(o,keys)=>obj(o)&&Object.keys(o).every(k=>keys.includes(k));
const number=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
function canonical(x){if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';if(obj(x))return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';return JSON.stringify(x);}
function payload(p){const v=structuredClone(p);delete v.status;return canonical(v);}
export function fingerprint(p){let h=2166136261;for(const c of payload(p)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return 'rly-'+(h>>>0).toString(16).padStart(8,'0');}

export function validatePill(input){
  const errors=[];let p=input;
  if(typeof input==='string'){if(input.length>65536)return {ok:false,errors:['JSON exceeds 64 KB.']};try{p=JSON.parse(input);}catch{return {ok:false,errors:['Enter valid JSON.']};}}
  if(!allowed(p,TOP_KEYS))return {ok:false,errors:['Unsupported top-level fields or invalid pill object.']};
  if(p.schemaVersion!==1)errors.push('schemaVersion must be 1.');
  for(const k of ['id','title','owner','domain','summary','changeNote'])if(!text(p[k]))errors.push(k+' must be non-empty text.');
  if(!text(p.version,80)||!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(p.version))errors.push('Use a semantic version such as 1.1.0.');
  if(p.id!=='relay-afterhours-cooling'||p.domain!=='Asset Operations')errors.push('This prototype accepts the after-hours cooling domain only.');
  if(!allowed(p.context,['assetType','service','isolation'])||p.context.assetType!=='office'||p.context.service!=='after-hours-cooling'||p.context.isolation!=='verified')errors.push('Context must declare office, after-hours-cooling and verified isolation.');
  if(!Array.isArray(p.sources)||p.sources.length<1||p.sources.length>12||p.sources.some(s=>!allowed(s,['id','quote'])||!text(s.id,80)||!text(s.quote,3000)))errors.push('Supply 1-12 source references with excerpts.');
  else {const ids=p.sources.map(s=>s.id);if(new Set(ids).size!==ids.length||['EX-01','EX-03','EX-04','EX-05'].some(id=>!ids.includes(id)))errors.push('This interpreter requires distinct EX-01, EX-03, EX-04 and EX-05 evidence references.');}
  if(!allowed(p.policy,POLICY_KEYS)||POLICY_KEYS.some(k=>!(k in (p.policy||{}))))errors.push('Policy fields do not match the supported schema.');
  else {
    if(!number(p.policy.maxRequestMinutes,1,480))errors.push('Duration must be between 1 and 480 minutes.');
    if(!number(p.policy.minOccupants,1,200))errors.push('Minimum occupants must be 1-200.');
    if(!number(p.policy.maxTelemetryAgeMinutes,0,60))errors.push('Telemetry age must be 0-60 minutes.');
    for(const k of POLICY_KEYS.slice(3))if(typeof p.policy[k]!=='boolean')errors.push(k+' must be a boolean.');
  }
  if(!Array.isArray(p.guardrails)||p.guardrails.length<1||p.guardrails.length>12||p.guardrails.some(g=>!text(g)))errors.push('Supply 1-12 plain-text guardrails.');
  if(errors.length)return {ok:false,errors};
  return {ok:true,pill:{...structuredClone(p),status:'draft'},errors:[]};
}

export function evaluateIncident(pill,incident,asset,{sandbox=false}={}){
  const blocked=reason=>({status:'blocked',checks:[],reasons:[reason],actions:[],requiresApproval:true,executable:false});
  if(!validatePill(pill).ok)return blocked('The pill contract is invalid.');
  if(pill.status!=='released'&&!sandbox)return blocked('Only a released pill can support an operational recommendation.');
  const p=pill.policy;const checks=[];
  const add=(domain,status,detail,source)=>checks.push({domain,status,detail,source});
  if(!obj(asset)||asset.type!=='office')add('Operations','escalate','This capability is approved only for office assets. Obtain a site-specific expert review.','EX-01');
  else if(asset.isolation==='shared')add('Operations','escalate','Shared AHU: the verified-isolation context contract does not transfer. Escalate to the duty engineer.','EX-01, EX-03');
  else if(asset.isolation!=='verified')add('Operations','clarify','Verify the zone-to-equipment isolation mapping before making a proposal.','EX-01');
  else if(incident?.maintenanceLockout===true||incident?.activeAlarm===true)add('Operations','escalate','An active alarm or maintenance lockout requires the duty facilities engineer.','EX-03');
  else if(!obj(incident)||typeof incident.maintenanceLockout!=='boolean'||typeof incident.activeAlarm!=='boolean')add('Operations','clarify','Confirm alarm and maintenance status. Unknown is not a clear status.','EX-03');
  else if(!number(incident.telemetryAgeMinutes,0,p.maxTelemetryAgeMinutes))add('Operations','clarify','Obtain current telemetry; a missing, invalid or stale reading cannot support this proposal.','EX-04');
  else add('Operations','pass','Office context, isolation, equipment availability and telemetry checks passed.','EX-01, EX-03, EX-04');
  if(incident?.leaseEntitled===false)add('Tenant services','escalate','The entitlement check is negative. Ask the authorised service owner to resolve it.','EX-01');
  else if(incident?.leaseEntitled!==true)add('Tenant services','clarify','Confirm the tenant’s after-hours service entitlement; do not infer it from a message.','EX-01');
  else if(!number(incident?.occupants,p.minOccupants,10000))add('Tenant services','clarify','Confirm a valid occupied-zone request.','EX-04');
  else add('Tenant services','pass','Verified service entitlement and occupied-zone request. Prepare a clear tenant response.','EX-01, EX-04');
  if(!number(incident?.requestedMinutes,1,480))add('Energy','clarify','Confirm a valid requested duration in minutes.','EX-04');
  else if(incident.requestedMinutes>p.maxRequestMinutes)add('Energy','escalate','Requested duration exceeds the approved pill boundary; the manager needs specialist review.','EX-04');
  else add('Energy','pass','Duration is within the pill boundary. Compare zone-only service with the illustrative whole-floor counterfactual.','EX-04, EX-05');
  let status=checks.some(c=>c.status==='escalate')?'escalate':checks.some(c=>c.status==='clarify')?'clarify':'recommend';
  // Context, alarms, entitlement and human supervision are non-overridable interpreter boundaries.
  if(incident?.maintenanceLockout===true||incident?.activeAlarm===true)status='escalate';
  const reasons=checks.filter(c=>c.status!=='pass').map(c=>c.detail);
  const actions=status==='recommend'?['Ask the Asset Operations Manager to review the zone-only service proposal.','Have authorised facilities staff follow the site’s approved operating procedure.','Record the observed service outcome and actual metered energy separately.']:status==='escalate'?['Refer to the duty facilities engineer or service owner.','Keep the current approved operating procedure in force.']:['Obtain the missing evidence shown in the specialist checks.','Reassess after an authorised person verifies it.'];
  return {status,checks,reasons,actions,requiresApproval:true,executable:false};
}

export function runReplay(pill,cases=REPLAY_CASES,assets=ASSETS){
  const valid=validatePill(pill);if(!valid.ok)return {passed:0,total:cases.length,criticalFailures:1,eligible:false,results:[],errors:valid.errors,fingerprint:'invalid',payload:''};
  const results=cases.map(c=>{const r=evaluateIncident(pill,{...INCIDENTS[0],...c.input},assets.find(a=>a.id===c.assetId),{sandbox:true});return {...c,actual:r.status,passed:r.status===c.expected};});
  const unsafe=POLICY_KEYS.slice(3).filter(k=>pill.policy[k]!==true);
  const criticalFailures=results.filter(r=>r.critical&&!r.passed).length+unsafe.length;
  const passed=results.filter(r=>r.passed).length;
  return {passed,total:results.length,criticalFailures,eligible:passed===results.length&&criticalFailures===0,results,errors:unsafe.map(k=>'Non-negotiable boundary disabled: '+k),fingerprint:fingerprint(pill),payload:payload(pill),evaluatorVersion:'relay-evaluator-1'};
}

export function releasePill(pill,report,reviewer){
  if(!text(reviewer,100)||reviewer.trim().length<2)throw new Error('Enter a named reviewer. This remains a demo workflow, not authentication.');
  if(report?.payload!==payload(pill)||report.evaluatorVersion!=='relay-evaluator-1')throw new Error('The pill changed or has no current evaluation. Run replay again.');
  // A report is a display artifact, never authority. Recompute immutable suites at the release boundary.
  const replay=runReplay(pill,REPLAY_CASES,ASSETS);const acceptance=runReplay(pill,ACCEPTANCE_CASES,ASSETS);
  if(!replay.eligible||!acceptance.eligible)throw new Error('Release vetoed: fixed replay and acceptance checks must all pass.');
  return {...structuredClone(pill),status:'released'};
}
function safeRelease(p){return validatePill(p).ok&&p.status==='released'&&runReplay(p,REPLAY_CASES).eligible&&runReplay(p,ACCEPTANCE_CASES).eligible;}
export function rollback(state){
  if(!Array.isArray(state.history)||!state.history.length)throw new Error('No previous released version is available.');
  const s=structuredClone(state);const previous=s.history.pop();
  if(!safeRelease(previous))throw new Error('Previous release failed contract or fixed evaluation checks.');
  s.archive=[...(s.archive||[]),s.activePill];s.activePill=previous;s.evaluation=null;return s;
}
export function restoreState(raw){
  try{
    if(typeof raw!=='string'||raw.length>2000000)return initialState();
    const s=JSON.parse(raw);const array=(x,max)=>Array.isArray(x)&&x.length<=max;
    const date=x=>text(x,80)&&Number.isFinite(Date.parse(x));
    if(!obj(s)||s.schemaVersion!==1||!safeRelease(s.activePill)||!validatePill(s.candidate).ok)return initialState();
    if(!array(s.history,50)||s.history.some(p=>!safeRelease(p)))return initialState();
    const archive=s.archive??[];if(!array(archive,50)||archive.some(p=>!safeRelease(p)))return initialState();
    if(!array(s.audit,500)||s.audit.some(a=>!allowed(a,['id','type','detail','actor','at'])||!text(a.id,100)||!text(a.type,100)||!text(a.detail,6000)||!text(a.actor,100)||!date(a.at)))return initialState();
    if(!array(s.feedback,200)||s.feedback.some(f=>!allowed(f,['id','text','at','status'])||!text(f.id,100)||!text(f.text,1500)||!date(f.at)||f.status!=='pending-review'))return initialState();
    return {schemaVersion:1,activePill:s.activePill,candidate:{...s.candidate,status:'draft'},history:s.history,archive,feedback:s.feedback,audit:s.audit,evaluation:null};
  }catch{return initialState();}
}
export function exportBundle(state){return JSON.stringify({format:'relay-portable-pill',formatVersion:1,schemaVersion:1,notice:'Synthetic training material. Demo audit is local and editable, not an authenticated record.',pill:state.activePill,activePill:state.activePill,candidate:state.candidate,history:state.history,archive:state.archive||[],feedback:state.feedback,audit:state.audit},null,2);}
