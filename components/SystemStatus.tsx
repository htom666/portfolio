'use client'

import { useState, useEffect, useRef, memo } from 'react'

// ─── Pixel palette ────────────────────────────────────────────────────────────

const FONT         = "'JetBrains Mono','Fira Code','Cascadia Code',ui-monospace,monospace"
const DEFAULT_LAT  = 34.77
const DEFAULT_LON  = 137.39
const DEFAULT_CITY = 'toyohashi'
const REFRESH_MS   = 15 * 60 * 1000

// ─── Layout constants (integer grid) ─────────────────────────────────────────

const W          = 260   // widget width
const HEADER_H   = 28    // title bar height
const C          = 8     // corner cut (px)
const I          = 2     // SVG stroke inset (= ceil(FRAME_W/2))
const ROW_H      = 30    // each data row height
const DIV_H      = 1     // divider between rows
const IP_BRD     = 2     // inner panel border width
const IP_PAD_V   = 6     // inner panel top/bottom padding
const IP_PAD_H   = 8     // inner panel left/right padding
const M_SIDES    = 4     // margin: inner panel ↔ outer frame
const M_GAP      = 2     // gap: header bottom ↔ inner panel top
const M_BOT      = 4     // gap: inner panel bottom ↔ outer frame

// Derived heights (all integers)
const IP_CONTENT = IP_PAD_V + 4 * ROW_H + 3 * DIV_H + IP_PAD_V  // 135
const IP_H       = IP_CONTENT + 2 * IP_BRD                        // 139
const H          = HEADER_H + M_GAP + IP_H + M_BOT                // 173

// ─── Colors ───────────────────────────────────────────────────────────────────

const FRAME_COLOR  = '#5a3e98'   // outer frame stroke (purple)
const FRAME_W      = 3
const HEADER_BG    = '#b09ecc'   // pastel purple (matches Terminal)
const HEADER_TEXT  = '#1a1040'   // title text (very dark)
const INNER_BG     = 'rgba(45,32,96,0.55)'   // dark purple inner panel
const INNER_BORDER = '#6040a0'   // inner panel border
const LABEL_C      = '#88c8d8'   // cyan label text
const VALUE_C      = '#f0f0f8'   // off-white value text
const DIV_C        = 'rgba(70,70,150,0.60)'
const BTN_IC       = '#180830'   // button icon colour

// ─── SVG helpers (pixel-stepped corners via shapeRendering=crispEdges) ────────

function octPath(w: number, h: number, c: number, ins: number): string {
  return `M ${c} ${ins} L ${w-c} ${ins} L ${w-ins} ${c} L ${w-ins} ${h-c} L ${w-c} ${h-ins} L ${c} ${h-ins} L ${ins} ${h-c} L ${ins} ${c} Z`
}

const OCT_CLIP = `polygon(${C}px 0, calc(100% - ${C}px) 0, 100% ${C}px, 100% calc(100% - ${C}px), calc(100% - ${C}px) 100%, ${C}px 100%, 0 calc(100% - ${C}px), 0 ${C}px)`

// ─── WMO weather code → condition ────────────────────────────────────────────

const WMO_MAP: Record<number, string> = {
  0: 'clear',
  1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast',
  45: 'fog', 48: 'icy fog',
  51: 'light drizzle', 53: 'drizzle', 55: 'heavy drizzle',
  56: 'freezing drizzle', 57: 'heavy freezing drizzle',
  61: 'light rain', 63: 'rain', 65: 'heavy rain',
  66: 'freezing rain', 67: 'heavy freezing rain',
  71: 'light snow', 73: 'snow', 75: 'heavy snow',
  77: 'snow grains',
  80: 'light showers', 81: 'showers', 82: 'heavy showers',
  85: 'snow showers', 86: 'heavy snow showers',
  95: 'thunderstorm', 96: 'thunderstorm + hail', 99: 'thunderstorm + hail',
}

function wmoToCondition(code: number): string {
  return WMO_MAP[code] ?? 'unknown'
}

// ─── Pixel weather icons ──────────────────────────────────────────────────────

const PX: React.CSSProperties = { imageRendering: 'pixelated', display: 'block', flexShrink: 0 }

