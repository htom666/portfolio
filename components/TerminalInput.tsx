'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { COMMAND_LIST } from '@/lib/commands'

// ─── Pixel palette ────────────────────────────────────────────────────────────

const FONT    = "'JetBrains Mono','Fira Code','Cascadia Code',ui-monospace,monospace"
const FS      = 11
const LINE_H  = 15

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onSubmit: (value: string) => void
  inputHistory: string[]
  theme: 'green' | 'white'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TerminalInput({ onSubmit, inputHistory, theme }: Props) {
  const [value, setValue]           = useState('')
  const [histIdx, setHistIdx]       = useState(-1)
  const [suggestion, setSuggestion] = useState('')
  const [focused, setFocused]       = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const accent    = theme === 'green' ? '#d0a0e0' : '#88d0e0'
  const textColor = theme === 'green' ? '#d0a0e0' : '#88d0e0'
  const dimColor  = theme === 'green' ? 'rgba(208,160,224,0.45)' : 'rgba(136,208,224,0.45)'

  const updateSuggestion = useCallback((val: string) => {
    if (!val) { setSuggestion(''); return }
    const lower = val.toLowerCase()
    setSuggestion(COMMAND_LIST.find((c) => c.startsWith(lower) && c !== lower) || '')
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setValue(val)
    setHistIdx(-1)
    updateSuggestion(val)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = value.trim()
      if (trimmed) { onSubmit(trimmed); setValue(''); setHistIdx(-1); setSuggestion('') }
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(histIdx + 1, inputHistory.length - 1)
      setHistIdx(next)
      const v = inputHistory[next] ?? ''
      setValue(v); updateSuggestion(v)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(histIdx - 1, -1)
      setHistIdx(next)
      const v = next === -1 ? '' : (inputHistory[next] ?? '')
      setValue(v); updateSuggestion(v)
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      if (suggestion) { setValue(suggestion); setSuggestion('') }
      return
    }
  }

  return (
    <div>
      {/* Prompt + text display + pixel cursor */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: FS, lineHeight: `${LINE_H}px`,
          fontFamily: FONT,
        }}
        onClick={() => inputRef.current?.focus()}
      >
        <span style={{ color: accent, fontWeight: 700, flexShrink: 0, cursor: 'text' }}>
          hatem@system
        </span>
        <span style={{ color: dimColor, flexShrink: 0, cursor: 'text', userSelect: 'none' }}>
          :~$
        </span>

        {/* Visible text + pixel cursor */}
        <div
          style={{
            flex: 1, display: 'flex', alignItems: 'center',
            cursor: 'text', overflow: 'hidden',
          }}
        >
          {/* Mirror of the real input value */}
          <span style={{
            color: textColor,
            whiteSpace: 'pre',
            fontFamily: FONT,
            fontSize: FS,
            lineHeight: `${LINE_H}px`,
          }}>
            {value}
          </span>

          {/* Blinking pixel block cursor — sharp step-end blink */}
          <span
            className="animate-blink"
            style={{
              display: focused ? 'inline-block' : 'none',
              width: 7,
              height: LINE_H,
              background: accent,
              flexShrink: 0,
              imageRendering: 'pixelated',
              // No border-radius — hard pixel block
            }}
          />

          {/* Hidden real input behind the display */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
              width: 1,
              height: 1,
              padding: 0,
              border: 'none',
              outline: 'none',
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal input"
          />
        </div>
      </div>

      {/* Tab autocomplete hint */}
      {suggestion && value && (
        <div
          style={{
            fontSize: 9,
            color: dimColor,
            opacity: 0.55,
            marginTop: 2,
            paddingLeft: `${10 + 5 + 3}ch`, // rough offset past prompt
            fontFamily: FONT,
          }}
        >
          tab → {suggestion}
        </div>
      )}
    </div>
  )
}
