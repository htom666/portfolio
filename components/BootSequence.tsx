'use client'

import { useEffect, useState } from 'react'
import { BOOT_LINES } from '@/data/portfolio'

// ─── Pixel palette ────────────────────────────────────────────────────────────

const FONT   = "'JetBrains Mono','Fira Code','Cascadia Code',ui-monospace,monospace"
const FS     = 11
const LINE_H = 15

interface Props {
  onComplete: () => void
  theme: 'green' | 'white'
}

export default function BootSequence({ onComplete, theme }: Props) {
  const [step, setStep]     = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (step < BOOT_LINES.length) {
      const line = BOOT_LINES[step]
      const delay = line === '' ? 32 : 60
      const t = setTimeout(() => setStep((s) => s + 1), delay)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setFading(true)
        setTimeout(onComplete, 400)
      }, 700)
      return () => clearTimeout(t)
    }
  }, [step, onComplete])

  const accent    = theme === 'green' ? '#d0a0e0' : '#88d0e0'
  const textColor = theme === 'green' ? '#d0a0e0' : '#88d0e0'
  const dimColor  = theme === 'green' ? 'rgba(208,160,224,0.45)' : 'rgba(136,208,224,0.45)'

  const isOK      = (line: string) => line.includes('[ OK ]')
  const isAccent  = (line: string) =>
    line.startsWith('  welcome') ||
    line.startsWith('  ui/ux') ||
    line.startsWith('  type "help"')
  const isDivider = (line: string) => line.startsWith('  ──')
  const isDim     = (line: string) =>
    !isOK(line) && (
      line.startsWith('  checking') ||
      line.startsWith('  loading') ||
      line.startsWith('  mounting') ||
      line.startsWith('SYSTEM')
    )

  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize:   FS,
        lineHeight: `${LINE_H}px`,
        color:      textColor,
        opacity:    fading ? 0 : 1,
        transition: 'opacity 400ms steps(4)',
        maxWidth:   460,
        width:      '100%',
      }}
    >
      {BOOT_LINES.slice(0, step).map((line, i) => {
        if (line === '') {
          return <div key={i} style={{ height: LINE_H }} />
        }
        if (isDivider(line)) {
          return (
            <div key={i} className="animate-fadeIn" style={{ color: accent, opacity: 0.32 }}>
              {line}
            </div>
          )
        }
        if (isOK(line)) {
          const idx    = line.indexOf('[ OK ]')
          const before = line.slice(0, idx)
          const after  = line.slice(idx + 6)
          return (
            <div key={i} className="animate-fadeIn" style={{ color: textColor }}>
              {before}
              <span style={{ color: accent }}>[ OK ]</span>
              {after}
            </div>
          )
        }
        return (
          <div
            key={i}
            className="animate-fadeIn"
            style={
              isAccent(line) ? { color: accent, fontWeight: 700 }
              : isDim(line)  ? { color: dimColor }
              : { color: textColor }
            }
          >
            {line}
          </div>
        )
      })}

      {/* Blinking pixel block cursor during boot */}
      {step < BOOT_LINES.length && (
        <span
          className="animate-blink"
          style={{
            display: 'inline-block',
            width: 7, height: LINE_H,
            background: accent,
            verticalAlign: 'middle',
            marginLeft: 2,
            imageRendering: 'pixelated',
          }}
        />
      )}
    </div>
  )
}
