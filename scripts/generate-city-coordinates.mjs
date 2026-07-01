#!/usr/bin/env node
/**
 * Regenerate src/data/cityCoordinates.json from citiesCatalog.json.
 * Requires devDependency: all-the-cities
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cities from "all-the-cities";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "src/data/citiesCatalog.json"), "utf8"));

const countryIso = {
  Afghanistan: "AF", Albania: "AL", Algeria: "DZ", Angola: "AO", Argentina: "AR", Armenia: "AM", Aruba: "AW",
  Australia: "AU", Austria: "AT", Azerbaijan: "AZ", Bahamas: "BS", Bahrain: "BH", Bangladesh: "BD", Barbados: "BB",
  Belarus: "BY", Belgium: "BE", Belize: "BZ", Benin: "BJ", Bhutan: "BT", Bolivia: "BO", Bosnia: "BA", Botswana: "BW",
  Brazil: "BR", Brunei: "BN", Bulgaria: "BG", "Burkina Faso": "BF", Cambodia: "KH", Cameroon: "CM", Canada: "CA",
  "Cape Verde": "CV", "Cayman Islands": "KY", Chad: "TD", Chile: "CL", China: "CN", Colombia: "CO", Comoros: "KM",
  Congo: "CG", "Cook Islands": "CK", "Costa Rica": "CR", Croatia: "HR", Cuba: "CU", Curaçao: "CW", Cyprus: "CY",
  "Czech Republic": "CZ", "Côte d'Ivoire": "CI", "DR Congo": "CD", Denmark: "DK", Djibouti: "DJ", "Dominican Republic": "DO",
  Ecuador: "EC", Egypt: "EG", "El Salvador": "SV", Eritrea: "ER", Estonia: "EE", Eswatini: "SZ", Ethiopia: "ET",
  "Faroe Islands": "FO", Fiji: "FJ", Finland: "FI", France: "FR", "French Guiana": "GF", "French Polynesia": "PF",
  Gambia: "GM", Georgia: "GE", Germany: "DE", Ghana: "GH", Greece: "GR", Guam: "GU", Guatemala: "GT", Guinea: "GN",
  "Guinea-Bissau": "GW", Guyana: "GY", Haiti: "HT", Honduras: "HN", "Hong Kong": "HK", Hungary: "HU", Iceland: "IS",
  India: "IN", Indonesia: "ID", Iran: "IR", Iraq: "IQ", Ireland: "IE", Israel: "IL", Italy: "IT", Jamaica: "JM",
  Japan: "JP", Jordan: "JO", Kazakhstan: "KZ", Kenya: "KE", Kiribati: "KI", Kuwait: "KW", Kyrgyzstan: "KG", Laos: "LA",
  Latvia: "LV", Lebanon: "LB", Lesotho: "LS", Liberia: "LR", Libya: "LY", Lithuania: "LT", Luxembourg: "LU", Macau: "MO",
  Madagascar: "MG", Malawi: "MW", Malaysia: "MY", Maldives: "MV", Mali: "ML", Malta: "MT", "Marshall Islands": "MH",
  Mauritius: "MU", Mexico: "MX", Micronesia: "FM", Moldova: "MD", Mongolia: "MN", Morocco: "MA", Mozambique: "MZ",
  Myanmar: "MM", Namibia: "NA", Nepal: "NP", Netherlands: "NL", "New Caledonia": "NC", "New Zealand": "NZ", Nicaragua: "NI",
  Niger: "NE", Nigeria: "NG", "North Korea": "KP", "North Macedonia": "MK", "Northern Mariana Islands": "MP", Norway: "NO",
  Oman: "OM", Pakistan: "PK", Panama: "PA", "Papua New Guinea": "PG", Paraguay: "PY", Peru: "PE", Philippines: "PH",
  Poland: "PL", Portugal: "PT", "Puerto Rico": "PR", Qatar: "QA", Romania: "RO", Russia: "RU", Rwanda: "RW", Samoa: "WS",
  "Saudi Arabia": "SA", Senegal: "SN", Serbia: "RS", Seychelles: "SC", "Sierra Leone": "SL", Singapore: "SG", Slovakia: "SK",
  Slovenia: "SI", "Solomon Islands": "SB", Somalia: "SO", "South Africa": "ZA", "South Korea": "KR", Spain: "ES", "Sri Lanka": "LK",
  Sudan: "SD", Suriname: "SR", Svalbard: "SJ", Sweden: "SE", Switzerland: "CH", Syria: "SY", Taiwan: "TW", Tajikistan: "TJ",
  Tanzania: "TZ", Thailand: "TH", "Timor-Leste": "TL", Togo: "TG", Tonga: "TO", Trinidad: "TT", Tunisia: "TN", Turkey: "TR",
  Turkmenistan: "TM", "Turks and Caicos": "TC", Tuvalu: "TV", UAE: "AE", UK: "GB", USA: "US", "United States": "US",
  Uganda: "UG", Ukraine: "UA", Uruguay: "UY", Uzbekistan: "UZ", Vanuatu: "VU", Venezuela: "VE", Vietnam: "VN", Yemen: "YE",
  Zambia: "ZM", Zimbabwe: "ZW",
};

const manualCoords = {
  "America/New_York": { lat: 40.7128, lng: -74.006 },
  "America/Chicago": { lat: 41.8781, lng: -87.6298 },
  "America/Denver": { lat: 39.7392, lng: -104.9903 },
  "America/Los_Angeles": { lat: 34.0522, lng: -118.2437 },
  "America/Detroit": { lat: 42.3314, lng: -83.0458 },
  "America/Anchorage": { lat: 61.2181, lng: -149.9003 },
  "Pacific/Honolulu": { lat: 21.3069, lng: -157.8583 },
  "Europe/London": { lat: 51.5074, lng: -0.1278 },
  "Africa/Kinshasa": { lat: -4.4419, lng: 15.2663 },
  "Africa/Lubumbashi": { lat: -11.6876, lng: 27.5026 },
  "Africa/Brazzaville": { lat: -4.2634, lng: 15.2429 },
  "Africa/Blantyre": { lat: -15.7861, lng: 35.0058 },
  "Africa/Djibouti": { lat: 11.5721, lng: 43.1456 },
  "Africa/Ndjamena": { lat: 12.1348, lng: 15.0557 },
  "Indian/Comoro": { lat: -11.7172, lng: 43.2473 },
  "Indian/Seychelles": { lat: -4.6191, lng: 55.4513 },
  "Atlantic/Cape_Verde": { lat: 14.9331, lng: -23.5133 },
  "Pacific/Guam": { lat: 13.4443, lng: 144.7937 },
  "Pacific/Noumea": { lat: -22.2758, lng: 166.458 },
  "Pacific/Tahiti": { lat: -17.6509, lng: -149.426 },
  "america-cayenne": { lat: 4.9224, lng: -52.3135 },
  "america-george-town": { lat: 19.2869, lng: -81.3674 },
  "america-grand-turk": { lat: 21.4675, lng: -71.1389 },
  "america-port-of-spain": { lat: 10.6918, lng: -61.2225 },
  "america-aruba": { lat: 12.5211, lng: -69.9683 },
  "boston": { lat: 42.3601, lng: -71.0589 },
  "philadelphia": { lat: 39.9526, lng: -75.1652 },
  "washington-dc": { lat: 38.9072, lng: -77.0369 },
  "atlanta": { lat: 33.749, lng: -84.388 },
  "miami": { lat: 25.7617, lng: -80.1918 },
  "chicago": { lat: 41.8781, lng: -87.6298 },
  "dallas": { lat: 32.7767, lng: -96.797 },
  "houston": { lat: 29.7604, lng: -95.3698 },
  "seattle": { lat: 47.6062, lng: -122.3321 },
  "san-francisco": { lat: 37.7749, lng: -122.4194 },
  "los-angeles": { lat: 34.0522, lng: -118.2437 },
  "phoenix": { lat: 33.4484, lng: -112.074 },
  "denver": { lat: 39.7392, lng: -104.9903 },
  "europe-belfast": { lat: 54.5973, lng: -5.9301 },
  "europe-birmingham-uk": { lat: 52.4862, lng: -1.8904 },
  "birmingham-us": { lat: 33.5186, lng: -86.8104 },
  "europe-bristol": { lat: 51.4545, lng: -2.5879 },
  "europe-cardiff": { lat: 51.4816, lng: -3.1791 },
  "edinburgh": { lat: 55.9533, lng: -3.1883 },
  "europe-glasgow": { lat: 55.8642, lng: -4.2518 },
  "europe-leeds": { lat: 53.8008, lng: -1.5491 },
  "europe-liverpool": { lat: 53.4084, lng: -2.9916 },
  "manchester": { lat: 53.4808, lng: -2.2426 },
  "europe-sarajevo": { lat: 43.8563, lng: 18.4131 },
  "Asia/Tokyo": { lat: 35.6762, lng: 139.6503 },
  "osaka": { lat: 34.6937, lng: 135.5023 },
  "asia-makassar": { lat: -5.1477, lng: 119.4327 },
  "bali": { lat: -8.4095, lng: 115.1889 },
  "Europe/Kiev": { lat: 50.4501, lng: 30.5234 },
  "europe-kharkiv": { lat: 49.9935, lng: 36.2304 },
  "america-curacao": { lat: 12.1224, lng: -68.8824 },
};

function norm(s) {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function scoreName(a, b) {
  const n1 = norm(a);
  const n2 = norm(b);
  if (n1 === n2) return 100;
  if (n2.includes(n1) || n1.includes(n2)) return 85;
  return 0;
}

const byCountry = new Map();
for (const city of cities) {
  if (!byCountry.has(city.country)) byCountry.set(city.country, []);
  byCountry.get(city.country).push(city);
}

const coords = {};
const unmatched = [];

for (const entry of catalog) {
  if (manualCoords[entry.id]) {
    coords[entry.id] = manualCoords[entry.id];
    continue;
  }
  const iso = countryIso[entry.country];
  const pool = iso ? byCountry.get(iso) ?? [] : [];
  const names = [entry.name, entry.id.split("/").pop()?.replace(/-/g, " "), entry.id.replace(/-/g, " ")].filter(Boolean);
  let best = null;
  let bestScore = 0;
  for (const name of names) {
    for (const city of pool) {
      const score = scoreName(name, city.name);
      if (score > bestScore) {
        bestScore = score;
        best = city;
      } else if (score === bestScore && score > 0 && best && city.population > best.population) {
        best = city;
      }
    }
  }
  if (bestScore === 100) {
    const exactMatches = [];
    for (const name of names) {
      for (const city of pool) {
        if (scoreName(name, city.name) === 100) exactMatches.push(city);
      }
    }
    if (exactMatches.length > 0) {
      best = exactMatches.sort((a, b) => b.population - a.population)[0];
    }
  }
  if (!best && pool.length) {
    best = pool.sort((a, b) => b.population - a.population)[0];
  }
  if (best) {
    coords[entry.id] = { lat: best.loc.coordinates[1], lng: best.loc.coordinates[0] };
  } else {
    unmatched.push(entry.id);
  }
}

const outPath = path.join(root, "src/data/cityCoordinates.json");
fs.writeFileSync(outPath, `${JSON.stringify(coords, null, 2)}\n`);
console.log(`Wrote ${Object.keys(coords).length} coordinates to ${outPath}`);
if (unmatched.length) {
  console.error("Unmatched:", unmatched.join(", "));
  process.exit(1);
}
