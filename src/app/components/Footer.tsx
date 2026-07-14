const footerLinks = [
  { label: "GitHub", href: "https://github.com" },
  { label: "Notes", href: `${import.meta.env.BASE_URL}#notes` },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-white">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="font-serif text-[0.95rem] font-medium text-ink mb-1">
            All Things I'm Learning
          </p>
          <p className="text-xs text-faint">
            Written with curiosity. Updated whenever something finally makes sense.
          </p>
        </div>

        <nav className="flex gap-6 flex-wrap">
          {footerLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-[0.85rem] text-subtle no-underline transition-colors hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
