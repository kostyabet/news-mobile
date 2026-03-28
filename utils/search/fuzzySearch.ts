import { Article } from "@/entities/article/model";
import { SearchField, SortOption } from "./types";

function getBigrams(str: string): Set<string> {
  const bigrams = new Set<string>();
  const s = str.toLowerCase();
  for (let i = 0; i < s.length - 1; i++) {
    bigrams.add(s.substring(i, i + 2));
  }
  return bigrams;
}

export function fuzzyMatch(query: string, text: string): number {
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();

  if (!q || !t) return 0;

  // Точное вхождение — максимальный score
  if (t.includes(q)) return 1;

  // Для коротких запросов (1-2 символа) только exact match
  if (q.length <= 2) return 0;

  // Bigram similarity (коэффициент Дайса)
  const queryBigrams = getBigrams(q);
  const textBigrams = getBigrams(t);

  if (queryBigrams.size === 0 || textBigrams.size === 0) return 0;

  let intersectionCount = 0;
  for (const bigram of queryBigrams) {
    if (textBigrams.has(bigram)) {
      intersectionCount++;
    }
  }

  return (2 * intersectionCount) / (queryBigrams.size + textBigrams.size);
}

const FUZZY_THRESHOLD = 0.3;

function getArticleScore(
  article: Article,
  query: string,
  searchField: SearchField,
): number {
  const fields: (keyof Article)[] =
    searchField === "all"
      ? ["title", "slug", "content"]
      : [searchField];

  let maxScore = 0;
  for (const field of fields) {
    const value = article[field];
    if (typeof value === "string") {
      const score = fuzzyMatch(query, value);
      if (score > maxScore) maxScore = score;
    }
  }
  return maxScore;
}

function sortArticles(articles: Article[], sortBy: SortOption): Article[] {
  switch (sortBy) {
    case "title_asc":
      return [...articles].sort((a, b) => a.title.localeCompare(b.title));
    case "title_desc":
      return [...articles].sort((a, b) => b.title.localeCompare(a.title));
    case "newest":
      return [...articles].sort((a, b) => b.id - a.id);
    case "oldest":
      return [...articles].sort((a, b) => a.id - b.id);
    case "popular":
    default:
      return [...articles].sort((a, b) => {
        const aTotal = (a.reactions?.likes ?? 0) + (a.reactions?.dislikes ?? 0);
        const bTotal = (b.reactions?.likes ?? 0) + (b.reactions?.dislikes ?? 0);
        return bTotal - aTotal;
      });
  }
}

export interface FuzzySearchOptions {
  searchField: SearchField;
  sortBy: SortOption;
}

export function fuzzySearchArticles(
  articles: Article[],
  query: string,
  options: FuzzySearchOptions & { categories?: string[]; tags?: string[] },
): Article[] {
  let result: Article[];

  if (!query.trim()) {
    result = articles;
  } else {
    const scored = articles
      .map((article) => ({
        article,
        score: getArticleScore(article, query, options.searchField),
      }))
      .filter((item) => item.score >= FUZZY_THRESHOLD)
      .sort((a, b) => b.score - a.score);

    result = scored.map((item) => item.article);
  }

  const hasCats = options.categories && options.categories.length > 0;
  const hasTags = options.tags && options.tags.length > 0;

  if (hasCats || hasTags) {
    result = result.filter((a) => {
      const matchCat = hasCats
        ? options.categories!.some((c) => a.categories?.includes(c))
        : false;
      const matchTag = hasTags
        ? options.tags!.some((t) => a.tags?.includes(t))
        : false;
      return matchCat || matchTag;
    });
  }

  return sortArticles(result, options.sortBy);
}
