// backend/controllers/roadsController.js
import fetch from 'node-fetch';

export const getRoadsData = async (req, res) => {
  try {
    const city = req.query.q || "Bengaluru"; // default to Bengaluru
    const query = `
      [out:json][timeout:25];
      area["name"="${city}"]->.searchArea;
      (
        way["highway"](area.searchArea);
      );
      out body;
      >;
      out skel qt;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
