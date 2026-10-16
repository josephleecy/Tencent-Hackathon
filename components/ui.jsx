'use client';
import {Check, AlertTriangle, HelpCircle, ShieldCheck, ArrowUpRight, X, Copy, Download} from 'lucide-react';
export const assetUrl=p=>(process.env.NEXT_PUBLIC_BASE_PATH||'')+p;
export function Button({children,variant='',className='',...props}){return <button className={`button ${variant} ${className}`} {...props}>{children}</button>;}
export function Tag({children,tone='neutral'}){return <span className={`tag ${tone}`}>{children}</span>;}
export function IconStatus({status}){const I=status==='pass'||status==='recommend'?Check:status==='clarify'?HelpCircle:AlertTriangle;return <span className={`status-icon ${status}`}><I size={15}/></span>;}
export function SectionTitle({eyebrow,title,children,action}){return <div className="section-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{children&&<p className="section-intro">{children}</p>}</div>{action}</div>;}
export function Note({children,tone=''}){return <div className={`note ${tone}`}><ShieldCheck size={17}/><span>{children}</span></div>;}
export function download(name,content,type='application/json'){const u=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
export async function copyText(text,onDone){try{await navigator.clipboard.writeText(text);onDone?.('Copied to clipboard.');}catch{onDone?.('Clipboard unavailable. Select and copy the text directly.');}}
export function Modal({title,onClose,children}){return <div className="modal-backdrop" onClick={onClose}><section role="dialog" aria-modal="true" aria-label={title} className="modal" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20}/></button></div>{children}</section></div>;}
export function SourceLink(){return <a className="text-link" href="https://www.keppel.com/realestate/Special-Features-Library/Keppel-South-Central---A-Sustainable-Workplace-for-the-Talents-of-Tomorrow" target="_blank" rel="noreferrer">Keppel’s published scenario <ArrowUpRight size={14}/></a>;}
