# State of Horizon

Fan-made world info page for the HorizonXI FFXI private server, modeled on Phoenix's world-info page (phoenix-xi.com/world-info).

- Live: https://kunomaclis.github.io/StateOfHorizon/ (lowercase path also works)
- Repo: github.com/kunomaclis/StateOfHorizon, GitHub Pages from `main` / root, HTTPS enforced
- Single self-contained `index.html`. No build step. Weather data is embedded inline (~300 KB).

## Ground rules

1. **All data must come from Horizon sources.** Precedence: Horizon wiki's VanaTime.js (Horizogenes) > other Horizon wiki pages > Horizon API. LandSandBoat (LSB) is used only where the Horizon wiki itself says it uses LSB, and only after verifying LSB output matches the wiki.
2. **Verify, don't assume.** Every constant below was checked against live Horizon wiki output or Phoenix screenshots. If you change math, re-run the calibration checks.
3. **Don't copy Horizon's or Phoenix's assets** (fonts, crests, screenshots) into this repo without permission.

## Page structure

Layout mirrors Phoenix. Hero: kicker `Period · Y1513 M5 D22`, title and subtitle on the left, big Highwind clock on the right with a green "N players online" badge under it (hidden until the population fetch succeeds), flat 24h day bar with a sun/moon marker along the bottom (subtle sky tint keyed to Vana hour). 4 tiles: Moon, Day cycle (element chip + small "Firesday in 00:47:56" line), Guild halls, Level sync (sub-line names the population tier). Tiles go 4 -> 2 -> 1 columns below 1280px / 720px (set so the longest line, "Goldsmithing opens in 00:00:00", never wraps); countdown phrases use `nb()` so "in 00:00:00" stays together. Dividers are 1px grid gaps. Tabs: Overview (8-day strip, then Next ferry / Next airship / Current RSE / Conquest tally cards with "View ... →" links), Calendar & RSE, Travel, Guilds, Weather.

Tabs use "section panels" (`.sect`: kicker + Highwind title header, body below). Times are list rows (`depRow`/`.rowi`): route, Vana day + boards/departs times, countdown to boarding (then departure) with local departure time under it.
- Calendar: active RSE panel beside upcoming rotation list; moon phases and find a day as panels with tables.
- Travel: Selbina/Mhaura terminal panels, airships in a 2-column Jeuno -> city / city -> Jeuno grid, regional boats (`BOATS_REG` = [region, service, routes]).
- Guilds: hours table panel; daily GP panel shows reset countdown only (no Horizon source for the pattern).
- Weather: element tiles, then matching-zone cards with % and pool chips (identical pools merged, "All pools"); zone forecast panel.

Day chips: element glyph + day name on a dark `#05080B` plate with a day-colored border. All glyphs are our own inline SVGs, not game or Phoenix assets: `EL_ICON` (elements; tiles, strip, guild holidays, weather), `GUILD_ICON` (guild table), `RACE_ICON` (head silhouettes; RSE card and table), `CARD_ICON` (ferry, airship, conquest flag). Tab state in URL hash. Everything recomputes client-side every 1s; daily tables re-render on Vana day change.

## Time math (from Horizon wiki VanaTime.js)

