import { Link, NavLink, Outlet } from "react-router-dom";
import { ArrowUpRight, Asterisk } from "lucide-react";
const links = [
  ["/investors", "Investors"],
  ["/startups", "Startups"],
  ["/builders", "Builders"],
];
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10">
        <div className="container-wide h-20 flex items-center justify-between gap-5">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-white font-semibold tracking-tight"
          >
            <span className="rounded-lg bg-lime p-1.5 text-ink">
              <Asterisk size={18} strokeWidth={2.7} />
            </span>
            <span>
              the slush question<span className="text-lime">.</span>
            </span>
          </Link>
          <nav className="flex gap-4 sm:gap-8 text-sm text-muted">
            {links.map(([href, label]) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) =>
                  isActive ? "text-lime" : "hover:text-white transition"
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-white/10">
        <div className="container-wide py-7 flex flex-col sm:flex-row gap-3 justify-between text-xs text-muted">
          <span>
            Independent perspectives from Slush 2026 · Helsinki, 18–19 November
          </span>
          <div className="flex gap-5">
            <Link className="hover:text-white" to="/about">
              About
            </Link>
            <Link
              className="hover:text-white inline-flex items-center gap-1"
              to="/admin"
            >
              Admin <ArrowUpRight size={12} />
            </Link>
          </div>
          <span>Not affiliated with or endorsed by Slush.</span>
        </div>
      </footer>
    </div>
  );
}
