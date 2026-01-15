export const questions = [
  { id: "1", text: "Tell me about a time you had to persuade someone to see your point of view." },
  { id: "2", text: "Explain what you do for work to someone completely outside your field." },
  { id: "3", text: "Describe a project you're proud of and why it mattered." },
  { id: "4", text: "Walk me through how you approach solving a complex problem." },
  { id: "5", text: "Tell me about a mistake you made and what you learned from it." },
  { id: "6", text: "How would you explain a technical concept to a non-technical stakeholder?" },
  { id: "7", text: "Describe a time you had to deliver difficult news to someone." },
  { id: "8", text: "What's the most important lesson you've learned in your career?" },
  { id: "9", text: "Tell me about a time you disagreed with a decision and how you handled it." },
  { id: "10", text: "How do you prioritize when everything feels urgent?" },
  { id: "11", text: "Describe a situation where you had to adapt quickly to change." },
  { id: "12", text: "What makes you effective at what you do?" },
  { id: "13", text: "Tell me about a time you had to influence without authority." },
  { id: "14", text: "How do you build trust with new colleagues or clients?" },
  { id: "15", text: "Describe a time when you had to simplify something complicated for others." },
]

export function getRandomQuestion(excludeId = null) {
  const available = excludeId
    ? questions.filter(q => q.id !== excludeId)
    : questions
  return available[Math.floor(Math.random() * available.length)]
}
