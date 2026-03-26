'use client'

import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { ap } from '@/lib/assetPath'

// ─── Playlist ─────────────────────────────────────────────────────────────────

const PLAYLIST = [
  { name: 'Soft Coral Screensaver',    src: ap('/music/track_01.mp3'), thumb: ap('/music/m1.webp') },
  { name: 'Soft Coral Screensaver II', src: ap('/music/track_02.mp3'), thumb: ap('/music/m2.gif')  },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const W        = 280
const HEADER_H = 28
const ART_H    = 155
const C        = 8
const FRAME_W  = 3
const I        = Math.ceil(FRAME_W / 2)
const BODY_H   = ART_H + 24 + 46 + 28 + 30 + 12   // art + name + controls + progress + volume + bottom
const FULL_H   = HEADER_H + BODY_H                  // = 323

// ─── Colors ───────────────────────────────────────────────────────────────────

const FONT        = "'JetBrains Mono','Fira Code','Cascadia Code',ui-monospace,monospace"
const FRAME_COLOR = '#5a3e98'
const HEADER_BG   = '#b09ecc'
const HEADER_TEXT = '#1a1040'
const BODY_BG     = '#0e0c20'
const ART_BDR     = '#3a2870'
const CTRL_BG     = '#1e1840'
const CTRL_BG_ACT = '#2e2060'
const CTRL_FG     = '#c8b8f0'
const PROG_TRACK  = '#1a1535'
const PROG_FILL   = '#7a50c8'
const PROG_THUMB  = '#9870e0'
const VOL_FILL    = '#4a78b8'
const VOL_THUMB   = '#6898d0'
const BTN_IC      = '#1a1040'

// ─── Octagon helpers ──────────────────────────────────────────────────────────

function octPath(w: number, h: number, c: number, ins: number) {
  return `M ${c} ${ins} L ${w-c} ${ins} L ${w-ins} ${c} L ${w-ins} ${h-c} L ${w-c} ${h-ins} L ${c} ${h-ins} L ${ins} ${h-c} L ${ins} ${c} Z`
}
function octClip(c: number) {
  return `polygon(${c}px 0, calc(100% - ${c}px) 0, 100% ${c}px, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, ${c}px 100%, 0 calc(100% - ${c}px), 0 ${c}px)`
}

// ─── Title bar X icon ─────────────────────────────────────────────────────────

const CROSS = [
  `1px 1px 0 0 ${BTN_IC}`,`2px 2px 0 0 ${BTN_IC}`,`3px 3px 0 0 ${BTN_IC}`,
  `4px 4px 0 0 ${BTN_IC}`,`5px 5px 0 0 ${BTN_IC}`,`6px 6px 0 0 ${BTN_IC}`,
  `6px 0 0 0 ${BTN_IC}`,  `5px 1px 0 0 ${BTN_IC}`,`4px 2px 0 0 ${BTN_IC}`,
  `2px 4px 0 0 ${BTN_IC}`,`1px 5px 0 0 ${BTN_IC}`,`0px 6px 0 0 ${BTN_IC}`,
].join(', ')

// ─── SVG pixel icons ──────────────────────────────────────────────────────────

function IconPrev() {
  return (
    <svg width="13" height="11" viewBox="0 0 13 11" shapeRendering="crispEdges" style={{ display:'block' }}>
      <rect x="0" y="0" width="2" height="11" fill={CTRL_FG}/>
      <polygon points="3,0 3,11 9,5.5" fill={CTRL_FG} transform="scale(-1,1) translate(-12,0)"/>
      <polygon points="3,0 3,11 9,5.5" fill={CTRL_FG} transform="scale(-1,1) translate(-6,0)"/>
    </svg>
  )
}
function IconNext() {
  return (
    <svg width="13" height="11" viewBox="0 0 13 11" shapeRendering="crispEdges" style={{ display:'block' }}>
      <rect x="11" y="0" width="2" height="11" fill={CTRL_FG}/>
      <polygon points="0,0 0,11 6,5.5" fill={CTRL_FG}/>
      <polygon points="6,0 6,11 12,5.5" fill={CTRL_FG}/>
    </svg>
  )
}
function IconPlay() {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" shapeRendering="crispEdges" style={{ display:'block' }}>
      <polygon points="0,0 0,13 11,6.5" fill={CTRL_FG}/>
    </svg>
  )
}
function IconPause() {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" shapeRendering="crispEdges" style={{ display:'block' }}>
      <rect x="0" y="0" width="4" height="13" fill={CTRL_FG}/>
      <rect x="7" y="0" width="4" height="13" fill={CTRL_FG}/>
    </svg>
  )
}
function IconVolume({ muted }: { muted: boolean }) {
  return (
    <svg width="16" height="13" viewBox="0 0 16 13" shapeRendering="crispEdges" style={{ display:'block' }}>
      <rect x="0" y="4" width="3" height="5" fill={CTRL_FG}/>
      <polygon points="3,4 3,9 7,12 7,1" fill={CTRL_FG}/>
      {muted ? (
        <>
          <rect x="9"  y="3" width="2" height="2" fill={CTRL_FG}/>
          <rect x="11" y="5" width="2" height="2" fill={CTRL_FG}/>
          <rect x="13" y="7" width="2" height="2" fill={CTRL_FG}/>
          <rect x="11" y="7" width="2" height="2" fill={CTRL_FG}/>
          <rect x="9"  y="9" width="2" height="2" fill={CTRL_FG}/>
          <rect x="13" y="3" width="2" height="2" fill={CTRL_FG}/>
        </>
      ) : (
        <>
          <rect x="9"  y="5" width="2" height="3" fill={CTRL_FG}/>
          <rect x="11" y="3" width="2" height="7" fill={CTRL_FG}/>
          <rect x="13" y="1" width="2" height="11" fill={CTRL_FG}/>
        </>
      )}
    </svg>
  )
}

