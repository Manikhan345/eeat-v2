// Force Node.js runtime so req.body works correctly on Vercel
export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;
    const hostname = new URL(url).hostname;

    // ✅ Using your Vercel variable: OPENPAGERANK_KEY
    const resp = await fetch(
      `https://openpagerank.com/api/v1.0/getPageRank?domains%5B0%5D=${hostname}`,
      {
        headers: {
          "ApiKey": process.env.OPENPAGERANK_KEY,
        },
      }
    );

    const data = await resp.json();

    const rank = data?.response?.[0]?.page_rank_integer ?? -1;
    const authority = rank >= 0 ? Math.round(rank * 10) : 0;

    res.status(200).json({
      e: 0,  // errors placeholder
      x: 0,  // extra placeholder
      a: authority,  // authority score
      t: url.startsWith("https") ? 100 : 0,  // trust score
      raw_rank: rank,  // actual pagerank from API
    });
  } catch (e) {
    res.status(200).json({
      e: 0,
      x: 0,
      a: 0,
      t: 0,
      debug: e.message,
    });
  }
}
