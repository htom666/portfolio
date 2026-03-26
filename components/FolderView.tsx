'use client'

import { memo } from 'react'
import type { OsFolder, OsFile } from '@/lib/osData'

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace"

// ─── Pixel icon for file types ────────────────────────────────────────────────

function FileIcon() {
  return (
    <img
      src="/icons/project.png"
      width={28}
      height={28}
      alt="file"
      style={{ imageRendering: 'pixelated', display: 'block' }}
    />
  )
}

// ─── File item ────────────────────────────────────────────────────────────────

interface FileItemProps {
  file: OsFile
  onClick: () => void
}

function FileItem({ file, onClick }: FileItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        padding: '8px 6px 6px',
        width: 80,
        background: 'transparent',
        border: '1px solid transparent',
        borderRadius: 0,
        cursor: 'pointer',
        transition: 'background 0.12s, border-color 0.12s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.background = 'rgba(82,64,168,0.18)'
        el.style.borderColor = 'rgba(196,181,253,0.30)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = 'transparent'
        el.style.borderColor = 'transparent'
      }}
    >
      <div style={{ height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FileIcon />
      </div>
      <span style={{
        fontFamily: FONT,
        fontSize: 9,
        color: 'rgba(196,181,253,0.75)',
        textAlign: 'center',
        lineHeight: 1.3,
        wordBreak: 'break-all',
        userSelect: 'none',
        maxWidth: 70,
      }}>
        {file.name}
      </span>
    </button>
  )
}

// ─── Folder view ──────────────────────────────────────────────────────────────

interface Props {
  folder: OsFolder
  onOpenFile: (fileId: string) => void
  onOpenProject: (projectId: number) => void
}

export default memo(function FolderView({ folder, onOpenFile, onOpenProject }: Props) {
  return (
    <div style={{ padding: '10px 12px' }}>
      {/* Path bar */}
      <div style={{
        fontFamily: FONT,
        fontSize: 9,
        color: 'rgba(196,181,253,0.35)',
        marginBottom: 10,
        letterSpacing: '0.06em',
      }}>
        ~/desktop/{folder.id}/
      </div>

      {/* File grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {folder.files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onClick={() => {
              if (file.kind === 'project' && file.projectId != null) {
                onOpenProject(file.projectId)
              } else {
                onOpenFile(file.id)
              }
            }}
          />
        ))}
      </div>
    </div>
  )
})
