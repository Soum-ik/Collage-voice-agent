import { useState } from "react";
import Avatar from "../components/Avatar/Avatar";
import TranscriptView from "../components/Chat/TranscriptView";
import SessionControls from "../components/Controls/SessionControls";
import { useVoiceAgent } from "../hooks/useVoiceAgent";
import { AgentStatus } from "@/types";
import { IoIosSettings } from "react-icons/io";

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
    <div className="min-h-screen flex flex-col bg-gray-900 bg-radial from-0% from-[#143075] to-100% to-[#030A1B] p-4">
      <header className="flex justify-between border-b border-[#283a71] pb-4 py-2">
        <div className="flex items-center gap-4">
          <h1 className="font-Space text-xl font-thin">
            SPI <span className="font-bold text-cyan-500">Voice Agent</span>
          </h1>
          {/* <p>Real-time conversational AI powered by the Stack69 model</p> */}
        </div>
        <div>
          <IoIosSettings size={24} />
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-center items-center">
          {/* Avatar component */}
          {isSessionActive ? (
            <div className="">
              <Avatar status={agentStatus} isWaving={isWaving} />
            </div>
          ) : (
            <>
              <div className="h-full w-full flex flex-col justify-center items-center">
                <h1 className="text-5xl text-center font-semibold text-white/90 font-Space">
                  <span className="text-cyan-500">Hey there!</span> <br />
                  What can I do for you today?
                </h1>
              </div>
            </>
          )}

          {/* chat component */}
          {/* <TranscriptView
            transcript={transcript}
            isAuthenticated={isAuthenticated}
          /> */}
        </div>
        {/* buttons for control */}
        <div className="mb-4">
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
