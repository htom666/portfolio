'use client'

export default function Background() {
  return (
    <>
      {/* ── Wallpaper ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <video
          src="/background.mp4"
          autoPlay loop muted playsInline preload="auto"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* ── Atmospheric overlay ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: [
          'radial-gradient(ellipse at 50% 0%,   rgba(6,4,16,0.26) 0%, transparent 65%)',
          'radial-gradient(ellipse at 50% 100%, rgba(6,4,16,0.40) 0%, transparent 65%)',
          'linear-gradient(to left,  rgba(6,4,16,0.38) 0%, rgba(6,4,16,0.12) 45%, transparent 70%)',
          'linear-gradient(to right, rgba(6,4,16,0.14) 0%, transparent 40%)',
          'linear-gradient(180deg, rgba(6,4,16,0.20) 0%, rgba(6,4,16,0.12) 50%, rgba(6,4,16,0.26) 100%)',
        ].join(', '),
        pointerEvents: 'none',
      }} />
    </>
  )
}
