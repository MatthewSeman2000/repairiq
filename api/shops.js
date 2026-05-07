// api/shops.js — Vercel serverless function
// Proxies Google Places API so the key stays server-side

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://repairiqhq.com");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { zip, repair } = req.query;
  if (!zip || !repair) {
    return res.status(400).json({ error: "Missing zip or repair param" });
  }

  const GOOGLE_KEY = process.env.GOOGLE_PLACES_KEY;

  try {
    // Step 1: geocode the ZIP to lat/lng
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${GOOGLE_KEY}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return res.status(404).json({ error: "ZIP not found", status: geoData.status, details: geoData.error_message || null });
    }

    const { lat, lng } = geoData.results[0].geometry.location;

    // Step 2: nearby search for auto repair shops
    const keyword = encodeURIComponent(`auto repair ${repair}`);
    const placesRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=16000&type=car_repair&keyword=${keyword}&key=${GOOGLE_KEY}`
    );
    const placesData = await placesRes.json();

    if (!placesData.results) {
      return res.status(500).json({ error: "Places API error" });
    }

    const topPlaces = placesData.results.slice(0, 5);

    // Step 3: fetch details (phone, website) for each shop in parallel
    const shops = await Promise.all(topPlaces.map(async (p) => {
      let phone = null;
      let website = null;
      try {
        const detailRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=formatted_phone_number,website&key=${GOOGLE_KEY}`
        );
        const detailData = await detailRes.json();
        phone   = detailData.result?.formatted_phone_number || null;
        website = detailData.result?.website || null;
      } catch {}

      return {
        place_id:           p.place_id,
        name:               p.name,
        vicinity:           p.vicinity,
        rating:             p.rating || null,
        user_ratings_total: p.user_ratings_total || 0,
        open_now:           p.opening_hours ? p.opening_hours.open_now : null,
        phone,
        website,
        affiliate_url:      `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
      };
    }));

    return res.status(200).json(shops);
  } catch (err) {
    console.error("shops API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
