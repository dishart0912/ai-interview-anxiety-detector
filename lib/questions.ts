export interface Question {
  id: number
  text: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export const questions: Record<string, Question[]> = {
  General: [
    // Easy — warm, open-ended, no pressure
    { id: 1,  text: 'Tell me a little about yourself.', category: 'intro', difficulty: 'easy' },
    { id: 2,  text: 'What do you enjoy most about your work?', category: 'motivation', difficulty: 'easy' },
    { id: 3,  text: 'What are you looking for in your next role?', category: 'goals', difficulty: 'easy' },
    { id: 4,  text: 'How would your friends describe you professionally?', category: 'strength', difficulty: 'easy' },
    { id: 5,  text: 'What does a productive workday look like for you?', category: 'work style', difficulty: 'easy' },
    // Medium — standard interview questions
    { id: 6,  text: 'What is your greatest professional strength and how have you used it?', category: 'strength', difficulty: 'medium' },
    { id: 7,  text: 'Describe a challenge you overcame at work and what you learned.', category: 'behavioral', difficulty: 'medium' },
    { id: 8,  text: 'Where do you see yourself in 5 years?', category: 'goals', difficulty: 'medium' },
    { id: 9,  text: 'Why do you want this position specifically?', category: 'motivation', difficulty: 'medium' },
    { id: 10, text: 'Tell me about a time you had to work with a difficult colleague.', category: 'behavioral', difficulty: 'medium' },
    // Hard — pressure, introspection, tough scenarios
    { id: 11, text: 'What is your greatest weakness and what are you actively doing to fix it?', category: 'self-awareness', difficulty: 'hard' },
    { id: 12, text: 'Tell me about a time you failed. What happened and what did you do next?', category: 'failure', difficulty: 'hard' },
    { id: 13, text: 'Describe a situation where you disagreed with your manager. How did you handle it?', category: 'conflict', difficulty: 'hard' },
    { id: 14, text: 'Why should we hire you over other candidates with similar experience?', category: 'pitch', difficulty: 'hard' },
    { id: 15, text: 'Tell me about a time you had to make a decision with incomplete information under pressure.', category: 'judgment', difficulty: 'hard' },
  ],

  Engineering: [
    // Easy
    { id: 16, text: 'What programming languages are you most comfortable with and why?', category: 'technical', difficulty: 'easy' },
    { id: 17, text: 'Walk me through how you typically start a new coding project.', category: 'process', difficulty: 'easy' },
    { id: 18, text: 'What tools do you use daily as a developer?', category: 'tools', difficulty: 'easy' },
    { id: 19, text: 'How do you stay up to date with new technologies?', category: 'growth', difficulty: 'easy' },
    { id: 20, text: 'Describe a project you built that you are proud of.', category: 'achievement', difficulty: 'easy' },
    // Medium
    { id: 21, text: 'Explain the difference between REST and GraphQL and when you would use each.', category: 'technical', difficulty: 'medium' },
    { id: 22, text: 'How do you approach debugging a complex issue in production?', category: 'process', difficulty: 'medium' },
    { id: 23, text: 'Describe a system you designed from scratch. What tradeoffs did you make?', category: 'design', difficulty: 'medium' },
    { id: 24, text: 'How do you ensure code quality in a team environment?', category: 'collaboration', difficulty: 'medium' },
    { id: 25, text: 'What is your experience with CI/CD pipelines and automated testing?', category: 'devops', difficulty: 'medium' },
    // Hard
    { id: 26, text: 'Tell me about a time a production system went down. What did you do and what did you change afterwards?', category: 'incident', difficulty: 'hard' },
    { id: 27, text: 'How would you design a URL shortener that handles 100 million requests per day?', category: 'system design', difficulty: 'hard' },
    { id: 28, text: 'Describe a time you had to push back on a product requirement for technical reasons. How did you communicate it?', category: 'conflict', difficulty: 'hard' },
    { id: 29, text: 'How do you approach technical debt? When do you pay it down and when do you leave it?', category: 'judgment', difficulty: 'hard' },
    { id: 30, text: 'Tell me about the hardest technical problem you have ever solved.', category: 'challenge', difficulty: 'hard' },
  ],

  Product: [
    // Easy
    { id: 31, text: 'What does a product manager do in your own words?', category: 'fundamentals', difficulty: 'easy' },
    { id: 32, text: 'What product do you use every day and why do you love it?', category: 'passion', difficulty: 'easy' },
    { id: 33, text: 'How do you gather feedback from users?', category: 'research', difficulty: 'easy' },
    { id: 34, text: 'Describe how you collaborate with engineers on your team.', category: 'collaboration', difficulty: 'easy' },
    { id: 35, text: 'What metrics do you look at to understand if a feature is successful?', category: 'metrics', difficulty: 'easy' },
    // Medium
    { id: 36, text: 'How do you prioritize a product backlog when everything seems urgent?', category: 'process', difficulty: 'medium' },
    { id: 37, text: 'Tell me about a product decision you made that turned out to be wrong.', category: 'reflection', difficulty: 'medium' },
    { id: 38, text: 'How do you balance short-term user requests with long-term product vision?', category: 'strategy', difficulty: 'medium' },
    { id: 39, text: 'Describe how you handle disagreements between design and engineering.', category: 'conflict', difficulty: 'medium' },
    { id: 40, text: 'Walk me through how you would launch a new feature from idea to release.', category: 'process', difficulty: 'medium' },
    // Hard
    { id: 41, text: 'How would you decide whether to build, buy, or partner for a critical product capability?', category: 'strategy', difficulty: 'hard' },
    { id: 42, text: 'Tell me about a time you killed a feature or product. How did you make that decision?', category: 'judgment', difficulty: 'hard' },
    { id: 43, text: 'How do you influence engineering priorities when you have no direct authority?', category: 'influence', difficulty: 'hard' },
    { id: 44, text: 'Describe a time when data and user intuition pointed in opposite directions. What did you do?', category: 'judgment', difficulty: 'hard' },
    { id: 45, text: 'How would you define and improve retention for a B2B SaaS product losing 8% of users monthly?', category: 'metrics', difficulty: 'hard' },
  ],

  Design: [
    // Easy
    { id: 46, text: 'How would you describe your design style or aesthetic?', category: 'style', difficulty: 'easy' },
    { id: 47, text: 'What design tools do you use and which is your favourite?', category: 'tools', difficulty: 'easy' },
    { id: 48, text: 'Walk me through a recent design project you worked on.', category: 'portfolio', difficulty: 'easy' },
    { id: 49, text: 'How do you present your design work to stakeholders?', category: 'communication', difficulty: 'easy' },
    { id: 50, text: 'What websites or apps do you find beautifully designed and why?', category: 'inspiration', difficulty: 'easy' },
    // Medium
    { id: 51, text: 'Walk me through your end-to-end design process from brief to final delivery.', category: 'process', difficulty: 'medium' },
    { id: 52, text: 'How do you handle feedback that contradicts your design decisions?', category: 'behavioral', difficulty: 'medium' },
    { id: 53, text: 'Describe a project where you significantly improved UX and what the measurable impact was.', category: 'impact', difficulty: 'medium' },
    { id: 54, text: 'How do you balance aesthetics with usability when they conflict?', category: 'philosophy', difficulty: 'medium' },
    { id: 55, text: 'How do you approach designing for accessibility?', category: 'accessibility', difficulty: 'medium' },
    // Hard
    { id: 56, text: 'Tell me about a time your design was completely redesigned after user testing. How did you respond?', category: 'resilience', difficulty: 'hard' },
    { id: 57, text: 'How would you design an onboarding experience for a complex enterprise product with 50+ features?', category: 'system design', difficulty: 'hard' },
    { id: 58, text: 'Describe a time you had to advocate strongly for the user against business pressure. What happened?', category: 'advocacy', difficulty: 'hard' },
    { id: 59, text: 'How do you scale a design system across multiple products and teams?', category: 'systems', difficulty: 'hard' },
    { id: 60, text: 'Tell me about the hardest design problem you have ever solved and why it was difficult.', category: 'challenge', difficulty: 'hard' },
  ],

  Marketing: [
    // Easy
    { id: 61, text: 'What channels do you have the most experience with in marketing?', category: 'experience', difficulty: 'easy' },
    { id: 62, text: 'Describe a marketing campaign you worked on that you enjoyed.', category: 'experience', difficulty: 'easy' },
    { id: 63, text: 'How do you identify your target audience for a new product?', category: 'strategy', difficulty: 'easy' },
    { id: 64, text: 'How do you stay updated on marketing trends and platform changes?', category: 'growth', difficulty: 'easy' },
    { id: 65, text: 'What does a successful campaign look like to you?', category: 'philosophy', difficulty: 'easy' },
    // Medium
    { id: 66, text: 'Describe a successful campaign you ran. What was your strategy and what were the results?', category: 'achievement', difficulty: 'medium' },
    { id: 67, text: 'How do you measure and report marketing ROI to leadership?', category: 'metrics', difficulty: 'medium' },
    { id: 68, text: 'How do you align marketing goals with sales and product goals?', category: 'collaboration', difficulty: 'medium' },
    { id: 69, text: 'Tell me about a campaign that did not perform as expected. What did you learn?', category: 'reflection', difficulty: 'medium' },
    { id: 70, text: 'How do you approach content strategy for a brand entering a new market?', category: 'strategy', difficulty: 'medium' },
    // Hard
    { id: 71, text: 'How would you build a marketing strategy from scratch for a B2B product with zero budget?', category: 'strategy', difficulty: 'hard' },
    { id: 72, text: 'Tell me about a time a major campaign failed publicly. How did you handle it and what changed?', category: 'crisis', difficulty: 'hard' },
    { id: 73, text: 'How do you balance brand building with performance marketing when resources are limited?', category: 'judgment', difficulty: 'hard' },
    { id: 74, text: 'Describe how you would approach reducing customer acquisition cost by 40% in 6 months.', category: 'growth', difficulty: 'hard' },
    { id: 75, text: 'How do you market a product that has no clear differentiation from competitors?', category: 'positioning', difficulty: 'hard' },
  ],
}

export function getQuestions(role: string, difficulty: string = 'medium', count: number = 5): Question[] {
  const pool = questions[role] ?? questions['General']
  const filtered = pool.filter(q => q.difficulty === difficulty)
  // If not enough questions for that difficulty, pad with medium
  if (filtered.length < count) {
    const medium = pool.filter(q => q.difficulty === 'medium')
    const combined = [...new Map([...filtered, ...medium].map(q => [q.id, q])).values()]
    return combined.slice(0, count)
  }
  return filtered.slice(0, count)
}