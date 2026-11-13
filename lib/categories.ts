import type { Repository } from "./types";

const RULES: Array<{ name: string; terms: string[] }> = [
  { name: "AI & machine learning", terms: ["ai", "llm", "machine-learning", "deep-learning", "generative-ai", "agents", "ollama", "openai", "transformers", "inference", "computer-vision", "nlp"] },
  { name: "Developer tools", terms: ["developer-tools", "cli", "terminal", "debugging", "ide", "editor", "git", "code-editor", "sdk", "api-client"] },
  { name: "Frontend & UI", terms: ["frontend", "react", "nextjs", "vue", "svelte", "css", "tailwind", "component-library", "ui", "design-system"] },
  { name: "Backend & databases", terms: ["backend", "database", "postgres", "mysql", "mongodb", "redis", "api", "server", "orm", "graphql"] },
  { name: "Mobile apps", terms: ["android", "ios", "mobile", "react-native", "flutter", "expo"] },
  { name: "Desktop apps", terms: ["desktop", "electron", "tauri", "macos", "windows", "linux-app"] },
  { name: "Productivity", terms: ["productivity", "notes", "note-taking", "task-management", "todo", "calendar", " kanban", "knowledge-management", "workflow"] },
  { name: "Automation", terms: ["automation", "workflow-automation", "n8n", "zapier", "scraping", "bot", "scheduler"] },
  { name: "Design & creative", terms: ["design", "figma", "graphics", "image-editor", "video-editor", "illustration", "3d", "animation", "whiteboard"] },
  { name: "Self-hosted", terms: ["self-hosted", "self-hosting", "homelab", "awesome-selfhosted", "nas"] },
  { name: "DevOps & infrastructure", terms: ["devops", "docker", "kubernetes", "terraform", "ci-cd", "deployment", "monitoring", "observability", "cloud", "infrastructure"] },
  { name: "Security & privacy", terms: ["security", "privacy", "encryption", "authentication", "pentesting", "vulnerability", "password-manager"] },
  { name: "Learning & resources", terms: ["education", "learning", "tutorial", "course", "awesome-list", "books", "documentation", "cheatsheet"] },
  { name: "Games & entertainment", terms: ["game", "gaming", "game-engine", "emulator", "music", "media-server"] },
];

export function categorize(repo: Pick<Repository, "name" | "description" | "topics" | "language">): string[] {
  const haystack = [
    repo.name,
    repo.description ?? "",
    repo.language ?? "",
    ...(repo.topics ?? []),
  ].join(" ").toLowerCase().replace(/_/g, "-");

  const matches = RULES.filter(rule =>
    rule.terms.some(term => haystack.includes(term.trim().toLowerCase()))
  ).map(rule => rule.name);

  return matches.length ? matches.slice(0, 3) : ["Uncategorized"];
}

export function withCategories<T extends Omit<Repository, "categories">>(repo: T): T & { categories: string[] } {
  return { ...repo, categories: categorize(repo) };
}

export const CATEGORY_NAMES = [...RULES.map(r => r.name), "Uncategorized"];