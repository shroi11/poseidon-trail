// The Poseidon Trail — the Cousins pack (Phase 5: the trail grows).
// Three Hebrew-speaking cousins (14, 11 and 9) join the crew: two team quests
// anyone can run anywhere, plus bonus missions on existing quests. Bonus
// missions never block a claim. Their trivia is Hebrew, tier 'cousins',
// and scores for the Heroes; the stories' Hebrew lives in pack-hebrew.js.

(function () {
'use strict';

var COUSIN_QUESTS = [
  {
    id: 'quest-cousins', title: "The Cousins' Trial", titleHe: 'מבחן בני הדודים',
    place: 'Wherever the whole crew gathers',
    symbol: '\u{2694}', badgeId: null, badgeName: null, points: 30,
    intro: 'Three new Heroes have joined the trail. The gods demand proof that the crew can fight as one.',
    introHe: 'שלושה גיבורים חדשים הצטרפו לשביל. האלים דורשים הוכחה שהצוות יודע להילחם כאחד.',
    missions: [
      {
        id: 'm1', type: 'here',
        text: "We're here: the full crew — Heroes and cousins — in one spot.",
        textHe: 'הגענו: כל הצוות — הגיבורים ובני הדודים — במקום אחד.'
      },
      {
        id: 'm2', type: 'check',
        text: "Story swap: a cousin retells tonight's god story in Hebrew, in their own words. Adam & Leo confirm three details.",
        textHe: 'החלפת סיפורים: אחד מבני הדודים מספר מחדש בעברית את סיפור האל של הערב, במילים שלו. אדם ולאו מאשרים שלושה פרטים.'
      },
      {
        id: 'm3', type: 'photo',
        text: 'Mount Olympus portrait: everyone picks a different god, finds a prop, and strikes the pose. Quest photo.',
        textHe: 'תמונת הר האולימפוס: כל אחד בוחר אל אחר, מוצא אביזר, ועומד בפוזה. תמונת משימה.'
      },
      {
        id: 'm4', type: 'check',
        text: "Hebrew lesson: the cousins teach the Heroes to say 'Poseidon, god of the sea' in Hebrew. The Heroes say it out loud at dinner.",
        textHe: 'שיעור עברית: בני הדודים מלמדים את הגיבורים להגיד ״פוסידון, אל הים״ בעברית. הגיבורים אומרים את זה בקול בארוחת הערב.'
      },
      {
        id: 'm5', type: 'check',
        text: 'Beach Olympics: mixed pairs — a big cousin with a small Hero. Three-leg relay: run, crab-walk, carry water. Log the winning pair on the Scores screen.',
        textHe: 'אולימפיאדת חוף: זוגות מעורבים — בן דוד גדול עם גיבור קטן. מרוץ שליחים בשלושה שלבים: ריצה, הליכת סרטן, העברת מים. רשמו את הזוג המנצח במסך הניקוד.'
      }
    ],
    questions: [
      { tier: 'cousins', q: 'כמה שיניים יש לקלשון של פוסידון?', a: 'שלוש' },
      { tier: 'cousins', q: 'איך קוראים להר שבו גרים האלים?', a: 'הר האולימפוס' },
      { tier: 'cousins', q: 'איזו חיה קדושה לפוסידון ודוהרת דווקא על היבשה?', a: 'הסוס' },
      { tier: 'cousins', q: 'זאוס, פוסידון והאדס חילקו ביניהם את העולם. מי קיבל מה?', a: 'זאוס — שמיים, פוסידון — ים, האדס — שאול' }
    ]
  },
  {
    id: 'quest-treasure', title: 'The Great God Hunt', titleHe: 'ציד האלים הגדול',
    place: 'Corfu Old Town, a harbor, or any market',
    symbol: '\u{1F50E}', badgeId: null, badgeName: null, points: 30,
    intro: 'The gods hide their symbols everywhere mortals shop and sail. Mixed teams — the sharpest eyes on the trail win.',
    introHe: 'האלים מחביאים את הסמלים שלהם בכל מקום שבו בני תמותה קונים ומפליגים. קבוצות מעורבות — העיניים החדות בשביל מנצחות.',
    missions: [
      {
        id: 'm1', type: 'here',
        text: "We're here: an old town, a harbor or a market — with the cousins.",
        textHe: 'הגענו: עיר עתיקה, נמל או שוק — יחד עם בני הדודים.'
      },
      {
        id: 'm2', type: 'check',
        text: 'The hunt: find 5 signs of the gods around you — an owl (Athena), a trident (Poseidon), a horse, grapes (Dionysus), an olive tree. Call each one out as you spot it.',
        textHe: 'הציד: מצאו סביבכם 5 סימנים של האלים — ינשוף (אתנה), קלשון (פוסידון), סוס, ענבים (דיוניסוס), עץ זית. מכריזים בקול על כל מציאה.'
      },
      {
        id: 'm3', type: 'photo',
        text: 'Quest photo: the best find of the hunt, with its finder pointing at it.',
        textHe: 'תמונת משימה: המציאה הכי טובה של הציד, עם מי שמצא אותה מצביע עליה.'
      },
      {
        id: 'm4', type: 'check',
        text: 'The verdict: the oldest cousin is the judge, and awards +10 bonus points to the sharpest hunter on the Scores screen.',
        textHe: 'פסק הדין: בן הדוד הגדול הוא השופט, ומעניק 10+ נקודות בונוס לצייד החד ביותר במסך הניקוד.'
      }
    ],
    questions: [
      { tier: 'cousins', q: 'הינשוף הוא הציפור של איזו אלה?', a: 'אתנה, אלת החוכמה' },
      { tier: 'cousins', q: 'ענבים הם הסמל של איזה אל?', a: 'דיוניסוס, אל היין והמסיבות' },
      { tier: 'cousins', q: 'איזו מתנה נתנה אתנה לעיר אתונה, וניצחה בזכותה את פוסידון?', a: 'עץ הזית' }
    ]
  }
];

// Register into the quest registry and the trivia engine.
if (window.CORFU) COUSIN_QUESTS.forEach(function (q) { CORFU.quests.push(q); });
COUSIN_QUESTS.forEach(function (q) {
  PACKS.push({ id: q.id, title: q.title, note: 'Quest trivia: ' + q.place, questions: q.questions });
});

// Bonus missions on existing quests. Optional by design: they never block a
// claim, so quests already finished before the cousins landed stay finished.
var BONUS_MISSIONS = {
  'quest-beach': {
    id: 'm5', type: 'check', bonus: true,
    text: "Nausicaa's tournament: Heroes vs cousins, most catches out of 10 throws. Losers carry the towels.",
    textHe: 'טורניר נאוסיקאה: גיבורים נגד בני הדודים, הכי הרבה תפיסות מתוך 10 זריקות. המפסידים סוחבים את המגבות.'
  },
  'site-athens': {
    id: 'm5', type: 'check', bonus: true,
    text: 'At the Erechtheion, a cousin retells the Athena vs Poseidon contest in Hebrew for the whole crew — on the exact spot where it happened.',
    textHe: 'ליד האֶרֶכְתֵיאוֹן: אחד מבני הדודים מספר בעברית לכל הצוות את סיפור התחרות בין אתנה לפוסידון — בדיוק במקום שבו זה קרה.'
  },
  'site-nafplio': {
    id: 'm5', type: 'check', bonus: true,
    text: 'Cousins vs Heroes up the 999 steps: climb in pairs, youngest sets off first. Meet at the top for the view.',
    textHe: 'בני הדודים נגד הגיבורים במעלה 999 המדרגות: עולים בזוגות, הצעיר ביותר יוצא ראשון. נפגשים למעלה בשביל הנוף.'
  }
};
if (window.CORFU) CORFU.quests.forEach(function (q) {
  if (BONUS_MISSIONS[q.id]) q.missions.push(BONUS_MISSIONS[q.id]);
});

window.COUSINS = { quests: COUSIN_QUESTS };
})();
