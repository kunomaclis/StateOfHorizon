// Regenerates the WX_ZONES / WX_BLOBS block embedded in index.html.
// Usage:
//   curl -sLO https://raw.githubusercontent.com/LandSandBoat/server/base/sql/zone_weather.sql
//   curl -sLO https://raw.githubusercontent.com/LandSandBoat/server/base/sql/zone_settings.sql
//   node tools/build-weather.js > wxdata.js   (then replace the matching block in index.html)
const fs = require('fs');
const Z = {};
for (const m of fs.readFileSync('zone_weather.sql', 'utf8').matchAll(/\((\d+),0x([0-9A-Fa-f]+)\)/g)) Z[+m[1]] = Buffer.from(m[2], 'hex');
const N = {};
for (const m of fs.readFileSync('zone_settings.sql', 'utf8').matchAll(/VALUES \((\d+),'[^']*',\d+,'([^']+)'\)/g)) N[+m[1]] = m[2];
const OUT = /\[S\]|_S$|Abyssea|Escha|Reisenjima|Walk_of_Echoes|Mog_Garden|Residential|Mog_House|^unknown$|^none$|Dynamis.*\[D\]|Celennia|Kamihr|Yahse|Ceizak|Foret|Morimar|Marjami|Yorcia|Dho_Gates|Woh_Gates|Rala_|Cirdas|Outer_Ra|Ra_Kaznar|Leafallia|Desuetia|Adoulin|Silver_Knife|Feretory|Provenance|Chocobo_Circuit|Diorama|Hazhalm/;
const fix = s => s.replace(/_/g, ' ').replace(/dOria/g, "d'Oria").replace('PsoXja', "Pso'Xja").replace('AlTaieu', "Al'Taieu")
  .replace('HuXzoi', "Hu'Xzoi").replace('RuHmet', "Ru'Hmet").replace('Sealions', "Sealion's").replace('Carpenters Landing', "Carpenters' Landing").replace('Mine Shaft 2716', 'Mine Shaft #2716');
const blobs = [], idx = {}, zones = [];
for (const [id, b] of Object.entries(Z)) {
  if (+id >= 256 || !N[id] || OUT.test(N[id])) continue;
  let any = false;
  for (let i = 0; i < 2160; i++) { const v = b.readUInt16LE(i * 2); if (v) { any = true; break; } }
  if (!any) continue;
  const k = b.toString('base64');
  if (!(k in idx)) { idx[k] = blobs.length; blobs.push(k); }
  zones.push([+id, fix(N[id]), idx[k]]);
}
zones.sort((a, b) => a[1].localeCompare(b[1]));
process.stdout.write('const WX_ZONES=' + JSON.stringify(zones) + ';\nconst WX_BLOBS=' + JSON.stringify(blobs) + ';\n');
