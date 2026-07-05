import "server-only";

/** A single day in the GitHub contribution calendar. */
export type ContributionDay = {
  date: string;
  contributionCount: number;
  weekday: number;
};

/** A week row of the contribution calendar (7 days). */
export type ContributionWeek = {
  contributionDays: readonly ContributionDay[];
};

/** The full contribution calendar returned by the GitHub GraphQL API. */
export type ContributionCalendar = {
  totalContributions: number;
  weeks: readonly ContributionWeek[];
};

const CONTRIBUTIONS_QUERY = /* GraphQL */ `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              weekday
            }
          }
        }
      }
    }
  }
`;

type GraphQlResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: ContributionCalendar;
      };
    };
  };
};

/**
 * Build-time-only GitHub contribution calendar fetch (TECH-08 / CTX-04).
 *
 * Reads the unprefixed, server-only `GITHUB_TOKEN` env var — it must never
 * carry the client-exposed env-var prefix Next.js bundles into the browser
 * — and POSTs to the GitHub GraphQL API with `next.revalidate: 86400`
 * (daily ISR), so the shipped page never makes a runtime request to
 * GitHub. Every failure mode (missing token, non-OK response, thrown
 * error) resolves to `null` so callers can render a graceful static
 * fallback instead of a broken grid.
 */
export async function getContributionCalendar(
  login: string,
): Promise<ContributionCalendar | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: { login },
      }),
      next: { revalidate: 86400, tags: ["github-contributions"] },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as GraphQlResponse;
    return (
      json.data?.user?.contributionsCollection?.contributionCalendar ?? null
    );
  } catch {
    return null;
  }
}

/**
 * Derive a GitHub login from a profile URL (e.g.
 * "https://github.com/lsiem" -> "lsiem") so callers never hardcode it —
 * the login always tracks `getContact(locale).github`.
 */
export function githubLoginFromUrl(githubUrl: string): string {
  const segments = githubUrl.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "";
}
