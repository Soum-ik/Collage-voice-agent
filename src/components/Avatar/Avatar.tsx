import React from "react";
import { AgentStatus } from "@/types";

interface AvatarProps {
  status: AgentStatus;
  isWaving: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ status, isWaving }) => {
  const isSpeaking = status === AgentStatus.Speaking;
  const isListening = status === AgentStatus.Listening;
  const isConnecting = status === AgentStatus.Connecting;
  const isThinking = status === AgentStatus.Thinking;

  return (
    // SIZE UPDATE: Reduced from w-75/125 (300/500px) to w-[240px]/[350px]
    <div className="relative w-60 h-60 md:w-87.5 md:h-87.5 mx-auto cursor-pointer hover:scale-105 transition-transform duration-300">
      {/* Style for avatar */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes head-tilt {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        @keyframes speak-glow {
          0%, 100% { filter: drop-shadow(0 0 10px #6366F1) drop-shadow(0 0 25px #6366F1) drop-shadow(0 0 40px #818CF8); opacity: 0.9; }
          50% { filter: drop-shadow(0 0 20px #818CF8) drop-shadow(0 0 40px #A5B4FC) drop-shadow(0 0 60px #C7D2FE); opacity: 1; }
        }
        @keyframes mouth-speak {
          0% { height: 4px; y: 120; }
          25% { height: 12px; y: 116; }
          50% { height: 8px; y: 118; }
          75% { height: 14px; y: 115; }
          100% { height: 4px; y: 120; }
        }
        @keyframes mouth-flicker {
           0%   { fill: #4A5568; }
           20%  { fill: #A5B4FC; }
           40%  { fill: #818CF8; }
           60%  { fill: #C7D2FE; }
           80%  { fill: #818CF8; }
           100% { fill: #4A5568; }
        }
        @keyframes antenna-pulse {
           0%, 100% { fill: #A5B4FC; transform: scale(1); }
           50% { fill: #4F46E5; transform: scale(1.3); }
        }
        @keyframes wave-arm {
            0% { transform: rotate(0deg); }
            15% { transform: rotate(35deg) translate(8px, -8px); }
            30% { transform: rotate(-20deg); }
            45% { transform: rotate(30deg) translate(8px, -8px); }
            60% { transform: rotate(-15deg); }
            100% { transform: rotate(0deg); }
        }
        @keyframes listen-pulse {
          0%, 100% { filter: drop-shadow(0 0 5px #A5B4FC); opacity: 0.8; }
          50% { filter: drop-shadow(0 0 15px #818CF8) drop-shadow(0 0 25px #6366F1); opacity: 1; }
        }
        @keyframes thinking-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes sound-wave {
          0% { opacity: 0.8; transform: scale(1); }
          100% { opacity: 0; transform: scale(2.5); }
        }
        @keyframes particle-float {
          0% { opacity: 0; transform: translateY(0) translateX(0); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-100px) translateX(var(--tx, 0px)); }
        }
        @keyframes eye-shine {
          0%, 100% { transform: translate(0, 0); opacity: 0.6; }
          50% { transform: translate(5px, -5px); opacity: 1; }
        }
        @keyframes body-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes connecting-glow {
          0%, 100% { opacity: 0.5; filter: blur(5px); }
          50% { opacity: 1; filter: blur(10px); }
        }

        .avatar-body {
          animation: breathe 4s ease-in-out infinite;
        }
        .avatar-head {
           animation: head-tilt 5s ease-in-out infinite;
        }
        .avatar-eye-pupil {
          transition: all 0.2s ease;
          transform-origin: center;
        }
        .avatar-eye-container {
          animation: blink 4s ease-in-out infinite;
        }
        .avatar-eye-shine {
          animation: eye-shine 3s ease-in-out infinite;
        }
        .is-speaking .avatar-eye-pupil {
           animation: speak-glow 1.2s ease-in-out infinite;
        }
        .is-speaking .avatar-mouth {
            animation: mouth-speak 0.3s ease-in-out infinite;
        }
        .is-speaking .avatar-body {
            animation: breathe 3s ease-in-out infinite, body-bounce 0.5s ease-in-out infinite;
        }
        .is-connecting .antenna-tip {
            animation: antenna-pulse 0.8s ease-in-out infinite;
        }
        .is-connecting .avatar-body {
            animation: breathe 2s ease-in-out infinite;
        }
        .is-waving .avatar-arm-right {
           transform-origin: 150px 105px;
           animation: wave-arm 1.5s ease-in-out infinite;
        }
        .is-listening .avatar-eye-pupil {
            animation: listen-pulse 2s ease-in-out infinite;
        }
        .is-listening .avatar-body {
            animation: breathe 3.5s ease-in-out infinite;
        }
        .is-thinking .thinking-dots {
            transform-origin: 100px 90px;
            animation: thinking-rotate 1.2s linear infinite;
        }
        .sound-wave-ring {
          animation: sound-wave 2s ease-out infinite;
        }
        .sound-wave-ring:nth-child(2) {
          animation-delay: 0.3s;
        }
        .sound-wave-ring:nth-child(3) {
          animation-delay: 0.6s;
        }
        .particle {
          animation: particle-float 3s ease-out infinite;
        }
      `}</style>

      {/* Sound wave rings for listening */}
      {isListening && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="sound-wave-ring absolute w-32 h-32 border-2 border-indigo-400 rounded-full"
            style={{ "--tx": "20px" } as React.CSSProperties}
          ></div>
          <div
            className="sound-wave-ring absolute w-32 h-32 border-2 border-indigo-400 rounded-full"
            style={{ "--tx": "-20px" } as React.CSSProperties}
          ></div>
        </div>
      )}

      {/* SVG of avatar */}
      <svg
        viewBox="0 0 200 200"
        className={`w-full h-full drop-shadow-2xl transition-all duration-300 ${
          isSpeaking ? "is-speaking" : ""
        } ${isConnecting ? "is-connecting" : ""} ${
          isWaving ? "is-waving" : ""
        } ${isListening ? "is-listening" : ""} ${
          isThinking ? "is-thinking" : ""
        }`}
      >
        {/* Enhanced Shadow with glow */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="bodyGradient">
            <stop offset="0%" stopColor="#9CA3AF" />
            <stop offset="100%" stopColor="#718096" />
          </radialGradient>
          <radialGradient id="headGradient">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E0" />
          </radialGradient>
        </defs>

        <ellipse
          cx="100"
          cy="190"
          rx="60"
          ry="12"
          fill="rgba(0,0,0,0.3)"
          className="transition-all duration-500"
          style={{
            transform:
              isListening || isConnecting || isSpeaking || isThinking
                ? "translateY(-20px) scale(1.1)"
                : "translateY(0) scale(1)",
            filter: isSpeaking ? "blur(8px)" : "blur(4px)",
          }}
        />

        <g className="avatar-body">
          {/* Left Arm with more detail - Bigger */}
          <path
            d="M 50 105 C 35 120, 35 145, 50 160 L 70 145 C 60 140, 60 125, 50 105 Z"
            fill="#4A5568"
            className="transition-all duration-300"
          />
          <ellipse
            cx="60"
            cy="132"
            rx="12"
            ry="18"
            fill="#2D3748"
            opacity="0.3"
          />

          {/* Enhanced Body */}
          <path
            d="M 70,170 C 70,120 130,120 130,170 L 120,180 C 120,190 80,190 80,180 Z"
            fill="url(#bodyGradient)"
            filter="url(#glow)"
          />
          <rect x="80" y="175" width="40" height="10" rx="5" fill="#4A5568" />
          <ellipse
            cx="100"
            cy="145"
            rx="25"
            ry="15"
            fill="#2D3748"
            opacity="0.2"
          />

          {/* Right Arm - Bigger */}
          <g className="avatar-arm-right">
            <path
              d="M 150 105 C 165 120, 165 145, 150 160 L 130 145 C 140 140, 140 125, 150 105 Z"
              fill="#4A5568"
              className="transition-all duration-300"
            />
            <ellipse
              cx="140"
              cy="132"
              rx="12"
              ry="18"
              fill="#2D3748"
              opacity="0.3"
            />
          </g>

          {/* Enhanced Head */}
          <g className="avatar-head" transform-origin="100px 140px">
            <circle
              cx="100"
              cy="95"
              r="50"
              fill="url(#headGradient)"
              filter="url(#glow)"
            />
            <path
              d="M 70 125 C 80 145, 120 145, 130 125 L 100 125 Z"
              fill="#A0AEC0"
            />{" "}
            {/* Neck */}
            {/* Enhanced Eye with blinking */}
            <g className="avatar-eye-container" transform-origin="100px 90px">
              <circle cx="100" cy="90" r="30" fill="#2D3748" />
              <circle
                cx="100"
                cy="90"
                r="18"
                fill="#4F46E5"
                className="avatar-eye-pupil"
              />
              <circle
                cx="108"
                cy="82"
                r="6"
                fill="rgba(255,255,255,0.5)"
                className="avatar-eye-shine"
              />
              <circle cx="105" cy="85" r="2" fill="rgba(255,255,255,0.8)" />
            </g>
            {/* Thinking Indicator */}
            <g
              className="thinking-dots"
              style={{
                opacity: isThinking ? 1 : 0,
                transition: "opacity 0.3s ease-in-out",
              }}
            >
              <circle cx="100" cy="70" r="3" fill="white" />
              <circle cx="118" cy="83" r="3" fill="white" />
              <circle cx="112" cy="105" r="3" fill="white" />
              <circle cx="88" cy="105" r="3" fill="white" />
              <circle cx="82" cy="83" r="3" fill="white" />
            </g>
            {/* Enhanced Mouth */}
            <rect
              x="90"
              y="120"
              width="20"
              height="4"
              rx="2"
              className="avatar-mouth"
              fill="#4A5568"
            />
            {/* Enhanced Antennae */}
            <path
              d="M 120 50 C 130 30, 140 40, 135 55"
              stroke="#718096"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
            <circle
              cx="135"
              cy="55"
              r="5"
              className="antenna-tip"
              fill="#A5B4FC"
              filter="url(#glow)"
            />
            <path
              d="M 80 50 C 70 30, 60 40, 65 55"
              stroke="#718096"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
            <circle
              cx="65"
              cy="55"
              r="5"
              className="antenna-tip"
              fill="#A5B4FC"
              filter="url(#glow)"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Avatar;
