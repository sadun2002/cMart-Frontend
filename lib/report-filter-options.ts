/**
 * Shared helper functions to generate full dropdown options
 * for Report Period filters across all report pages.
 */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Returns year options from 2020 to current year */
export const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years: { value: string; label: string }[] = [];
  for (let y = currentYear; y >= 2020; y--) {
    years.push({ value: String(y), label: String(y) });
  }
  return years;
};

/** Returns all 12 month options for a given year */
export const getMonthOptions = (year: string) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed
  const yr = parseInt(year, 10);
  
  return MONTH_NAMES.map((name, i) => ({
    value: `${year}-${String(i + 1).padStart(2, '0')}`,
    label: `${name} ${year}`,
  })).filter((_, i) => yr < currentYear || (yr === currentYear && i <= currentMonth));
};

/** Returns all 52 week options for a given year with date ranges */
export const getWeekOptions = (year: string) => {
  const weeks: { value: string; label: string }[] = [];
  const yr = parseInt(year, 10);
  const now = new Date();

  for (let w = 1; w <= 52; w++) {
    // ISO-style: Week 1 starts on the Monday nearest Jan 1
    const jan4 = new Date(yr, 0, 4); // Jan 4 is always in ISO week 1
    const dayOfWeek = jan4.getDay() || 7; // convert Sunday=0 to 7
    const week1Monday = new Date(jan4);
    week1Monday.setDate(jan4.getDate() - dayOfWeek + 1);

    const start = new Date(week1Monday);
    start.setDate(week1Monday.getDate() + (w - 1) * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    // Skip future weeks
    if (start > now) break;

    const fmt = (d: Date) => `${MONTH_SHORT[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
    weeks.push({
      value: `${year}-W${String(w).padStart(2, '0')}`,
      label: `Week ${w} (${fmt(start)} - ${fmt(end)})`,
    });
  }
  return weeks;
};

/** Returns 4 quarter options for a given year */
export const getQuarterOptions = (year: string) => {
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
  const yr = parseInt(year, 10);

  const quarters = [
    { value: `${year}-Q1`, label: `Q1 — Jan to Mar ${year}`, q: 1 },
    { value: `${year}-Q2`, label: `Q2 — Apr to Jun ${year}`, q: 2 },
    { value: `${year}-Q3`, label: `Q3 — Jul to Sep ${year}`, q: 3 },
    { value: `${year}-Q4`, label: `Q4 — Oct to Dec ${year}`, q: 4 },
  ];

  return quarters.filter(q => yr < currentYear || (yr === currentYear && q.q <= currentQuarter)).map(({ q, ...rest }) => rest);
};

/** Returns 2 half-year options for a given year */
export const getHalfYearOptions = (year: string) => {
  const currentYear = new Date().getFullYear();
  const currentHalf = Math.floor(new Date().getMonth() / 6) + 1;
  const yr = parseInt(year, 10);

  const halves = [
    { value: `${year}-H1`, label: `H1 — Jan to Jun ${year}`, h: 1 },
    { value: `${year}-H2`, label: `H2 — Jul to Dec ${year}`, h: 2 },
  ];

  return halves.filter(h => yr < currentYear || (yr === currentYear && h.h <= currentHalf)).map(({ h, ...rest }) => rest);
};
