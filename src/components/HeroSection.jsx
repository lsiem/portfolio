import { motion } from "framer-motion";
import { useState } from "react";
import Spline from "@splinetool/react-spline";
import ErrorBoundary from "./ErrorBoundary";
import { uiText } from "../config/personal";

const HeroSection = () => {
  const [splineLoading, setSplineLoading] = useState(true);
  const [splineError, setSplineError] = useState(false);
  const [splineKey, setSplineKey] = useState(0);

  const handleSplineLoad = () => {
    setSplineLoading(false);
    setSplineError(false);
  };

  const handleSplineError = () => {
    setSplineLoading(false);
    setSplineError(true);
  };

  const handleRetry = () => {
    setSplineLoading(true);
    setSplineError(false);
    // Force remount by incrementing the key
    setSplineKey((prevKey) => prevKey + 1);
  };

  return (
    <section id="home" className="relative flex min-h-screen flex-col-reverse items-center justify-center gap-16 overflow-hidden bg-gradient-to-b from-blue-900 to-black px-10 py-20 lg:flex-row lg:justify-between lg:px-24">
      <div className="relative z-40 flex max-w-3xl flex-1 flex-col items-center gap-6 text-center lg:items-start lg:text-left">
        <motion.h1
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 40,
            damping: 25,
            delay: 1.3,
            duration: 1.5,
          }}
          className="text-5xl font-bold lg:text-7xl xl:text-8xl"
        >
          Hi, Ich bin Lasse
        </motion.h1>

        <motion.p
          className="text-xl text-blue-200 md:text-2xl"
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 40,
            damping: 25,
            delay: 1.8,
            duration: 1.5,
          }}
        >
          Ich bin ein selbsterlerneter und passionierter Full-Stack Software
          Entwickler mit einem Fokus auf die Entwicklung von Web- und
          Hybrid-Apps.
        </motion.p>
      </div>

      {/* Spline 3D scene with loading and error states */}
      <div className="absolute xl:right-[-28%] right-0 top-[-20%] lg:top-0 w-full h-full">
        {splineLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-blue-300 text-lg animate-pulse">
              {uiText.spline3D.loading}
            </div>
          </div>
        )}

        {splineError && (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 p-6">
            <div className="text-blue-300 text-lg text-center">
              {uiText.spline3D.error}
            </div>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-900"
            >
              {uiText.spline3D.retry}
            </button>
          </div>
        )}

        {!splineError && (
          <ErrorBoundary>
            <Spline
              key={splineKey}
              className="w-full h-full"
              scene="https://prod.spline.design/jGMQp1lHBPya2w37/scene.splinecode"
              onLoad={handleSplineLoad}
              onError={handleSplineError}
            />
          </ErrorBoundary>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
