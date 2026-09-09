export const APTITUDE_QUESTION_POOL = [
  {
    id: 1,
    type: "quantitative",
    category: "Quantitative Aptitude • Time & Work",
    question: "A can complete a piece of work in 12 days, and B can complete the same work in 18 days. If they work together for 4 days, what fraction of the total work remains unfinished?",
    options: [
      "4/9",
      "5/9",
      "1/3",
      "2/5"
    ],
    correctIndex: 0,
    explanation: "A's 1-day work = 1/12. B's 1-day work = 1/18. Together 1 day = (1/12 + 1/18) = 5/36. In 4 days work done = 4 * (5/36) = 20/36 = 5/9. Remaining work = 1 - 5/9 = 4/9."
  },
  {
    id: 2,
    type: "quantitative",
    category: "Quantitative Aptitude • Speed, Time & Distance",
    question: "A train 180 meters long is traveling at a constant speed of 72 km/h. How many seconds will it take to pass a stationary signal post completely?",
    options: [
      "9 seconds",
      "10 seconds",
      "12 seconds",
      "8 seconds"
    ],
    correctIndex: 0,
    explanation: "Speed in m/s = 72 * (5/18) = 20 m/s. Time to pass a post = Total Distance / Speed = 180 / 20 = 9 seconds."
  },
  {
    id: 3,
    type: "quantitative",
    category: "Quantitative Aptitude • Profit & Loss",
    question: "A merchant buys an item for $400 and marks it up by 30%. If he offers a discount of 10% on the marked price during sale, what is his net profit percentage?",
    options: [
      "17%",
      "20%",
      "15%",
      "18.5%"
    ],
    correctIndex: 0,
    explanation: "Marked Price = 400 * 1.30 = $520. Selling Price with 10% discount = 520 * 0.90 = $468. Profit = $468 - $400 = $68. Profit % = (68 / 400) * 100 = 17%."
  },
  {
    id: 4,
    type: "quantitative",
    category: "Quantitative Aptitude • Probability",
    question: "Two standard fair six-sided dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on the top faces is exactly 8?",
    options: [
      "5/36",
      "1/6",
      "7/36",
      "1/9"
    ],
    correctIndex: 0,
    explanation: "Total possible outcomes = 6 * 6 = 36. Favorable outcomes for sum 8 are (2,6), (3,5), (4,4), (5,3), (6,2) -> exactly 5 pairs. Probability = 5/36."
  },
  {
    id: 5,
    type: "quantitative",
    category: "Quantitative Aptitude • Ratio & Ages",
    question: "The ratio of the present ages of a father and his son is 5 : 2. If 6 years hence the ratio of their ages will become 7 : 3, what is the father's current age?",
    options: [
      "60 years",
      "50 years",
      "45 years",
      "40 years"
    ],
    correctIndex: 0,
    explanation: "Let ages be 5x and 2x. (5x + 6) / (2x + 6) = 7 / 3 => 3(5x + 6) = 7(2x + 6) => 15x + 18 = 14x + 42 => x = 24. Father's age = 5 * 12 = 60 years."
  },
  {
    id: 6,
    type: "logical",
    category: "Logical Reasoning • Coding-Decoding",
    question: "In a certain code language, if 'FLOWER' is coded as 'GMPXFS', how is the word 'GARDEN' coded in that same language?",
    options: [
      "HBSEFO",
      "HBSFEM",
      "HCSEFO",
      "HBSDFO"
    ],
    correctIndex: 0,
    explanation: "Each letter is shifted by +1: F->G, L->M, O->P, W->X, E->F, R->S. Applying +1 to GARDEN gives G(+1)=H, A(+1)=B, R(+1)=S, D(+1)=E, E(+1)=F, N(+1)=O -> 'HBSEFO'."
  },
  {
    id: 7,
    type: "logical",
    category: "Logical Reasoning • Number Series",
    question: "Identify the missing number in the sequence: 4, 9, 19, 39, 79, ?",
    options: [
      "159",
      "149",
      "169",
      "158"
    ],
    correctIndex: 0,
    explanation: "Pattern: (x * 2) + 1. (4*2)+1 = 9; (9*2)+1 = 19; (19*2)+1 = 39; (39*2)+1 = 79; (79*2)+1 = 159."
  },
  {
    id: 8,
    type: "logical",
    category: "Logical Reasoning • Blood Relations",
    question: "Pointing to a photograph of a boy, Suresh said: 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
    options: [
      "Father",
      "Uncle",
      "Brother",
      "Grandfather"
    ],
    correctIndex: 0,
    explanation: "Suresh's mother's only son is Suresh himself. The boy is the son of Suresh. Thus, Suresh is the father of the boy."
  },
  {
    id: 9,
    type: "logical",
    category: "Logical Reasoning • Direction Sense",
    question: "A person starts from point A and walks 10 meters North, then turns East and walks 8 meters, then turns South and walks 10 meters. How far and in which direction is he from point A?",
    options: [
      "8 meters East",
      "8 meters West",
      "10 meters East",
      "6 meters North"
    ],
    correctIndex: 0,
    explanation: "The North (10m) and South (10m) movements cancel out vertically. He is exactly 8 meters East of starting point A."
  },
  {
    id: 10,
    type: "logical",
    category: "Logical Reasoning • Syllogisms",
    question: "Statements: 1. All trees are plants. 2. All plants are green. \nConclusions: I. All trees are green. II. Some green items are trees.",
    options: [
      "Both Conclusion I and II follow",
      "Only Conclusion I follows",
      "Only Conclusion II follows",
      "Neither follows"
    ],
    correctIndex: 0,
    explanation: "All trees are plants, and all plants are green, which directly implies All trees are green (Conclusion I). It also validates that Some green items are trees (Conclusion II)."
  },
  {
    id: 11,
    type: "quantitative",
    category: "Quantitative Aptitude • Pipes & Cisterns",
    question: "Pipe A can fill a tank in 6 hours, while Pipe B can empty it in 8 hours. If both pipes are opened simultaneously into an empty tank, in how many hours will the tank be completely filled?",
    options: [
      "24 hours",
      "18 hours",
      "14 hours",
      "12 hours"
    ],
    correctIndex: 0,
    explanation: "Net fill rate per hour = (1/6 - 1/8) = (4 - 3)/24 = 1/24 of the tank per hour. Therefore, it takes 24 hours to fill the tank."
  },
  {
    id: 12,
    type: "quantitative",
    category: "Quantitative Aptitude • Simple & Compound Interest",
    question: "A sum of $5,000 is invested at 10% annual simple interest. What is the total interest accrued at the end of 3 years?",
    options: [
      "$1,500",
      "$1,655",
      "$1,200",
      "$1,750"
    ],
    correctIndex: 0,
    explanation: "Simple Interest = (Principal * Rate * Time) / 100 = (5000 * 10 * 3) / 100 = $1,500."
  }
];

export function getRandomAptitudeQuestions(count = 5) {
  const shuffled = [...APTITUDE_QUESTION_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
