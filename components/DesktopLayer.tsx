'use client'

import { useState, memo } from 'react'
import PixelCharacter from './PixelCharacter'

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT = "'JetBrains Mono','Fira Code','Cascadia Code',ui-monospace,monospace"
const SZ   = 48   // render size for every icon (px)

// ─── Palette — sampled from the reference images ──────────────────────────────
//
// All colours are close matches to the actual pixel values in the .png files.
// The icons share a single consistent palette.

const OUT = '#2a1858'   // dark outline (used by all icons)


const PX = { imageRendering: 'pixelated' as const, display: 'block' as const }

// ─── Pixel-art icons ──────────────────────────────────────────────────────────
// Every icon uses viewBox="0 0 24 24", rendered at SZ×SZ.
// shapeRendering="crispEdges" disables all anti-aliasing.

function FolderIcon() {
  return (
    <img
      src="/icons/desk.png"
      width={SZ}
      height={SZ}
      alt="projects"
      style={{ ...PX, width: SZ, height: SZ }}
    />
  )
}

function TextIcon() {
  return (
    <img
      src="/icons/about.png"
      width={43}
      height={43}
      alt="about"
      style={{ ...PX, width: 43, height: 43 }}
    />
  )
}

function TerminalIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <img
      src={isOpen ? '/icons/folderopen.png' : '/icons/folderclosed.png'}
      width={SZ}
      height={38}
      alt="skills"
      style={{ ...PX, width: SZ, height: 38 }}
    />
  )
}

function MailIcon() {
  return (
    <img
      src="/icons/contact.png"
      width={SZ}
      height={SZ}
      alt="contact"
      style={{ ...PX, width: SZ, height: SZ }}
    />
  )
}

function MusicIcon() {
  return (
    <img
      src="/icons/play.png"
      width={SZ}
      height={SZ}
      alt="music"
      style={{ ...PX, width: SZ, height: SZ }}
    />
  )
}

// ─── Desktop item ─────────────────────────────────────────────────────────────

interface ItemProps {
  Icon:    () => React.JSX.Element
  label:   string
  onClick: () => void
}

function DesktopItem({ Icon, label, onClick }: ItemProps) {
  const [hovered,  setHovered]  = useState(false)
  const [selected, setSelected] = useState(false)

  const handleClick = () => {
    setSelected(true)
    setTimeout(() => setSelected(false), 200)
    onClick()
  }

  const active = hovered || selected

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false) }}
      title={label}
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            4,
        background:     active ? 'rgba(100,80,200,0.14)' : 'transparent',
        border:         `1px solid ${active ? 'rgba(196,181,253,0.32)' : 'transparent'}`,
        borderRadius:   0,
        cursor:         'pointer',
        padding:        '7px 6px 6px',
        outline:        'none',
        width:          72,
        userSelect:     'none',
      }}
    >
      {/* Icon */}
      <div style={{
        width:          SZ,
        height:         SZ,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        filter: selected
          ? 'brightness(0.84) drop-shadow(1px 1px 0 rgba(0,0,0,0.55))'
          : hovered
          ? 'brightness(1.07) drop-shadow(0 0 5px rgba(196,181,253,0.50))'
          : 'drop-shadow(1px 2px 0 rgba(0,0,0,0.68))',
        transform: selected ? 'translateY(1px)' : 'none',
      }}>
        <Icon />
      </div>

      {/* Label */}
      <span style={{
        fontFamily:    FONT,
        fontSize:      9,
        fontWeight:    600,
        color:         active ? 'rgba(240,232,255,0.98)' : 'rgba(210,200,250,0.80)',
        background:    active ? 'rgba(80,60,180,0.38)'   : 'transparent',
        padding:       active ? '0 3px' : '0',
        textAlign:     'center',
        lineHeight:    1.35,
        textShadow:    '0 1px 5px rgba(0,0,0,0.99), 1px 1px 0 rgba(0,0,0,0.85)',
        letterSpacing: '0.04em',
        maxWidth:      66,
        wordBreak:     'break-all',
      }}>
        {label}
      </span>
    </button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onOpenFolder:      (folderId: string) => void
  onOpenMusicPlayer: () => void
  openFolderIds:     string[]
}

export default memo(function DesktopLayer({ onOpenFolder, onOpenMusicPlayer, openFolderIds }: Props) {
  const skillsOpen = openFolderIds.includes('skills')
  const items: ItemProps[] = [
    { Icon: FolderIcon,                              label: 'projects/',   onClick: () => onOpenFolder('projects') },
    { Icon: TextIcon,                                label: 'about.txt',   onClick: () => onOpenFolder('about')    },
    { Icon: () => <TerminalIcon isOpen={skillsOpen} />, label: 'skills.sh',   onClick: () => onOpenFolder('skills')   },
    { Icon: MailIcon,                                label: 'contact.lnk', onClick: () => onOpenFolder('contact')  },
    { Icon: MusicIcon,                               label: 'music.sys',   onClick: onOpenMusicPlayer              },
  ]

  return (
    <>
      {/* ── Desktop icon column — top-left ────────────────────────────────── */}
      <div
        className="hidden sm:flex"
        style={{
          position:      'fixed',
          left:          12,
          top:           16,
          zIndex:        3,
          flexDirection: 'column',
          alignItems:    'center',
          gap:           2,
        }}
      >
        {items.map(({ Icon, label, onClick }) => (
          <DesktopItem key={label} Icon={Icon} label={label} onClick={onClick} />
        ))}
      </div>

      {/* ── Animated pixel character — self-positioned ─────────────────────── */}
      <PixelCharacter />
    </>
  )
})
