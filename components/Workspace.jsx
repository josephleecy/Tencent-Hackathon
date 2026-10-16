'use client';
import {useEffect,useState} from 'react';
import {LayoutDashboard,AudioLines,Layers3,GitBranch,FlaskConical,ShieldCheck,ArrowUpRight,Download,ArrowRight,RotateCcw,FileText,Play,Check,ChevronRight,ExternalLink} from 'lucide-react';
import {initialState} from '../lib/fixtures.mjs';
import {restoreState,exportBundle} from '../lib/relay.mjs';
import {Button,Tag,Modal,download,assetUrl} from './ui';
import Overview from './views/Overview';
import Capture from './views/Capture';
import Pills from './views/Pills';
import Incident from './views/Incident';
import Replay from './views/Replay';
import Governance from './views/Governance';

const NAV=[['overview','Overview',LayoutDashboard],['capture','Capture Studio',AudioLines],['pills','Pill Library',Layers3],['incident','Incident Desk',GitBranch],['replay','Replay Lab',FlaskConical],['governance','Governance',ShieldCheck]];
const GUIDE=['Start with a synthetic expert interview. Stage its draft pill.','Inspect the portable context, evidence and guardrails.','Compare Tower A with Tower B. Watch the context boundary hold.','Test an unsafe candidate, then the corrected draft.','Release a passing draft, record feedback and try rollback.'];

export default function Workspace(){
  const [view,setView]=useState('overview');const [state,setState]=useState(initialState);const [ready,setReady]=useState(false);const [toast,setToast]=useState('');const [resources,setResources]=useState(false);const [guide,setGuide]=useState(false);const [reset,setReset]=useState(false);
  useEffect(()=>{try{const raw=localStorage.getItem('relay-demo-v1');if(raw)setState(restoreState(raw));}catch{}setReady(true);},[]);
  useEffect(()=>{if(ready)try{localStorage.setItem('relay-demo-v1',JSON.stringify(state));}catch{setToast('Browser storage unavailable. Export your session before leaving.');}},[state,ready]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),5000);return()=>clearTimeout(t);},[toast]);
  function navigate(v){setView(v);window.scrollTo({top:0,behavior:'smooth'});}
  function log(type,detail,actor='Demo operator'){return {id:globalThis.crypto?.randomUUID?.()||String(Date.now()),type,detail,actor,at:new Date().toISOString()};}
  function stage(p){setState(s=>({...s,candidate:{...p,status:'draft'},evaluation:null,audit:[log('Draft staged',`v${p.version} · ${p.changeNote}`),...s.audit]}));setToast('Draft staged. Evaluation and review are required before release.');}
  const props={state,setState,navigate,notify:setToast,log,stage};
  const index=NAV.findIndex(n=>n[0]===view);
  return <div className="workspace">
    <a href="#main" className="skip-link">Skip to content</a>
    <aside className="sidebar"><button className="brand" onClick={()=>navigate('overview')} aria-label="RELAY overview"><span className="brand-symbol">r<span/></span><span>relay<span className="brand-period">.</span></span></button><div className="workspace-label">EXPERTISE WORKSPACE</div><nav aria-label="Main navigation">{NAV.map(([id,label,Icon],i)=><button key={id} className={`nav-item ${view===id?'active':''}`} onClick={()=>navigate(id)} aria-current={view===id?'page':undefined}><Icon size={18}/><span>{label}</span>{id==='pills'&&<span className="nav-count">1</span>}{id==='replay'&&<span className="new-dot"/>}</button>)}</nav><div className="sidebar-bottom"><div className="portfolio-mark"><span className="portfolio-icon"><Layers3 size={18}/></span><div><strong>Harbour Portfolio</strong><small>Synthetic demonstration</small></div></div><div className="local-status"><span/>Browser-local session</div><button className="reset-link" onClick={()=>setReset(true)}><RotateCcw size={13}/> Reset demo</button></div></aside>
    <div className="main-shell"><header className="topbar"><div className="breadcrumb">Workspace <ChevronRight size={13}/><span>{NAV[index][1]}</span></div><div className="top-actions"><span className="prototype-label"><span/>Prototype</span><button className="resources-link" onClick={()=>setResources(true)}>Project resources <ArrowUpRight size={14}/></button><span className="avatar" aria-label="Demo user">D</span></div></header>
      <main id="main" className="main-content">
        {guide&&view!=='overview'&&<div className="guide-banner"><span className="guide-step">{index}/5</span><div><strong>Guided walkthrough</strong><span>{GUIDE[index-1]}</span></div><button className="text-link" onClick={()=>index<5?navigate(NAV[index+1][0]):setGuide(false)}>{index<5?'Next step':'Finish'}<ArrowRight size={14}/></button></div>}
        {view==='overview'&&<Overview {...props} startGuide={()=>{setGuide(true);navigate('capture');}} openResources={()=>setResources(true)}/>}
        {view==='capture'&&<Capture {...props}/>}{view==='pills'&&<Pills {...props}/>}{view==='incident'&&<Incident {...props}/>}{view==='replay'&&<Replay {...props}/>}{view==='governance'&&<Governance {...props}/>}
        <footer className="page-footer"><span>RELAY · Keppel Real Estate Track / AI HARVEST</span><span>Synthetic data. Supervised decisions. No equipment control.</span></footer>
      </main>
    </div>
    {toast&&<div className="toast" role="status"><Check size={17}/>{toast}<button className="toast-dismiss" aria-label="Dismiss notification" onClick={()=>setToast('')}>×</button></div>}
    {reset&&<Modal title="Reset this demo session" onClose={()=>setReset(false)}><p>This clears your local drafts, decisions and feedback and restores the synthetic examples. Export anything you want to keep first.</p><div className="button-row"><Button variant="secondary" onClick={()=>download('relay-session.json',exportBundle(state))}><Download size={16}/>Export first</Button><Button onClick={()=>{setState(initialState());setReset(false);setToast('Synthetic demo restored.');}}>Reset session</Button></div></Modal>}
    {resources&&<Modal title="Project resources" onClose={()=>setResources(false)}><p className="muted">The submission pack and source for this hackathon prototype.</p><div className="resource-list"><a href="https://github.com/josephleecy/Tencent-Hackathon" target="_blank" rel="noreferrer"><GitBranch/>Complete source code<ExternalLink size={16}/></a><a href={assetUrl('/RELAY-solution-diagram.pptx')} download><Layers3/>Solution diagram deck<Download size={16}/></a><a href={assetUrl('/demo/')}><Play/>Narrated demo walkthrough<ArrowUpRight size={16}/></a><a href={assetUrl('/project-description.md')} download><FileText/>Project description<Download size={16}/></a><a href={assetUrl('/relay-cover-upload.jpg')} download><Download/>Showcase cover<Download size={16}/></a></div><Button variant="secondary" onClick={()=>download('relay-session.json',exportBundle(state))}>Export current pill and session</Button></Modal>}
  </div>;
}