function SunIcon() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" style={PX}>
      <rect x="6" y="0"  width="2" height="2" fill="#fde68a"/>
      <rect x="6" y="12" width="2" height="2" fill="#fde68a"/>
      <rect x="0" y="6"  width="2" height="2" fill="#fde68a"/>
      <rect x="12" y="6" width="2" height="2" fill="#fde68a"/>
      <rect x="2" y="2"  width="2" height="2" fill="#fde68a"/>
      <rect x="10" y="2" width="2" height="2" fill="#fde68a"/>
      <rect x="2" y="10" width="2" height="2" fill="#fde68a"/>
      <rect x="10" y="10" width="2" height="2" fill="#fde68a"/>
      <rect x="4" y="4"  width="6" height="6" fill="#fbbf24"/>
    </svg>
  )
}

function CloudIcon() {
  return (
    <svg viewBox="0 0 14 10" width="18" height="13" style={PX}>
      <rect x="3" y="0" width="4" height="2" fill="#b0c0e8"/>
      <rect x="1" y="2" width="12" height="6" fill="#c8d8f0"/>
      <rect x="2" y="8" width="10" height="2" fill="#c8d8f0"/>
    </svg>
  )
}

function RainIcon() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" style={PX}>
      <rect x="3" y="0"  width="4"  height="2" fill="#8090b8"/>
      <rect x="1" y="2"  width="12" height="4" fill="#9aa0cc"/>
      <rect x="2" y="6"  width="10" height="2" fill="#9aa0cc"/>
      <rect x="2" y="10" width="2"  height="2" fill="#67e8f9"/>
      <rect x="6" y="9"  width="2"  height="2" fill="#67e8f9"/>
      <rect x="10" y="10" width="2" height="2" fill="#67e8f9"/>
    </svg>
  )
}

function SnowIcon() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" style={PX}>
      <rect x="6" y="0"  width="2" height="14" fill="#bfdbfe"/>
      <rect x="0" y="6"  width="14" height="2" fill="#bfdbfe"/>
      <rect x="2" y="2"  width="2" height="2"  fill="#bfdbfe"/>
      <rect x="10" y="2" width="2" height="2"  fill="#bfdbfe"/>
      <rect x="2" y="10" width="2" height="2"  fill="#bfdbfe"/>
      <rect x="10" y="10" width="2" height="2" fill="#bfdbfe"/>
    </svg>
  )
}

function LightningIcon() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" style={PX}>
      <rect x="2" y="0"  width="4"  height="2" fill="#8090b8"/>
      <rect x="0" y="2"  width="14" height="3" fill="#9aa0cc"/>
      <rect x="1" y="5"  width="12" height="2" fill="#9aa0cc"/>
      <rect x="7" y="7"  width="3"  height="2" fill="#fde68a"/>
      <rect x="5" y="9"  width="3"  height="2" fill="#fde68a"/>
      <rect x="6" y="11" width="3"  height="2" fill="#fde68a"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 12 14" width="12" height="14" style={PX}>
      <rect x="4" y="0"  width="4" height="2" fill="#c4b5fd"/>
      <rect x="2" y="2"  width="6" height="2" fill="#c4b5fd"/>
      <rect x="2" y="4"  width="8" height="2" fill="#c4b5fd"/>
      <rect x="2" y="6"  width="8" height="2" fill="#c4b5fd"/>
      <rect x="2" y="8"  width="6" height="2" fill="#c4b5fd"/>
      <rect x="4" y="10" width="4" height="2" fill="#c4b5fd"/>
    </svg>
  )
}

function getWeatherIcon(condition: string): React.ReactNode {
  const c = condition.toLowerCase()
  const h = new Date().getHours()
  const night = h < 6 || h >= 20
  if (c.includes('thunder'))                                                              return <LightningIcon />
  if (c.includes('snow'))                                                                 return <SnowIcon />
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower') || c.includes('freezing')) return <RainIcon />
  if (c.includes('cloud') || c === 'overcast' || c.includes('fog'))                      return <CloudIcon />
  if (c.includes('clear') || c.includes('mainly clear'))                                 return night ? <MoonIcon /> : <SunIcon />
  return null
}

// ─── Pixel close X icon — box-shadow pixel art ────────────────────────────────
// 7×7 X in a 20×18 button (16×14 inner area), anchor at inner (5,4)

const crossShadow = [
  `1px 1px 0 0 ${BTN_IC}`, `2px 2px 0 0 ${BTN_IC}`, `3px 3px 0 0 ${BTN_IC}`,
  `4px 4px 0 0 ${BTN_IC}`, `5px 5px 0 0 ${BTN_IC}`, `6px 6px 0 0 ${BTN_IC}`,
  `6px 0 0 0 ${BTN_IC}`,   `5px 1px 0 0 ${BTN_IC}`, `4px 2px 0 0 ${BTN_IC}`,
  `2px 4px 0 0 ${BTN_IC}`, `1px 5px 0 0 ${BTN_IC}`, `0px 6px 0 0 ${BTN_IC}`,
].join(', ')

