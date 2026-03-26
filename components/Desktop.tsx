'use client'

import { useState, useRef, useCallback, useId } from 'react'
import Background from './Background'
import DesktopLayer from './DesktopLayer'
import SystemStatus from './SystemStatus'
import Terminal from './Terminal'
import OsWindow from './OsWindow'
import FolderView from './FolderView'
import TextFileView from './TextFileView'
import ProjectWindow from './ProjectWindow'
import { OS_FOLDERS, getFolderById, getFileById } from '@/lib/osData'
import { PROJECTS } from '@/data/portfolio'
import PixelMusicPlayer from './PixelMusicPlayer'

// ─── Types ────────────────────────────────────────────────────────────────────

type WinKind = 'folder' | 'textfile' | 'project'

interface OsWin {
  id: string
  kind: WinKind
  // kind-specific payload
  folderId?: string
  fileId?: string
  projectId?: number
  // window chrome
  position: { x: number; y: number }
  zIndex: number
}

type Theme = 'green' | 'white'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function centred(ww: number, wh: number, offset = 0) {
  const vw = typeof window !== 'undefined' ? window.innerWidth  : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  return {
    x: Math.max(10, Math.floor(vw / 2 - ww / 2 + offset * 28)),
    y: Math.max(10, Math.floor(vh / 2 - wh / 2 + offset * 24)),
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Desktop() {
  const [theme, setTheme] = useState<Theme>('green')
  const [wins, setWins] = useState<OsWin[]>([])
  const [termZ, setTermZ]           = useState(10)
  const [musicOpen, setMusicOpen]   = useState(true)
  const [musicZ, setMusicZ]         = useState(15)

  const maxZRef = useRef(20)
  const uid = useId()
  const winSeq = useRef(0)

  const nextId = () => `${uid}-${++winSeq.current}`

  const nextZ = () => {
    maxZRef.current += 1
    return maxZRef.current
  }

  // ── Focus ──────────────────────────────────────────────────────────────────

  const focusWin = useCallback((id: string) => {
    const z = nextZ()
    setWins((prev) => prev.map((w) => w.id === id ? { ...w, zIndex: z } : w))
  }, [])

  const focusTerminal = useCallback(() => {
    setTermZ(nextZ())
  }, [])

  const openMusicPlayer = useCallback(() => {
    const z = nextZ()
    setMusicZ(z)
    setMusicOpen(true)
  }, [])

  const focusMusicPlayer = useCallback(() => {
    setMusicZ(nextZ())
  }, [])

  const closeWin = useCallback((id: string) => {
    setWins((prev) => prev.filter((w) => w.id !== id))
  }, [])

  // ── Open helpers ───────────────────────────────────────────────────────────

  const openFolder = useCallback((folderId: string) => {
    const newId = nextId()
    const newZ  = nextZ()
    setWins((prev) => {
      const existing = prev.find((w) => w.kind === 'folder' && w.folderId === folderId)
      if (existing) return prev.map((w) => (w.id === existing.id ? { ...w, zIndex: newZ } : w))
      return [...prev, { id: newId, kind: 'folder' as const, folderId, position: centred(360, 260, prev.length), zIndex: newZ }]
    })
  }, [])

  const openTextFile = useCallback((fileId: string) => {
    const newId = nextId()
    const newZ  = nextZ()
    setWins((prev) => {
      const existing = prev.find((w) => w.kind === 'textfile' && w.fileId === fileId)
      if (existing) return prev.map((w) => (w.id === existing.id ? { ...w, zIndex: newZ } : w))
      return [...prev, { id: newId, kind: 'textfile' as const, fileId, position: centred(420, 340, prev.length), zIndex: newZ }]
    })
  }, [])

  const openProject = useCallback((projectId: number) => {
    const newId = nextId()
    const newZ  = nextZ()
    setWins((prev) => {
      const existing = prev.find((w) => w.kind === 'project' && w.projectId === projectId)
      if (existing) return prev.map((w) => (w.id === existing.id ? { ...w, zIndex: newZ } : w))
      return [...prev, { id: newId, kind: 'project' as const, projectId, position: centred(680, 560, prev.length), zIndex: newZ }]
    })
  }, [])

  // ── Folder icon click → open folder ───────────────────────────────────────

  const handleDesktopFolderOpen = useCallback((folderId: string) => {
    openFolder(folderId)
  }, [openFolder])

  // ── Terminal "open N" ──────────────────────────────────────────────────────

  const handleOpenProjectFromTerminal = useCallback((projectId: number) => {
    openProject(projectId)
  }, [openProject])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Background />

      {/* Desktop icon column + pixel mascot */}
      <DesktopLayer
        onOpenFolder={handleDesktopFolderOpen}
        onOpenMusicPlayer={openMusicPlayer}
        openFolderIds={wins.filter((w) => w.kind === 'folder').map((w) => w.folderId!)}
      />

      {/* System status */}
      <SystemStatus theme={theme} />

      {/* Main terminal — draggable */}
      <Terminal
        theme={theme}
        onThemeChange={setTheme}
        zIndex={termZ}
        onFocus={focusTerminal}
        onOpenProject={handleOpenProjectFromTerminal}
      />

      {/* Music player */}
      {musicOpen && (
        <PixelMusicPlayer
          initialPosition={{ x: 24, y: 80 }}
          zIndex={musicZ}
          onClose={() => setMusicOpen(false)}
          onFocus={focusMusicPlayer}
        />
      )}

      {/* OS windows */}
      {wins.map((win) => {
        if (win.kind === 'folder') {
          const folder = getFolderById(win.folderId!)
          if (!folder) return null
          return (
            <OsWindow
              key={win.id}
              title={folder.name}
              width={360}
              minHeight={140}
              initialPosition={win.position}
              zIndex={win.zIndex}
              onClose={() => closeWin(win.id)}
              onFocus={() => focusWin(win.id)}
            >
              <FolderView
                folder={folder}
                onOpenFile={openTextFile}
                onOpenProject={openProject}
              />
            </OsWindow>
          )
        }

        if (win.kind === 'textfile') {
          const file = getFileById(win.fileId!)
          if (!file || !file.content) return null
          return (
            <OsWindow
              key={win.id}
              title={file.name}
              width={420}
              minHeight={220}
              initialPosition={win.position}
              zIndex={win.zIndex}
              onClose={() => closeWin(win.id)}
              onFocus={() => focusWin(win.id)}
            >
              <TextFileView content={file.content} />
            </OsWindow>
          )
        }

        if (win.kind === 'project') {
          const project = PROJECTS.find((p) => p.id === win.projectId)
          if (!project) return null
          return (
            <ProjectWindow
              key={win.id}
              project={project}
              initialPosition={win.position}
              zIndex={win.zIndex}
              onClose={() => closeWin(win.id)}
              onFocus={() => focusWin(win.id)}
            />
          )
        }

        return null
      })}
    </>
  )
}
