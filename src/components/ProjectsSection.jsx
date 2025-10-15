import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../utils/motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faJs,
  faPython,
  faJava,
  faPhp,
  faCss3,
  faHtml5,
  faDocker,
  faWordpress,
  faReact,
  faAws,
} from "@fortawesome/free-brands-svg-icons";
import {
  faCode,
  faDatabase,
  faGears,
  faFlask,
  faChartLine,
  faShareFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { projectsData } from "../config/personal";

const ProjectsSection = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const titleLineRef = useRef(null);
  const triggerRef = useRef(null);
  const horizontalRef = useRef(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const hoverTimeoutsRef = useRef({});
  const starsRef = useRef([]);

  // Skills icon mapping
  const skillIcons = {
    // Core languages
    javascript: faJs,
    python: faPython,
    java: faJava,
    php: faPhp,
    css: faCss3,
    html: faHtml5,

    // Frameworks & Libraries
    'spring boot': faGears,
    flask: faFlask,
    wordpress: faWordpress,

    // Databases
    postgresql: faDatabase,

    // DevOps & Tools
    docker: faDocker,
    aws: faAws,
    gradle: faGears,
    grafana: faChartLine,
    prometheus: faChartLine,
    selenium: faCode,

    // WordPress plugins
    jetpack: faWordpress,
    elementor: faWordpress,

    // Generic fallbacks for concepts/patterns (use generic code icon)
    vaadin: faCode,
    rest: faCode,
    'ci/cd pipelines': faGears,
    junit: faCode,
    mockito: faCode,
    fastapi: faCode,
    bash: faCode,
    unix: faCode,
    websocket: faCode,
    orchestration: faGears,
    thymeleaf: faCode,
  };

  // Function to get all projects from all sections
  const getAllProjects = () => {
    const allProjects = [];
    let projectId = 1;

    projectsData.sections.forEach(section => {
      if (section.projects) {
        section.projects.forEach(project => {
          allProjects.push({
            id: projectId++,
            ...project,
            sectionTitle: section.title
          });
        });
      }
    });

    return allProjects;
  };

  const projectImages = getAllProjects();

  // Helper to collect star refs
  const addToStars = (el) => {
    if (el && !starsRef.current.includes(el)) {
      starsRef.current.push(el);
    }
  };

  useEffect(() => {
    // Capture the current timeouts ref for cleanup
    const timeouts = hoverTimeoutsRef.current;
    // Capture current ref for cleanup
    const currentSection = sectionRef.current;

    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);

      // Check for reduced motion preference
      const reducedMotion = prefersReducedMotion();

      // Animate stars
      if (!reducedMotion && starsRef.current.length > 0) {
        gsap.to(starsRef.current, {
          y: "random(-100, 100)",
          x: "random(-100, 100)",
          duration: "random(3, 5)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: {
            amount: 1,
            from: "random",
          },
        });
      }

      // Title animation - with null check
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { y: reducedMotion ? 0 : 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: reducedMotion ? 0.1 : 1.2,
            ease: "power3.out",
            scrollTrigger: reducedMotion ? false : {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Title line animation - with null check
      if (titleLineRef.current) {
        gsap.fromTo(
          titleLineRef.current,
          { width: reducedMotion ? "100%" : 0, opacity: 0 },
          {
            width: "100%",
            opacity: 1,
            duration: reducedMotion ? 0.1 : 1.5,
            ease: "power3.inOut",
            delay: reducedMotion ? 0 : 0.3,
            scrollTrigger: reducedMotion ? false : {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Projects grid entrance effect
      if (triggerRef.current && sectionRef.current) {
        gsap.fromTo(
          triggerRef.current,
          { y: reducedMotion ? 0 : 100, rotationX: reducedMotion ? 0 : 20, opacity: 0 },
          {
            y: 0,
            rotationX: 0,
            opacity: 1,
            duration: reducedMotion ? 0.1 : 1,
            delay: reducedMotion ? 0 : 0.2,
            ease: "power2.out",
            scrollTrigger: reducedMotion ? false : {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Animate project cards individually
      if (!prefersReducedMotion && horizontalRef.current) {
        const cards = gsap.utils.toArray(horizontalRef.current.children);

        if (cards.length > 0) {
          gsap.fromTo(cards,
            {
              y: 50,
              opacity: 0,
              scale: 0.9
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.6,
              ease: "power2.out",
              stagger: 0.2,
              scrollTrigger: {
                trigger: horizontalRef.current,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      }
    }, sectionRef);

    return () => {
      ctx.revert();
      // Kill all ScrollTriggers associated with this section
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === currentSection) {
          trigger.kill();
        }
      });
      // Cleanup all timeouts on unmount
      Object.values(timeouts).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    };
  }, [projectImages.length]);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative min-h-screen py-20 bg-gradient-to-b from-[#070F32] via-[#0a1642] to-[#070F32] overflow-hidden"
    >
      {/* Decorative Background Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            ref={addToStars}
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.5,
              filter: `blur(${Math.random() * 1.5}px)`,
            }}
          />
        ))}
      </div>

      {/* Section title */}
      <div className="container mx-auto px-4 mb-16 relative z-10">
        <h2
          ref={titleRef}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-4 opacity-0"
        >
          {projectsData.title}
        </h2>
        <div
          ref={titleLineRef}
          className="w-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto opacity-0 rounded-full"
        ></div>
      </div>

      {/* Projects Grid */}
      <div ref={triggerRef} className="container mx-auto px-4 opacity-0">
        <div
          ref={horizontalRef}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto"
        >
          {projectImages.map((project) => {
            const isExpanded = expandedCard === project.id;

            return (
              <div
                key={project.id}
                className="project-card bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 group cursor-pointer border border-gray-700/50 hover:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 flex flex-col h-full"
                role="button"
                tabIndex={0}
                aria-label={`View project: ${project.title}`}
                onClick={() => project.link && window.open(project.link, '_blank')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (project.link) {
                      window.open(project.link, '_blank');
                    }
                  }
                }}
                onMouseEnter={() => {
                  // Clear any existing timeout for this specific card
                  if (hoverTimeoutsRef.current[project.id]) {
                    clearTimeout(hoverTimeoutsRef.current[project.id]);
                  }
                  // Set a new timeout for this card
                  hoverTimeoutsRef.current[project.id] = setTimeout(() => {
                    setExpandedCard(project.id);
                  }, 500);
                }}
                onMouseLeave={() => {
                  // Clear the timeout for this specific card
                  if (hoverTimeoutsRef.current[project.id]) {
                    clearTimeout(hoverTimeoutsRef.current[project.id]);
                  }
                  // Reset expanded state after a brief delay
                  setTimeout(() => setExpandedCard(null), 100);
                }}
                onFocus={() => {
                  setExpandedCard(project.id);
                }}
                onBlur={() => {
                  // Clear timeout on blur
                  if (hoverTimeoutsRef.current[project.id]) {
                    clearTimeout(hoverTimeoutsRef.current[project.id]);
                  }
                  setExpandedCard(null);
                }}
              >
                <div className="flex flex-col">
                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-900/40 to-gray-800/40 w-full aspect-video border-b border-gray-700/50">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-6xl text-blue-400 opacity-30">
                        <FontAwesomeIcon icon={faReact} />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 w-full">
                    {/* Section Tag */}
                    {project.sectionTitle && (
                      <div className="inline-block px-3 py-1 mb-3 text-xs font-semibold text-blue-400 bg-blue-500/20 rounded-full border border-blue-500/30">
                        {project.sectionTitle}
                      </div>
                    )}

                    {/* Technologies Icons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies?.slice(0, 6).map((tech, index) => {
                        const techKey = tech.toLowerCase().replace(/\s+/g, ' ');
                        const icon = skillIcons[techKey] || faCode;
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-center w-8 h-8 bg-gray-700/50 rounded-full group-hover:bg-blue-500/20 transition-colors duration-300 border border-gray-600/50 group-hover:border-blue-500/50"
                            title={tech}
                          >
                            <FontAwesomeIcon
                              icon={icon}
                              className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors duration-300"
                            />
                          </div>
                        );
                      })}
                      {project.technologies?.length > 6 && (
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-700/50 rounded-full text-xs text-gray-400 font-semibold border border-gray-600/50">
                          +{project.technologies.length - 6}
                        </div>
                      )}
                    </div>

                    <h2 className="project-title flex items-center justify-between text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                      <span className="line-clamp-2">{project.title}</span>
                      {project.link && (
                        <FontAwesomeIcon
                          icon={faShareFromSquare}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0 ml-2 text-blue-400"
                        />
                      )}
                    </h2>
                    <div className="relative mt-2">
                      <p
                        className="text-gray-300 text-sm leading-relaxed overflow-hidden transition-all duration-500 ease-in-out"
                        style={{
                          maxHeight: isExpanded ? '300px' : '4.5em'
                        }}
                      >
                        {project.description}
                      </p>
                      {!isExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-800 to-transparent pointer-events-none"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
