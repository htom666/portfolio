// ─── OS file-system types ─────────────────────────────────────────────────────

export type OsFileKind = 'txt' | 'sh' | 'lnk' | 'project'

export interface OsFile {
  id: string
  name: string          // display filename (e.g. "about_me.txt")
  kind: OsFileKind
  content?: string      // for txt/sh files , plain text rendered in notepad
  projectId?: number    // for project shortcut files
}

export interface OsFolder {
  id: string
  name: string          // folder label (e.g. "about/")
  files: OsFile[]
}

// ─── Text content ────────────────────────────────────────────────────────────

const ABOUT_ME_TXT = `about_me.txt
─────────────────────────────────────────────

Background in design and computer science,
with a focus on how humans interact with
digital and physical systems.

I work at the intersection of UX research,
interface design, and emerging technology.

Currently doing graduate research in extended
reality and perception, while taking on design
and development projects on the side.

I care about clarity, craft, and building
things that are genuinely useful.

Interests:
  · spatial computing
  · cognitive science
  · design systems
  · tools that help people think better
`

const WHOAMI_TXT = `whoami.txt
─────────────────────────────────────────────

Hatem , designer, developer, researcher.

I build interfaces that feel intentional
and products that respect the user.

Currently focused on:
  · interaction design
  · creative technology
  · research methods
`

const SKILLS_TXT = `skills.txt
─────────────────────────────────────────────

[ Design ]
  Figma            ████████████░░  92%
  Prototyping      ███████████░░░  85%
  User Research    ██████████░░░░  80%
  Design Systems   ██████████░░░░  78%

[ Development ]
  React / Next.js  ███████████░░░  85%
  CSS / Tailwind   ███████████░░░  88%
  TypeScript       █████████░░░░░  75%
  Python           █████████░░░░░  70%

[ Research & Tools ]
  Usability Test.  ██████████░░░░  80%
  Unreal Engine    ████████░░░░░░  65%
  Statistics / R   ████████░░░░░░  62%
  EEG / Biometrics ███████░░░░░░░  60%
`

const EXPERIENCE_TXT = `experience.txt
─────────────────────────────────────────────

Graduate Research Assistant
XR Perception Lab · 2023 , Present
  · Designing and running VR experiments on
    facial recognition and social presence.
  · Developing cushatem data collection
    pipelines in Python.
  · Co-authoring two in-progress papers on
    avatar fidelity and embodiment.

UI/UX Design Intern
Meridian Studio · Summer 2022
  · Designed mobile app interfaces across
    iOS and Android.
  · Conducted user interviews and synthesized
    findings into design decisions.
  · Delivered high-fidelity prototypes for
    two client projects.

Teaching Assistant , Interaction Design
University of Design · 2022 , 2023
  · Led weekly lab sessions for 30
    undergraduate students.
  · Provided critique and mentorship on
    design process and presentation.
`

const CONTACT_TXT = `contact.txt
─────────────────────────────────────────────

Feel free to reach out , I'm open to
research collaborations, design projects,
and interesting conversations.

  email    hatem@example.com
  github   github.com/hatem
  linkedin linkedin.com/in/hatem
  twitter  @hatemdesigns
`

const LINKS_TXT = `links.txt
─────────────────────────────────────────────

Quick links:

  [1] github.com/hatem
      → source code, experiments, open-source

  [2] linkedin.com/in/hatem
      → professional background

  [3] github.com/hatem/diet-temple
      → Diet Temple case study

  [4] github.com/hatem/clarity-ds
      → Clarity Design System

  [5] github.com/hatem/spatial-audio-viz
      → Spatial Audio Visualizer
`

// ─── Folder definitions ───────────────────────────────────────────────────────

export const OS_FOLDERS: OsFolder[] = [
  {
    id: 'about',
    name: 'about/',
    files: [
      { id: 'about_me',  name: 'about_me.txt', kind: 'txt', content: ABOUT_ME_TXT },
      { id: 'whoami',    name: 'whoami.txt',   kind: 'txt', content: WHOAMI_TXT   },
    ],
  },
  {
    id: 'projects',
    name: 'projects/',
    files: [
      { id: 'proj_1', name: 'odidact.proj',                kind: 'project', projectId: 1 },
      { id: 'proj_2', name: 'midori.proj',                 kind: 'project', projectId: 2 },
      { id: 'proj_3', name: 'ryujin.proj',                kind: 'project', projectId: 3 },
      { id: 'proj_4', name: 'spatial_audio_viz.proj',     kind: 'project', projectId: 4 },
    ],
  },
  {
    id: 'skills',
    name: 'skills/',
    files: [
      { id: 'skills_txt',     name: 'skills.txt',     kind: 'sh',  content: SKILLS_TXT     },
      { id: 'experience_txt', name: 'experience.txt', kind: 'txt', content: EXPERIENCE_TXT },
    ],
  },
  {
    id: 'contact',
    name: 'contact/',
    files: [
      { id: 'contact_txt', name: 'contact.txt', kind: 'lnk', content: CONTACT_TXT },
      { id: 'links_txt',   name: 'links.txt',   kind: 'txt', content: LINKS_TXT   },
    ],
  },
]

export function getFolderById(id: string): OsFolder | undefined {
  return OS_FOLDERS.find((f) => f.id === id)
}

export function getFileById(fileId: string): OsFile | undefined {
  for (const folder of OS_FOLDERS) {
    const file = folder.files.find((f) => f.id === fileId)
    if (file) return file
  }
  return undefined
}
