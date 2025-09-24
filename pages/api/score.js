export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Missing URL" });
    }

    // Extract domain
    const hostname = new URL(url).hostname;

    // Debug: check if API key exists
    const apiKey = process.env.OPENPAGERANK_KEY || null;
    console.log("DEBUG - Env keys available:", Object.keys(process.env));
    console.log("DEBUG - API Key present?", !!apiKey);

    if (!apiKey) {
      return res.status(500).json({
        error: "API key missing",
        debug: {
          apiKeyPresent: false
        }
      });
    }

    // Call OpenPageRank API
    const response = await fetch(
      `https://openpagerank.com/api/v1.0/getPageRank?domains%5B0%5D=${hostname}`,
      {
        headers: {
          "ApiKey": apiKey,
          "Accept": "application/json"
        }
      }
    );

    const data = await response.json();

    // Parse the result safely
    const rank =
      data?.response?.[0]?.rank || -1;

    // Example scoring system
    const authorityScore = rank > 0 ? rank * 10 : 0;
    const trustScore = rank > 0 ? 100 : 0;

    res.status(200).json({
      e: 0,
      x: 0,
      a: authorityScore,
      t: trustScore,
      raw_rank: rank,
      debug: {
        apiKeyPresent: true,
        apiResponse: data
      }
    });
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
}
