// scripts/seedData.js
import fs from "fs";
import csv from "csv-parser";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const dbFile = path.join(process.cwd(), "guardian.db");

async function seed() {
  const db = await open({
    filename: dbFile,
    driver: sqlite3.Database,
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS crime_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state TEXT,
      crimeRate REAL,
      chargesheetRate REAL
    );
    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state TEXT,
      city TEXT,
      lat REAL,
      lon REAL
    );
    CREATE TABLE IF NOT EXISTS tourist_hotspots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      city TEXT,
      state TEXT,
      lat REAL,
      lon REAL,
      radius REAL,
      risk TEXT
    );
    CREATE TABLE IF NOT EXISTS roads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roadId TEXT,
      city TEXT,
      state TEXT,
      lat REAL,
      lon REAL,
      safetyScore REAL
    );
  `);

  // Clear old data
  await db.exec("DELETE FROM crime_data; DELETE FROM cities; DELETE FROM tourist_hotspots; DELETE FROM roads;");

  // Load crime_data.csv
  const crimeFile = path.join(process.cwd(), "data", "crime_data.csv");
  await new Promise((resolve, reject) => {
    fs.createReadStream(crimeFile)
      .pipe(csv())
      .on("data", async (row) => {
        if (row.State && row["Rate of Cognizable Crimes (IPC) (2022)"]) {
          await db.run(
            `INSERT INTO crime_data (state, crimeRate, chargesheetRate) VALUES (?, ?, ?)`,
            [row.State, row["Rate of Cognizable Crimes (IPC) (2022)"], row["Chargesheeting Rate (2022)"]]
          );
        }
      })
      .on("end", resolve)
      .on("error", reject);
  });

  // Load stateCities.json
  const stateCities = JSON.parse(fs.readFileSync(path.join("data", "stateCities.json"), "utf-8"));
  Object.keys(stateCities).forEach((state) => {
    stateCities[state].forEach(async (city) => {
      await db.run(`INSERT INTO cities (state, city, lat, lon) VALUES (?, ?, ?, ?)`, [
        state,
        city,
        null,
        null, // you can add lat/lon later if needed
      ]);
    });
  });

  // Load places.json
  const places = JSON.parse(fs.readFileSync(path.join("data", "places.json"), "utf-8"));
  for (const p of places) {
    await db.run(
      `INSERT INTO tourist_hotspots (name, city, state, lat, lon, radius, risk) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p.name, p.city, p.state, p.lat, p.lon, p.radius, p.risk]
    );
  }

  // Load roads.json
  const roads = JSON.parse(fs.readFileSync(path.join("data", "roads.json"), "utf-8"));
  for (const r of roads) {
    await db.run(
      `INSERT INTO roads (roadId, city, state, lat, lon, safetyScore) VALUES (?, ?, ?, ?, ?, ?)`,
      [r.roadId, r.city, r.state, r.lat, r.lon, r.safetyScore]
    );
  }

  console.log("✅ Data seeded successfully");
  await db.close();
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
});
