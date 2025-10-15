import { useRef, useCallback, useMemo } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "../utils/motion";
import { useGsapScroll } from "../hooks/useGsapScroll";
import meImage from "../assets/images/me.webp";

const AboutSection = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const introRef = useRef(null);
  const starsRef = useRef([]);

  // Generate star properties once on mount to prevent hydration mismatches
  const stars = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      width: 10 + i * 3,
      height: 10 + i * 3,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      blur: `${Math.random() * 2}px`,
      opacity: 0.2 + Math.random() * 0.4,
      speed: 0.5 + Math.random() * 0.5,
    }))
  , []);

  const setupAnimations = useCallback(() => {
    // Reset ref array to avoid duplicates across re-renders
    starsRef.current = starsRef.current.filter(el => el !== null && el !== undefined);

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
        if (!star) return;
        const direction = index % 2 === 0 ? 1 : -1;
        const speed = stars[index]?.speed || 0.5;

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
  }, [stars]);

  useGsapScroll(sectionRef, [], setupAnimations);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="h-screen relative overflow-hidden bg-gradient-to-b from-black to-[#070F32]"
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Stars Background */}
        {stars.map((star, i) => (
          <div
            ref={(el) => { starsRef.current[i] = el; }}
            key={`star-${star.id}`}
            className="absolute rounded-full"
            style={{
              width: `${star.width}px`,
              height: `${star.height}px`,
              top: star.top,
              left: star.left,
              filter: `blur(${star.blur})`,
              backgroundColor: "white",
              opacity: star.opacity,
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
