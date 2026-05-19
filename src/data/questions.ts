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
 * Per-category gameplay question pools. Counts as of 2026-05-18:
 *   justVibing: 26
 *   digDeep:    27
 *   waitWhat:   26
 */
export const QUESTIONS: Record<CategoryId, readonly string[]> = {
  justVibing: [
    "What’s a first impression you had of me that changed over time?",
    "How did you get your name?",
    "What’s a fashion trend you never understood?",
    "What’s your go-to stress-eating food?",
    "What’s your most rewatched movie/show?",
    "What’s something you are looking forward to?",
    "What’s your favorite thing about where you grew up?",
    "What’s the most spontaneous thing you’ve ever done?",
    "What food could you eat three days in a row?",
    "What’s your ideal way to spend a rainy weekend?",
    "What’s one song you’ve had on repeat lately?",
    "If I were a life coach, what do you think people would come to me for help with?",
    "What’s the newest hobby you’ve picked up, and what do you love about it?",
    "If there were a book about your life, what would the title be?",
    "What’s something you’ve kept with you for a really long time?",
    "What’s the best advice a stranger has ever given you?",
    "If you could instantly master one skill, what would it be?",
    "Are you more of a planner or a spontaneous person? What made you that way?",
    "What would your perfect birthday look like?",
    "What’s a piece of art or decor you’d love to have in your home if money weren’t an issue?",
    "Other than where you live now, what city would you most want to live in?",
    "When was the last time you pulled an all-nighter?",
    "What’s the most important thing you’ve accidentally slept through?",
    "What’s the funniest thing that’s happened to you in a car?",
    "What thought has been looping in your head lately?",
    "What’s something I say all the time?",
  ],
  digDeep: [
    "What do people do that makes you feel loved?",
    "What makes you naturally click with someone as a friend?",
    "What music do you listen to when you’re feeling down?",
    "What’s something you appreciate about yourself?",
    "What’s something you want more of in your life lately?",
    "What’s something you’ve changed your mind about recently?",
    "What makes you feel seen and understood by someone?",
    "How has living in your current city shaped your personality or lifestyle?",
    "What’s one change you hope to see in the world in five years?",
    "What’s something you wish your friends or family asked you more often?",
    "What helps you feel grounded or comforted when you’re overwhelmed?",
    "What’s something about me you’re curious to learn more about?",
    "How do you think I show affection to people?",
    "Other than yourself, who do you think knows you best?",
    "What’s a misconception people often have about you?",
    "What’s something you’re still learning how to handle?",
    "What’s something you’re grateful your younger self didn’t give up on?",
    "Who’s someone you really look up to, and why?",
    "How are you feeling now compared to this time yesterday?",
    "What do you like most about your current life?",
    "Do you find it easy or hard to apologize when you’re wrong?",
    "What was the last movie that made you cry, and what about it hit you emotionally?",
    "What’s one thing you think makes me “me”?",
    "Who’s someone who changed the way you see yourself or the world, and how?",
    "If your life became a movie, what’s one scene you’d want in the final cut?",
    "What’s a compliment that’s stayed with you for years?",
    "What’s a moment from your past that you later realized was a turning point?",
  ],
  waitWhat: [
    "Who was the most unhinged teacher/professor you’ve ever had?",
    "What’s the strangest thing you believed as a child?",
    "If a song played every time you entered a room, what would it be?",
    "If aliens observed humanity through you alone, what would confuse them the most?",
    "What’s a completely harmless thing that scares you?",
    "If you had to replace your hands with any object or tool, what would you choose?",
    "What’s a time you accidentally drove a friend crazy?",
    "What’s the most chaotic thing you’ve done while home alone?",
    "What would you do if you could become invisible for one hour?",
    "If you accidentally became a cult leader, what would the cult be about?",
    "What does your best friend roast you for the most?",
    "What advice would you give your pet?",
    "What unconventional hair color do you think I could pull off?",
    "What’s the most unhealthy thing you do for your mental health?",
    "If you could erase one of your own embarrassing moments from everyone else’s memory, what would it be?",
    "If you were stuck indoors for 3 months with 3 people from your contacts, who would you pick?",
    "If you could hear one person’s thoughts, whose would you listen to?",
    "If your personality became a clothing brand, what would its reputation be?",
    "If you could ban one thing from the world, what would it be and why?",
    "If you had to wear a sign around your neck every day, what would it say?",
    "If I had to get a tattoo and you had to design it, what would it be?",
    "What’s the weirdest animal voice you can imitate?",
    "What song would psychologically break you if it played on loop?",
    "Would you rather burp bubbles or sneeze glitter?",
    "If you were hired to make a dinner party slightly uncomfortable, what would you do?",
    "If you could replace pigeons with another animal in cities, what would you choose?",
  ],
};
