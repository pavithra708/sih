// controllers/placesController.js
import fetch from "node-fetch";
import fs from "fs";
import csv from "csv-parser";

// Load your crime CSV once
const crimeData = {};
fs.createReadStream('data/crime_data.csv')
  .pipe(csv())
  .on('data', (row) => {
    crimeData[row.City] = parseFloat(row.CrimeRate);
  });

const normalizeCrimeRate = (rate) => {
  const maxRate = 200; // adjust based on your CSV
  return Math.round(Math.max(0, 100 - (rate / maxRate) * 100));
};

export const getPlaceInfo = async (req, res) => {
  const placeQuery = req.query.q; // Example: q=Bangalore
  if (!placeQuery) return res.status(400).json({ error: "Missing query parameter q" });

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeQuery)}&format=json&limit=5`;
    const response = await fetch(url);
    const data = await response.json();

    // Normalize results with crime score
    const results = data.map(item => {
      const cityName = item.display_name.split(',')[0];
      const crimeRate = crimeData[cityName] || 0;
      const safetyScore = normalizeCrimeRate(crimeRate);
      const zone = safetyScore > 70 ? "Green" : safetyScore > 40 ? "Yellow" : "Red";

      return {
        name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        type: item.type,
        crimeRate,
        safetyScore,
        zone
      };
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
