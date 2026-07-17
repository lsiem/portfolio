"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { sceneNavigation } from "./navigation-store";

export interface SceneData {
  career?: readonly any[];
  projects?: readonly any[];
  skills?: readonly any[];
  contact?: any;
  aboutPage?: any;
  activeCaseStudy?: any;
  activeProsePage?: any;
}

interface SceneContextType {
  data: SceneData;
  setData: (data: SceneData) => void;
  pathname: string;
}

const SceneContext = createContext<SceneContextType | undefined>(undefined);

export function SceneProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [data, setData] = useState<SceneData>({});

  // Sync pathname changes to the global navigation-store
  useEffect(() => {
    sceneNavigation.setPath(pathname);
  }, [pathname]);

  return (
    <SceneContext.Provider value={{ data, setData, pathname }}>
      {children}
    </SceneContext.Provider>
  );
}

export function useScene() {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error("useScene must be used within a SceneProvider");
  }
  return context;
}

/** Client component to register data inside pages */
export function SceneDataRegistrar({ data }: { data: SceneData }) {
  const { setData } = useScene();

  useEffect(() => {
    setData(data);
    // Cleanup data when unmounting page
    return () => setData({});
  }, [data, setData]);

  return null;
}
