import React, { useState, useEffect } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { ZenzaCalendar } from "@/components/calendar/ZenzaCalendar";
import { GrowthTracker } from "./GrowthTracker";
import { AffirmationsModule } from "./AffirmationsModule";
import { FamilyModule } from "./FamilyModule";
import { LifeLogistics } from "./LifeLogistics";
import { AncestryModule } from "./AncestryModule";
import { GarbageModule } from "./GarbageModule";
import { SettingsModule } from "./SettingsModule";
import { SpiritualModule } from "./SpiritualModule";
import { TimerModule } from "./TimerModule";
import { GracePrayerModule } from "./GracePrayerModule";
import { VerseOfTheDay } from "./VerseOfTheDay";
import { MathNotebookModule } from "./MathNotebookModule";
import {
  Calendar,
  TrendingUp,
  Heart,
  Users,
  MapPin,
  Trash2,
  Timer as TimerIcon,
  Settings,
  LogOut,
  Sparkles,
  TreePine,
  Menu,
  BookOpen,
  Mic,
  Pencil,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { MailingListPrompt } from "../auth/MailingListPrompt";
import { OnboardingModal } from "../onboarding/OnboardingModal";
import { Footer } from "../Footer";
import { ChangeLogButton } from "../ChangeLogButton";
import { RefreshButton } from "../RefreshButton";
import { PullToRefreshToggleButton } from "../PullToRefreshToggleButton";
import { FastingPrayerReminder } from "../FastingPrayerReminder";

type DashboardTab =
  | "calendar"
  | "growth"
  | "affirmations"
  | "timer"
  | "family"
  | "ancestry"
  | "logistics"
  | "garbage"
  | "verse"
  | "spiritual"
  | "grace"
  | "math"
  | "settings";

const navigationItems = [
  { id: "calendar", label: "Your Calendar", icon: Calendar, color: "text-blue-500" },
  { id: "growth", label: "1% Better", icon: TrendingUp, color: "text-green-500" },
  { id: "affirmations", label: "Affirmations", icon: Heart, color: "text-pink-500" },
  { id: "timer", label: "Timers", icon: TimerIcon, color: "text-blue-500" },
  { id: "family", label: "Family", icon: Users, color: "text-purple-500" },
  { id: "ancestry", label: "Ancestry", icon: TreePine, color: "text-green-600" },
  { id: "logistics", label: "Life Logistics", icon: MapPin, color: "text-orange-500" },
  { id: "garbage", label: "Garbage/Recycling", icon: Trash2, color: "text-gray-500" },
  { id: "verse", label: "Verse of the Day", icon: Sparkles, color: "text-indigo-500" },
  { id: "spiritual", label: "Spiritual Study", icon: BookOpen, color: "text-purple-500" },
  { id: "grace", label: "Grace Prayer", icon: Mic, color: "text-purple-500" },
  { id: "math", label: "Math Notebook", icon: Pencil, color: "text-blue-600" },
  { id: "settings", label: "Settings", icon: Settings, color: "text-gray-600" },
] as const;

export function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("calendar");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const storageKey = isMobile ? "ptr-mobile-enabled" : "ptr-desktop-enabled";
  const [pullRefreshEnabled, setPullRefreshEnabled] = useState(
    () => localStorage.getItem(storageKey) === "true"
  );

  useEffect(() => {
    setPullRefreshEnabled(localStorage.getItem(storageKey) === "true");
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, String(pullRefreshEnabled));
  }, [pullRefreshEnabled, storageKey]);

  usePullToRefresh(pullRefreshEnabled);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error("Failed to sign out: " + error.message);
    }
  };

  const renderContent = (): JSX.Element => {
    switch (activeTab) {
      case "calendar":
        return <ZenzaCalendar />;
      case "growth":
        return <GrowthTracker />;
      case "affirmations":
        return <AffirmationsModule />;
      case "timer":
        return <TimerModule />;
      case "family":
        return <FamilyModule />;
      case "ancestry":
        return <AncestryModule />;
      case "logistics":
        return <LifeLogistics />;
      case "garbage":
        return <GarbageModule />;
      case "verse":
        return <VerseOfTheDay />;
      case "spiritual":
        return <SpiritualModule />;
      case "grace":
        return <GracePrayerModule />;
      case "math":
        return <MathNotebookModule />;
      case "settings":
        return <SettingsModule />;
      default:
        return <ZenzaCalendar />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      <FastingPrayerReminder />
      {/* Mobile menu button */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/20"
          onClick={() => setSidebarCollapsed(true)}
        ></div>
      )}
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white/80 backdrop-blur-lg border-r border-white/50 z-40 transform transition-transform duration-300 ${
          sidebarCollapsed
            ? "-translate-x-full md:translate-x-0 md:w-16 w-64"
            : "translate-x-0 w-64"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-light text-gray-800">ZenzaLife</h1>
                <p className="text-xs text-gray-600/80">Scheduler</p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-white/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {profile?.display_name || "User"}
                </p>
                <p className="text-xs text-gray-600/80 capitalize">
                  {profile?.relationship_role || "Individual"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as DashboardTab)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive ? "bg-white/70 shadow-sm" : "hover:bg-white/40"
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? item.color : "text-gray-600"}`}
                />
                {!sidebarCollapsed && (
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-gray-800" : "text-gray-600"
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
            title={sidebarCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">Sign Out</span>
            )}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-white rounded-full shadow-md items-center justify-center hover:shadow-lg transition-shadow"
        >
          <span
            className={`text-xs transition-transform duration-300 ${
              sidebarCollapsed ? "rotate-180" : ""
            }`}
          >
            ‹
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ml-0 ${
          sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        <div className="p-6">{renderContent()}</div>
      </div>
      <OnboardingModal />
      <MailingListPrompt />
      <RefreshButton />
      <PullToRefreshToggleButton
        enabled={pullRefreshEnabled}
        toggle={() => setPullRefreshEnabled(!pullRefreshEnabled)}
      />
      <ChangeLogButton />
      <Footer />
    </div>
  );
}
