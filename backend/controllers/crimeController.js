import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

const stateCitiesPath = path.join(process.cwd(), 'data', 'stateCities.json');
const stateCities = JSON.parse(fs.readFileSync(stateCitiesPath, 'utf-8'));

export const getCrimeData = async (req, res) => {
  const results = [];

  const normalizeCrimeRate = (rate) => {
    const maxRate = 200; // adjust based on your CSV
    return Math.round(Math.max(0, 100 - (rate / maxRate) * 100));
  };

  const csvPath = path.join(process.cwd(), 'data', 'crime_data.csv');

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (data) => {
      const state = data.State;
      const rate = parseFloat(data.CrimeRate);
      const score = normalizeCrimeRate(rate);

      const cities = stateCities[state] || [];
      cities.forEach((city) => {
        results.push({
          state,
          city,
          crimeRate: rate,
          safetyScore: score
        });
      });
    })
    .on('end', () => {
      res.json(results);
    })
    .on('error', (err) => {
      console.error(err);
      res.status(500).json({ error: 'Failed to read CSV' });
    });
};
