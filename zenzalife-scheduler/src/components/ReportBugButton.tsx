import React from "react";

function HaroldBugIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="3" stroke="#8b5cf6" />
      <path d="M12 9V3" stroke="#8b5cf6" />
      <path d="M8 8L4 4" stroke="#8b5cf6" />
      <path d="M16 8l4-4" stroke="#8b5cf6" />
      <path d="M8 16l-4 4" stroke="#8b5cf6" />
      <path d="M16 16l4 4" stroke="#8b5cf6" />
      <path d="M5 12h14" stroke="#8b5cf6" />
      <path d="M12 15v6" stroke="#8b5cf6" />
      <path d="M14 2l-4 2 4 2" stroke="#ec4899" fill="#ec4899" />
    </svg>
  );
}

export function ReportBugButton() {
  return (
    <button
      onClick={() =>
        window.open(
          "https://github.com/zenza/zenzascheduler_os/issues/new",
          "_blank",
        )
      }
      className="fixed bottom-4 left-4 z-40 btn-dreamy text-xs flex items-center gap-2"
      title="Report a Bug"
    >
      <HaroldBugIcon className="w-4 h-4" />
      <span className="hidden sm:inline">Report a Bug</span>
    </button>
  );
}

export default ReportBugButton;
