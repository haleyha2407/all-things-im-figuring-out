import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app/App.tsx";
import "highlight.js/styles/github.css"; // syntax-highlighting theme for code blocks
import "./styles/index.css";

// Vite injects BASE_URL from `base` in vite.config.ts (e.g. "/all-things-im-figuring-out/").
// react-router wants it without the trailing slash.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={basename}>
    <App />
  </BrowserRouter>,
);
