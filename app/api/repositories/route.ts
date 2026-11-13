import { NextResponse } from "next/server";
import { categorize } from "@/lib/categories";
import type { Repository } from "@/lib/types";

export const revalidate = 3600;

async function fetchAllStars(): Promise<Repository[]> {
  const username = process.env.GITHUB_USERNAME || "xASAHIx";
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Starbase-GitHub-Directory",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const all: Repository[] = [];
  for (let page = 1; page <= 10; page++) {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/starred?per_page=100&page=${page}`,
      { headers, next: { revalidate: 3600 } }
    );
    if (!response.ok) {
      const message = response.status === 404
        ? `GitHub user "${username}" was not found.`
        : `GitHub API returned ${response.status}. ${response.status === 403 ? "Rate limit may have been reached; configure GITHUB_TOKEN." : ""}`;
      throw new Error(message);
    }
    const batch = await response.json() as Omit<Repository, "categories">[];
    all.push(...batch.map(repo => ({ ...repo, categories: categorize(repo) })));
    if (batch.length < 100) break;
  }
  return all;
}

export async function GET() {
  try {
    const repositories = await fetchAllStars();
    return NextResponse.json({
      username: process.env.GITHUB_USERNAME || "xASAHIx",
      count: repositories.length,
      syncedAt: new Date().toISOString(),
      repositories,
    }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load GitHub stars." },
      { status: 502 }
    );
  }
}