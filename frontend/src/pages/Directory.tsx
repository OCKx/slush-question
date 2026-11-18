import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Kind, Profile, listProfiles } from "../lib/api";
const config = {
  investors: {
    tag: "INVESTOR PERSPECTIVES",
    title: "One question. Many convictions.",
    intro:
      "If you could bet your money on just one business, what would it be?",
  },
  startups: {
    tag: "THE STARTUP DIRECTORY",
    title: "Meet the startups.",
    intro: "Companies building what comes next.",
  },
  builders: {
    tag: "THE BUILDER DIRECTORY",
    title: "Meet the builders.",
    intro: "People turning ambitious ideas into real products.",
  },
};
export default function Directory({ kind }: { kind: Kind }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("All");
  const cfg = config[kind];
  useEffect(() => {
    setLoading(true);
    setError("");
    setSearch("");
    setTag("All");
    listProfiles(kind)
      .then(setProfiles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [kind]);
  const tags = useMemo(
    () => [
      "All",
      ...Array.from(new Set(profiles.flatMap((p) => p.categories))).sort(),
    ],
    [profiles],
  );
  const results = profiles.filter(
    (p) =>
      (tag === "All" || p.categories.includes(tag)) &&
      [p.name, p.company, p.project, p.description, p.answer, ...p.categories]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="container-wide py-16 sm:py-24">
      <div className="max-w-3xl">
        <p className="text-lime text-xs tracking-[.24em] font-bold mb-6">
          {cfg.tag}
        </p>
        <h1 className="text-4xl sm:text-6xl leading-[1.1] tracking-tight font-semibold">
          {cfg.title}
        </h1>
        <p className="text-muted text-lg mt-5">{cfg.intro}</p>
      </div>
      <div className="mt-14 mb-8 flex flex-col gap-5">
        <label className="relative max-w-lg">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            size={19}
          />
          <input
            aria-label="Search profiles"
            className="input pl-12"
            placeholder={`Search ${kind}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`px-4 py-2 rounded-full border text-xs transition ${tag === t ? "bg-lime border-lime text-ink font-bold" : "border-white/15 text-muted hover:text-white hover:border-white/40"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <div className="notice">
          Unable to load profiles: {error}. Check that the backend is running.
        </div>
      )}
      {loading ? (
        <p className="text-muted py-10">Loading profiles…</p>
      ) : !error && results.length === 0 ? (
        <div className="rounded-2xl border border-white/10 p-10 text-center text-muted">
          {profiles.length
            ? "No profiles match this search."
            : "No published profiles yet. Check back soon."}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {results.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl border border-white/10 bg-panel p-7 flex flex-col gap-5"
            >
              <div className="flex justify-between gap-4 items-start">
                <div className="min-w-0">
                  <div className="text-lime text-xs mb-2 uppercase tracking-widest">
                    {kind === "investors"
                      ? "Investor"
                      : kind === "startups"
                        ? "Startup"
                        : "Builder"}
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {p.name}
                  </h2>
                  {p.company && (
                    <p className="text-muted text-sm mt-1">{p.company}</p>
                  )}
                </div>
                {p.linkedin && (
                  <a
                    className="p-2 rounded-lg border border-white/10 text-muted hover:text-lime"
                    aria-label={`LinkedIn: ${p.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={p.linkedin}
                  >
                    <ExternalLink size={19} />
                  </a>
                )}
              </div>
              <p className="text-white/80 leading-relaxed flex-1 whitespace-pre-wrap">
                {kind === "investors"
                  ? p.answer
                  : kind === "startups"
                    ? p.description
                    : p.project}
              </p>
              <div className="flex flex-wrap gap-2">
                {p.categories.map((t) => (
                  <span
                    key={t}
                    className="text-xs rounded-full bg-white/5 text-muted px-3 py-1.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="mt-16 border-t border-white/10 pt-8 flex items-center justify-between text-muted text-sm">
        <span>Shared with permission. Independent community project.</span>
        <Link className="text-lime inline-flex gap-1 items-center" to="/about">
          About this project <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
  );
}
