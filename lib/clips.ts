/* ── Shared Twitch clips fetcher (public GQL endpoint) ────── */

export const CHANNEL = "fruttinhaa";

const TWITCH_GQL_ENDPOINT = "https://gql.twitch.tv/gql";
const TWITCH_PUBLIC_CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";

export type ClipItem = {
  url: string;
  title: string;
  thumbnailURL: string;
  viewCount: number;
};

export type ClipsPeriod = "LAST_DAY" | "LAST_WEEK" | "LAST_MONTH" | "ALL_TIME";

type ClipsQueryResponse = {
  data?: {
    user?: {
      clips?: {
        edges?: Array<{
          node?: ClipItem;
        }>;
      };
    };
  };
};

export async function fetchClips(period: ClipsPeriod): Promise<ClipItem[]> {
  const body = [
    {
      operationName: "ClipsSectionQuery",
      variables: { login: CHANNEL, period },
      query:
        "query ClipsSectionQuery($login:String!,$period:ClipsPeriod!){user(login:$login){clips(first:12,criteria:{period:$period}){edges{node{url title thumbnailURL viewCount}}}}}",
    },
  ];

  try {
    const response = await fetch(TWITCH_GQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Client-ID": TWITCH_PUBLIC_CLIENT_ID,
        "Content-Type": "text/plain;charset=UTF-8",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as ClipsQueryResponse[];

    return (
      payload?.[0]?.data?.user?.clips?.edges
        ?.map((edge) => edge.node)
        .filter((clip): clip is ClipItem => Boolean(clip?.url && clip?.title)) ?? []
    );
  } catch {
    return [];
  }
}
