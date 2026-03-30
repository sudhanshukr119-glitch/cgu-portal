export const GRADE_POINTS = { "A+": 10, "A": 9, "B+": 8, "B": 7, "C+": 6, "C": 5, "F": 0 };

// Average grade points across all result records (each subject weighted equally)
export const calcSGPA = (results) => {
  if (!results?.length) return "0.00";
  const total = results.reduce((s, r) => s + (GRADE_POINTS[r.grade] ?? 0), 0);
  return (total / results.length).toFixed(2);
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
