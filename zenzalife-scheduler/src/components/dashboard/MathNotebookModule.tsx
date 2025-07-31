import React, { useCallback, useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { PlusCircle, History, Play, Pause, Rewind } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import type {
  AppState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

type ExcalidrawData = {
  elements: readonly ExcalidrawElement[];
  appState: Partial<AppState>;
};

interface TabData {
  id: string;
  name: string;
  data: ExcalidrawData;
  history: { id: string; created_at: string; data: ExcalidrawData }[];
  frames: ExcalidrawData[];
}

export function MathNotebookModule() {
  const { user } = useAuth();
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("");
  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    elementId: string;
  } | null>(null);
  const [editing, setEditing] = useState<{
    elementId: string;
    text: string;
  } | null>(null);
  const [historyModal, setHistoryModal] = useState<string | null>(null);
  const [textHistories, setTextHistories] = useState<Record<string, string[]>>(
    {},
  );
  const prevElements = useRef<readonly ExcalidrawElement[]>([]);
  const ExcalidrawLib = Excalidraw as any;
  const [isReplaying, setIsReplaying] = useState(false);
  const replayIndex = useRef(0);
  const replayTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("math_problems")
        .select("id, name, data, math_problem_versions(id, data, created_at)")
        .eq("user_id", user.id)
        .order("created_at");

      if (error) {
        console.error("Failed to load math problems:", error);
        toast.error("Failed to load math problems");
        return;
      }

      if (data && data.length > 0) {
        const formatted = data.map((p: any) => {
          const { collaborators, ...appState } = p.data?.appState || {};
          const initial = { elements: p.data?.elements || [], appState };
          return {
            id: p.id,
            name: p.name,
            data: initial,
            history:
              p.math_problem_versions?.map((v: any) => {
                const { collaborators: _c, ...vAppState } =
                  v.data?.appState || {};
                return {
                  id: v.id,
                  created_at: v.created_at,
                  data: {
                    elements: v.data?.elements || [],
                    appState: vAppState,
                  },
                };
              }) || [],
            frames: [initial],
          };
        });
        setTabs(formatted);
        setActiveTabId(formatted[0].id);
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("math_problems")
          .insert({
            user_id: user.id,
            name: "Problem 1",
            data: { elements: [], appState: {} },
          })
          .select("id, name, data")
          .single();

        if (insertError) {
          console.error("Failed to create math problem:", insertError);
          toast.error("Failed to create math problem");
          return;
        }

        const { collaborators: _c, ...appState } =
          inserted.data?.appState || {};
        const newTab: TabData = {
          id: inserted.id,
          name: inserted.name,
          data: { elements: inserted.data?.elements || [], appState },
          history: [],
          frames: [{ elements: inserted.data?.elements || [], appState }],
        };
        setTabs([newTab]);
        setActiveTabId(newTab.id);
      }
    };

    load();
  }, [user]);

  const addTab = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("math_problems")
      .insert({
        user_id: user.id,
        name: `Problem ${tabs.length + 1}`,
        data: { elements: [], appState: {} },
      })
      .select("id, name, data")
      .single();

    if (error) {
      console.error("Failed to add tab:", error);
      toast.error("Failed to add tab");
      return;
    }

    const { collaborators: _c, ...appState } = data.data?.appState || {};
    const newTab: TabData = {
      id: data.id,
      name: data.name,
      data: { elements: data.data?.elements || [], appState },
      history: [],
      frames: [{ elements: data.data?.elements || [], appState }],
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const updateTabData = useCallback(
    async (elements: readonly ExcalidrawElement[], appState: AppState) => {
      elements.forEach((el) => {
        if (el.type === "text") {
          const prev = prevElements.current.find((p) => p.id === el.id);
          if (prev && prev.type === "text" && prev.text !== el.text) {
            setTextHistories((h) => {
              const history = h[el.id] || [];
              return { ...h, [el.id]: [...history, prev.text] };
            });
          }
        }
      });
      prevElements.current = elements;
      const { collaborators, ...cleanAppState } = appState;
      const newData = { elements, appState: cleanAppState };
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId
            ? { ...tab, data: newData, frames: [...tab.frames, newData] }
            : tab,
        ),
      );
      if (activeTabId) {
        await supabase
          .from("math_problems")
          .update({ data: newData, updated_at: new Date().toISOString() })
          .eq("id", activeTabId);
      }
    },
    [activeTabId],
  );

  const saveVersion = async () => {
    const tab = tabs.find((t) => t.id === activeTabId);
    if (!tab) return;
    const { collaborators, ...cleanAppState } = tab.data.appState || {};
    const versionData = {
      elements: tab.data.elements,
      appState: cleanAppState,
    };

    const { data, error } = await supabase
      .from("math_problem_versions")
      .insert({ problem_id: tab.id, data: versionData })
      .select("id, data, created_at")
      .single();

    if (error) {
      console.error("Failed to save version:", error);
      toast.error("Failed to save version");
      return;
    }

    const newVersion = {
      id: data.id,
      created_at: data.created_at,
      data: versionData,
    };
    const newTabs = tabs.map((t) =>
      t.id === tab.id ? { ...t, history: [...t.history, newVersion] } : t,
    );
    setTabs(newTabs);
  };

  const restoreVersion = async (versionId: string) => {
    const tab = tabs.find((t) => t.id === activeTabId);
    if (!tab) return;
    const version = tab.history.find((h) => h.id === versionId);
    if (!version) return;
    const { collaborators, ...cleanAppState } = version.data.appState || {};
    const versionData = {
      elements: version.data.elements,
      appState: cleanAppState,
    };

    const newTabs = tabs.map((t) =>
      t.id === tab.id ? { ...t, data: versionData, frames: [versionData] } : t,
    );
    setTabs(newTabs);
    await supabase
      .from("math_problems")
      .update({ data: versionData, updated_at: new Date().toISOString() })
      .eq("id", tab.id);
  };

  const stopReplay = () => {
    setIsReplaying(false);
    if (replayTimer.current) clearInterval(replayTimer.current);
    replayTimer.current = null;
  };

  const startReplay = () => {
    const tab = tabs.find((t) => t.id === activeTabId);
    if (!tab) return;
    stopReplay();
    replayIndex.current = 0;
    setIsReplaying(true);
    replayTimer.current = setInterval(() => {
      const frame = tab.frames[replayIndex.current];
      if (!frame) {
        stopReplay();
        return;
      }
      excalidrawRef.current?.updateScene({
        elements: frame.elements,
        appState: frame.appState as AppState,
      });
      replayIndex.current++;
    }, 500);
  };

  const rewindReplay = () => {
    const tab = tabs.find((t) => t.id === activeTabId);
    if (!tab) return;
    stopReplay();
    const frame = tab.frames[0];
    if (frame) {
      excalidrawRef.current?.updateScene({
        elements: frame.elements,
        appState: frame.appState as AppState,
      });
      replayIndex.current = 0;
    }
  };

  const activeTab = tabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    if (activeTab) {
      prevElements.current = activeTab.data.elements;
    }
  }, [activeTab]);

  useEffect(() => {
    return () => stopReplay();
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const api = excalidrawRef.current;
    if (!api) return;
    const ids = Object.keys(api.getAppState().selectedElementIds);
    if (ids.length === 1) {
      const el = api.getSceneElements().find((el) => el.id === ids[0]);
      if (el && el.type === "text") {
        setContextMenu({ x: e.clientX, y: e.clientY, elementId: el.id });
      }
    }
  };

  const startEdit = () => {
    if (!contextMenu) return;
    const api = excalidrawRef.current;
    const el = api
      ?.getSceneElements()
      .find((e) => e.id === contextMenu.elementId);
    if (el && el.type === "text") {
      setEditing({ elementId: el.id, text: el.text });
    }
    setContextMenu(null);
  };

  const openHistory = () => {
    if (contextMenu) {
      setHistoryModal(contextMenu.elementId);
      setContextMenu(null);
    }
  };

  const saveEdit = () => {
    if (!editing) return;
    const api = excalidrawRef.current;
    if (!api) return;
    const elements = api
      .getSceneElements()
      .map((el) =>
        el.id === editing.elementId && el.type === "text"
          ? { ...el, text: editing.text }
          : el,
      ) as readonly ExcalidrawElement[];
    api.updateScene({ elements });
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              tab.id === activeTabId
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white/70 text-gray-700 border-gray-300 hover:bg-white"
            }`}
          >
            {tab.name}
          </button>
        ))}
        <button
          onClick={addTab}
          className="p-1 rounded-full border border-gray-300 hover:bg-white"
          title="New Tab"
        >
          <PlusCircle className="w-5 h-5 text-gray-700" />
        </button>
        {activeTab && activeTab.history.length > 0 && (
          <select
            className="ml-auto input-dreamy max-w-xs"
            onChange={(e) => restoreVersion(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              History
            </option>
            {activeTab.history
              .slice()
              .reverse()
              .map((h) => (
                <option key={h.id} value={h.id}>
                  {new Date(h.created_at).toLocaleString()}
                </option>
              ))}
          </select>
        )}
        <button
          onClick={saveVersion}
          className="p-1 rounded-full border border-gray-300 hover:bg-white"
          title="Save Version"
        >
          <History className="w-5 h-5 text-gray-700" />
        </button>
        {activeTab && (
          <>
            <button
              onClick={rewindReplay}
              className="p-1 rounded-full border border-gray-300 hover:bg-white"
              title="Rewind Replay"
            >
              <Rewind className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={isReplaying ? stopReplay : startReplay}
              className="p-1 rounded-full border border-gray-300 hover:bg-white"
              title={isReplaying ? "Pause Replay" : "Play Replay"}
            >
              {isReplaying ? (
                <Pause className="w-5 h-5 text-gray-700" />
              ) : (
                <Play className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </>
        )}
      </div>
      <div
        className="border rounded-lg h-[600px] bg-white"
        onContextMenu={handleContextMenu}
      >
        {activeTab && (
          <ExcalidrawLib
            ref={excalidrawRef}
            key={activeTab.id}
            initialData={activeTab.data}
            onChange={updateTabData}
          />
        )}
      </div>
      {contextMenu && (
        <div
          className="fixed z-50 rounded-lg shadow-lg backdrop-blur-md bg-gradient-to-br from-pink-500/90 to-purple-500/90 text-white"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="block w-full text-left px-4 py-2 hover:bg-white/20"
            onClick={startEdit}
          >
            Edit
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-white/20"
            onClick={openHistory}
          >
            History
          </button>
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/80 rounded-lg p-4 shadow-xl w-72">
            <textarea
              className="w-full border rounded p-2 text-gray-800"
              value={editing.text}
              onChange={(e) => setEditing({ ...editing, text: e.target.value })}
              autoFocus
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded bg-gray-200"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-blue-500 text-white"
                onClick={saveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {historyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/80 rounded-lg p-4 shadow-xl w-72">
            <h3 className="font-semibold mb-2">Edit History</h3>
            <ul className="max-h-48 overflow-y-auto space-y-1">
              {(textHistories[historyModal] || []).map((t, i) => (
                <li key={i} className="p-1 rounded bg-gray-100 text-gray-800">
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-end">
              <button
                className="px-3 py-1 rounded bg-blue-500 text-white"
                onClick={() => setHistoryModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
