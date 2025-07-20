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
  Calendar as CalendarIcon,
  CheckCircle,
} from "lucide-react";
import { TaskModal } from "./TaskModal";
import { DefaultScheduleModal } from "./DefaultScheduleModal";
import { AlarmModal } from "../alerts/AlarmModal";

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
    custom_sound_path?: string;
    notes?: string;
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
  const [activeAlarm, setActiveAlarm] = useState<CalendarEvent | null>(null);
  const triggeredRef = useRef<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const upcoming = events.find((ev) => {
        if (!ev.extendedProps?.alarm || triggeredRef.current.has(ev.id)) return false;
        const start = new Date(ev.start).getTime();
        return start <= now && now - start < 60000;
      });
      if (upcoming) {
        setActiveAlarm(upcoming);
        triggeredRef.current.add(upcoming.id);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [events]);

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
        custom_sound_path: task.custom_sound_path,
        notes: task.notes,
      },
    }));
  };

  const getAlarmSound = (ev: CalendarEvent) => {
    return (
      ev.extendedProps?.custom_sound_path ||
      localStorage.getItem('defaultAlarmSound') ||
      '/alarms/lucid-skybell.mp3'
    );
  };

  const categoryIcons: Record<string, string> = {
    exercise: '🏃',
    study: '📚',
    spiritual: '🙏',
    work: '💼',
    personal: '🌟',
    family: '👪',
    hygiene: '🛁',
    meal: '🍽️',
    doordash: '🍔',
    ubereats: '🛵',
    default: '📌',
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
      doordash: { bg: "#fee2e2", border: "#ee2723" },
      ubereats: { bg: "#dcfce7", border: "#06c167" },
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
    const task = tasks.find((t) => t.id === clickInfo.event.id);
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

      {/* Calendar */}
      <div className="card-floating p-2 sm:p-6">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: isMobile
              ? "dayGridMonth,timeGridDay"
              : "dayGridMonth,timeGridWeek,timeGridDay",
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
              className="relative px-2 py-1 rounded-lg text-xs font-medium shadow"
              style={{
                backgroundColor: arg.event.backgroundColor,
                border: `1px solid ${arg.event.borderColor}`,
                color: arg.event.textColor,
              }}
            >
              {arg.event.extendedProps?.completed && (
                <div className="absolute -top-1 -right-1 flex items-center gap-1 bg-white/80 rounded-full px-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-[10px]">Completed</span>
                </div>
              )}
              <span>{arg.timeText}</span>
              <div className="flex items-center gap-1">
                <span>
                  {categoryIcons[arg.event.extendedProps?.category || 'default']}
                </span>
                <span>{arg.event.title}</span>
              </div>
            </div>
          )}
          height={isMobile ? 'auto' : '650px'}
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

      {activeAlarm && (
        <AlarmModal
          eventTitle={activeAlarm.title}
          eventTime={dayjs(activeAlarm.start).format('h:mm A')}
          soundUrl={getAlarmSound(activeAlarm)}
          onDismiss={() => setActiveAlarm(null)}
        />
      )}
    </div>
  );
}
