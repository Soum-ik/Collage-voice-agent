import { useState } from "react";
import Avatar from "../components/Avatar/Avatar";
import TranscriptView from "../components/Chat/TranscriptView";
import SessionControls from "../components/Controls/SessionControls";
import { useVoiceAgent } from "../hooks/useVoiceAgent";
import { AgentStatus } from "@/types";

export default function AgentPage() {
  const [password] = useState("stack123");

  const {
    agentStatus,
    transcript,
    isAuthenticated,
    error,
    isWaving,
    startSession,
    stopSession,
  } = useVoiceAgent();

  const handleToggleSession = () => {
    if (agentStatus === AgentStatus.Idle || agentStatus === AgentStatus.Error) {
      startSession();
    } else {
      stopSession();
    }
  };

  const isSessionActive =
    agentStatus !== AgentStatus.Idle && agentStatus !== AgentStatus.Error;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-gray-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <header className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Voice Agent Stack69
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Real-time conversational AI powered by the Stack69 model
        </p>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto">
        <div className="flex-grow flex flex-col">
          {/* Avatar component */}
          {isSessionActive && (
            <div className="mb-6">
              <Avatar status={agentStatus} isWaving={isWaving} />
            </div>
          )}

          {/* chat component */}
          <TranscriptView
            transcript={transcript}
            isAuthenticated={isAuthenticated}
          />

          {/* Button component */}
          <SessionControls
            agentStatus={agentStatus}
            error={error}
            onToggleSession={handleToggleSession}
            password={password}
          />
        </div>
      </main>
    </div>
  );
}
