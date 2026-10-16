import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePill, evaluateIncident, runReplay, releasePill, rollback, restoreState, exportBundle } from '../lib/relay.mjs';
import { BASE_PILL, CANDIDATES, ASSETS, INCIDENTS, REPLAY_CASES, ACCEPTANCE_CASES, initialState } from '../lib/fixtures.mjs';

const copy = x => structuredClone(x);
test('verified office request returns a supervised plan with all three specialist checks', () => {
  const r = evaluateIncident(BASE_PILL, INCIDENTS[0], ASSETS[0]);
  assert.equal(r.status, 'recommend');
  assert.equal(r.checks.length, 3);
  assert.equal(r.requiresApproval, true);
  assert.equal(r.executable, false);
});
test('shared AHU refuses transfer even when the pill relaxes isolation', () => {
  const p = copy(BASE_PILL); p.policy.requireVerifiedIsolation = false;
  assert.equal(evaluateIncident(p, INCIDENTS[0], ASSETS[1]).status, 'escalate');
});
test('unknown lease evidence asks for clarification', () => {
  assert.equal(evaluateIncident(BASE_PILL, {...INCIDENTS[0], leaseEntitled:null}, ASSETS[0]).status, 'clarify');
});
test('maintenance and alarms always escalate', () => {
  for (const extra of [{maintenanceLockout:true},{activeAlarm:true}]) {
    assert.equal(evaluateIncident(BASE_PILL, {...INCIDENTS[0],...extra}, ASSETS[0]).status,'escalate');
  }
});
test('stale telemetry cannot produce a recommendation', () => {
  assert.equal(evaluateIncident(BASE_PILL,{...INCIDENTS[0],telemetryAgeMinutes:16},ASSETS[0]).status,'clarify');
});
test('invalid telemetry and request duration cannot be coerced into safe numbers', () => {
  for (const extra of [{telemetryAgeMinutes:-1},{requestedMinutes:NaN},{occupants:'8'},{requestedMinutes:0}]) {
    assert.equal(evaluateIncident(BASE_PILL,{...INCIDENTS[0],...extra},ASSETS[0]).status,'clarify');
  }
});
test('data centre context is refused even with verified isolation', () => {
  assert.equal(evaluateIncident(BASE_PILL,INCIDENTS[0],{...ASSETS[0],type:'data-centre'}).status,'escalate');
});
test('unreleased version cannot be used operationally', () => {
  assert.equal(evaluateIncident({...BASE_PILL,status:'draft'},INCIDENTS[0],ASSETS[0]).status,'blocked');
});
test('valid JSON import always becomes draft even if it claims release', () => {
  const r=validatePill(JSON.stringify(BASE_PILL));
  assert.equal(r.ok,true); assert.equal(r.pill.status,'draft');
});
test('scripts, arbitrary policy keys, missing provenance and bad versions are rejected', () => {
  for(const change of [p=>p.script='alert(1)',p=>p.policy.execute='bms.write',p=>p.sources=[],p=>p.version='latest']) {
    const p=copy(BASE_PILL); change(p); assert.equal(validatePill(p).ok,false);
  }
});
test('malformed, oversized, null and prototype-bearing imports are rejected', () => {
  for(const input of ['{', ' '.repeat(65537), null, '{"__proto__":{"admin":true}}']) assert.equal(validatePill(input).ok,false);
});
test('fixed replay and acceptance cases evaluate the approved baseline', () => {
  const a=runReplay(BASE_PILL,REPLAY_CASES,ASSETS);
  const b=runReplay(BASE_PILL,ACCEPTANCE_CASES,ASSETS);
  assert.equal(a.passed, REPLAY_CASES.length); assert.equal(b.passed,ACCEPTANCE_CASES.length);
  assert.equal(a.criticalFailures,0);
});
test('an unsafe policy is vetoed regardless of average scenario score', () => {
  const r=runReplay(CANDIDATES[0],REPLAY_CASES,ASSETS);
  assert.equal(r.eligible,false); assert.ok(r.criticalFailures>0);
  assert.throws(()=>releasePill(CANDIDATES[0],r,'Facilities reviewer'));
});
test('release reevaluates fixed acceptance cases rather than trusting a forged report', () => {
  const p=copy(CANDIDATES[1]); p.policy.maxRequestMinutes=240;
  const forged={...runReplay(CANDIDATES[1],REPLAY_CASES,ASSETS),eligible:true};
  assert.throws(()=>releasePill(p,forged,'Reviewer'));
});
test('release requires a named reviewer and matching current payload', () => {
  const p=copy(CANDIDATES[1]); const report=runReplay(p,REPLAY_CASES,ASSETS);
  assert.equal(report.eligible,true);
  assert.throws(()=>releasePill(p,report,'  '));
  assert.equal(releasePill(p,report,'Maya Tan').status,'released');
  p.policy.maxRequestMinutes=110;
  assert.throws(()=>releasePill(p,report,'Maya Tan'));
});
test('rollback restores an earlier release and leaves feedback outside policy', () => {
  const s=initialState(); const old=copy(s.activePill);
  const p=copy(CANDIDATES[1]); s.activePill=releasePill(p,runReplay(p,REPLAY_CASES,ASSETS),'Reviewer');
  s.history.push(old); s.feedback.push({text:'Please allow shared AHU'});
  const next=rollback(s);
  assert.equal(next.activePill.version,old.version);
  assert.equal(next.activePill.policy.requireVerifiedIsolation,true);
  assert.equal(next.feedback.length,1);
});
test('corrupt persisted state resets safely and imported export preserves policy semantics', () => {
  for(const v of ['{', '{}', '{"activePill":null}', '{"activePill":{"policy":{}}}']) assert.equal(restoreState(v).activePill.version,'1.0.0');
  const s=initialState(); const bundle=JSON.parse(exportBundle(s));
  assert.equal(bundle.pill.policy.maxRequestMinutes,120);
  assert.equal(validatePill(bundle.pill).ok,true);
});
test('malformed persisted audit and feedback records are rejected before rendering', () => {
  for(const [key,records] of [['audit',[null]],['feedback',[null]],['audit',[{id:'x',type:{},detail:'text',actor:'a',at:'bad'}]]]){
    const s=initialState();s[key]=records;
    const restored=restoreState(JSON.stringify(s));
    assert.equal(restored.audit[0].id,'seed');assert.equal(restored.feedback.length,0);
  }
});
test('persisted unsafe history resets safely and direct rollback cannot activate it', () => {
  const s=initialState();s.history=[{...copy(CANDIDATES[0]),status:'released'}];
  assert.equal(restoreState(JSON.stringify(s)).history.length,0);
  assert.throws(()=>rollback(s));
});
test('every interpreter source reference must resolve within imported evidence', () => {
  const p=copy(CANDIDATES[1]);p.sources=[{id:'CUSTOM-01',quote:'A synthetic source.'}];
  assert.equal(validatePill(p).ok,false);
  const q=copy(BASE_PILL);q.sources=q.sources.filter(s=>s.id!=='EX-04');
  assert.equal(validatePill(q).ok,false);
});
test('session export preserves the current draft and lets it be restored', () => {
  const s=initialState();s.candidate.changeNote='A custom draft worth preserving.';
  const bundle=exportBundle(s);const value=JSON.parse(bundle);
  assert.equal(value.candidate.changeNote,'A custom draft worth preserving.');
  assert.equal(restoreState(bundle).candidate.changeNote,'A custom draft worth preserving.');
});
test('successive rollbacks reach earlier releases instead of toggling', () => {
  const s=initialState();const one=copy(BASE_PILL);const two={...copy(BASE_PILL),version:'1.1.0'};
  s.history=[one,two];s.activePill={...copy(BASE_PILL),version:'1.2.0'};
  const a=rollback(s);const b=rollback(a);
  assert.equal(a.activePill.version,'1.1.0');assert.equal(b.activePill.version,'1.0.0');
  assert.equal(b.archive.length,2);assert.throws(()=>rollback(b));
});
