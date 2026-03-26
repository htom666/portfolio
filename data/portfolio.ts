export const OWNER = 'hatem'
export const HOST = 'portfolio'

export const BOOT_LINES: string[] = [
  'SYSTEM BOOT  ·  v2.4.1',
  '',
  '  checking hardware...',
  '  [ OK ]  processor',
  '  [ OK ]  memory',
  '  [ OK ]  storage',
  '',
  '  loading modules...',
  '  [ OK ]  ui/ux subsystem',
  '  [ OK ]  development environment',
  '  [ OK ]  research database',
  '',
  '  mounting user profile...',
  '',
  '  ──────────────────────────────────',
  "  welcome. i'm hatem.",
  '  ui/ux designer · developer · researcher',
  '  ──────────────────────────────────',
  '',
  '  type "help" to begin.',
]

export const WHOAMI_LINES: string[] = [
  "Hatem , designer, developer, researcher.",
  "I build interfaces that feel intentional and products that respect the user.",
  "Currently focused on interaction design, creative technology, and research methods.",
]

export const ABOUT: string = `Background in design and computer science, with a focus on how
humans interact with digital and physical systems. I work at the
intersection of UX research, interface design, and emerging technology.

Currently doing graduate research in extended reality and perception,
while taking on design and development projects on the side. I care
about clarity, craft, and building things that are genuinely useful.

Interests: spatial computing, cognitive science, design systems,
and tools that help people think better.`

export interface SkillCategory {
  category: string
  skills: { name: string; level: number }[]
}

export const SKILLS: SkillCategory[] = [
  {
    category: 'Design',
    skills: [
      { name: 'Figma', level: 92 },
      { name: 'Prototyping', level: 85 },
      { name: 'User Research', level: 80 },
      { name: 'Design Systems', level: 78 },
    ],
  },
  {
    category: 'Development',
    skills: [
      { name: 'React / Next.js', level: 85 },
      { name: 'TypeScript', level: 75 },
      { name: 'CSS / Tailwind', level: 88 },
      { name: 'Python', level: 70 },
    ],
  },
  {
    category: 'Research & Tools',
    skills: [
      { name: 'Unreal Engine', level: 65 },
      { name: 'EEG / Biometrics', level: 60 },
      { name: 'Statistics / R', level: 62 },
      { name: 'Usability Testing', level: 80 },
    ],
  },
]

export interface ProjectImage {
  filename: string
  label: string
  src: string
}

export interface StackItem {
  name: string
  role: string
}

export interface Project {
  id: number
  slug: string
  title: string
  tagline: string
  category: string
  role: string
  year: string
  tech: string[]
  stack: StackItem[]
  summary: string
  problem: string
  solution: string
  process?: string
  outcome: string
  caseStudyUrl?: string
  images: ProjectImage[]
}

