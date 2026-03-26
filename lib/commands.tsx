'use client'

import React, { useEffect } from 'react'
import {
  WHOAMI_LINES,
  ABOUT,
  SKILLS,
  PROJECTS,
  EXPERIENCE,
  CONTACT,
} from '@/data/portfolio'

// ─── Types ────────────────────────────────────────────────────────────────────

export type RunCommand = (cmd: string) => void

export const COMMAND_LIST = [
  'help',
  'whoami',
  'about',
  'skills',
  'projects',
  'open',
  'experience',
  'contact',
  'resume',
  'theme',
  'clear',
]

export const COMMAND_DESCRIPTIONS: Record<string, string> = {
  help:        'show available commands',
  whoami:      'short introduction',
  about:       'background and interests',
  skills:      'technical and design skills',
  projects:    'list all projects',
  'open [n]':  'open project page',
  experience:  'work and academic history',
  contact:     'contact information',
  resume:      'open resume (PDF)',
  theme:       'toggle color theme',
  clear:       'clear terminal output',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeBar(level: number): string {
  const total = 20
  const filled = Math.round((level / 100) * total)
  return '█'.repeat(filled) + '░'.repeat(total - filled)
}

function Divider() {
  return <div className="border-t border-white/[0.07] my-3" />
}

// ─── Resume component ─────────────────────────────────────────────────────────

function ResumeOutput() {
  useEffect(() => {
    const t = setTimeout(() => window.open('/resume.pdf', '_blank'), 150)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="space-y-2">
      <p className="opacity-70">Opening resume…</p>
      <a
        href="/resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="underline opacity-60 hover:opacity-100 transition-opacity"
      >
        → /resume.pdf
      </a>
      <p className="opacity-40 text-xs mt-1">
        If it didn&apos;t open automatically, click the link above.
      </p>
    </div>
  )
}

// ─── Command renderers ────────────────────────────────────────────────────────

function renderHelp() {
  return (
    <div className="space-y-1">
      <p className="opacity-40 text-xs mb-3 uppercase tracking-widest">
        hatem@portfolio — terminal portfolio v1.0
      </p>
      {Object.entries(COMMAND_DESCRIPTIONS).map(([cmd, desc]) => (
        <div key={cmd} className="flex gap-4 text-sm">
          <span className="w-28 shrink-0 font-semibold">{cmd}</span>
          <span className="opacity-55">{desc}</span>
        </div>
      ))}
      <p className="opacity-30 text-xs mt-4">
        ↑↓ history · tab autocomplete · click commands below
      </p>
    </div>
  )
}

function renderWhoami() {
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {WHOAMI_LINES.map((line, i) => (
        <p key={i} className={i === 0 ? 'font-semibold' : 'opacity-75'}>
          {line}
        </p>
      ))}
    </div>
  )
}

function renderAbout() {
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {ABOUT.split('\n\n').map((para, i) => (
        <p key={i} className="opacity-80">
          {para}
        </p>
      ))}
    </div>
  )
}

function renderSkills() {
  return (
    <div className="space-y-5 text-sm">
      {SKILLS.map((cat) => (
        <div key={cat.category}>
          <p className="opacity-35 text-xs uppercase tracking-widest mb-2.5">
            {cat.category}
          </p>
          <div className="space-y-2">
            {cat.skills.map((skill) => (
              <div key={skill.name} className="flex items-center gap-3">
                <span className="w-28 text-right opacity-65 text-xs">
                  {skill.name}
                </span>
                <span className="tracking-[0.05em] opacity-75 text-[11px] leading-none">
                  {makeBar(skill.level)}
                </span>
                <span className="opacity-35 text-xs w-8">{skill.level}%</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function renderProjects(run: RunCommand) {
  return (
    <div className="text-sm">
      <p className="opacity-35 text-xs mb-4">
        {PROJECTS.length} projects · type &quot;open [n]&quot; or click to open
      </p>
      <div>
        {PROJECTS.map((project, i) => (
          <React.Fragment key={project.id}>
            <button
              className="text-left w-full group py-2"
              style={{ opacity: 0.85 }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = '1')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = '0.85')
              }
              onClick={() => run(`open ${project.id}`)}
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 font-mono" style={{ opacity: 0.28 }}>
                  [{project.id}]
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-semibold group-hover:underline underline-offset-2">
                      {project.title}
                    </p>
                    <span className="text-xs shrink-0" style={{ opacity: 0.3 }}>
                      {project.year}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ opacity: 0.45 }}>
                    {project.tagline}
                  </p>
                  <p className="text-xs mt-1" style={{ opacity: 0.25 }}>
                    {project.category} · {project.tech.join(', ')}
                  </p>
                </div>
              </div>
            </button>
            {i < PROJECTS.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function renderExperience() {
  return (
    <div className="text-sm space-y-0">
      {EXPERIENCE.map((exp, i) => (
        <React.Fragment key={i}>
          <div className="py-2">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-semibold">{exp.role}</p>
                <p className="opacity-50 text-xs mt-0.5">{exp.org}</p>
              </div>
              <p className="opacity-35 text-xs shrink-0">{exp.period}</p>
            </div>
            <ul className="mt-2.5 space-y-1">
              {exp.lines.map((line, j) => (
                <li key={j} className="flex gap-2 opacity-65">
                  <span className="shrink-0 opacity-50">·</span>
                  <span className="leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
          </div>
          {i < EXPERIENCE.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </div>
  )
}

function renderContact() {
  const items = [
    { label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { label: 'GitHub', value: CONTACT.github, href: `https://${CONTACT.github}` },
    { label: 'LinkedIn', value: CONTACT.linkedin, href: `https://${CONTACT.linkedin}` },
    { label: 'Twitter', value: CONTACT.twitter, href: undefined },
  ]
  return (
    <div className="text-sm space-y-2">
      {items.map(({ label, value, href }) =>
        value ? (
          <div key={label} className="flex gap-4 items-baseline">
            <span className="w-16 opacity-35 text-xs uppercase tracking-wider shrink-0">
              {label}
            </span>
            {href ? (
              <a
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="opacity-75 hover:opacity-100 underline underline-offset-2 transition-opacity"
              >
                {value}
              </a>
            ) : (
              <span className="opacity-75">{value}</span>
            )}
          </div>
        ) : null
      )}
    </div>
  )
}

// ─── Main dispatcher ───────────────────────────────────────────────────────────
// Note: `open [n]` is intercepted in Terminal.tsx before reaching here.

export function processCommand(
  input: string,
  run: RunCommand
): React.ReactNode {
  const parts = input.trim().toLowerCase().split(/\s+/)
  const cmd = parts[0]

  switch (cmd) {
    case 'help':
      return renderHelp()
    case 'whoami':
      return renderWhoami()
    case 'about':
      return renderAbout()
    case 'skills':
      return renderSkills()
    case 'projects':
      return renderProjects(run)
    case 'experience':
      return renderExperience()
    case 'contact':
      return renderContact()
    case 'resume':
      return <ResumeOutput />
    default:
      return (
        <div className="text-sm">
          <p>
            <span className="opacity-40">command not found:</span>{' '}
            <span>{cmd}</span>
          </p>
          <p className="opacity-35 text-xs mt-1">
            Type &quot;help&quot; to see available commands.
          </p>
        </div>
      )
  }
}
