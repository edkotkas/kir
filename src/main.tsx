import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import { ShellGuards } from "./components/ShellGuards";
import "./index.css";
import { QrStoreProvider } from "./store/QrStore";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ShellGuards />
      <QrStoreProvider>
        <App />
      </QrStoreProvider>
    </BrowserRouter>
  </StrictMode>
);
