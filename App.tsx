import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: Removed non-exported 'LiveSession' type.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { getSystemInstruction, KNOWLEDGE_BASE } from './constants';
import { AgentStatus, Speaker, TranscriptEntry, SearchResult } from './types';

// --- Helper Functions for Audio Processing ---
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // FIX: Corrected typo from Int1Ternary to Int16Array.
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- UI Components (defined outside App to prevent re-creation) ---

const Avatar: React.FC<{ status: AgentStatus; isWaving: boolean }> = ({ status, isWaving }) => {
  const isSpeaking = status === AgentStatus.Speaking;
  const isListening = status === AgentStatus.Listening;
  const isConnecting = status === AgentStatus.Connecting;
  const isThinking = status === AgentStatus.Thinking;

  return (
    <div className="relative w-[500px] h-[500px] mx-auto cursor-pointer hover:scale-105 transition-transform duration-300">
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
          <div className="sound-wave-ring absolute w-32 h-32 border-2 border-indigo-400 rounded-full" style={{ '--tx': '20px' } as React.CSSProperties}></div>
          <div className="sound-wave-ring absolute w-32 h-32 border-2 border-indigo-400 rounded-full" style={{ '--tx': '-20px' } as React.CSSProperties}></div>
          <div className="sound-wave-ring absolute w-32 h-32 border-2 border-indigo-400 rounded-full" style={{ '--tx': '0px' } as React.CSSProperties}></div>
        </div>
      )}

      {/* Particles for speaking */}
      {isSpeaking && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="particle absolute w-2 h-2 bg-indigo-400 rounded-full"
              style={{
                left: `${50 + (Math.random() - 0.5) * 30}%`,
                top: '60%',
                '--tx': `${(Math.random() - 0.5) * 100}px`,
                animationDelay: `${i * 0.2}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      <svg viewBox="0 0 200 200" className={`w-full h-full drop-shadow-2xl transition-all duration-300 ${isSpeaking ? 'is-speaking' : ''} ${isConnecting ? 'is-connecting' : ''} ${isWaving ? 'is-waving' : ''} ${isListening ? 'is-listening' : ''} ${isThinking ? 'is-thinking' : ''}`}>
        {/* Enhanced Shadow with glow */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
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
            transform: isListening || isConnecting || isSpeaking || isThinking ? 'translateY(-20px) scale(1.1)' : 'translateY(0) scale(1)',
            filter: isSpeaking ? 'blur(8px)' : 'blur(4px)'
          }} 
        />
        
        <g className="avatar-body">
            {/* Left Arm with more detail - Bigger */}
            <path d="M 50 105 C 35 120, 35 145, 50 160 L 70 145 C 60 140, 60 125, 50 105 Z" fill="#4A5568" className="transition-all duration-300"/>
            <ellipse cx="60" cy="132" rx="12" ry="18" fill="#2D3748" opacity="0.3"/>
            
            {/* Enhanced Body */}
            <path d="M 70,170 C 70,120 130,120 130,170 L 120,180 C 120,190 80,190 80,180 Z" fill="url(#bodyGradient)" filter="url(#glow)"/> 
            <rect x="80" y="175" width="40" height="10" rx="5" fill="#4A5568" />
            <ellipse cx="100" cy="145" rx="25" ry="15" fill="#2D3748" opacity="0.2"/>

            {/* Right Arm - Bigger */}
             <g className="avatar-arm-right">
                <path d="M 150 105 C 165 120, 165 145, 150 160 L 130 145 C 140 140, 140 125, 150 105 Z" fill="#4A5568" className="transition-all duration-300"/>
                <ellipse cx="140" cy="132" rx="12" ry="18" fill="#2D3748" opacity="0.3"/>
            </g>

            {/* Enhanced Head */}
            <g className="avatar-head" transform-origin="100px 140px">
                <circle cx="100" cy="95" r="50" fill="url(#headGradient)" filter="url(#glow)"/>
                <path d="M 70 125 C 80 145, 120 145, 130 125 L 100 125 Z" fill="#A0AEC0" /> {/* Neck */}

                {/* Enhanced Eye with blinking */}
                <g className="avatar-eye-container" transform-origin="100px 90px">
                  <circle cx="100" cy="90" r="30" fill="#2D3748"/>
                  <circle cx="100" cy="90" r="18" fill="#4F46E5" className="avatar-eye-pupil"/>
                  <circle cx="108" cy="82" r="6" fill="rgba(255,255,255,0.5)" className="avatar-eye-shine"/>
                  <circle cx="105" cy="85" r="2" fill="rgba(255,255,255,0.8)"/>
                </g>
                
                {/* Thinking Indicator */}
                <g className="thinking-dots" style={{ opacity: isThinking ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}>
                  <circle cx="100" cy="70" r="3" fill="white" />
                  <circle cx="118" cy="83" r="3" fill="white" />
                  <circle cx="112" cy="105" r="3" fill="white" />
                  <circle cx="88" cy="105" r="3" fill="white" />
                  <circle cx="82" cy="83" r="3" fill="white" />
                </g>
                
                {/* Enhanced Mouth */}
                <rect x="90" y="120" width="20" height="4" rx="2" className="avatar-mouth" fill="#4A5568"/>

                {/* Enhanced Antennae */}
                <path d="M 120 50 C 130 30, 140 40, 135 55" stroke="#718096" strokeWidth="5" fill="none" strokeLinecap="round" className="transition-all duration-300"/>
                <circle cx="135" cy="55" r="5" className="antenna-tip" fill="#A5B4FC" filter="url(#glow)"/>
                <path d="M 80 50 C 70 30, 60 40, 65 55" stroke="#718096" strokeWidth="5" fill="none" strokeLinecap="round" className="transition-all duration-300"/>
                <circle cx="65" cy="55" r="5" className="antenna-tip" fill="#A5B4FC" filter="url(#glow)"/>
            </g>
        </g>
      </svg>
    </div>
  );
};


const MicrophoneIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-16 w-16 text-white">
        <path d="M12 1.75a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-1.5 0V2.5a.75.75 0 0 1 .75-.75Z" />
        <path d="M15.75 8.25a.75.75 0 0 1 .75.75v5.25a4.5 4.5 0 0 1-9 0V9a.75.75 0 0 1 1.5 0v5.25a3 3 0 0 0 6 0V9a.75.75 0 0 1 .75-.75Z" />
        <path d="M12 15.75a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75Z" />
        <path fillRule="evenodd" d="M12 21.75a9.75 9.75 0 1 0 0-19.5 9.75 9.75 0 0 0 0 19.5Zm0-1.5a8.25 8.25 0 1 0 0-16.5 8.25 8.25 0 0 0 0 16.5Z" clipRule="evenodd" />
    </svg>
);


const TranscriptView: React.FC<{ transcript: TranscriptEntry[], isAuthenticated: boolean }> = ({ transcript, isAuthenticated }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div ref={scrollRef} className="flex-grow bg-gray-800/50 rounded-lg p-4 space-y-4 overflow-y-auto backdrop-blur-sm h-64 md:h-96">
      {transcript.map((entry) => (
        <div key={entry.id} className={`flex items-start gap-3 ${entry.speaker === Speaker.User ? 'justify-end' : 'justify-start'}`}>
          {entry.speaker === Speaker.Agent && <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 mt-1"></div>}
          <div className={`max-w-md p-3 rounded-2xl ${entry.speaker === Speaker.User ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
            <p className="text-sm font-medium">{entry.speaker}</p>
            <p className="text-white">{entry.text}</p>
            {entry.sources && entry.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-600">
                    <h4 className="text-xs font-semibold text-gray-400 mb-1">Sources:</h4>
                    <ul className="space-y-1">
                        {entry.sources.map((source) => (
                            <li key={source.uri}>
                                <a 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-xs text-blue-400 hover:underline break-all flex items-start gap-1.5"
                                >
                                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0 mt-0.5"><path d="M8.22 5.22a.75.75 0 0 1 1.06 0l2.5 2.5a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 0 1-1.06-1.06L9.94 9.5H4.75a.75.75 0 0 1 0-1.5h5.19l-1.72-1.72a.75.75 0 0 1 0-1.06Z" /><path fillRule="evenodd" d="M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0ZM4 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" /></svg>
                                   <span>{source.title || new URL(source.uri).hostname}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        </div>
      ))}
      {!isAuthenticated && transcript.length === 0 && (
         <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            <p>Click the button below and say "Hello" to start.</p>
        </div>
      )}
    </div>
  );
};

const KnowledgeBaseCard: React.FC = () => (
    <div className="w-full lg:w-96 bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm flex-shrink-0">
        <h2 className="text-xl font-bold mb-4 text-indigo-400">Knowledge Base</h2>
        <div className="text-sm text-gray-300 space-y-3 whitespace-pre-wrap font-mono">{KNOWLEDGE_BASE}</div>
    </div>
);


// --- Main App Component ---

export default function App() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(AgentStatus.Idle);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('stack123');
  const [passwordInput, setPasswordInput] = useState<string>('stack123');
  const [isWaving, setIsWaving] = useState<boolean>(false);


  // FIX: Replaced 'LiveSession' with 'any' as it's not an exported type.
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextsRef = useRef<{ input: AudioContext | null, output: AudioContext | null, processor: ScriptProcessorNode | null, source: MediaStreamAudioSourceNode | null }>({ input: null, output: null, processor: null, source: null });
  const audioPlaybackRef = useRef<{ queue: Set<AudioBufferSourceNode>, nextStartTime: number }>({ queue: new Set(), nextStartTime: 0 });
  const waveTriggeredRef = useRef(false);

  const currentInputTranscriptionRef = useRef("");
  const currentOutputTranscriptionRef = useRef("");
  
  useEffect(() => {
    setPassword('stack123');
    setPasswordInput('stack123');
  }, []);

  // const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setPasswordInput(e.target.value);
  // };

  // const handleSavePassword = () => {
  //   if (passwordInput.trim()) {
  //     const trimmedPassword = passwordInput.trim();
     
  //     alert('Password saved!');
  //   } else {
  //     alert('Password cannot be empty.');
  //   }
  // };

  const stopSession = useCallback(async () => {
    setAgentStatus(AgentStatus.Idle);
    setIsAuthenticated(false);
    setTranscript([]);
    setIsWaving(false);
    waveTriggeredRef.current = false;

    if (sessionPromiseRef.current) {
      try {
        const session = await sessionPromiseRef.current;
        session.close();
      } catch (e) {
        console.error("Error closing session:", e);
      }
      sessionPromiseRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextsRef.current.processor) {
        audioContextsRef.current.processor.disconnect();
        audioContextsRef.current.processor = null;
    }
    if (audioContextsRef.current.source) {
        audioContextsRef.current.source.disconnect();
        audioContextsRef.current.source = null;
    }

    if (audioContextsRef.current.input && audioContextsRef.current.input.state !== 'closed') {
      try { await audioContextsRef.current.input.close(); }
      catch(e) { console.error("Error closing input audio context:", e); }
      audioContextsRef.current.input = null;
    }
    if (audioContextsRef.current.output && audioContextsRef.current.output.state !== 'closed') {
      try { await audioContextsRef.current.output.close(); }
      catch(e) { console.error("Error closing output audio context:", e); }
      audioContextsRef.current.output = null;
    }

    audioPlaybackRef.current.queue.forEach(source => source.stop());
    audioPlaybackRef.current.queue.clear();
    audioPlaybackRef.current.nextStartTime = 0;
    
    currentInputTranscriptionRef.current = "";
    currentOutputTranscriptionRef.current = "";
  }, []);

  const startSession = useCallback(async () => {
     
    setError(null);
    setAgentStatus(AgentStatus.Connecting);

    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set. Please configure it to use the application.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: getSystemInstruction(password),
          tools: [{ googleSearch: {} }],
        },
        callbacks: {
          onopen: async () => {
            setAgentStatus(AgentStatus.Listening);
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextsRef.current.input = inputAudioContext;
            audioContextsRef.current.output = outputAudioContext;

            const source = inputAudioContext.createMediaStreamSource(streamRef.current);
            const processor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            audioContextsRef.current.source = source;
            audioContextsRef.current.processor = processor;
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16Data = new Int16Array(inputData.length);
              for(let i = 0; i < inputData.length; i++) {
                // Clamp the signal to [-1, 1] and scale to 16-bit integer range.
                int16Data[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16Data.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromiseRef.current?.then((session) => {
                 session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(processor);
            processor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const outputCtx = audioContextsRef.current.output;
            if (!outputCtx) return;

            const groundingMetadata = (message.serverContent as any)?.groundingMetadata;
            if (groundingMetadata?.groundingChunks) {
                const newSources: SearchResult[] = groundingMetadata.groundingChunks
                    .filter((chunk: any) => chunk.web && chunk.web.uri)
                    .map((chunk: any) => ({
                        uri: chunk.web.uri,
                        title: chunk.web.title || chunk.web.uri,
                    }));
                
                if (newSources.length > 0) {
                    setTranscript(prev => {
                        const last = prev[prev.length - 1];
                        if (last && last.speaker === Speaker.Agent) {
                            const existingSources = last.sources || [];
                            const combinedSources = [...existingSources];
                            newSources.forEach(ns => {
                                if (!combinedSources.some(es => es.uri === ns.uri)) {
                                    combinedSources.push(ns);
                                }
                            });
                            return [...prev.slice(0, -1), { ...last, sources: combinedSources }];
                        }
                        return prev;
                    });
                }
            }
            
            const isNewOutputTurn = currentOutputTranscriptionRef.current === "" && !!message.serverContent?.outputTranscription;
            if (isNewOutputTurn) {
                setAgentStatus(AgentStatus.Thinking);
            }
            
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setAgentStatus(AgentStatus.Speaking);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              
              const currentTime = outputCtx.currentTime;
              const startTime = Math.max(currentTime, audioPlaybackRef.current.nextStartTime);
              source.start(startTime);
              
              audioPlaybackRef.current.nextStartTime = startTime + audioBuffer.duration;
              audioPlaybackRef.current.queue.add(source);
              source.onended = () => {
                audioPlaybackRef.current.queue.delete(source);
                if (audioPlaybackRef.current.queue.size === 0) {
                    setAgentStatus(AgentStatus.Listening);
                }
              };
            }

            if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                currentInputTranscriptionRef.current += text;

                if (!waveTriggeredRef.current && /\b(hi|hello|hey)\b/i.test(currentInputTranscriptionRef.current)) {
                    waveTriggeredRef.current = true;
                    setIsWaving(true);
                    setTimeout(() => setIsWaving(false), 2500);
                }

                 setTranscript(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.speaker === Speaker.User) {
                        return [...prev.slice(0, -1), { ...last, text: currentInputTranscriptionRef.current }];
                    } else {
                        return [...prev, { id: Date.now(), speaker: Speaker.User, text: currentInputTranscriptionRef.current }];
                    }
                });
            }

            if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                currentOutputTranscriptionRef.current += text;
                if(text.toLowerCase().includes("access granted")) {
                    setIsAuthenticated(true);
                }
                setTranscript(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.speaker === Speaker.Agent) {
                        return [...prev.slice(0, -1), { ...last, text: currentOutputTranscriptionRef.current }];
                    } else {
                        return [...prev, { id: Date.now(), speaker: Speaker.Agent, text: currentOutputTranscriptionRef.current }];
                    }
                });
            }

            if (message.serverContent?.turnComplete) {
                currentInputTranscriptionRef.current = "";
                currentOutputTranscriptionRef.current = "";
                waveTriggeredRef.current = false;
            }
          },
          onclose: () => {
            console.log("Session closed.");
            stopSession();
          },
          onerror: (e: any) => {
            console.error("Session error:", e);
            setError("Session connection failed. Please check your internet connection and ensure your API key is correctly configured and has billing enabled.");
            stopSession();
          },
        },
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (e: any) {
      console.error("Failed to start session:", e);
      setError(e.message || "Failed to start session. Check permissions and API key.");
      setAgentStatus(AgentStatus.Error);
    }
  }, [stopSession, password]);

  const handleButtonClick = () => {
    if (agentStatus === AgentStatus.Idle || agentStatus === AgentStatus.Error || password !== 'stack123') {
      startSession();
    } else {
      stopSession();
    }
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getButtonState = () => {
    switch (agentStatus) {
        case AgentStatus.Idle: return { text: 'Start Session', color: 'bg-indigo-600 hover:bg-indigo-500', pulse: false };
        case AgentStatus.Connecting: return { text: 'Connecting...', color: 'bg-yellow-600', pulse: true };
        case AgentStatus.Error: return { text: 'Retry Session', color: 'bg-red-600 hover:bg-red-500', pulse: false };
        default: return { text: 'Stop Session', color: 'bg-red-600 hover:bg-red-500', pulse: false };
    }
  };

  const { text: buttonText, color: buttonColor, pulse } = getButtonState();
  const isSessionActive = agentStatus !== AgentStatus.Idle && agentStatus !== AgentStatus.Error;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-gray-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <header className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white">Voice Agent Stack69</h1>
        <p className="text-lg text-gray-400 mt-2">Real-time conversational AI powered by the Stack69 model</p>
      </header>
      
      <main className="flex-grow flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto">
        <div className="flex-grow flex flex-col">
          
          {isSessionActive && (
             <div className="mb-6">
                <Avatar status={agentStatus} isWaving={isWaving} />
            </div>
          )}

          <TranscriptView transcript={transcript} isAuthenticated={isAuthenticated} />

          {/* TODO: Add a configuration section to set the password */}
          {/* {!isSessionActive && (
            <div className="my-6 p-4 bg-gray-800/50 rounded-lg max-w-md mx-auto backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-center mb-3 text-indigo-400">Configuration</h3>
                <label htmlFor="password-input" className="block text-sm font-medium text-gray-300 mb-1">Access Password</label>
                <div className="flex gap-2">
                    <input
                        id="password-input"
                        type="password"
                        value={passwordInput}
                        onChange={handlePasswordChange}
                        placeholder="e.g., one two three"
                        className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                        onClick={handleSavePassword}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md font-semibold transition-colors"
                    >
                        Save
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                    This password must be spoken to access the agent's knowledge base. It's saved in your browser.
                </p>
            </div>
           )} */}

          <div className="mt-6 text-center">
            {error && <p className="text-red-400 mb-4 font-semibold text-base">{error}</p>}

            {/* FIX: Included `AgentStatus.Connecting` in this condition to correctly render the button's connecting state and fix the TypeScript error. */}
            {agentStatus === AgentStatus.Idle || agentStatus === AgentStatus.Error || agentStatus === AgentStatus.Connecting ? (
                 <>
                    <button
                        onClick={handleButtonClick}
                        disabled={agentStatus === AgentStatus.Connecting}
                        className={`relative inline-flex items-center justify-center rounded-full w-48 h-48 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white ${buttonColor} ${(agentStatus === AgentStatus.Connecting || !password) ? 'cursor-not-allowed' : ''} ${(!password && agentStatus !== AgentStatus.Connecting) ? 'opacity-50' : ''}`}
                        title={!password ? 'Please set and save a password first.' : ''}
                    >
                    {pulse && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/50 opacity-75"></span>}
                    <div className="z-10 flex flex-col items-center">
                        <MicrophoneIcon />
                        <span className="mt-2 text-lg font-semibold">{buttonText}</span>
                    </div>
                    </button>
                 </>
            ) : (
                <button
                    onClick={handleButtonClick}
                    className="px-8 py-4 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-colors text-lg"
                >
                    Stop Session
                </button>
            )}
          </div>
        </div>
        {/* <KnowledgeBaseCard /> */}
      </main>
    </div>
  );
}
