import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { skillsContent } from '@/content';
import { SectionWrapper } from '@/components/layout/SectionWrapper';
import { Badge } from '@/components/ui/Badge';
import { staggerContainer, staggerItem } from '@/animations/variants';

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <span>
      {value}
      {suffix}
    </span>
  );
}

export function SkillsSection() {
  const [activeGroup, setActiveGroup] = useState(0);
  const stats = useMemo(
    () => [
      { label: 'Skill-Gruppen', value: skillsContent.groups.length },
      { label: 'Technologien', value: 28, suffix: '+' },
      { label: 'Jahre Erfahrung', value: 5, suffix: '+' },
    ],
    [],
  );

  const active = skillsContent.groups[activeGroup];

  return (
    <SectionWrapper id="skills" ariaLabelledby="skills-title">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 font-mono text-sm uppercase tracking-[0.25em] text-accent">
            Skills
          </p>
          <h2 id="skills-title" className="mb-4 text-4xl font-bold md:text-5xl">
            {skillsContent.title}
          </h2>
          <p className="text-lg text-white/70">{skillsContent.subtitle}</p>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-panel p-5">
              <div className="text-3xl font-bold text-accent">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-1 text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-wrap gap-2 lg:flex-col">
            {skillsContent.groups.map((group, index) => (
              <button
                key={group.title}
                type="button"
                onClick={() => setActiveGroup(index)}
                className={`rounded-2xl px-4 py-3 text-left transition-colors ${
                  activeGroup === index
                    ? 'bg-accent/15 text-white ring-1 ring-accent/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {group.title}
              </button>
            ))}
          </div>

          <motion.div
            key={active.title}
            variants={staggerContainer()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-4 md:grid-cols-2"
          >
            {active.categories.map((category) => (
              <motion.article
                key={category.categoryTitle}
                variants={staggerItem}
                className="glass-panel p-5 transition-transform hover:-translate-y-1"
              >
                <h3 className="mb-3 text-lg font-semibold">{category.categoryTitle}</h3>
                <ul className="mb-4 space-y-2 text-sm text-white/70">
                  {category.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {category.softwareSkills.map((tool) => (
                    <Badge key={tool.skillName}>{tool.skillName}</Badge>
                  ))}
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
