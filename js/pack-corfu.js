// The Poseidon Trail — Act I: the Corfu pack (Phase 2).
// Eight god-nights, three quests, god badges, guest-badge rules.
// Questions mirror poseidon-trail-questions-corfu.md v1 (Joanna's review copy).

(function () {
'use strict';

var NIGHTS = [
  {
    id: 'night1', num: 1, god: 'Poseidon', title: 'The Stone Ship',
    symbol: '\u{1F531}', badgeId: 'god1', badgeName: 'Earth-Shaker',
    audio: 'audio/corfu/night1.mp3',
    story: "Heroes, come close. Tomorrow, look out at the water. There is a small green island in the bay, and it is not really an island. It is a ship. And this is the story of how it turned to stone.\n\nLong ago, a sailor named Odysseus was trying to get home from a war. On the way, he got trapped in the cave of a one-eyed giant, a Cyclops named Polyphemus, who planned to eat every sailor for dinner. Odysseus tricked the giant, blinded his one huge eye, and escaped. Clever! But here was the problem: that Cyclops was the son of Poseidon, god of the sea.\n\nPoseidon does not forget. Poseidon does not forgive. He is called the Earth-Shaker, and when he is angry the waves stand up like walls and the ground itself trembles. For ten whole years he smashed Odysseus's ships and blew him to the wrong ends of the sea.\n\nAt last, Odysseus washed up here. Yes, HERE, on this island, which in those days was called Scheria. The kind people of this island, the Phaeacians, gave him a fast ship and sailed him home at night while he slept.\n\nPoseidon was furious. As the ship sailed back into this very bay, he rose out of the deep, touched it once with his trident, and the whole ship turned to grey stone, right where it floated. It is still there. The locals call it Mouse Island. You will find it, and you will see it with your own eyes.\n\nBut listen: the grudge of the sea god is not finished. This whole trail, from this island all the way to his temple on a cliff at Sounio, belongs to him. Eight nights, eight gods, and at the end, you meet Poseidon himself. Tonight, we start with the Earth-Shaker's own questions. Be brave.",
    questions: [
      { tier: 'leo', q: 'Does Poseidon rule the sky or the sea?', a: 'The sea' },
      { tier: 'leo', q: 'How many points does his trident have?', a: 'Three' },
      { tier: 'leo', q: "Poseidon's favorite animal gallops on land. Which one?", a: 'The horse' },
      { tier: 'adam', q: 'Zeus, Poseidon and Hades split the world. Who got what?', a: 'Zeus the sky, Poseidon the sea, Hades the underworld' },
      { tier: 'adam', q: 'Why is Poseidon furious with Odysseus?', a: 'Odysseus blinded his son, the Cyclops Polyphemus' },
      { tier: 'adam', q: 'What happens to the sea when Poseidon gets angry?', a: 'Storms and earthquakes; he is called Earth-Shaker' },
      { tier: 'parents', q: "Poseidon's Roman name?", a: 'Neptune' }
    ]
  },
  {
    id: 'night2', num: 2, god: 'Zeus', title: 'The Three Brothers',
    symbol: '⚡', badgeId: 'god2', badgeName: 'Thunder King',
    audio: 'audio/corfu/night2.mp3',
    story: "Heroes, you met the sea god. Tonight, meet his big brother. The boss. The king of every god there is: Zeus.\n\nLong, long ago, before there were any kings on Olympus, three brothers won a great war against the Titans, the old giant gods. When the war ended, the brothers had a whole world to share, so they drew lots, like picking straws. Zeus drew the sky. Poseidon drew the sea. And Hades, the quiet one, drew the underworld, the land under our feet where shadows live. Remember that, because splitting the world is how all our stories begin.\n\nZeus rules from Mount Olympus, the highest mountain in Greece, so high its top hides in clouds. From up there he watches everything: every ship, every road, every family on holiday. When he is pleased, the sky is blue like today. When he is angry... count the seconds between the flash and the boom. That is Zeus, throwing lightning bolts, which the one-eyed Cyclopes forged for him as a thank-you gift for freeing them.\n\nNext to his throne sits a giant eagle, his messenger bird, with feathers the color of storm clouds. Nothing on the trail escapes its eyes. So if you see a big bird circling tomorrow over the beach, wave. It might be reporting on you.\n\nNow, here is the thing about kings: even Zeus cannot simply cancel his brother's grudge. The sea belongs to Poseidon, fair and square, that was the deal. But Zeus can send you helpers along the trail. And tomorrow night, you will meet the cleverest helper of all: a goddess with grey eyes, born in the strangest way any god was ever born.\n\nTonight, the Thunder King asks his questions. Stand tall.",
    questions: [
      { tier: 'leo', q: 'Who is the boss of all the gods?', a: 'Zeus' },
      { tier: 'leo', q: 'What does Zeus throw when he is angry?', a: 'Lightning bolts' },
      { tier: 'adam', q: 'Where do the gods live?', a: 'Mount Olympus' },
      { tier: 'adam', q: "Which bird sits next to Zeus's throne?", a: 'The eagle' },
      { tier: 'adam', q: "Who made Zeus's lightning bolts for him?", a: 'The Cyclopes' },
      { tier: 'parents', q: "Zeus's Roman name?", a: 'Jupiter' }
    ]
  },
  {
    id: 'night3', num: 3, god: 'Athena', title: 'The Grey-Eyed Ally',
    symbol: '\u{1F989}', badgeId: 'god3', badgeName: 'Owl of Wisdom',
    audio: 'audio/corfu/night3.mp3',
    story: "Heroes, every quest needs an ally. Tonight you meet yours: Athena, goddess of wisdom, the cleverest mind on Olympus.\n\nEven her birth was clever. One day Zeus had a terrible headache, a headache like a thunderstorm inside his skull. The gods opened his head to see what was wrong, and out jumped Athena, fully grown, wearing armor, holding a spear, ready for anything. The whole mountain went silent. Then Zeus laughed like thunder, because a king could not wish for a better daughter.\n\nAthena never fights without thinking first. Her bird is the owl, because owls see what others miss, especially in the dark. Keep your eyes open on this trip: her owl hides on coins, on souvenirs, on old stones. Trail scouts spot them everywhere.\n\nNow, why does Athena matter to OUR story? Two reasons. First: she was Odysseus's protector. While Poseidon smashed his ships, Athena whispered clever ideas into his ear and got him home. She has beaten the sea god's grudge before, and she can help you do it too.\n\nSecond: she and Poseidon once fought over a city. Both gods wanted it. So they held a contest on a rocky hill: one gift each, and the people would choose. Poseidon struck the rock with his trident and out gushed a spring, splendid, except the water was salty like the sea, no good for drinking. Athena tapped the ground and up grew the first olive tree: food, oil, wood, and shade, all in one. The people chose Athena, and the city took her name. You will stand on that exact rock in Athens in a few days, at a place called the Acropolis.\n\nPoseidon has been sore about it ever since. Tonight, the grey-eyed goddess asks her questions. Think first, like she does.",
    questions: [
      { tier: 'leo', q: 'Which bird belongs to Athena?', a: 'The owl' },
      { tier: 'leo', q: "Athena's gift to Athens is something you can eat. What?", a: 'Olives' },
      { tier: 'adam', q: 'What gift won Athena the city of Athens?', a: 'The olive tree' },
      { tier: 'adam', q: 'What did Poseidon offer Athens, and why did it lose?', a: 'A spring of water, but it was salty' },
      { tier: 'adam', q: 'How was Athena born?', a: "Fully armed, out of Zeus's head" },
      { tier: 'parents', q: 'What does "Parthenon" mean?', a: 'Temple of the maiden, from parthenos' }
    ]
  },
  {
    id: 'night4', num: 4, god: 'Hermes', title: "The Trickster's Message",
    symbol: '\u{1FA76}', badgeId: 'god4', badgeName: 'Winged Sandals',
    audio: 'audio/corfu/night4.mp3',
    story: "Heroes, tonight's god is the fastest thing on two legs, and the funniest. Hermes: messenger of the gods, god of travelers, and champion mischief-maker of all time.\n\nHow much mischief? Listen to what he did on the very first day of his life. Baby Hermes, hours old, climbed out of his cradle, toddled out of the cave, and stole fifty of Apollo's sacred cows. And because he was clever even as a baby, he made the cows walk BACKWARDS, so their hoofprints pointed the wrong way, and he tied brooms of branches to his own tiny feet to sweep away his footprints. Then he snuck back into his cradle and pretended to sleep like an innocent little angel.\n\nApollo followed the mixed-up tracks, figured it out, and dragged the baby to Zeus. And Zeus? Zeus laughed so hard the mountain shook. Hermes gave Apollo a present to say sorry: a lyre, a little harp he had just invented out of a turtle shell. Apollo loved it so much he forgave everything. Remember that lyre. It comes back tomorrow night.\n\nHermes grew up to be the messenger of the gods, with winged sandals on his feet and a winged cap on his head. He is the god of everyone on a journey, which right now means he is YOUR god too. Every road you drive on this trip, every ferry, every airport: Hermes territory.\n\nAnd here is tonight's secret: the gods have noticed you following the trail. Hermes has flown ahead with a message about you, straight to the twins: the archer of the sun and the huntress of the moon. They are expecting you tomorrow night.\n\nBut first, the fast one asks his questions. Answer quickly.",
    questions: [
      { tier: 'leo', q: "What do Hermes's sandals have that yours don't?", a: 'Wings' },
      { tier: 'leo', q: 'Who is the fastest of all the gods?', a: 'Hermes' },
      { tier: 'adam', q: "What is Hermes's job on Olympus?", a: 'Messenger of the gods' },
      { tier: 'adam', q: 'What did baby Hermes steal on the day he was born?', a: "Apollo's cows" },
      { tier: 'parents', q: "Hermes's Roman name?", a: 'Mercury' }
    ]
  },
  {
    id: 'night5', num: 5, god: 'Apollo & Artemis', title: 'The Twins of Sun and Moon',
    symbol: '\u{1F3F9}', badgeId: 'god5', badgeName: 'Silver Arrow',
    audio: 'audio/corfu/night5.mp3',
    story: "Heroes, Hermes delivered his message, so tonight the twins are waiting for you: Apollo and Artemis, the sun and the moon of Olympus.\n\nThey were born on Delos, a tiny floating island, because no proper land would give their mother a place to rest. Artemis was born first. And here is the amazing part: minutes old, she helped her mother take care of her newborn twin brother. First on the scene, taking charge. That is Artemis.\n\nShe grew up to be the goddess of the moon and of wild animals and the hunt. She runs through the mountains at night with a silver bow and silver arrows, faster than deer, quieter than owls. When the moon is bright on the sea tonight, that silver path on the water? Hers.\n\nApollo took the day shift. God of the sun, and god of music. Remember the lyre that baby Hermes invented, the turtle-shell harp? Apollo plays it every evening on Olympus while the sun goes down, and the gods stop arguing just to listen. He is also the god of truth: Apollo never lies. Ever. Which makes him the one god you can always trust on this trail.\n\nBetween the two of them, the twins cover every hour: Apollo watches the world all day, Artemis all night. Nothing that happens on this island gets past them, not a quest, not a race on the beach, not a well-answered question. They keep score. Gods always keep score.\n\nTomorrow night, be on your best behavior, because you meet the queen. Hera, queen of ALL the gods, and with her, the loudest god on the mountain. But tonight belongs to the twins. Day questions, night questions. Aim carefully.",
    questions: [
      { tier: 'leo', q: 'Artemis hunts with which weapon?', a: 'Bow and arrow' },
      { tier: 'leo', q: 'Apollo loves music. What does he play?', a: 'The lyre, a small harp' },
      { tier: 'adam', q: 'Apollo and Artemis are twins. Who is the moon and who is the sun?', a: 'Artemis the moon and the hunt, Apollo the sun and music' },
      { tier: 'adam', q: "Artemis's arrows are made of which metal?", a: 'Silver' },
      { tier: 'parents', q: 'On which island were the twins born?', a: 'Delos' }
    ]
  },
  {
    id: 'night6', num: 6, god: 'Hera & Ares', title: 'The Queen and the Quarrel',
    symbol: '\u{1F99A}', badgeId: 'god6', badgeName: "Peacock's Eye",
    audio: 'audio/corfu/night6.mp3',
    story: "Heroes, stand up straight tonight, because tonight you are in front of the throne. Hera: queen of the gods, wife of Zeus, goddess of marriage and family.\n\nHera watches over every family, which means, yes, she has been watching yours this whole trip. Every time you help your brother on a quest, the queen notices. Every time you do NOT... she notices that too.\n\nHer royal bird is the peacock, and if you have ever seen a peacock's tail, you know why: a hundred shimmering circles like a hundred watching eyes, fanned out like a crown. Nothing escapes the queen.\n\nHera loves one city more than anywhere on earth: Argos. Keep that name in your pocket, Heroes, because in a week you will sleep in a town called Nafplio, and Argos, the queen's own city, is fifteen minutes down the road. Her trail and yours are about to cross.\n\nAnd with the queen comes her son: Ares, god of war. Ares is huge, loud, and permanently ready to arm-wrestle everybody. He loves battle more than anything: the shouting, the clanging, the drama. The other gods find him exhausting. Even his own father Zeus rolls his eyes.\n\nBut here is a secret about Ares: nothing makes him happier than a good contest. And word has reached him of a family on the trail that battles every single night, heroes against parents, at something called a Showdown. He has started watching your scores. Tonight he wants a LOUD one, with cheering.\n\nSo: the queen wants excellent manners, and the war god wants total mayhem. Somehow, you must give them both. The royal questions begin now.",
    questions: [
      { tier: 'leo', q: 'Which goddess has a peacock?', a: 'Hera' },
      { tier: 'leo', q: 'What does Ares love more than anything?', a: 'Fighting, war' },
      { tier: 'adam', q: 'Hera is the queen of the gods. What is she the goddess of?', a: 'Marriage and family' },
      { tier: 'adam', q: "Hera's favorite city is 15 minutes from our hotel in Nafplio. Which one?", a: 'Argos' },
      { tier: 'parents', q: "Hera's Roman name?", a: 'Juno' }
    ]
  },
  {
    id: 'night7', num: 7, god: 'Hephaestus & Aphrodite', title: 'The Forge Under the Volcano',
    symbol: '\u{1F528}', badgeId: 'god7', badgeName: "Maker's Hammer",
    audio: 'audio/corfu/night7.mp3',
    story: "Heroes, do you hear that? Deep under the islands, if you listen very hard on a quiet night... TANG. TANG. TANG. That is a hammer. Tonight you meet the god who makes EVERYTHING: Hephaestus, the smith of Olympus.\n\nHis workshop is a forge inside a volcano, where the fires never go out and one-eyed Cyclopes work the bellows. When the mountain smokes, that is Hephaestus on a deadline. And what a workshop it is. The palaces on Mount Olympus? He built them. The armor of the gods? He hammered it. Zeus's thunderbolts? Forged right there. Thrones, chariots, even robot helpers made of gold that he built to carry his tools. The first inventor, the greatest maker who ever lived.\n\nAnd now, Heroes, lean in, because this is the biggest secret on the whole trail. The trident. Poseidon's own three-pointed trident, the one that turned the ship to stone in your bay: the Cyclopes forged it in that same fiery workshop, at the same time as Zeus's thunderbolt. Which means the maker's fire knows the sea god's power better than anyone. When you finally stand at Sounio and face Poseidon, remember whose workshop his power came from. Makers first, magic second.\n\nAnd beside the soot-covered smith stands his wife, the most surprising match on Olympus: Aphrodite, goddess of love and beauty. She was born right out of the sea foam, riding to shore on a seashell, and where she stepped, flowers grew out of the sand. The kindest smile on the mountain, married to the hardest worker. The gods gossiped, but it makes sense: beautiful things love the one who makes beautiful things.\n\nTonight the hammer and the seashell ask their questions. Build your answers well.",
    questions: [
      { tier: 'leo', q: 'Which god builds things with a hammer?', a: 'Hephaestus' },
      { tier: 'leo', q: 'Aphrodite was born from the sea ___?', a: 'Foam' },
      { tier: 'adam', q: "Where is Hephaestus's workshop?", a: 'Inside a volcano, his forge' },
      { tier: 'adam', q: 'What did Hephaestus build for the gods?', a: "Their palaces, weapons and armor, Zeus's thunderbolts" },
      { tier: 'adam', q: 'What is Aphrodite the goddess of?', a: 'Love and beauty' },
      { tier: 'parents', q: "Aphrodite's Roman name, also a planet?", a: 'Venus' }
    ]
  },
  {
    id: 'night8', num: 8, god: 'Demeter & Dionysus', title: 'The Feast Before the Road',
    symbol: '\u{1F347}', badgeId: 'god8', badgeName: 'Golden Harvest',
    audio: 'audio/corfu/night8.mp3',
    story: "Heroes, tonight is your last night on Poseidon's island, and on Olympus, the last night before a journey means one thing: a feast. Hosting tonight are the two gods of every good meal you have ever eaten: Demeter and Dionysus.\n\nDemeter is the goddess of the harvest. Every wheat field, every orchard, every tomato in your salad tonight: hers. When Demeter is happy, the whole world grows.\n\nBut once, the world stopped growing. Demeter had a daughter, Persephone, whom she loved more than sunlight. One day Hades, king of the underworld, took Persephone down to his shadow kingdom to be his queen. Demeter searched the whole earth, and her sadness was so heavy that the fields stopped growing, the leaves fell, and the first winter came. Zeus had to fix it, so a deal was made: part of every year, Persephone returns to her mother, and Demeter is so happy that flowers explode out of the ground. That is spring. Then Persephone goes back below, and Demeter's sadness turns the world cold again. So when someone asks why winter exists, you know the true story: a mother missing her daughter.\n\nAnd beside Demeter, grinning, grape juice on his chin: Dionysus, god of wine, parties, and the theater. He turned pirates into dolphins, he taught the world to dance, and he invented the idea of acting out stories on a stage, which, if you think about it, is what your whole Showdown is.\n\nEight nights, Heroes. Eight badges. You know the gods now, and the gods know you. Tomorrow you fly across the sea that Poseidon rules, toward Athens, and the road of a hero named Theseus. The sea god is waiting at the end of it.\n\nTonight? Tonight we feast. Final Corfu questions. Make them count.",
    questions: [
      { tier: 'leo', q: "Dionysus's favorite fruit?", a: 'Grapes' },
      { tier: 'leo', q: 'Demeter makes things grow. What grows in a field?', a: 'Wheat, plants, food' },
      { tier: 'adam', q: 'Why do we have winter, according to the myth?', a: 'Persephone spends months in the underworld and her mother Demeter is too sad to let anything grow' },
      { tier: 'adam', q: 'What is Dionysus the god of?', a: 'Wine, parties and theater' },
      { tier: 'parents', q: 'Which ancient secret ceremonies near Athens honored Demeter?', a: "The Eleusinian Mysteries, at Eleusis, which we drive past on Theseus's Road" }
    ]
  }
];

var QUESTS = [
  {
    id: 'quest-mouse', title: 'The Stone Ship of Mouse Island', place: 'Pontikonisi & Kanoni',
    symbol: '\u{1F6A2}', badgeId: 'qbadge-mouse', badgeName: 'Ship Spotter', points: 30,
    intro: "Poseidon's evidence is still floating in your bay. Find the ship he turned to stone.",
    missions: [
      { id: 'm1', text: "Find a lookout spot at Kanoni and SPOT the stone ship (Mouse Island). Tap when you see it.", type: 'here' },
      { id: 'm2', text: 'Capture the evidence: a quest photo of the ship that angered a god.', type: 'photo' },
      { id: 'm3', text: 'Retell it: one Hero explains to the parents WHY Poseidon smashed this ship. Parents judge.', type: 'check' },
      { id: 'm4', text: 'Scout mission (both Heroes): count the boats passing the stone ship in 5 minutes. One counts, one keeps time.', type: 'check' }
    ],
    questions: [
      { tier: 'leo', q: 'Mouse Island used to be something else before Poseidon touched it. What?', a: 'A ship' },
      { tier: 'leo', q: 'Odysseus washed up on a beach here in Corfu. Who found him?', a: 'A princess, Nausicaa' },
      { tier: 'adam', q: 'What was Corfu called in the Odyssey, and who lived here?', a: 'Scheria, home of the Phaeacians' },
      { tier: 'adam', q: 'Why did Poseidon turn the Phaeacian ship to stone?', a: 'They helped Odysseus get home against his will' },
      { tier: 'adam', q: 'How many years did Odysseus take to get home from Troy?', a: 'Ten' },
      { tier: 'parents', q: 'Who wrote the Odyssey?', a: 'Homer' }
    ]
  },
  {
    id: 'quest-achilleion', title: "The Palace of the Fastest Hero", place: 'The Achilleion',
    symbol: '\u{1F3DB}', badgeId: 'qbadge-achilleion', badgeName: "Achilles' Guard", points: 30,
    intro: 'An empress loved the hero Achilles so much she built him a palace. Walk it like scouts.',
    missions: [
      { id: 'm1', text: "We're here: stand in the gardens of the Achilleion.", type: 'here' },
      { id: 'm2', text: 'Find the statue of the DYING Achilles. Look where his hand reaches: what is he holding? (His heel.)', type: 'check' },
      { id: 'm3', text: 'Quest photo: strike the Achilles pose next to the statue, one hand on your heel.', type: 'photo' },
      { id: 'm4', text: 'Scout mission: find the SECOND Achilles statue, the giant victorious one, and report which way he faces.', type: 'check' }
    ],
    questions: [
      { tier: 'leo', q: 'Achilles had one weak spot on his body. Where?', a: 'His heel' },
      { tier: 'adam', q: "Why was Achilles's heel his only weak spot?", a: 'His mother Thetis dipped him in the river Styx holding him by the heel' },
      { tier: 'adam', q: 'In which famous war did Achilles fight?', a: 'The Trojan War' },
      { tier: 'parents', q: 'Which empress built the Achilleion palace as her retreat?', a: 'Elisabeth of Austria, Sisi' }
    ]
  },
  {
    id: 'quest-beach', title: "Poseidon's Games", place: 'Any Corfu beach',
    symbol: '\u{1F3D6}', badgeId: 'qbadge-beach', badgeName: 'Sand Champion', points: 20,
    intro: 'Odysseus was discovered on a Corfu beach because a princess was playing ball. The sea god watches beach games. Impress him.',
    missions: [
      { id: 'm1', text: "We're here: feet in the sand, sea in front of you.", type: 'here' },
      { id: 'm2', text: 'Build the stone ship of Mouse Island in sand. Quest photo of your fleet.', type: 'photo' },
      { id: 'm3', text: "Play Nausicaa's ball game: throw and catch 10 in a row without a drop (that is how Odysseus got found).", type: 'check' },
      { id: 'm4', text: 'Treasure of the deep: each Hero finds one thing the sea has shaped (shell, glass, driftwood). Show the table.', type: 'check' }
    ],
    questions: []
  }
];

// Register night packs and quest packs into the trivia engine.
NIGHTS.forEach(function (n) {
  PACKS.push({ id: n.id, title: 'Night ' + n.num + ': ' + n.god, note: n.title, questions: n.questions });
});
QUESTS.forEach(function (q) {
  if (q.questions.length) PACKS.push({ id: q.id, title: q.title, note: 'Quest trivia: ' + q.place, questions: q.questions });
});

// Replace the sealed placeholder badges with the real Corfu ones.
for (var i = BADGES.length - 1; i >= 0; i--) if (BADGES[i].sealed) BADGES.splice(i, 1);
NIGHTS.forEach(function (n) {
  BADGES.push({ id: n.badgeId, art: n.symbol, name: n.badgeName, how: 'Night ' + n.num + ': finish the ' + n.god + ' Showdown', god: true });
});
QUESTS.forEach(function (q) {
  BADGES.push({ id: q.badgeId, art: q.symbol, name: q.badgeName, how: 'Complete the quest: ' + q.title, god: true });
});
BADGES.push({ id: 'sealed-road', art: '\u{1F512}', name: 'Sealed', how: 'Opens on the road to Athens', sealed: true });

window.CORFU = { nights: NIGHTS, quests: QUESTS };
})();
