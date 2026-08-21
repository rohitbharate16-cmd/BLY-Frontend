import { cls } from '../../utils/cls'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  text: 'btn-text',
}

const sizes = {
  sm: 'px-6 py-2 text-xs',
  md: 'px-8 py-3 text-xs',
  lg: 'px-10 py-3.5 text-sm',
}

export default function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  const base = 'inline-flex items-center justify-center uppercase tracking-widest font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
  const variantClass = variants[variant] || variants.primary
  const sizeClass = sizes[size] || sizes.md
  return (
    <button className={cls(base, variantClass, sizeClass, className)} {...props}>
      {children}
    </button>
  )
}
