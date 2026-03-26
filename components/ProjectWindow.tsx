'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ImageLightbox from './ImageLightbox'
import type { Project, ProjectImage } from '@/data/portfolio'
// ─── Constants — matches Terminal style ──────────────────────────────────────

const FONT       = "'JetBrains Mono','Fira Code','Cascadia Code',ui-monospace,monospace"
const WIN_W      = 860
const WIN_H      = 720
const HEADER_BG  = '#b09ecc'
const FRAME_COLOR = '#5a3e98'
const FRAME_W    = 3
const HEADER_H   = 28
const C          = 8    // corner cut
const I          = Math.ceil(FRAME_W / 2)
const TITLE_FG   = '#1a1040'
const BODY_BG    = `repeating-linear-gradient(0deg,transparent 0px,transparent 1px,rgba(0,0,0,0.07) 1px,rgba(0,0,0,0.07) 2px),#0e0c20`
const IC         = '#180830'

function octPath(w: number, h: number, c: number, ins: number) {
  return `M ${c} ${ins} L ${w-c} ${ins} L ${w-ins} ${c} L ${w-ins} ${h-c} L ${w-c} ${h-ins} L ${c} ${h-ins} L ${ins} ${h-c} L ${ins} ${c} Z`
}
function octClip(c: number) {
  return `polygon(${c}px 0,calc(100% - ${c}px) 0,100% ${c}px,100% calc(100% - ${c}px),calc(100% - ${c}px) 100%,${c}px 100%,0 calc(100% - ${c}px),0 ${c}px)`
}

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

// ─── Inner image frame ────────────────────────────────────────────────────────

function WinImage({
  image,
  onExpand,
}: {
  image: ProjectImage
  onExpand: (src: string, filename: string) => void
}) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <p style={{ fontFamily: FONT, fontSize: '10px', color: '#c8c8d8', opacity: 0.55, marginBottom: '6px', flexShrink: 0, lineHeight: 1.4 }}>
        {image.label}
      </p>

      <div
        className="group relative overflow-hidden"
        style={{
          border: `1px solid rgba(82,64,168,0.40)`,
          background: 'rgba(10,8,28,0.60)',
          cursor: status === 'loaded' ? 'zoom-in' : 'default',
          flex: 1,
        }}
        onClick={() => status === 'loaded' && onExpand(image.src, image.filename)}
      >
        {status === 'loading' && (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: FONT, fontSize: '10px', color: '#c8c8d8', opacity: 0.15 }}>
              loading...
            </span>
          </div>
        )}

        {status === 'error' && (
          <div
            style={{
              height: '90px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              padding: '0 12px',
              textAlign: 'center',
            }}
          >
            <span style={{ fontFamily: FONT, fontSize: '10px', color: '#c8c8d8', opacity: 0.2 }}>
              image unavailable
            </span>
            <span style={{ fontFamily: FONT, fontSize: '9px', color: '#c8c8d8', opacity: 0.1, wordBreak: 'break-all' }}>
              {image.src}
            </span>
          </div>
        )}

        <img
          src={image.src}
          alt={image.label}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          style={{ display: status === 'loaded' ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {status === 'loaded' && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.35)' }}
          >
            <span style={{ fontFamily: FONT, fontSize: '10px', color: '#c4b5fd', border: '1px solid rgba(196,181,253,0.35)', padding: '3px 10px' }}>
              → expand
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────

function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: FONT, fontSize: '9px', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#c4b5fd', opacity: 0.35, marginBottom: '7px' }}>
      {children}
    </p>
  )
}

function SDivider() {
  return <div style={{ borderTop: '1px solid rgba(82,64,168,0.35)', margin: '18px 0' }} />
}

// ─── Main window component ────────────────────────────────────────────────────

interface Props {
  project: Project
  initialPosition: { x: number; y: number }
  zIndex: number
  onClose: () => void
  onFocus: () => void
}

