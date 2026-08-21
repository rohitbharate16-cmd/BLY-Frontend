import { cls } from '../../utils/cls'

export default function SectionLabel({ children, className, ...props }) {
  return (
    <span
      className={cls(
        'block font-sans uppercase tracking-widest text-xs text-taupe mb-4',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
