"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";

const PRIORITIES = ["High", "Medium", "Low"];
const PRIORITY_SCORE = { High: 0, Medium: 1, Low: 2 };
const RECURRENCE = ["none", "daily", "weekly", "monthly"];
const PRIORITY_COLOR = {
  High:   { bg: "#3A1A1A", text: "#FF6B6B", border: "#7A2020" },
  Medium: { bg: "#2E2210", text: "#FFB347", border: "#7A5510" },
  Low:    { bg: "#1A2E1A", text: "#6FCF6F", border: "#2E6B2E" },
};
const PALETTE = [
  "#7B8FFF","#C77BFF","#4DD9D9","#FF8C5A","#FF6B6B",
  "#FFB347","#6FCF6F","#FF375F","#0A84FF","#FFD60A",
];
const KANBAN_COLS = ["To Do", "In Progress", "Done"];
const THEMES = {
  green:"#30D158", blue:"#0A84FF", purple:"#BF5AF2",
  red:"#FF453A", orange:"#FF9F0A", pink:"#FF375F",
};
const STORAGE_KEY = "mytasks_v4";

const DEFAULT_CATEGORIES = [
  { id:1, name:"Personal", color:"#7B8FFF" },
  { id:2, name:"Work",     color:"#4DD9D9" },
  { id:3, name:"Health",   color:"#6FCF6F" },
];
const DEFAULT_TASKS = [
  { id:1, title:"Example task 1", description:"", priority:"High",   categoryId:1, due:"2026-03-25", done:false, blockedBy:[], subtasks:[], kanban:"To Do",      tags:[], recurrence:"none" },
  { id:2, title:"Example task 2", description:"", priority:"Medium", categoryId:2, due:"2026-03-28", done:false, blockedBy:[1], subtasks:[], kanban:"To Do",     tags:[], recurrence:"none" },
  { id:3, title:"Example task 3", description:"", priority:"Medium", categoryId:1, due:"2026-03-24", done:false, blockedBy:[], subtasks:[{id:1,title:"Step 1",done:false},{id:2,title:"Step 2",done:true}], kanban:"In Progress", tags:["study"], recurrence:"weekly" },
];

const makeT = (accent: string) => ({
  bg:"#000", surface:"#1C1C1E", surfaceAlt:"#2C2C2E",
  border:"#3A3A3C", borderFaint:"#2C2C2E",
  text:"#fff", textSec:"rgba(235,235,245,.8)", textTert:"rgba(235,235,245,.6)",
  accent, accentRed:"#FF453A", accentAmber:"#FFD60A", pill:"#3A3A3C",
});

const iStyle = (T: any) => ({ width:"100%", boxSizing:"border-box" as const, background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:15, padding:"9px 12px", outline:"none" });
const selStyle = (T: any) => ({ flex:1, minWidth:100, background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:13, padding:"8px 10px", outline:"none" });

function Badge({ label, bg, text, border }: any) {
  return <span style={{ fontSize:11, fontWeight:600, padding:"2px 9px", borderRadius:20, border:`1px solid ${border}`, background:bg, color:text }}>{label}</span>;
}

function computeUrgency(task: any, today: string) {
  if (task.done) return 9999;
  let s = PRIORITY_SCORE[task.priority as keyof typeof PRIORITY_SCORE] * 30;
  if (task.due) { const d=Math.ceil((new Date(task.due).getTime()-new Date(today).getTime())/86400000); s+=d<0?-100+d*2:d*2; } else s+=60;
  return s;
}

function hexToRgb(hex: string) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

function catStyle(cat: any) {
  if(!cat) return { bg:"#2C2C2E", text:"#aaa", border:"#3A3A3C" };
  return { bg:`rgba(${hexToRgb(cat.color)},.15)`, text:cat.color, border:`rgba(${hexToRgb(cat.color)},.4)` };
}

