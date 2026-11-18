import { useEffect, useState } from "react";
import { LogOut, Plus, Pencil, Trash2, X, Save } from "lucide-react";
import {
  Kind,
  Profile,
  ProfileInput,
  api,
  listProfiles,
  removeProfile,
  saveProfile,
} from "../lib/api";
const kinds: Kind[] = ["investors", "startups", "builders"];
const empty: ProfileInput = {
  name: "",
  company: "",
  description: "",
  project: "",
  answer: "",
  linkedin: "",
  categories: [],
  published: false,
};
export default function Admin() {
  const [logged, setLogged] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [kind, setKind] = useState<Kind>("investors");
  const [items, setItems] = useState<Profile[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileInput>(empty);
  const [tags, setTags] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = () =>
    listProfiles(kind, true)
      .then(setItems)
      .catch((e) => setError(e.message));
  useEffect(() => {
    api<{ authenticated: boolean }>("/auth/me")
      .then((x) => setLogged(x.authenticated))
      .catch(() => setLogged(false));
  }, []);
  useEffect(() => {
    if (logged) refresh();
  }, [kind, logged]);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setPassword("");
      setLogged(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    setLogged(false);
  }
  function edit(p?: Profile) {
    setEditing(p?.id || "new");
    setForm(
      p
        ? {
            name: p.name,
            company: p.company || "",
            description: p.description || "",
            project: p.project || "",
            answer: p.answer || "",
            linkedin: p.linkedin || "",
            categories: p.categories,
            published: p.published,
          }
        : { ...empty },
    );
    setTags(p?.categories.join(", ") || "");
    setError("");
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await saveProfile(
        kind,
        {
          ...form,
          categories: tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
        editing === "new" ? undefined : editing!,
      );
      setEditing(null);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function del(p: Profile) {
    if (!window.confirm(`Delete ${p.name}? This cannot be undone.`)) return;
    try {
      await removeProfile(kind, p.id);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const update = (field: keyof ProfileInput, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));
  if (logged === null)
    return (
      <div className="container-wide py-20 text-muted">
        Checking admin session…
      </div>
    );
  if (!logged)
    return (
      <div className="container-wide py-24">
        <form
          onSubmit={login}
          className="max-w-md mx-auto border border-white/10 bg-panel rounded-2xl p-8 space-y-5"
        >
          <p className="text-lime uppercase tracking-widest text-xs">
            Private access
          </p>
          <h1 className="text-3xl font-semibold">Admin sign in</h1>
          <p className="text-muted text-sm">
            Only the site administrator can edit profiles.
          </p>
          <label className="block text-sm">
            Email
            <input
              className="input mt-2"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            Password
            <input
              className="input mt-2"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <p role="alert" className="text-red-300 text-sm">
              {error}
            </p>
          )}
          <button
            disabled={busy}
            className="button-primary w-full justify-center"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  return (
    <div className="container-wide py-14 sm:py-20">
      <div className="flex flex-wrap gap-5 justify-between items-center mb-8">
        <div>
          <p className="text-lime text-xs tracking-widest mb-2">
            PRIVATE DASHBOARD
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">
            Manage profiles
          </h1>
        </div>
        <button onClick={logout} className="button-quiet">
          <LogOut size={16} /> Sign out
        </button>
      </div>
      <div className="flex flex-wrap justify-between gap-4 items-center mb-7">
        <div className="flex flex-wrap gap-2">
          {kinds.map((k) => (
            <button
              key={k}
              onClick={() => {
                setKind(k);
                setEditing(null);
              }}
              className={`rounded-lg px-4 py-2 capitalize text-sm ${kind === k ? "bg-lime text-ink font-bold" : "bg-panel text-muted hover:text-white"}`}
            >
              {k}
            </button>
          ))}
        </div>
        <button className="button-primary" onClick={() => edit()}>
          <Plus size={17} /> Add{" "}
          {kind.slice(0, -1) === "startup" ? "startup" : kind.slice(0, -1)}
        </button>
      </div>
      {error && (
        <p role="alert" className="notice mb-5">
          {error}
        </p>
      )}
      {editing && (
        <form
          onSubmit={save}
          className="rounded-2xl border border-lime/30 bg-panel p-6 mb-8 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {editing === "new" ? "New" : "Edit"} {kind.slice(0, -1)}
            </h2>
            <button
              type="button"
              aria-label="Close form"
              onClick={() => setEditing(null)}
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm">
              Name *
              <input
                required
                maxLength={120}
                className="input mt-2"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </label>
            {kind === "startups" && (
              <label className="text-sm">
                Company *
                <input
                  required
                  maxLength={120}
                  className="input mt-2"
                  value={form.company || ""}
                  onChange={(e) => update("company", e.target.value)}
                />
              </label>
            )}
            <label className="text-sm">
              LinkedIn URL (optional)
              <input
                type="url"
                className="input mt-2"
                placeholder="https://linkedin.com/in/..."
                value={form.linkedin || ""}
                onChange={(e) => update("linkedin", e.target.value)}
              />
            </label>
            <label className="text-sm">
              Categories (comma-separated)
              <input
                className="input mt-2"
                placeholder="AI, Fintech, Climate Tech"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </label>
          </div>
          <label className="block text-sm">
            {kind === "investors"
              ? "Answer *"
              : kind === "startups"
                ? "What is the startup about? *"
                : "What are they building? *"}
            <textarea
              required
              className="input mt-2 min-h-32 resize-y"
              maxLength={5000}
              value={
                kind === "investors"
                  ? form.answer || ""
                  : kind === "startups"
                    ? form.description || ""
                    : form.project || ""
              }
              onChange={(e) =>
                update(
                  kind === "investors"
                    ? "answer"
                    : kind === "startups"
                      ? "description"
                      : "project",
                  e.target.value,
                )
              }
            />
          </label>
          <label className="flex gap-2 items-center text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => update("published", e.target.checked)}
            />{" "}
            Publish this profile publicly (only with permission)
          </label>
          <div className="flex flex-wrap gap-3">
            <button className="button-primary" disabled={busy}>
              <Save size={17} /> {busy ? "Saving…" : "Save profile"}
            </button>
            <button
              type="button"
              className="button-quiet"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="border border-white/10 rounded-2xl overflow-hidden">
        {items.length === 0 ? (
          <p className="p-8 text-muted">
            No {kind} yet. Add the first one above.
          </p>
        ) : (
          items.map((p, i) => (
            <div
              key={p.id}
              className={`flex gap-4 items-center justify-between p-5 ${i ? "border-t border-white/10" : ""}`}
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-muted text-xs mt-1">
                  {p.company ? p.company + " · " : ""}
                  {p.published ? "Published" : "Draft"} ·{" "}
                  {p.categories.join(", ") || "No categories"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  aria-label={`Edit ${p.name}`}
                  onClick={() => edit(p)}
                  className="button-quiet"
                >
                  <Pencil size={16} />
                </button>
                <button
                  aria-label={`Delete ${p.name}`}
                  onClick={() => del(p)}
                  className="button-quiet text-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
