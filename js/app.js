// The Poseidon Trail — game engine (Phase 2: Corfu pack wired in).
// All state lives on-device: game state in localStorage, big blobs (story
// audio, quest photos) in IndexedDB. No backend, no accounts.

(function () {
'use strict';

var $ = function (sel) { return document.querySelector(sel); };

var NIGHTS = (window.CORFU && CORFU.nights) || [];
var QUESTS = (window.CORFU && CORFU.quests) || [];

/* ---------- State ---------- */

var STATE_KEY = 'ptrail-state-v1';
var LIVE_KEY = 'ptrail-showdown-live-v1';

var DEFAULT_STATE = {
  version: 2,
  scores: { heroes: 0, parents: 0 },
  history: [],            // {when, label, heroes, parents}
  badges: {},             // badgeId -> {when, by}
  showdownsPlayed: 0,
  parentLosses: 0,
  nightsDone: {},         // nightId -> true
  questProgress: {},      // questId -> {missions:{}, claimed:false}
  guestBadges: []         // {name, night, when}
};

function loadState() {
  try {
    var raw = localStorage.getItem(STATE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    var s = JSON.parse(raw);
    for (var k in DEFAULT_STATE) if (!(k in s)) s[k] = JSON.parse(JSON.stringify(DEFAULT_STATE[k]));
    return s;
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

var state = loadState();

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

// Get a playable URL for a night's narration: memory -> IndexedDB -> network (then stored).
function ensureNightAudio(night) {
  if (audioUrls[night.id]) return Promise.resolve(audioUrls[night.id]);
  return idbGet('audio', night.id).then(function (blob) {
    if (blob) {
      audioUrls[night.id] = URL.createObjectURL(blob);
      return audioUrls[night.id];
    }
    if (!navigator.onLine) throw new Error('offline');
    return fetch(night.audio).then(function (r) {
      if (!r.ok) throw new Error('missing');
      return r.blob();
    }).then(function (b) {
      return idbPut('audio', night.id, b).then(function () {
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

function downloadAllAudio() {
  var btn = $('#dlAllBtn');
  if (!navigator.onLine) { if (btn) btn.textContent = 'Needs wifi — try at the villa'; return; }
  var i = 0;
  function next() {
    if (i >= NIGHTS.length) {
      if (btn) { btn.textContent = 'All ' + NIGHTS.length + ' voices on this device ✓'; btn.disabled = true; }
      return;
    }
    var n = NIGHTS[i];
    if (btn) btn.textContent = 'Fetching voice ' + (i + 1) + ' of ' + NIGHTS.length + '…';
    ensureNightAudio(n).then(function () { i++; next(); })
      .catch(function () { i++; next(); }); // skip missing ones, keep going
  }
  next();
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

function checkTotalBadges() {
  var earned = [];
  var b;
  if (state.scores.heroes >= 100) { b = awardBadge('trident', 'heroes'); if (b) earned.push(b); }
  if (state.parentLosses >= 3) { b = awardBadge('titan', 'heroes'); if (b) earned.push(b); }
  return earned;
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
  var b;
  state.showdownsPlayed++;
  b = awardBadge('spark'); if (b) earned.push(b);
  var heroesWin = live.heroes > live.parents;
  if (heroesWin) {
    state.parentLosses++;
    b = awardBadge('nike', 'heroes'); if (b) earned.push(b);
  }
  if (live.heroesMaxStreak >= 3) { b = awardBadge('streak3', 'heroes'); if (b) earned.push(b); }
  if (live.heroesAsked > 0 && live.heroesMiss === 0) { b = awardBadge('owl', 'heroes'); if (b) earned.push(b); }
  else if (live.parentsAsked > 0 && live.parentsMiss === 0) { b = awardBadge('owl', 'parents'); if (b) earned.push(b); }

  // Night showdowns close the night and mint the god badge.
  var night = nightById(live.packId);
  if (night) {
    state.nightsDone[night.id] = true;
    b = awardBadge(night.badgeId, 'family'); if (b) earned.push(b);
  }

  state.scores.heroes += live.heroes;
  state.scores.parents += live.parents;
  earned = earned.concat(checkTotalBadges());
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
    label: packById(live.packId).title
  };
  live = null;
  saveLive();
  return result;
}

/* ---------- Quick trivia ---------- */

var quick = { tier: 'leo', packIdx: 0, qIndex: -1, revealed: false, recent: [] };

function nextQuick() {
  var pack = PACKS[quick.packIdx] || PACKS[0];
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

function screenHome() {
  var tonight = tonightNight();
  var nightRows = NIGHTS.map(function (n) {
    var done = !!state.nightsDone[n.id];
    var isTonight = tonight && tonight.id === n.id;
    return '<a class="list-row ' + (done ? 'done' : '') + '" href="#night-' + n.num + '">' +
      '<span class="sym">' + n.symbol + '</span>' +
      '<span class="grow">Night ' + n.num + ': ' + esc(n.god) + '</span>' +
      (done ? '<span class="ok">✓</span>' : (isTonight ? '<span class="chip-tonight">TONIGHT</span>' : '')) +
      '</a>';
  }).join('');
  var questRows = QUESTS.map(function (q) {
    var p = state.questProgress[q.id];
    var claimed = p && p.claimed;
    return '<a class="list-row ' + (claimed ? 'done' : '') + '" href="#' + q.id + '">' +
      '<span class="sym">' + q.symbol + '</span>' +
      '<span class="grow">' + esc(q.title) + '</span>' +
      (claimed ? '<span class="ok">✓</span>' : '') +
      '</a>';
  }).join('');
  var tonightLabel = live ? 'Continue the Showdown' : (tonight ? 'Night ' + tonight.num + ': ' + tonight.god : "Tonight's Showdown");
  var tonightSub = live ? 'A battle is still open' : (tonight ? tonight.title : 'All eight nights complete!');
  var actsTail = ACTS.slice(1).map(function (act) {
    return '<div class="card act locked">' +
      '<span class="node">\u{1F512}</span>' +
      '<div class="place">' + esc(act.place) + '</div>' +
      '<h2>' + esc(act.title) + '</h2>' +
      '<p>' + esc(act.blurb) + '</p>' +
      '</div>';
  }).join('');
  return '<h1>The Poseidon Trail</h1>' +
    '<div class="sub">Corfu to Sounio. The sea god is watching.</div>' +
    '<button id="tonightBtn">' + esc(tonightLabel) + '<small>' + esc(tonightSub) + '</small></button>' +
    '<div class="trail">' +
    '<div class="card act unlocked">' +
    '<span class="node">' + ACTS[0].node + '</span>' +
    '<div class="place">' + esc(ACTS[0].place) + '</div>' +
    '<h2>' + esc(ACTS[0].title) + '</h2>' +
    '<div class="rowlist">' + nightRows + '</div>' +
    '<button id="dlAllBtn" class="ghost" style="margin-top:12px;min-height:48px;font-size:15px">Download all 8 story voices for offline</button>' +
    '</div>' +
    '<div class="card act unlocked">' +
    '<span class="node">\u{1F3F9}</span>' +
    '<div class="place">Corfu missions</div>' +
    '<h2>Quests</h2>' +
    '<div class="rowlist">' + questRows + '</div>' +
    '</div>' +
    actsTail +
    '</div>' +
    '<div class="foot">Act I: the Corfu pack · the road pack sails in next</div>';
}

function screenNight(num) {
  var n = NIGHTS[num - 1];
  if (!n) { location.hash = '#home'; return ''; }
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
  var rows = q.missions.map(function (m) {
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
  var claim = p.claimed
    ? '<div class="status ok" style="text-align:center">Quest complete: +' + q.points + ' points banked, badge earned. \u{1F3C5}</div>'
    : (allDone
      ? '<button id="claimBtn" class="gold">Claim +' + q.points + ' Hero points & the ' + esc(q.badgeName) + ' badge</button>'
      : '<div class="status" style="text-align:center;opacity:.7">Finish every mission to claim +' + q.points + ' points.</div>');
  return '<div class="place">' + esc(q.place) + '</div>' +
    '<h1>' + esc(q.title) + '</h1>' +
    '<div class="sub story-font">' + esc(q.intro) + '</div>' +
    rows + claim +
    (q.questions.length ? '<div class="foot">This quest’s trivia appears in the Showdown pack list once you’ve been here.</div>' : '') +
    '<button class="ghost" id="backHomeBtn" style="margin-top:14px">Back to the trail</button>';
}

function screenBadges() {
  var html = BADGES.map(function (b) {
    var e = state.badges[b.id];
    var cls = b.sealed ? 'locked' : (e ? 'earned' : 'locked');
    return '<div class="badge ' + cls + (b.god ? ' medal' : '') + '">' +
      '<span class="art">' + b.art + '</span>' +
      '<span class="name">' + esc(b.name) + '</span>' +
      '<span class="how">' + esc(e && !b.sealed ? 'Earned!' : b.how) + '</span>' +
      '</div>';
  }).join('');
  var guests = state.guestBadges.length
    ? '<h2 style="margin-top:20px">Guest Heroes</h2><div class="card history">' +
      state.guestBadges.map(function (g) {
        return '<div>⭐ <b>' + esc(g.name) + '</b> · guest badge, night ' + g.night + '</div>';
      }).join('') + '</div>'
    : '';
  return '<h1>Badges</h1><div class="sub">The trip journal builds itself. Collect them all.</div>' +
    '<div class="badge-grid">' + html + '</div>' + guests;
}

function screenTrivia() {
  if (quick.qIndex === -1) nextQuick();
  var pack = PACKS[quick.packIdx] || PACKS[0];
  var q = pack.questions[quick.qIndex];
  var packSel = '<label for="packSel">Question pack</label><select id="packSel">' +
    PACKS.map(function (p, i) {
      return '<option value="' + i + '"' + (quick.packIdx === i ? ' selected' : '') + '>' + esc(p.title) + '</option>';
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
  var badgesHtml = result.earned.map(function (b) {
    return '<span class="newbadge"><span class="art">' + b.art + '</span><span class="name">' + esc(b.name) + '</span></span>';
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
    var defaultPack = preferredPack || (tonight ? tonight.id : PACKS[0].id);
    var options = PACKS.map(function (p) {
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

var SCREENS = { home: screenHome, trivia: screenTrivia, badges: screenBadges, scores: screenScores, showdown: screenShowdown };

function route() {
  var h = (location.hash || '#home').slice(1);
  if (/^night-\d+$/.test(h)) return { name: 'night', num: parseInt(h.slice(6), 10) };
  if (questById(h)) return { name: 'quest', id: h };
  return { name: SCREENS[h] ? h : 'home' };
}

function render() {
  var r = route();
  var html;
  if (r.name === 'night') html = screenNight(r.num);
  else if (r.name === 'quest') html = screenQuest(r.id);
  else html = SCREENS[r.name]();
  $('#screen').innerHTML = html;
  document.querySelectorAll('#tabbar a').forEach(function (a) {
    a.classList.toggle('active', a.dataset.tab === r.name || (r.name === 'night' && a.dataset.tab === 'home') || (r.name === 'quest' && a.dataset.tab === 'home'));
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
      el.onclick = downloadAllAudio;
      idbKeys('audio').then(function (keys) {
        var have = NIGHTS.filter(function (n) { return keys.indexOf(n.id) !== -1; }).length;
        if (have === NIGHTS.length && NIGHTS.length) { el.textContent = 'All ' + have + ' voices on this device ✓'; el.disabled = true; }
        else if (have > 0) el.textContent = 'Download story voices (' + have + ' of ' + NIGHTS.length + ' on device)';
      });
    }
  }

  if (r.name === 'night') {
    var n = NIGHTS[r.num - 1];
    ensureNightAudio(n).catch(function () {}); // warm the cache; errors surface on play
    $('#playNightBtn').onclick = function () { playNight(n); };
    if (audioPlaying === n.id && !audioEl.paused) $('#playNightBtn').textContent = '⏸ Pause';
    $('#nightShowdownBtn').onclick = function () {
      preferredPack = n.id;
      location.hash = '#showdown';
    };
  }

  if (r.name === 'quest') {
    var q = questById(r.id);
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
    // restore saved photos into their slots
    q.missions.forEach(function (m) {
      if (m.type !== 'photo') return;
      idbGet('photos', q.id + '-' + m.id).then(function (blob) {
        if (!blob) return;
        var img = $('#mphoto-' + m.id);
        if (img) { img.src = URL.createObjectURL(blob); img.style.display = 'block'; }
      });
    });
    el = $('#claimBtn'); if (el) el.onclick = function () {
      p.claimed = true;
      state.scores.heroes += q.points;
      state.history.unshift({ when: new Date().toISOString(), label: q.title, heroes: q.points, parents: 0 });
      awardBadge(q.badgeId, 'heroes');
      checkTotalBadges();
      saveState(); render();
    };
  }

  if (r.name === 'trivia') {
    $('#packSel').onchange = function (e) { quick.packIdx = parseInt(e.target.value, 10); quick.recent = []; nextQuick(); render(); };
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
      checkTotalBadges();
      saveState();
      render();
    };
    $('#resetBtn').onclick = function () {
      if (confirm('Erase ALL scores, badges, nights and history on this device? Photos and story audio stay. This cannot be undone.')) {
        localStorage.removeItem(STATE_KEY);
        localStorage.removeItem(LIVE_KEY);
        state = loadState(); live = null; ceremony = null;
        render();
      }
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
      var have = NIGHTS.filter(function (n) { return keys.indexOf(n.id) !== -1; }).length;
      var a = $('#audioInfo');
      if (a) a.innerHTML = have === NIGHTS.length && NIGHTS.length
        ? '<span class="ok">All ' + have + ' story voices stored on this device. Airplane-ready.</span>'
        : have + ' of ' + NIGHTS.length + ' story voices on this device. Use “Download all” on the Trail screen while on wifi.';
    });
  }

  if (r.name === 'showdown') {
    if (ceremony) {
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

function parseGuests() {
  var el = $('#sdGuests');
  if (!el || !el.value.trim()) return [];
  return el.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 6);
}

window.addEventListener('hashchange', render);

if (navigator.storage && navigator.storage.persist) navigator.storage.persist();

render();

})();
