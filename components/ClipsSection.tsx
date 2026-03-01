import Image from "next/image";

const CHANNEL = "fruttinhaa";
const TWITCH_GQL_ENDPOINT = "https://gql.twitch.tv/gql";
const TWITCH_PUBLIC_CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";

type ClipItem = {
  url: string;
  title: string;
  thumbnailURL: string;
  viewCount: number;
};

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

async function getRecentClips(): Promise<ClipItem[]> {
  const body = [
    {
      operationName: "ClipsSectionQuery",
      variables: { login: CHANNEL },
      query:
        "query ClipsSectionQuery($login:String!){user(login:$login){clips(first:6){edges{node{url title thumbnailURL viewCount}}}}}",
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
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return [];
    }

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

export async function ClipsSection() {
  const clips = await getRecentClips();

  return (
    <section className="panel" aria-labelledby="clips-title">
      <div className="panel__head">
        <h2 id="clips-title">Clips</h2>
        <a className="chip chip--link" href={`https://www.twitch.tv/${CHANNEL}/clips`} target="_blank" rel="noreferrer">
          twitch.tv/{CHANNEL}/clips
        </a>
      </div>

      {clips.length > 0 ? (
        <div className="clips-grid">
          {clips.map((clip) => (
            <a key={clip.url} className="clip-card" href={clip.url} target="_blank" rel="noreferrer">
              <Image
                className="clip-card__thumb"
                src={clip.thumbnailURL}
                alt={clip.title}
                width={640}
                height={360}
                unoptimized
              />
              <div className="clip-card__body">
                <p className="clip-card__title">{clip.title}</p>
                <span className="clip-card__meta">{clip.viewCount.toLocaleString()} views</span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="helper-text">
          Couldn&apos;t load clips right now. Open them directly at{" "}
          <a href={`https://www.twitch.tv/${CHANNEL}/clips`} target="_blank" rel="noreferrer">
            twitch.tv/{CHANNEL}/clips
          </a>
          .
        </p>
      )}
    </section>
  );
}
