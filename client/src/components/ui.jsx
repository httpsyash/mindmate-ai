import { AnimatePresence, motion } from 'framer-motion';

export function PageContainer({ children, className = '' }) {
  return (
    <section className={`min-h-screen bg-calm-50 text-calm-900 ${className}`}>
      {children}
    </section>
  );
}

export function Card({ children, className = '', hover = false, padding = 'p-6' }) {
  return (
    <motion.div
      layout
      whileHover={hover ? { y: -4 } : undefined}
      className={`bg-white rounded-2xl border border-calm-200 shadow-soft ${padding} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold tracking-tight text-calm-900">{title}</h2>
      {subtitle && <p className="text-calm-500 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? motion.span : 'button';
  const base =
    'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none';
  const styles = {
    primary:
      'bg-brand-600 text-white px-5 py-3 shadow-soft hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2',
    outline:
      'border border-calm-200 bg-transparent text-calm-700 px-5 py-3 hover:bg-calm-100 focus:outline-none focus:ring-2 focus:ring-brand-500',
    ghost:
      'text-calm-600 px-5 py-3 hover:bg-calm-100 focus:outline-none',
    danger:
      'bg-red-50 text-red-700 border border-red-100 px-5 py-3 hover:bg-red-100 focus:outline-none',
  };

  return (
    <Comp
      className={`${base} ${styles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function Input({ label, leftIcon, className = '', ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-calm-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-calm-400">
            {leftIcon}
          </div>
        )}
        <input
          className={`w-full rounded-xl border border-calm-200 bg-white pl-10 pr-4 py-3 text-calm-900 placeholder-calm-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}

export { ChatBubble, EmptyChat, TypingIndicator } from './ChatBubble';
