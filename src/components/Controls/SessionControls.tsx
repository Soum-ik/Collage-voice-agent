import React from "react";
import { AgentStatus } from "@/types";
import { RxCross2 } from "react-icons/rx";
import { RiMic2AiLine } from "react-icons/ri";
import { BsSoundwave } from "react-icons/bs";
import { Bars } from "react-loader-spinner";

interface SessionControlsProps {
  agentStatus: AgentStatus;
  password?: string;
  onToggleSession: () => void;
  error: string | null;
}

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
          text: "Speak",
          color: "bg-indigo-600 hover:bg-indigo-500",
          pulse: false,
        };
      case AgentStatus.Connecting:
        return { text: "Connecting...", color: "bg-yellow-600", pulse: true };
      case AgentStatus.Error:
        return {
          text: "Retry",
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
    <>
      <div className="text-center">
        {error && (
          <p className="text-red-400 mb-4 font-semibold text-base">{error}</p>
        )}

        <div className=" flex justify-center items-center">
          <div className="flex gap-3 mx-auto border-2 rounded-full p-2 border-white/20 bg-gray-800/50 backdrop-blur-sm">
            {agentStatus === AgentStatus.Idle ||
            agentStatus === AgentStatus.Error ||
            agentStatus === AgentStatus.Connecting ? (
              <>
                <button
                  onClick={onToggleSession}
                  disabled={agentStatus === AgentStatus.Connecting}
                  className="px-4 py-3 bg-white/15 rounded-full text-lg hover:bg-blue-600 transition-all duration-300 flex justify-center items-center gap-2 cursor-pointer"
                >
                  {agentStatus === AgentStatus.Connecting ? (
                    <Bars
                      height="18"
                      width="18"
                      color="#ffffff"
                      ariaLabel="bars-loading"
                      wrapperStyle={{}}
                      wrapperClass=""
                      visible={true}
                    />
                  ) : (
                    <RiMic2AiLine />
                  )}
                  <p className="text-sm">{text}</p>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onToggleSession}
                  className="px-4 py-3 bg-white/15 rounded-full text-lg hover:bg-red-600 flex justify-center items-center gap-2 cursor-pointer"
                >
                  <RxCross2 />
                  <p className="text-sm">End</p>
                </button>
                <button className="px-4 py-3 rounded-full text-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 cursor-pointer">
                  <BsSoundwave />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SessionControls;
