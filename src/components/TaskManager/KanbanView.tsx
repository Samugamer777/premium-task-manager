"use client";
import { useStore, KanbanCol } from "@/store/useStore";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export function KanbanView({ onOpenTask }: { onOpenTask: (id: number) => void }) {
  const { tasks, categories, settings, moveTask } = useStore();

  const cols: KanbanCol[] = ["To Do", "In Progress", "Done"];
  const colLabels = { "To Do": "To Do", "In Progress": "In Progress", "Done": "Done" };

  const bgCol = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const bgColAlt = settings.darkMode ? "#2C2C2E" : "#F2F2F7";
  const borderCol = settings.darkMode ? "#3A3A3C" : "#E5E5EA";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const taskId = Number(result.draggableId);
    const destCol = result.destination.droppableId as KanbanCol;
    moveTask(taskId, destCol);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {cols.map(col => {
          const colTasks = tasks.filter(t => (t.kanban || "To Do") === col);

          return (
            <div key={col} className="min-w-[280px] w-[280px] shrink-0 snap-center rounded-3xl p-4 flex flex-col max-h-[70vh]" style={{ backgroundColor: bgColAlt }}>
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: col === 'Done' ? settings.accentColor : col === 'In Progress' ? '#0A84FF' : textCol }}>
                  {colLabels[col]}
                </h3>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: bgCol, color: textCol }}>
                  {colTasks.length}
                </span>
              </div>

              <Droppable droppableId={col}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="flex-1 overflow-y-auto min-h-[150px] space-y-3 p-1"
                  >
                    {colTasks.map((task, index) => {
                      const cat = categories.find(c => c.id === task.categoryId);
                      return (
                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onOpenTask(task.id)}
                              className="p-4 bg-red-500 rounded-2xl shadow-sm border cursor-grab active:cursor-grabbing"
                              style={{ 
                                ...provided.draggableProps.style, 
                                backgroundColor: bgCol, 
                                borderColor: snapshot.isDragging ? settings.accentColor : borderCol,
                                opacity: task.done ? 0.6 : 1,
                                boxShadow: snapshot.isDragging ? `0 10px 30px ${settings.accentColor}33` : '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            >
                              <div className="w-full h-1.5 rounded-full mb-3" style={{ backgroundColor: cat?.color || settings.accentColor }} />
                              <p className={`font-semibold mb-2 ${task.done ? 'line-through' : ''}`} style={{ color: textCol }}>{task.title}</p>
                              
                              <div className="flex flex-wrap gap-2">
                                {task.tags?.map(t => (
                                  <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ backgroundColor: bgColAlt }}>#{t}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
