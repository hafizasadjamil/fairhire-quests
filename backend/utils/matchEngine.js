// Basic skill match score calculator (you can replace with cosine similarity or embeddings)
export const matchScoreCalculator = (jobSkills = [], candidateSkills = []) => {
  if (!jobSkills.length || !candidateSkills.length) return 0;

  const matched = jobSkills.filter((skill) =>
    candidateSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
  );

  const score = (matched.length / jobSkills.length) * 100;
  return Math.round(score);
};
