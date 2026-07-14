import { useState } from "react";
import { Link } from "react-router";
import { notes, categories } from "../../data/notes";

export function NotesList() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? notes
      : notes.filter((n) => n.category === activeCategory);

  return (
    <section id="notes" className="max-w-[960px] mx-auto px-6 py-14">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-5 flex-wrap gap-4">
        <h2 className="text-sm font-semibold text-ink">Recent posts</h2>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-normal py-0.5 cursor-pointer bg-transparent border-b-[1.5px] transition-colors ${
                activeCategory === cat
                  ? "text-ink border-ink"
                  : "text-subtle border-transparent hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-hairline" />

      {filtered.map((note) => (
        <Link
          key={note.slug}
          to={`/notes/${note.slug}`}
          className="group block border-b border-hairline no-underline"
        >
          <div className="grid grid-cols-1 sm:grid-cols-[140px_160px_1fr] gap-4 py-5 items-center">
            <span className="hidden sm:block text-[0.8rem] text-subtle">
              {note.date}
            </span>

            <span className="hidden sm:block text-[0.8rem] text-subtle">
              {note.category}
            </span>

            <div className="flex items-center justify-between gap-4">
              <h3 className="font-serif text-[1.05rem] font-medium text-ink leading-[1.4] transition-colors group-hover:text-brand">
                {note.title}
              </h3>
              <div className="shrink-0 text-brand opacity-0 transition-opacity group-hover:opacity-100">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 12L12 4M12 4H6M12 4v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
