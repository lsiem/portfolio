import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { projectsContent } from '@/content';
import type { Project, ProjectFilter } from '@/content/types';
import { uiText } from '@/content/ui';
import { SectionWrapper } from '@/components/layout/SectionWrapper';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

const filters: Array<{ id: ProjectFilter; label: string }> = [
  { id: 'all', label: uiText.projects.filterAll },
  { id: 'featured', label: uiText.projects.filterFeatured },
  { id: 'side', label: uiText.projects.filterSide },
];

export function ProjectsSection() {
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [selected, setSelected] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    if (filter === 'featured') {
      return projectsContent.projects.filter((project) => project.featured);
    }
    if (filter === 'side') {
      return projectsContent.projects.filter((project) => !project.featured);
    }
    return projectsContent.projects;
  }, [filter]);

  return (
    <SectionWrapper id="projects" ariaLabelledby="projects-title">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 font-mono text-sm uppercase tracking-[0.25em] text-accent">
              Projects
            </p>
            <h2 id="projects-title" className="mb-4 text-4xl font-bold md:text-5xl">
              {projectsContent.title}
            </h2>
            <p className="text-lg text-white/70">{projectsContent.description}</p>
          </div>

          <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 p-1">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  filter === item.id
                    ? 'bg-accent text-space-950'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid auto-rows-[220px] grid-cols-1 gap-4 md:grid-cols-6">
          {filteredProjects.map((project, index) => {
            const spanClass =
              project.featured && index === 0
                ? 'md:col-span-4 md:row-span-2'
                : project.featured
                  ? 'md:col-span-3 md:row-span-2'
                  : 'md:col-span-2';

            return (
              <motion.button
                key={project.id}
                type="button"
                onClick={() => setSelected(project)}
                whileHover={{ y: -4 }}
                className={`group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-space-900 text-left ${spanClass}`}
              >
                <img
                  src={project.screenshot}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity group-hover:opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/50 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-6">
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-white/70">{project.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ''}
      >
        {selected ? (
          <div className="space-y-6">
            <img
              src={selected.screenshot}
              alt=""
              className="w-full rounded-2xl border border-white/10"
            />
            <p className="text-white/75">{selected.description}</p>
            {selected.problem ? (
              <div>
                <h4 className="mb-2 font-semibold text-accent">{uiText.projects.problem}</h4>
                <p className="text-white/70">{selected.problem}</p>
              </div>
            ) : null}
            {selected.solution ? (
              <div>
                <h4 className="mb-2 font-semibold text-accent">{uiText.projects.solution}</h4>
                <p className="text-white/70">{selected.solution}</p>
              </div>
            ) : null}
            <div>
              <h4 className="mb-2 font-semibold">{uiText.projects.technologies}</h4>
              <div className="flex flex-wrap gap-2">
                {selected.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            </div>
            <a
              href={selected.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-space-950 hover:bg-cyan-300"
            >
              {uiText.projects.visit}
            </a>
          </div>
        ) : null}
      </Modal>
    </SectionWrapper>
  );
}
