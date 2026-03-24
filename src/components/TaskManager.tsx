"use client";
import { useState, useMemo, useEffect, useRef } from "react";

const LANGS = {
en: { tasks:"Tasks", myTasks:"My Tasks", add:"+ Add", cancel:"Cancel", done:"Done", blocked:"Blocked", overdue:"Overdue", complete:"% complete", search:"Search tasks...", saving:"Saving...", saved:"✓ Saved", error:"⚠ Error", list:"☰ List", kanban:"⬜ Kanban", calendar:"📅 Calendar", categories:"🗂 Categories", backup:"⬇ Backup", importBtn:"⬆ Import", all:"All", allTags:"All tags", sort:"Sort:", urgency:"Urgency", due:"Due", priority:"Priority", noTasks:"No tasks here yet.", noResults:"No results.", title:"Title", description:"Description", descPlaceholder:"Notes, links, context...", category:"Category", repeat:"Repeat", kanbanCol:"Kanban", tags:"Tags", addTag:"Add tag...", subtasks:"Subtasks", addSubtask:"Add subtask...", saveChanges:"Save Changes", deleteTask:"Delete Task", taskDetails:"Task Details", blockedBy:"Blocked by", addTask:"Add Task", titlePlaceholder:"Task title...", descPlaceholderShort:"Description (optional)...", focusOn:"Focus on", exitFocus:"Exit Focus", markDone:"✓ Mark as Done", noTasksDay:"No tasks for this day 🎉", sessions:"Sessions today:", work:"Work", breakS:"Break", longBreak:"Long Break", focus:"Focus", shortBreak:"Short Break", themeColor:"🎨 Theme Color", darkMode:"Dark Mode", lightMode:"Light Mode", language:"Language", appearance:"Appearance", newCategory:"New Category", catName:"Category name...", addCategory:"+ Add Category", edit:"Edit", editDone:"Done", statsTitle:"📊 Stats", total:"Total", overallProgress:"Overall Progress", byCategory:"By Category", pendingPriority:"Pending by Priority", tagsInUse:"Tags in use", none:"none", daily:"daily", weekly:"weekly", monthly:"monthly", high:"High", medium:"Medium", low:"Low", toDo:"To Do", inProgress:"In Progress", empty:"Empty", needsLabel:"Needs:", subtaskCount:(d:any,t:any)=>`${d}/${t} subtasks` },
es: { tasks:"Tareas", myTasks:"Mis Tareas", add:"+ Agregar", cancel:"Cancelar", done:"Listas", blocked:"Bloqueadas", overdue:"Vencidas", complete:"% completado", search:"Buscar tareas...", saving:"Guardando...", saved:"✓ Guardado", error:"⚠ Error", list:"☰ Lista", kanban:"⬜ Kanban", calendar:"📅 Calendario", categories:"🗂 Categorías", backup:"⬇ Backup", importBtn:"⬆ Importar", all:"Todas", allTags:"Todos los tags", sort:"Ordenar:", urgency:"Urgencia", due:"Fecha", priority:"Prioridad", noTasks:"Sin tareas por aquí.", noResults:"Sin resultados.", title:"Título", description:"Descripción", descPlaceholder:"Notas, links, contexto...", category:"Categoría", repeat:"Repetir", kanbanCol:"Kanban", tags:"Tags", addTag:"Agregar tag...", subtasks:"Subtareas", addSubtask:"Agregar subtarea...", saveChanges:"Guardar Cambios", deleteTask:"Eliminar Tarea", taskDetails:"Detalle de Tarea", blockedBy:"Bloqueada por", addTask:"Agregar Tarea", titlePlaceholder:"Título de la tarea...", descPlaceholderShort:"Descripción (opcional)...", focusOn:"Enfócate en", exitFocus:"Salir del Foco", markDone:"✓ Marcar como Lista", noTasksDay:"Sin tareas este día 🎉", sessions:"Sesiones hoy:", work:"Trabajo", breakS:"Descanso", longBreak:"Descanso Largo", focus:"Enfoque", shortBreak:"Descanso Corto", themeColor:"🎨 Color del Tema", darkMode:"Modo Oscuro", lightMode:"Modo Claro", language:"Idioma", appearance:"Apariencia", newCategory:"Nueva Categoría", catName:"Nombre de categoría...", addCategory:"+ Agregar Categoría", edit:"Editar", editDone:"Listo", statsTitle:"📊 Estadísticas", total:"Total", overallProgress:"Progreso General", byCategory:"Por Categoría", pendingPriority:"Pendientes por Prioridad", tagsInUse:"Tags en uso", none:"ninguno", daily:"diario", weekly:"semanal", monthly:"mensual", high:"Alta", medium:"Media", low:"Baja", toDo:"Por Hacer", inProgress:"En Progreso", empty:"Vacío", needsLabel:"Necesita:", subtaskCount:(d:any,t:any)=>`${d}/${t} subtareas` }
};

