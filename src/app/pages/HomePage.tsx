import { Hero } from "../components/Hero";
import { NotesList } from "../components/NotesList";
import { Footer } from "../components/Footer";

export function HomePage() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      <Hero onReadNotes={() => scrollTo("notes")} />
      <NotesList />
      <Footer />
    </div>
  );
}