function Confetti({ onDone }: { onDone: ()=>void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas=ref.current; if (!canvas) return; const ctx=canvas.getContext("2d"); if (!ctx) return;
    canvas.width=window.innerWidth; canvas.height=window.innerHeight;
    const pieces=Array.from({length:120},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height-canvas.height,r:Math.random()*6+4,d:Math.random()*120,color:`hsl(${Math.random()*360},90%,60%)`,tilt:Math.random()*10-10,tiltAngle:0,tiltSpeed:Math.random()*.1+.05}));
    let frame: number, angle=0, count=0;
    function draw(){
      if(!ctx || !canvas) return;
      ctx.clearRect(0,0,canvas.width,canvas.height);angle+=.01;
      pieces.forEach(p=>{
        p.tiltAngle+=p.tiltSpeed; p.y+=Math.cos(angle+p.d)+2; p.x+=Math.sin(angle)*.5; p.tilt=15*Math.sin(p.tiltAngle);
        ctx.beginPath(); ctx.lineWidth=p.r; ctx.strokeStyle=p.color; ctx.moveTo(p.x+p.tilt+p.r/2,p.y); ctx.lineTo(p.x+p.tilt,p.y+p.tilt+p.r/2); ctx.stroke();
        if(p.y>canvas.height+10){p.y=-10; p.x=Math.random()*canvas.width;}
      });
      count++;
      if(count<120) frame=requestAnimationFrame(draw);
      else { cancelAnimationFrame(frame); onDone(); }
    }
    frame=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(frame);
  },[onDone]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:999,pointerEvents:"none"}}/>;
}