const PRIORITIES = ["High", "Medium", "Low"];
const PRIORITY_SCORE = { High:0, Medium:1, Low:2 };
const RECURRENCE = ["none","daily","weekly","monthly"];
const PRIORITY_COLOR = { High: { bg:"#3A1A1A", text:"#FF6B6B", border:"#7A2020" }, Medium: { bg:"#2E2210", text:"#FFB347", border:"#7A5510" }, Low: { bg:"#1A2E1A", text:"#6FCF6F", border:"#2E6B2E" } };
const PRIORITY_COLOR_LIGHT = { High: { bg:"#FFE5E5", text:"#C0392B", border:"#F5A5A5" }, Medium: { bg:"#FFF3E0", text:"#D35400", border:"#FBCF9A" }, Low: { bg:"#E8F8E8", text:"#27AE60", border:"#A8E0A8" } };
const PALETTE = ["#7B8FFF","#C77BFF","#4DD9D9","#FF8C5A","#FF6B6B","#FFB347","#6FCF6F","#FF375F","#0A84FF","#FFD60A"];
const KANBAN_COLS = ["To Do","In Progress","Done"];
const THEMES = { green:"#30D158", blue:"#0A84FF", purple:"#BF5AF2", red:"#FF453A", orange:"#FF9F0A", pink:"#FF375F" };
const STORAGE_KEY = "mytasks_v5";
const DEFAULT_CATEGORIES = [ { id:1, name:"Personal", color:"#7B8FFF" }, { id:2, name:"Work", color:"#4DD9D9" }, { id:3, name:"Health", color:"#6FCF6F" } ];
const DEFAULT_TASKS = [ { id:1, title:"Example task 1", description:"", priority:"High", categoryId:1, due:"2026-03-28", done:false, blockedBy:[], subtasks:[], kanban:"To Do", tags:[], recurrence:"none" } ];

function makeT(accent: string, dark: boolean) {
  return dark ? { bg:"#000", surface:"#1C1C1E", surfaceAlt:"#2C2C2E", border:"#3A3A3C", borderFaint:"#2C2C2E", text:"#fff", textSec:"rgba(235,235,245,.8)", textTert:"rgba(235,235,245,.6)", accent, accentRed:"#FF453A", accentAmber:"#FFD60A", pill:"#3A3A3C", dark:true } : { bg:"#F2F2F7", surface:"#FFFFFF", surfaceAlt:"#E5E5EA", border:"#C7C7CC", borderFaint:"#E5E5EA", text:"#000", textSec:"rgba(0,0,0,.7)", textTert:"rgba(0,0,0,.45)", accent, accentRed:"#FF3B30", accentAmber:"#FF9500", pill:"#E5E5EA", dark:false };
}

const iStyle = (T:any) => ({ width:"100%", boxSizing:"border-box" as const, background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:15, padding:"9px 12px", outline:"none" });
const selStyle = (T:any) => ({ flex:1, minWidth:100, background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:13, padding:"8px 10px", outline:"none" });

function hexToRgb(hex:string) { const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return `${r},${g},${b}`; }
function catStyle(cat:any) { if(!cat) return { bg:"#2C2C2E", text:"#aaa", border:"#3A3A3C" }; return { bg:`rgba(${hexToRgb(cat.color)},.15)`, text:cat.color, border:`rgba(${hexToRgb(cat.color)},.4)` }; }
function Badge({ label, bg, text, border }:any) { return <span style={{ fontSize:11, fontWeight:600, padding:"2px 9px", borderRadius:20, border:`1px solid ${border}`, background:bg, color:text }}>{label}</span>; }
function computeUrgency(task:any, today:any) { if(task.done) return 9999; let s=(PRIORITY_SCORE as any)[task.priority]*30; if(task.due){const d=Math.ceil((new Date(task.due).getTime()-new Date(today).getTime())/86400000);s+=d<0?-100+d*2:d*2;}else s+=60; return s; }

