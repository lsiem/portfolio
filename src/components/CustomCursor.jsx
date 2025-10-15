import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const CustomCursor = () => {
  // Refs for cursor elements
  const cursorRef = useRef(null);
  const cursorBorderRef = useRef(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // SSR guard
    if (typeof window === "undefined") {
      return;
    }

    // Check localStorage preference
    const savedPref = localStorage.getItem('customCursorEnabled');

    // Check system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFineMouse = window.matchMedia('(pointer: fine) and (min-width: 769px)').matches;

    // Determine if custom cursor should be enabled
    // Priority: localStorage > reduced motion preference > device capability
    let shouldEnable = false;
    if (savedPref !== null) {
      shouldEnable = savedPref === 'true';
    } else {
      shouldEnable = hasFineMouse && !prefersReducedMotion;
    }

    setIsEnabled(shouldEnable);

    // Add or remove custom cursor class based on support
    if (shouldEnable) {
      document.documentElement.classList.add("has-custom-cursor");
    } else {
      document.documentElement.classList.remove("has-custom-cursor");
    }
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    // Get cursor elements
    const cursor = cursorRef.current;
    const cursorBorder = cursorBorderRef.current;

    if (!cursor || !cursorBorder) {
      return;
    }

    // Initial position off-screen so animation feels snappy
    gsap.set([cursor, cursorBorder], { xPercent: -50, yPercent: -50 });

    // Variables for cursor position with different speeds
    const xTo = gsap.quickTo(cursor, "x", {
      duration: 0.2,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(cursor, "y", {
      duration: 0.2,
      ease: "power3.out",
    });

    const xToBorder = gsap.quickTo(cursorBorder, "x", {
      duration: 0.5,
      ease: "power.out",
    });
    const yToBorder = gsap.quickTo(cursorBorder, "y", {
      duration: 0.5,
      ease: "power3.out",
    });

    // Mouse move handler keeps cursor and border in sync
    const moveHandler = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
      xToBorder(e.clientX);
      yToBorder(e.clientY);
    };

    const mouseDownHandler = () => {
      gsap.to(cursor, { scale: 0.6, duration: 0.15 });
    };

    const mouseUpHandler = () => {
      gsap.to(cursor, { scale: 1, duration: 0.15 });
    };

    window.addEventListener("mousemove", moveHandler);
    document.addEventListener("mousedown", mouseDownHandler);
    document.addEventListener("mouseup", mouseUpHandler);

    return () => {
      window.removeEventListener("mousemove", moveHandler);
      document.removeEventListener("mousedown", mouseDownHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div>
      {/* Cursor Elements */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-[20px] h-[20px] bg-white rounded-full pointer-events-none z-[999] mix-blend-difference"
      />

      <div
        ref={cursorBorderRef}
        className="fixed top-0 left-0 w-[40px] h-[40px] border-2 border-white rounded-full pointer-events-none z-[999] mix-blend-difference opacity-50"
      />
    </div>
  );
};

export default CustomCursor;
