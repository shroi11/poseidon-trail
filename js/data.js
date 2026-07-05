// The Poseidon Trail — content data (Phase 1: engine + practice pack).
// Trip content (Corfu pack, road pack) arrives in Phases 2-3 using these same shapes.

const ACTS = [
  {
    id: 'act1',
    title: 'Act I: The Grudge Begins',
    place: 'Corfu',
    node: '\u{1F531}',
    blurb: "Poseidon turned a ship to stone in the bay of Scheria. Eight god-nights, beach quests, and Mouse Island await. The Corfu pack arrives before the flight."
  },
  {
    id: 'act2',
    title: "Act II: Theseus's Road",
    place: 'Athens & the Road',
    node: '\u{1F6E1}',
    blurb: "The Acropolis, the villains of the coast road, a lion at Nemea, and the walls of Mycenae. The road pack unlocks when Act I is done."
  },
  {
    id: 'act3',
    title: 'Act III: The Temple of the Sea God',
    place: 'Sounio',
    node: '\u{26A1}',
    blurb: "The trail ends where Poseidon waits: his temple on the cliff at Sounio, at sunset, for the final ceremony."
  }
];

const BADGES = [
  { id: 'spark',   art: '⚡',      name: 'First Spark',     how: 'Play your first Showdown' },
  { id: 'nike',    art: '\u{1F3C6}',   name: 'Winged Victory',  how: 'Heroes win a Showdown night' },
  { id: 'streak3', art: '\u{1F525}',   name: 'Hot Streak',      how: '3 right answers in a row in one Showdown' },
  { id: 'owl',     art: '\u{1F989}',   name: 'Owl Eyes',        how: 'A perfect Showdown: your team misses nothing' },
  { id: 'trident', art: '\u{1F531}',   name: 'Trident Bearer',  how: 'Heroes reach 100 total points' },
  { id: 'titan',   art: '\u{1F3DB}',   name: 'Titan Slayer',    how: 'Parents lose 3 Showdowns' },
  // Sealed slots: god badges ship with the Corfu pack (Phase 2).
  { id: 'sealed1', art: '\u{1F512}', name: 'Sealed', how: 'Opens in Corfu', sealed: true },
  { id: 'sealed2', art: '\u{1F512}', name: 'Sealed', how: 'Opens in Corfu', sealed: true },
  { id: 'sealed3', art: '\u{1F512}', name: 'Sealed', how: 'Opens on the road', sealed: true }
];

// Question packs. tier: 'leo' (6yo) | 'adam' (8yo) | 'parents'.
// Leo and Adam questions score for the Heroes; parents questions for the Parents.
const PACKS = [
  {
    id: 'warmup',
    title: 'Mount Olympus Warm-Up',
    note: 'Practice pack for game night at home. The real trip questions stay sealed until Greece.',
    questions: [
      { tier: 'leo', q: 'What creature is half man, half horse?', a: 'A centaur' },
      { tier: 'leo', q: 'Medusa has something very strange instead of hair. What?', a: 'Snakes!' },
      { tier: 'leo', q: 'Pegasus is a horse with something extra. What?', a: 'Wings' },
      { tier: 'leo', q: 'What did the Greeks hide inside to sneak into the city of Troy?', a: 'A giant wooden horse' },
      { tier: 'leo', q: 'Who is stronger: a hero or a god?', a: 'A god (but heroes try anyway)' },
      { tier: 'adam', q: 'Who flew too close to the sun on wings of wax and feathers?', a: 'Icarus' },
      { tier: 'adam', q: 'What monster lives at the center of the Labyrinth?', a: 'The Minotaur' },
      { tier: 'adam', q: 'Which Titan has to hold up the sky forever?', a: 'Atlas' },
      { tier: 'adam', q: 'King Midas had a golden problem. What was it?', a: 'Everything he touched turned to gold, even his food' },
      { tier: 'adam', q: 'The greatest Greek warrior had one weak spot. Name him and the spot.', a: 'Achilles, his heel' },
      { tier: 'adam', q: 'Who almost walked his wife out of the Underworld with his music?', a: 'Orpheus (he looked back too soon)' },
      { tier: 'parents', q: 'Which Titan gave fire to humans and paid for it chained to a rock?', a: 'Prometheus' },
      { tier: 'parents', q: 'Name the three-headed dog guarding the Underworld.', a: 'Cerberus' },
      { tier: 'parents', q: 'The nine goddesses of the arts and sciences are called what?', a: 'The Muses' },
      { tier: 'parents', q: 'The hero of the twelve labors: give his Greek name, not the Roman one.', a: 'Heracles (Hercules is Roman)' }
    ]
  }
];

const TIER_LABEL = { leo: 'Leo', adam: 'Adam', parents: 'Parents' };
const TIER_TEAM = { leo: 'heroes', adam: 'heroes', parents: 'parents' };
const POINTS_PER_CORRECT = 10;

const RULES_TEXT = [
  'Leo and Adam questions score for the Heroes. Parents questions score for the Parents.',
  'A right answer is worth ' + POINTS_PER_CORRECT + ' points. A miss is 0. No steals.',
  'The reader reveals the answer and the table decides: got it or missed. Be fair, Poseidon is watching.',
  'Quest points from the day are added on the Scores screen before the Showdown starts.'
].join(' ');
