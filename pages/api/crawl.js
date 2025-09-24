import * as cheerio from "cheerio";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing URL" });
  }

  try {
    // Fetch the page HTML
    const response = await fetch(url, {
      headers: { "User-Agent": "EEAT-Crawler/1.0" },
    });
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch URL" });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract visible text
    const text = $("body").text().replace(/\s+/g, " ").trim();

    // Extract images
    const images = $("img")
      .map((_, el) => $(el).attr("src"))
      .get()
      .filter(Boolean);

    // Extract links
    const links = $("a")
      .map((_, el) => $(el).attr("href"))
      .get()
      .filter(Boolean);

    // Extract schema.org JSON-LD
    const schema = [];
    $("script[type='application/ld+json']").each((_, el) => {
      try {
        schema.push(JSON.parse($(el).html()));
      } catch (e) {
        // ignore invalid JSON
      }
    });

    return res.status(200).json({
      url,
      text,
      images,
      links,
      schema,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
