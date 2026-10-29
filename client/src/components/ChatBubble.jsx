import { motion } from 'framer-motion';
import { Brain, Bot, Clock } from 'lucide-react';

const EMOTION_COLORS = {
  happy: 'text-emerald-600 bg-emerald-50',
  sad: 'text-rose-600 bg-rose-50',
  stressed: 'text-amber-600 bg-amber-50',
  angry: 'text-red-600 bg-red-50',
  neutral: 'text-calm-500 bg-calm-100',
};

export function ChatBubble({ message, role, emotion, createdAt }) {
  const isUser = role === 'user';
  const time = createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full max-w-[85%] animate-[fadeIn_0.3s_ease-out_forwards]"
      style={{ animationFillMode: 'both' }}
    >
      {isUser ? (
        <>
          <div className="ml-auto flex flex-col">
            <div className={`rounded-2xl p-4 bg-brand-600 text-white ${emotion && EMOTION_COLORS[emotion] ? '' : ''} shadow-soft`}>
              {message}
            </div>
            <div className="text-[10px] text-calm-400 mt-1 text-right">{time}</div>
          </div>
        </>
      ) : (
        <>
          <div className="mr-auto flex flex-col">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-calm-100 flex items-center justify-center text-calm-600 text-xs shrink-0">
                <Bot size={14} />
              </div>
              <div className="flex flex-col">
                <div className="rounded-2xl p-4 bg-white border border-calm-200 text-calm-900 shadow-soft">
                  {message}
                </div>
                <div className="text-[10px] text-calm-400 mt-1">{time}</div>
              </div>
            </div>
            {emotion && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                <Brain size={12} className="text-calm-400" />
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${EMOTION_COLORS[emotion]}`}
                >
                  {emotion}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex w-fit max-w-[70%]">
      <div className="mr-auto flex flex-col">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-calm-100 flex items-center justify-center text-calm-600 text-xs shrink-0">
            <Bot size={14} />
          </div>
          <div className="flex flex-col">
            <div className="flex gap-1.5">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-calm-300"
                  animate={{
                    scaleY: [1, 0.6, 1],
                    opacity: [1, 0.4, 1],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmptyChat() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 text-3xl mb-4 animate-pulse-soft">
        <Brain size={32} />
      </div>
      <h3 className="text-lg font-semibold text-calm-900">Welcome to MindMate</h3>
      <p className="text-calm-500 mt-2 max-w-xs">
        I'm here to listen and support you. Share how you're feeling, and we can talk, track your mood, or plan your studies together.
      </p>
    </div>
  );
}
