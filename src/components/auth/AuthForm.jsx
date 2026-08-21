import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { premiumEase } from '../motion/variants'

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: premiumEase },
  },
}

export function AuthShell({ eyebrow = 'BLY', title, description, children }) {
  return (
    <section className="bg-cream py-16 md:py-24">
      <div className="container mx-auto max-w-lg px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { delayChildren: 0.08, staggerChildren: 0.1 } },
          }}
        >
          <motion.p variants={itemVariants} className="text-xs uppercase tracking-[0.22em] text-taupe">
            {eyebrow}
          </motion.p>
          <motion.h1 variants={itemVariants} className="mt-4 font-display text-4xl leading-none text-espresso sm:text-5xl">
            {title}
          </motion.h1>
          {description && (
            <motion.p variants={itemVariants} className="mt-4 max-w-md text-sm leading-relaxed text-brown">
              {description}
            </motion.p>
          )}
          <div className="mt-10 border-t border-[#E8DED2] pt-8">{children}</div>
        </motion.div>
      </div>
    </section>
  )
}

export function AuthForm({ children, ...props }) {
  return (
    <motion.form
      className="space-y-5"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: 0.16, staggerChildren: 0.08 } },
      }}
      {...props}
    >
      {children}
    </motion.form>
  )
}

export function AuthFormItem({ children }) {
  return <motion.div variants={itemVariants}>{children}</motion.div>
}

export function AuthMessage({ type = 'error', children }) {
  if (!children) return null

  const tone = type === 'success'
    ? 'border-champagne/50 bg-ivory/50 text-brown'
    : 'border-[#C99B8D] bg-[#FBF2EF] text-brown'

  return (
    <AnimatePresence initial={false}>
      <motion.p
        key={`${type}-${children}`}
        className={`border px-4 py-3 text-sm ${tone}`}
        role={type === 'error' ? 'alert' : 'status'}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.28, ease: premiumEase }}
      >
        {children}
      </motion.p>
    </AnimatePresence>
  )
}

export function AuthInput({ label, id, className = '', ...props }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-taupe">{label}</span>
      <input
        id={id}
        className={`w-full border border-[#E8DED2] bg-paper px-4 py-3 text-sm text-espresso transition-colors duration-300 placeholder:text-taupe/50 focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne ${className}`}
        {...props}
      />
    </label>
  )
}

export function PasswordInput({ label, id, ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-taupe">{label}</span>
      <span className="relative block">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="w-full border border-[#E8DED2] bg-paper px-4 py-3 pr-12 text-sm text-espresso transition-colors duration-300 placeholder:text-taupe/50 focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne"
          {...props}
        />
        <button
          type="button"
          className="absolute right-0 top-0 inline-flex h-full w-11 items-center justify-center text-taupe transition-colors hover:text-espresso focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={17} strokeWidth={1.5} /> : <Eye size={17} strokeWidth={1.5} />}
        </button>
      </span>
    </label>
  )
}
