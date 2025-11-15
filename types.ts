
export enum Speaker {
  User = 'User',
  Agent = 'Agent',
}

export interface TranscriptEntry {
  id: number;
  speaker: Speaker;
  text: string;
}

export enum AgentStatus {
  Idle = 'Idle',
  Connecting = 'Connecting',
  Listening = 'Listening',
  Thinking = 'Thinking',
  Speaking = 'Speaking',
  Error = 'Error',
}
