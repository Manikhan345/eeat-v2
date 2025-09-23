export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;  // ✅ no JSON.parse needed
    const hostname = new URL(url).hostname;

    // ---- live OpenPageRank (no key) ----
    const resp = await fetch(
      `https://openpagerank.com/api/v1.0/getPageRank?domains%5B0%5D=${hostname}`
    );
    const data = await resp.json();

    // ---- expose real rank ----
    const rank = data?.response?.[0]?.page_rank_integer ?? -1;
    const authority = Math.round(rank * 10);

    res.status(200).json({
      e: 0,
      x: 0,
      a: authority,
      t: url.startsWith('https') ? 100 : 0,
      raw_rank: rank
    });
  } catch (e) {
    res.status(200).json({
      e: 0,
      x: 0,
      a: 0,
      t: 0,
      debug: e.message
    });
  }
}