function Confetti({ onDone }:any) {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current; if(!canvas)return; const ctx=canvas.getContext("2d"); if(!ctx)return;
    canvas.width=window.innerWidth;canvas.height=window.innerHeight;
    const pieces=Array.from({length:120},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height-canvas.height,r:Math.random()*6+4,d:Math.random()*120,color:`hsl(${Math.random()*360},90%,60%)`,tilt:0,tiltAngle:0,tiltSpeed:Math.random()*.1+.05}));
    let frame:number,angle=0,count=0;
    function draw(){ctx!.clearRect(0,0,canvas!.width,canvas!.height);angle+=.01;pieces.forEach(p=>{p.tiltAngle+=p.tiltSpeed;p.y+=Math.cos(angle+p.d)+2;p.x+=Math.sin(angle)*.5;p.tilt=15*Math.sin(p.tiltAngle);ctx!.beginPath();ctx!.lineWidth=p.r;ctx!.strokeStyle=p.color;ctx!.moveTo(p.x+p.tilt+p.r/2,p.y);ctx!.lineTo(p.x+p.tilt,p.y+p.tilt+p.r/2);ctx!.stroke();if(p.y>canvas!.height+10){p.y=-10;p.x=Math.random()*canvas!.width;}});count++;if(count<120)frame=requestAnimationFrame(draw);else{cancelAnimationFrame(frame);onDone();}}
    frame=requestAnimationFrame(draw); return()=>cancelAnimationFrame(frame);
  },[onDone]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:999,pointerEvents:"none"}}/>;
}

