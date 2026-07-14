import { ImageWithFallback } from "./figma/ImageWithFallback";

const foxImg =
  "https://png.pngtree.com/png-clipart/20240819/original/pngtree-cute-fox-animal-illustration-png-image_15802374.png";

export function Hero({ onReadNotes }: { onReadNotes: () => void }) {
  return (
    <section className="max-w-[960px] mx-auto px-6 pt-20 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
        {/* Left */}
        <div>
          <h1 className="font-serif text-[3rem] lg:text-[5.5rem] font-medium text-mist leading-[1.05] tracking-[-0.02em] mb-6">
            All Things
            <br />
            <em className="italic font-normal text-cyan whitespace-nowrap">
              I'm Learning
            </em>
          </h1>

          <p className="text-base text-body leading-[1.65] max-w-[380px] mb-9">
            Notes from building, breaking, debugging, and understanding software
            systems. A backend engineer writing in public.
          </p>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={onReadNotes}
              className="text-[0.95rem] font-semibold text-white bg-leaf hover:bg-leaf-dark px-7 py-3 rounded-lg cursor-pointer tracking-[0.01em] shadow-[0_2px_12px_rgba(70,192,122,0.45)] hover:shadow-[0_4px_20px_rgba(110,209,150,0.5)] hover:-translate-y-px transition-all duration-150"
            >
              Read the notes →
            </button>
          </div>
        </div>

        {/* Right: fox */}
        <div className="flex justify-end">
          <div className="w-[min(360px,90vw)]">
            <ImageWithFallback
              src={foxImg}
              alt="Cute fox illustration"
              className="block w-full h-auto"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-hairline mt-12" />
    </section>
  );
}