// ─── Control button ───────────────────────────────────────────────────────────

function CtrlBtn({ children, onClick, active = false, wide = false }: {
  children: React.ReactNode; onClick: () => void; active?: boolean; wide?: boolean
}) {
  const [down, setDown] = useState(false)
  return (
    <div
      role="button"
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: wide ? 54 : 40, height: 32,
        background: down ? '#b0a0d8' : active ? CTRL_BG_ACT : CTRL_BG,
        border: `2px solid ${ART_BDR}`, boxSizing: 'border-box',
        cursor: 'pointer', userSelect: 'none', flexShrink: 0,
        transform: down ? 'translateY(1px)' : 'none',
      }}
    >
      {children}
    </div>
  )
}

// ─── Slider ───────────────────────────────────────────────────────────────────

function PixelSlider({ value, fillColor, thumbColor, onChange }: {
  value: number; fillColor: string; thumbColor: string; onChange: (v: number) => void
}) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    onChange(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)))
  }
  return (
    <div style={{ flex: 1, position: 'relative', height: 12, cursor: 'pointer' }} onClick={handleClick}>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 3, height: 6,
        background: PROG_TRACK, border: `2px solid ${ART_BDR}`, boxSizing: 'border-box',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%',
          width: `${value * 100}%`, background: fillColor,
        }}/>
      </div>
      <div style={{
        position: 'absolute', top: 1, left: `calc(${value * 100}% - 5px)`,
        width: 10, height: 10,
        background: thumbColor, border: `2px solid ${ART_BDR}`,
        boxSizing: 'border-box', pointerEvents: 'none',
      }}/>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  initialPosition: { x: number; y: number }
  zIndex: number; onClose: () => void; onFocus: () => void
}

