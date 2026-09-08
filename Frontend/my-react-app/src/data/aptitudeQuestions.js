export const APTITUDE_QUESTION_POOL = [
  {
    id: 1,
    type: "quantitative",
    category: "Quantitative Aptitude",
    question: "A project team of 6 engineers can complete a sprint in 15 days. If 3 more engineers with the same efficiency join after 3 days, how many more days will it take to finish the remaining sprint?",
    options: [
      "8 days",
      "9 days",
      "7.5 days",
      "10 days"
    ],
    correctIndex: 0,
    explanation: "Total work = 6 * 15 = 90 man-days. Work completed in 3 days = 6 * 3 = 18 man-days. Remaining work = 90 - 18 = 72 man-days. New team size = 9 engineers. Days required = 72 / 9 = 8 days."
  },
  {
    id: 2,
    type: "logical",
    category: "Logical Reasoning",
    question: "In a code language, if 'CYBER' is coded as 'EADGT', how will 'ALGO' be coded under the same transformation rule?",
    options: [
      "CNIQ",
      "CNIP",
      "BNIQ",
      "COJP"
    ],
    correctIndex: 0,
    explanation: "Pattern: +2 letters for each position. C(+2)=E, Y(+2)=A, B(+2)=D, E(+2)=G, R(+2)=T. For ALGO: A(+2)=C, L(+2)=N, G(+2)=I, O(+2)=Q -> 'CNIQ'."
  },
  {
    id: 3,
    type: "data_structures",
    category: "Analytical Thinking",
    question: "A streaming data pipeline processes events in order. If elements [10, 20, 30, 40] are pushed to a FIFO Queue, two elements are dequeued, then pushed onto a LIFO Stack, and finally one element is popped from the Stack, which element is retrieved?",
    options: [
      "10",
      "20",
      "30",
      "40"
    ],
    correctIndex: 1,
    explanation: "Queue starts: [10, 20, 30, 40]. Dequeue 2 elements -> 10, then 20. Pushed onto Stack: 10 then 20 (Stack top is 20). Pop Stack -> 20."
  },
  {
    id: 4,
    type: "verbal",
    category: "Verbal Ability",
    question: "Choose the word that is most nearly OPPOSITE in meaning to 'EPHEMERAL':",
    options: [
      "Transitory",
      "Perpetual",
      "Volatile",
      "Fleeting"
    ],
    correctIndex: 1,
    explanation: "'Ephemeral' means lasting for a very short time. 'Perpetual' means never-ending or permanent, which is the direct antonym."
  },
  {
    id: 5,
    type: "probability",
    category: "Quantitative Reasoning",
    question: "Two independent server clusters have uptime probabilities of 0.90 and 0.95 respectively. What is the probability that at least one cluster is operational at any given moment?",
    options: [
      "0.995",
      "0.855",
      "0.950",
      "0.985"
    ],
    correctIndex: 0,
    explanation: "P(both down) = (1 - 0.90) * (1 - 0.95) = 0.10 * 0.05 = 0.005. P(at least one operational) = 1 - 0.005 = 0.995 (99.5%)."
  },
  {
    id: 6,
    type: "logical",
    category: "Logical Deduction",
    question: "Statements: All Microservices are Scalable. Some Scalable systems are Resilient. Conclusion I: Some Microservices are Resilient. Conclusion II: All Scalable systems are Microservices.",
    options: [
      "Only I follows",
      "Only II follows",
      "Neither I nor II follows",
      "Both I and II follow"
    ],
    correctIndex: 2,
    explanation: "The connection between Microservices and Resilient is not guaranteed by the premises; hence Neither I nor II definitively follows."
  }
];

export function getRandomAptitudeQuestions(count = 5) {
  const shuffled = [...APTITUDE_QUESTION_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
