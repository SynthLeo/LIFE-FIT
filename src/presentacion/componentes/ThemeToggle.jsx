import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      className={`
        relative w-14 h-7 rounded-full border transition-all duration-300 cursor-pointer
        ${isDark
          ? 'bg-white/8 border-white/10 hover:border-white/20'
          : 'bg-black/6 border-black/10 hover:border-black/20'
        }
        ${className}
      `}
    >
      {/* Track icons */}
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[11px] pointer-events-none">
        🌙
      </span>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[11px] pointer-events-none">
        ☀️
      </span>

      {/* Thumb */}
      <span
        className={`
          absolute top-0.5 w-6 h-6 rounded-full shadow-sm transition-all duration-300
          ${isDark
            ? 'left-0.5 bg-white/15'
            : 'left-[calc(100%-26px)] bg-white shadow-md'
          }
        `}
      />
    </button>
  )
}