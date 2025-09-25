import * as cheerio from "cheerio";

export default async function handler(req, res) {
  // Support both GET and POST
  let url;

  if (req.method === "POST") {
    url = req.body?.url;
  } else if (req.method === "GET") {
    url = req.query?.url;
  } else {
    return res.status(405).json({ error: "Only GET and POST allowed" });
  }

  if (!url) {
    return res.status(400).json({ error: "Missing URL" });
  }

  try {
    // Fetch the page HTML
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
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
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
}
