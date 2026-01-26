import { useState, useEffect, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaCheckCircle,
  FaRocket,
} from "react-icons/fa";
import { personalInfo, uiText } from "../config/personal";

const CodeSymbol = ({
  char,
  x,
  y,
  size,
  blur,
  opacity,
  mouseX,
  mouseY,
  speedMultiplier,
}) => {
  const springConfig = { damping: 25, stiffness: 150 };
  const moveX = useSpring(
    useTransform(
      mouseX,
      [-500, 500],
      [x - 30 * speedMultiplier, x + 30 * speedMultiplier],
    ),
    springConfig,
  );
  const moveY = useSpring(
    useTransform(
      mouseY,
      [-500, 500],
      [y - 30 * speedMultiplier, y + 30 * speedMultiplier],
    ),
    springConfig,
  );

  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        fontSize: size,
        filter: `blur(${blur}px)`,
        opacity: opacity,
        x: moveX,
        y: moveY,
        pointerEvents: "none",
        userSelect: "none",
        color: "#3b82f6", // blue-500
      }}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 5 / speedMultiplier,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {char}
    </motion.div>
  );
};

export default function MaintenanceMode() {
  const [percent, setPercent] = useState(0);
  const [isHoveringCTA, setIsHoveringCTA] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const symbols = useMemo(() => {
    const chars = ["{ }", "</>", "[ ]", "( )", "=>", "import", "const"];
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      char: chars[Math.floor(Math.random() * chars.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (40 - 15) + 15,
      blur: Math.random() * 3,
      opacity: Math.random() * (0.4 - 0.1) + 0.1,
    }));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = clientX - window.innerWidth / 2;
      const y = clientY - window.innerHeight / 2;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const duration = 3000; // 3 seconds
    const target = 90;
    const startTime = Date.now();

    const update = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentPercent = Math.floor(progress * target);
      setPercent(currentPercent);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    update();
  }, []);

  const speedMultiplier = isHoveringCTA ? 2.5 : 1;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-blue-900 to-black overflow-hidden flex flex-col items-center justify-center text-white p-6">
      {/* Background Parallax Elements */}
      <div className="absolute inset-0 z-0">
        {symbols.map((s) => (
          <CodeSymbol
            key={s.id}
            {...s}
            mouseX={mouseX}
            mouseY={mouseY}
            speedMultiplier={speedMultiplier}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        className="z-10 text-center max-w-2xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white mb-4"
          variants={itemVariants}
        >
          {uiText.maintenance.title}
        </motion.h1>

        <motion.p
          className="text-blue-200 text-lg md:text-xl mb-12"
          variants={itemVariants}
        >
          {uiText.maintenance.subtitle}
        </motion.p>

        {/* LinkedIn CTA */}
        <motion.div variants={itemVariants} className="mb-16">
          <motion.a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full font-bold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-shadow group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHoveringCTA(true)}
            onHoverEnd={() => setIsHoveringCTA(false)}
          >
            <FaLinkedin className="text-2xl" />
            {uiText.maintenance.cta}
          </motion.a>
        </motion.div>

        {/* Roadmap */}
        <motion.div
          variants={itemVariants}
          className="space-y-6 bg-black/30 backdrop-blur-sm p-8 rounded-2xl border border-blue-500/20"
        >
          <div className="flex flex-col gap-6 text-left">
            {uiText.maintenance.roadmap.map((step) => (
              <div key={step.id} className="flex items-center gap-4">
                <div
                  className={`text-2xl ${step.completed ? "text-green-400" : step.isCurrent ? "text-blue-400 animate-pulse" : "text-gray-500"}`}
                >
                  {step.completed ? <FaCheckCircle /> : <FaRocket />}
                </div>
                <div className="flex-1">
                  <span
                    className={`text-lg ${step.completed ? "text-white/70 line-through decoration-blue-500/50" : step.isCurrent ? "text-white font-semibold" : "text-gray-500"}`}
                  >
                    {step.title}
                  </span>
                  {step.isCurrent && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2 text-blue-200">
                        <span>{uiText.maintenance.progressLabel}</span>
                        <span className="font-mono">{percent}%</span>
                      </div>
                      <div className="h-3 w-full bg-blue-900/40 rounded-full overflow-hidden border border-blue-500/20">
                        <motion.div
                          className="h-full rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                          initial={{ width: "0%" }}
                          animate={{
                            width: `${percent}%`,
                            backgroundColor:
                              percent >= 90 ? "#22d3ee" : "#2563eb", // cyan-400 : blue-600
                          }}
                          transition={{
                            backgroundColor: { duration: 0.5 },
                            width: { duration: 0.1 },
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <motion.p
            className="text-blue-300 italic pt-4"
            animate={{ opacity: percent >= 90 ? [0.6, 1, 0.6] : 0.6 }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {uiText.maintenance.footer}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Footer Links */}
      <motion.footer
        className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 text-blue-300/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <a
          href={personalInfo.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-white transition-colors"
        >
          <FaGithub /> GitHub
        </a>
        <a
          href={`mailto:${personalInfo.email}`}
          className="flex items-center gap-2 hover:text-white transition-colors"
        >
          <FaEnvelope /> {personalInfo.email}
        </a>
      </motion.footer>
    </div>
  );
}