export const PROJECTS: Project[] = [
  {
    id: 1,
    slug: 'odidact',
    title: 'Odidact',
    tagline: 'SaaS platform , monetize your skills on social media',
    category: 'UI/UX Design · Full-Stack',
    role: 'UI/UX Designer · Front-End & Back-End Engineer',
    year: '2022–2024',
    tech: ['Figma', 'Angular', 'TypeScript', 'Tailwind CSS', 'Spring Boot'],
    stack: [
      { name: 'Angular · TypeScript', role: 'front-end , responsive web & mobile' },
      { name: 'Spring Boot (Java)',   role: 'back-end , auth, courses, payments, referrals' },
      { name: 'Figma',               role: 'design system, wireframes, hi-fi prototypes' },
      { name: 'Tailwind CSS',        role: 'utility-first styling & layout' },
      { name: 'AI Chatbot',          role: 'guided post creation + image generation' },
    ],
    summary:
      'Odidact lets creators, coaches, and professionals monetize their expertise directly through social media. Instructors sell courses, services, and referrals via Instagram, TikTok, Snapchat, and Facebook , without leaving their audience. Subscription tiers: Free · €20/mo · €120/yr.',
    problem:
      'Traditional e-learning platforms ignore social-first creators. New users had to identify a skill, pick a monetization model (course, service, referral, rental, tips), and connect social channels , all without dropping off. Onboarding friction was the primary churn point.',
    solution:
      'Progressive multi-step onboarding wizard , minimal fields per screen, clear progress indicators. Unique Odidact profile links embed directly in social bios, posts, and stories. Social integration UI designed to feel native alongside each platform. Three clear subscription tiers with distinct value propositions.',
    process:
      'Joined as primary designer and front-end engineer, taking on back-end progressively. Full lifecycle: wireframes → design system → production implementation. Mobile-first from day one , social-first nature made mobile the primary surface. AI chatbot built to guide creators through content structure, tone, and audience targeting, with AI-generated images per post.',
    outcome:
      '4× page load improvement via caching, code splitting, and asset optimisation. 75% reduction in page load times. Shipped AI chatbot for guided content creation. Platform live since Jan 2022 , 2+ years in production across France and Tunisia.',
    caseStudyUrl: 'https://odidact.com',
    images: [
      {
        filename: 'onboarding_flow.png',
        label: 'Creator onboarding , skill search, revenue model selection (course · service · referral · tips), channel setup',
        src: '/images/projects/odidact/onboarding_flow.png',
      },
      {
        filename: 'social_integration.png',
        label: 'Hero section , "Monetize your Skills on Social Media" · landing page & conversion flow',
        src: '/images/projects/odidact/social_integration.png',
      },
      {
        filename: 'platform_overview.png',
        label: 'Social integration , unique Odidact profile link embedded across Instagram, TikTok, Snapchat & Facebook',
        src: '/images/projects/odidact/platform_overview.png',
      },
      {
        filename: 'responsive_design.png',
        label: 'Platform overview , subscription tiers (Free · €20/mo · €120/yr), course marketplace & referral system',
        src: '/images/projects/odidact/responsive_design.png',
      },
    ],
  },
  {
    id: 2,
    slug: 'midori',
    title: 'Midori',
    tagline: 'Japanese luxury fashion , e-commerce UI design concept',
    category: 'UI/UX Design Concept',
    role: 'UI/UX Designer',
    year: '2023',
    tech: ['Figma', 'Adobe Photoshop'],
    stack: [
      { name: 'Figma',            role: 'all screens, components, typography system & prototyping' },
      { name: 'Adobe Photoshop',  role: 'image treatment, mockup composition, colour grading' },
      { name: 'Scope',            role: 'UI/UX concept only , not developed' },
    ],
    summary:
      'Midori is a concept luxury fashion brand rooted in Japanese aesthetics , wedding suites, dresses, kimonos, and accessories. A full visual exploration of how a high-end Japanese fashion e-commerce platform could look and feel. Covers brand identity, typography system, navigation architecture, product browsing, and responsive layout.',
    problem:
      'Communicating exclusivity, cultural depth, and modern elegance simultaneously in a digital space. Conventional grid browsing feels like a mass-market catalogue , incompatible with a luxury brand that treats the product as editorial content.',
    solution:
      'Near-black base with deep forest green accents (Midori = green in Japanese). Mixed serif/sans typography for editorial weight contrast. Full-bleed photography as the primary design element. Category navigation replaced with a typographic menu overlaid on imagery , feels like a magazine, not a catalogue.',
    process:
      'Hero pairs an editorial headline ("Dress to express, not to impress") with a full-height portrait. New arrivals uses a split-panel layout , monochrome Men vs rich-colour Women , creating visual tension. Must See presents curated pieces (Arthemis Wedding Dress, Mori Kimono, Green Yoru) as editorial features. Navigation limited to four items , restraint in UI mirrors restraint in brand philosophy. Gender split on arrivals is inclusive by design.',
    outcome:
      'Six screens delivered: overview, hero, new arrivals, fashion category, must-see carousel, and footer. Dark background signals exclusivity over the white-site convention. Information architecture complete through footer , newsletter signup, site map, and a Midori Access (VIP) tier.',
    images: [
      {
        filename: 'overview.png',
        label: 'UI concept overview , full brand system across all screens',
        src: '/images/projects/midori/overview.png',
      },
      {
        filename: 'hero.png',
        label: 'Homepage hero , "We Are MIDORI / Dress to express, not to impress"',
        src: '/images/projects/midori/hero.png',
      },
      {
        filename: 'new_arrivals.png',
        label: 'New Arrivals AW 2023/19 , gender-split editorial layout (Men · Women)',
        src: '/images/projects/midori/new_arrivals.png',
      },
      {
        filename: 'fashion_category.png',
        label: 'Fashion section , typographic category menu with live product preview',
        src: '/images/projects/midori/fashion_category.png',
      },
      {
        filename: 'must_see.png',
        label: 'Must See , curated editorial carousel (Arthemis Wedding Dress · Mori Kimono · Green Yoru)',
        src: '/images/projects/midori/must_see.png',
      },
      {
        filename: 'footer.png',
        label: 'Footer , newsletter signup, site map & Midori Access (VIP tier)',
        src: '/images/projects/midori/footer.png',
      },
    ],
  },
  {
    id: 3,
    slug: 'ryujin',
    title: 'RYUJIN',
    tagline: 'Luxury katana e-commerce & live 3D configurator',
    category: 'UI/UX Design · Front-End Dev',
    role: 'UI/UX Designer · Front-End Developer',
    year: '2025',
    tech: ['Three.js', 'GSAP', 'HTML', 'CSS', 'JavaScript', 'Blender'],
    stack: [
      { name: 'Three.js',          role: 'GLB model, mesh isolation, real-time material swapping' },
      { name: 'GSAP ScrollTrigger', role: 'scroll-driven animations & kinetic typography' },
      { name: 'Vanilla HTML/CSS/JS', role: 'no framework , fully hand-crafted SPA' },
      { name: 'Blender',           role: '3D katana model , seven named mesh parts, exported as GLB' },
      { name: 'GitHub Pages',      role: 'deployment , hhatem666.github.io/ryujin.github.io' },
    ],
    summary:
      'RYUJIN is a concept luxury katana brand built as a single-page application , treating the browser as a gallery, not a catalogue. Every section has a distinct purpose: seduce, educate, personalise, convert. Dark palette, serif typography, and red accents mirror the weight of the product , nothing decorative that isn\'t also functional.',
    problem:
      'High-end physical craftsmanship is difficult to convey through conventional e-commerce. Product cards and grids feel incompatible with an object that carries centuries of craft tradition. The challenge: make the digital experience feel as intentional and refined as the katana itself.',
    solution:
      'Cinematic single-page experience built without a framework. Interactive 3D blade anahatemy viewer (Three.js) lets users hover to isolate and click to inspect each of seven named mesh parts , Ha, Tsuba, Tsuka, Kissaki, Saya, and more. Live configurator updates the 3D model in real time across five cushatemisation dimensions: Katana Series, Blade Finish, Handle Wrap, Saya Finish, and Engraving.',
    process:
      'Philosophy section , Japanese craft pillars (Steel, Form, Spirit, Edge) paired with kanji. Collection page presents three limited series (Kage No.01 · $4,800, Ryujin Eclipse · $6,200, Obsidian Edge · $7,500) as editorial entries with specs and reservation flow. Craft section: 8-stage interactive forging grid from Tamahagane smelting to final inspection. Legacy section: pure GSAP ScrollTrigger kinetic typography , no UI chrome, pure atmosphere. Collector Notes framed as archived documents, not reviews.',
    outcome:
      'Fully deployed on GitHub Pages. Four blade finishes (Mirror, Brushed, Satin, Kurouchi), four handle wrap options, five Saya finishes including Carbon Pattern, cushatem calligraphy engraving. Closing section uses scarcity messaging , limited series, edition count surfaced as brand signal.',
    caseStudyUrl: 'https://hhatem666.github.io/ryujin.github.io',
    images: [
      {
        filename: 'hero.png',
        label: 'Hero , "FORGED IN SILENCE · Steel shaped by centuries of intent"',
        src: '/images/projects/ryujin/hero.png',
      },
      {
        filename: 'philosophy.png',
        label: 'Philosophy , "Tradition Refined Through Modern Craft" · Steel · Form · Spirit · Edge',
        src: '/images/projects/ryujin/philosophy.png',
      },
      {
        filename: 'anahatemy.png',
        label: 'Anahatemy of the Blade , Three.js interactive viewer, hover to isolate · click to inspect',
        src: '/images/projects/ryujin/anahatemy.png',
      },
      {
        filename: 'collection.png',
        label: 'Collection , Kage No.01 · Ryujin Eclipse · Obsidian Edge , specs, pricing & reservation',
        src: '/images/projects/ryujin/collection.png',
      },
      {
        filename: 'craft.png',
        label: 'Craft , "From Fire and Pressure" · 8-stage forging process, interactive cards',
        src: '/images/projects/ryujin/craft.png',
      },
      {
        filename: 'legacy.png',
        label: 'Legacy , scroll-driven kinetic typography built with GSAP ScrollTrigger',
        src: '/images/projects/ryujin/legacy.png',
      },
      {
        filename: 'configurator.png',
        label: 'Configurator , "Build Your RYUJIN" · live 3D material swapping across 5 dimensions',
        src: '/images/projects/ryujin/configurator.png',
      },
      {
        filename: 'collector_notes.png',
        label: 'Collector Notes , archived statements, not reviews · editorial social proof',
        src: '/images/projects/ryujin/collector_notes.png',
      },
      {
        filename: 'closing.png',
        label: 'Closing , "Not Every Blade Belongs to Every Hand" · scarcity & edition count',
        src: '/images/projects/ryujin/closing.png',
      },
      {
        filename: 'overview.png',
        label: 'Full site overview , single-page application, no framework, GitHub Pages deployment',
        src: '/images/projects/ryujin/overview.png',
      },
    ],
  },
  {
    id: 4,
    slug: 'spatial-audio-visualizer',
    title: 'Spatial Audio Visualizer',
    tagline: 'Real-time 3D audio visualization for spatial mixing',
    category: 'Creative Technology',
    role: 'Sole Developer',
    year: '2023',
    tech: ['WebGL', 'Web Audio API', 'TypeScript'],
    stack: [
      { name: 'WebGL', role: '3D rendering pipeline' },
      { name: 'Web Audio API', role: 'FFT analysis & routing' },
      { name: 'TypeScript', role: 'application logic' },
    ],
    summary:
      'Browser tool for real-time 3D visualization of audio signals , built for spatial mixing contexts.',
    problem:
      'Spatial audio mixing lacks intuitive visual feedback. Engineers work blind to stereo field geometry.',
    solution:
      'WebGL renderer synced to Web Audio API. Real-time FFT feeds a spatial 3D display in the browser.',
    outcome:
      '200+ GitHub stars. Actively used by independent producers as a mixing reference tool.',
    caseStudyUrl: 'https://github.com/hatem/spatial-audio-viz',
    images: [
      {
        filename: 'preview_01.png',
        label: 'spatial visualizer',
        src: '/images/projects/spatial-audio/preview_01.png',
      },
      {
        filename: 'preview_02.png',
        label: 'frequency analysis view',
        src: '/images/projects/spatial-audio/preview_02.png',
      },
    ],
  },
]

