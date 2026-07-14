export type Note = {
  slug: string;
  date: string; // display, e.g. "May 28, 2026"
  isoDate: string; // raw frontmatter date, used for sorting
  category: string;
  title: string;
  excerpt: string;
  body: string; // markdown
};

// Load every post under src/content as a raw string at build time.
// Add a .md file there — at the top level or in any subfolder — and it becomes
// a note with a /notes/<slug> page. Subfolders are for your own organization
// only; the topic comes from the `category` frontmatter, never the folder.
// The slug is the filename, so keep filenames unique across folders.
const modules = import.meta.glob("../content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Format an ISO date without going through Date(), to avoid timezone shifts.
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

// Minimal YAML-frontmatter parser: `key: value` lines between --- fences.
// Splits on the first colon so titles/excerpts may contain colons.
function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { data: {}, content: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    data[key] = value;
  }
  return { data, content: raw.slice(match[0].length) };
}

export const notes: Note[] = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    const { data, content } = parseFrontmatter(raw);
    return {
      slug,
      isoDate: data.date ?? "",
      date: formatDate(data.date ?? ""),
      category: data.category ?? "Uncategorized",
      title: data.title ?? slug,
      excerpt: data.excerpt ?? "",
      body: content.trim(),
    };
  })
  .sort((a, b) => (a.isoDate < b.isoDate ? 1 : -1)); // newest first

// "All" plus each category as it first appears (newest post wins ordering).
export const categories = ["All", ...Array.from(new Set(notes.map((n) => n.category)))];

export function getNote(slug: string): Note | undefined {
  return notes.find((n) => n.slug === slug);
}
