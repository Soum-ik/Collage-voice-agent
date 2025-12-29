# 🎙️ College Voice Agent — Aura

A real-time AI voice assistant for **Sylhet Polytechnic Institute**, powered by Google Gemini's native audio capabilities. Have natural voice conversations to get instant information about the college, departments, faculty, and more.

![Voice Agent Demo](https://img.shields.io/badge/Gemini%202.5-Native%20Audio-blue?style=for-the-badge&logo=google)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)

---

## ✨ Features

### 🗣️ Real-Time Voice Conversations
- **Bidirectional audio streaming** — speak naturally and hear responses in real-time
- **Live transcription** — see both your speech and the agent's responses as text
- **Low latency** — powered by Gemini 2.5 Flash Native Audio Preview

### 🤖 Animated Avatar
- Expressive robot avatar with multiple states:
  - **Idle** — calm breathing animation
  - **Connecting** — antenna pulse effect
  - **Listening** — sound wave visualization
  - **Thinking** — rotating indicator
  - **Speaking** — mouth animation with particle effects
  - **Waving** — responds to greetings like "Hello" or "Hi"

### 🔐 Password Protection
- Secure access with passphrase authentication
- Session-based access control
- Visual authentication status indicator

### 🌐 Web Grounding
- Falls back to **Google Search** when the knowledge base doesn't have an answer
- Automatic source citation with clickable links
- Transparent search indication to users

### 📚 Comprehensive Knowledge Base
- Complete information about Sylhet Polytechnic Institute
- Faculty directory with contact information
- Admission policies and academic structure
- Department details and course information

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **pnpm**
- **Google Gemini API Key** with billing enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/college-voice-agent.git
   cd college-voice-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🎯 Usage

1. **Start a Session** — Click the large microphone button
2. **Grant Microphone Access** — Allow browser permission when prompted
3. **Authenticate** — Say the password when Aura asks (default: `stack123`)
4. **Ask Questions** — Once authenticated, ask about:
   - Faculty members and their contact info
   - Department information
   - Admission requirements
   - Course structure
   - Campus facilities
   - Student information

### Example Conversations

> **You:** "Hello"  
> **Aura:** "Hello, I am Aura, the College Information Agent. To continue, please tell me the password."

> **You:** "stack123"  
> **Aura:** "Password correct. Access granted. How can I help you with information about the college?"

> **You:** "Who is the head of Computer Science department?"  
> **Aura:** "The head of Computer Science and Technology is Ruma Akter for the 2nd shift and Md Burhan Uddin for the 1st shift..."

---

## 🏗️ Project Structure

```
├── App.tsx                 # Main application with voice agent logic
├── constants.ts            # Knowledge base and system prompts
├── types.ts                # TypeScript type definitions
├── index.tsx               # Application entry point
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── components/             # Reusable UI components
│   └── ui/
│       ├── sheet.tsx
│       └── sonner.tsx
├── lib/
│   └── utils.ts            # Utility functions
└── src/
    ├── index.css           # Global styles
    ├── components/         # Feature components
    │   ├── Avatar/
    │   ├── Chat/
    │   ├── Controls/
    │   └── shared/
    ├── hooks/              # Custom React hooks
    │   ├── customToast.ts
    │   └── useVoiceAgent.ts
    ├── layouts/
    │   └── MainLayout.tsx
    ├── pages/
    │   └── AgentPage.tsx
    ├── routes/
    │   └── Routes.tsx
    └── utils/
        └── audioUtils.ts
```

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, TypeScript 5.8 |
| **Styling** | Tailwind CSS 4, Lucide Icons |
| **AI/Voice** | Google Gemini 2.5 Flash (Native Audio) |
| **Build Tool** | Vite 6 |
| **Audio** | Web Audio API |
| **Routing** | React Router 7 |

---

## ⚙️ Configuration

### Customizing the Knowledge Base

Edit `constants.ts` to modify the knowledge base:

```typescript
export const KNOWLEDGE_BASE = `
--- KNOWLEDGE BASE ---
// Add your custom information here
`;
```

### Changing the Password

Update the default password in `App.tsx`:

```typescript
const [password, setPassword] = useState<string>("your_new_password");
```

### Modifying System Behavior

Customize the agent's personality in `constants.ts`:

```typescript
export const getSystemInstruction = (password: string) => `
Your custom system prompt here...
`;
```

---

## 🔊 Audio Processing

The application uses the **Web Audio API** for real-time audio processing:

- **Input**: 16kHz mono PCM audio from microphone
- **Output**: 24kHz mono PCM audio from Gemini
- **Encoding**: Base64 for transport over WebSocket

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is for educational purposes. Please ensure you comply with Google's Gemini API terms of service.

---

## 🙏 Acknowledgments

- **Google Gemini** — For the incredible native audio AI capabilities
- **Sylhet Polytechnic Institute** — The institution this agent serves
- **React Team** — For the amazing React 19 features
- **Tailwind CSS** — For the beautiful utility-first CSS framework

---

<div align="center">

**Built with ❤️ for Sylhet Polytechnic Institute**

[Report Bug](https://github.com/yourusername/college-voice-agent/issues) · [Request Feature](https://github.com/yourusername/college-voice-agent/issues)

</div>
