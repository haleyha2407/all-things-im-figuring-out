import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import { HomePage } from "./pages/HomePage";

// Lazy-load the note page so react-markdown + highlight.js load only when a
// post is opened — the home page (list) stays lightweight.
const NotePage = lazy(() =>
  import("./pages/NotePage").then((m) => ({ default: m.NotePage })),
);

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/notes/:slug" element={<NotePage />} />
      </Routes>
    </Suspense>
  );
}
