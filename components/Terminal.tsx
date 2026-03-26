'use client'

import React, { useState, useRef, useEffect, useCallback, useId } from 'react'
import BootSequence from './BootSequence'
import TerminalInput from './TerminalInput'
import { processCommand } from '@/lib/commands'
import { PROJECTS } from '@/data/portfolio'

// ─── Pixel palette ────────────────────────────────────────────────────────────

const CMD = {
  font:       "'JetBrains Mono','Fira Code','Cascadia Code',ui-monospace,monospace",
  headerBg:   '#b09ecc',   // pastel purple
  headerH:    28,
  bodyBg:     `repeating-linear-gradient(
    0deg, transparent 0px, transparent 1px,
    rgba(0,0,0,0.07) 1px, rgba(0,0,0,0.07) 2px
  ), rgba(14,12,32,0.55)`,
  frameColor: '#5a3e98',   // deeper purple frame
  frameW:     3,
  cornerCut:  8,
  fontSize:   11,
  lineH:      15,
  cyan:       '#88d0e0',   // pastel cyan (from reference)
  white:      '#88d0e0',   // unified pastel cyan for body text
  dim:        'rgba(136,208,224,0.45)',
  titleFg:    '#1a1040',
} as const

// ─── SVG frame helpers ────────────────────────────────────────────────────────
// shapeRendering="crispEdges" → 45° diagonals render as pixel staircases (no AA)

function octPath(w: number, h: number, c: number, ins: number): string {
  return `M ${c} ${ins} L ${w-c} ${ins} L ${w-ins} ${c} L ${w-ins} ${h-c} L ${w-c} ${h-ins} L ${c} ${h-ins} L ${ins} ${h-c} L ${ins} ${c} Z`
}

function octClip(c: number): string {
  return `polygon(${c}px 0, calc(100% - ${c}px) 0, 100% ${c}px, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, ${c}px 100%, 0 calc(100% - ${c}px), 0 ${c}px)`
}

// ─── Div-based pixel control buttons ─────────────────────────────────────────
// Buttons: 18×16px, 2px solid border, pastel fill, div icons (no SVG)
// Icons use box-shadow pixel painting for the X, and plain divs for bar/square

const IC = '#180830'  // icon pixel colour (very dark)

// Minimize — 8×2 horizontal bar, centred in 16×14 inner area (16=(20-4), 14=(18-4))
const MinusIcon = (
  <div style={{
    position: 'absolute',
    left: 4, top: 6,        // (16-8)/2=4  (14-2)/2=6
    width: 8, height: 2,
    background: IC,
    imageRendering: 'pixelated',
  }} />
)

// Maximize — 8×6 hollow square outline, centred in 16×14 inner area
const SquareIcon = (
  <div style={{
    position: 'absolute',
    left: 4, top: 4,        // (16-8)/2=4  (14-6)/2=4
    width: 8, height: 6,
    border: `1px solid ${IC}`,
    background: 'transparent',
    boxSizing: 'border-box',
    imageRendering: 'pixelated',
  }} />
)

// Close — 7×7 X built with box-shadow pixel painting (each shadow = 1×1 px dot)
// Anchor at inner-(5,4) matching SystemStatus layout (20×18 button)
const CrossIcon = (
  <div style={{
    position: 'absolute',
    left: 5, top: 4,
    width: 1, height: 1,
    background: IC,
    imageRendering: 'pixelated',
    boxShadow: [
      // diagonal: top-left → bottom-right
      `1px 1px 0 0 ${IC}`, `2px 2px 0 0 ${IC}`, `3px 3px 0 0 ${IC}`,
      `4px 4px 0 0 ${IC}`, `5px 5px 0 0 ${IC}`, `6px 6px 0 0 ${IC}`,
      // diagonal: top-right → bottom-left
      `6px 0 0 0 ${IC}`, `5px 1px 0 0 ${IC}`, `4px 2px 0 0 ${IC}`,
      // centre (3,3) already painted by first diagonal
      `2px 4px 0 0 ${IC}`, `1px 5px 0 0 ${IC}`, `0 6px 0 0 ${IC}`,
    ].join(', '),
  }} />
)