function SettingsModal({ T, L, accent, darkMode, lang, onAccent, onDark, onLang, onClose }:any) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:150,display:"flex",flexDirection:"column",justifyContent:"flex-end",background:"rgba(0,0,0,.5)",backdropFilter:"blur(6px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:T.surface,borderRadius:"24px 24px 0 0",padding:"0 0 48px",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px"}}>
          <span style={{fontSize:17,fontWeight:600,color:T.text}}>⚙️ {L.appearance}</span>
          <button onClick={onClose} style={{background:T.surfaceAlt,border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",color:T.textTert}}>x</button>
        </div>
        <div style={{padding:"0 20px",display:"flex",flexDirection:"column",gap:20}}>
          <div>
            <p style={{fontSize:12,color:T.textTert,fontWeight:500,marginBottom:10,textTransform:"uppercase",letterSpacing:.4}}>{L.appearance}</p>
            <div style={{display:"flex",gap:10}}>
              {[[true,"🌙",L.darkMode],[false,"☀️",L.lightMode]].map(([val,icon,label])=>(
                <button key={String(val)} onClick={()=>onDark(val)} style={{flex:1,padding:"14px 10px",borderRadius:14,border:`2px solid ${darkMode===val?T.accent:T.border}`,background:darkMode===val?`${T.accent}22`:T.surfaceAlt,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  <span style={{fontSize:24}}>{icon as string}</span><span style={{fontSize:13,color:darkMode===val?T.accent:T.textSec}}>{label as string}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p style={{fontSize:12,color:T.textTert,fontWeight:500,marginBottom:10,textTransform:"uppercase",letterSpacing:.4}}>{L.language}</p>
            <div style={{display:"flex",gap:10}}>
              {[["en","🇺🇸","English"],["es","🇲🇽","Español"]].map(([val,flag,label])=>(
                <button key={val} onClick={()=>onLang(val)} style={{flex:1,padding:"14px 10px",borderRadius:14,border:`2px solid ${lang===val?T.accent:T.border}`,background:lang===val?`${T.accent}22`:T.surfaceAlt,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  <span style={{fontSize:24}}>{flag}</span><span style={{fontSize:13,color:lang===val?T.accent:T.textSec}}>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p style={{fontSize:12,color:T.textTert,fontWeight:500,marginBottom:10,textTransform:"uppercase",letterSpacing:.4}}>{L.themeColor}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {Object.entries(THEMES).map(([name,color])=>(
                <button key={name} onClick={()=>onAccent(color)} style={{padding:"12px 8px",borderRadius:14,border:`2px solid ${accent===color?color:T.border}`,background:accent===color?`${color}22`:T.surfaceAlt,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:color}}/>
                  <span style={{fontSize:12,color:T.textSec,textTransform:"capitalize"}}>{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanView({ tasks, categories, T, L, onOpenTask, onMoveTask }:any) {
  const getCat=(id:any)=>categories.find((c:any)=>c.id===id);
  const colLabels:any={"To Do":L.toDo,"In Progress":L.inProgress,"Done":L.done};
  return(
    <div style={{display:"flex",gap:12,padding:"0 16px",overflowX:"auto",scrollbarWidth:"none"}}>
      {KANBAN_COLS.map(col=>{
        const colTasks=tasks.filter((t:any)=>(t.kanban||"To Do")===col);
        return(
          <div key={col} style={{minWidth:220,flex:"0 0 220px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:13,fontWeight:600,color:col==="Done"?T.accent:col==="In Progress"?T.accentAmber:T.textSec}}>{colLabels[col]}</span>
              <span style={{fontSize:12,background:T.surfaceAlt,color:T.textTert,padding:"2px 8px",borderRadius:20}}>{colTasks.length}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {colTasks.map((task:any)=>{
                const cat=getCat(task.categoryId); const cs=catStyle(cat);
                return(
                  <div key={task.id} onClick={()=>onOpenTask(task.id)} style={{background:T.surface,borderRadius:12,padding:"12px 14px",cursor:"pointer",border:`1px solid ${cs.border}`}}>
                    <p style={{fontSize:14,fontWeight:500,margin:"0 0 8px",color:task.done?T.textTert:T.text,textDecoration:task.done?"line-through":"none"}}>{task.title}</p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <Badge label={task.priority} bg={(PRIORITY_COLOR as any)[task.priority].bg} text={(PRIORITY_COLOR as any)[task.priority].text} border={(PRIORITY_COLOR as any)[task.priority].border}/>
                      {cat&&<Badge label={cat.name} bg={cs.bg} text={cs.text} border={cs.border}/>}
                    </div>
                    {col!=="Done"&&<div style={{display:"flex",gap:6,marginTop:8}}>{KANBAN_COLS.filter(c=>c!==col).map(c=><button key={c} onClick={e=>{e.stopPropagation();onMoveTask(task.id,c);}} style={{fontSize:11,padding:"3px 8px",borderRadius:20,border:`1px solid ${T.border}`,background:"transparent",color:T.textTert,cursor:"pointer"}}>→ {colLabels[c]}</button>)}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarView({ tasks, categories, T, L, onOpenTask }:any) {
  const [current,setCurrent]=useState(new Date());const[selectedDay,setSelectedDay]=useState<any>(null);
  const year=current.getFullYear(),month=current.getMonth();
  const firstDay=new Date(year,month,1).getDay(),daysInMonth=new Date(year,month+1,0).getDate();
  const tasksByDate=useMemo(()=>{const map:any={};tasks.forEach((t:any)=>{if(t.due){if(!map[t.due])map[t.due]=[];map[t.due].push(t);}});return map;},[tasks]);
  const cells=[];for(let i=0;i<firstDay;i++)cells.push(null);for(let d=1;d<=daysInMonth;d++)cells.push(d);
  const selectedDateStr=selectedDay?`${year}-${String(month+1).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}`:null;
  const selectedTasks=selectedDateStr?(tasksByDate[selectedDateStr]||[]):[];
  return(
    <div style={{padding:"0 16px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <button onClick={()=>{setCurrent(new Date(year,month-1,1));setSelectedDay(null);}} style={{background:T.surfaceAlt,border:"none",borderRadius:"50%",width:32,height:32,color:T.text,cursor:"pointer"}}>‹</button>
        <span style={{fontSize:17,fontWeight:600,color:T.text}}>{year} - {month+1}</span>
        <button onClick={()=>{setCurrent(new Date(year,month+1,1));setSelectedDay(null);}} style={{background:T.surfaceAlt,border:"none",borderRadius:"50%",width:32,height:32,color:T.text,cursor:"pointer"}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:20}}>
        {cells.map((d,i)=>{
          if(!d)return<div key={`e${i}`}/>;
          const dateStr=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const isSelected=selectedDay===d,hasTasks=(tasksByDate[dateStr]||[]).length>0;
          return(
            <div key={d} onClick={()=>setSelectedDay(isSelected?null:d)} style={{height:48,background:isSelected?T.accent:T.surface,borderRadius:12,padding:"6px 4px",border:`1px solid ${isSelected?T.accent:T.borderFaint}`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
              <span style={{fontSize:14,color:isSelected?"#000":T.textSec}}>{d}</span>
              {hasTasks&&<div style={{width:5,height:5,borderRadius:"50%",background:isSelected?"#000":T.accent}}/>}
            </div>
          );
        })}
      </div>
      {selectedDay&&(
        <div style={{background:T.surface,borderRadius:16,padding:"16px"}}>
          {selectedTasks.length===0?<p style={{fontSize:14,color:T.textTert,textAlign:"center"}}>{L.noTasksDay}</p>:(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {selectedTasks.map((t:any)=>(
                <div key={t.id} onClick={()=>onOpenTask(t.id)} style={{background:T.surfaceAlt,borderRadius:12,padding:"12px",cursor:"pointer"}}><p style={{color:t.done?T.textTert:T.text,textDecoration:t.done?"line-through":"none"}}>{t.title}</p></div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SwipeCard({ children, onComplete, onOpen, disabled }:any) {
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

export default function App() {
  const [tasks, setTasks] = useState<any>(null);
  const [categories, setCategories] = useState<any>(null);
  const [nextId, setNextId] = useState(10);
  const [accentColor, setAccent] = useState(THEMES.green);
  const [darkMode, setDarkMode] = useState(true);
  const [lang, setLang] = useState("en");
  const [filter, setFilter] = useState({ categoryId:"All", priority:"All", tag:"" });
  const [sortBy, setSortBy] = useState("smart");
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ title:"", description:"", priority:"Medium", categoryId:null, due:"", kanban:"To Do", recurrence:"none" });
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [confetti, setConfetti] = useState(false);

  // TRIALS LOGIC
  const [trialStatus, setTrialStatus] = useState("active");

  const T  = useMemo(()=>makeT(accentColor,darkMode),[accentColor,darkMode]);
  const L  = (LANGS as any)[lang];

  useEffect(()=>{
    try{
      // Free trial logic
      let trialStart = localStorage.getItem("tm_trial_start");
      const license = localStorage.getItem("tm_license_key");
      if(license) {
        setTrialStatus("pro");
      } else {
        if(!trialStart) {
          trialStart = new Date().toISOString();
          localStorage.setItem("tm_trial_start", trialStart);
        }
        const diffDays = (new Date().getTime() - new Date(trialStart).getTime()) / 86400000;
        if(diffDays > 3) setTrialStatus("expired");
      }

      const res = localStorage.getItem(STORAGE_KEY);
      if(res){const d=JSON.parse(res);setTasks(d.tasks);setCategories(d.categories||DEFAULT_CATEGORIES);if(d.nextId)setNextId(d.nextId);if(d.accent)setAccent(d.accent);if(d.darkMode!==undefined)setDarkMode(d.darkMode);if(d.lang)setLang(d.lang);}
      else{setTasks(DEFAULT_TASKS);setCategories(DEFAULT_CATEGORIES);}
    }catch{setTasks(DEFAULT_TASKS);setCategories(DEFAULT_CATEGORIES);}
  },[]);

  useEffect(()=>{
    if(tasks===null||categories===null)return;
    const t=setTimeout(()=>{
      try{localStorage.setItem(STORAGE_KEY,JSON.stringify({tasks,categories,nextId,accent:accentColor,darkMode,lang}));}catch{}
    },600);
    return()=>clearTimeout(t);
  },[tasks,categories,nextId,accentColor,darkMode,lang]);

  useEffect(()=>{if(categories&&form.categoryId===null)setForm(f=>({...f,categoryId:categories[0]?.id||null}));},[categories]);

  const today=new Date().toISOString().split("T")[0];
  const getCat=(id:any)=>categories?.find((c:any)=>c.id===id);
  function isBlocked(task:any){return task.blockedBy?.some((bid:any)=>tasks.find((t:any)=>t.id===bid&&!t.done));}
  function toggleDone(id:any){
    setTasks((ts:any)=>ts.map((t:any)=>{
      if(t.id!==id)return t;
      const completing=!t.done;
      if(completing)setConfetti(true);
      return{...t,done:completing,kanban:completing?"Done":t.kanban};
    }));
  }
  function addTask(){
    if(!form.title.trim())return;
    setTasks((ts:any)=>[...ts,{...form,id:nextId,done:false,subtasks:[]}]);
    setNextId(n=>n+1);
    setForm(f=>({...f,title:"",description:"",due:"",kanban:"To Do",recurrence:"none"}));
    setShowForm(false);
  }
  function moveTask(id:any,col:string){ setTasks((ts:any)=>ts.map((t:any)=>t.id===id?{...t,kanban:col,done:col==="Done"}:t)); }

  const sorted=useMemo(()=>{
    if(!tasks)return[];
    let base=tasks.filter((t:any)=>(filter.categoryId==="All"||t.categoryId===filter.categoryId)&&(filter.priority==="All"||t.priority===filter.priority)&&(!search||t.title.toLowerCase().includes(search.toLowerCase())));
    return[...base];
  },[tasks,filter,sortBy,today,search]);

  if(tasks===null||categories===null)return <div style={{background:"#000",minHeight:"100vh"}}/>;

  if(trialStatus === "expired") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <h1 className="text-4xl font-extrabold mb-4">Trial Expired 😓</h1>
        <p className="text-xl text-gray-400 mb-8 max-w-md">Your 3-day free trial has ended. Please subscribe to Pro to continue using FocusTask.</p>
        <button onClick={()=>window.location.href="/checkout"} className="px-8 py-4 bg-[#30D158] text-black font-bold rounded-xl mb-4 text-lg">Subscribe for $1 / month</button>
        <button onClick={()=>window.location.href="/login"} className="px-8 py-4 bg-gray-900 text-white rounded-xl">I already have a License Key</button>
      </div>
    );
  }

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"-apple-system, sans-serif",paddingBottom:80, maxWidth:"600px", margin:"0 auto"}}>
      <style>{`*{-webkit-tap-highlight-color:transparent}`}</style>
      {confetti&&<Confetti onDone={()=>setConfetti(false)}/>}
      {showSettings&&<SettingsModal T={T} L={L} accent={accentColor} darkMode={darkMode} lang={lang} onAccent={setAccent} onDark={setDarkMode} onLang={setLang} onClose={()=>setShowSettings(false)}/>}
      
      <div style={{padding:"24px 20px 12px",display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div><h1 style={{margin:"2px 0 0",fontSize:34,fontWeight:700}}>{L.myTasks}</h1></div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShowSettings(true)} style={{background:T.surfaceAlt,border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",fontSize:16}}>⚙️</button>
          <button onClick={()=>setShowForm(s=>!s)} style={{background:showForm?T.surfaceAlt:T.accent,border:"none",borderRadius:20,color:showForm?T.textSec:"#000",fontSize:14,fontWeight:600,padding:"8px 18px",cursor:"pointer"}}>{showForm?L.cancel:L.add}</button>
        </div>
      </div>

      {showForm&&(
        <div style={{margin:"0 16px 14px",background:T.surface,borderRadius:16,padding:16}}>
          <input placeholder={L.titlePlaceholder} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addTask()} style={{...iStyle(T),marginBottom:10}}/>
          <button onClick={addTask} style={{width:"100%",padding:12,borderRadius:12,border:"none",background:T.accent,color:"#000",fontSize:15,fontWeight:600,cursor:"pointer"}}>{L.addTask}</button>
        </div>
      )}

      <div style={{padding:"0 16px 10px",overflowX:"auto",display:"flex",gap:8,scrollbarWidth:"none"}}>
        {[["list",L.list],["kanban",L.kanban],["calendar",L.calendar]].map(([v,label])=>(
          <button key={v} onClick={()=>setView(v)} style={{fontSize:13,padding:"6px 14px",borderRadius:20,border:"none",background:view===v?T.accent:T.surfaceAlt,color:view===v?"#000":T.textSec,cursor:"pointer"}}>{label}</button>
        ))}
      </div>

      {view==="list"&&(
        <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
          {sorted.map((task:any)=>(
            <SwipeCard key={task.id} onComplete={()=>toggleDone(task.id)} disabled={task.done}>
              <div style={{background:T.surface,borderRadius:16,padding:"14px 16px",border:`1px solid ${T.borderFaint}`,opacity:task.done?.5:1}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <button onClick={()=>toggleDone(task.id)} style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${task.done?T.accent:T.border}`,background:task.done?T.accent:"transparent",cursor:"pointer"}}>{task.done&&<span style={{color:"#000",fontSize:11,fontWeight:700}}>✓</span>}</button>
                  <div style={{flex:1}}><span style={{fontSize:15,textDecoration:task.done?"line-through":"none"}}>{task.title}</span></div>
                </div>
              </div>
            </SwipeCard>
          ))}
        </div>
      )}
      {view==="kanban"&&<KanbanView tasks={tasks} categories={categories} T={T} L={L} onOpenTask={setSelected} onMoveTask={moveTask}/>}
      {view==="calendar"&&<CalendarView tasks={tasks} categories={categories} T={T} L={L} onOpenTask={setSelected}/>}
    </div>
  );
}
