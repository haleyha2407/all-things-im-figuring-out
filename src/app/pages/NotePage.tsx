import { useEffect } from "react";
import { Link, useParams } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import { Footer } from "../components/Footer";
import { getNote } from "../../data/notes";

// Only register the languages this blog uses. Passing `languages` replaces
// highlight.js's default ~35-language "common" bundle, keeping the JS small.
const hljsLanguages = {
  python,
  typescript,
  ts: typescript,
  javascript: typescript,
  js: typescript,
  bash,
  sh: bash,
  json,
  yaml,
};

export function NotePage() {
  const { slug } = useParams();
  const note = slug ? getNote(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-[720px] mx-auto px-6 pt-20 pb-24">
        <Link
          to="/#notes"
          className="text-[0.85rem] text-subtle no-underline transition-colors hover:text-ink"
        >
          ← All notes
        </Link>

        {note ? (
          <>
            <div className="mt-8 flex items-center gap-3 text-[0.8rem] text-subtle">
              <span>{note.date}</span>
              <span aria-hidden>·</span>
              <span className="text-brand">{note.category}</span>
            </div>

            <h1 className="font-serif text-[2.25rem] font-medium text-ink leading-[1.2] tracking-[-0.01em] mt-3 mb-8">
              {note.title}
            </h1>

            <div className="post">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeHighlight, { languages: hljsLanguages }]]}
              >
                {note.body}
              </ReactMarkdown>
            </div>
          </>
        ) : (
          <div className="mt-16 text-center">
            <h1 className="font-serif text-[2rem] font-medium text-ink mb-3">
              Note not found
            </h1>
            <p className="text-body mb-8">
              This note doesn't exist — it may have been moved or renamed.
            </p>
            <Link
              to="/#notes"
              className="text-[0.9rem] font-medium text-white bg-leaf hover:bg-leaf-dark no-underline px-6 py-3 rounded-lg transition-colors"
            >
              Back to all notes
            </Link>
          </div>
        )}
      </article>

      <Footer />
    </div>
  );
}
