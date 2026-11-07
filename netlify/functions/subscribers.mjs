const YOUTUBE_API = "https://www.googleapis.com/youtube/v3/channels";

async function getChannel(handle, apiKey) {
  const params = new URLSearchParams({
    part: "snippet,statistics",
    forHandle: handle,
    key: apiKey
  });

  const response = await fetch(`${YOUTUBE_API}?${params}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "YouTube API request failed");
  }

  if (!data.items?.length) {
    throw new Error(`Channel not found: ${handle}`);
  }

  const channel = data.items[0];
  const count = Number(channel.statistics.subscriberCount || 0);

  return {
    channelId: channel.id,
    title: channel.snippet.title,
    subscribers: count,
    subscriberCount: count,
    count,
    url: `https://www.youtube.com/channel/${channel.id}`
  };
}

export default async () => {
  try {
    const apiKey = Netlify.env.get("YOUTUBE_API_KEY");

    if (!apiKey) {
      return Response.json(
        { error: "YouTube API key is not configured." },
        { status: 500 }
      );
    }

    const [fireblazers, goats] = await Promise.all([
      getChannel("@fireblazersgoated", apiKey),
      getChannel("@RUDRAGAUTAMTHEG.O.A.T.S", apiKey)
    ]);

    return Response.json({
      fireblazers,
      goats,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Unable to load subscriber counts." },
      { status: 500 }
    );
  }
};