export default memo(function PixelMusicPlayer({ initialPosition, zIndex, onClose, onFocus }: Props) {
  const [trackIdx, setTrackIdx] = useState(0)
  const [playing, setPlaying]   = useState(false)
  const [muted, setMuted]       = useState(false)
  const [volume, setVolume]     = useState(0.8)
  const [minimized, setMinimized] = useState(false)
  const [pos, setPos]           = useState(initialPosition)

  const audioRef    = useRef<HTMLAudioElement | null>(null)
  const trackIdxRef = useRef(0)
  const durationRef = useRef(0)
  const winRef      = useRef<HTMLDivElement>(null)
  const dragRef     = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)
  const progFillRef = useRef<HTMLDivElement>(null)
  const progThumbRef = useRef<HTMLDivElement>(null)

  // ── Audio setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio(PLAYLIST[0].src)
    audio.preload = 'metadata'
    audio.volume = 0.8
    audioRef.current = audio

    const setProgPct = (pct: number) => {
      if (progFillRef.current)  progFillRef.current.style.width = `${pct * 100}%`
      if (progThumbRef.current) progThumbRef.current.style.left = `calc(${pct * 100}% - 5px)`
    }
    const onPlay   = () => setPlaying(true)
    const onPause  = () => setPlaying(false)
    const onTime   = () => {
      const d = durationRef.current
      setProgPct(d > 0 ? audio.currentTime / d : 0)
    }
    const onDur    = () => { durationRef.current = isFinite(audio.duration) ? audio.duration : 0 }
    const onEnded  = () => {
      const next = (trackIdxRef.current + 1) % PLAYLIST.length
      trackIdxRef.current = next
      setTrackIdx(next)
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('durationchange', onDur)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.pause(); audio.src = ''
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('durationchange', onDur)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current; if (!audio) return
    trackIdxRef.current = trackIdx
    const was = !audio.paused
    audio.src = PLAYLIST[trackIdx].src; audio.load()
    durationRef.current = 0
    if (progFillRef.current)  progFillRef.current.style.width = '0%'
    if (progThumbRef.current) progThumbRef.current.style.left = 'calc(0% - 5px)'
    if (was) audio.play().catch(() => {})
  }, [trackIdx])

  useEffect(() => { if (audioRef.current) audioRef.current.muted = muted }, [muted])
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume }, [volume])

  // ── Drag ───────────────────────────────────────────────────────────────────
  const onTitleDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-nodrag]')) return
    e.preventDefault(); onFocus()
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y }
  }, [pos, onFocus])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      setPos({ x: Math.max(0, dragRef.current.ox + e.clientX - dragRef.current.sx), y: Math.max(0, dragRef.current.oy + e.clientY - dragRef.current.sy) })
    }
    const onUp = () => { dragRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  // ── Controls ───────────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const a = audioRef.current; if (!a) return
    a.paused ? a.play().catch(() => {}) : a.pause()
  }, [])
  const prevTrack = useCallback(() => setTrackIdx(i => (i - 1 + PLAYLIST.length) % PLAYLIST.length), [])
  const nextTrack = useCallback(() => setTrackIdx(i => (i + 1) % PLAYLIST.length), [])

  // ── Render ─────────────────────────────────────────────────────────────────
  const track = PLAYLIST[trackIdx]
  const H        = minimized ? HEADER_H : FULL_H

  return (
    <div
      ref={winRef}
      onMouseDown={onFocus}
      className="pixel-widget"
      style={{ position:'fixed', left:pos.x, top:pos.y, width:W, height:H, zIndex,
        filter:`drop-shadow(${FRAME_W}px ${FRAME_W}px 0 rgba(0,0,0,0.85))`,
        animation:'windowOpen 0.14s steps(3) both',
      }}
    >
      {/* ── Clipped content ── */}
      <div style={{
        position:'absolute', inset:0, clipPath:octClip(C), overflow:'hidden',
        display:'flex', flexDirection:'column',
      }}>

        {/* Title bar */}
        <div onMouseDown={onTitleDown} style={{
          height:HEADER_H, flexShrink:0,
          display:'flex', alignItems:'center', padding:'0 4px 0 8px', gap:4,
          background:HEADER_BG, borderBottom: minimized ? 'none' : '1px solid rgba(58,40,112,0.38)',
          cursor:'grab', userSelect:'none',
        }}>
          <span style={{ flex:1, fontSize:11, fontWeight:700, fontFamily:FONT,
            color:HEADER_TEXT, letterSpacing:'0.07em',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            MUSIC PLAYER
          </span>
          <div data-nodrag style={{ display:'flex', gap:2 }}>
            <div role="button" title={minimized ? 'Restore' : 'Minimize'}
              onClick={() => setMinimized(m => !m)}
              style={{ position:'relative', width:20, height:18,
                background:'#a8c8f0', border:`2px solid ${ART_BDR}`,
                boxSizing:'border-box', cursor:'pointer' }}>
              <div style={{ position:'absolute', left:4, top:6, width:8, height:2, background:BTN_IC }}/>
            </div>
            <div role="button" title="Close" onClick={onClose}
              style={{ position:'relative', width:20, height:18,
                background:'#f8a8b8', border:'2px solid #a82848',
                boxSizing:'border-box', cursor:'pointer' }}>
              <div style={{ position:'absolute', left:5, top:4, width:1, height:1,
                background:BTN_IC, boxShadow:CROSS }}/>
            </div>
          </div>
        </div>

        {/* Body */}
        {!minimized && (
          <div style={{ flex:1, background:BODY_BG, display:'flex', flexDirection:'column', overflow:'hidden' }}>

            {/* Artwork */}
            <div style={{ width:'100%', height:ART_H, flexShrink:0, position:'relative',
              borderBottom:`2px solid ${ART_BDR}`, overflow:'hidden' }}>
              {/* Blurred bg to fill gaps */}
              <img key={track.thumb + '-bg'} src={track.thumb} aria-hidden
                style={{ position:'absolute', inset:'-10px', width:'calc(100% + 20px)', height:'calc(100% + 20px)',
                  objectFit:'cover', filter:'blur(8px) brightness(0.6)', transform:'scale(1.05)' }}/>
              {/* Main image zoomed out */}
              <img key={track.thumb} src={track.thumb} alt={track.name}
                style={{ position:'absolute', inset:0, width:'100%', height:'100%',
                  objectFit:'contain', objectPosition:'center top', display:'block' }}/>
            </div>

            {/* Track name + dots */}
            <div style={{ padding:'7px 10px 0',
              display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <span style={{ fontSize:9, fontWeight:700, color:'rgba(200,185,255,0.85)',
                letterSpacing:'0.05em', whiteSpace:'nowrap', overflow:'hidden',
                textOverflow:'ellipsis', maxWidth:'72%', fontFamily:FONT }}>
                {track.name}
              </span>
              <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                {PLAYLIST.map((_, i) => (
                  <div key={i} onClick={() => setTrackIdx(i)} style={{
                    width:7, height:7,
                    background: i === trackIdx ? CTRL_FG : PROG_TRACK,
                    border:`1px solid ${ART_BDR}`, cursor:'pointer',
                  }}/>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div style={{ padding:'8px 10px 0',
              display:'flex', gap:6, alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <CtrlBtn onClick={prevTrack}><IconPrev /></CtrlBtn>
              <CtrlBtn onClick={togglePlay} active={playing} wide>
                {playing ? <IconPause /> : <IconPlay />}
              </CtrlBtn>
              <CtrlBtn onClick={nextTrack}><IconNext /></CtrlBtn>
            </div>

            {/* Progress */}
            <div style={{ padding:'8px 18px 0', display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
              <div
                style={{ flex:1, position:'relative', height:12, cursor:'pointer' }}
                onClick={(e) => {
                  const a = audioRef.current; if (!a) return
                  const r = e.currentTarget.getBoundingClientRect()
                  const v = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
                  if (isFinite(durationRef.current)) a.currentTime = v * durationRef.current
                }}
              >
                <div style={{
                  position:'absolute', left:0, right:0, top:3, height:6,
                  background:PROG_TRACK, border:`2px solid ${ART_BDR}`, boxSizing:'border-box',
                }}>
                  <div ref={progFillRef} style={{
                    position:'absolute', top:0, left:0, height:'100%', width:'0%', background:PROG_FILL,
                  }}/>
                </div>
                <div ref={progThumbRef} style={{
                  position:'absolute', top:1, left:'calc(0% - 5px)',
                  width:10, height:10,
                  background:PROG_THUMB, border:`2px solid ${ART_BDR}`,
                  boxSizing:'border-box', pointerEvents:'none',
                }}/>
              </div>
            </div>

            {/* Volume */}
            <div style={{ padding:'6px 18px 0', display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
              <div role="button" onClick={() => setMuted(m => !m)} style={{
                display:'flex', alignItems:'center', justifyContent:'center',
                width:30, height:22, flexShrink:0,
                background: muted ? '#e8a0c8' : CTRL_BG,
                border:`2px solid ${ART_BDR}`, boxSizing:'border-box', cursor:'pointer',
              }}>
                <IconVolume muted={muted}/>
              </div>
              <PixelSlider value={muted ? 0 : volume} fillColor={VOL_FILL} thumbColor={VOL_THUMB}
                onChange={(v) => { setVolume(v); if (muted) setMuted(false) }}/>
            </div>

          </div>
        )}
      </div>

      {/* SVG frame */}
      <svg width={W} height={H}
        style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'visible' }}
        shapeRendering="crispEdges">
        <path d={octPath(W, H, C, I)} fill="none" stroke={FRAME_COLOR} strokeWidth={FRAME_W}/>
        <path d={octPath(W, H, C+FRAME_W, I+FRAME_W)} fill="none" stroke="rgba(200,180,255,0.14)" strokeWidth={1}/>
      </svg>
    </div>
  )
})
