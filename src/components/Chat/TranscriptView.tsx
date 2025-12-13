import { Speaker, TranscriptEntry } from "@/types";
import React, { useEffect, useRef } from "react";

interface TranscriptViewProps {
  transcript: TranscriptEntry[];
  isAuthenticated: boolean;
}

const TranscriptView: React.FC<TranscriptViewProps> = ({
  transcript,
  isAuthenticated,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 bg-gray-800/50 rounded-lg p-4 space-y-4 overflow-y-auto backdrop-blur-sm h-64 md:h-96"
    >
      {transcript.map((entry) => (
        <div
          key={entry.id}
          className={`flex items-start gap-3 ${
            entry.speaker === Speaker.User ? "justify-end" : "justify-start"
          }`}
        >
          {entry.speaker === Speaker.Agent && (
            <div className="w-8 h-8 rounded-full bg-indigo-500 shrink-0 mt-1"></div>
          )}
          <div
            className={`max-w-md p-3 rounded-2xl ${
              entry.speaker === Speaker.User
                ? "bg-blue-600 rounded-br-none"
                : "bg-gray-700 rounded-bl-none"
            }`}
          >
            <p className="text-sm font-medium">{entry.speaker}</p>
            <p className="text-white">{entry.text}</p>
          </div>
        </div>
      ))}
      {!isAuthenticated && transcript.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
          <p>Click the button below and say "Hello" to start.</p>
        </div>
      )}
    </div>
  );
};

export default TranscriptView;
