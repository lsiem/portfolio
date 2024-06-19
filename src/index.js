import React from "react";
import ReactDOM from "react-dom";
import { BaseProvider, LightTheme } from "baseui";
import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-monolithic";
import { HelmetProvider } from "react-helmet-async";

import "./index.css";
import reportWebVitals from "./reportWebVitals";
import App from "./App";

const engine = new Styletron();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <StyletronProvider value={engine}>
        <BaseProvider theme={LightTheme}>
          <App />
        </BaseProvider>
      </StyletronProvider>
    </HelmetProvider>
  </React.StrictMode>
);

reportWebVitals();
