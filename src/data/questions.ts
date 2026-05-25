/**
 * Question pools for IfYouAsk.
 *
 * Source of truth: the "Question Collection" database in Notion
 * (https://www.notion.so/342c1ee9548c8082b88bed8d126c58ce). To refresh
 * the gameplay pool, edit there, then in Notion: "..." menu → Export →
 * Markdown & CSV. Drop the resulting .csv into the project folder and
 * regenerate the QUESTIONS object below.
 *
 * STARTER_QUESTIONS is a separate, smaller pool used only on the
 * FirstPlayerSelection screen to pick who asks first.
 */

/** Identifier for one of the three gameplay categories. */
export type CategoryId = 'justVibing' | 'digDeep' | 'waitWhat';

/**
 * Warm-up questions shown on FirstPlayerSelection to pick the first asker.
 * Easy, instant answers — no neutral outcomes.
 */
export const STARTER_QUESTIONS: readonly string[] = [
  "Who got up first today?",
  "Who can eat spicier food?",
  "Who's wearing more colors?",
  "Who is more likely to be late?",
  "Who cooks better?",
  "Whose birthday is sooner?",
  "Who can snap fingers louder?",
  "Who has warmer hands now?",
  "Who takes more photos?",
];

/**
 * Per-category gameplay question pools. Counts as of 2026-05-24:
 *   justVibing: 34
 *   digDeep:    33
 *   waitWhat:   33
 * Ordering follows the Notion source-of-truth IDs (JV1→JV34, DD1→DD33,
 * WW1→WW33) so that future CSV regenerations produce minimal diffs.
 */
export const QUESTIONS: Record<CategoryId, readonly string[]> = {
  justVibing: [
    "What’s a first impression you had of me that changed over time?",
    "What’s your favorite thing about where you grew up?",
    "How did you get your name?",
    "What’s a fashion trend you never understood?",
    "What’s your go-to stress-eating food?",
    "What’s your most rewatched movie or show?",
    "What’s something you are looking forward to?",
    "What thought has been looping in your head lately?",
    "What’s the funniest thing that’s happened to you in a car?",
    "What’s the most important thing you’ve accidentally slept through?",
    "When was the last time you pulled an all-nighter?",
    "Other than where you live now, what city would you most want to live in?",
    "What’s a piece of art or decor you’d love to have in your home if money weren’t an issue?",
    "What would your perfect birthday look like?",
    "Are you more of a planner or a spontaneous person? What made you that way?",
    "If you could instantly master any skill, what would you choose, and why?",
    "What’s a surprising comment from a stranger that you still remember?",
    "What’s something you’ve kept with you for a really long time?",
    "If there were a book about your life, what would the title be?",
    "What’s the newest hobby you’ve picked up, and what do you love about it?",
    "If I were a life coach, what do you think people would come to me for help with?",
    "What’s one song you’ve had on repeat lately?",
    "What’s your ideal way to spend a rainy weekend?",
    "What food could you eat three days in a row?",
    "What’s the most spontaneous thing you’ve ever done?",
    "What’s something I say all the time?",
    "What’s one song you love for the lyrics, and one you love purely for the music?",
    "If you had to pick a movie for us to watch, what would you choose?",
    "What’s a guilty pleasure you love unapologetically?",
    "What’s a habit you’ve kept since childhood? How did it start?",
    "What was your favorite toy as a kid?",
    "What’s a very specific errand or household chore you secretly enjoy?",
    "What’s something you always notice in other people’s homes?",
    "What’s your favorite way to spend an evening alone?",
  ],
  digDeep: [
    "What do people do that makes you feel loved?",
    "How has living in your current city shaped your personality or lifestyle?",
    "What’s one change you hope to see in the world in five years?",
    "What music do you listen to when you’re feeling down?",
    "What makes you naturally click with someone as a friend?",
    "What’s something you appreciate about yourself?",
    "What’s something you’ve changed your mind about recently?",
    "What makes you feel seen and understood by someone?",
    "What’s something you want more of in your life lately?",
    "Who’s someone who changed the way you see yourself or the world, and how?",
    "What’s one thing you think makes me “me”?",
    "What was the last movie that made you cry, and what about it hit you emotionally?",
    "Do you find it easy or hard to apologize when you’re wrong?",
    "What do you like most about your current life?",
    "How are you feeling now compared to this time yesterday?",
    "Who’s someone you really look up to, and why?",
    "What’s something you’re grateful your younger self didn’t give up on?",
    "What’s something you’re still learning how to handle?",
    "What’s a misconception people often have about you?",
    "Other than yourself, who do you think knows you best?",
    "How do you think I show affection to people?",
    "What’s something about me you’re curious to learn more about?",
    "What helps you feel grounded or comforted when you’re overwhelmed?",
    "What’s something you wish your friends or family asked you more often?",
    "If your life became a movie, what’s one scene you’d want in the final cut?",
    "What’s a compliment that’s stayed with you for years?",
    "What’s a moment from your past that you later realized was a turning point?",
    "What’s one moment when you were impressed by me?",
    "Is there someone you still miss from time to time?",
    "In what ways do you think we’re similar?",
    "What’s the best advice you’ve ever received from someone unexpected?",
    "What do you think it was like to raise you when you were a child?",
    "What’s something you learned about love from watching other people?",
  ],
  waitWhat: [
    "Who was the most unhinged teacher or professor you’ve ever had?",
    "What’s the strangest thing you believed as a child?",
    "If a song played every time you entered a room, what would it be?",
    "If aliens observed humanity through you alone, what would confuse them the most?",
    "What’s a completely harmless thing that scares you?",
    "What’s a time you accidentally drove a friend crazy?",
    "What does your best friend roast you for the most?",
    "If you accidentally became a cult leader, what would the cult be about?",
    "What would you do if you could become invisible for one hour?",
    "What’s the most chaotic thing you’ve done while home alone?",
    "If you had to replace your hands with any object or tool, what would you choose?",
    "What unconventional hair color do you think I could pull off?",
    "What advice would you give your pet?",
    "What’s the most unhealthy thing you do for your mental health?",
    "If you could erase one of your own embarrassing moments from everyone else’s memory, what would it be?",
    "If you were stuck indoors for 3 months with 3 people from your contacts, who would you pick?",
    "If you could hear one person’s thoughts, whose would you listen to?",
    "If your personality became a clothing brand, what would its reputation be?",
    "If you could ban one thing from the world, what would it be and why?",
    "If you had to wear a sign around your neck every day, what would it say?",
    "If you had to design a tattoo for me, what would it be?",
    "What’s the weirdest animal voice you can imitate?",
    "What song would psychologically break you if it played on loop?",
    "Would you rather burp bubbles or sneeze glitter?",
    "If you were hired to make a dinner party slightly uncomfortable, what would you do?",
    "If you could replace pigeons with another animal in cities, what would you choose?",
    "What three objects would I need to place in a magic circle to summon you?",
    "What’s the strangest coincidence that’s ever happened to you?",
    "If you opened a tiny museum about me, what three objects would you put on display?",
    "If you came with a warning label, what would it say?",
    "If people worshipped you 500 years from now, what oddly specific thing would they worship you for?",
    "If you woke up 200 years in the future, what’s the first thing you’d ask?",
    "If your apartment had a secret opinion about you, what would it be?",
  ],
};
