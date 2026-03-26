'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { ap } from '@/lib/assetPath'

// ─── Config ───────────────────────────────────────────────────────────────────

const CHAR_SIZE     = 180
const BUBBLE_W      = 152
const BUBBLE_H      = Math.round(152 * 325 / 403)
const TALK_DURATION = 8000
const INIT_X        = 28
const INIT_BOTTOM   = 32

const FONT = "'JetBrains Mono','Fira Code','Cascadia Code',ui-monospace,monospace"

type Phase = 'talking' | 'idle' | 'idle2' | 'grab'

// ─── Preload all GIFs ─────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  ;[ap('/character/talking.gif'), ap('/character/idle.gif'), ap('/character/idle2.gif'), ap('/character/grab.gif')].forEach((src) => {
    const img = new Image(); img.src = src
  })
}

// ─── Idle alternation helpers ─────────────────────────────────────────────────

function randMs(min: number, max: number) {
  return min + Math.random() * (max - min)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default memo(function PixelCharacter() {
  const [phase, setPhase]   = useState<Phase>('talking')
  const [pos, setPos]       = useState<{ x: number; y: number } | null>(null)

  const talkingRef  = useRef(true)
  const dragging    = useRef(false)
  const dragOffset  = useRef({ ox: 0, oy: 0 })
  const idleTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Init position on mount ────────────────────────────────────────────────
  useEffect(() => {
    setPos({
      x: INIT_X,
      y: window.innerHeight - INIT_BOTTOM - CHAR_SIZE,
    })
  }, [])

  // ── Idle alternation cycle ────────────────────────────────────────────────
  const scheduleIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      if (dragging.current || talkingRef.current) { scheduleIdle(); return }
      // 25% chance to briefly play idle2, otherwise stay on idle
      if (Math.random() < 0.25) {
        setPhase('idle2')
        idleTimer.current = setTimeout(() => {
          if (!dragging.current && !talkingRef.current) setPhase('idle')
          scheduleIdle()
        }, randMs(1000, 2000))
      } else {
        scheduleIdle()
      }
    }, randMs(3000, 7000))
  }, [])

  // ── Talking → idle after timeout ──────────────────────────────────────────
  useEffect(() => {
    const id = setTimeout(() => {
      talkingRef.current = false
      setPhase('idle')
      scheduleIdle()
    }, TALK_DURATION)
    return () => {
      clearTimeout(id)
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [scheduleIdle])

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (talkingRef.current) return
    e.preventDefault()
    dragging.current = true
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    dragOffset.current = { ox: e.clientX - rect.left, oy: e.clientY - rect.top }
    setPhase('grab')
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    e.preventDefault()
    const x = Math.max(0, Math.min(window.innerWidth  - CHAR_SIZE, e.clientX - dragOffset.current.ox))
    const y = Math.max(0, Math.min(window.innerHeight - CHAR_SIZE, e.clientY - dragOffset.current.oy))
    setPos({ x, y })
  }, [])

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    if (talkingRef.current) {
      setPhase('talking')
    } else {
      setPhase('idle')
      scheduleIdle()
    }
  }, [scheduleIdle])

  // ── Resolve gif src ───────────────────────────────────────────────────────
  const src =
    phase === 'talking' ? ap('/character/talking.gif') :
    phase === 'grab'    ? ap('/character/grab.gif')    :
    phase === 'idle2'   ? ap('/character/idle2.gif')   :
                          ap('/character/idle.gif')

  if (!pos) return null

  return (
    <div
      className="hidden sm:block"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position:    'fixed',
        left:        pos.x,
        top:         pos.y,
        width:       CHAR_SIZE,
        height:      CHAR_SIZE,
        zIndex:      3,
        cursor:      phase === 'grab' ? 'grabbing' : talkingRef.current ? 'default' : 'grab',
        touchAction: 'none',
      }}
    >
      {/* ── Speech bubble ── */}
      {phase === 'talking' && (
        <div style={{
          position:      'absolute',
          bottom:        Math.round(CHAR_SIZE * 0.72),
          left:          CHAR_SIZE - 32,
          width:         BUBBLE_W,
          height:        BUBBLE_H,
          pointerEvents: 'none',
        }}>
          <img
            src={ap('/character/bubble.png')}
            width={BUBBLE_W}
            height={BUBBLE_H}
            alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              imageRendering: 'pixelated', display: 'block',
            }}
          />
          <div style={{
            position: 'absolute', top: 14, left: 22, right: 22, bottom: 42,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily:    FONT,
              fontSize:      11,
              fontWeight:    700,
              color:         '#1a1040',
              textAlign:     'center',
              lineHeight:    1.55,
              letterSpacing: '0.04em',
              wordBreak:     'break-word',
              userSelect:    'none',
            }}>
              hi, i am hatem.{'\n'}welcome to my portfolio
            </span>
          </div>
        </div>
      )}

      {/* ── Character gif ── */}
      <img
        src={src}
        width={CHAR_SIZE}
        height={CHAR_SIZE}
        alt="character"
        draggable={false}
        style={{
          position:       'absolute',
          inset:          0,
          width:          CHAR_SIZE,
          height:         CHAR_SIZE,
          imageRendering: 'pixelated',
          display:        'block',
          opacity:        0.92,
          filter:         'drop-shadow(0 4px 12px rgba(196,181,253,0.18))',
          userSelect:     'none',
        }}
      />
    </div>
  )
})
