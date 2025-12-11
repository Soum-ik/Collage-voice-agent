// src/components/Controls/SessionControls.tsx
import React from "react";
import { AgentStatus } from "@/types";

interface SessionControlsProps {
  agentStatus: AgentStatus;
  password?: string;
  onToggleSession: () => void;
  error: string | null;
}

const MicrophoneIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-16 w-16 text-white"
  >
    <path d="M12 1.75a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-1.5 0V2.5a.75.75 0 0 1 .75-.75Z" />
    <path d="M15.75 8.25a.75.75 0 0 1 .75.75v5.25a4.5 4.5 0 0 1-9 0V9a.75.75 0 0 1 1.5 0v5.25a3 3 0 0 0 6 0V9a.75.75 0 0 1 .75-.75Z" />
    <path d="M12 15.75a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75Z" />
    <path
      fillRule="evenodd"
      d="M12 21.75a9.75 9.75 0 1 0 0-19.5 9.75 9.75 0 0 0 0 19.5Zm0-1.5a8.25 8.25 0 1 0 0-16.5 8.25 8.25 0 0 0 0 16.5Z"
      clipRule="evenodd"
    />
  </svg>
);

const SessionControls: React.FC<SessionControlsProps> = ({
  agentStatus,
  password,
  onToggleSession,
  error,
}) => {
  const getButtonState = () => {
    switch (agentStatus) {
      case AgentStatus.Idle:
        return {
          text: "Start Session",
          color: "bg-indigo-600 hover:bg-indigo-500",
          pulse: false,
        };
      case AgentStatus.Connecting:
        return { text: "Connecting...", color: "bg-yellow-600", pulse: true };
      case AgentStatus.Error:
        return {
          text: "Retry Session",
          color: "bg-red-600 hover:bg-red-500",
          pulse: false,
        };
      default:
        return {
          text: "Stop Session",
          color: "bg-red-600 hover:bg-red-500",
          pulse: false,
        };
    }
  };

  const { text, color, pulse } = getButtonState();

  return (
    <div className="mt-6 text-center">
      {error && (
        <p className="text-red-400 mb-4 font-semibold text-base">{error}</p>
      )}

      {agentStatus === AgentStatus.Idle ||
      agentStatus === AgentStatus.Error ||
      agentStatus === AgentStatus.Connecting ? (
        <button
          onClick={onToggleSession}
          disabled={agentStatus === AgentStatus.Connecting}
          className={`relative inline-flex items-center justify-center rounded-full w-48 h-48 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white ${color} ${
            agentStatus === AgentStatus.Connecting ? "cursor-not-allowed" : ""
          }`}
        >
          {pulse && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/50 opacity-75"></span>
          )}
          <div className="z-10 flex flex-col items-center">
            <MicrophoneIcon />
            <span className="mt-2 text-lg font-semibold">{text}</span>
          </div>
        </button>
      ) : (
        <button
          onClick={onToggleSession}
          className="px-8 py-4 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-colors text-lg"
        >
          Stop Session
        </button>
      )}
    </div>
  );
};

export default SessionControls;
