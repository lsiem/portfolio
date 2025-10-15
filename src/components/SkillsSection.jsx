import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { staggerContainer, staggerItem } from "../animations/variants";
import { skillsData } from "../config/personal";

const SkillsSection = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const cardsRef = useRef([]);
  const starsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Title animation
      gsap.fromTo(
        titleRef.current,
        { y: prefersReducedMotion ? 0 : 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: prefersReducedMotion ? 0.1 : 1,
          ease: "power3.out",
          scrollTrigger: prefersReducedMotion ? false : {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Subtitle animation
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          { y: prefersReducedMotion ? 0 : 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: prefersReducedMotion ? 0.1 : 0.8,
            delay: prefersReducedMotion ? 0 : 0.3,
            ease: "power3.out",
            scrollTrigger: prefersReducedMotion ? false : {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Cards stagger animation
      if (!prefersReducedMotion) {
        gsap.fromTo(
          cardsRef.current,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Star parallax animations
      if (!prefersReducedMotion && starsRef.current.length > 0) {
        starsRef.current.forEach((star, index) => {
          const direction = index % 2 === 0 ? 1 : -1;
          const speed = 0.5 + Math.random() * 0.5;

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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const addToCardsRef = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  const addToStars = (el) => {
    if (el && !starsRef.current.includes(el)) {
      starsRef.current.push(el);
    }
  };

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative py-20 bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden"
    >
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            ref={addToStars}
            key={`star-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${8 + i * 2}px`,
              height: `${8 + i * 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: `blur(${Math.random() * 1.5}px)`,
              backgroundColor: "white",
              opacity: 0.15 + Math.random() * 0.35,
            }}
          />
        ))}
      </div>

      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Title */}
        <motion.div
          ref={titleRef}
          className="text-center mb-16"
          initial={{ opacity: 0 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {skillsData.title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6"></div>
          <p ref={subtitleRef} className="text-gray-400 text-lg max-w-2xl mx-auto">
            {skillsData.subtitle}
          </p>
        </motion.div>

        {/* Skills Grid - Masonry Layout */}
        <div className="columns-1 lg:columns-2 gap-8 max-w-7xl mx-auto space-y-8">
          {skillsData.data.map((skillGroup, groupIndex) => (
            <div
              key={groupIndex}
              ref={addToCardsRef}
              className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/40 hover:border-blue-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 relative overflow-hidden group break-inside-avoid mb-8"
            >
              {/* Card hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Skill Group Title */}
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 flex items-center">
                  <span className="w-2 h-10 bg-gradient-to-b from-blue-400 to-purple-600 rounded-full mr-4 shadow-lg shadow-blue-500/50"></span>
                  {skillGroup.title}
                </h3>

                {/* Categories */}
                <div className="space-y-8">
                {skillGroup.categories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-4 pb-6 border-b border-gray-700/30 last:border-b-0 last:pb-0">
                    {/* Category Title */}
                    <h4 className="text-lg md:text-xl font-semibold text-blue-300 flex items-center group/title">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover/title:shadow-lg group-hover/title:shadow-blue-400/50 transition-shadow duration-300"></span>
                      {category.categoryTitle}
                    </h4>

                    {/* Skills List */}
                    <ul className="space-y-2.5 text-gray-300 text-sm md:text-base pl-5">
                      {category.skills.map((skill, skillIndex) => (
                        <li key={skillIndex} className="leading-relaxed relative before:content-['▹'] before:absolute before:-left-5 before:text-blue-400 before:font-bold">
                          {skill}
                        </li>
                      ))}
                    </ul>

                    {/* Software Skills Icons */}
                    <div className="flex flex-wrap gap-4 pt-2">
                      {category.softwareSkills.map((software, softwareIndex) => (
                        <motion.div
                          key={softwareIndex}
                          className="group relative"
                          whileHover={{ scale: 1.15, y: -8 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <div className="flex flex-col items-center">
                            <div className="relative w-14 h-14 flex items-center justify-center rounded-lg bg-gray-800/60 border border-gray-600/40 group-hover:border-blue-400/60 group-hover:bg-gray-700/80 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300">
                              <Icon
                                icon={software.fontAwesomeClassname}
                                className="w-7 h-7 text-gray-300 group-hover:text-white transition-colors duration-300"
                              />
                            </div>
                            <span className="text-xs text-gray-400 group-hover:text-blue-300 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              {software.skillName}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
