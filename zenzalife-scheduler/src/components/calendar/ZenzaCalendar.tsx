import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Task, User } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import {
  Plus,
  Clock,
  Users,
  Target,
  Trash2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { TaskModal } from "./TaskModal";
import { DefaultScheduleModal } from "./DefaultScheduleModal";

interface CalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: {
    category?: string;
    completed?: boolean;
    assignedTo?: string;
    alarm?: boolean;
  };
}

interface FamilySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: User[];
  onSelect: (member: User) => void;
}

function FamilySelectModal({ isOpen, onClose, members, onSelect }: FamilySelectModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-light text-gray-800">Select Family Member</h2>
          <ul className="space-y-2">
            {members.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => onSelect(m)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  {m.display_name}
                </button>
              </li>
            ))}
          </ul>
          <div className="text-right pt-2">
            <button onClick={onClose} className="btn-dreamy">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ZenzaCalendar() {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDefaultSchedule, setShowDefaultSchedule] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [calendarView, setCalendarView] = useState("timeGridDay");
  const calendarRef = useRef<FullCalendar>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [familyMembers, setFamilyMembers] = useState<User[]>([]);
  const [showFamilySelect, setShowFamilySelect] = useState(false);
  const isOwnCalendar = !viewUser || viewUser.id === user?.id;
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggered = useRef(false);
  const [moveDate, setMoveDate] = useState("");

  const handleEventContextMenu = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    id: string,
  ) => {
    if (!isOwnCalendar) return;
    e.preventDefault();
    setSelectMode(true);
    setSelectedEventIds((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );
  };

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user, viewUser]);

  useEffect(() => {
    if (profile?.family_id) {
      loadFamilyMembers();
    }
  }, [profile?.family_id]);

  const loadTasks = async () => {
    if (!user) return;
    const targetId = viewUser ? viewUser.id : user.id;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", targetId)
        .order("start_time", { ascending: true });

      if (error) throw error;

      setTasks(data || []);
      setEvents(convertTasksToEvents(data || []));
    } catch (error: any) {
      toast.error("Failed to load tasks: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFamilyMembers = async () => {
    if (!profile?.family_id) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setFamilyMembers(data || []);
    } catch (error: any) {
      toast.error('Failed to load family members: ' + error.message);
    }
  };

  const clearSelection = () => {
    setSelectedEventIds([]);
    setSelectMode(false);
    setMoveDate('');
  };

  const handlePointerDown = (id: string) => {
    if (!isOwnCalendar) return;
    longPressTriggered.current = false;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setSelectMode(true);
      setSelectedEventIds((ids) =>
        ids.includes(id) ? ids : [...ids, id]
      );
    }, 500);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const convertTasksToEvents = (tasks: Task[]): CalendarEvent[] => {
    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      start: task.start_time ? dayjs(task.start_time).toDate() : "",
      end: task.end_time ? dayjs(task.end_time).toDate() : "",
      backgroundColor: getCategoryColor(task.category),
      borderColor: getCategoryColor(task.category, true),
      textColor: "#374151",
      extendedProps: {
        category: task.category,
        completed: task.completed,
        assignedTo: task.assigned_to,
        alarm: task.alarm,
      },
    }));
  };

  const getCategoryColor = (category?: string, border = false) => {
    const colors: Record<string, { bg: string; border: string }> = {
      exercise: { bg: "#fef3c7", border: "#f59e0b" },
      study: { bg: "#dbeafe", border: "#3b82f6" },
      spiritual: { bg: "#fce7f3", border: "#ec4899" },
      work: { bg: "#d1fae5", border: "#10b981" },
      personal: { bg: "#e0e7ff", border: "#6366f1" },
      family: { bg: "#fed7d7", border: "#ef4444" },
      hygiene: { bg: "#f0f9ff", border: "#0ea5e9" },
      meal: { bg: "#f7fee7", border: "#65a30d" },
      default: { bg: "#f3f4f6", border: "#6b7280" },
    };

    const colorSet = colors[category || "default"] || colors["default"];
    return border ? colorSet.border : colorSet.bg;
  };

  const handleDateSelect = (selectInfo: any) => {
    if (!isOwnCalendar) return;
    setSelectedDate(selectInfo.startStr);
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleEventClick = (clickInfo: any) => {
    if (!isOwnCalendar) return;
    const id = clickInfo.event.id;
    if (selectMode || longPressTriggered.current) {
      setSelectedEventIds((ids) =>
        ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]
      );
      return;
    }
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setSelectedTask(task);
      setSelectedDate(null);
      setShowTaskModal(true);
    }
  };

  const handleTaskSave = async (taskData: any) => {
    if (!user || !isOwnCalendar) return;

    try {
      if (selectedTask) {
        // Update existing task
        const { error } = await supabase
          .from("tasks")
          .update({ ...taskData, updated_at: new Date().toISOString() })
          .eq("id", selectedTask.id);

        if (error) throw error;
        toast.success("Task updated successfully!");
      } else {
        // Create new task
        const { error } = await supabase.from("tasks").insert({
          ...taskData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
        toast.success("Task created successfully!");
      }

      await loadTasks();
      setShowTaskModal(false);
      setSelectedTask(null);
      setSelectedDate(null);
    } catch (error: any) {
      toast.error("Failed to save task: " + error.message);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!isOwnCalendar) return;
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;

      toast.success("Task deleted successfully!");
      await loadTasks();
      setShowTaskModal(false);
      setSelectedTask(null);
    } catch (error: any) {
      toast.error("Failed to delete task: " + error.message);
    }
  };

  const handleDeleteSelected = async () => {
    if (!isOwnCalendar || selectedEventIds.length === 0) return;
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', selectedEventIds);
      if (error) throw error;
      toast.success('Tasks deleted successfully!');
      clearSelection();
      await loadTasks();
    } catch (error: any) {
      toast.error('Failed to delete tasks: ' + error.message);
    }
  };

  const handleMoveSelected = async () => {
    if (!isOwnCalendar || selectedEventIds.length === 0 || !moveDate) return;
    try {
      const target = dayjs(moveDate);
      for (const id of selectedEventIds) {
        const task = tasks.find((t) => t.id === id);
        if (!task) continue;
        const start = dayjs(task.start_time)
          .year(target.year())
          .month(target.month())
          .date(target.date())
          .format('YYYY-MM-DDTHH:mm:ssZ');
        const end = task.end_time
          ? dayjs(task.end_time)
              .year(target.year())
              .month(target.month())
              .date(target.date())
              .format('YYYY-MM-DDTHH:mm:ssZ')
          : null;
        const { error } = await supabase
          .from('tasks')
          .update({
            start_time: start,
            end_time: end,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        if (error) throw error;
      }
      toast.success('Tasks moved successfully!');
      clearSelection();
      await loadTasks();
    } catch (error: any) {
      toast.error('Failed to move tasks: ' + error.message);
    }
  };

  const applyDefaultSchedule = async (date: string) => {
    if (!user || !isOwnCalendar) return;

    const defaultTasks = [
      {
        title: "Wake up, brush teeth, floss, exfoliate",
        category: "hygiene",
        start_time: dayjs(`${date}T06:30:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
        end_time: dayjs(`${date}T07:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
        alarm: true,
      },
      {
        title: "Jog/Exercise",
        category: "exercise",
        start_time: dayjs(`${date}T07:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
        end_time: dayjs(`${date}T08:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
        alarm: true,
      },
      {
        title: "Shower, hygiene",
        category: "hygiene",
        start_time: dayjs(`${date}T08:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
        end_time: dayjs(`${date}T08:30:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
      },
      {
        title: "Make/eat breakfast, grace, dishes",
        category: "meal",
        start_time: dayjs(`${date}T08:30:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
        end_time: dayjs(`${date}T09:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
      },
      {
        title: "Business cold calls",
        category: "work",
        start_time: dayjs(`${date}T09:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
        end_time: dayjs(`${date}T11:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
      },
      {
        title: "GED math study",
        category: "study",
        start_time: dayjs(`${date}T11:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
        end_time: dayjs(`${date}T17:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
      },
      {
        title: "Scripture & prayer",
        category: "spiritual",
        start_time: dayjs(`${date}T17:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
        end_time: dayjs(`${date}T18:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
      },
      {
        title: "Dinner + dishes + kitchen cleanup",
        category: "meal",
        start_time: dayjs(`${date}T18:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
        end_time: dayjs(`${date}T19:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
      },
      {
        title: "Personal development book reading",
        category: "personal",
        start_time: dayjs(`${date}T19:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
        end_time: dayjs(`${date}T20:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
      },
      {
        title: "Cooking video training",
        category: "personal",
        start_time: dayjs(`${date}T20:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
        end_time: dayjs(`${date}T21:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
      },
      {
        title: "PM hygiene",
        category: "hygiene",
        start_time: dayjs(`${date}T21:00:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
        end_time: dayjs(`${date}T21:30:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
      },
      {
        title: "Final prayer",
        category: "spiritual",
        start_time: dayjs(`${date}T21:30:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
        end_time: dayjs(`${date}T21:45:00`).format('YYYY-MM-DDTHH:mm:ssZ'),
      },
    ];

    try {
      const { data: existing, error: fetchError } = await supabase
        .from("tasks")
        .select("start_time")
        .eq("user_id", user.id)
        .gte("start_time", `${date}T00:00:00`)
        .lt("start_time", `${date}T23:59:59`);

      if (fetchError) throw fetchError;

      const existingTimes = new Set(
        existing?.map((t) => dayjs(t.start_time).format('YYYY-MM-DDTHH:mm:ssZ'))
      );

      const tasksToInsert = defaultTasks
        .filter((task) => !existingTimes.has(task.start_time))
        .map((task) => ({
          ...task,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed: false,
          visibility: "private",
        }));

      if (tasksToInsert.length === 0) {
        toast("Default schedule already applied for this date", { icon: "ℹ️" });
        return;
      }

      const { error } = await supabase.from("tasks").insert(tasksToInsert);

      if (error) throw error;

      toast.success("Default schedule applied successfully!");
      await loadTasks();
    } catch (error: any) {
      toast.error("Failed to apply default schedule: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-300"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-blue-400" />
            {isOwnCalendar ? 'Life Calendar' : `${viewUser?.display_name}'s Calendar`}
          </h1>
          <p className="text-gray-600/80 font-light mt-1">
            {isOwnCalendar
              ? `Welcome back, ${profile?.display_name} (${profile?.relationship_role})`
              : `Viewing ${viewUser?.display_name}'s calendar`}
          </p>
        </div>

        <div className="flex gap-3">
          {isOwnCalendar ? (
            <>
              <button
                onClick={() => setShowDefaultSchedule(true)}
                className="btn-dreamy flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Apply Default Schedule
              </button>

              <button
                onClick={() => {
                  setSelectedTask(null);
                  setSelectedDate(dayjs().format('YYYY-MM-DD'));
                  setShowTaskModal(true);
                }}
                className="btn-dreamy-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>

              <button
                onClick={() => setShowFamilySelect(true)}
                className="btn-dreamy flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                See Family Member's Calendar
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setViewUser(null);
                setSelectedTask(null);
              }}
              className="btn-dreamy"
            >
              Back to Your Calendar
            </button>
          )}
        </div>
      </div>

      {selectMode && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow">
          <div className="text-gray-700 font-light">
            {selectedEventIds.length} selected
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={moveDate}
              onChange={(e) => setMoveDate(e.target.value)}
              className="input-dreamy"
            />
            <button
              onClick={handleMoveSelected}
              className="btn-dreamy flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Move
            </button>
            <button
              onClick={handleDeleteSelected}
              className="btn-dreamy text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button onClick={clearSelection} className="btn-dreamy">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="card-floating p-6">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          timeZone="local"
          initialView={calendarView}
          editable={isOwnCalendar}
          selectable={isOwnCalendar}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={(arg) => (
            <div
              onPointerDown={() => handlePointerDown(arg.event.id)}
              onPointerUp={handlePointerUp}
              onContextMenu={(e) => handleEventContextMenu(e, arg.event.id)}
              className="px-2 py-1 rounded-lg text-xs font-medium shadow"
              style={{
                backgroundColor: arg.event.backgroundColor,
                border: `1px solid ${arg.event.borderColor}`,
                color: arg.event.textColor,
                opacity: selectedEventIds.includes(arg.event.id) ? 0.6 : 1,
                outline: selectedEventIds.includes(arg.event.id)
                  ? '2px solid #6366f1'
                  : undefined,
              }}
            >
              <span>{arg.timeText}</span>
              <div>{arg.event.title}</div>
            </div>
          )}
          height="600px"
          slotMinTime="05:00:00"
          slotMaxTime="23:00:00"
          slotDuration="00:30:00"
          scrollTime="06:00:00"
          eventDisplay="block"
          eventBackgroundColor="transparent"
          eventBorderColor="transparent"
          displayEventTime={true}
          allDaySlot={false}
        />
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
            setSelectedDate(null);
          }}
          onSave={handleTaskSave}
          onDelete={
            selectedTask ? () => handleTaskDelete(selectedTask.id) : undefined
          }
          task={selectedTask}
          initialDate={selectedDate}
        />
      )}

      {/* Default Schedule Modal */}
      {showDefaultSchedule && (
        <DefaultScheduleModal
          isOpen={showDefaultSchedule}
          onClose={() => setShowDefaultSchedule(false)}
          onApply={applyDefaultSchedule}
        />
      )}

      {/* Family Select Modal */}
      {showFamilySelect && (
        <FamilySelectModal
          isOpen={showFamilySelect}
          onClose={() => setShowFamilySelect(false)}
          members={familyMembers.filter((m) => m.id !== user?.id)}
          onSelect={(member) => {
            setViewUser(member);
            setShowFamilySelect(false);
          }}
        />
      )}
    </div>
  );
}
