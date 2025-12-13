import { useState, useRef, useCallback, useEffect } from "react";
import { GoogleGenAI, Modality, Blob, LiveServerMessage } from "@google/genai";
import { AgentStatus, SearchResult, Speaker, TranscriptEntry } from "@/types";
import { getSystemInstruction } from "@/constants";
import { encode, decode, decodeAudioData } from "../utils/audioUtils";
import showToast from "./customToast";

export function useVoiceAgent() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(AgentStatus.Idle);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isWaving, setIsWaving] = useState<boolean>(false);

  const sessionPromiseRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextsRef = useRef<any>({
    input: null,
    output: null,
    processor: null,
    source: null,
  });
  const audioPlaybackRef = useRef<any>({ queue: new Set(), nextStartTime: 0 });
  const waveTriggeredRef = useRef(false);
  const currentInputTranscriptionRef = useRef("");
  const currentOutputTranscriptionRef = useRef("");

  //   user password
  const [password, setPassword] = useState<string>("stack123");

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
        showToast("Error closing session.", "Please try again.");
      }
      sessionPromiseRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
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

    if (
      audioContextsRef.current.input &&
      audioContextsRef.current.input.state !== "closed"
    ) {
      try {
        await audioContextsRef.current.input.close();
      } catch (e) {
        showToast(
          "Failed",
          "Error closing input audio context. Please try again."
        );
        console.error("Error closing input audio context:", e);
      }
      audioContextsRef.current.input = null;
    }
    if (
      audioContextsRef.current.output &&
      audioContextsRef.current.output.state !== "closed"
    ) {
      try {
        await audioContextsRef.current.output.close();
      } catch (e) {
        console.error("Error closing output audio context:", e);
      }
      audioContextsRef.current.output = null;
    }

    audioPlaybackRef.current.queue.forEach((source) => source.stop());
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
        throw new Error(
          "API_KEY environment variable not set. Please configure it to use the application."
        );
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: getSystemInstruction(password),
          tools: [{ googleSearch: {} }],
          // New: Voice style configuration
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: localStorage.getItem("voiceStyle") || "Despina",
              },
            },
          },
        },
        callbacks: {
          onopen: async () => {
            setAgentStatus(AgentStatus.Listening);
            streamRef.current = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });

            const inputAudioContext = new (window.AudioContext ||
              (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext ||
              (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextsRef.current.input = inputAudioContext;
            audioContextsRef.current.output = outputAudioContext;

            const source = inputAudioContext.createMediaStreamSource(
              streamRef.current
            );
            const processor = inputAudioContext.createScriptProcessor(
              4096,
              1,
              1
            );
            audioContextsRef.current.source = source;
            audioContextsRef.current.processor = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16Data = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                // Clamp the signal to [-1, 1] and scale to 16-bit integer range.
                int16Data[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16Data.buffer)),
                mimeType: "audio/pcm;rate=16000",
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

            const groundingMetadata = (message.serverContent as any)
              ?.groundingMetadata;
            if (groundingMetadata?.groundingChunks) {
              const newSources: SearchResult[] =
                groundingMetadata.groundingChunks
                  .filter((chunk: any) => chunk.web && chunk.web.uri)
                  .map((chunk: any) => ({
                    uri: chunk.web.uri,
                    title: chunk.web.title || chunk.web.uri,
                  }));

              if (newSources.length > 0) {
                setTranscript((prev) => {
                  const last = prev[prev.length - 1];
                  if (last && last.speaker === Speaker.Agent) {
                    const existingSources = last.sources || [];
                    const combinedSources = [...existingSources];
                    newSources.forEach((ns) => {
                      if (!combinedSources.some((es) => es.uri === ns.uri)) {
                        combinedSources.push(ns);
                      }
                    });
                    return [
                      ...prev.slice(0, -1),
                      { ...last, sources: combinedSources },
                    ];
                  }
                  return prev;
                });
              }
            }

            const isNewOutputTurn =
              currentOutputTranscriptionRef.current === "" &&
              !!message.serverContent?.outputTranscription;
            if (isNewOutputTurn) {
              setAgentStatus(AgentStatus.Thinking);
            }

            const base64Audio =
              message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setAgentStatus(AgentStatus.Speaking);
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputCtx,
                24000,
                1
              );
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);

              const currentTime = outputCtx.currentTime;
              const startTime = Math.max(
                currentTime,
                audioPlaybackRef.current.nextStartTime
              );
              source.start(startTime);

              audioPlaybackRef.current.nextStartTime =
                startTime + audioBuffer.duration;
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

              if (
                !waveTriggeredRef.current &&
                /\b(hi|hello|hey)\b/i.test(currentInputTranscriptionRef.current)
              ) {
                waveTriggeredRef.current = true;
                setIsWaving(true);
                setTimeout(() => setIsWaving(false), 2500);
              }

              setTranscript((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.speaker === Speaker.User) {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, text: currentInputTranscriptionRef.current },
                  ];
                } else {
                  return [
                    ...prev,
                    {
                      id: Date.now(),
                      speaker: Speaker.User,
                      text: currentInputTranscriptionRef.current,
                    },
                  ];
                }
              });
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              currentOutputTranscriptionRef.current += text;
              if (text.toLowerCase().includes("access granted")) {
                setIsAuthenticated(true);
              }
              setTranscript((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.speaker === Speaker.Agent) {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, text: currentOutputTranscriptionRef.current },
                  ];
                } else {
                  return [
                    ...prev,
                    {
                      id: Date.now(),
                      speaker: Speaker.Agent,
                      text: currentOutputTranscriptionRef.current,
                    },
                  ];
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
            // showToast("Session ended.", "You can start a new session.");
            stopSession();
          },
          onerror: (e: any) => {
            console.error("Session error:", e);
            showToast(
              "Session connection failed.",
              "Please check your internet connection and try again."
            );
            setAgentStatus(AgentStatus.Error);
            // setError(
            //   "Session connection failed. Please check your internet connection and ensure your API key is correctly configured and has billing enabled."
            // );
            stopSession();
          },
        },
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (e: any) {
      // show sonner toast error
      showToast(
        "Failed to start session.",
        e.message || "Failed to start session. Check permissions and API key."
      );
      // console.error("Failed to start session:", e);
      // setError(
      //   e.message || "Failed to start session. Check permissions and API key."
      // );
      setAgentStatus(AgentStatus.Error);
    }
  }, [stopSession, password]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return {
    agentStatus,
    transcript,
    isAuthenticated,
    error,
    isWaving,
    startSession,
    stopSession,
  };
}