interface CmdBtnProps {
  fill: string
  outline: string
  onClick: () => void
  title: string
  icon: React.ReactNode
}

function CmdBtn({ fill, outline, onClick, title, icon }: CmdBtnProps) {
  const [down, setDown] = useState(false)
  return (
    <div
      data-nodrag
      role="button"
      tabIndex={-1}
      title={title}
      onMouseDown={(e) => { e.stopPropagation(); setDown(true) }}
      onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={{
        position:       'relative',
        width:          20,
        height:         18,
        background:     down ? 'rgba(0,0,0,0.12)' : fill,
        border:         `2px solid ${outline}`,
        boxSizing:      'border-box',
        cursor:         'pointer',
        userSelect:     'none',
        flexShrink:     0,
        imageRendering: 'pixelated',
      }}
    >
      {icon}
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface HistoryEntry { id: string; command: string; output: React.ReactNode }
type Phase = 'boot' | 'ready'
const QUICK_COMMANDS = ['help', 'about', 'projects', 'skills', 'experience', 'contact']

interface Props {
  theme: 'green' | 'white'
  onThemeChange: (t: 'green' | 'white') => void
  zIndex: number
  onFocus: () => void
  onClose: () => void
  visible: boolean
  skipBoot?: boolean
  mobileFullscreen?: boolean
  onOpenProject: (projectId: number) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Terminal({ theme, onThemeChange, zIndex, onFocus, onClose, visible, skipBoot, mobileFullscreen, onOpenProject }: Props) {
  const [phase, setPhase]               = useState<Phase>(skipBoot ? 'ready' : 'boot')
  const [history, setHistory]           = useState<HistoryEntry[]>([])
  const [inputHistory, setInputHistory] = useState<string[]>([])
  const [pos, setPos]                   = useState<{ x: number; y: number } | null>(null)
  const [minimized, setMinimized]       = useState(false)
  const [maximized, setMaximized]       = useState(false)

  const outputRef = useRef<HTMLDivElement>(null)
  const winRef    = useRef<HTMLDivElement>(null)
  const dragRef   = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const uid = useId()

  useEffect(() => {
    const vw = window.innerWidth, vh = window.innerHeight
    const w  = Math.min(700, vw - 24)
    const h  = Math.min(520, vh - 48)
    setPos({ x: Math.max(8, Math.floor(vw / 2 - w / 2 + 52)), y: Math.max(8, Math.floor(vh / 2 - h / 2)) })
  }, [])

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' })
  }, [history])

  const onTitleMouseDown = useCallback((e: React.MouseEvent) => {
    if (mobileFullscreen) return
    if ((e.target as HTMLElement).closest('[data-nodrag]')) return
    if (!pos) return
    e.preventDefault(); onFocus()
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y }
    if (winRef.current) winRef.current.style.cursor = 'grabbing'
  }, [pos, onFocus, mobileFullscreen])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      setPos({ x: Math.max(0, dragRef.current.origX + e.clientX - dragRef.current.startX),
               y: Math.max(0, dragRef.current.origY + e.clientY - dragRef.current.startY) })
    }
    const onUp = () => { dragRef.current = null; if (winRef.current) winRef.current.style.cursor = '' }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  const handleCommand = useCallback((rawInput: string) => {
    const input = rawInput.trim()
    if (!input) return
    setInputHistory((prev) => [input, ...prev.slice(0, 49)])

    if (input === 'clear') { setHistory([]); return }

    if (input === 'theme') {
      const next = theme === 'green' ? 'white' : 'green'
      onThemeChange(next as 'green' | 'white')
      setHistory((prev) => [...prev, {
        id: `${uid}-${Date.now()}`, command: input,
        output: <p style={{ fontSize: CMD.fontSize, opacity: 0.58 }}>theme → <span style={{ opacity: 1, fontWeight: 600 }}>{next}</span></p>,
      }])
      return
    }

    const parts = input.split(/\s+/)
    if (parts[0] === 'open') {
      const n = parseInt(parts[1])
      let output: React.ReactNode
      if (isNaN(n) || n < 1) {
        output = <p style={{ fontSize: CMD.fontSize, opacity: 0.50 }}>usage: open [n]</p>
      } else {
        const project = PROJECTS[n - 1]
        if (!project) {
          output = <p style={{ fontSize: CMD.fontSize, opacity: 0.50 }}>no project #{n}. run &quot;projects&quot;.</p>
        } else {
          onOpenProject(project.id)
          output = <p style={{ fontSize: CMD.fontSize, opacity: 0.42 }}>spawning: project://{project.slug}</p>
        }
      }
      setHistory((prev) => [...prev, { id: `${uid}-${Date.now()}`, command: input, output }])
      return
    }

    const output = processCommand(input, handleCommand)
    setHistory((prev) => [...prev, { id: `${uid}-${Date.now()}`, command: input, output }])
  }, [theme, uid, onThemeChange, onOpenProject])

  const accent = theme === 'green' ? '#d0a0e0' : CMD.cyan
  const text   = theme === 'green' ? '#d0a0e0' : CMD.white
  const dim    = theme === 'green' ? 'rgba(208,160,224,0.45)' : CMD.dim

  if (phase === 'boot') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 49, background: CMD.bodyBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <BootSequence onComplete={() => setPhase('ready')} theme={theme} />
      </div>
    )
  }

  if (!pos && !mobileFullscreen) return null

  const W    = mobileFullscreen ? window.innerWidth  : maximized ? window.innerWidth  : Math.min(700, window.innerWidth - 24)
  const H    = mobileFullscreen ? window.innerHeight : maximized ? window.innerHeight : minimized ? CMD.headerH : Math.min(520, window.innerHeight - 48)
  const left = mobileFullscreen ? 0 : maximized ? 0 : pos!.x
  const top  = mobileFullscreen ? 0 : maximized ? 0 : pos!.y
  const C = CMD.cornerCut
  const I = Math.ceil(CMD.frameW / 2)

  return (
    <div
      ref={winRef}
      onMouseDown={onFocus}
      className="pixel-terminal"
      style={{
        position:  'fixed', left, top,
        width: W, height: H,
        zIndex,
        display: visible ? 'block' : 'none',
        filter:    `drop-shadow(${CMD.frameW}px ${CMD.frameW}px 0 rgba(0,0,0,0.90))`,
        animation: 'windowOpen 0.14s steps(3) both',
      }}
    >
      {/* ── Content clipped to pixel-octagon ──────────────────────────── */}
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          clipPath: octClip(C),
          overflow: 'hidden',
          background: CMD.bodyBg,
          color: text, fontFamily: CMD.font,
          fontSize: CMD.fontSize, lineHeight: `${CMD.lineH}px`,
        }}
        onClick={() => winRef.current?.querySelector('input')?.focus()}
      >
        {/* ── Title bar ─────────────────────────────────────────────── */}
        <div
          onMouseDown={onTitleMouseDown}
          style={{
            height:       CMD.headerH,
            display:      'flex',
            alignItems:   'center',
            padding:      '0 4px 0 8px',
            gap:          6,
            background:   CMD.headerBg,
            borderBottom: minimized ? 'none' : '1px solid rgba(80,80,160,0.55)',
            cursor:       mobileFullscreen ? 'default' : 'grab',
            userSelect:   'none',
            flexShrink:   0,
          }}
        >
          <span style={{ flex: 1, fontSize: 11, fontWeight: 700, fontFamily: CMD.font,
                         color: CMD.titleFg, letterSpacing: '0.07em',
                         whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                         pointerEvents: 'none' }}>
            TERMINAL://HATEM
          </span>

          {/* Control buttons — hidden on mobile */}
          {!mobileFullscreen && (
          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Theme toggle — matches button style */}
            <div
              data-nodrag
              role="button"
              tabIndex={-1}
              title="Toggle theme"
              onClick={(e) => { e.stopPropagation(); handleCommand('theme') }}
              style={{
                width: 20, height: 18,
                background: '#c8b0e8',
                border: '2px solid #7858b0',
                boxSizing: 'border-box',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', userSelect: 'none', flexShrink: 0,
                fontSize: 9, color: IC, fontFamily: CMD.font,
              }}
            >
              {theme === 'green' ? '◑' : '◐'}
            </div>

            {/* Minimize */}
            <CmdBtn fill="#c8b0e8" outline="#7858b0"
              onClick={() => setMinimized(m => !m)} title="Minimize"
              icon={MinusIcon} />

            {/* Maximize */}
            <CmdBtn fill="#c8b0e8" outline="#7858b0"
              onClick={() => { setMaximized(m => !m); setMinimized(false) }} title="Maximize"
              icon={SquareIcon} />

            {/* Close */}
            <CmdBtn fill="#f0a8b0" outline="#b82850"
              onClick={onClose} title="Close"
              icon={CrossIcon} />
          </div>
          )}
        </div>

        {/* ── Body ──────────────────────────────────────────────────── */}
        {!minimized && (
          <>
            <div
              ref={outputRef}
              className="flex-1 overflow-y-auto"
              style={{
                padding: '6px 8px 4px',
                fontSize: CMD.fontSize, lineHeight: `${CMD.lineH}px`,
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(80,80,160,0.35) transparent',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {history.length === 0 && (
                <p style={{ color: dim, marginBottom: 4 }}>type a command or click a shortcut below.</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {history.map((entry) => (
                  <div key={entry.id} className="animate-fadeIn">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                      <span style={{ color: accent, fontWeight: 600 }}>hatem@system</span>
                      <span style={{ color: dim }}>:~$</span>
                      <span style={{ color: text }}>{entry.command}</span>
                    </div>
                    <div style={{ paddingLeft: 2 }}>{entry.output}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{ flexShrink: 0, borderTop: '1px solid rgba(80,80,160,0.40)',
                       padding: '5px 8px 6px', fontSize: CMD.fontSize, lineHeight: `${CMD.lineH}px` }}
              onClick={(e) => e.stopPropagation()}
            >
              <TerminalInput onSubmit={handleCommand} inputHistory={inputHistory} theme={theme} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 5 }}>
                {QUICK_COMMANDS.map((cmd) => (
                  <button key={cmd}
                    onClick={(e) => { e.stopPropagation(); handleCommand(cmd) }}
                    style={{
                      fontSize: 9, fontFamily: CMD.font, color: dim,
                      border: '1px solid rgba(80,80,160,0.35)', borderRadius: 0,
                      background: 'rgba(80,80,160,0.07)', cursor: 'pointer',
                      padding: '1px 6px', lineHeight: '12px',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(80,80,160,0.20)'; e.currentTarget.style.color = CMD.cyan }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(80,80,160,0.07)'; e.currentTarget.style.color = dim }}
                  >{cmd}</button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── SVG pixel frame — shapeRendering crispEdges gives pixel-stepped corners ── */}
      <svg width={W} height={H}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
        shapeRendering="crispEdges"
      >
        {/* Main 3px border */}
        <path d={octPath(W, H, C, I)} fill="none"
              stroke={CMD.frameColor} strokeWidth={CMD.frameW} />
        {/* Faint inner highlight for depth */}
        <path d={octPath(W, H, C + CMD.frameW, I + CMD.frameW)}
              fill="none" stroke="rgba(160,185,255,0.16)" strokeWidth={1} />
      </svg>
    </div>
  )
}
