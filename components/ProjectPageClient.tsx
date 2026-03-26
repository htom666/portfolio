'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import ImageLightbox from './ImageLightbox'
import type { Project, ProjectImage } from '@/data/portfolio'

// ─── Design tokens (fixed on project pages — no theme toggle) ─────────────────

const FONT = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace"
const BG = '#0c0c14'
const TEXT = '#c8c8d8'
const ACCENT = '#50fa7b'
const ACCENT_SOFT = '#a3ffb0'
const DIM = 'rgba(200,200,220,0.35)'
const BORDER = 'rgba(255,255,255,0.07)'

// ─── Small shared primitives ──────────────────────────────────────────────────

function HR() {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: `1px solid ${BORDER}`,
        margin: '2.5rem 0',
      }}
    />
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: FONT,
        fontSize: '10px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: TEXT,
        opacity: 0.28,
        marginBottom: '0.6rem',
      }}
    >
      {children}
    </p>
  )
}

// ─── Image frame ─────────────────────────────────────────────────────────────

function ImageFrame({
  image,
  onExpand,
}: {
  image: ProjectImage
  onExpand: (src: string, filename: string) => void
}) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div>
      {/* Filename + label */}
      <p
        style={{
          fontFamily: FONT,
          fontSize: '11px',
          color: TEXT,
          opacity: 0.3,
          marginBottom: '8px',
        }}
      >
        {image.filename}
        <span style={{ opacity: 0.6 }}> / {image.label}</span>
      </p>

      {/* Image container */}
      <div
        className="relative group overflow-hidden"
        style={{
          border: `1px solid ${BORDER}`,
          cursor: status === 'loaded' ? 'zoom-in' : 'default',
          background: 'rgba(255,255,255,0.015)',
        }}
        onClick={() => status === 'loaded' && onExpand(image.src, image.filename)}
      >
        {/* Loading placeholder */}
        {status === 'loading' && (
          <div
            style={{
              height: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{ fontFamily: FONT, fontSize: '11px', color: TEXT, opacity: 0.15 }}
            >
              loading...
            </span>
          </div>
        )}

        {/* Error placeholder */}
        {status === 'error' && (
          <div
            style={{
              height: '160px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '0 1rem',
              textAlign: 'center',
            }}
          >
            <span
              style={{ fontFamily: FONT, fontSize: '11px', color: TEXT, opacity: 0.2 }}
            >
              image unavailable
            </span>
            <span
              style={{
                fontFamily: FONT,
                fontSize: '10px',
                color: TEXT,
                opacity: 0.12,
                wordBreak: 'break-all',
              }}
            >
              {image.src}
            </span>
          </div>
        )}

        {/* Actual image */}
        <img
          src={image.src}
          alt={image.label}
          loading="lazy"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          style={{
            display: status === 'loaded' ? 'block' : 'none',
            width: '100%',
          }}
        />

        {/* Expand hover overlay */}
        {status === 'loaded' && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <span
              style={{
                fontFamily: FONT,
                fontSize: '11px',
                color: ACCENT_SOFT,
                border: `1px solid rgba(163,255,176,0.25)`,
                padding: '4px 10px',
              }}
            >
              → expand
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main page component ──────────────────────────────────────────────────────

interface Props {
  project: Project
  allProjects: Project[]
}

export default function ProjectPageClient({ project, allProjects }: Props) {
  const [lightbox, setLightbox] = useState<{
    src: string
    filename: string
  } | null>(null)

  // Project page needs the body to scroll (globals.css sets overflow:hidden for terminal)
  useEffect(() => {
    document.body.style.overflow = 'auto'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const openLightbox = useCallback((src: string, filename: string) => {
    setLightbox({ src, filename })
  }, [])

  const closeLightbox = useCallback(() => {
    setLightbox(null)
    // Re-apply scroll since ImageLightbox cleanup clears it
    document.body.style.overflow = 'auto'
  }, [])

  const currentIdx = allProjects.findIndex((p) => p.id === project.id)
  const prevProject = currentIdx > 0 ? allProjects[currentIdx - 1] : null
  const nextProject =
    currentIdx < allProjects.length - 1 ? allProjects[currentIdx + 1] : null

  const sharedText: React.CSSProperties = {
    fontFamily: FONT,
    color: TEXT,
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', ...sharedText }}>

      {/* ── Sticky nav bar ───────────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(12,12,20,0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${BORDER}`,
          padding: '0.65rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Breadcrumb path */}
        <p style={{ fontSize: '11px', color: TEXT, opacity: 0.45 }}>
          <span style={{ color: ACCENT, opacity: 0.8 }}>tom@portfolio</span>
          <span style={{ opacity: 0.4 }}>:</span>
          <span style={{ color: ACCENT_SOFT, opacity: 0.6 }}>
            ~/projects/{project.slug}
          </span>
        </p>

        {/* Back link */}
        <Link
          href="/"
          style={{
            fontSize: '11px',
            color: TEXT,
            opacity: 0.4,
            textDecoration: 'none',
            fontFamily: FONT,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.opacity = '0.9')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.opacity = '0.4')
          }
        >
          ← portfolio
        </Link>
      </nav>

      {/* ── Page content ─────────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: '3rem 1.5rem 5rem',
        }}
      >

        {/* Terminal echo line */}
        <div
          style={{
            fontSize: '12px',
            color: TEXT,
            opacity: 0.3,
            marginBottom: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          <span>&gt; opening project: {project.title.toLowerCase()}</span>
          <span
            style={{
              display: 'inline-block',
              width: '7px',
              height: '13px',
              background: ACCENT,
              opacity: 0.5,
              marginLeft: '2px',
              animation: 'blink 1.1s step-end infinite',
            }}
          />
        </div>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {project.title}
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: TEXT,
              opacity: 0.45,
              marginTop: '0.5rem',
            }}
          >
            {project.tagline}
          </p>

          {/* Meta table */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1.25rem 2rem',
              marginTop: '2rem',
            }}
          >
            {[
              { label: 'category', value: project.category },
              { label: 'role', value: project.role },
              { label: 'year', value: project.year },
              { label: 'tools', value: project.tech.join(' · ') },
            ].map(({ label, value }) => (
              <div key={label}>
                <Label>{label}</Label>
                <p style={{ fontSize: '0.8rem', color: TEXT, opacity: 0.82 }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <HR />

        {/* ── Content sections ─────────────────────────────────────────────── */}
        <section style={{ display: 'grid', gap: '2rem' }}>
          {[
            { label: 'overview', value: project.summary },
            { label: 'problem', value: project.problem },
            { label: 'solution', value: project.solution },
            { label: 'outcome', value: project.outcome },
          ].map(({ label, value }) => (
            <div key={label}>
              <Label>{label}</Label>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: TEXT,
                  opacity: 0.8,
                  lineHeight: 1.75,
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </section>

        {/* ── Gallery ──────────────────────────────────────────────────────── */}
        {project.images.length > 0 && (
          <>
            <HR />
            <section>
              <Label>gallery</Label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    project.images.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '2rem',
                  marginTop: '1rem',
                }}
              >
                {project.images.map((img) => (
                  <ImageFrame
                    key={img.filename}
                    image={img}
                    onExpand={openLightbox}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {/* ── Tech stack ───────────────────────────────────────────────────── */}
        <HR />
        <section>
          <Label>tech stack</Label>
          <div style={{ display: 'grid', gap: '0.6rem', marginTop: '0.5rem' }}>
            {project.stack.map((item) => (
              <div
                key={item.name}
                style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}
              >
                <span
                  style={{
                    color: TEXT,
                    opacity: 0.85,
                    minWidth: '140px',
                    fontWeight: 600,
                  }}
                >
                  {item.name}
                </span>
                <span style={{ color: TEXT, opacity: 0.4 }}>{item.role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Links ────────────────────────────────────────────────────────── */}
        {project.caseStudyUrl && (
          <>
            <HR />
            <section>
              <Label>links</Label>
              <div style={{ marginTop: '0.5rem' }}>
                <a
                  href={project.caseStudyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: FONT,
                    fontSize: '0.8rem',
                    color: ACCENT_SOFT,
                    opacity: 0.7,
                    textDecoration: 'none',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.opacity = '1')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.opacity = '0.7')
                  }
                >
                  → {project.caseStudyUrl}
                </a>
              </div>
            </section>
          </>
        )}

        {/* ── Prev / Next navigation ───────────────────────────────────────── */}
        <HR />
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '2rem',
          }}
        >
          {prevProject ? (
            <Link
              href={`/projects/${prevProject.slug}`}
              style={{ textDecoration: 'none', flex: 1 }}
            >
              <div
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget.querySelector('.nav-title') as HTMLElement
                  if (el) el.style.opacity = '1'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget.querySelector('.nav-title') as HTMLElement
                  if (el) el.style.opacity = '0.65'
                }}
              >
                <p
                  style={{
                    fontFamily: FONT,
                    fontSize: '10px',
                    color: TEXT,
                    opacity: 0.3,
                    marginBottom: '4px',
                    letterSpacing: '0.08em',
                  }}
                >
                  ← prev
                </p>
                <p
                  className="nav-title"
                  style={{
                    fontFamily: FONT,
                    fontSize: '0.8rem',
                    color: TEXT,
                    opacity: 0.65,
                    transition: 'opacity 0.15s',
                  }}
                >
                  {prevProject.title}
                </p>
              </div>
            </Link>
          ) : (
            <div style={{ flex: 1 }} />
          )}

          {nextProject ? (
            <Link
              href={`/projects/${nextProject.slug}`}
              style={{ textDecoration: 'none', flex: 1, textAlign: 'right' }}
            >
              <div
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget.querySelector('.nav-title') as HTMLElement
                  if (el) el.style.opacity = '1'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget.querySelector('.nav-title') as HTMLElement
                  if (el) el.style.opacity = '0.65'
                }}
              >
                <p
                  style={{
                    fontFamily: FONT,
                    fontSize: '10px',
                    color: TEXT,
                    opacity: 0.3,
                    marginBottom: '4px',
                    letterSpacing: '0.08em',
                  }}
                >
                  next →
                </p>
                <p
                  className="nav-title"
                  style={{
                    fontFamily: FONT,
                    fontSize: '0.8rem',
                    color: TEXT,
                    opacity: 0.65,
                    transition: 'opacity 0.15s',
                  }}
                >
                  {nextProject.title}
                </p>
              </div>
            </Link>
          ) : (
            <div style={{ flex: 1 }} />
          )}
        </nav>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────────── */}
      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          filename={lightbox.filename}
          theme="green"
          onClose={closeLightbox}
        />
      )}
    </div>
  )
}
