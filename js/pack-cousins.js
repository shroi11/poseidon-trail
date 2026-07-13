// The Poseidon Trail — the Cousins pack (Phase 5: Corfu grows).
// Three Hebrew-speaking cousins (14, 11 and 9) join the crew IN CORFU ONLY:
// three new Act I quests plus bonus missions on the existing Corfu quests.
// Bonus missions never block a claim. Their trivia is Hebrew, tier 'cousins',
// and scores for the Heroes; the stories' Hebrew lives in pack-hebrew.js.
// The road pack and the Sounio finale are untouched.

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
  },
  {
    id: 'quest-olympics', title: 'The Corfu Games', titleHe: 'משחקי קורפו',
    place: 'A beach or the villa garden',
    symbol: '\u{1F3C6}', badgeId: null, badgeName: null, points: 30,
    intro: 'Zeus himself watched the first games. Five kids on one island is a games-worthy roster — hold your own.',
    introHe: 'זאוס בעצמו צפה במשחקים הראשונים. חמישה ילדים על אי אחד זה סגל ראוי למשחקים — ערכו משחקים משלכם.',
    missions: [
      {
        id: 'm1', type: 'here',
        text: "We're here: the arena is ready — beach or garden, all five kids present.",
        textHe: 'הגענו: הזירה מוכנה — חוף או גינה, כל חמשת הילדים נוכחים.'
      },
      {
        id: 'm2', type: 'check',
        text: 'Opening ceremony: build a team torch (NO fire — a stick, paper, imagination) and parade it once around the arena.',
        textHe: 'טקס פתיחה: בנו לפיד קבוצתי (בלי אש! מקל, נייר, דמיון) וצעדו איתו הקפה אחת סביב הזירה.'
      },
      {
        id: 'm3', type: 'check',
        text: 'Three events, mixed teams: long jump into sand, one-leg balance like a heron, and a slow-motion race — last one to finish wins.',
        textHe: 'שלושה מקצים, קבוצות מעורבות: קפיצה לרוחק אל החול, שיווי משקל על רגל אחת כמו אנפה, ומרוץ הילוך איטי — האחרון שמסיים מנצח.'
      },
      {
        id: 'm4', type: 'photo',
        text: 'Medal ceremony: winners on an invisible podium, everyone humming the anthem. Quest photo.',
        textHe: 'טקס המדליות: המנצחים על פודיום בלתי נראה, כולם מזמזמים את ההמנון. תמונת משימה.'
      }
    ],
    questions: [
      { tier: 'cousins', q: 'לכבוד איזה אל נערכו המשחקים האולימפיים העתיקים?', a: 'זאוס' },
      { tier: 'cousins', q: 'מה קיבל המנצח במשחקים העתיקים במקום מדליה?', a: 'זר עלי זית' },
      { tier: 'cousins', q: 'באיזו עיר ביוון נולדו המשחקים האולימפיים?', a: 'אולימפיה' }
    ]
  }
];

// Register into the quest registry and the trivia engine.
if (window.CORFU) COUSIN_QUESTS.forEach(function (q) { CORFU.quests.push(q); });
COUSIN_QUESTS.forEach(function (q) {
  PACKS.push({ id: q.id, title: q.title, note: 'Quest trivia: ' + q.place, questions: q.questions });
});

// Bonus missions on the existing CORFU quests. Optional by design: they never
// block a claim, so quests finished before the cousins landed stay finished.
var BONUS_MISSIONS = {
  'quest-mouse': {
    id: 'm5', type: 'check', bonus: true,
    text: "Sea-god theater: with the cousins, act out the moment the ship turns to stone — one plays Poseidon, the rest are the crew. Freeze mid-scene for 10 seconds.",
    textHe: 'תיאטרון אל הים: יחד עם בני הדודים, המחיזו את הרגע שבו הספינה הופכת לאבן — אחד משחק את פוסידון, השאר הם צוות הספינה. קופאים באמצע הסצנה ל־10 שניות.'
  },
  'quest-achilleion': {
    id: 'm5', type: 'photo', bonus: true,
    text: 'Statue gallery: everyone — Heroes and cousins — picks a statue in the gardens and mimics its pose exactly. Quest photo of the whole gallery.',
    textHe: 'גלריית פסלים: כל אחד — גיבורים ובני דודים — בוחר פסל בגנים ומחקה את התנוחה שלו בדיוק. תמונת משימה של כל הגלריה.'
  },
  'quest-beach': {
    id: 'm5', type: 'check', bonus: true,
    text: "Nausicaa's tournament: Heroes vs cousins, most catches out of 10 throws. Losers carry the towels.",
    textHe: 'טורניר נאוסיקאה: גיבורים נגד בני הדודים, הכי הרבה תפיסות מתוך 10 זריקות. המפסידים סוחבים את המגבות.'
  },
  'quest-beach-2': {
    id: 'm6', type: 'check', bonus: true,
    text: "Forge the trident: build Poseidon's trident from what the beach gives you — driftwood, seaweed, shells. The mightiest trident earns the sea god's respect.",
    textHe: 'חשלו את הקלשון: בנו את הקלשון של פוסידון ממה שהחוף נותן — ענפי סחף, אצות, צדפים. הקלשון האדיר ביותר זוכה בכבוד של אל הים.'
  }
};
if (window.CORFU) CORFU.quests.forEach(function (q) {
  if (BONUS_MISSIONS[q.id]) q.missions.push(BONUS_MISSIONS[q.id]);
  if (q.id === 'quest-beach') q.missions.push(BONUS_MISSIONS['quest-beach-2']);
});

window.COUSINS = { quests: COUSIN_QUESTS };
})();