function CategoryManager({ categories, T, onSave, onClose }: any) {
  const [cats, setCats] = useState(categories.map((c:any)=>({...c})));
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PALETTE[0]);
  const [editingId, setEditingId] = useState(null);

  function addCat() {
    if (!newName.trim()) return;
    const id = Date.now();
    setCats((cs:any) => [...cs, { id, name:newName.trim(), color:newColor }]);
    setNewName(""); setNewColor(PALETTE[0]);
  }
  function deleteCat(id:any) { setCats((cs:any) => cs.filter((c:any)=>c.id!==id)); }
  function updateName(id:any, name:any) { setCats((cs:any)=>cs.map((c:any)=>c.id===id?{...c,name}:c)); }
  function updateColor(id:any, color:any) { setCats((cs:any)=>cs.map((c:any)=>c.id===id?{...c,color}:c)); }

  return (
    <div style={{position:"fixed",inset:0,zIndex:150,display:"flex",flexDirection:"column",justifyContent:"flex-end",background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:T.surface,borderRadius:"24px 24px 0 0",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px"}}>
          <span style={{fontSize:17,fontWeight:600}}>Categories</span>
          <button onClick={onClose} style={{background:T.surfaceAlt,border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",color:T.textTert}}>x</button>
        </div>
        <div style={{padding:"0 20px 48px",display:"flex",flexDirection:"column",gap:10}}>
          {cats.map((cat:any) => (
            <div key={cat.id} style={{background:T.surfaceAlt,borderRadius:14,padding:"12px 14px",border:`1px solid rgba(${hexToRgb(cat.color)},.3)`}}>
              {editingId===cat.id ? (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <input value={cat.name} onChange={e=>updateName(cat.id,e.target.value)} style={{...iStyle(T),fontSize:14}}/>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {PALETTE.map(c=>(<button key={c} onClick={()=>updateColor(cat.id,c)} style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${cat.color===c?"#fff":"transparent"}`,background:c,cursor:"pointer"}}/>))}
                  </div>
                  <button onClick={()=>setEditingId(null)} style={{padding:"8px",borderRadius:10,border:"none",background:T.accent,color:"#000",fontWeight:600,cursor:"pointer",fontSize:13}}>Done</button>
                </div>
              ) : (
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:14,height:14,borderRadius:"50%",background:cat.color,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:15,fontWeight:500,color:T.text}}>{cat.name}</span>
                  <button onClick={(e: any)=>setEditingId(cat.id)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.textTert,fontSize:12,padding:"4px 10px",cursor:"pointer"}}>Edit</button>
                  <button onClick={()=>deleteCat(cat.id)} style={{background:"none",border:"none",color:T.accentRed,fontSize:18,cursor:"pointer",padding:"0 2px"}}>x</button>
                </div>
              )}
            </div>
          ))}
          <div style={{background:T.surfaceAlt,borderRadius:14,padding:"14px",border:`1px dashed ${T.border}`,marginTop:4}}>
            <p style={{fontSize:12,color:T.textTert,fontWeight:500,margin:"0 0 10px",textTransform:"uppercase",letterSpacing:.4}}>New Category</p>
            <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCat()} placeholder="Category name..." style={{...iStyle(T),marginBottom:10,fontSize:14}}/>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
              {PALETTE.map(c=>(<button key={c} onClick={()=>setNewColor(c)} style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${newColor===c?"#fff":"transparent"}`,background:c,cursor:"pointer"}}/>))}
            </div>
            <button onClick={addCat} style={{width:"100%",padding:10,borderRadius:10,border:"none",background:T.accent,color:"#000",fontWeight:600,cursor:"pointer",fontSize:14}}>+ Add Category</button>
          </div>
          <button onClick={()=>onSave(cats)} style={{width:"100%",padding:14,borderRadius:14,border:"none",background:T.accent,color:"#000",fontSize:16,fontWeight:700,cursor:"pointer",marginTop:4}}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function SwipeCard({ children, onComplete, onOpen, disabled }: any) {
  const startX=useRef(0);const[offset,setOffset]=useState(0);const[swiped,setSwiped]=useState(false);
  return(
    <div style={{position:"relative",overflow:"hidden",borderRadius:16}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:80,display:"flex",alignItems:"center",justifyContent:"center",background:"#30D158",borderRadius:16}}><span style={{fontSize:20}}>✓</span></div>
      <div onTouchStart={e=>startX.current=e.touches[0].clientX} onTouchMove={e=>{const dx=e.touches[0].clientX-startX.current;if(dx>0&&!disabled)setOffset(Math.min(dx,100));}} onTouchEnd={()=>{if(offset>60&&!disabled){setSwiped(true);setTimeout(()=>{onComplete();setSwiped(false);setOffset(0);},300);}else setOffset(0);}} onClick={onOpen}
      style={{transform:`translateX(${swiped?100:offset}px)`,transition:offset===0?"transform .25s ease":"none",position:"relative",zIndex:1}}>
        {children}
      </div>
    </div>
  );
}

function SettingsModal({ T, current, onChange, onClose }: any) {
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",flexDirection:"column",justifyContent:"flex-end",background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:T.surface,borderRadius:"24px 24px 0 0",padding:"20px 24px 48px"}}>
        <p style={{fontSize:17,fontWeight:600,marginBottom:20}}>Theme Color</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {Object.entries(THEMES).map(([name,color])=>(
            <button key={name} onClick={()=>{onChange(color);onClose();}} style={{padding:"14px 10px",borderRadius:14,border:`2px solid ${current===color?color:T.border}`,background:current===color?`${color}22`:T.surfaceAlt,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:color}}/>
              <span style={{fontSize:13,color:T.textSec,textTransform:"capitalize",fontWeight:current===color?600:400}}>{name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState<any[] | null>(null);
  const [categories, setCategories] = useState<any[] | null>(null);
  const [nextId, setNextId] = useState(10);
  const [accentColor, setAccent] = useState(THEMES.green);
  const [filter, setFilter] = useState({ categoryId:"All" as any, priority:"All", tag:"" });
  const [sortBy, setSortBy] = useState("smart");
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ title:"", description:"", priority:"Medium", categoryId:null as any, due:"", blockedBy:[], subtasks:[], tags:[], kanban:"To Do", recurrence:"none" });
  const [showForm, setShowForm] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const [selected, setSelected] = useState<any>(null);
  const [showTheme, setShowTheme] = useState(false);
  const [showCatMgr, setCatMgr] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const T = useMemo(()=>makeT(accentColor),[accentColor]);

  useEffect(()=>{
    try{
      const val = localStorage.getItem(STORAGE_KEY);
      if(val){const d=JSON.parse(val);setTasks(d.tasks);setCategories(d.categories||DEFAULT_CATEGORIES);if(d.nextId)setNextId(d.nextId);if(d.accent)setAccent(d.accent);}
      else{setTasks(DEFAULT_TASKS);setCategories(DEFAULT_CATEGORIES);}
    }catch{setTasks(DEFAULT_TASKS);setCategories(DEFAULT_CATEGORIES);}
  },[]);

  useEffect(()=>{
    if(tasks===null||categories===null)return;
    setSaveState("saving");
    const t=setTimeout(()=>{
      try{localStorage.setItem(STORAGE_KEY,JSON.stringify({tasks,categories,nextId,accent:accentColor}));setSaveState("saved");setTimeout(()=>setSaveState("idle"),1500);}
      catch{setSaveState("error");}
    },600);
    return()=>clearTimeout(t);
  },[tasks,categories,nextId,accentColor]);

  useEffect(()=>{ if(categories&&form.categoryId===null) setForm(f=>({...f,categoryId:categories[0]?.id||null})); },[categories]);

  const today=new Date().toISOString().split("T")[0];
  const getCat=(id:any)=>categories?.find(c=>c.id===id);
  function isBlocked(task:any){return task.blockedBy.some((bid:any)=>{const d=tasks?.find(t=>t.id===bid);return d&&!d.done;});}
  function toggleDone(id:any){
    const t=tasks?.find(t=>t.id===id);if(!t||isBlocked(t))return;
    const completing=!t.done;
    setTasks((ts:any)=>ts.map((t:any)=>{
      if(t.id!==id)return t;
      if(completing&&t.recurrence&&t.recurrence!=="none"){const due=t.due?new Date(t.due):new Date();if(t.recurrence==="daily")due.setDate(due.getDate()+1);else if(t.recurrence==="weekly")due.setDate(due.getDate()+7);else if(t.recurrence==="monthly")due.setMonth(due.getMonth()+1);return{...t,done:false,due:due.toISOString().split("T")[0],subtasks:(t.subtasks||[]).map((s:any)=>({...s,done:false}))};}
      return{...t,done:completing,kanban:completing?"Done":t.kanban};
    }));
    if(completing)setConfetti(true);
  }
  function addTask(){
    if(!form.title.trim())return;
    const id=nextId;setNextId(n=>n+1);
    setTasks((ts:any)=>[...ts,{...form,id,done:false,subtasks:[]}]);
    setForm(f=>({...f,title:"",description:"",due:"",blockedBy:[],tags:[],kanban:"To Do",recurrence:"none"}));
    setShowForm(false);
  }
  function saveCategories(cats:any){
    setCategories(cats);
    setTasks((ts:any)=>ts.map((t:any)=>cats.find((c:any)=>c.id===t.categoryId)?t:{...t,categoryId:cats[0]?.id||null}));
    setCatMgr(false);
  }

  const sorted=useMemo(()=>{
    if(!tasks)return[];
    let base=tasks.filter(t=>
      (filter.categoryId==="All"||t.categoryId===filter.categoryId)&&
      (filter.priority==="All"||t.priority===filter.priority)&&
      (!filter.tag||((t.tags||[]).includes(filter.tag)))&&
      (!search||t.title.toLowerCase().includes(search.toLowerCase())||(t.description||"").toLowerCase().includes(search.toLowerCase()))
    );
    return[...base].sort((a,b)=>{
      if(sortBy==="smart")return computeUrgency(a,today)-computeUrgency(b,today);
      if(sortBy==="due")return(!a.due&&!b.due)?0:!a.due?1:!b.due?-1:a.due.localeCompare(b.due);
      if(sortBy==="priority"){const pd=PRIORITY_SCORE[a.priority as keyof typeof PRIORITY_SCORE]-PRIORITY_SCORE[b.priority as keyof typeof PRIORITY_SCORE];return pd!==0?pd:(!a.due&&!b.due)?0:!a.due?1:!b.due?-1:a.due.localeCompare(b.due);}
      return 0;
    });
  },[tasks,filter,sortBy,today,search]);

  if(tasks===null||categories===null)return(
    <div style={{minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"#fff"}}>Loading...</p></div>
  );

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"-apple-system, sans-serif",paddingBottom:80,maxWidth:"600px",margin:"0 auto"}}>
      <style>{`*{-webkit-tap-highlight-color:transparent}`}</style>
      {confetti&&<Confetti onDone={()=>setConfetti(false)}/>}
      {showTheme&&<SettingsModal T={T} current={accentColor} onChange={setAccent} onClose={()=>setShowTheme(false)}/>}
      {showCatMgr&&<CategoryManager categories={categories} T={T} onSave={saveCategories} onClose={()=>setCatMgr(false)}/>}
      
      <div style={{padding:"24px 20px 12px",display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div><h1 style={{margin:"2px 0 0",fontSize:34,fontWeight:700}}>My Tasks</h1></div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShowTheme(true)} style={{background:T.surfaceAlt,border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",fontSize:16}}>🎨</button>
          <button onClick={()=>setShowForm(s=>!s)} style={{background:showForm?T.surfaceAlt:T.accent,border:"none",borderRadius:20,color:showForm?T.textSec:"#000",fontSize:14,fontWeight:600,padding:"8px 18px",cursor:"pointer"}}>{showForm?"Cancel":"+ Add"}</button>
        </div>
      </div>

      {showForm&&(
        <div style={{margin:"0 16px 14px",background:T.surface,borderRadius:16,padding:16}}>
          <input placeholder="Task title..." value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addTask()} style={{...iStyle(T),marginBottom:10}}/>
          <button onClick={addTask} style={{width:"100%",padding:12,borderRadius:12,border:"none",background:T.accent,color:"#000",fontSize:15,fontWeight:600,cursor:"pointer"}}>Add Task</button>
        </div>
      )}

      <div style={{padding:"0 16px 10px",overflowX:"auto",display:"flex",gap:8,scrollbarWidth:"none"}}>
        <button onClick={()=>setFilter(f=>({...f,categoryId:"All"}))} style={{...selStyle(T), background:filter.categoryId==="All"?T.accent:T.surfaceAlt, color:filter.categoryId==="All"?"#000":T.textSec}}>All</button>
        {categories.map(cat=>(
          <button key={cat.id} onClick={()=>setFilter(f=>({...f,categoryId:cat.id}))} style={{...selStyle(T), background:filter.categoryId===cat.id?catStyle(cat).bg:T.surfaceAlt, color:filter.categoryId===cat.id?catStyle(cat).text:T.textSec}}>
            {cat.name}
          </button>
        ))}
      </div>

      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
        {sorted.map((task,i)=>{
          const blk=isBlocked(task), isOverdue=!task.done&&task.due&&task.due<today;
          const cat=getCat(task.categoryId); const cs=catStyle(cat);
          return(
            <SwipeCard key={task.id} onComplete={()=>toggleDone(task.id)} onOpen={()=>setSelected(task.id)} disabled={blk||task.done}>
              <div style={{background:T.surface,borderRadius:16,padding:"14px 16px",border:`1px solid ${T.borderFaint}`,opacity:task.done?.5:1}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <button onClick={e=>{e.stopPropagation();toggleDone(task.id);}} style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${task.done?T.accent:T.border}`,background:task.done?T.accent:"transparent",cursor:"pointer"}}>{task.done&&<span style={{color:"#000",fontSize:11,fontWeight:700}}>✓</span>}</button>
                  <div style={{flex:1}}><span style={{fontSize:15,textDecoration:task.done?"line-through":"none"}}>{task.title}</span></div>
                </div>
              </div>
            </SwipeCard>
          );
        })}
      </div>
    </div>
  );
}
