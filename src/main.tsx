import React from "react";
import ReactDOM from "react-dom/client";
import { consSettings } from "@core";
import App from "./App.tsx";

consSettings.blacklist = [];
consSettings.automaticTag = false;
consSettings.addBrowserLink = false;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