- Vana ms = `(earthMs + 92514960000) * 25`. Vana day = 57.6 Earth min.
- Vana day index `d = floor(vanaMs / 86400000)`; weekday `d % 8` (0 = Firesday).
- Date: year `d/360`, month `(d%360)/30 + 1`, day `d%30 + 1`.
- Time of day labels (wiki): 0-3 Midnight, 4-5 New day, 6 Dawn, 7-16 Day, 17 Dusk, 18-19 Evening, 20-23 Night.
- Moon: `md = (d + 26) % 84`, `pct = |round((42 - md)/42*100)|`; md 0 = full, 42 = new; md<42 waning. Phase thresholds copied exactly from wiki `moonLatentPhase()`.
- RSE: `RSE_DATE = 1075281264000`; week `w = floor((now - RSE_DATE) / (8 Vana days in Earth ms))`; race `w % 8` (Hume M, Hume F, Elvaan M, Elvaan F, Taru M, Taru F, Mithra, Galka), location `w % 3` (Gusgen, Shakhrami, Ordelle's). Flips on Firesday.
- Conquest: epoch `1024844400000` (Mon 00:00 JST); next tally = `7d - ((now - epoch) % 7d)`.
- Guild point daily reset: JST midnight (15:00 UTC).

## Transport and guilds (from wiki script `schedule` class)

- Route = `[name, offset, interval, anim_arrive, waiting, anim_depart]` in Vana minutes. Boards at `offset + arrive`, departs at `offset + arrive + waiting`, repeats every `interval`.
- Guild = `[open, close, holidayWeekday]` in Vana minutes. Closed all day on holiday.

## Weather (LSB zone_weather, verified against Horizon wiki forecast)

- Source: `sql/zone_weather.sql` and `sql/zone_settings.sql` from LandSandBoat/server `base` branch. Horizon wiki forecast says it uses LSB base data; confirmed 13/13 days across 7 zones.
- Each zone = 2160 little-endian uint16 values. `normal = v >> 10`, `common = (v >> 5) & 31`, `rare = v & 31`. Chances 50/35/15.
- **Zero entries mean "carry forward the previous non-zero day"** (wrap around the cycle). Missing this makes the data look wrong.
- Cycle index: `(d - 318960) mod 2160` where `d` is the Vana day index above. (LSB epoch: unix 1009810800.)
- Weather IDs: 0 None, 1 Sunshine, 2 Clouds, 3 Fog, 4/5 Hot spell/Heat wave (Fire), 6/7 Rain/Squall (Water), 8/9 Dust/Sand storm (Earth), 10/11 Wind/Gales, 12/13 Snow/Blizzards (Ice), 14/15 Thunder/Thunderstorms, 16/17 Auroras/Stellar glare (Light), 18/19 Gloom/Darkness (Dark). Odd = double weather.
- Embedded as `WX_ZONES` ([id, name, blobIndex]) + `WX_BLOBS` (deduped base64). Regenerate with `tools/build-weather.js`.
- Out-of-era zones filtered by name regex and zone id >= 256. Weather shown is the pool, not the live roll.

## Live data

- Population: `https://horizonffxi.wiki/w/api.php?action=fetchproxy&format=json&origin=*` returns `{fetchproxy: <online count>}`. CORS works from github.io. Polled every 5 min (same as wiki).
- Level sync penalty per level over +10 (wiki): >=2001 online 2.5%, >=1001 2%, else 1.5%.

## Calibration checks (expected values)

- 2026-09-25 16:51:48 UTC: Vana 22:35, Y1513 M5 D12, Windsday, Waning Gibbous 69%, new moon in 1d 02:56:11, full in 2d 19:15:23, conquest in 1d 22:08:11, RSE Galka/Gusgen, Selbina->Mhaura departs in 00:03:23.
- Weather at Windsday (d=544811): La Theine Rain/Sunshine/Sunshine, Tahrongi Wind x3, Batallia Clouds/Dust storm/Dust storm, Pashhow Rain x3. Davoi from Iceday: Clouds/Rain, Rain/Clouds, Rain/Clouds, Rain/Thunder, Rain/Rain, Rain/Clouds, Rain/Clouds.

## Style (matched to horizonxi.com dark pages)

- Fonts: Highwind (display, loaded from `https://horizonxi.com/fonts/hinted-Highwind.woff2`, which sends `access-control-allow-origin: *`; fallback Oswald), Roboto (body), Inconsolata (countdowns/times).
- Colors: bg `#080D12`, surface `#121921` (all panels), inset `rgba(8,13,18,.45)` (items inside panels), text `#E1E1E1`, cream `#FDF6E3`, muted `#A9AFB5`, accent `#50B4D6`. Faint teal + gold radial glows on the page background. Hairline borders, capsule tab bar with teal-ringed active pill. Dark mode only.

## Open items

- Alchemy holiday conflict: wiki script says Lightningday; wiki Alchemy page says Lightsday (Bastok) / Lightningday (Whitegate). Using script value, flagged in UI. Verify in game.
- Bastok airship: script departs 01:14, wiki static table 01:12 (about 5 real seconds). Using script.
- Daily guild point items: no Horizon source exists (community posts it in Horizon Discord). Not implemented.
- Weather list may include zones outside Horizon's era (Everbloom Hollow, Ghoyu's Reverie, Ruhotz Silvermines). Unverified.
- Weather % uses LSB's 50/35/15 roll and ignores LSB's 02:00-07:00 fog override (noted in UI). Horizon's server code isn't public, so the odds are unverified.
- Chocobo riding game removed on purpose: wiki script and wiki quest page disagree on reward times and the quest page marks them all unverified. Don't re-add without a verified Horizon source.
- Wiki script bug (not ours): its "holiday tomorrow" check never fires Darksday -> Firesday.
