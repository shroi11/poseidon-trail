// The Poseidon Trail — game engine (Phase 2: Corfu pack wired in).
// All state lives on-device: game state in localStorage, big blobs (story
// audio, quest photos) in IndexedDB. No backend, no accounts.

(function () {
'use strict';

var $ = function (sel) { return document.querySelector(sel); };

var NIGHTS = (window.CORFU && CORFU.nights) || [];
var QUESTS = (window.CORFU && CORFU.quests) || [];
var ROAD = window.ROAD || { stories: [], sites: [], finale: null, reverse: [] };
var ROAD_AUDIO = ROAD.stories.concat(ROAD.finale ? [ROAD.finale] : []);
var ALL_AUDIO = NIGHTS.concat(ROAD_AUDIO);

/* ---------- State ---------- */

var STATE_KEY = 'ptrail-state-v1';
var LIVE_KEY = 'ptrail-showdown-live-v1';

var DEFAULT_STATE = {
  version: 3,
  scores: { heroes: 0, parents: 0 },
  history: [],            // {when, label, heroes, parents}
  badges: {},             // badgeId -> {when, by}
  showdownsPlayed: 0,
  parentLosses: 0,
  nightsDone: {},         // nightId -> true
  questProgress: {},      // questId -> {missions:{}, claimed:false}
  guestBadges: [],        // {name, night, when}
  reverseDone: {},        // promptId -> points awarded
  finaleDone: false,
  storiesRead: {},        // roadstoryId -> true (opened at least once)
  hadesStep: 0            // riddles solved (4 = the hidden god found)
};

// Badge ids earned under the pre-artwork scheme map onto the 20-badge set.
var BADGE_MIGRATION = {
  god1: ['god-poseidon'], god2: ['god-zeus'], god3: ['god-athena'], god4: ['god-hermes'],
  god5: ['god-apollo', 'god-artemis'], god6: ['god-hera', 'god-ares'],
  god7: ['god-hephaestus', 'god-aphrodite'], god8: ['god-demeter', 'god-dionysus'],
  'qbadge-mouse': ['hero-odysseus'], 'qbadge-achilleion': ['hero-achilles']
};

function loadState() {
  try {
    var raw = localStorage.getItem(STATE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    var s = JSON.parse(raw);
    for (var k in DEFAULT_STATE) if (!(k in s)) s[k] = JSON.parse(JSON.stringify(DEFAULT_STATE[k]));
    if (s.version < 3) {
      var migrated = {};
      Object.keys(s.badges).forEach(function (id) {
        (BADGE_MIGRATION[id] || []).forEach(function (nid) { migrated[nid] = s.badges[id]; });
      });
      s.badges = migrated;
      s.version = 3;
    }
    return s;
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

var state = loadState();
localStorage.setItem(STATE_KEY, JSON.stringify(state)); // persist migrations immediately

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  updateStrip();
}

function updateStrip() {
  $('#stripHeroes').textContent = state.scores.heroes;
  $('#stripParents').textContent = state.scores.parents;
}

/* ---------- IndexedDB: photos + audio packs ---------- */

var DB_NAME = 'ptrail', DB_VERSION = 1;
function openDb() {
  return new Promise(function (res, rej) {
    var r = indexedDB.open(DB_NAME, DB_VERSION);
    r.onupgradeneeded = function () {
      var d = r.result;
      if (!d.objectStoreNames.contains('photos')) d.createObjectStore('photos');
      if (!d.objectStoreNames.contains('audio')) d.createObjectStore('audio');
    };
    r.onsuccess = function () { res(r.result); };
    r.onerror = function () { rej(r.error); };
  });
}
function idbPut(store, key, val) {
  return openDb().then(function (d) {
    return new Promise(function (res, rej) {
      var tx = d.transaction(store, 'readwrite');
      tx.objectStore(store).put(val, key);
      tx.oncomplete = res;
      tx.onerror = function () { rej(tx.error); };
    });
  });
}
function idbGet(store, key) {
  return openDb().then(function (d) {
    return new Promise(function (res) {
      var rq = d.transaction(store).objectStore(store).get(key);
      rq.onsuccess = function () { res(rq.result); };
      rq.onerror = function () { res(undefined); };
    });
  });
}
function idbClear(store) {
  return openDb().then(function (d) {
    return new Promise(function (res, rej) {
      var tx = d.transaction(store, 'readwrite');
      tx.objectStore(store).clear();
      tx.oncomplete = res;
      tx.onerror = function () { rej(tx.error); };
    });
  });
}
function idbKeys(store) {
  return openDb().then(function (d) {
    return new Promise(function (res) {
      var rq = d.transaction(store).objectStore(store).getAllKeys();
      rq.onsuccess = function () { res(rq.result || []); };
      rq.onerror = function () { res([]); };
    });
  });
}
window.ptrailDb = { put: idbPut, get: idbGet, keys: idbKeys };

/* ---------- Audio pack manager ---------- */

var audioEl = new Audio();
var audioUrls = {};      // nightId -> object URL (this session)
var audioPlaying = null; // nightId currently playing

// Bump when narrations are re-recorded: stale IndexedDB copies are dropped
// and devices re-fetch the new voice on their next wifi contact.
var AUDIO_VER = 2;
function audioKey(night) { return night.id + '@v' + AUDIO_VER; }

// Drop narration blobs from older voices so storage doesn't hold both.
idbKeys('audio').then(function (keys) {
  keys.forEach(function (k) {
    if (k.indexOf('@v' + AUDIO_VER) === -1) {
      openDb().then(function (d) { d.transaction('audio', 'readwrite').objectStore('audio').delete(k); });
    }
  });
});

// Get a playable URL for a night's narration: memory -> IndexedDB -> network (then stored).
function ensureNightAudio(night) {
  if (audioUrls[night.id]) return Promise.resolve(audioUrls[night.id]);
  return idbGet('audio', audioKey(night)).then(function (blob) {
    if (blob) {
      audioUrls[night.id] = URL.createObjectURL(blob);
      return audioUrls[night.id];
    }
    if (!navigator.onLine) throw new Error('offline');
    return fetch(night.audio).then(function (r) {
      if (!r.ok) throw new Error('missing');
      return r.blob();
    }).then(function (b) {
      return idbPut('audio', audioKey(night), b).then(function () {
        audioUrls[night.id] = URL.createObjectURL(b);
        return audioUrls[night.id];
      });
    });
  });
}

function setAudioStatus(msg, cls) {
  var el = $('#audioStatus');
  if (el) el.innerHTML = cls ? '<span class="' + cls + '">' + msg + '</span>' : msg;
}

function playNight(night) {
  if (audioPlaying === night.id && !audioEl.paused) {
    audioEl.pause();
    audioPlaying = null;
    var b = $('#playNightBtn'); if (b) b.textContent = '▶ Play the story';
    return;
  }
  setAudioStatus('Summoning the storyteller…');
  ensureNightAudio(night).then(function (url) {
    audioEl.src = url;
    audioEl.currentTime = 0;
    return audioEl.play();
  }).then(function () {
    audioPlaying = night.id;
    var b = $('#playNightBtn'); if (b) b.textContent = '⏸ Pause';
    setAudioStatus('Playing. Works with the silent switch on.', 'ok');
  }).catch(function (e) {
    if (e && e.message === 'offline') setAudioStatus('This story’s voice isn’t on this device yet. Connect to wifi once (or use Download all voices on the Trail screen), then it works offline forever. Read-along works right now.', 'bad');
    else if (e && e.message === 'missing') setAudioStatus('Narration for this night isn’t published yet. Read-along works.', 'bad');
    else setAudioStatus('Playback failed: ' + (e && e.message ? e.message : e) + '. Tap play again.', 'bad');
  });
}
audioEl.addEventListener('ended', function () {
  audioPlaying = null;
  var b = $('#playNightBtn'); if (b) b.textContent = '▶ Play the story again';
});

function downloadAudioList(list, btn) {
  if (!navigator.onLine) { if (btn) btn.textContent = 'Needs wifi — try later'; return; }
  var i = 0;
  function next() {
    if (i >= list.length) {
      if (btn) { btn.textContent = 'All ' + list.length + ' voices on this device ✓'; btn.disabled = true; }
      return;
    }
    if (btn) btn.textContent = 'Fetching voice ' + (i + 1) + ' of ' + list.length + '…';
    ensureNightAudio(list[i]).then(function () { i++; next(); })
      .catch(function () { i++; next(); }); // skip missing ones, keep going
  }
  next();
}

function markAudioButton(btn, list) {
  idbKeys('audio').then(function (keys) {
    var have = list.filter(function (n) { return keys.indexOf(audioKey(n)) !== -1; }).length;
    if (have === list.length && list.length) { btn.textContent = 'All ' + have + ' voices on this device ✓'; btn.disabled = true; }
    else if (have > 0) btn.textContent = btn.textContent.replace(/^Download/, 'Download') + ' (' + have + ' of ' + list.length + ' on device)';
  });
}

/* ---------- Badges ---------- */

function badgeById(id) {
  for (var i = 0; i < BADGES.length; i++) if (BADGES[i].id === id) return BADGES[i];
  return null;
}

function awardBadge(id, by) {
  if (state.badges[id]) return null;
  if (!badgeById(id)) return null;
  state.badges[id] = { when: new Date().toISOString(), by: by || 'family' };
  return badgeById(id);
}

// The Pantheon badge unlocks when all 12 Olympian god badges are collected.
// Hidden badges (Hades) are their own quest and don't count toward it.
function checkPantheon() {
  var allGods = BADGES.every(function (b) {
    return b.hidden || b.id.indexOf('god-') !== 0 || state.badges[b.id];
  });
  if (!allGods) return [];
  var b = awardBadge('pantheon', 'family');
  return b ? [b] : [];
}

/* ---------- Night helpers ---------- */

function nightById(id) {
  for (var i = 0; i < NIGHTS.length; i++) if (NIGHTS[i].id === id) return NIGHTS[i];
  return null;
}
function questById(id) {
  for (var i = 0; i < QUESTS.length; i++) if (QUESTS[i].id === id) return QUESTS[i];
  return null;
}
function tonightNight() {
  for (var i = 0; i < NIGHTS.length; i++) if (!state.nightsDone[NIGHTS[i].id]) return NIGHTS[i];
  return null;
}

/* ---------- Showdown engine ---------- */

var live = null;
var ceremony = null; // result of the last finished showdown, shown once
var preferredPack = null;

function loadLive() {
  try {
    var raw = localStorage.getItem(LIVE_KEY);
    live = raw ? JSON.parse(raw) : null;
  } catch (e) { live = null; }
}
function saveLive() {
  if (live) localStorage.setItem(LIVE_KEY, JSON.stringify(live));
  else localStorage.removeItem(LIVE_KEY);
}
loadLive();

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function packById(id) {
  for (var i = 0; i < PACKS.length; i++) if (PACKS[i].id === id) return PACKS[i];
  return PACKS[0];
}

// Anti-skip gates. The question bank's rule: questions unlock only after the
// family visits the site or hears the story, so nothing spoils the reveal.
function nightLocked(n) {
  if (state.nightsDone[n.id]) return false;
  var t = tonightNight();
  return t && n.num > t.num;
}
function reverseLocked() {
  return !state.badges['hero-theseus'];
}
function finaleUnlocked() {
  return state.finaleDone || !!(state.questProgress.finale && state.questProgress.finale.missions.m1);
}
function packAvailable(p) {
  if (p.id === 'warmup') return true;
  var night = nightById(p.id);
  if (night) return !nightLocked(night);
  if (p.id === 'road-theseus') return !!state.storiesRead.roadstory3 || !!state.badges['hero-theseus'];
  if (p.id === 'finale-sounio') return finaleUnlocked();
  var q = questById(p.id);
  if (q) {
    var pr = state.questProgress[q.id];
    return !!(pr && (pr.missions.m1 || pr.claimed));
  }
  return true;
}
function availablePacks(extraId) {
  return PACKS.filter(function (p) { return packAvailable(p) || p.id === extraId; });
}

function buildOrder(pack, perTier) {
  var byTier = { leo: [], adam: [], parents: [] };
  pack.questions.forEach(function (q, idx) { byTier[q.tier].push(idx); });
  var tiers = ['leo', 'adam', 'parents'];
  tiers.forEach(function (t) { byTier[t] = shuffle(byTier[t]).slice(0, perTier || byTier[t].length); });
  var order = [];
  var maxLen = Math.max(byTier.leo.length, byTier.adam.length, byTier.parents.length);
  for (var round = 0; round < maxLen; round++) {
    tiers.forEach(function (t) { if (byTier[t][round] !== undefined) order.push(byTier[t][round]); });
  }
  return order;
}

function startShowdown(packId, perTier, guests) {
  var pack = packById(packId);
  live = {
    packId: pack.id,
    guests: guests || [],
    order: buildOrder(pack, perTier),
    pos: 0,
    revealed: false,
    heroes: 0, parents: 0,
    heroesStreak: 0, heroesMaxStreak: 0,
    parentsStreak: 0, parentsMaxStreak: 0,
    heroesMiss: 0, parentsMiss: 0,
    heroesAsked: 0, parentsAsked: 0
  };
  saveLive();
  location.hash = '#showdown';
  render();
}

function currentQuestion() {
  var pack = packById(live.packId);
  return pack.questions[live.order[live.pos]];
}

function answerShowdown(gotIt) {
  var q = currentQuestion();
  var team = TIER_TEAM[q.tier];
  live[team + 'Asked']++;
  if (gotIt) {
    live[team] += POINTS_PER_CORRECT;
    live[team + 'Streak']++;
    if (live[team + 'Streak'] > live[team + 'MaxStreak']) live[team + 'MaxStreak'] = live[team + 'Streak'];
  } else {
    live[team + 'Miss']++;
    live[team + 'Streak'] = 0;
  }
  live.pos++;
  live.revealed = false;
  saveLive();
  render();
}

function finishShowdown() {
  var earned = [];
  state.showdownsPlayed++;
  var heroesWin = live.heroes > live.parents;
  if (heroesWin) state.parentLosses++;

  // Night showdowns close the night and mint its god badge(s).
  var night = nightById(live.packId);
  if (night) {
    state.nightsDone[night.id] = true;
    night.badges.forEach(function (id) {
      var b = awardBadge(id, 'family'); if (b) earned.push(b);
    });
  }
  if (live.packId === 'road-theseus') {
    var tb = awardBadge('hero-theseus', 'heroes'); if (tb) earned.push(tb);
  }
  var isFinale = live.packId === 'finale-sounio';
  if (isFinale) state.finaleDone = true;

  state.scores.heroes += live.heroes;
  state.scores.parents += live.parents;
  earned = earned.concat(checkPantheon());
  state.history.unshift({
    when: new Date().toISOString(),
    label: packById(live.packId).title,
    heroes: live.heroes,
    parents: live.parents
  });
  saveState();

  var result = {
    heroes: live.heroes, parents: live.parents, earned: earned,
    heroesWin: heroesWin, tie: live.heroes === live.parents,
    guests: live.guests || [], night: night ? night.num : null,
    label: packById(live.packId).title, finale: isFinale
  };
  live = null;
  saveLive();
  return result;
}

/* ---------- Quick trivia ---------- */

var quick = { tier: 'leo', packId: 'warmup', qIndex: -1, revealed: false, recent: [] };

function nextQuick() {
  var pack = packById(quick.packId);
  var pool = [];
  pack.questions.forEach(function (q, idx) {
    if (q.tier === quick.tier && quick.recent.indexOf(idx) === -1) pool.push(idx);
  });
  if (pool.length === 0) {
    if (quick.recent.length === 0) { quick.qIndex = -1; return; } // no questions in this tier at all
    quick.recent = []; return nextQuick();
  }
  quick.qIndex = pool[Math.floor(Math.random() * pool.length)];
  quick.recent.push(quick.qIndex);
  if (quick.recent.length > 6) quick.recent.shift();
  quick.revealed = false;
}

/* ---------- Rendering ---------- */

function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

function paragraphs(text) {
  return text.split('\n\n').map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
}

function questRow(q) {
  var p = state.questProgress[q.id];
  var claimed = p && p.claimed;
  return '<a class="list-row ' + (claimed ? 'done' : '') + '" href="#' + q.id + '">' +
    '<span class="sym">' + q.symbol + '</span>' +
    '<span class="grow">' + esc(q.title) + '</span>' +
    (claimed ? '<span class="ok">✓</span>' : '') +
    '</a>';
}

function screenHome() {
  var tonight = tonightNight();
  var nightRows = NIGHTS.map(function (n) {
    var done = !!state.nightsDone[n.id];
    var isTonight = tonight && tonight.id === n.id;
    if (nightLocked(n)) {
      return '<div class="list-row done"><span class="sym">\u{1F512}</span>' +
        '<span class="grow">Night ' + n.num + ': sealed</span></div>';
    }
    return '<a class="list-row ' + (done ? 'done' : '') + '" href="#night-' + n.num + '">' +
      '<span class="sym">' + n.symbol + '</span>' +
      '<span class="grow">Night ' + n.num + ': ' + esc(n.god) + '</span>' +
      (done ? '<span class="ok">✓</span>' : (isTonight ? '<span class="chip-tonight">TONIGHT</span>' : '')) +
      '</a>';
  }).join('');
  var corfuQuestRows = QUESTS.filter(function (q) { return !q.act; }).map(questRow).join('');

  var storyRows = ROAD.stories.map(function (s) {
    return '<a class="list-row" href="#roadstory-' + s.num + '">' +
      '<span class="sym">' + s.symbol + '</span>' +
      '<span class="grow">Car Story ' + s.num + ': ' + esc(s.title) + '</span>' +
      '</a>';
  }).join('');
  var roadSites = QUESTS.filter(function (q) { return q.act === 2; });
  var athensRow = roadSites.length ? questRow(roadSites[0]) : '';
  var restRows = roadSites.slice(1).map(questRow).join('');
  var rrDone = Object.keys(state.reverseDone).length;
  var reverseRow = '';
  if (ROAD.reverse.length) {
    reverseRow = reverseLocked()
      ? '<div class="list-row done"><span class="sym">\u{1F512}</span><span class="grow">Reverse Run · sealed until the Road Showdown</span></div>'
      : '<a class="list-row" href="#reverse"><span class="sym">\u{1F501}</span><span class="grow">Reverse Run · the drive back</span>' +
        (rrDone ? '<span class="ok">' + rrDone + '/' + ROAD.reverse.length + '</span>' : '<span class="chip-tonight">2× PTS</span>') + '</a>';
  }

  var finaleRow = ROAD.finale
    ? '<a class="list-row ' + (state.finaleDone ? 'done' : '') + '" href="#finale">' +
      '<span class="sym">' + ROAD.finale.symbol + '</span>' +
      '<span class="grow">The Finale: ' + esc(ROAD.finale.place) + '</span>' +
      (state.finaleDone ? '<span class="ok">✓</span>' : '') + '</a>'
    : '';

  var tonightLabel = live ? 'Continue the Showdown' : (tonight ? 'Night ' + tonight.num + ': ' + tonight.god : "Tonight's Showdown");
  var tonightSub = live ? 'A battle is still open' : (tonight ? tonight.title : 'Pick any pack — the road is open');

  return '<h1>The Poseidon Trail</h1>' +
    '<div class="sub">Corfu to Sounio. The sea god is watching.</div>' +
    '<button id="tonightBtn">' + esc(tonightLabel) + '<small>' + esc(tonightSub) + '</small></button>' +
    '<div class="trail">' +
    '<div class="card act unlocked">' +
    '<span class="node">' + ACTS[0].node + '</span>' +
    '<div class="place">' + esc(ACTS[0].place) + '</div>' +
    '<h2>' + esc(ACTS[0].title) + '</h2>' +
    '<div class="rowlist">' + nightRows + '</div>' +
    '<button id="dlAllBtn" class="ghost" style="margin-top:12px;min-height:48px;font-size:15px">Download the 8 Corfu voices</button>' +
    '</div>' +
    '<div class="card act unlocked">' +
    '<span class="node">\u{1F3F9}</span>' +
    '<div class="place">Corfu missions</div>' +
    '<h2>Quests</h2>' +
    '<div class="rowlist">' + corfuQuestRows + '</div>' +
    '</div>' +
    '<div class="card act unlocked">' +
    '<span class="node">' + ACTS[1].node + '</span>' +
    '<div class="place">' + esc(ACTS[1].place) + '</div>' +
    '<h2>' + esc(ACTS[1].title) + '</h2>' +
    '<div class="rowlist">' + athensRow + storyRows + restRows + reverseRow + '</div>' +
    '<button id="dlRoadBtn" class="ghost" style="margin-top:12px;min-height:48px;font-size:15px">Download the 4 road voices</button>' +
    '</div>' +
    '<div class="card act unlocked">' +
    '<span class="node">' + ACTS[2].node + '</span>' +
    '<div class="place">' + esc(ACTS[2].place) + '</div>' +
    '<h2>' + esc(ACTS[2].title) + '</h2>' +
    '<div class="rowlist">' + finaleRow + '</div>' +
    '</div>' +
    '</div>' +
    '<div class="foot">The whole trail is on this device. No signal required.</div>';
}

function screenNight(num) {
  var n = NIGHTS[num - 1];
  if (!n) { location.hash = '#home'; return ''; }
  if (nightLocked(n)) {
    var t = tonightNight();
    return '<div class="place">Night ' + n.num + ' of 8</div>' +
      '<h1>\u{1F512} Sealed</h1>' +
      '<div class="sub">The gods reveal themselves one night at a time. Tonight is Night ' + (t ? t.num : 1) + '.</div>' +
      '<button class="ghost" id="backHomeBtn" style="margin-top:10px">Back to the trail</button>';
  }
  var done = !!state.nightsDone[n.id];
  return '<div class="place">Night ' + n.num + ' of 8 · ' + esc(n.god) + (done ? ' · <span class="ok">complete ✓</span>' : '') + '</div>' +
    '<h1>' + esc(n.title) + '</h1>' +
    '<div class="sub">Listen, or read along. Then battle.</div>' +
    '<button id="playNightBtn" class="gold">▶ Play the story</button>' +
    '<div class="status" id="audioStatus" style="margin:10px 0 4px;font-size:14px"></div>' +
    '<div class="card"><div class="story-read">' + paragraphs(n.story) + '</div></div>' +
    '<button id="nightShowdownBtn">' + (done ? 'Replay this night’s Showdown' : 'Start Night ' + n.num + '’s Showdown') + '</button>' +
    '<button class="ghost" id="backHomeBtn" style="margin-top:10px">Back to the trail</button>';
}

function screenQuest(qid) {
  var q = questById(qid);
  if (!q) { location.hash = '#home'; return ''; }
  var p = state.questProgress[q.id] || { missions: {}, claimed: false };
  var allDone = q.missions.every(function (m) { return p.missions[m.id]; });
  var rows = missionRows(q, p);
  var claim = p.claimed
    ? '<div class="status ok" style="text-align:center">Quest complete: +' + q.points + ' points banked' + (q.badgeId ? ', badge earned' : '') + '. \u{1F3C5}</div>'
    : (allDone
      ? '<button id="claimBtn" class="gold">Claim +' + q.points + ' Hero points' + (q.badgeId ? ' & the ' + esc(q.badgeName) + ' badge' : '') + '</button>'
      : '<div class="status" style="text-align:center;opacity:.7">Finish every mission to claim +' + q.points + ' points.</div>');
  return '<div class="place">' + esc(q.place) + '</div>' +
    '<h1>' + esc(q.title) + '</h1>' +
    '<div class="sub story-font">' + esc(q.intro) + '</div>' +
    rows + claim +
    (q.questions.length ? '<div class="foot">This quest’s trivia appears in the Showdown pack list once you’ve been here.</div>' : '') +
    '<button class="ghost" id="backHomeBtn" style="margin-top:14px">Back to the trail</button>';
}

function screenRoadStory(num) {
  var s = ROAD.stories[num - 1];
  if (!s) { location.hash = '#home'; return ''; }
  var isLast = num === ROAD.stories.length;
  var nav = '';
  if (num > 1) nav += '<button class="ghost" id="prevStoryBtn" style="margin-top:10px">◀ Chapter ' + (num - 1) + '</button>';
  if (!isLast) nav += '<button id="nextStoryBtn" style="margin-top:10px">Chapter ' + (num + 1) + ' ▶</button>';
  return '<div class="place">Theseus’s Road · chapter ' + num + ' of ' + ROAD.stories.length + '</div>' +
    '<h1>' + esc(s.title) + '</h1>' +
    '<div class="sub">A car story. Listen on the drive, or read along.</div>' +
    '<button id="playNightBtn" class="gold">▶ Play the story</button>' +
    '<div class="status" id="audioStatus" style="margin:10px 0 4px;font-size:14px"></div>' +
    '<div class="card"><div class="story-read">' + paragraphs(s.story) + '</div></div>' +
    (isLast ? '<button id="roadShowdownBtn">Start the Road Showdown</button>' : '') +
    nav +
    '<button class="ghost" id="backHomeBtn" style="margin-top:10px">Back to the trail</button>';
}

function missionRows(q, p) {
  return q.missions.map(function (m) {
    var done = !!p.missions[m.id];
    var control;
    if (m.type === 'photo') {
      control = '<label class="bigbtn mission-btn' + (done ? ' done-btn' : '') + '" for="mcam-' + m.id + '">' +
        (done ? '✓ Photo captured' : '\u{1F4F8} Take the quest photo') + '</label>' +
        '<input id="mcam-' + m.id + '" type="file" accept="image/*" capture="environment" data-mission="' + m.id + '" style="display:none">' +
        '<img class="quest-photo" id="mphoto-' + m.id + '" alt="quest photo" style="display:none">';
    } else if (m.type === 'here') {
      control = '<button class="mission-btn' + (done ? ' done-btn' : '') + '" data-mission="' + m.id + '">' +
        (done ? '✓ We were here' : '\u{1F4CD} We’re here!') + '</button>';
    } else {
      control = '<button class="mission-btn ghost' + (done ? ' done-btn' : '') + '" data-mission="' + m.id + '">' +
        (done ? '✓ Done' : 'Mark done') + '</button>';
    }
    return '<div class="mission"><div class="mtext">' + esc(m.text) + '</div>' + control + '</div>';
  }).join('');
}

function finaleQuestEntity() {
  return { id: 'finale', title: 'The Finale: Sounio', missions: ROAD.finale.missions, points: ROAD.finale.points, badgeId: null };
}

function screenFinale() {
  var f = ROAD.finale;
  if (!f) { location.hash = '#home'; return ''; }
  var p = state.questProgress.finale || { missions: {}, claimed: false };
  if (!finaleUnlocked()) {
    // Sealed until the family is physically at the temple. Parents tap the unlock.
    return '<div class="place">Act III · ' + esc(f.place) + '</div>' +
      '<h1>\u{1F512} ' + esc(f.title) + '</h1>' +
      '<div class="sub story-font">The end of the trail is sealed until you stand on the cliff at Sounio. The sea god will know if you skip ahead. He always knows.</div>' +
      '<div class="mission"><div class="mtext">' + esc(f.missions[0].text) + '</div>' +
      '<button class="mission-btn" data-mission="m1">\u{1F4CD} We’re here!</button></div>' +
      '<button class="ghost" id="backHomeBtn" style="margin-top:10px">Back to the trail</button>';
  }
  var allDone = f.missions.every(function (m) { return p.missions[m.id]; });
  var banner = state.finaleDone
    ? '<div class="card trail-complete"><img class="badge-img" src="assets/badges/badge-poseidon.svg" alt="Poseidon">' +
      '<h2>THE TRAIL IS COMPLETE</h2><div class="rules">Heroes ' + state.scores.heroes + ' — ' + state.scores.parents + ' Parents. The sea god is satisfied. Open the Journal: the whole adventure is written.</div>' +
      '<button id="openJournalBtn" class="gold" style="margin-top:12px">Open the Journal</button></div>'
    : '';
  var claim = p.claimed
    ? '<div class="status ok" style="text-align:center">Finale missions complete: +' + f.points + ' points banked. \u{1F531}</div>'
    : (allDone
      ? '<button id="claimBtn" class="gold">Claim +' + f.points + ' Hero points</button>'
      : '<div class="status" style="text-align:center;opacity:.7">Finish every mission to claim +' + f.points + ' points.</div>');
  return '<div class="place">Act III · ' + esc(f.place) + '</div>' +
    '<h1>' + esc(f.title) + '</h1>' +
    banner +
    '<button id="playNightBtn" class="gold">▶ Play the finale story</button>' +
    '<div class="status" id="audioStatus" style="margin:10px 0 4px;font-size:14px"></div>' +
    '<div class="card"><div class="story-read">' + paragraphs(f.story) + '</div></div>' +
    missionRows(f, p) + claim +
    '<button id="finaleShowdownBtn" style="margin-top:14px">' + (state.finaleDone ? 'Replay the Final Showdown' : '⚡ THE FINAL SHOWDOWN ⚡') + '</button>' +
    '<button class="ghost" id="backHomeBtn" style="margin-top:10px">Back to the trail</button>';
}

function screenReverse() {
  if (reverseLocked()) {
    return '<div class="place">The drive back</div>' +
      '<h1>\u{1F512} Reverse Run</h1>' +
      '<div class="sub">Sealed until the Heroes have beaten the Road Showdown — you can’t retell stories you haven’t heard.</div>' +
      '<button class="ghost" id="backHomeBtn" style="margin-top:10px">Back to the trail</button>';
  }
  var total = ROAD.reverse.length;
  var done = Object.keys(state.reverseDone).length;
  var cards = ROAD.reverse.map(function (rr) {
    var earned = state.reverseDone[rr.id];
    var controls = earned
      ? '<div class="status ok" style="text-align:center">Retold! +' + earned + ' banked</div>'
      : '<div class="answer-row">' +
        '<button class="gold rr-btn" data-rr="' + rr.id + '" data-pts="20">Full retelling +20</button>' +
        '<button class="ghost rr-btn" data-rr="' + rr.id + '" data-pts="10">With help +10</button></div>';
    return '<div class="card rr-card' + (earned ? ' done' : '') + '">' +
      '<div class="place">' + esc(rr.where) + '</div>' +
      '<img class="villain-img" src="assets/villains/villain-' + rr.id.slice(3) + '.svg" alt="' + esc(rr.name) + '" data-fallback="' + rr.symbol + '">' +
      '<div class="rr-name">' + esc(rr.name) + '</div>' +
      '<div class="rules" style="text-align:center">' + esc(rr.hint) + '</div>' +
      controls + '</div>';
  }).join('');
  return '<div class="place">The drive back · Jul 23</div>' +
    '<h1>Reverse Run</h1>' +
    '<div class="sub">You’re driving Theseus’s road in reverse. At each landmark, a Hero retells the story in their own words — the app only gives the name. Full retelling in your own words scores DOUBLE (' + done + '/' + total + ' done).</div>' +
    cards +
    '<button class="ghost" id="backHomeBtn" style="margin-top:10px">Back to the trail</button>';
}

function screenUnderworld() {
  if (!window.HADES) { location.hash = '#home'; return ''; }
  var step = state.hadesStep;
  var total = HADES.riddles.length;
  if (step >= total) {
    var b = badgeById('god-hades');
    return '<div class="underworld"><div class="ceremony">' +
      '<div class="trophy">' + badgeArt(b) + '</div>' +
      '<h1>The Quiet One</h1>' +
      '<div class="rules">You found the god nobody talks about. Hades keeps his word: the thirteenth badge is yours, Heroes, and ' + HADES.points + ' points came up with it from below.</div>' +
      '<button id="backHomeBtn" class="gold" style="margin-top:20px">Back to the daylight</button>' +
      '</div></div>';
  }
  return '<div class="underworld">' +
    '<div class="place">The Underworld · riddle ' + (step + 1) + ' of ' + total + '</div>' +
    '<h1>A voice from below</h1>' +
    '<div class="sub">Someone has been watching you collect his family. Answer, and descend.</div>' +
    '<div class="card qcard"><div class="qtext story-font">' + esc(HADES.riddles[step].riddle) + '</div></div>' +
    '<input id="hadesAnswer" type="text" placeholder="Whisper your answer…" autocomplete="off" autocapitalize="none">' +
    '<button id="hadesSubmit" class="gold">Answer</button>' +
    '<div class="status" id="hadesMsg" style="margin-top:10px;text-align:center"></div>' +
    '<button class="ghost" id="backHomeBtn" style="margin-top:18px">Climb back to the daylight</button>' +
    '</div>';
}

function screenJournal() {
  var earned = BADGES.filter(function (b) { return state.badges[b.id]; });
  var badgesHtml = earned.length
    ? '<div class="badge-grid">' + earned.map(function (b) {
        return '<div class="badge earned">' + badgeArt(b) + '<span class="name">' + esc(b.name) + '</span></div>';
      }).join('') + '</div>'
    : '<div class="rules">No badges yet. The gods are waiting.</div>';
  var timeline = state.history.length
    ? state.history.slice().reverse().map(function (h) {
        var d = new Date(h.when);
        var pts = [];
        if (h.heroes) pts.push('<span class="h-heroes">Heroes +' + h.heroes + '</span>');
        if (h.parents) pts.push('<span class="h-parents">Parents +' + h.parents + '</span>');
        return '<div>' + (d.getMonth() + 1) + '/' + d.getDate() + ' · ' + esc(h.label) + (pts.length ? ' · ' + pts.join(' / ') : '') + '</div>';
      }).join('')
    : '<div>The journal writes itself as you play.</div>';
  return '<div class="print-only print-title">' +
    '<h1>The Poseidon Trail</h1>' +
    '<div>Greece · July 12–24, 2026 · Adam & Leo, Heroes</div>' +
    '<div class="print-score">Final score · Heroes ' + state.scores.heroes + ' — ' + state.scores.parents + ' Parents</div>' +
    '</div>' +
    '<h1 class="no-print">The Book of the Trail</h1>' +
    '<div class="sub no-print">Heroes ' + state.scores.heroes + ' — ' + state.scores.parents + ' Parents · the souvenir builds itself.</div>' +
    '<button id="printJournalBtn" class="ghost no-print" style="margin-bottom:14px;min-height:48px;font-size:15px">\u{1F5A8} Print / save the Book as PDF</button>' +
    '<div class="card"><h2>Quest photos</h2><div class="journal-grid" id="journalPhotos"><div class="rules">Loading photos…</div></div></div>' +
    '<div class="card"><h2>Badges earned</h2>' + badgesHtml + '</div>' +
    '<div class="card"><h2>The story so far</h2><div class="history">' + timeline + '</div></div>';
}

function badgeArt(b) {
  return b.img
    ? '<img class="badge-img" src="' + b.img + '" alt="' + esc(b.name) + '" data-fallback="' + (b.fallback || '\u{1F3C5}') + '">'
    : '<span class="art">' + b.art + '</span>';
}

// Missing artwork degrades to a symbol instead of a broken-image icon.
document.addEventListener('error', function (e) {
  var t = e.target;
  if (t && t.tagName === 'IMG' && t.dataset && t.dataset.fallback) {
    var s = document.createElement('span');
    s.className = 'art';
    s.textContent = t.dataset.fallback;
    t.replaceWith(s);
  }
}, true);

// Short stingers for ceremonies. Precached, so they fire offline too.
var sfxEl = new Audio();
function sfx(name) {
  try {
    sfxEl.src = 'audio/sfx/' + name + '.mp3';
    sfxEl.currentTime = 0;
    sfxEl.play().catch(function () {});
  } catch (e) {}
}

function screenBadges() {
  var html = BADGES.map(function (b) {
    var e = state.badges[b.id];
    if (b.hidden && !e) {
      // The unmarked door to the underworld. Curious Heroes will find it.
      return '<a class="badge shadow" href="#underworld">' +
        '<span class="art">?</span>' +
        '<span class="name">· · ·</span>' +
        '<span class="how">' + (state.hadesStep > 0 ? 'The door is open' : '&nbsp;') + '</span>' +
        '</a>';
    }
    var cls = e ? 'earned' : 'locked';
    return '<div class="badge ' + cls + '">' +
      badgeArt(b) +
      '<span class="name">' + esc(b.name) + '</span>' +
      '<span class="how">' + esc(e ? 'Earned!' : b.how) + '</span>' +
      '</div>';
  }).join('');
  var guests = state.guestBadges.length
    ? '<h2 style="margin-top:20px">Guest Heroes</h2><div class="card history">' +
      state.guestBadges.map(function (g) {
        return '<div class="guest-row"><img class="guest-img" src="' + window.GUEST_BADGE_IMG + '" alt="guest badge"> <b>' + esc(g.name) + '</b> · guest badge, night ' + g.night + '</div>';
      }).join('') + '</div>'
    : '';
  return '<h1>Badges</h1><div class="sub">The trip journal builds itself. Collect them all.</div>' +
    '<div class="badge-grid">' + html + '</div>' + guests;
}

function screenTrivia() {
  var packs = availablePacks();
  if (!packs.some(function (p) { return p.id === quick.packId; })) { quick.packId = packs[0].id; quick.recent = []; quick.qIndex = -1; }
  if (quick.qIndex === -1) nextQuick();
  var pack = packById(quick.packId);
  var q = pack.questions[quick.qIndex];
  var packSel = '<label for="packSel">Question pack</label><select id="packSel">' +
    packs.map(function (p) {
      return '<option value="' + p.id + '"' + (quick.packId === p.id ? ' selected' : '') + '>' + esc(p.title) + '</option>';
    }).join('') + '</select>';
  var body;
  if (!q) {
    body = '<div class="card qcard"><div class="qtext">No ' + TIER_LABEL[quick.tier] + ' questions in this pack. Pick another.</div></div>';
  } else {
    body = '<div class="card qcard">' +
      '<span class="tierchip tier-' + q.tier + '">' + TIER_LABEL[q.tier] + '</span>' +
      '<div class="qtext">' + esc(q.q) + '</div>' +
      (quick.revealed ? '<div class="atext">' + esc(q.a) + '</div>' : '') +
      '</div>' +
      (quick.revealed
        ? '<button id="quickNext" class="gold">Next question</button>'
        : '<button id="quickReveal">Reveal the answer</button>');
  }
  return '<h1>Quick Trivia</h1><div class="sub">Field practice. No points, just glory.</div>' +
    '<div class="card">' + packSel +
    '<label for="tierSel">Who is answering?</label>' +
    '<select id="tierSel">' +
    ['leo', 'adam', 'parents'].map(function (t) {
      return '<option value="' + t + '"' + (quick.tier === t ? ' selected' : '') + '>' + TIER_LABEL[t] + '</option>';
    }).join('') +
    '</select></div>' + body;
}

function screenScores() {
  var hist = state.history.length
    ? state.history.slice(0, 15).map(function (h) {
        var d = new Date(h.when);
        return '<div>' + (d.getMonth() + 1) + '/' + d.getDate() + ' · ' + esc(h.label) +
          ' · <span class="h-heroes">Heroes +' + h.heroes + '</span> / <span class="h-parents">Parents +' + h.parents + '</span></div>';
      }).join('')
    : '<div>No battles yet. The first Showdown writes history.</div>';
  return '<h1>Scoreboard</h1><div class="sub">The whole trip, one battle.</div>' +
    '<div class="card showdown-score">' +
    '<div>Heroes<b>' + state.scores.heroes + '</b></div><div class="mid">vs</div>' +
    '<div>Parents<b>' + state.scores.parents + '</b></div></div>' +
    '<div class="card"><h2>Add quest points</h2>' +
    '<label for="ptsTeam">Team</label>' +
    '<select id="ptsTeam"><option value="heroes">Heroes (Adam + Leo)</option><option value="parents">Parents</option></select>' +
    '<label for="ptsAmount">Points</label>' +
    '<input id="ptsAmount" type="number" inputmode="numeric" min="1" max="500" placeholder="e.g. 20">' +
    '<label for="ptsNote">For what? (shows in history)</label>' +
    '<input id="ptsNote" type="text" placeholder="e.g. found the owl first" maxlength="40">' +
    '<button id="ptsAdd" class="gold">Add points</button>' +
    '<div class="foot" id="ptsMsg"></div></div>' +
    '<div class="card"><h2>History</h2><div class="history">' + hist + '</div></div>' +
    '<div class="card"><h2>Base Camp</h2>' +
    '<div class="rules" id="storageInfo">Checking device storage…</div>' +
    '<div class="rules" id="audioInfo" style="margin-top:6px">Checking story voices…</div>' +
    '<button id="resetBtn" class="danger" style="margin-top:12px">Reset all game data</button></div>';
}

function ceremonyScreen() {
  var result = ceremony;
  var trophy = result.tie ? '⚖️' : (result.heroesWin ? '\u{1F3C6}' : '\u{1F3DB}');
  var headline = result.tie ? 'A draw. Poseidon demands a rematch.' :
    (result.heroesWin ? 'The Heroes take the night!' : 'The Parents hold the line!');
  if (result.finale) {
    trophy = '<img class="badge-img" src="assets/badges/badge-poseidon.svg" alt="Poseidon" style="width:120px;height:120px">';
    headline = 'THE TRAIL IS COMPLETE';
    return '<div class="ceremony">' +
      '<div class="trophy">' + trophy + '</div>' +
      '<h1>' + headline + '</h1>' +
      '<div class="final">Heroes ' + result.heroes + ' — ' + result.parents + ' Parents tonight</div>' +
      '<div class="rules">From a stone ship in Corfu to the temple of the sea god. Twelve gods know your names. The Earth-Shaker is satisfied.</div>' +
      (result.earned.length ? '<h2 style="margin-top:14px">New badges</h2><div>' + result.earned.map(function (b) {
        return '<span class="newbadge">' + badgeArt(b) + '<span class="name">' + esc(b.name) + '</span></span>';
      }).join('') + '</div>' : '') +
      '<button id="sdJournal" class="gold" style="margin-top:24px">Open the Journal</button>' +
      '<button id="sdDone" class="ghost" style="margin-top:10px">Back to the trail</button>' +
      '</div>';
  }
  var badgesHtml = result.earned.map(function (b) {
    return '<span class="newbadge">' + badgeArt(b) + '<span class="name">' + esc(b.name) + '</span></span>';
  }).join('');
  var guestsHtml = '';
  if (result.guests.length && !result.guestsAwarded) {
    guestsHtml = '<div class="card" style="text-align:left;margin-top:18px"><h2>Guest badges</h2>' +
      '<div class="rules">A guest earns the badge with 3 or more right answers tonight. The table decides.</div>' +
      result.guests.map(function (g, i) {
        return '<button class="ghost guest-toggle" data-gi="' + i + '" style="margin-top:10px">⭐ ' + esc(g) + ' earned it</button>';
      }).join('') + '</div>';
  } else if (result.guests.length && result.guestsAwarded) {
    guestsHtml = '<div class="status ok">Guest badges saved.</div>';
  }
  return '<div class="ceremony">' +
    '<div class="trophy">' + trophy + '</div>' +
    '<h1>' + esc(headline) + '</h1>' +
    '<div class="final">Heroes ' + result.heroes + ' — ' + result.parents + ' Parents</div>' +
    (badgesHtml ? '<h2>New badges</h2><div>' + badgesHtml + '</div>' : '') +
    guestsHtml +
    '<button id="sdDone" class="gold" style="margin-top:24px">Back to the trail</button>' +
    '</div>';
}

function screenShowdown() {
  if (ceremony) return ceremonyScreen();
  if (!live) {
    var tonight = tonightNight();
    var packs = availablePacks(preferredPack);
    var defaultPack = preferredPack || (tonight ? tonight.id : packs[0].id);
    if (!packs.some(function (p) { return p.id === defaultPack; })) defaultPack = packs[0].id;
    var options = packs.map(function (p) {
      var night = nightById(p.id);
      var mark = night && state.nightsDone[p.id] ? ' ✓' : '';
      return '<option value="' + p.id + '"' + (p.id === defaultPack ? ' selected' : '') + '>' + esc(p.title) + mark + '</option>';
    }).join('');
    return '<h1>Showdown</h1><div class="sub">Heroes vs Parents. Loud and theatrical.</div>' +
      '<div class="card"><h2>The rules</h2><div class="rules">' + esc(RULES_TEXT) + '</div></div>' +
      '<div class="card"><h2>Tonight’s pack</h2>' +
      '<select id="sdPack">' + options + '</select>' +
      '<label for="sdGuests">Cousins playing tonight? (first names, comma separated)</label>' +
      '<input id="sdGuests" type="text" placeholder="e.g. Maya, Tom" maxlength="60"></div>' +
      '<button id="sdFull" class="gold">Begin the Showdown</button>' +
      '<button id="sdQuick" class="ghost">Quick battle · 2 questions each</button>';
  }
  if (live.pos >= live.order.length) {
    ceremony = finishShowdown();
    return ceremonyScreen();
  }
  var q = currentQuestion();
  var team = TIER_TEAM[q.tier];
  var answerBtns = live.revealed
    ? '<div class="answer-row">' +
      '<button id="sdGot" class="gold">' + (team === 'heroes' ? 'Heroes' : 'Parents') + ' got it! +' + POINTS_PER_CORRECT + '</button>' +
      '<button id="sdMiss" class="ghost">Missed</button></div>'
    : '<button id="sdReveal">Reveal the answer</button>';
  return '<div class="showdown-score">' +
    '<div>Heroes<b>' + live.heroes + '</b></div><div class="mid">tonight</div>' +
    '<div>Parents<b>' + live.parents + '</b></div></div>' +
    '<div class="progress">Question ' + (live.pos + 1) + ' of ' + live.order.length + '</div>' +
    '<div class="card qcard">' +
    '<span class="tierchip tier-' + q.tier + '">' + TIER_LABEL[q.tier] + (q.tier === 'parents' ? '’ question' : '’s question') + '</span>' +
    '<div class="qtext">' + esc(q.q) + '</div>' +
    (live.revealed ? '<div class="atext">' + esc(q.a) + '</div>' : '') +
    '</div>' + answerBtns +
    '<button id="sdAbandon" class="ghost" style="margin-top:22px;font-size:14px;min-height:44px">Abandon this Showdown</button>';
}

/* ---------- Router ---------- */

var SCREENS = { home: screenHome, trivia: screenTrivia, badges: screenBadges, scores: screenScores, showdown: screenShowdown, journal: screenJournal, reverse: screenReverse, finale: screenFinale, underworld: screenUnderworld };

function route() {
  var h = (location.hash || '#home').slice(1);
  if (/^night-\d+$/.test(h)) return { name: 'night', num: parseInt(h.slice(6), 10) };
  if (/^roadstory-\d+$/.test(h)) return { name: 'roadstory', num: parseInt(h.slice(10), 10) };
  if (questById(h)) return { name: 'quest', id: h };
  return { name: SCREENS[h] ? h : 'home' };
}

function render() {
  var r = route();
  var html;
  if (r.name === 'night') html = screenNight(r.num);
  else if (r.name === 'roadstory') html = screenRoadStory(r.num);
  else if (r.name === 'quest') html = screenQuest(r.id);
  else html = SCREENS[r.name]();
  $('#screen').innerHTML = html;
  var homeish = ['night', 'roadstory', 'quest', 'reverse', 'finale'];
  document.querySelectorAll('#tabbar a').forEach(function (a) {
    a.classList.toggle('active', a.dataset.tab === r.name || (homeish.indexOf(r.name) !== -1 && a.dataset.tab === 'home'));
  });
  window.scrollTo(0, 0);
  bind(r);
  updateStrip();
}

function bind(r) {
  var el;
  el = $('#backHomeBtn'); if (el) el.onclick = function () { location.hash = '#home'; };

  if (r.name === 'home') {
    $('#tonightBtn').onclick = function () {
      if (live) { location.hash = '#showdown'; return; }
      var tonight = tonightNight();
      location.hash = tonight ? '#night-' + tonight.num : '#showdown';
    };
    el = $('#dlAllBtn'); if (el) {
      (function (btn) { btn.onclick = function () { downloadAudioList(NIGHTS, btn); }; markAudioButton(btn, NIGHTS); })(el);
    }
    el = $('#dlRoadBtn'); if (el) {
      (function (btn) { btn.onclick = function () { downloadAudioList(ROAD_AUDIO, btn); }; markAudioButton(btn, ROAD_AUDIO); })(el);
    }
  }

  if (r.name === 'roadstory') {
    var rs = ROAD.stories[r.num - 1];
    if (!state.storiesRead[rs.id]) { state.storiesRead[rs.id] = true; saveState(); }
    ensureNightAudio(rs).catch(function () {});
    $('#playNightBtn').onclick = function () { playNight(rs); };
    if (audioPlaying === rs.id && !audioEl.paused) $('#playNightBtn').textContent = '⏸ Pause';
    el = $('#roadShowdownBtn'); if (el) el.onclick = function () { preferredPack = 'road-theseus'; location.hash = '#showdown'; };
    el = $('#prevStoryBtn'); if (el) el.onclick = function () { location.hash = '#roadstory-' + (r.num - 1); };
    el = $('#nextStoryBtn'); if (el) el.onclick = function () { location.hash = '#roadstory-' + (r.num + 1); };
  }

  if (r.name === 'finale' && ROAD.finale) {
    ensureNightAudio(ROAD.finale).catch(function () {});
    el = $('#playNightBtn'); if (el) {
      el.onclick = function () { playNight(ROAD.finale); };
      if (audioPlaying === ROAD.finale.id && !audioEl.paused) el.textContent = '⏸ Pause';
    }
    bindQuestControls(finaleQuestEntity());
    el = $('#finaleShowdownBtn'); if (el) el.onclick = function () { preferredPack = 'finale-sounio'; location.hash = '#showdown'; };
    el = $('#openJournalBtn'); if (el) el.onclick = function () { location.hash = '#journal'; };
  }

  if (r.name === 'reverse') {
    document.querySelectorAll('.rr-btn').forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.dataset.rr;
        var pts = parseInt(btn.dataset.pts, 10);
        var rr = null;
        ROAD.reverse.forEach(function (x) { if (x.id === id) rr = x; });
        if (!rr || state.reverseDone[id]) return;
        state.reverseDone[id] = pts;
        state.scores.heroes += pts;
        state.history.unshift({ when: new Date().toISOString(), label: 'Reverse Run: ' + rr.name, heroes: pts, parents: 0 });
        saveState(); render();
      };
    });
  }

  if (r.name === 'underworld' && window.HADES) {
    if (state.hadesStep === 0) sfx('underworld'); // the door creaks open
    el = $('#hadesSubmit'); if (el) el.onclick = function () {
      var raw = ($('#hadesAnswer').value || '').toLowerCase().trim().replace(/^the\s+/, '');
      var ok = HADES.riddles[state.hadesStep].accept.indexOf(raw) !== -1;
      if (!ok) {
        $('#hadesMsg').innerHTML = '<span class="bad">The shadows are silent. Think back to the stories…</span>';
        return;
      }
      state.hadesStep++;
      if (state.hadesStep >= HADES.riddles.length) {
        awardBadge('god-hades', 'heroes');
        state.scores.heroes += HADES.points;
        state.history.unshift({ when: new Date().toISOString(), label: 'The Hidden God: found', heroes: HADES.points, parents: 0 });
        sfx('underworld');
      }
      saveState(); render();
    };
    el = $('#hadesAnswer'); if (el) el.onkeydown = function (e) { if (e.key === 'Enter') $('#hadesSubmit').click(); };
  }

  if (r.name === 'journal') {
    el = $('#printJournalBtn'); if (el) el.onclick = function () { window.print(); };
    idbKeys('photos').then(function (keys) {
      var holder = $('#journalPhotos');
      if (!holder) return;
      if (!keys.length) { holder.innerHTML = '<div class="rules">No quest photos yet. The camera missions are waiting.</div>'; return; }
      holder.innerHTML = '';
      var owners = QUESTS.slice();
      if (ROAD.finale) owners.push({ id: 'finale', title: ROAD.finale.title });
      keys.forEach(function (key) {
        var owner = null;
        owners.forEach(function (q) { if (key.indexOf(q.id + '-') === 0) owner = q; });
        idbGet('photos', key).then(function (blob) {
          if (!blob) return;
          var fig = document.createElement('figure');
          fig.className = 'journal-photo';
          var img = document.createElement('img');
          img.src = URL.createObjectURL(blob);
          var cap = document.createElement('figcaption');
          cap.textContent = owner ? owner.title : 'Quest photo';
          fig.appendChild(img); fig.appendChild(cap);
          holder.appendChild(fig);
        });
      });
    });
  }

  if (r.name === 'night') {
    var n = NIGHTS[r.num - 1];
    ensureNightAudio(n).catch(function () {}); // warm the cache; errors surface on play
    el = $('#playNightBtn'); if (el) {
      el.onclick = function () { playNight(n); };
      if (audioPlaying === n.id && !audioEl.paused) el.textContent = '⏸ Pause';
    }
    el = $('#nightShowdownBtn'); if (el) el.onclick = function () {
      preferredPack = n.id;
      location.hash = '#showdown';
    };
  }

  if (r.name === 'quest') {
    bindQuestControls(questById(r.id));
  }

  if (r.name === 'trivia') {
    $('#packSel').onchange = function (e) { quick.packId = e.target.value; quick.recent = []; nextQuick(); render(); };
    $('#tierSel').onchange = function (e) { quick.tier = e.target.value; quick.recent = []; nextQuick(); render(); };
    el = $('#quickReveal'); if (el) el.onclick = function () { quick.revealed = true; render(); };
    el = $('#quickNext'); if (el) el.onclick = function () { nextQuick(); render(); };
  }

  if (r.name === 'scores') {
    $('#ptsAdd').onclick = function () {
      var team = $('#ptsTeam').value;
      var pts = parseInt($('#ptsAmount').value, 10);
      var note = $('#ptsNote').value.trim() || 'Quest points';
      if (!pts || pts < 1) { $('#ptsMsg').innerHTML = '<span class="bad">Enter the points first.</span>'; return; }
      state.scores[team] += pts;
      state.history.unshift({ when: new Date().toISOString(), label: note, heroes: team === 'heroes' ? pts : 0, parents: team === 'parents' ? pts : 0 });
      saveState();
      render();
    };
    $('#resetBtn').onclick = function () {
      if (!confirm('Erase ALL scores, badges, nights and history on this device? Story audio stays. This cannot be undone.')) return;
      var wipePhotos = confirm('Also erase all quest photos on this device?\n\nOK = erase photos too (fresh start before the trip)\nCancel = keep the photos');
      localStorage.removeItem(STATE_KEY);
      localStorage.removeItem(LIVE_KEY);
      state = loadState(); live = null; ceremony = null;
      if (wipePhotos) idbClear('photos').then(render).catch(render);
      else render();
    };
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(function (e) {
        var s = $('#storageInfo');
        if (s) s.textContent = 'Device storage: ' + Math.round((e.usage || 0) / 1048576) + ' MB used of ' +
          Math.round((e.quota || 0) / 1048576) + ' MB available to the app.';
      });
    } else {
      $('#storageInfo').textContent = 'Storage estimate not available on this device.';
    }
    idbKeys('audio').then(function (keys) {
      var have = ALL_AUDIO.filter(function (n) { return keys.indexOf(audioKey(n)) !== -1; }).length;
      var a = $('#audioInfo');
      if (a) a.innerHTML = have === ALL_AUDIO.length && ALL_AUDIO.length
        ? '<span class="ok">All ' + have + ' story voices stored on this device. Airplane-ready.</span>'
        : have + ' of ' + ALL_AUDIO.length + ' story voices on this device. Use the download buttons on the Trail screen while on wifi.';
    });
  }

  if (r.name === 'showdown') {
    if (ceremony) {
      if (!ceremony.fanfared) { ceremony.fanfared = true; sfx('fanfare'); }
      document.querySelectorAll('.guest-toggle').forEach(function (btn) {
        btn.onclick = function () {
          var g = ceremony.guests[parseInt(btn.dataset.gi, 10)];
          state.guestBadges.push({ name: g, night: ceremony.night || 0, when: new Date().toISOString() });
          saveState();
          btn.textContent = '⭐ ' + g + ' — badge saved!';
          btn.disabled = true;
        };
      });
      el = $('#sdDone'); if (el) el.onclick = function () { ceremony = null; preferredPack = null; location.hash = '#home'; };
      el = $('#sdJournal'); if (el) el.onclick = function () { ceremony = null; preferredPack = null; location.hash = '#journal'; };
      return;
    }
    el = $('#sdFull'); if (el) el.onclick = function () { startShowdown($('#sdPack').value, null, parseGuests()); };
    el = $('#sdQuick'); if (el) el.onclick = function () { startShowdown($('#sdPack').value, 2, parseGuests()); };
    el = $('#sdReveal'); if (el) el.onclick = function () { live.revealed = true; saveLive(); render(); };
    el = $('#sdGot'); if (el) el.onclick = function () { answerShowdown(true); };
    el = $('#sdMiss'); if (el) el.onclick = function () { answerShowdown(false); };
    el = $('#sdAbandon'); if (el) el.onclick = function () {
      if (confirm('Abandon this Showdown? Tonight’s points so far will be lost.')) {
        live = null; saveLive(); render();
      }
    };
  }
}

