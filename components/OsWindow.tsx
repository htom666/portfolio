'use client'

import { useState, useRef, useEffect, useCallback, memo, type CSSProperties } from 'react'

// ─── Shared pixel OS constants (matches Terminal) ─────────────────────────────

const HEADER_BG  = '#b09ecc'
const FRAME_COLOR = '#5a3e98'
const FRAME_W    = 3
const HEADER_H   = 28
const C          = 8
const I          = Math.ceil(FRAME_W / 2)
const TITLE_FG   = '#1a1040'
const BODY_BG    = `repeating-linear-gradient(0deg,transparent 0px,transparent 1px,rgba(0,0,0,0.07) 1px,rgba(0,0,0,0.07) 2px),#0e0c20`
const IC         = '#180830'
const FONT       = "'JetBrains Mono','Fira Code','Cascadia Code',ui-monospace,monospace"

function octPath(w: number, h: number, c: number, ins: number) {
  return `M ${c} ${ins} L ${w-c} ${ins} L ${w-ins} ${c} L ${w-ins} ${h-c} L ${w-c} ${h-ins} L ${c} ${h-ins} L ${ins} ${h-c} L ${ins} ${c} Z`
}
function octClip(c: number) {
  return `polygon(${c}px 0,calc(100% - ${c}px) 0,100% ${c}px,100% calc(100% - ${c}px),calc(100% - ${c}px) 100%,${c}px 100%,0 calc(100% - ${c}px),0 ${c}px)`
}

// ─── Pixel control buttons (same as Terminal) ─────────────────────────────────

const MinusIcon = (
  <div style={{ position:'absolute', left:4, top:6, width:8, height:2, background:IC, imageRendering:'pixelated' }} />
)
const CrossIcon = (
  <div style={{
    position:'absolute', left:5, top:4, width:1, height:1,
    background:IC, imageRendering:'pixelated',
    boxShadow:[
      `1px 1px 0 0 ${IC}`,`2px 2px 0 0 ${IC}`,`3px 3px 0 0 ${IC}`,
      `4px 4px 0 0 ${IC}`,`5px 5px 0 0 ${IC}`,`6px 6px 0 0 ${IC}`,
      `6px 0 0 0 ${IC}`,`5px 1px 0 0 ${IC}`,`4px 2px 0 0 ${IC}`,
      `2px 4px 0 0 ${IC}`,`1px 5px 0 0 ${IC}`,`0 6px 0 0 ${IC}`,
    ].join(', '),
  }} />
)

function CmdBtn({ fill, outline, onClick, title, icon }: {
  fill: string; outline: string; onClick: () => void; title: string; icon: React.ReactNode
}) {
  const [down, setDown] = useState(false)
  return (
    <div
      data-nodrag role="button" tabIndex={-1} title={title}
      onMouseDown={(e) => { e.stopPropagation(); setDown(true) }}
      onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={{
        position:'relative', width:20, height:18,
        background: down ? 'rgba(0,0,0,0.12)' : fill,
        border:`2px solid ${outline}`, boxSizing:'border-box',
        cursor:'pointer', userSelect:'none', flexShrink:0,
        imageRendering:'pixelated',
      }}
    >
      {icon}
    </div>
  )
}

// ─── Legacy exports (kept for any remaining consumers) ────────────────────────

export const WIN = {
  font: FONT,
  headerH: HEADER_H,
  headerBg: HEADER_BG,
  bg: BODY_BG,
  border: `${FRAME_W}px solid ${FRAME_COLOR}`,
  radius: 0,
  shadow: '',
  headerBorder: '1px solid rgba(80,80,160,0.55)',
  titleColor: TITLE_FG,
  titleSize: 11,
} as const

