import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Landmark,
  Rocket,
  Code2,
} from "lucide-react";
export default function Home() {
  const cards = [
    {
      to: "/investors",
      title: "Investors",
      description: "The ideas they would back.",
      icon: Landmark,
    },
    {
      to: "/startups",
      title: "Startups",
      description: "The companies shaping tomorrow.",
      icon: Rocket,
    },
    {
      to: "/builders",
      title: "Builders",
      description: "The people making things happen.",
      icon: Code2,
    },
  ];
  return (
    <div className="container-wide">
      <section className="min-h-[min(680px,75vh)] flex flex-col items-center justify-center text-center py-20">
        <div className="eyebrow mb-9">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-lime" />{" "}
          HELSINKI · 18—19 NOVEMBER 2026
        </div>
        <p className="text-lime uppercase tracking-[.24em] text-xs font-semibold mb-6">
          One question. Different perspectives.
        </p>
        <h1 className="max-w-4xl text-[clamp(2.5rem,6.3vw,5.7rem)] font-semibold leading-[1.08] tracking-[-.058em]">
          If you could bet your money on{" "}
          <span className="text-lime">one business</span>, what would it be?
        </h1>
        <p className="max-w-xl text-muted text-base sm:text-lg leading-relaxed mt-7">
          Hear what investors believe in, discover ambitious startups, and meet
          the builders behind the ideas.
        </p>
        <Link to="/investors" className="button-primary mt-10">
          View investors’ answers <ArrowUpRight size={18} />
        </Link>
        <p className="text-muted/70 text-xs mt-6">
          Collected independently at Slush 2026
        </p>
      </section>
      <section className="pb-24">
        <div className="flex items-center gap-4 mb-6">
          <p className="text-xs text-muted tracking-[.2em] uppercase">
            Explore the community
          </p>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {cards.map(({ to, title, description, icon: Icon }, i) => (
            <Link
              to={to}
              key={to}
              className="group rounded-2xl border border-white/10 bg-panel p-7 hover:border-lime/50 transition flex flex-col min-h-48"
            >
              <div className="flex justify-between items-start">
                <Icon size={24} className="text-lime" />
                <span className="text-xs text-muted">0{i + 1}</span>
              </div>
              <div className="mt-auto flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-semibold">{title}</h2>
                  <p className="text-muted text-sm mt-1">{description}</p>
                </div>
                <ArrowRight
                  size={20}
                  className="text-muted group-hover:text-lime group-hover:translate-x-1 transition"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
