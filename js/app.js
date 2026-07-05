// The Poseidon Trail — Phase 1 game engine.
// All state lives on-device: game state in localStorage, big blobs (photos,
// audio packs, from Phase 2 on) in IndexedDB. No backend, no accounts.

(function () {
'use strict';

var $ = function (sel) { return document.querySelector(sel); };

/* ---------- State ---------- */

var STATE_KEY = 'ptrail-state-v1';
var LIVE_KEY = 'ptrail-showdown-live-v1';

var DEFAULT_STATE = {
  version: 1,
  scores: { heroes: 0, parents: 0 },
  history: [],            // {when, label, heroes, parents}
  badges: {},             // badgeId -> {when, by}
  showdownsPlayed: 0,
  parentLosses: 0
};

function loadState() {
  try {
    var raw = localStorage.getItem(STATE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    var s = JSON.parse(raw);
    // Fill any fields added after the state was first written.
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

/* ---------- IndexedDB (engine-level; photos and audio packs use it from Phase 2) ---------- */

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
// Exposed for Phase 2 packs and for poking around in the console.
window.ptrailDb = { put: idbPut, get: idbGet };

/* ---------- Badges ---------- */

function badgeById(id) {
  for (var i = 0; i < BADGES.length; i++) if (BADGES[i].id === id) return BADGES[i];
  return null;
}

function awardBadge(id, by) {
  if (state.badges[id]) return null;
  state.badges[id] = { when: new Date().toISOString(), by: by || 'family' };
  return badgeById(id);
}

// Checks that depend on running totals; returns newly earned badges.
function checkTotalBadges() {
  var earned = [];
  var b;
  if (state.scores.heroes >= 100) { b = awardBadge('trident', 'heroes'); if (b) earned.push(b); }
  if (state.parentLosses >= 3) { b = awardBadge('titan', 'heroes'); if (b) earned.push(b); }
  return earned;
}

/* ---------- Showdown engine ---------- */

var live = null; // in-flight showdown, mirrored to localStorage so a closed app resumes

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

// Build the question order: rotate leo -> adam -> parents so turns alternate fairly.
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

function startShowdown(packId, perTier) {
  var pack = packById(packId);
  live = {
    packId: pack.id,
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

  var result = { heroes: live.heroes, parents: live.parents, earned: earned, heroesWin: heroesWin, tie: live.heroes === live.parents };
  live = null;
  saveLive();
  return result;
}

/* ---------- Quick trivia (field practice, no scoring) ---------- */

var quick = { tier: 'leo', qIndex: -1, revealed: false, recent: [] };

function nextQuick() {
  var pack = PACKS[0];
  var pool = [];
  pack.questions.forEach(function (q, idx) {
    if (q.tier === quick.tier && quick.recent.indexOf(idx) === -1) pool.push(idx);
  });
  if (pool.length === 0) { quick.recent = []; return nextQuick(); }
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

function screenHome() {
  var actsHtml = ACTS.map(function (act, i) {
    var unlocked = i === 0; // Act I opens with the Corfu pack; II and III unlock on the trail (Phases 2-3)
    return '<div class="card act ' + (unlocked ? 'unlocked' : 'locked') + '">' +
      '<span class="node">' + (unlocked ? act.node : '\u{1F512}') + '</span>' +
      '<div class="place">' + esc(act.place) + '</div>' +
      '<h2>' + esc(act.title) + '</h2>' +
      '<p>' + esc(act.blurb) + '</p>' +
      '</div>';
  }).join('');
  return '<h1>The Poseidon Trail</h1>' +
    '<div class="sub">Corfu to Sounio. The sea god is watching.</div>' +
    '<button id="tonightBtn">' + (live ? 'Continue the Showdown' : "Tonight's Showdown") +
    '<small>' + (live ? 'A battle is still open' : 'Heroes vs Parents at Base Camp') + '</small></button>' +
    '<div class="trail">' + actsHtml + '</div>' +
    '<div class="foot">Phase 1 engine · the Corfu pack sails in next</div>';
}

function screenBadges() {
  var html = BADGES.map(function (b) {
    var e = state.badges[b.id];
    var cls = b.sealed ? 'locked' : (e ? 'earned' : 'locked');
    return '<div class="badge ' + cls + '">' +
      '<span class="art">' + b.art + '</span>' +
      '<span class="name">' + esc(b.name) + '</span>' +
      '<span class="how">' + esc(e && !b.sealed ? 'Earned!' : b.how) + '</span>' +
      '</div>';
  }).join('');
  return '<h1>Badges</h1><div class="sub">The trip journal builds itself. Collect them all.</div>' +
    '<div class="badge-grid">' + html + '</div>';
}

function screenTrivia() {
  if (quick.qIndex === -1) nextQuick();
  var q = PACKS[0].questions[quick.qIndex];
  return '<h1>Quick Trivia</h1><div class="sub">Field practice. No points, just glory.</div>' +
    '<div class="card">' +
    '<label for="tierSel">Who is answering?</label>' +
    '<select id="tierSel">' +
    ['leo', 'adam', 'parents'].map(function (t) {
      return '<option value="' + t + '"' + (quick.tier === t ? ' selected' : '') + '>' + TIER_LABEL[t] + '</option>';
    }).join('') +
    '</select></div>' +
    '<div class="card qcard">' +
    '<span class="tierchip tier-' + q.tier + '">' + TIER_LABEL[q.tier] + '</span>' +
    '<div class="qtext">' + esc(q.q) + '</div>' +
    (quick.revealed ? '<div class="atext">' + esc(q.a) + '</div>' : '') +
    '</div>' +
    (quick.revealed
      ? '<button id="quickNext" class="gold">Next question</button>'
      : '<button id="quickReveal">Reveal the answer</button>');
}

function screenScores() {
  var hist = state.history.length
    ? state.history.slice(0, 12).map(function (h) {
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
    '<input id="ptsNote" type="text" placeholder="e.g. Mouse Island quest" maxlength="40">' +
    '<button id="ptsAdd" class="gold">Add points</button>' +
    '<div class="foot" id="ptsMsg"></div></div>' +
    '<div class="card"><h2>History</h2><div class="history">' + hist + '</div></div>' +
    '<div class="card"><h2>Base Camp</h2>' +
    '<div class="rules" id="storageInfo">Checking device storage…</div>' +
    '<button id="resetBtn" class="danger" style="margin-top:12px">Reset all game data</button></div>';
}

function screenShowdown() {
  if (!live) {
    return '<h1>Showdown</h1><div class="sub">Heroes vs Parents. Loud and theatrical.</div>' +
      '<div class="card"><h2>The rules</h2><div class="rules">' + esc(RULES_TEXT) + '</div></div>' +
      '<div class="card"><h2>Tonight’s pack</h2>' +
      '<div class="rules">' + esc(PACKS[0].title) + ' — ' + esc(PACKS[0].note) + '</div></div>' +
      '<button id="sdQuick">Quick battle · 6 questions</button>' +
      '<button id="sdFull" class="gold">Full night · all ' + PACKS[0].questions.length + ' questions</button>';
  }
  if (live.pos >= live.order.length) {
    // Battle over: ceremony.
    var result = finishShowdown();
    var trophy = result.tie ? '⚖️' : (result.heroesWin ? '\u{1F3C6}' : '\u{1F3DB}');
    var headline = result.tie ? 'A draw. Poseidon demands a rematch.' :
      (result.heroesWin ? 'The Heroes take the night!' : 'The Parents hold the line!');
    var badgesHtml = result.earned.map(function (b) {
      return '<span class="newbadge"><span class="art">' + b.art + '</span><span class="name">' + esc(b.name) + '</span></span>';
    }).join('');
    return '<div class="ceremony">' +
      '<div class="trophy">' + trophy + '</div>' +
      '<h1>' + esc(headline) + '</h1>' +
      '<div class="final">Heroes ' + result.heroes + ' — ' + result.parents + ' Parents</div>' +
      (badgesHtml ? '<h2>New badges</h2><div>' + badgesHtml + '</div>' : '') +
      '<button id="sdDone" class="gold" style="margin-top:24px">Back to the trail</button>' +
      '</div>';
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
  return SCREENS[h] ? h : 'home';
}

function render() {
  var r = route();
  $('#screen').innerHTML = SCREENS[r]();
  document.querySelectorAll('#tabbar a').forEach(function (a) {
    a.classList.toggle('active', a.dataset.tab === r);
  });
  window.scrollTo(0, 0);
  bind(r);
  updateStrip();
}

function bind(r) {
  if (r === 'home') {
    $('#tonightBtn').onclick = function () { location.hash = '#showdown'; };
  }
  if (r === 'trivia') {
    $('#tierSel').onchange = function (e) { quick.tier = e.target.value; quick.recent = []; nextQuick(); render(); };
    var rev = $('#quickReveal'); if (rev) rev.onclick = function () { quick.revealed = true; render(); };
    var nxt = $('#quickNext'); if (nxt) nxt.onclick = function () { nextQuick(); render(); };
  }
  if (r === 'scores') {
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
      if (confirm('Erase ALL scores, badges and history on this device? This cannot be undone.')) {
        localStorage.removeItem(STATE_KEY);
        localStorage.removeItem(LIVE_KEY);
        state = loadState(); live = null;
        render();
      }
    };
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(function (e) {
        var el = $('#storageInfo');
        if (el) el.textContent = 'Device storage: ' + Math.round((e.usage || 0) / 1048576) + ' MB used of ' +
          Math.round((e.quota || 0) / 1048576) + ' MB available to the app.';
      });
    } else {
      $('#storageInfo').textContent = 'Storage estimate not available on this device.';
    }
  }
  if (r === 'showdown') {
    var el;
    el = $('#sdQuick'); if (el) el.onclick = function () { startShowdown(PACKS[0].id, 2); };
    el = $('#sdFull'); if (el) el.onclick = function () { startShowdown(PACKS[0].id); };
    el = $('#sdReveal'); if (el) el.onclick = function () { live.revealed = true; saveLive(); render(); };
    el = $('#sdGot'); if (el) el.onclick = function () { answerShowdown(true); };
    el = $('#sdMiss'); if (el) el.onclick = function () { answerShowdown(false); };
    el = $('#sdDone'); if (el) el.onclick = function () { location.hash = '#home'; };
    el = $('#sdAbandon'); if (el) el.onclick = function () {
      if (confirm('Abandon this Showdown? Tonight’s points so far will be lost.')) {
        live = null; saveLive(); render();
      }
    };
  }
}

window.addEventListener('hashchange', render);

// Ask iOS to keep our storage (best effort; home-screen install is the real protection).
if (navigator.storage && navigator.storage.persist) navigator.storage.persist();

render();

})();
