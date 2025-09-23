export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { url } = JSON.parse(req.body);
    const hostname = new URL(url).hostname;

    // ----  FREE authority source (no key needed)  ----
    const resp = await fetch(`https://openpagerank.com/api/v1.0/getPageRank?domains%5B0%5D=${hostname}`);
    const data = await resp.json();
    const rank = data?.response?.[0]?.page_rank_integer ?? 0; // 0-10
    const authority = Math.round(rank * 10);                  // 0-100

    res.status(200).json({
      e: 0,   // Experience (placeholder)
      x: 0,   // Expertise  (placeholder)
      a: authority,
      t: url.startsWith('https') ? 100 : 0
    });
  } catch (e) {
    res.status(200).json({ e: 0, x: 0, a: 0, t: 0, debug: e.message });
  }
}
