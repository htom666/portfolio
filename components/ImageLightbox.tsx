'use client'

import { useEffect } from 'react'

interface Props {
  src: string
  filename: string
  onClose: () => void
  theme: 'green' | 'white'
}

export default function ImageLightbox({ src, filename, onClose, theme }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

const accent = theme === 'green' ? '#50fa7b' : '#f0f0f0'
  const text = theme === 'green' ? '#a3ffb0' : '#e2e2e2'

  return (
    <div
      className="fixed inset-0 flex flex-col animate-fadeIn"
      style={{ zIndex: 9999, background: '#08080f' }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Traffic lights (decorative, all close on click) */}
          <div className="flex gap-1.5">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full transition-opacity hover:opacity-80"
              style={{ background: '#ff5f57' }}
              title="Close"
            />
            <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e', opacity: 0.4 }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28c840', opacity: 0.4 }} />
          </div>

          <span
            className="text-xs"
            style={{ color: text, opacity: 0.45 }}
          >
            {filename}
          </span>
        </div>

        <button
          onClick={onClose}
          className="text-xs transition-opacity"
          style={{ color: accent, opacity: 0.4, fontFamily: 'inherit' }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = '0.9')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = '0.4')}
        >
          [esc] close
        </button>
      </div>

      {/* Image area — click outside image to close */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-auto cursor-pointer"
        onClick={onClose}
      >
        <img
          src={src}
          alt={filename}
          className="max-w-full max-h-full object-contain cursor-default"
          style={{
            boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Footer hint */}
      <div
        className="shrink-0 flex items-center justify-center pb-3"
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
        }}
      >
        <p className="text-xs" style={{ color: text, opacity: 0.2 }}>
          click outside or press esc to close
        </p>
      </div>
    </div>
  )
}
