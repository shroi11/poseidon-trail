// The Poseidon Trail — Phase 4: the hidden god.
// A riddle chain for sharp-eyed Heroes. The entrance hides on the Badges
// screen as an unmarked shadow tile. Four riddles, all answerable from
// stories the family has already heard. Reward: the 13th badge.

(function () {
'use strict';

var HADES_RIDDLES = [
  {
    riddle: 'Three brothers split the world. One took the sky. One took the sea. I took what was left, and nobody sings songs about me. Say my name.',
    accept: ['hades']
  },
  {
    riddle: 'My doorman never sleeps. He has three heads, one collar, and one job: everyone comes in, nobody goes out. Who is he?',
    accept: ['cerberus', 'kerberos', 'cerberos']
  },
  {
    riddle: 'Half the year she sits at my table, and up above the world turns cold. Half the year she returns to her mother, and flowers explode from the ground. Who is she?',
    accept: ['persephone', 'persefone', 'persephoni']
  },
  {
    riddle: 'My brother shakes the earth. My other brother burns the sky. What is left is mine, and one day, everyone visits. What do I rule?',
    accept: ['underworld', 'the underworld', 'under world']
  }
];

var HADES_POINTS = 40;

// The 13th badge. Hidden: shows as a shadow tile until earned.
// Not counted by the Pantheon check (that is the 12 of Olympus).
BADGES.push({
  id: 'god-hades',
  img: 'assets/badges/badge-hades.svg',
  name: 'Hades',
  how: 'The quiet one found you worthy',
  god: true,
  hidden: true,
  fallback: '\u{1F480}'
});

window.HADES = { riddles: HADES_RIDDLES, points: HADES_POINTS };
})();
