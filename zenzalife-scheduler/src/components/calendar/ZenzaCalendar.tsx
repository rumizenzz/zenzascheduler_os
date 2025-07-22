import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Task, User, TaskHistory } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import {
  Plus,
  Undo2,
  Redo2,
  Clock,
  Users,
  Target,
  Calendar as CalendarIcon,
  CheckCircle,
  MoveRight,
  Trash,
  Menu,
} from "lucide-react";
import { TaskModal } from "./TaskModal";
import { DefaultScheduleModal } from "./DefaultScheduleModal";
import { DefaultScheduleItem } from "@/data/defaultSchedule";
import { MoveScheduleModal } from "./MoveScheduleModal";
import { DayScheduleModal } from "./DayScheduleModal";
import { AlarmModal } from "../alerts/AlarmModal";
import { useAlarmChannel } from "@/hooks/useAlarmChannel";
import { useNotifications } from "@/hooks/useNotifications";
import { DragHint } from "./DragHint";

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

function FamilySelectModal({
  isOpen,
  onClose,
  members,
  onSelect,
}: FamilySelectModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-light text-gray-800">
            Select Family Member
          </h2>
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
  const [showMoveSchedule, setShowMoveSchedule] = useState(false);
  const [moveFromDate, setMoveFromDate] = useState<string | null>(null);
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
  const snoozeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scheduledRef = useRef<Set<string>>(new Set())
  const { scheduleNotificationAt } = useNotifications()
  const { postMessage } = useAlarmChannel(msg => {
    if (msg.type === 'dismiss') {
      setActiveAlarm(null)
      if (snoozeTimeout.current) {
        clearTimeout(snoozeTimeout.current)
        snoozeTimeout.current = null
      }
    }
    if (msg.type === 'snooze') {
      setActiveAlarm(null)
      if (snoozeTimeout.current) clearTimeout(snoozeTimeout.current)
      const event = msg.payload as CalendarEvent | null
      if (event) {
        snoozeTimeout.current = setTimeout(() => {
          setActiveAlarm(event)
          snoozeTimeout.current = null
        }, 300000)
      }
    }
  })
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [swipeEnabled, setSwipeEnabled] = useState(false);
  const [showMoveSuccess, setShowMoveSuccess] = useState(false);
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [dayModalEvents, setDayModalEvents] = useState<CalendarEvent[]>([]);
  const [dayModalDate, setDayModalDate] = useState<string>("");
  const [showDayModal, setShowDayModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [showCompleted, setShowCompleted] = useState(false);
  const [modalShowCompleted, setModalShowCompleted] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) setShowActionMenu(false);
  }, [isMobile]);

  useEffect(() => {
    if (user) {
      loadTasks();
      loadHistory();
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
        if (!ev.extendedProps?.alarm || triggeredRef.current.has(ev.id))
          return false;
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

  useEffect(() => {
    const now = Date.now();
    // remove past notifications
    scheduledRef.current.forEach(id => {
      const ev = events.find(e => e.id === id);
      if (!ev || new Date(ev.start).getTime() <= now) {
        scheduledRef.current.delete(id);
      }
    });

    events.forEach(ev => {
      if (!ev.extendedProps?.alarm) return;
      const start = new Date(ev.start).getTime();
      if (start > now && !scheduledRef.current.has(ev.id)) {
        scheduleNotificationAt(ev.title, { body: dayjs(ev.start).format('h:mm A') }, start);
        scheduledRef.current.add(ev.id);
      }
    });
  }, [events, scheduleNotificationAt]);

  useEffect(() => {
    if (showMoveSuccess) {
      const timer = setTimeout(() => setShowMoveSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showMoveSuccess]);

  const loadTasks = async (): Promise<Task[]> => {
    if (!user) return [];
    const targetId = viewUser ? viewUser.id : user.id;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", targetId)
        .order("start_time", { ascending: true });

      if (error) throw error;

      const uniqueMap = new Map<string, Task>();
      for (const t of data || []) {
        const key = `${t.title}-${t.start_time}-${t.end_time}-${t.user_id}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, t);
        }
      }
      const deduped = Array.from(uniqueMap.values());

      setTasks(deduped);
      setEvents(convertTasksToEvents(deduped));
      return deduped;
    } catch (error: any) {
      toast.error("Failed to load tasks: " + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadFamilyMembers = async () => {
    if (!profile?.family_id) return;
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("family_id", profile.family_id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setFamilyMembers(data || []);
    } catch (error: any) {
      toast.error("Failed to load family members: " + error.message);
    }
  };

  const loadHistory = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("task_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setHistory(data as TaskHistory[]);
      setHistoryIndex(0);
    }
  };

  const saveHistory = async (snapshot: Task[]) => {
    if (!user) return;
    await supabase.from("task_history").insert({
      user_id: user.id,
      task_data: snapshot,
      created_at: new Date().toISOString(),
    });
    await loadHistory();
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
      localStorage.getItem("defaultAlarmSound") ||
      "/alarms/lucid-skybell.mp3"
    );
  };

  const tasksForToday = tasks.filter((t) =>
    dayjs(t.start_time).isSame(currentDate, 'day'),
  );

  // Only DoorDash, Uber Eats, and Olive Garden use icons in the calendar
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
      olivegarden: { bg: "#f0f9e0", border: "#6c9321" },
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

  const openDayModal = (date: Date) => {
    const dayEvents = events.filter((ev) =>
      dayjs(ev.start).isSame(date, "day"),
    );
    setDayModalDate(dayjs(date).format("YYYY-MM-DD"));
    setDayModalEvents(dayEvents);
    setShowDayModal(true);
  };

  const handleDateClick = (info: any) => {
    if (calendarView === "dayGridMonth" || calendarView === "timeGridWeek") {
      openDayModal(info.date);
    }
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

      const updated = await loadTasks();
      await saveHistory(updated);
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
      const updated = await loadTasks();
      await saveHistory(updated);
      setShowTaskModal(false);
      setSelectedTask(null);
    } catch (error: any) {
      toast.error("Failed to delete task: " + error.message);
    }
  };

  const toggleTaskCompleted = async (task: Task, completed: boolean) => {
    if (!user || !isOwnCalendar) return;
    await supabase
      .from('tasks')
      .update({ completed, updated_at: new Date().toISOString() })
      .eq('id', task.id);
    if (completed) {
      await supabase.from('completed_tasks').insert({
        user_id: user.id,
        task_id: task.id,
        title: task.title,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else {
      await supabase.from('completed_tasks').delete().eq('task_id', task.id);
    }
    const updated = await loadTasks();
    await saveHistory(updated);
  };

  const handleEventDrop = async (info: any) => {
    if (!user || !isOwnCalendar) return;
    const id = info.event.id;
    const start = dayjs(info.event.start).format("YYYY-MM-DDTHH:mm:ssZ");
    const end = info.event.end
      ? dayjs(info.event.end).format("YYYY-MM-DDTHH:mm:ssZ")
      : null;
    const { error } = await supabase
      .from("tasks")
      .update({
        start_time: start,
        end_time: end,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      toast.error("Failed to move task: " + error.message);
      info.revert();
      return;
    }
    const updated = await loadTasks();
    await saveHistory(updated);
  };

  const handleEventResize = async (info: any) => {
    if (!user || !isOwnCalendar) return;
    const id = info.event.id;
    const start = dayjs(info.event.start).format("YYYY-MM-DDTHH:mm:ssZ");
    const end = info.event.end
      ? dayjs(info.event.end).format("YYYY-MM-DDTHH:mm:ssZ")
      : null;
    const { error } = await supabase
      .from("tasks")
      .update({
        start_time: start,
        end_time: end,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      toast.error("Failed to resize task: " + error.message);
      info.revert();
      return;
    }
    const updated = await loadTasks();
    await saveHistory(updated);
  };

  const applyDefaultSchedule = async (date: string, items: DefaultScheduleItem[]) => {
    if (!user || !isOwnCalendar) return;

    const defaultTasks = items.map((item) => {
      const start = dayjs(`${date}T${item.start}`)
      let end = dayjs(`${date}T${item.end}`)
      if (end.isBefore(start)) end = end.add(1, "day")
      return {
        title: item.title,
        category: item.category,
        start_time: start.format("YYYY-MM-DDTHH:mm:ssZ"),
        end_time: end.format("YYYY-MM-DDTHH:mm:ssZ"),
        alarm: item.alarm,
      }
    })

    try {
      const { data: existing, error: fetchError } = await supabase
        .from("tasks")
        .select("start_time")
        .eq("user_id", user.id)
        .gte("start_time", `${date}T00:00:00`)
        .lt("start_time", `${date}T23:59:59`);

      if (fetchError) throw fetchError;

      const existingTimes = new Set(
        existing?.map((t) =>
          dayjs(t.start_time).format("YYYY-MM-DDTHH:mm:ssZ"),
        ),
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
      const updated = await loadTasks();
      await saveHistory(updated);
    } catch (error: any) {
      toast.error("Failed to apply default schedule: " + error.message);
    }
  };

  const moveSchedule = async (toDate: string) => {
    if (!user || !isOwnCalendar || !moveFromDate) return;
    try {
      const dayTasks = tasks.filter(
        (t) => dayjs(t.start_time).format("YYYY-MM-DD") === moveFromDate,
      );
      for (const t of dayTasks) {
        const newStart = dayjs(
          toDate + dayjs(t.start_time!).format("THH:mm:ssZ"),
        ).format("YYYY-MM-DDTHH:mm:ssZ");
        const newEnd = t.end_time
          ? dayjs(toDate + dayjs(t.end_time).format("THH:mm:ssZ")).format(
              "YYYY-MM-DDTHH:mm:ssZ",
            )
          : null;
        const { error } = await supabase
          .from("tasks")
          .update({
            start_time: newStart,
            end_time: newEnd,
            updated_at: new Date().toISOString(),
          })
          .eq("id", t.id);
        if (error) throw error;
      }
      toast.success("Schedule moved!");
      setShowMoveSuccess(true);
      await loadTasks();
    } catch (error: any) {
      toast.error("Failed to move schedule: " + error.message);
    }
  };

  const shiftDaySchedule = async (date: string, newStart: string) => {
    if (!user || !isOwnCalendar) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .gte("start_time", `${date}T00:00:00`)
        .lt("start_time", `${date}T23:59:59`)
        .order("start_time", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast("No tasks found for this date", { icon: "ℹ️" });
        return;
      }

      const oldStart = dayjs(data[0].start_time);
      const newStartTime = dayjs(`${date}T${newStart}`);
      const diff = newStartTime.diff(oldStart, "minute");

      await Promise.all(
        data.map((t) =>
          supabase
            .from("tasks")
            .update({
              start_time: dayjs(t.start_time)
                .add(diff, "minute")
                .format("YYYY-MM-DDTHH:mm:ssZ"),
              end_time: t.end_time
                ? dayjs(t.end_time)
                    .add(diff, "minute")
                    .format("YYYY-MM-DDTHH:mm:ssZ")
                : null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", t.id),
        ),
      );

      toast.success("Schedule shifted successfully!");
      const updated = await loadTasks();
      await saveHistory(updated);
    } catch (err: any) {
      toast.error("Failed to shift schedule: " + err.message);
    }
  };

  const deleteDaySchedule = async (date: string) => {
    if (!user || !isOwnCalendar) return;
    const confirmText = prompt(
      "Type DELETE-ALL-TASKS to remove all tasks for this day",
    );
    if (confirmText !== "DELETE-ALL-TASKS") {
      toast("Deletion cancelled");
      return;
    }
    await supabase
      .from("tasks")
      .delete()
      .eq("user_id", user.id)
      .gte("start_time", `${date}T00:00:00`)
      .lt("start_time", `${date}T23:59:59`);
    const updated = await loadTasks();
    await saveHistory(updated);
    toast.success("All tasks deleted");
  };

  const undo = async () => {
    if (historyIndex >= history.length - 1) {
      toast("Nothing to undo");
      return;
    }
    const snapshot = history[historyIndex + 1];
    await supabase.from("tasks").delete().eq("user_id", user!.id);
    if (snapshot.task_data.length) {
      await supabase.from("tasks").insert(snapshot.task_data);
    }
    setHistoryIndex(historyIndex + 1);
    await loadTasks();
  };

  const redo = async () => {
    if (historyIndex === 0) {
      toast("Nothing to redo");
      return;
    }
    const snapshot = history[historyIndex - 1];
    await supabase.from("tasks").delete().eq("user_id", user!.id);
    if (snapshot.task_data.length) {
      await supabase.from("tasks").insert(snapshot.task_data);
    }
    setHistoryIndex(historyIndex - 1);
    await loadTasks();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !swipeEnabled) return;
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || touchStartX === null || !swipeEnabled) return;
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const threshold = 50;
    const api = calendarRef.current?.getApi();
    if (!api) return;
    if (diffX > threshold) {
      api.next();
    } else if (diffX < -threshold) {
      api.prev();
    }
    setTouchStartX(null);
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
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4">
        <div>
          <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-blue-400" />
            {isOwnCalendar
              ? "Life Calendar"
              : `${viewUser?.display_name}'s Calendar`}
          </h1>
          <p className="text-gray-600/80 font-light mt-1">
            {isOwnCalendar
              ? `Welcome back, ${profile?.display_name} (${profile?.relationship_role})`
              : `Viewing ${viewUser?.display_name}'s calendar`}
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto pb-2 sm:pb-0">
          {isOwnCalendar ? (
            isMobile ? (
              <div className="relative w-full">
                <button
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  className="btn-dreamy flex items-center gap-2 w-full justify-center"
                  aria-label="Calendar actions"
                >
                  <Menu className="w-4 h-4" />
                  Actions
                </button>
                {showActionMenu && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl p-3 space-y-2 z-40">
                    <button
                      onClick={() => {
                        setShowActionMenu(false);
                        setShowDefaultSchedule(true);
                      }}
                      className="btn-dreamy flex items-center gap-2 w-full justify-start"
                    >
                      <Clock className="w-4 h-4" />
                      Apply Default Schedule
                    </button>
                    <button
                      onClick={() => {
                        const api = calendarRef.current?.getApi();
                        const current = api
                          ? dayjs(api.getDate()).format('YYYY-MM-DD')
                          : dayjs().format('YYYY-MM-DD');
                        setMoveFromDate(current);
                        setShowMoveSchedule(true);
                        setShowActionMenu(false);
                      }}
                      className="btn-dreamy flex items-center gap-2 w-full justify-start"
                    >
                      <MoveRight className="w-4 h-4" />
                      Move Day
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTask(null);
                        setSelectedDate(dayjs().format('YYYY-MM-DD'));
                        setShowTaskModal(true);
                        setShowActionMenu(false);
                      }}
                      className="btn-dreamy-primary flex items-center gap-2 w-full justify-start"
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </button>
                    <button
                      onClick={() => {
                        undo();
                        setShowActionMenu(false);
                      }}
                      className="btn-dreamy flex items-center gap-2 w-full justify-start"
                    >
                      <Undo2 className="w-4 h-4" />
                      Undo
                    </button>
                    <button
                      onClick={() => {
                        redo();
                        setShowActionMenu(false);
                      }}
                      className="btn-dreamy flex items-center gap-2 w-full justify-start"
                    >
                      <Redo2 className="w-4 h-4" />
                      Redo
                    </button>
                    <button
                      onClick={() => {
                        deleteDaySchedule(dayjs().format('YYYY-MM-DD'));
                        setShowActionMenu(false);
                      }}
                      className="btn-dreamy text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2 w-full justify-start"
                    >
                      <Trash className="w-4 h-4" />
                      Delete Today
                    </button>
                    <button
                      onClick={() => {
                        setShowFamilySelect(true);
                        setShowActionMenu(false);
                      }}
                      className="btn-dreamy flex items-center gap-2 w-full justify-start"
                    >
                      <Users className="w-4 h-4" />
                      See Family Member's Calendar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowDefaultSchedule(true)}
                  className="btn-dreamy flex items-center gap-2 flex-shrink-0"
                >
                  <Clock className="w-4 h-4" />
                  Apply Default Schedule
                </button>

                <button
                  onClick={() => {
                    const api = calendarRef.current?.getApi();
                    const current = api
                      ? dayjs(api.getDate()).format('YYYY-MM-DD')
                      : dayjs().format('YYYY-MM-DD');
                    setMoveFromDate(current);
                    setShowMoveSchedule(true);
                  }}
                  className="btn-dreamy flex items-center gap-2 flex-shrink-0"
                >
                  <MoveRight className="w-4 h-4" />
                  Move Day
                </button>

                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setSelectedDate(dayjs().format('YYYY-MM-DD'));
                    setShowTaskModal(true);
                  }}
                  className="btn-dreamy-primary flex items-center gap-2 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>

                <button
                  onClick={undo}
                  className="btn-dreamy flex items-center gap-2 flex-shrink-0"
                >
                  <Undo2 className="w-4 h-4" />
                  Undo
                </button>

                <button
                  onClick={redo}
                  className="btn-dreamy flex items-center gap-2 flex-shrink-0"
                >
                  <Redo2 className="w-4 h-4" />
                  Redo
                </button>

                <button
                  onClick={() => deleteDaySchedule(dayjs().format('YYYY-MM-DD'))}
                  className="btn-dreamy text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2 flex-shrink-0"
                >
                  <Trash className="w-4 h-4" />
                  Delete Today
                </button>

                <button
                  onClick={() => setShowFamilySelect(true)}
                  className="btn-dreamy flex items-center gap-2 flex-shrink-0"
                >
                  <Users className="w-4 h-4" />
                  See Family Member's Calendar
                </button>
              </>
            )
          ) : (
            <button
              onClick={() => {
                setViewUser(null);
                setSelectedTask(null);
              }}
              className="btn-dreamy flex-shrink-0"
            >
              Back to Your Calendar
            </button>
          )}
        </div>
      </div>

      {/* Calendar */}
      {(calendarView === "dayGridMonth" || calendarView === "timeGridDay") && (
        <div className="text-center my-2">
          {swipeEnabled ? (
            <button
              onClick={() => setSwipeEnabled(false)}
              className="btn-dreamy"
            >
              Disable Swipe
            </button>
          ) : (
            <button
              onClick={() => setSwipeEnabled(true)}
              className="btn-dreamy-primary"
            >
              {calendarView === "dayGridMonth"
                ? "Click to Enable Swipe for Month"
                : "Click to Enable Swipe for Day"}
            </button>
          )}
        </div>
      )}
      <div
        className="card-floating p-2 sm:p-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
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
          datesSet={(arg) => {
            setCalendarView(arg.view.type);
            setCurrentDate(dayjs(arg.start).format('YYYY-MM-DD'));
          }}
          editable={isOwnCalendar}
          selectable={isOwnCalendar}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          dayCellContent={(arg) => {
            if (calendarView === "dayGridMonth" || calendarView === "timeGridWeek") {
              const dayEvents = events.filter((ev) =>
                dayjs(ev.start).isSame(arg.date, "day"),
              );
              const previews = dayEvents.slice(0, 2);
              return (
                <div className="flex flex-col items-start">
                  <span className="fc-daygrid-day-number">{arg.dayNumberText}</span>
                  {previews.map((ev) => (
                    <span
                      key={ev.id}
                      className="event-preview"
                      style={{
                        backgroundColor: ev.backgroundColor,
                        border: `1px solid ${ev.borderColor}`,
                        color: ev.textColor || "#374151",
                      }}
                    >
                      {ev.title}
                    </span>
                  ))}
                  {dayEvents.length > previews.length && (
                    <button
                      className="text-[10px] text-blue-600 underline"
                      onClick={() => openDayModal(arg.date)}
                    >
                      View Schedules
                    </button>
                  )}
                </div>
              );
            }
            return <span className="fc-daygrid-day-number">{arg.dayNumberText}</span>;
          }}
          dateClick={handleDateClick}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventContent={(arg) => {
            if (calendarView !== "timeGridDay") return null;
            const start = dayjs(arg.event.start!).format("h:mm A");
            const end = arg.event.end
              ? dayjs(arg.event.end).format("h:mm A")
              : undefined;
            return (
              <div
                className="calendar-event"
                style={{
                  backgroundColor: arg.event.backgroundColor,
                  border: `1px solid ${arg.event.borderColor}`,
                  color: arg.event.textColor,
                }}
              >
                {arg.event.extendedProps?.completed && (
                  <div className="absolute -top-1 -right-1 flex items-center gap-1 bg-white/80 rounded-full px-1 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                )}
                {arg.event.extendedProps?.category === "doordash" && (
                  <img
                    src="/icons/doordash.svg"
                    alt="DoorDash"
                    className="w-4 h-4"
                  />
                )}
                {arg.event.extendedProps?.category === "ubereats" && (
                  <img
                    src="/icons/ubereats.svg"
                    alt="Uber Eats"
                    className="w-4 h-4"
                  />
                )}
                {arg.event.extendedProps?.category === "olivegarden" && (
                  <img
                    src="/icons/olivegarden.svg"
                    alt="Olive Garden"
                    className="w-4 h-4"
                  />
                )}
                <span className="flex-1 truncate">{arg.event.title}</span>
                <span className="ml-auto">
                  {end ? `${start} - ${end}` : start}
                </span>
              </div>
            );
          }}
          height={isMobile ? "auto" : "650px"}
          /* show full overnight tasks */
          slotMinTime="00:00:00"
          slotMaxTime="32:00:00"
          slotDuration="00:30:00"
          scrollTime="06:00:00"
          eventDisplay={calendarView === "timeGridDay" ? "block" : "none"}
          eventBackgroundColor="transparent"
          eventBorderColor="transparent"
          displayEventTime={true}
          allDaySlot={false}
        />
      </div>

      <DragHint isMobile={isMobile} />

      {isOwnCalendar && (
        <div className="mt-6 space-y-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="btn-dreamy flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Tasks Completed ({tasksForToday.filter(t => t.completed).length}/{tasksForToday.length})
          </button>
          {showCompleted && (
            <div className="space-y-2 p-4 bg-white/80 rounded-xl">
              {tasksForToday.map(t => (
                <label key={t.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!t.completed}
                    onChange={(e) => toggleTaskCompleted(t, e.target.checked)}
                    className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                  />
                  <span className={t.completed ? 'line-through' : ''}>{t.title}</span>
                </label>
              ))}
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setSelectedDate(currentDate);
                  setModalShowCompleted(true);
                  setShowTaskModal(true);
                }}
                className="btn-dreamy-primary mt-2"
              >
                Add Completed Task
              </button>
            </div>
          )}
        </div>
      )}

      {isOwnCalendar && (
        <button
          onClick={() => {
            setSelectedTask(null);
            setSelectedDate(dayjs().format("YYYY-MM-DD"));
            setModalShowCompleted(false);
            setShowTaskModal(true);
          }}
          className="fab-add-task"
          aria-label="Add Task"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
            setSelectedDate(null);
            setModalShowCompleted(false);
          }}
          onSave={handleTaskSave}
          onDelete={
            selectedTask ? () => handleTaskDelete(selectedTask.id) : undefined
          }
          task={selectedTask}
          initialDate={selectedDate}
          showCompletedToggle={modalShowCompleted}
          initialCompleted={modalShowCompleted}
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

      {showMoveSchedule && moveFromDate && (
        <MoveScheduleModal
          isOpen={showMoveSchedule}
          onClose={() => setShowMoveSchedule(false)}
          fromDate={moveFromDate}
          onMove={moveSchedule}
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
          eventTime={dayjs(activeAlarm.start).format("h:mm A")}
          soundUrl={getAlarmSound(activeAlarm)}
          onDismiss={() => {
            setActiveAlarm(null)
            postMessage({ type: 'dismiss' })
          }}
          onSnooze={() => {
            const event = activeAlarm
            setActiveAlarm(null)
            postMessage({ type: 'snooze', payload: event })
            if (snoozeTimeout.current) clearTimeout(snoozeTimeout.current)
            snoozeTimeout.current = setTimeout(() => {
              setActiveAlarm(event)
              snoozeTimeout.current = null
            }, 300000)
          }}
        />
      )}

      {showDayModal && (
        <DayScheduleModal
          isOpen={showDayModal}
          onClose={() => setShowDayModal(false)}
          date={dayModalDate}
          events={dayModalEvents}
        />
      )}

      {showMoveSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg animate-bounce z-50">
          Schedule moved!
        </div>
      )}
    </div>
  );
}
