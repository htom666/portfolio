import { PROJECTS } from '@/data/portfolio'
import ProjectPageClient from '@/components/ProjectPageClient'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const project = PROJECTS.find((p) => p.slug === params.slug)
  return {
    title: project ? `${project.title} — tom` : 'Project — tom',
    description: project?.tagline ?? '',
  }
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = PROJECTS.find((p) => p.slug === params.slug)

  if (!project) {
    notFound()
    return null
  }

  return <ProjectPageClient project={project} allProjects={PROJECTS} />
}
