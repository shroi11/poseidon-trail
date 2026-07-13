# The Poseidon Trail — Build Log

## Session: July 13, 2026 (Phase 5: עברית + the cousins)

Three Hebrew-speaking cousins (14, 11, 9) join the trail mid-trip. SW **v11**.

### Shipped
- **Hebrew read-along** (`js/pack-hebrew.js`): all 12 stories (8 god-nights, 3 car stories, the finale) translated, plus every quest title/intro/mission. An English/עברית toggle sits on story and quest screens (persisted per device, `ptrail-lang-v1`); Hebrew text renders RTL. Narration stays the English voice — the toggle notes this in Hebrew.
- **Cousins trivia tier** (`tier: 'cousins'`, chip "בני הדודים", terracotta): ~50 Hebrew questions across the warmup, all 8 nights, the road pack, key sites and the finale, difficulty spanning 9→14. Scores for the Heroes. Cousins questions join a Showdown **only when cousin names are entered** in the existing guests field, so family-only nights are unchanged; a pack that would otherwise be empty (the cousin quests) keeps them regardless.
- **Cousins pack** (`js/pack-cousins.js`): two new quests anyone can run anywhere — *The Cousins' Trial* (Hebrew story-swap, Olympus portrait, Hebrew lesson, mixed-pairs beach relay, +30) and *The Great God Hunt* (spot-the-god-symbols scavenger hunt, +30) — plus BONUS missions on the beach quest, the Acropolis and Nafplio. Bonus missions (`bonus: true`) never block a claim, so quests finished before the cousins landed stay finished.
- Hades riddles now accept Hebrew answers (האדס, קרברוס, פרספונה, השאול…).

### Notes
- Engine changes are small: `buildOrder` grew a cousins tier + include flag, quest claims skip `bonus` missions, and the renderer picks `storyHe/titleHe/introHe/textHe` when the toggle says עברית. All content stays in pack files.
- Verified headless (Chromium): toggle both ways, RTL classes, guest/no-guest Showdown order (15 vs 19 warmup questions), a cousins question scores Heroes, bonus missions don't block claims, quick-trivia cousins tier. No console errors.
- Ops: each device needs one wifi open so SW v11 lands. Guest badges for cousins work as before (3+ right answers at a Showdown).

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

## Hotfix: July 5, 2026 (evening)

- **Bug:** audio playback failed ("object store not found") on devices that ran the Phase 0 spike. The spike created the shared `ptrail` IndexedDB at v1 with only the `photos` store, so the app (also opening v1) never created its `audio` store on those devices.
- **Fix:** `DB_VERSION` 1 -> 2 in app.js; the upgrade hook adds the missing store, photos preserved. SW v10. Reproduced spike-then-app in preview before and after.
- **Side effect:** the retired spike page at `/phase0-spike/` will now error on its photo test on upgraded devices (it opens the DB at the old version). Expected; the spike is done — remove its home-screen icon.
