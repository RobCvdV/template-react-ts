import React from "react";
import ReactDOM from "react-dom/client";
import { getNamedLogs } from "@core";
import App from "./App.tsx";

getNamedLogs({ name: "main" }).log("main", "start");
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
