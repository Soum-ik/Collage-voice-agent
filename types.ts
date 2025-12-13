export enum Speaker {
  User = "User",
  Agent = "Agent",
}

export interface SearchResult {
  uri: string;
  title: string;
}

export interface TranscriptEntry {
  id: number;
  speaker: Speaker;
  text: string;
  sources?: SearchResult[];
}

export interface Props {
  data: {
    // ✅ Expects the object structure
    title: string;
    description: string;
  };
}

export enum AgentStatus {
  Idle = "Idle",
  Connecting = "Connecting",
  Listening = "Listening",
  Thinking = "Thinking",
  Speaking = "Speaking",
  Error = "Error",
}