export interface ExperienceItem {
  role: string
  org: string
  period: string
  lines: string[]
}

export const EXPERIENCE: ExperienceItem[] = [
  {
    role: 'Graduate Research Assistant',
    org: 'XR Perception Lab',
    period: '2023 , Present',
    lines: [
      'Designing and running VR experiments on facial recognition and social presence.',
      'Developing cushatem data collection pipelines in Python.',
      'Co-authoring two in-progress papers on avatar fidelity and embodiment.',
    ],
  },
  {
    role: 'UI/UX Design Intern',
    org: 'Meridian Studio',
    period: 'Summer 2022',
    lines: [
      'Designed mobile app interfaces across iOS and Android.',
      'Conducted user interviews and synthesized findings into design decisions.',
      'Delivered high-fidelity prototypes for two client projects.',
    ],
  },
  {
    role: 'Teaching Assistant , Interaction Design',
    org: 'University of Design',
    period: '2022 , 2023',
    lines: [
      'Led weekly lab sessions for 30 undergraduate students.',
      'Provided critique and mentorship on design process and presentation.',
    ],
  },
]

export const CONTACT = {
  email: 'hatem@example.com',
  github: 'github.com/hatem',
  linkedin: 'linkedin.com/in/hatem',
  twitter: '@hatemdesigns',
}