// ─── Row sub-component ────────────────────────────────────────────────────────

function DataRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      height: ROW_H,
      padding: `0 ${IP_PAD_H}px`,
      flexShrink: 0,
    }}>
      <span style={{
        color: LABEL_C, fontSize: 11, fontWeight: 700,
        letterSpacing: '0.06em', minWidth: 82, flexShrink: 0,
        fontFamily: FONT,
      }}>
        {label}:
      </span>
      <span style={{
        color: VALUE_C, fontSize: 11, fontWeight: 500,
        letterSpacing: '0.04em', fontFamily: FONT,
        display: 'flex', alignItems: 'center', gap: 6,
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
      }}>
        {value.toUpperCase()}
        {icon}
      </span>
    </div>
  )
}

function RowDiv() {
  return <div style={{ height: DIV_H, background: DIV_C, margin: `0 2px`, flexShrink: 0 }} />
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeatherState { city: string; condition: string; temp: number }
interface Props { theme: 'green' | 'white' }

// ─── Component ────────────────────────────────────────────────────────────────

export default memo(function SystemStatus({ theme: _theme }: Props) {
  const [time, setTime]         = useState('--:--:--')
  const [weather, setWeather]   = useState<WeatherState | null>(null)
  const [wStatus, setWStatus]   = useState<'loading' | 'ready' | 'error'>('loading')
  const [mounted, setMounted]   = useState(false)
  const [minimized, setMinimized] = useState(false)

  const coordsRef = useRef<{ lat: number; lon: number; city: string } | null>(null)

  // Fade-in on mount
  useEffect(() => { setMounted(true) }, [])

  // Clock — 1-second tick
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setTime(
        `${String(d.getHours()).padStart(2,'0')}:` +
        `${String(d.getMinutes()).padStart(2,'0')}:` +
        `${String(d.getSeconds()).padStart(2,'0')}`
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Weather
  useEffect(() => {
    async function reverseGeocode(lat: number, lon: number): Promise<string> {
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data = await res.json()
        const name = data.address?.city || data.address?.town || data.address?.village || DEFAULT_CITY
        return String(name).toLowerCase()
      } catch { return DEFAULT_CITY }
    }

    async function fetchWeather(lat: number, lon: number, city: string) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`
        )
        if (!res.ok) throw new Error('api error')
        const data = await res.json()
        const cw   = data.current_weather
        setWeather({ city, condition: wmoToCondition(cw.weathercode), temp: Math.round(cw.temperature) })
        setWStatus('ready')
      } catch { setWStatus('error') }
    }

    async function resolveCoords(): Promise<void> {
      if (coordsRef.current) return
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        coordsRef.current = { lat: DEFAULT_LAT, lon: DEFAULT_LON, city: DEFAULT_CITY }
        return
      }
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat  = pos.coords.latitude
            const lon  = pos.coords.longitude
            const city = await reverseGeocode(lat, lon)
            coordsRef.current = { lat, lon, city }
            resolve()
          },
          () => { coordsRef.current = { lat: DEFAULT_LAT, lon: DEFAULT_LON, city: DEFAULT_CITY }; resolve() },
          { timeout: 6000 }
        )
      })
    }

    async function init() {
      await resolveCoords()
      const c = coordsRef.current!
      await fetchWeather(c.lat, c.lon, c.city)
    }

    init()
    const id = setInterval(() => {
      const c = coordsRef.current
      if (c) fetchWeather(c.lat, c.lon, c.city)
    }, REFRESH_MS)
    return () => clearInterval(id)
  }, [])

  // ── Frame geometry — adapts when minimized ─────────────────────────────────
  const displayH  = minimized ? HEADER_H + 2 * C : H   // collapse to just header + corner space
  const framePath = octPath(W, displayH, C, I)

  // ── Row value helpers ──────────────────────────────────────────────────────
  const loading = wStatus === 'loading'
  const locVal  = weather?.city            ?? (loading ? '---' : 'N/A')
  const wthVal  = weather?.condition       ?? (loading ? '---' : 'N/A')
  const tmpVal  = weather ? `${weather.temp}\u00b0C` : (loading ? '---' : 'N/A')

  return (
    <div
      className="pixel-widget"
      style={{
        position:  'fixed',
        top:       14,
        right:     14,
        zIndex:    5,
        width:     W,
        height:    displayH,
        opacity:   mounted ? 1 : 0,
        transition: 'opacity 0.4s steps(4)',
        pointerEvents: 'none',
        userSelect: 'none',
        filter:    'drop-shadow(3px 3px 0 rgba(0,0,0,0.80))',
      }}
    >
      {/* ── Content clipped to pixel-stepped octagon ──────────────────── */}
      <div style={{
        position:   'absolute',
        inset:      0,
        clipPath:   OCT_CLIP,
        overflow:   'hidden',
        background: 'rgba(14,12,32,0.55)',   // semi-transparent dark fill
        fontFamily: FONT,
      }}>

        {/* ── Title bar ─────────────────────────────────────────────── */}
        <div style={{
          height:       HEADER_H,
          display:      'flex',
          alignItems:   'center',
          padding:      '0 4px 0 8px',
          gap:          4,
          background:   HEADER_BG,
          borderBottom: minimized ? 'none' : '1px solid rgba(60,60,140,0.38)',
          flexShrink:   0,
        }}>
          <span style={{
            flex: 1, fontSize: 11, fontWeight: 700,
            color: HEADER_TEXT, letterSpacing: '0.07em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            SYSTEM MONITOR
          </span>

          {/* Pixel control buttons — pointerEvents: all overrides parent none */}
          <div style={{ display: 'flex', gap: 2, alignItems: 'center', pointerEvents: 'all' }}>

            {/* Minimize — pastel lavender */}
            <div
              role="button" title={minimized ? 'Restore' : 'Minimize'}
              onClick={() => setMinimized(m => !m)}
              style={{
                position: 'relative', width: 20, height: 18,
                background: '#c8b0e8',
                border: '2px solid #7858b0',
                boxSizing: 'border-box',
                cursor: 'pointer', flexShrink: 0,
                imageRendering: 'pixelated',
              }}
            >
              {/* 8×2 bar centred in 16×14 inner area: left=(16-8)/2=4, top=(14-2)/2=6 */}
              <div style={{ position: 'absolute', left: 4, top: 6, width: 8, height: 2, background: BTN_IC }} />
            </div>

            {/* Close — pastel pink */}
            <div
              role="button" title="Close"
              onClick={() => setMinimized(true)}
              style={{
                position: 'relative', width: 20, height: 18,
                background: '#f0a8b0',
                border: '2px solid #a82848',
                boxSizing: 'border-box',
                cursor: 'pointer', flexShrink: 0,
                imageRendering: 'pixelated',
              }}
            >
              {/* X icon: 1×1 anchor at inner (5,4), box-shadow paints 7×7 pixel X */}
              <div style={{
                position: 'absolute', left: 5, top: 4,
                width: 1, height: 1,
                background: BTN_IC,
                imageRendering: 'pixelated',
                boxShadow: crossShadow,
              }} />
            </div>
          </div>
        </div>

        {/* ── Inner panel (dark monitor screen) ─────────────────────── */}
        {!minimized && (
          <div style={{
            margin:     `${M_GAP}px ${M_SIDES}px ${M_BOT}px`,
            height:     IP_H,
            background: INNER_BG,
            border:     `${IP_BRD}px solid ${INNER_BORDER}`,
            boxSizing:  'border-box',
            overflow:   'hidden',
            display:    'flex',
            flexDirection: 'column',
          }}>
            <div style={{ height: IP_PAD_V, flexShrink: 0 }} />
            <DataRow label="TIME"    value={time} />
            <RowDiv />
            <DataRow label="LOC"     value={locVal} />
            <RowDiv />
            <DataRow label="WEATHER" value={wthVal} icon={weather ? getWeatherIcon(weather.condition) : undefined} />
            <RowDiv />
            <DataRow label="TEMP"    value={tmpVal} />
            <div style={{ height: IP_PAD_V, flexShrink: 0 }} />
          </div>
        )}
      </div>

      {/* ── SVG pixel frame — crispEdges gives true pixel-staircase corners ── */}
      <svg
        width={W} height={displayH}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
        shapeRendering="crispEdges"
      >
        {/* Main 3px border */}
        <path d={framePath} fill="none" stroke={FRAME_COLOR} strokeWidth={FRAME_W} />
        {/* Faint inner highlight */}
        <path d={octPath(W, displayH, C + FRAME_W, I + FRAME_W)}
              fill="none" stroke="rgba(190,210,255,0.20)" strokeWidth={1} />
      </svg>
    </div>
  )
})
