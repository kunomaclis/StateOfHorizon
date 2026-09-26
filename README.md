# State of Horizon

A live world info page for [HorizonXI](https://horizonxi.com), the Final Fantasy XI private server.

**Live:** https://kunomaclis.github.io/StateOfHorizon/

## What it does

One page shows the state of Vana'diel right now, updated every second:

- Vana'diel time and date, day element, and moon phase
- Players online and the current level sync penalty
- Ferry, airship, and regional boat schedules with boarding countdowns
- Race-specific equipment (RSE) rotation, conquest tally, and chocobo riding game routes
- Guild hours and holidays
- Weather pools by element and a per-zone forecast

Everything runs in your browser. There's no server and no build step, just a single `index.html`.

## Inspiration

Modeled on the [Phoenix world info page](https://phoenix-xi.com/world-info), which puts the whole state of the world on one screen. State of Horizon brings that idea to HorizonXI, using Horizon's own data.

## Data sources

Every number comes from a public Horizon source, or from a source Horizon itself relies on:

- **[HorizonXI Wiki](https://horizonffxi.wiki)**: the wiki's Vana'diel time script (by Horizogenes) supplies the time math, moon phases, RSE rotation, conquest timing, transport schedules, guild hours, and chocobo routes. Other wiki pages cover level sync tiers and holiday details.
- **HorizonXI Wiki API**: the live player count, the same feed the wiki uses.
- **[LandSandBoat](https://github.com/LandSandBoat/server)**: weather comes from LSB's zone weather table, which the Horizon wiki forecast is built on. The data here was checked against the wiki's forecast and matched on every sampled day.

Where sources disagree (for example, the Alchemy guild holiday), the page says so instead of guessing. If you spot a mismatch with what you see in game, please open an issue.

## Credits

Created by **Kunomaclis**. Built with the help of AI tooling ([Claude Code](https://claude.com/claude-code)).

This is a fan project, not affiliated with HorizonXI, Phoenix, or Square Enix. FINAL FANTASY is a registered trademark of Square Enix. The Highwind display font is loaded from horizonxi.com and isn't redistributed here.
