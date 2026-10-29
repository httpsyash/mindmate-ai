import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, VolumeX, ArrowUp, Brain } from 'lucide-react';
import { ChatBubble, EmptyChat, Card, Button, Input } from './ui';
import { chatAPI } from '../services/api';

export function ChatArea() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [emotion, setEmotion] = useState(null);
  const [crisis, setCrisis] = useState(false);
  const [resources, setResources] = useState([]);
  const messagesEndRef = useRef(null);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const res = await chatAPI.getHistory(50);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('load history', err);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: 'user', message: userMsg, createdAt: new Date().toISOString() },
    ]);

    try {
      const res = await chatAPI.sendMessage(userMsg);
      const data = res.data;

      setEmotion(data.emotion || null);
      setCrisis(data.crisis || false);
      setResources(data.resources || []);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          message: data.response,
          emotion: data.emotion,
          createdAt: new Date().toISOString(),
        },
      ]);

      if (voiceEnabled && synth) {
        speak(data.response);
      }
    } catch (err) {
      console.error('send message', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          message: "I'm having trouble connecting right now. Please try again in a moment.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function speak(text) {
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synth.speak(utterance);
  }

  function toggleSpeech() {
    if (!synth) return;
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
    } else {
      const last = messages[messages.length - 1];
      if (last && last.role === 'assistant') {
        speak(last.message);
      }
    }
  }

  // Web Speech API - Speech to Text
  const SpeechRecognition =
    typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

  function startVoiceInput() {
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  if (crisis) {
    return (
      <Card className="max-w-xl mx-auto p-6" hover>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <ArrowUp size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-red-800">I'm concerned about you</h3>
            <p className="text-red-600 text-sm mt-1">
              Please reach out to someone you trust or a professional right away. You matter.
            </p>
          </div>
        </div>
        {resources.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-calm-500 uppercase tracking-wider mb-2">Crisis resources</p>
            {resources.map((r, i) => (
              <div key={i} className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                <strong className="font-semibold">{r.name}</strong> — {r.description}
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full min-h-[600px]" hover padding="p-0">
      <div className="border-b border-calm-100 p-5 bg-white/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">
            <Brain size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-calm-900">MindMate Chat</h3>
            <p className="text-[11px] text-calm-500">Context-aware AI assistant</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <EmptyChat />
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatBubble
                key={i}
                role={msg.role}
                message={msg.message}
                emotion={msg.emotion}
                createdAt={msg.createdAt}
              />
            ))}
            {loading && <ChatBubble role="assistant" message="…" />}
            {!loading && isSpeaking && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-calm-100 p-4 bg-white">
        <form onSubmit={sendMessage} className="flex gap-3">
          <Input
            label=""
            placeholder="Type how you feel or ask me anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" variant="primary" disabled={loading || !input.trim()} asChild={false}>
            <Send size={18} />
          </Button>
          <Button
            variant="ghost"
            onClick={startVoiceInput}
            disabled={loading}
            className="w-10 p-2.5"
            title="Voice input"
          >
            {isListening ? <MicOff size={18} fill="red-500" /> : <Mic size={18} />}
          </Button>
          <Button
            variant="ghost"
            onClick={toggleSpeech}
            disabled={voiceEnabled ? false : false}
            className="w-10 p-2.5"
            title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
          >
            {isSpeaking ? <VolumeX size={18} fill="red-500" /> : <Volume2 size={18} />}
          </Button>
          <label className="flex items-center gap-2 cursor-pointer select-none text-[10px] text-calm-400">
            <input type="checkbox" className="rounded brand-600" defaultChecked={voiceEnabled} onChange={(e) => setVoiceEnabled(e.target.checked)} />
            Voice
          </label>
        </form>
      </div>
    </Card>
  );
}
