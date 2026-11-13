"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp, ArrowUpRight, Bookmark, Check, ChevronDown, Command,
  ExternalLink, Github, Grid2X2, LayoutList, Moon, Search, SlidersHorizontal,
  Sparkles, Sun, X,
} from "lucide-react";
import type { Repository } from "@/lib/types";
import { CATEGORY_NAMES } from "@/lib/categories";

type Payload = { username: string; count: number; syncedAt: string; repositories: Repository[] };

const fmt = (n: number) => n.toLocaleString("en-US");
const timeAgo = (date: string) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export default function Directory() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All projects");
  const [sort, setSort] = useState("recent");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState("All languages");

  async function load(force = false) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/repositories${force ? `?refresh=${Date.now()}` : ""}`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Could not load repositories.");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load repositories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem("starbase-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(saved === "dark" || saved === "light" ? saved : preferred);
    void load();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("starbase-theme", theme);
  }, [theme]);

  const languages = useMemo(() => {
    const unique = Array.from(new Set((data?.repositories ?? []).map(r => r.language).filter(Boolean) as string[])).sort();
    return ["All languages", ...unique];
  }, [data]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const repo of data?.repositories ?? []) for (const c of repo.categories) map.set(c, (map.get(c) ?? 0) + 1);
    return map;
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (data?.repositories ?? []).filter(repo => {
      const matchesQuery = !q || [repo.name, repo.full_name, repo.description ?? "", repo.language ?? "", ...repo.topics].join(" ").toLowerCase().includes(q);
      const matchesCategory = category === "All projects" || repo.categories.includes(category);
      const matchesLanguage = language === "All languages" || repo.language === language;
      return matchesQuery && matchesCategory && matchesLanguage;
    });
    return list.sort((a, b) => {
      if (sort === "stars") return b.stargazers_count - a.stargazers_count;
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    });
  }, [data, query, category, language, sort]);

  const categories = ["All projects", ...CATEGORY_NAMES.filter(c => (counts.get(c) ?? 0) > 0)];
  const isDark = theme === "dark";

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark"><Bookmark size={17} strokeWidth={2.2}/></span>
          <span>starbase<span className="brand-period">.</span></span>
        </a>
        <nav className="top-links">
          <a href="#collection">Collection</a>
          <a href={`https://github.com/${data?.username ?? "xASAHIx"}`} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={13}/></a>
        </nav>
        <div className="top-actions">
          <span className="sync-indicator"><span className="status-dot"/>{loading ? "Syncing" : "Connected"}</span>
          <button className="icon-button" aria-label="Toggle color theme" onClick={() => setTheme(isDark ? "light" : "dark")}>
            {isDark ? <Sun size={17}/> : <Moon size={17}/>}
          </button>
          <a className="github-button" href={`https://github.com/${data?.username ?? "xASAHIx"}`} target="_blank" rel="noreferrer"><Github size={15}/> Profile</a>
        </div>
      </header>

      <section className="intro">
        <div className="eyebrow"><Sparkles size={13}/> AN OPEN-SOURCE FIELD GUIDE</div>
        <h1>A collection of<br/><em>things worth building.</em></h1>
        <p className="intro-copy">A living index of open-source tools, experiments, and ideas. Curated by curiosity, organized automatically.</p>
        <div className="intro-meta">
          <div className="avatar-stack"><span>G</span><span>★</span></div>
          <span>Collected by <a href={`https://github.com/${data?.username ?? "xASAHIx"}`} target="_blank" rel="noreferrer">@{data?.username ?? "xASAHIx"}</a></span>
          <span className="meta-divider">·</span>
          <span>{data ? `${fmt(data.count)} repositories` : "Loading collection"}</span>
        </div>
      </section>

      <section className="stats-row" aria-label="Collection statistics">
        <div className="stat"><span className="stat-label">TOTAL SAVED</span><strong>{data ? fmt(data.count) : "—"}</strong></div>
        <div className="stat"><span className="stat-label">CATEGORIES</span><strong>{counts.size || "—"}</strong></div>
        <div className="stat"><span className="stat-label">LANGUAGES</span><strong>{languages.length > 1 ? languages.length - 1 : "—"}</strong></div>
        <div className="stat stat-sync"><span className="stat-label">LAST UPDATED</span><strong>{data ? timeAgo(data.syncedAt) : "—"}</strong><span className="stat-note">Hourly refresh</span></div>
      </section>

      <section className="collection" id="collection">
        <div className="section-heading">
          <div><div className="eyebrow">THE LIBRARY</div><h2>Browse the collection<span className="heading-count">{data ? ` / ${fmt(filtered.length)}` : ""}</span></h2></div>
          <div className="view-switch">
            <button className={view === "grid" ? "selected" : ""} onClick={() => setView("grid")} aria-label="Grid view"><Grid2X2 size={16}/></button>
            <button className={view === "list" ? "selected" : ""} onClick={() => setView("list")} aria-label="List view"><LayoutList size={17}/></button>
          </div>
        </div>

        <div className="toolbar">
          <label className="searchbox"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search repositories, topics, descriptions..."/><kbd><Command size={11}/> K</kbd></label>
          <label className="select-wrap"><SlidersHorizontal size={15}/><select value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Recently active</option><option value="stars">Most starred</option><option value="name">Name A–Z</option></select><ChevronDown size={14}/></label>
          <label className="select-wrap language-select"><select value={language} onChange={e => setLanguage(e.target.value)}>{languages.map(l => <option key={l}>{l}</option>)}</select><ChevronDown size={14}/></label>
        </div>

        <div className="category-strip">
          {categories.map(c => <button key={c} className={`category-chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c}<span>{c === "All projects" ? data?.count ?? 0 : counts.get(c) ?? 0}</span></button>)}
        </div>

        {error ? <div className="state-panel"><div className="state-icon"><Github size={22}/></div><h3>Could not reach GitHub</h3><p>{error}</p><button className="primary-button" onClick={() => void load(true)}>Try again</button></div> :
        loading && !data ? <div className="loading-grid">{Array.from({length: 6}).map((_, i) => <div className="skeleton-card" key={i}/>)}</div> :
        filtered.length === 0 ? <div className="state-panel"><div className="state-icon"><Search size={22}/></div><h3>No matching repositories</h3><p>Try a different search or category.</p><button className="text-button" onClick={() => {setQuery(""); setCategory("All projects"); setLanguage("All languages");}}>Clear filters <X size={13}/></button></div> :
        <div className={view === "grid" ? "repo-grid" : "repo-list"}>
          {filtered.map((repo, index) => <article className="repo-card" key={repo.id}>
            <div className="repo-card-top">
              <span className="repo-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="repo-owner">{repo.owner.login}</span>
              <a className="repo-open" href={repo.html_url} target="_blank" rel="noreferrer" aria-label={`Open ${repo.full_name} on GitHub`}><ArrowUpRight size={17}/></a>
            </div>
            <h3><a href={repo.html_url} target="_blank" rel="noreferrer">{repo.name}</a></h3>
            <p className="repo-description">{repo.description || "No description provided by the repository owner."}</p>
            <div className="repo-tags">{repo.categories.map(c => <span className="tag" key={c}>{c}</span>)}</div>
            <div className="repo-footer">
              <span className="repo-language">{repo.language && <><i className="language-dot"/> {repo.language}</>}</span>
              <span className="repo-stars">★ {fmt(repo.stargazers_count)}</span>
              {repo.homepage && <a className="live-link" href={repo.homepage} target="_blank" rel="noreferrer">Live site <ExternalLink size={11}/></a>}
            </div>
          </article>)}
        </div>}
        <div className="collection-foot"><span>Showing {filtered.length} of {data?.count ?? 0} repositories</span><button onClick={() => void load(true)} disabled={loading}><ArrowDownUp size={13}/> Refresh collection</button></div>
      </section>

      <footer className="footer">
        <a className="brand footer-brand" href="#"><span className="brand-mark"><Bookmark size={15}/></span><span>starbase<span className="brand-period">.</span></span></a>
        <span>Built from stars. Organized by design.</span>
        <a href={`https://github.com/${data?.username ?? "xASAHIx"}`} target="_blank" rel="noreferrer">Follow the source <ArrowUpRight size={12}/></a>
      </footer>
    </main>
  );
}