// Mission checklist, photo capture, and claim wiring shared by quests and the finale.
function bindQuestControls(q) {
  var p = state.questProgress[q.id] || { missions: {}, claimed: false };
  state.questProgress[q.id] = p;
  document.querySelectorAll('.mission-btn[data-mission]').forEach(function (btn) {
    btn.onclick = function () {
      var mid = btn.dataset.mission;
      p.missions[mid] = !p.missions[mid];
      saveState(); render();
    };
  });
  document.querySelectorAll('input[type=file][data-mission]').forEach(function (inp) {
    inp.onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      var mid = inp.dataset.mission;
      idbPut('photos', q.id + '-' + mid, f).then(function () {
        p.missions[mid] = true;
        saveState(); render();
      }).catch(function (err) { alert('Photo save failed: ' + err.message); });
    };
  });
  q.missions.forEach(function (m) {
    if (m.type !== 'photo') return;
    idbGet('photos', q.id + '-' + m.id).then(function (blob) {
      if (!blob) return;
      var img = $('#mphoto-' + m.id);
      if (img) { img.src = URL.createObjectURL(blob); img.style.display = 'block'; }
    });
  });
  var claimEl = $('#claimBtn');
  if (claimEl) claimEl.onclick = function () {
    p.claimed = true;
    state.scores.heroes += q.points;
    state.history.unshift({ when: new Date().toISOString(), label: q.title, heroes: q.points, parents: 0 });
    if (q.badgeId) awardBadge(q.badgeId, 'heroes');
    saveState(); render();
  };
}

function parseGuests() {
  var el = $('#sdGuests');
  if (!el || !el.value.trim()) return [];
  return el.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 6);
}

window.addEventListener('hashchange', render);

if (navigator.storage && navigator.storage.persist) navigator.storage.persist();

render();

})();
