import { useRef } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { LuExternalLink, LuCalendar, LuMapPin } from "react-icons/lu";
import { getStaggerContainer, getStaggerItem } from "../animations/variants";
import { prefersReducedMotion } from "../utils/motion";
import { useGsapScroll } from "../hooks/useGsapScroll";
import { experienceData } from "../config/personal";

const ExperienceSection = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const descriptionRef = useRef(null);
  const timelineRef = useRef(null);
  const timelineLineRef = useRef(null);
  const timelineProgressRef = useRef(null);
  const timelineItemsRef = useRef([]);
  const starsRef = useRef([]);

  useGsapScroll(sectionRef, () => {
    const reducedMotion = prefersReducedMotion();

      // Title animation
      gsap.fromTo(
        titleRef.current,
        { y: reducedMotion ? 0 : 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: reducedMotion ? 0.1 : 0.8,
          scrollTrigger: reducedMotion ? false : {
            trigger: sectionRef.current,
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Subtitle animation
      gsap.fromTo(
        subtitleRef.current,
        { y: reducedMotion ? 0 : 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: reducedMotion ? 0.1 : 0.8,
          delay: reducedMotion ? 0 : 0.2,
          scrollTrigger: reducedMotion ? false : {
            trigger: sectionRef.current,
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Description animation
      gsap.fromTo(
        descriptionRef.current,
        { y: reducedMotion ? 0 : 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: reducedMotion ? 0.1 : 0.8,
          delay: reducedMotion ? 0 : 0.4,
          scrollTrigger: reducedMotion ? false : {
            trigger: sectionRef.current,
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Animated timeline progress line that follows scroll
      if (timelineProgressRef.current && !reducedMotion) {
        gsap.fromTo(
          timelineProgressRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: timelineRef.current,
              start: "top 60%",
              end: "bottom 60%",
              scrub: 0.5,
            },
          }
        );
      }

      // Animate each timeline item when it comes into view
      if (!reducedMotion) {
        timelineItemsRef.current.forEach((item, index) => {
          if (item) {
            const card = item.querySelector('.timeline-card');
            const dot = item.querySelector('.timeline-dot');

            // Card animation
            gsap.fromTo(
              card,
              {
                x: index % 2 === 0 ? -100 : 100,
                opacity: 0,
                scale: 0.8
              },
              {
                x: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: item,
                  start: "top 80%",
                  end: "top 50%",
                  toggleActions: "play none none reverse",
                },
              }
            );

            // Dot animation
            gsap.fromTo(
              dot,
              {
                scale: 0,
                opacity: 0
              },
              {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                ease: "back.out(2)",
                scrollTrigger: {
                  trigger: item,
                  start: "top 75%",
                  toggleActions: "play none none reverse",
                },
              }
            );

            // Add a pulse effect when the dot is in view
            gsap.to(dot, {
              boxShadow: "0 0 20px rgba(96, 165, 250, 0.8), 0 0 40px rgba(96, 165, 250, 0.4)",
              duration: 1.5,
              repeat: -1,
              yoyo: true,
              ease: "power1.inOut",
              scrollTrigger: {
                trigger: item,
                start: "top 70%",
                end: "bottom 30%",
                toggleActions: "play pause resume pause",
              },
            });
          }
        });
      }

      // Stars parallax effect
      if (!reducedMotion) {
        starsRef.current.forEach((star, index) => {
          const direction = index % 2 === 0 ? 1 : -1;
          const speed = 0.3 + Math.random() * 0.4;

          gsap.to(star, {
            x: `${direction * (80 + index * 15)}`,
            y: `${direction * (-40 + index * 8)}`,
            rotation: direction * 180,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: speed,
            },
          });
        });
      }
  });

  const addToStars = (el) => {
    if (el && !starsRef.current.includes(el)) {
      starsRef.current.push(el);
    }
  };

  const addToTimelineItems = (el) => {
    if (el && !timelineItemsRef.current.includes(el)) {
      timelineItemsRef.current.push(el);
    }
  };

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#070F32] via-[#0a1454] to-[#070F32] py-20"
    >
      {/* Animated background stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            ref={addToStars}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2
            ref={titleRef}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4"
          >
            {experienceData.title}
          </h2>
          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-blue-300 mb-6"
          >
            {experienceData.subtitle}
          </p>
          <p
            ref={descriptionRef}
            className="text-gray-300 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed"
          >
            {experienceData.description}
          </p>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Timeline background line */}
          <div
            ref={timelineLineRef}
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-blue-500/20 transform md:-translate-x-1/2"
          />

          {/* Timeline progress line (animated with scroll) */}
          <div
            ref={timelineProgressRef}
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 transform md:-translate-x-1/2 origin-top"
            style={{ scaleY: 0 }}
          />

          {/* Experience items */}
          <motion.div
            variants={getStaggerContainer()}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-12"
          >
            {experienceData.experiences.map((exp, index) => (
              <ExperienceCard
                key={index}
                experience={exp}
                index={index}
                addToTimelineItems={addToTimelineItems}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ExperienceCard = ({ experience, index, addToTimelineItems }) => {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={addToTimelineItems}
      variants={getStaggerItem()}
      className={`relative flex items-center ${
        isEven ? "md:flex-row" : "md:flex-row-reverse"
      } flex-col md:justify-between`}
    >
      {/* Timeline dot */}
      <div className="timeline-dot absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full border-4 border-[#070F32] z-10" />

      {/* Content card */}
      <div
        className={`w-full md:w-[calc(50%-3rem)] ml-16 md:ml-0 ${
          isEven ? "md:pr-12" : "md:pl-12"
        }`}
      >
        <motion.div
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          className="timeline-card bg-gradient-to-br from-[#0a1454]/80 to-[#070F32]/80 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 md:p-8 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300"
        >
          {/* Company logo and info */}
          <div className="flex items-start gap-4 mb-4">
            {experience.logo_path && (
              <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-xl p-2 backdrop-blur-sm">
                <img
                  src={`/logos/${experience.logo_path}`}
                  alt={`${experience.company} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {experience.title}
              </h3>
              {experience.company_url ? (
                <a
                  href={experience.company_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-lg md:text-xl font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  {experience.company}
                  <LuExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <p className="text-blue-400 text-lg md:text-xl font-semibold">
                  {experience.company}
                </p>
              )}
            </div>
          </div>

          {/* Duration and location */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm md:text-base">
            <div className="flex items-center gap-2 text-gray-300">
              <LuCalendar className="w-5 h-5 text-blue-400" />
              <span>{experience.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <LuMapPin className="w-5 h-5 text-purple-400" />
              <span>{experience.location}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 leading-relaxed text-base md:text-lg">
            {experience.description}
          </p>

          {/* Optional color accent */}
          {experience.color && (
            <div
              className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
              style={{ backgroundColor: experience.color }}
            />
          )}
        </motion.div>
      </div>

      {/* Spacer for timeline alignment on desktop */}
      <div className="hidden md:block w-[calc(50%-3rem)]" />
    </motion.div>
  );
};

export default ExperienceSection;
