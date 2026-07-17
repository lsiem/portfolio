export interface CameraState {
  targetX: number;
  targetY: number;
  targetZ: number;
  targetRotY: number;
}

const coordinates: Record<string, CameraState> = {
  "/": { targetX: 0, targetY: 0, targetZ: 8, targetRotY: 0 },
  "/about": { targetX: -15, targetY: 0, targetZ: 8, targetRotY: 0.2 },
  "/impressum": { targetX: -15, targetY: -10, targetZ: 8, targetRotY: 0 },
  "/datenschutz": { targetX: -15, targetY: -20, targetZ: 8, targetRotY: 0 },
};

const getCoordinatesForPath = (pathname: string): CameraState => {
  // Strip language prefix if present (e.g. /de/about -> /about, /en -> /)
  let cleanPath = pathname;
  if (cleanPath.startsWith("/de")) {
    cleanPath = cleanPath.slice(3);
  } else if (cleanPath.startsWith("/en")) {
    cleanPath = cleanPath.slice(3);
  }
  
  if (!cleanPath) {
    cleanPath = "/";
  }

  if (coordinates[cleanPath]) {
    return coordinates[cleanPath];
  }
  
  if (cleanPath.startsWith("/case-studies/")) {
    const slug = cleanPath.replace("/case-studies/", "");
    if (slug === "elia") {
      return { targetX: 15, targetY: 0, targetZ: 8, targetRotY: -0.2 };
    }
    // Place other case studies slightly further to the right
    return { targetX: 30, targetY: 0, targetZ: 8, targetRotY: -0.25 };
  }
  
  return { targetX: 0, targetY: 0, targetZ: 8, targetRotY: 0 };
};

/**
 * Global navigation state store that hooks Next.js router events to R3F's camera coordinates.
 * By keeping this store vanilla, it can be read instantly on every frame without triggering
 * React component re-renders.
 */
export const sceneNavigation = {
  currentPath: "/",
  state: { targetX: 0, targetY: 0, targetZ: 8, targetRotY: 0 },
  listeners: new Set<() => void>(),

  setPath(pathname: string) {
    this.currentPath = pathname;
    this.state = getCoordinatesForPath(pathname);
    this.listeners.forEach((l) => l());
  },

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
};
