export type Repository = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  pushed_at: string;
  created_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  categories: string[];
};