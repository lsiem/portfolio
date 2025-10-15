import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../utils/motion";
import meImage from "../assets/images/me.png";

const AboutSection = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const introRef = useRef(null);
  const starsRef = useRef([]);

  useEffect(() => {
    // Capture current ref for cleanup
    const currentSection = sectionRef.current;

    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);

      // Check for reduced motion preference
      const reducedMotion = prefersReducedMotion();

      // Title animation
      gsap.fromTo(
        titleRef.current,
        { y: reducedMotion ? 0 : 100, opacity: 0 },
        {
          y: reducedMotion ? 0 : -300,
          opacity: 1,
          duration: reducedMotion ? 0.1 : 0.8,
          scrollTrigger: reducedMotion ? false : {
            trigger: sectionRef.current,
            start: "top 40%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Intro animation
      gsap.fromTo(
        introRef.current,
        { y: reducedMotion ? 0 : 100, opacity: 0, filter: reducedMotion ? "blur(0px)" : "blur(10px)" },
        {
          y: reducedMotion ? 0 : -400,
          opacity: 1,
          filter: "blur(0px)",
          duration: reducedMotion ? 0.1 : 1.5,
          scrollTrigger: reducedMotion ? false : {
            trigger: sectionRef.current,
            start: "top 40%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Stars parallax effect (skip if reduced motion)
      if (!reducedMotion) {
        starsRef.current.forEach((star, index) => {
          const direction = index % 2 === 0 ? 1 : -1;
          const speed = 0.5 + Math.random() * 0.5;

          gsap.to(star, {
            x: `${direction * (100 + index * 20)}`,
            y: `${direction * (-50 + index * 10)}`,
            rotation: direction * 360,
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

    return () => {
      ctx.revert();
      // Kill all ScrollTriggers associated with this section
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === currentSection) {
          trigger.kill();
        }
      });
    };
  }, []);

  const addToStars = (el) => {
    if (el && !starsRef.current.includes(el)) {
      starsRef.current.push(el);
    }
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      className="h-screen relative overflow-hidden bg-gradient-to-b from-black to-[#070F32]"
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Stars Background */}
        {[...Array(10)].map((_, i) => (
          <div
            ref={addToStars}
            key={`star-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${10 + i * 3}px`,
              height: `${10 + i * 3}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: `blur(${Math.random() * 2}px)`,
              backgroundColor: "white",
              opacity: 0.2 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>
      <div className="container mx-auto px-4 h-full flex flex-col items-center justify-center">
        <h2
          ref={titleRef}
          className="text-4xl md:text-6xl font-bold sm:mb-16 text-center text-white opacity-0"
        >
          Über mich
        </h2>
      </div>

      <div
        ref={introRef}
        className="absolute lg:bottom-[-20rem] md:bottom-[-10rem] bottom-[-20rem] left-0 w-full flex md:flex-row flex-col justify-between lg:px-24 px-5 items-center opacity-0"
      >
        <h3 className="text-sm md:text-2xl font-bold text-blue-200 z-50 lg:max-w-[45rem] max-w-[27rem] tracking-wider md:mt-20 sm:mt-[-40rem] mt-[-32rem]">
          {" "}
          Ich bin ein selbsterlerneter und passionierter Full-Stack Software
          Entwickler mit einem Fokus auf die Entwicklung von Web- und
          Hybrid-Apps. Ich bin ein leidenschaftlicher Entwickler, der ständig
          neue Technologien erlernt und anwendet, um innovative Lösungen zu
          schaffen. Mein Schwerpunkt liegt auf der Erstellung robuster,
          benutzerfreundlicher und skalierbarer Software, die sowohl technische
          als auch wirtschaftliche Anforderungen erfüllt.{" "}
        </h3>

        <img
          className="lg:h-[40rem] md:h-[25rem] h-[20rem] mix-blend-lighten"
          src={meImage}
          alt="Lasse Siemoneit"
        />
      </div>
    </section>
  );
};

export default AboutSection;
