export const GRADE_POINTS = { "A+": 10, "A": 9, "B+": 8, "B": 7, "C+": 6, "C": 5, "F": 0 };

// Calculate SGPA from a list of results
// Prioritises end-term results; falls back to all results if no end-term exists
export const calcSGPA = (results) => {
  if (!results?.length) return "0.00";
  // Use end-term results if available, otherwise use all
  const endTerm = results.filter(r => r.examType === "end-term");
  const pool = endTerm.length ? endTerm : results;
  // Deduplicate by subject — keep highest marks per subject
  const subjectMap = {};
  pool.forEach(r => {
    const key = r.subject?.toLowerCase() || "unknown";
    if (!subjectMap[key] || r.marksObtained > subjectMap[key].marksObtained) {
      subjectMap[key] = r;
    }
  });
  const unique = Object.values(subjectMap);
  const total = unique.reduce((s, r) => s + (GRADE_POINTS[r.grade] ?? 0), 0);
  return (total / unique.length).toFixed(2);
};

// Calculate CGPA from all semesters
export const calcCGPA = (results) => {
  if (!results?.length) return "0.00";
  const semesters = groupBySemester(results);
  if (!semesters.length) return "0.00";
  const total = semesters.reduce((s, sem) => s + parseFloat(calcSGPA(sem.items)), 0);
  return (total / semesters.length).toFixed(2);
};

// Group result records by semester, sorted ascending
export const groupBySemester = (results) => {
  const map = {};
  results.forEach(r => {
    const key = r.semester || 1;
    if (!map[key]) map[key] = [];
    map[key].push(r);
  });
  return Object.entries(map)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([sem, items]) => ({ sem: Number(sem), items }));
};