export default function ProjectWindow({
  project,
  initialPosition,
  zIndex,
  onClose,
  onFocus,
}: Props) {
  const [pos, setPos] = useState(initialPosition)
  const [minimized, setMinimized] = useState(false)
  const [lightbox, setLightbox] = useState<{ src: string; filename: string } | null>(null)

  const dragState = useRef<{
    startX: number
    startY: number
    origX: number
    origY: number
  } | null>(null)
  const winRef = useRef<HTMLDivElement>(null)

  // ── Drag ──────────────────────────────────────────────────────────────────
  const handleTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-nodrag]')) return
      e.preventDefault()
      onFocus()
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: pos.x,
        origY: pos.y,
      }
      if (winRef.current) winRef.current.style.cursor = 'grabbing'
    },
    [pos, onFocus]
  )

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragState.current) return
      const x = Math.max(0, dragState.current.origX + e.clientX - dragState.current.startX)
      const y = Math.max(0, dragState.current.origY + e.clientY - dragState.current.startY)
      setPos({ x, y })
    }

    const onUp = () => {
      if (!dragState.current) return
      dragState.current = null
      if (winRef.current) winRef.current.style.cursor = ''
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  // ── Touch drag ────────────────────────────────────────────────────────────
  const handleTitleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if ((e.target as HTMLElement).closest('[data-nodrag]')) return
      const t = e.touches[0]
      onFocus()
      dragState.current = { startX: t.clientX, startY: t.clientY, origX: pos.x, origY: pos.y }
    },
    [pos, onFocus]
  )

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!dragState.current) return
      e.preventDefault()
      const t = e.touches[0]
      setPos({
        x: Math.max(0, dragState.current.origX + t.clientX - dragState.current.startX),
        y: Math.max(0, dragState.current.origY + t.clientY - dragState.current.startY),
      })
    }
    const onTouchEnd = () => { dragState.current = null }

    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const W = Math.min(WIN_W, typeof window !== 'undefined' ? window.innerWidth - 16 : WIN_W)
  const H = minimized ? HEADER_H : Math.min(WIN_H, typeof window !== 'undefined' ? window.innerHeight - 32 : WIN_H)

  return (
    <>
      <div
        ref={winRef}
        onMouseDown={onFocus}
        className="pixel-terminal"
        style={{
          position:  'fixed',
          left:      pos.x,
          top:       pos.y,
          width:     W,
          height:    H,
          zIndex,
          filter:    `drop-shadow(${FRAME_W}px ${FRAME_W}px 0 rgba(0,0,0,0.90))`,
          animation: 'windowOpen 0.14s steps(3) both',
        }}
      >
        {/* ── Content clipped to pixel-octagon ── */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          clipPath: octClip(C),
          overflow: 'hidden',
          background: BODY_BG,
          color: '#c8c8d8', fontFamily: FONT, fontSize: 11,
        }}>
          {/* ── Title bar ── */}
          <div
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
            onMouseDown={handleTitleMouseDown}
            onTouchStart={handleTitleTouchStart}
          >
            <span style={{
              flex: 1, fontSize: 11, fontWeight: 700, fontFamily: FONT,
              color: TITLE_FG, letterSpacing: '0.07em',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              pointerEvents: 'none',
            }}>
              PROJECT://{project.slug.toUpperCase()}
            </span>
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <CmdBtn fill="#c8b0e8" outline="#7858b0"
                onClick={() => setMinimized(m => !m)} title="Minimize" icon={MinusIcon} />
              <CmdBtn fill="#f0a8b0" outline="#b82850"
                onClick={onClose} title="Close" icon={CrossIcon} />
            </div>
          </div>

          {/* ── Scrollable content ── */}
          {!minimized && (
          <div
            style={{ flex: 1, overflowY: 'auto', padding: '20px 22px 28px',
                     scrollbarWidth: 'thin', scrollbarColor: 'rgba(80,80,160,0.35) transparent' }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#e0e0e8', margin: 0, lineHeight: 1.2 }}>
                {project.title}
              </h2>
              <p style={{ fontSize: '12px', color: '#c8c8d8', opacity: 0.42, marginTop: '5px' }}>
                {project.tagline}
              </p>
            </div>

            {/* Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px 20px', marginBottom: '4px' }}>
              {[
                { label: 'category', value: project.category },
                { label: 'role', value: project.role },
                { label: 'year', value: project.year },
                { label: 'tools', value: project.tech.join(' · ') },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '10px', fontSize: '11px', alignItems: 'baseline' }}>
                  <span style={{ color: '#c4b5fd', opacity: 0.35, minWidth: '52px', flexShrink: 0 }}>{label}</span>
                  <span style={{ color: '#c8c8d8', opacity: 0.8 }}>{value}</span>
                </div>
              ))}
            </div>

            <SDivider />

            {/* Content sections */}
            <div style={{ display: 'grid', gap: '15px', marginBottom: '4px' }}>
              {[
                { label: 'overview',  value: project.summary },
                { label: 'problem',   value: project.problem },
                { label: 'solution',  value: project.solution },
                ...(project.process ? [{ label: 'process', value: project.process }] : []),
                { label: 'outcome',   value: project.outcome },
              ].map(({ label, value }) => (
                <div key={label}>
                  <SLabel>{label}</SLabel>
                  <p style={{ fontSize: '12px', color: '#c8c8d8', opacity: 0.78, lineHeight: 1.7, margin: 0 }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Gallery */}
            {project.images.length > 0 && (
              <>
                <SDivider />
                <SLabel>gallery</SLabel>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      project.images.length === 1
                        ? '1fr'
                        : 'repeat(2, 1fr)',
                    gridAutoRows: '200px',
                    gap: '14px',
                    marginTop: '2px',
                  }}
                >
                  {project.images.map((img) => (
                    <WinImage
                      key={img.filename}
                      image={img}
                      onExpand={(src, fn) => setLightbox({ src, filename: fn })}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Stack */}
            <SDivider />
            <SLabel>stack</SLabel>
            <div style={{ display: 'grid', gap: '5px' }}>
              {project.stack.map((item) => (
                <div key={item.name} style={{ display: 'flex', gap: '14px', fontSize: '11px' }}>
                  <span style={{ color: '#c4b5fd', opacity: 0.85, minWidth: '110px', fontWeight: 600 }}>
                    {item.name}
                  </span>
                  <span style={{ color: '#c8c8d8', opacity: 0.38 }}>{item.role}</span>
                </div>
              ))}
            </div>

            {/* Link */}
            {project.caseStudyUrl && (
              <>
                <SDivider />
                <SLabel>links</SLabel>
                <a
                  href={project.caseStudyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: FONT,
                    fontSize: '11px',
                    color: '#c4b5fd',
                    opacity: 0.6,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.6')}
                >
                  → {project.caseStudyUrl}
                </a>
              </>
            )}
          </div>
          )}
        </div>

        {/* ── SVG pixel frame ── */}
        <svg width={W} height={H}
          style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'visible' }}
          shapeRendering="crispEdges"
        >
          <path d={octPath(W, H, C, I)} fill="none" stroke={FRAME_COLOR} strokeWidth={FRAME_W} />
          <path d={octPath(W, H, C + FRAME_W, I + FRAME_W)}
                fill="none" stroke="rgba(160,185,255,0.16)" strokeWidth={1} />
        </svg>
      </div>

      {/* Per-window lightbox */}
      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          filename={lightbox.filename}
          theme="green"
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}
