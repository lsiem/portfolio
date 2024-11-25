import React, { ReactNode, useState, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Header from "./components/header/Header";
import Home from "./pages/home/HomeComponent";
import Footer from "./components/footer/Footer";
import Imprint from "./pages/imprint/Imprint";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { CircularProgress } from "@mui/material";
import getTheme from "./theme";
import GlobalStyles from "./global";
import Contact from "./containers/contact/Contact";

// Lazy load other pages
const Projects = React.lazy(() => import("./pages/projects/Projects"));
const About = React.lazy(() => import("./pages/about/About"));

interface LayoutProps {
  children: ReactNode;
  onToggleTheme: () => void;
  theme: ReturnType<typeof getTheme>;
}

const Layout: React.FC<LayoutProps> = ({ children, onToggleTheme, theme }) => (
  <div
    style={{
      backgroundColor: theme.palette.background.default,
      minHeight: "100vh",
    }}
  >
    <Header />
    <div className="app-content">
      <Suspense
        fallback={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
    <Footer onToggleTheme={onToggleTheme} theme={theme} />
  </div>
);

const router = (
  onToggleTheme: () => void,
  theme: ReturnType<typeof getTheme>,
) =>
  createBrowserRouter([
    {
      path: "/",
      element: (
        <Layout onToggleTheme={onToggleTheme} theme={theme}>
          <Home />
        </Layout>
      ),
    },
    {
      path: "/projects",
      element: (
        <Layout onToggleTheme={onToggleTheme} theme={theme}>
          <Projects />
        </Layout>
      ),
    },
    {
      path: "/about",
      element: (
        <Layout onToggleTheme={onToggleTheme} theme={theme}>
          <About />
        </Layout>
      ),
    },
    {
      path: "/contact",
      element: (
        <Layout onToggleTheme={onToggleTheme} theme={theme}>
          <Contact />
        </Layout>
      ),
    },
    {
      path: "/imprint",
      element: (
        <Layout onToggleTheme={onToggleTheme} theme={theme}>
          <Imprint />
        </Layout>
      ),
    },
  ]);

const App: React.FC = () => {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const savedMode = localStorage.getItem("theme-mode");
    return savedMode === "light" || savedMode === "dark" ? savedMode : "dark";
  });

  const theme = getTheme(mode);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("theme-mode", newMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles />
      <RouterProvider router={router(toggleTheme, theme)} />
    </ThemeProvider>
  );
};

export default App;
