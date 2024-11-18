import React, { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Header from "./components/header/Header";
import Home from "./pages/home/HomeComponent";
import Footer from "./components/footer/Footer";
import Imprint from "./pages/imprint/Imprint";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { CircularProgress } from "@mui/material";
import theme from "./theme";

// Lazy load other pages
const Projects = React.lazy(() => import("./pages/projects/Projects"));
const About = React.lazy(() => import("./pages/about/About"));
const Contact = React.lazy(() => import("./pages/contact/ContactComponent"));

const Layout = ({ children }) => (
  <div>
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
    <Footer />
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: "/projects",
    element: (
      <Layout>
        <Projects />
      </Layout>
    ),
  },
  {
    path: "/about",
    element: (
      <Layout>
        <About />
      </Layout>
    ),
  },
  {
    path: "/contact",
    element: (
      <Layout>
        <Contact />
      </Layout>
    ),
  },
  {
    path: "/imprint",
    element: (
      <Layout>
        <Imprint />
      </Layout>
    ),
  },
]);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
