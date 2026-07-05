// The Poseidon Trail — Acts II & III: the road trip pack (Phase 3).
// Theseus's Road car stories, seven site quests, the Sounio finale,
// Reverse Run retelling prompts. Questions mirror poseidon-trail-questions-roadtrip.md v1.

(function () {
'use strict';

// Car stories: played on the drive, narrated. The road showdown pack unlocks their questions.
var ROAD_STORIES = [
  {
    id: 'roadstory1', num: 1, title: 'The Rock of Troezen',
    symbol: '\u{1F5FF}',
    audio: 'audio/road/story1.mp3',
    story: "Heroes, this road you are driving is one of the oldest roads in the world, and it belongs to one hero above all: Theseus. His story starts with a rock.\n\nLong before he was famous, the king of Athens, Aegeus, visited a little town called Troezen, across the water from where you are now. When he left, he hid his royal sword and his sandals under an enormous boulder, and told the princess Aethra: if our son can one day lift this rock, send him to me in Athens with what lies beneath it, and I will know him as my own.\n\nThe boy was Theseus. He grew up strong, and stubborn, and hungry for adventure. At sixteen he walked to the boulder, gripped it, and heaved it aside like a beach pebble. There they were: a bronze sword and a pair of worn sandals. His father's message, waiting all those years.\n\nNow, here was the choice. To reach Athens, Theseus could sail: quick, calm, safe. Or he could walk the coast road: the road every traveler feared, the road guarded by bandits and monsters, the road nobody took twice. His grandfather begged him to take the boat.\n\nTheseus looked at the sea. Then he looked at the road. And he thought: what kind of hero ARRIVES BY FERRY?\n\nHe tied on his father's sandals, strapped on the sword, and started walking. Toward the villains. On purpose.\n\nAnd the first ones were already waiting, just up the coast, where the pine trees grow. That story is next. Keep your eyes on the trees.",
    questions: []
  },
  {
    id: 'roadstory2', num: 2, title: 'The Villains of the Coast Road',
    symbol: '\u{1F332}',
    audio: 'audio/road/story2.mp3',
    story: "Heroes, look out the window. Somewhere along this exact coast, three of the nastiest villains in all of Greece ran their traps. And one walking teenager shut them all down in a single trip.\n\nTheseus had one rule, and it made him famous: whatever a villain did to travelers, Theseus did right back to the villain. Remember the rule. It comes up three times.\n\nFirst came Sinis, the pine-bender. He was so strong he could bend two pine trees to the ground. He would tie a traveler between them and... let go. Poing. Theseus asked Sinis to show him how the trick worked, grabbed him, tied HIM between the pines, and let go. The rule.\n\nFarther on, on the high cliffs where the road hangs over the sea, waited Sciron. He made every traveler kneel down and wash his feet, and while they scrubbed, he kicked them off the cliff, straight down to his pet: a giant hungry turtle. Theseus knelt, took the wash bucket, and then threw Sciron over the edge instead. The turtle did not complain. The rule.\n\nAnd last, nearest to Athens, the strangest one of all: Procrustes, the innkeeper. Such a friendly man! He offered every traveler a bed for the night, and promised it would fit them EXACTLY. If you were too short, he stretched you until you fit. Too tall? He chopped off whatever hung over the edge. Horrible! Until Theseus tucked Procrustes into his own famous bed. The rule. Three villains, three traps, all closed forever.\n\nBy the time Theseus reached the gates of Athens, the whole city already knew his name. But in the palace, a bigger surprise was waiting: a father who had no idea his son was coming. That story is next.",
    questions: []
  },
  {
    id: 'roadstory3', num: 3, title: 'Black Sails',
    symbol: '⛵',
    audio: 'audio/road/story3.mp3',
    story: "Heroes, Theseus walked into Athens a stranger. He walks out of this story a legend. But it costs him more than he knows.\n\nAt the palace, King Aegeus did not recognize the young man at his table. Then Theseus drew his sword to cut the meat, and the king froze. His own bronze sword, from under the rock at Troezen. My son! The lost prince had come home, and Athens exploded into celebration.\n\nBut Athens was a city with a terrible secret. Every few years, a ship sailed to the island of Crete carrying young Athenians as tribute: food for the Minotaur, a monster with the body of a man and the head of a bull, locked in an endless maze called the Labyrinth. This year's ship was about to sail. Theseus stepped forward: put me on it.\n\nIn Crete, a clever princess named Ariadne handed him a ball of string. Unroll it behind you, she whispered, and you will find your way back out. Theseus walked into the dark maze, string unrolling, deeper and deeper, until he heard the breathing. He fought the Minotaur in the blackness with his bare hands, and won, and followed the string back to daylight.\n\nBefore he had sailed, his father made him one promise. The ship's sails were black, for mourning. If you live, Aegeus said, change them to WHITE, so I will know from far away that my son is coming home alive. I will be watching from the cliff.\n\nTheseus beat the maze. He beat the monster. He sailed home in triumph. And he forgot the sails.\n\nBlack sails, coming over the horizon, and an old king watching from a high white cliff. What happened next, Heroes, you will learn at the very end of the trail, standing on that exact cliff. It is called Sounio. Poseidon is waiting there too.",
    questions: [
      { tier: 'leo', q: 'Theseus walked all the way to Athens to meet his father. Who was his father?', a: 'King Aegeus' },
      { tier: 'leo', q: 'Procrustes had a bed for travelers. What was wrong with it?', a: 'He made everyone fit it exactly, stretching or chopping them' },
      { tier: 'adam', q: "What was Theseus's trick for beating every villain on the road?", a: 'He did to them what they did to travelers' },
      { tier: 'adam', q: 'Sinis the pine-bender killed travelers how?', a: 'He bent pine trees and flung people from them' },
      { tier: 'adam', q: 'Sciron made travelers wash his feet, then what?', a: 'Kicked them off the cliff to his giant turtle; Theseus threw him off instead' },
      { tier: 'parents', q: 'In which town did Theseus grow up before walking to Athens?', a: 'Troezen' }
    ]
  }
];

// Site quests, itinerary order. Same shape as the Corfu quests (act: 2).
var ROAD_SITES = [
  {
    id: 'site-athens', act: 2, title: 'The Contest Rock', place: 'Athens · the Acropolis',
    symbol: '\u{1F3DB}', badgeId: null, badgeName: null, points: 30,
    intro: "This is the rocky hill where Athena and Poseidon held their contest. You heard the story on Night 3. Now stand on it.",
    missions: [
      { id: 'm1', text: "We're here: on top of the Acropolis.", type: 'here' },
      { id: 'm2', text: 'Find the Erechtheion, the temple with the porch of stone women (the Caryatids). Legend says Poseidon’s trident struck right there. Scout mission: count the stone women.', type: 'check' },
      { id: 'm3', text: 'Quest photo: the Parthenon, with both Heroes in front. Count the columns across the front while you’re at it.', type: 'photo' },
      { id: 'm4', text: 'Owl hunt: spot 3 owls today (souvenirs, coins, carvings). Athena is watching her city.', type: 'check' }
    ],
    questions: [
      { tier: 'leo', q: 'Which goddess is Athens named after?', a: 'Athena' },
      { tier: 'leo', q: 'What kind of tree did Athena give the city?', a: 'An olive tree' },
      { tier: 'leo', q: 'Which bird were you hunting on souvenirs today?', a: 'The owl' },
      { tier: 'adam', q: 'Where did Poseidon strike his trident in the contest, and what came out?', a: 'The rock at the Erechtheion, a saltwater spring' },
      { tier: 'adam', q: 'The porch of the Erechtheion is held up by statues of women. What are they called?', a: 'Caryatids' },
      { tier: 'adam', q: 'How many columns across the front of the Parthenon?', a: 'Eight' },
      { tier: 'parents', q: 'What had the Parthenon been converted into when it exploded in 1687?', a: 'An Ottoman gunpowder store, hit during the Venetian siege' }
    ]
  },
  {
    id: 'site-corinth', act: 2, title: "The Giant's Cut", place: 'Corinth Canal',
    symbol: '\u{1F309}', badgeId: null, badgeName: null, points: 20,
    intro: 'A cut through solid rock, ships far below. Corinth: home of Sisyphus and his boulder, and of the flying horse Pegasus.',
    missions: [
      { id: 'm1', text: "We're here: standing on the bridge over the canal.", type: 'here' },
      { id: 'm2', text: 'Quest photo: straight down the canal from the bridge. Hold the phone tight.', type: 'photo' },
      { id: 'm3', text: 'Retell it: one Hero tells the story of Sisyphus and his boulder. Why does the boulder always roll back down? Parents judge.', type: 'check' }
    ],
    questions: [
      { tier: 'leo', q: 'What did we stand over on the bridge?', a: 'A giant cut in the rock with the sea at the bottom' },
      { tier: 'adam', q: 'Which king of Corinth was punished to push a boulder uphill forever?', a: 'Sisyphus' },
      { tier: 'adam', q: 'Which flying horse was tamed at Corinth, and by whom?', a: 'Pegasus, by Bellerophon' },
      { tier: 'parents', q: 'In which year did the modern canal open?', a: '1893' }
    ]
  },
  {
    id: 'site-nemea', act: 2, title: "The Lion's Stadium", place: 'Nemea',
    symbol: '\u{1F981}', badgeId: 'hero-hercules', badgeName: 'Hercules', points: 30,
    intro: "Here Hercules fought his first labor: a lion no weapon could cut. And here athletes raced for a thousand years. Today, you race.",
    missions: [
      { id: 'm1', text: "We're here: at ancient Nemea.", type: 'here' },
      { id: 'm2', text: 'Retell it: why did Hercules have to strangle the Nemean Lion with his bare hands? What did he wear afterwards?', type: 'check' },
      { id: 'm3', text: 'THE RACE: everyone lines up on the ancient stadium track and runs it, like athletes did 2,300 years ago. Log the winner with bonus points on the Scores screen.', type: 'check' },
      { id: 'm4', text: 'Quest photo: the winner, arms up at the finish line.', type: 'photo' }
    ],
    questions: [
      { tier: 'leo', q: 'Hercules fought a giant animal here. Which one?', a: 'A lion' },
      { tier: 'leo', q: 'What did Hercules wear after he won?', a: "The lion's skin" },
      { tier: 'adam', q: "Why couldn't arrows or swords hurt the Nemean Lion?", a: 'No weapon could pierce its skin; Hercules strangled it with his bare hands' },
      { tier: 'adam', q: 'How many labors did Hercules have to complete in total?', a: 'Twelve' },
      { tier: 'adam', q: 'Who won the race on the ancient stadium track today?', a: "Whoever did — it's logged in the app's history!" },
      { tier: 'parents', q: 'The Nemean Games were one of four great Greek games. Name the other three.', a: 'Olympic, Pythian, Isthmian' }
    ]
  },
  {
    id: 'site-mycenae', act: 2, title: 'The Lion Gate', place: 'Mycenae',
    symbol: '\u{1F3F0}', badgeId: 'hero-perseus', badgeName: 'Perseus', points: 30,
    intro: 'A fortress of giant stones, founded by Perseus, who beat Medusa without ever looking at her. Kings of the Trojan War rode out from this gate.',
    missions: [
      { id: 'm1', text: "We're here: at the walls of Mycenae.", type: 'here' },
      { id: 'm2', text: 'Quest photo: both Heroes under the Lion Gate, the oldest monumental gate in Europe.', type: 'photo' },
      { id: 'm3', text: 'Retell it: how did Perseus beat Medusa without looking at her? Parents judge.', type: 'check' },
      { id: 'm4', text: 'Scout mission: find the golden mask (museum). One Hero reads the label, the other reports whose face people THOUGHT it was.', type: 'check' }
    ],
    questions: [
      { tier: 'leo', q: 'Which two animals stand above the famous gate?', a: 'Lions' },
      { tier: 'leo', q: 'What is the famous mask made of?', a: 'Gold' },
      { tier: 'adam', q: 'Which hero founded Mycenae?', a: 'Perseus' },
      { tier: 'adam', q: "Which monster did Perseus defeat, and why couldn't he look at her?", a: 'Medusa; her gaze turned people to stone, he used his shield as a mirror' },
      { tier: 'adam', q: 'Which king sailed from here to the Trojan War?', a: 'Agamemnon' },
      { tier: 'parents', q: 'Who excavated the gold mask in 1876 and telegraphed "I have gazed upon the face of Agamemnon"?', a: 'Heinrich Schliemann' }
    ]
  },
  {
    id: 'site-tiryns', act: 2, title: 'The Walls of Giants', place: 'Tiryns',
    symbol: '\u{1F9F1}', badgeId: null, badgeName: null, points: 20,
    intro: "Walls so huge the Greeks swore only the one-eyed Cyclopes could have built them. Hercules lived here between labors.",
    missions: [
      { id: 'm1', text: "We're here: at mighty-walled Tiryns.", type: 'here' },
      { id: 'm2', text: 'Touch a wall stone bigger than Leo. Quest photo for scale: smallest Hero next to biggest stone.', type: 'photo' },
      { id: 'm3', text: 'Debate at the wall: could a person really lift that stone? Then who built these walls? Vote.', type: 'check' }
    ],
    questions: [
      { tier: 'leo', q: 'The walls are so huge that people said giants built them. Which giants?', a: 'The Cyclopes, the one-eyed ones' },
      { tier: 'adam', q: 'Which hero lived at Tiryns while serving King Eurystheus and doing the twelve labors?', a: 'Hercules' },
      { tier: 'parents', q: 'What single-word epithet did Homer give Tiryns?', a: 'Mighty-walled' }
    ]
  },
  {
    id: 'site-epidaurus', act: 2, title: 'The Whispering Theater', place: 'Epidaurus',
    symbol: '\u{1F3AD}', badgeId: 'hero-asclepius', badgeName: 'Asclepius', points: 30,
    intro: "The theater of the healing god Asclepius, where 14,000 people could hear a whisper from the stage. Test it yourselves.",
    missions: [
      { id: 'm1', text: "We're here: inside the ancient theater.", type: 'here' },
      { id: 'm2', text: 'THE CLAP TEST: Heroes climb to the top row. A parent stands on the center stone of the stage and claps once. Scouts report: did you hear it clearly?', type: 'check' },
      { id: 'm3', text: 'Swap: one Hero stands center stage and says the family password in a NORMAL voice. Top row confirms.', type: 'check' },
      { id: 'm4', text: 'Quest photo: the whole theater from the top row, Heroes in front.', type: 'photo' }
    ],
    questions: [
      { tier: 'leo', q: 'You clapped on a special spot and everyone heard it, even at the top. What is this place?', a: 'An ancient theater' },
      { tier: 'adam', q: 'Asclepius was the god of what?', a: 'Healing and medicine' },
      { tier: 'adam', q: "Which animal wraps around Asclepius's staff, still on pharmacy signs today?", a: 'A snake' },
      { tier: 'parents', q: 'Roughly how many people fit in the theater?', a: 'About 14,000' }
    ]
  },
  {
    id: 'site-nafplio', act: 2, title: "Poseidon's Son's Town", place: 'Nafplio',
    symbol: '⚓', badgeId: null, badgeName: null, points: 30,
    intro: "Your home base is named after Nauplius, a son of Poseidon. The sea god's family is everywhere on this trail. Hera's city Argos is 15 minutes away — remember Night 6.",
    missions: [
      { id: 'm1', text: "We're here: Nafplio.", type: 'here' },
      { id: 'm2', text: 'THE 999 STEPS: climb to the Palamidi fortress. Count the steps out loud in teams — do you really get 999?', type: 'check' },
      { id: 'm3', text: 'Quest photo: the Bourtzi, the tiny castle-island in the harbor.', type: 'photo' },
      { id: 'm4', text: 'Ice cream council: over gelato, each Hero names their favorite god of the trip so far, and why.', type: 'check' }
    ],
    questions: [
      { tier: 'leo', q: 'About how many steps climb up to the Palamidi fortress?', a: '999' },
      { tier: 'leo', q: 'What sits on the tiny island in the harbor?', a: 'A little castle, the Bourtzi' },
      { tier: 'adam', q: 'Nafplio is named after the hero Nauplius. Who was his father?', a: 'Poseidon' },
      { tier: 'parents', q: 'What was Nafplio in the 1820s and 30s?', a: 'The first capital of modern Greece' }
    ]
  }
];

// Act III: the Sounio finale.
var FINALE = {
  id: 'finale', title: 'The Temple at the End of the World', place: 'Cape Sounio',
  symbol: '\u{1F531}',
  audio: 'audio/road/finale.mp3',
  story: "Heroes, this is it. The white cliff. The temple of Poseidon. The end of the trail. And you already know more about this place than most people who ever stand here.\n\nThis is the cliff where King Aegeus stood, day after day, watching the horizon for his son's ship. You heard it in the car: Theseus had promised to change the black sails to white if he lived. He beat the Labyrinth. He beat the Minotaur. And he forgot.\n\nAegeus saw black sails rise over the horizon and his heart broke in half. He believed his son was gone. And the old king stepped off this cliff, into the sea far below. That sea has carried his name ever since: the Aegean. Look at it. You are looking at a king's name written in water.\n\nAnd because this cliff had seen so much sorrow, the Greeks built a temple on it for the god who rules everything you can see from here: Poseidon. Earth-Shaker. Lord of the waves. The god whose grudge started your whole adventure back in a bay in Corfu, where a stone ship still floats.\n\nSo stand at the edge, Heroes, and let the sea god take a good look at you. You found his stone ship. You learned his brothers and his rivals, his quarrels and his contests. You walked the road of Theseus, raced at Nemea, stood in the gate of Perseus. Twelve gods know your names now. That is not nothing. That is the whole pantheon.\n\nPoseidon does not forget, remember? But tonight, watching the sunset from his temple with the whole family of gods collected... maybe, just maybe, the Earth-Shaker smiles. Even Odysseus got home in the end.\n\nOne final Showdown, Heroes. Right here. Make the sea god proud.",
  points: 50,
  missions: [
    { id: 'm1', text: "We're here: the temple of Poseidon at Sounio.", type: 'here' },
    { id: 'm2', text: 'Stand at the rail and retell Black Sails, right where it happened: why is this sea called the Aegean?', type: 'check' },
    { id: 'm3', text: 'THE FINAL QUEST PHOTO: the whole family, the temple, the sunset.', type: 'photo' }
  ],
  questions: [
    { tier: 'leo', q: 'Whose temple stands on the cliff?', a: "Poseidon's" },
    { tier: 'leo', q: 'What color were the sails Theseus forgot to change?', a: 'He left the black ones up instead of white' },
    { tier: 'adam', q: 'Why did King Aegeus jump from this cliff into the sea?', a: 'He saw black sails and believed Theseus was dead' },
    { tier: 'adam', q: 'What monster had Theseus just defeated in Crete before sailing home?', a: 'The Minotaur' },
    { tier: 'adam', q: 'What is the sea below this temple called, and why?', a: 'The Aegean, after King Aegeus' },
    { tier: 'parents', q: 'Which famous English poet carved his name into the temple?', a: 'Lord Byron' }
  ]
};

// Reverse Run: Jul 23 drive, in drive order from Nafplio. Retelling scores double.
var REVERSE_RUN = [
  { id: 'rr-sisyphus',   name: 'SISYPHUS',   symbol: '\u{1FAA8}', where: 'At the Corinth Canal', hint: 'The king, the boulder, the hill.' },
  { id: 'rr-sinis',      name: 'SINIS',      symbol: '\u{1F332}', where: 'Past the Isthmus, watch the pines', hint: 'The pine-bender.' },
  { id: 'rr-sciron',     name: 'SCIRON',     symbol: '\u{1F422}', where: 'On the cliff road', hint: 'Feet, cliff, turtle.' },
  { id: 'rr-procrustes', name: 'PROCRUSTES', symbol: '\u{1F6CF}', where: 'Nearing Athens', hint: 'The bed that fits everyone.' },
  { id: 'rr-aegeus',     name: 'KING AEGEUS', symbol: '⛵', where: 'On the road to Sounio', hint: 'What is he doing on that cliff right now?' }
];

// Register question packs.
PACKS.push({ id: 'road-theseus', title: "Theseus's Road", note: 'Car stories trivia — hear all three chapters first', questions: ROAD_STORIES[2].questions });
ROAD_SITES.forEach(function (s) {
  PACKS.push({ id: s.id, title: s.title, note: 'Quest trivia: ' + s.place, questions: s.questions });
});
PACKS.push({ id: 'finale-sounio', title: 'THE FINALE: Sounio', note: 'The last battle, at the temple', questions: FINALE.questions });

// Road sites are quests in the engine (same registry as the Corfu quests).
if (window.CORFU) ROAD_SITES.forEach(function (s) { CORFU.quests.push(s); });

window.ROAD = { stories: ROAD_STORIES, sites: ROAD_SITES, finale: FINALE, reverse: REVERSE_RUN };
})();
