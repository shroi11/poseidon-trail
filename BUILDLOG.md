# The Poseidon Trail — Build Log

## Session: July 5, 2026 (full build, Phases 0–4)

**Live app:** https://shroi11.github.io/poseidon-trail/ · **Repo:** https://github.com/shroi11/poseidon-trail · **PRD:** `../poseidon-trail-prd.md`

### Shipped today

| Phase | What | Accepted |
|-------|------|----------|
| 0 | De-risk spike (install, cached audio w/ silent switch, IndexedDB photo) at `/phase0-spike/` | ✅ All 4 checks, Roi's iPhone + iPad |
| 1 | Game engine: trail map, Showdown, two-tier trivia, badges, scoreboard, manual entry | ✅ Fake game night in Madrid |
| 2 | Corfu pack: 8 god-nights (stories + narration + read-along), 3 quests, 46 questions, guest badges | ✅ Flight gate, all 4 devices |
| 3 | Road pack: 3 Theseus car stories, 7 site quests, Sounio finale, Reverse Run, journal tab, 45 questions | ⏳ Villa test pending |
| 4 | Hades riddle chain (shadow tile → 4 riddles → 13th badge), journal print/PDF export, fanfare + underworld SFX | ⏳ Rides on villa test |

### Key decisions
- **Voice:** ElevenLabs "Bill" (`pqHfZKP75CvOlQylNhV4`) after 4-voice audition. All 12 narrations (~24MB) live in IndexedDB, never the 50MB cache. Audio keys versioned (`@v2`); bump `AUDIO_VER` in app.js when re-recording.
- **Badge art:** Roi's 21 SVGs in `assets/badges/` + 5 villains in `assets/villains/`, all in SW precache. Dual-god nights mint both badges; Pantheon = the 12 Olympians (Hades excluded).
- **Anti-skip gates:** nights sequential; finale sealed until the We're-here tap at Sounio; Reverse Run sealed until the Road Showdown; quest trivia hidden until site visited.
- **Consistency model (no sync, per PRD):** iPad = Base Camp, the one official scoreboard/badges/journal. Phones = field devices. Evening ritual: AirDrop photos to iPad → re-tap quest missions there → claim → story + Showdown. Quirk: open Car Story 3 once on the iPad to reveal the road pack there.
- **Reset:** Scores → Base Camp; two-step confirm, optional photo wipe (for pre-trip test runs). Keeps downloaded voices.

### Service worker history
v1 spike-proven range handling → v2 Corfu → v3 badge art → v4 road pack → v5 gates → v6 Hades/SFX → v7 villain art → v8 reset photo wipe → **v9 (current)** photo missions allow library picks (AirDrop→iPad flow).

### Ops note
GitHub Pages legacy builds occasionally hang; kick with `gh api repos/shroi11/poseidon-trail/pages/builds -X POST`.

### Open items (all Roi's)
1. Joanna's question-bank review before Jul 11 (edits are one-liners, same-day redeploy).
2. Jul 11: one wifi open per device so v9 lands; reset each test device (wipe photos = OK) before the real start.
3. Villa week: download 8+4 voices per device → Base Camp shows 12/12 → airplane test. Plus the 3-day eviction check on the kids' iPhone.
4. Don't tell the boys about the shadow tile on the Badges screen.
5. Optional: the boys' one-time app rename; post-trip journal print from the iPad.

**Win condition (PRD):** by Corfu night 3, a boy asks to play unprompted.