export function PixelClose({ onClick }: { onClick: () => void }) {
  return <CmdBtn fill="#f0a8b0" outline="#b82850" onClick={onClick} title="Close" icon={CrossIcon} />
}
export function PixelMinimize({ onClick }: { onClick: () => void }) {
  return <CmdBtn fill="#c8b0e8" outline="#7858b0" onClick={onClick} title="Minimize" icon={MinusIcon} />
}
export function PixelMaximize({ onClick }: { onClick: () => void }) {
  return <CmdBtn fill="#c8b0e8" outline="#7858b0" onClick={onClick} title="Maximize" icon={MinusIcon} />
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OsWindowProps {
  title: string
  width?: number
  minHeight?: number
  initialPosition: { x: number; y: number }
  zIndex: number
  onClose: () => void
  onFocus: () => void
  children: React.ReactNode
  style?: CSSProperties
}

// ─── Component ────────────────────────────────────────────────────────────────

export default memo(function OsWindow({
  title, width = 480, minHeight = 280, initialPosition,
  zIndex, onClose, onFocus, children,
}: OsWindowProps) {
  const [minimized, setMinimized] = useState(false)
  const [svgH, setSvgH] = useState(minHeight + HEADER_H)

  const posRef  = useRef(initialPosition)
  const winRef  = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ ox: number; oy: number } | null>(null)

  // Track rendered height for SVG frame
  useEffect(() => {
    if (!winRef.current) return
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.borderBoxSize?.[0]?.blockSize ?? entries[0]?.contentRect.height
      if (h) setSvgH(h)
    })
    ro.observe(winRef.current)
    return () => ro.disconnect()
  }, [])

  const onTitleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-nodrag]')) return
    onFocus()
    dragRef.current = { ox: e.clientX - posRef.current.x, oy: e.clientY - posRef.current.y }
    const onMove = (mv: MouseEvent) => {
      if (!dragRef.current || !winRef.current) return
      const x = mv.clientX - dragRef.current.ox
      const y = mv.clientY - dragRef.current.oy
      posRef.current = { x, y }
      winRef.current.style.left = `${x}px`
      winRef.current.style.top  = `${y}px`
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [onFocus])

  const W = width

  return (
    <div
      ref={winRef}
      onMouseDown={onFocus}
      className="pixel-terminal"
      style={{
        position:  'fixed',
        left:      initialPosition.x,
        top:       initialPosition.y,
        width:     W,
        zIndex,
        filter:    `drop-shadow(${FRAME_W}px ${FRAME_W}px 0 rgba(0,0,0,0.90))`,
        animation: 'windowOpen 0.14s steps(3) both',
      }}
    >
      {/* ── Content clipped to pixel-octagon ── */}
      <div style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        clipPath: octClip(C),
        overflow: 'hidden',
        background: BODY_BG,
        color: '#c8c8d8', fontFamily: FONT, fontSize: 11,
        minHeight: minimized ? 0 : minHeight + HEADER_H,
      }}>
        {/* ── Title bar ── */}
        <div
          onMouseDown={onTitleMouseDown}
          style={{
            height:       HEADER_H,
            display:      'flex',
            alignItems:   'center',
            padding:      '0 4px 0 8px',
            gap:          6,
            background:   HEADER_BG,
            borderBottom: minimized ? 'none' : '1px solid rgba(80,80,160,0.55)',
            cursor:       'grab',
            userSelect:   'none',
            flexShrink:   0,
          }}
        >
          <span style={{
            flex: 1, fontSize: 11, fontWeight: 700, fontFamily: FONT,
            color: TITLE_FG, letterSpacing: '0.07em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            pointerEvents: 'none',
          }}>
            {title.toUpperCase()}
          </span>
          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <CmdBtn fill="#c8b0e8" outline="#7858b0"
              onClick={() => setMinimized(m => !m)} title="Minimize" icon={MinusIcon} />
            <CmdBtn fill="#f0a8b0" outline="#b82850"
              onClick={onClose} title="Close" icon={CrossIcon} />
          </div>
        </div>

        {/* ── Content ── */}
        {!minimized && (
          <div style={{
            flex: 1, overflow: 'auto', minHeight: 0,
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(80,80,160,0.35) transparent',
          }}>
            {children}
          </div>
        )}
      </div>

      {/* ── SVG pixel frame ── */}
      <svg
        width={W} height={svgH}
        style={{ position:'absolute', top:0, left:0, pointerEvents:'none', overflow:'visible' }}
        shapeRendering="crispEdges"
      >
        <path d={octPath(W, svgH, C, I)} fill="none" stroke={FRAME_COLOR} strokeWidth={FRAME_W} />
        <path d={octPath(W, svgH, C + FRAME_W, I + FRAME_W)}
              fill="none" stroke="rgba(160,185,255,0.16)" strokeWidth={1} />
      </svg>
    </div>
  )
})
