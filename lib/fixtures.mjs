export const SOURCE_TRANSCRIPT = [
  {id:'EX-01',speaker:'Expert',text:'Before recommending after-hours cooling, establish which zone is requested, whether its isolation is verified, and whether the tenant is entitled to the service. A floor name alone does not prove the equipment can operate independently.'},
  {id:'EX-02',speaker:'Interviewer',text:'What would make you stop rather than suggest a plan?'},
  {id:'EX-03',speaker:'Expert',text:'An active alarm, a maintenance lockout or a shared air-handling unit changes the decision. Escalate to the duty facilities engineer. If isolation or lease entitlement is unknown, ask for evidence first.'},
  {id:'EX-04',speaker:'Expert',text:'For this training scenario, a manager may review a zone-only proposal for up to two hours with at least one occupant and telemetry no older than fifteen minutes. These are illustrative rules, not a building operating procedure.'},
  {id:'EX-05',speaker:'Expert',text:'Always explain the service and energy trade-off to the manager. Never start equipment or promise a saving. Log the actual outcome so a proposed rule change can be tested before anyone approves it.'},
];

export const BASE_PILL = {
  schemaVersion:1,id:'relay-afterhours-cooling',version:'1.0.0',title:'After-hours cooling exception',
  owner:'Facilities Expertise Team (demo)',domain:'Asset Operations',status:'released',
  summary:'Prepare a supervised cooling-service proposal only when site context and evidence support it.',
  context:{assetType:'office',service:'after-hours-cooling',isolation:'verified'},
  sources:[{id:'EX-01',quote:SOURCE_TRANSCRIPT[0].text},{id:'EX-03',quote:SOURCE_TRANSCRIPT[2].text},{id:'EX-04',quote:SOURCE_TRANSCRIPT[3].text},{id:'EX-05',quote:SOURCE_TRANSCRIPT[4].text}],
  policy:{maxRequestMinutes:120,minOccupants:1,maxTelemetryAgeMinutes:15,requireVerifiedIsolation:true,requireLeaseEntitlement:true,blockMaintenance:true,requireManagerApproval:true},
  guardrails:['Recommendations only; no equipment control','Escalate active alarms and maintenance lockouts','Unknown context requires evidence','No automatic release after feedback'],
  changeNote:'Sample compiled from the synthetic training transcript. Not validated operating guidance.',
};

export const CANDIDATES = [
  {...structuredClone(BASE_PILL),version:'1.1.0-risky',status:'draft',changeNote:'Experimental permissive proposal: relax context and allow four-hour requests. Intentionally unsafe test candidate.',policy:{...BASE_PILL.policy,maxRequestMinutes:240,requireVerifiedIsolation:false,requireLeaseEntitlement:false}},
  {...structuredClone(BASE_PILL),version:'1.1.0',status:'draft',changeNote:'Clarifies provenance and the handoff to the duty manager. Preserves context and safety boundaries.'},
];

export const ASSETS = [
  {id:'tower-a',name:'Harbour Tower A',subtitle:'Verified micro-zones',type:'office',isolation:'verified',system:'Independent zone cooling',zone:'Level 12 · East',baselineKW:120,zoneKW:30,tariff:0.30},
  {id:'tower-b',name:'Harbour Tower B',subtitle:'Shared AHU · transfer restricted',type:'office',isolation:'shared',system:'Shared air-handling unit',zone:'Level 12 · East',baselineKW:120,zoneKW:30,tariff:0.30},
  {id:'tower-c',name:'Harbour Tower C',subtitle:'Isolation evidence missing',type:'office',isolation:'unknown',system:'Site mapping unverified',zone:'Level 7 · West',baselineKW:100,zoneKW:25,tariff:0.30},
];

export const INCIDENTS = [
  {id:'REQ-2048',title:'Tenant needs another 90 minutes',tenant:'Northstar Studio (synthetic)',zone:'Level 12 · East',requestedMinutes:90,occupants:8,telemetryAgeMinutes:4,leaseEntitled:true,maintenanceLockout:false,activeAlarm:false,note:'Eight colleagues are finishing a client presentation. Can the east zone remain comfortable until 21:30?'},
  {id:'REQ-2049',title:'Entitlement is not yet verified',tenant:'Cedar Labs (synthetic)',zone:'Level 12 · East',requestedMinutes:60,occupants:4,telemetryAgeMinutes:3,leaseEntitled:null,maintenanceLockout:false,activeAlarm:false,note:'The request is clear, but the after-hours service entitlement has not been checked.'},
  {id:'REQ-2050',title:'Maintenance lockout is active',tenant:'Northstar Studio (synthetic)',zone:'Level 12 · East',requestedMinutes:60,occupants:6,telemetryAgeMinutes:2,leaseEntitled:true,maintenanceLockout:true,activeAlarm:false,note:'A tenant requests cooling while maintenance has locked out the relevant equipment.'},
];

export const REPLAY_CASES = [
  {id:'R01',name:'Verified zone / normal request',assetId:'tower-a',input:{},expected:'recommend',critical:true},
  {id:'R02',name:'Shared AHU / invalid transfer',assetId:'tower-b',input:{},expected:'escalate',critical:true},
  {id:'R03',name:'Unknown isolation',assetId:'tower-c',input:{},expected:'clarify',critical:true},
  {id:'R04',name:'Maintenance lockout',assetId:'tower-a',input:{maintenanceLockout:true},expected:'escalate',critical:true},
  {id:'R05',name:'Lease entitlement unknown',assetId:'tower-a',input:{leaseEntitled:null},expected:'clarify',critical:true},
  {id:'R06',name:'Telemetry stale',assetId:'tower-a',input:{telemetryAgeMinutes:16},expected:'clarify',critical:true},
  {id:'R07',name:'Three-hour request outside policy',assetId:'tower-a',input:{requestedMinutes:180},expected:'escalate',critical:true},
  {id:'R08',name:'No occupants confirmed',assetId:'tower-a',input:{occupants:0},expected:'clarify',critical:false},
];
export const ACCEPTANCE_CASES = [
  {id:'A01',name:'Active alarm is escalated',assetId:'tower-a',input:{activeAlarm:true},expected:'escalate',critical:true},
  {id:'A02',name:'Denied contractual entitlement',assetId:'tower-a',input:{leaseEntitled:false},expected:'escalate',critical:true},
  {id:'A03',name:'Missing duration',assetId:'tower-a',input:{requestedMinutes:null},expected:'clarify',critical:true},
  {id:'A04',name:'Two-hour boundary',assetId:'tower-a',input:{requestedMinutes:120,telemetryAgeMinutes:15},expected:'recommend',critical:true},
  {id:'A05',name:'No asset evidence',assetId:'tower-c',input:{leaseEntitled:true},expected:'clarify',critical:true},
  {id:'A06',name:'Duration exceeds baseline limit',assetId:'tower-a',input:{requestedMinutes:121},expected:'escalate',critical:true},
];

export function initialState(){return {schemaVersion:1,activePill:structuredClone(BASE_PILL),candidate:structuredClone(CANDIDATES[1]),history:[],archive:[],feedback:[],evaluation:null,audit:[{id:'seed',type:'Sample loaded',at:'2026-10-16T06:00:00.000Z',actor:'Demo fixture',detail:'Synthetic baseline v1.0.0. No real operational approval.'}]};}
