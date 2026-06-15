// SA school holiday breaks 2025 by province
// Source: Department of Basic Education official school calendar
// https://www.education.gov.za/Informationfor/ParentsandGuardians/SchoolCalendar.aspx
// Run scripts/scrape_school_holidays.py to update when a reliable HTML source is available

export const SCHOOL_HOLIDAYS_2025 = {
  GP: {
    label: 'Gauteng',
    breaks: [
      { start: '2025-01-01', end: '2025-01-14', label: 'Summer Break' },
      { start: '2025-03-22', end: '2025-04-01', label: 'Autumn Break' },
      { start: '2025-06-28', end: '2025-07-07', label: 'Winter Break' },
      { start: '2025-09-27', end: '2025-10-06', label: 'Spring Break' },
      { start: '2025-12-10', end: '2025-12-31', label: 'Summer Break' },
    ],
  },
  WC: {
    label: 'Western Cape',
    breaks: [
      { start: '2025-01-01', end: '2025-01-15', label: 'Summer Break' },
      { start: '2025-03-29', end: '2025-04-14', label: 'Autumn Break' },
      { start: '2025-06-28', end: '2025-07-14', label: 'Winter Break' },
      { start: '2025-09-27', end: '2025-10-06', label: 'Spring Break' },
      { start: '2025-12-06', end: '2025-12-31', label: 'Summer Break' },
    ],
  },
  KZN: {
    label: 'KwaZulu-Natal',
    breaks: [
      { start: '2025-01-01', end: '2025-01-14', label: 'Summer Break' },
      { start: '2025-03-22', end: '2025-04-01', label: 'Autumn Break' },
      { start: '2025-06-28', end: '2025-07-07', label: 'Winter Break' },
      { start: '2025-09-20', end: '2025-09-29', label: 'Spring Break' },
      { start: '2025-12-05', end: '2025-12-31', label: 'Summer Break' },
    ],
  },
  EC: {
    label: 'Eastern Cape',
    breaks: [
      { start: '2025-01-01', end: '2025-01-14', label: 'Summer Break' },
      { start: '2025-03-22', end: '2025-04-01', label: 'Autumn Break' },
      { start: '2025-06-28', end: '2025-07-07', label: 'Winter Break' },
      { start: '2025-09-20', end: '2025-09-29', label: 'Spring Break' },
      { start: '2025-12-05', end: '2025-12-31', label: 'Summer Break' },
    ],
  },
  LP: {
    label: 'Limpopo',
    breaks: [
      { start: '2025-01-01', end: '2025-01-14', label: 'Summer Break' },
      { start: '2025-03-22', end: '2025-04-01', label: 'Autumn Break' },
      { start: '2025-06-28', end: '2025-07-07', label: 'Winter Break' },
      { start: '2025-09-20', end: '2025-09-29', label: 'Spring Break' },
      { start: '2025-12-05', end: '2025-12-31', label: 'Summer Break' },
    ],
  },
  MP: {
    label: 'Mpumalanga',
    breaks: [
      { start: '2025-01-01', end: '2025-01-14', label: 'Summer Break' },
      { start: '2025-03-22', end: '2025-04-01', label: 'Autumn Break' },
      { start: '2025-06-28', end: '2025-07-07', label: 'Winter Break' },
      { start: '2025-09-20', end: '2025-09-29', label: 'Spring Break' },
      { start: '2025-12-05', end: '2025-12-31', label: 'Summer Break' },
    ],
  },
  NW: {
    label: 'North West',
    breaks: [
      { start: '2025-01-01', end: '2025-01-14', label: 'Summer Break' },
      { start: '2025-03-22', end: '2025-04-01', label: 'Autumn Break' },
      { start: '2025-06-28', end: '2025-07-07', label: 'Winter Break' },
      { start: '2025-09-20', end: '2025-09-29', label: 'Spring Break' },
      { start: '2025-12-05', end: '2025-12-31', label: 'Summer Break' },
    ],
  },
  NC: {
    label: 'Northern Cape',
    breaks: [
      { start: '2025-01-01', end: '2025-01-14', label: 'Summer Break' },
      { start: '2025-03-22', end: '2025-04-01', label: 'Autumn Break' },
      { start: '2025-06-28', end: '2025-07-07', label: 'Winter Break' },
      { start: '2025-09-20', end: '2025-09-29', label: 'Spring Break' },
      { start: '2025-12-05', end: '2025-12-31', label: 'Summer Break' },
    ],
  },
  FS: {
    label: 'Free State',
    breaks: [
      { start: '2025-01-01', end: '2025-01-14', label: 'Summer Break' },
      { start: '2025-03-22', end: '2025-04-01', label: 'Autumn Break' },
      { start: '2025-06-28', end: '2025-07-07', label: 'Winter Break' },
      { start: '2025-09-20', end: '2025-09-29', label: 'Spring Break' },
      { start: '2025-12-05', end: '2025-12-31', label: 'Summer Break' },
    ],
  },
}

// 2026 school holidays — estimated from DBE pattern; update when official dates are published
// Easter 2026: Good Friday Apr 3, Family Day Apr 6
export const SCHOOL_HOLIDAYS_2026 = {
  GP: {
    label: 'Gauteng',
    breaks: [
      { start: '2026-01-01', end: '2026-01-13', label: 'Summer Break' },
      { start: '2026-03-28', end: '2026-04-14', label: 'Autumn Break' },
      { start: '2026-06-27', end: '2026-07-06', label: 'Winter Break' },
      { start: '2026-09-26', end: '2026-10-05', label: 'Spring Break' },
      { start: '2026-12-09', end: '2026-12-31', label: 'Summer Break' },
    ],
  },
  WC: {
    label: 'Western Cape',
    breaks: [
      { start: '2026-01-01', end: '2026-01-14', label: 'Summer Break' },
      { start: '2026-03-28', end: '2026-04-14', label: 'Autumn Break' },
      { start: '2026-06-27', end: '2026-07-13', label: 'Winter Break' },
      { start: '2026-09-26', end: '2026-10-05', label: 'Spring Break' },
      { start: '2026-12-05', end: '2026-12-31', label: 'Summer Break' },
    ],
  },
  KZN: {
    label: 'KwaZulu-Natal',
    breaks: [
      { start: '2026-01-01', end: '2026-01-13', label: 'Summer Break' },
      { start: '2026-03-28', end: '2026-04-14', label: 'Autumn Break' },
      { start: '2026-06-27', end: '2026-07-06', label: 'Winter Break' },
      { start: '2026-09-19', end: '2026-09-28', label: 'Spring Break' },
      { start: '2026-12-04', end: '2026-12-31', label: 'Summer Break' },
    ],
  },
  EC: {
    label: 'Eastern Cape',
    breaks: [
      { start: '2026-01-01', end: '2026-01-13', label: 'Summer Break' },
      { start: '2026-03-28', end: '2026-04-14', label: 'Autumn Break' },
      { start: '2026-06-27', end: '2026-07-06', label: 'Winter Break' },
      { start: '2026-09-19', end: '2026-09-28', label: 'Spring Break' },
      { start: '2026-12-04', end: '2026-12-31', label: 'Summer Break' },
    ],
  },
  LP: {
    label: 'Limpopo',
    breaks: [
      { start: '2026-01-01', end: '2026-01-13', label: 'Summer Break' },
      { start: '2026-03-28', end: '2026-04-14', label: 'Autumn Break' },
      { start: '2026-06-27', end: '2026-07-06', label: 'Winter Break' },
      { start: '2026-09-19', end: '2026-09-28', label: 'Spring Break' },
      { start: '2026-12-04', end: '2026-12-31', label: 'Summer Break' },
    ],
  },
  MP: {
    label: 'Mpumalanga',
    breaks: [
      { start: '2026-01-01', end: '2026-01-13', label: 'Summer Break' },
      { start: '2026-03-28', end: '2026-04-14', label: 'Autumn Break' },
      { start: '2026-06-27', end: '2026-07-06', label: 'Winter Break' },
      { start: '2026-09-19', end: '2026-09-28', label: 'Spring Break' },
      { start: '2026-12-04', end: '2026-12-31', label: 'Summer Break' },
    ],
  },
  NW: {
    label: 'North West',
    breaks: [
      { start: '2026-01-01', end: '2026-01-13', label: 'Summer Break' },
      { start: '2026-03-28', end: '2026-04-14', label: 'Autumn Break' },
      { start: '2026-06-27', end: '2026-07-06', label: 'Winter Break' },
      { start: '2026-09-19', end: '2026-09-28', label: 'Spring Break' },
      { start: '2026-12-04', end: '2026-12-31', label: 'Summer Break' },
    ],
  },
  NC: {
    label: 'Northern Cape',
    breaks: [
      { start: '2026-01-01', end: '2026-01-13', label: 'Summer Break' },
      { start: '2026-03-28', end: '2026-04-14', label: 'Autumn Break' },
      { start: '2026-06-27', end: '2026-07-06', label: 'Winter Break' },
      { start: '2026-09-19', end: '2026-09-28', label: 'Spring Break' },
      { start: '2026-12-04', end: '2026-12-31', label: 'Summer Break' },
    ],
  },
  FS: {
    label: 'Free State',
    breaks: [
      { start: '2026-01-01', end: '2026-01-13', label: 'Summer Break' },
      { start: '2026-03-28', end: '2026-04-14', label: 'Autumn Break' },
      { start: '2026-06-27', end: '2026-07-06', label: 'Winter Break' },
      { start: '2026-09-19', end: '2026-09-28', label: 'Spring Break' },
      { start: '2026-12-04', end: '2026-12-31', label: 'Summer Break' },
    ],
  },
}

// 2027 school holidays — estimated from DBE pattern; Easter 2027: Good Friday Mar 26
export const SCHOOL_HOLIDAYS_2027 = {
  GP: {
    label: 'Gauteng',
    breaks: [
      { start: '2027-01-01', end: '2027-01-13', label: 'Summer Break' },
      { start: '2027-03-20', end: '2027-04-06', label: 'Autumn Break' },
      { start: '2027-06-26', end: '2027-07-05', label: 'Winter Break' },
      { start: '2027-09-25', end: '2027-10-04', label: 'Spring Break' },
      { start: '2027-12-09', end: '2027-12-31', label: 'Summer Break' },
    ],
  },
  WC: {
    label: 'Western Cape',
    breaks: [
      { start: '2027-01-01', end: '2027-01-14', label: 'Summer Break' },
      { start: '2027-03-20', end: '2027-04-13', label: 'Autumn Break' },
      { start: '2027-06-26', end: '2027-07-12', label: 'Winter Break' },
      { start: '2027-09-25', end: '2027-10-04', label: 'Spring Break' },
      { start: '2027-12-05', end: '2027-12-31', label: 'Summer Break' },
    ],
  },
  KZN: {
    label: 'KwaZulu-Natal',
    breaks: [
      { start: '2027-01-01', end: '2027-01-13', label: 'Summer Break' },
      { start: '2027-03-20', end: '2027-04-06', label: 'Autumn Break' },
      { start: '2027-06-26', end: '2027-07-05', label: 'Winter Break' },
      { start: '2027-09-18', end: '2027-09-27', label: 'Spring Break' },
      { start: '2027-12-04', end: '2027-12-31', label: 'Summer Break' },
    ],
  },
  EC: {
    label: 'Eastern Cape',
    breaks: [
      { start: '2027-01-01', end: '2027-01-13', label: 'Summer Break' },
      { start: '2027-03-20', end: '2027-04-06', label: 'Autumn Break' },
      { start: '2027-06-26', end: '2027-07-05', label: 'Winter Break' },
      { start: '2027-09-18', end: '2027-09-27', label: 'Spring Break' },
      { start: '2027-12-04', end: '2027-12-31', label: 'Summer Break' },
    ],
  },
  LP: {
    label: 'Limpopo',
    breaks: [
      { start: '2027-01-01', end: '2027-01-13', label: 'Summer Break' },
      { start: '2027-03-20', end: '2027-04-06', label: 'Autumn Break' },
      { start: '2027-06-26', end: '2027-07-05', label: 'Winter Break' },
      { start: '2027-09-18', end: '2027-09-27', label: 'Spring Break' },
      { start: '2027-12-04', end: '2027-12-31', label: 'Summer Break' },
    ],
  },
  MP: {
    label: 'Mpumalanga',
    breaks: [
      { start: '2027-01-01', end: '2027-01-13', label: 'Summer Break' },
      { start: '2027-03-20', end: '2027-04-06', label: 'Autumn Break' },
      { start: '2027-06-26', end: '2027-07-05', label: 'Winter Break' },
      { start: '2027-09-18', end: '2027-09-27', label: 'Spring Break' },
      { start: '2027-12-04', end: '2027-12-31', label: 'Summer Break' },
    ],
  },
  NW: {
    label: 'North West',
    breaks: [
      { start: '2027-01-01', end: '2027-01-13', label: 'Summer Break' },
      { start: '2027-03-20', end: '2027-04-06', label: 'Autumn Break' },
      { start: '2027-06-26', end: '2027-07-05', label: 'Winter Break' },
      { start: '2027-09-18', end: '2027-09-27', label: 'Spring Break' },
      { start: '2027-12-04', end: '2027-12-31', label: 'Summer Break' },
    ],
  },
  NC: {
    label: 'Northern Cape',
    breaks: [
      { start: '2027-01-01', end: '2027-01-13', label: 'Summer Break' },
      { start: '2027-03-20', end: '2027-04-06', label: 'Autumn Break' },
      { start: '2027-06-26', end: '2027-07-05', label: 'Winter Break' },
      { start: '2027-09-18', end: '2027-09-27', label: 'Spring Break' },
      { start: '2027-12-04', end: '2027-12-31', label: 'Summer Break' },
    ],
  },
  FS: {
    label: 'Free State',
    breaks: [
      { start: '2027-01-01', end: '2027-01-13', label: 'Summer Break' },
      { start: '2027-03-20', end: '2027-04-06', label: 'Autumn Break' },
      { start: '2027-06-26', end: '2027-07-05', label: 'Winter Break' },
      { start: '2027-09-18', end: '2027-09-27', label: 'Spring Break' },
      { start: '2027-12-04', end: '2027-12-31', label: 'Summer Break' },
    ],
  },
}

// 2028 school holidays — estimated from DBE pattern; Easter 2028: Good Friday Apr 14
export const SCHOOL_HOLIDAYS_2028 = {
  GP: {
    label: 'Gauteng',
    breaks: [
      { start: '2028-01-01', end: '2028-01-12', label: 'Summer Break' },
      { start: '2028-04-07', end: '2028-04-23', label: 'Autumn Break' },
      { start: '2028-06-24', end: '2028-07-03', label: 'Winter Break' },
      { start: '2028-09-23', end: '2028-10-02', label: 'Spring Break' },
      { start: '2028-12-07', end: '2028-12-31', label: 'Summer Break' },
    ],
  },
  WC: {
    label: 'Western Cape',
    breaks: [
      { start: '2028-01-01', end: '2028-01-13', label: 'Summer Break' },
      { start: '2028-04-07', end: '2028-04-23', label: 'Autumn Break' },
      { start: '2028-06-24', end: '2028-07-10', label: 'Winter Break' },
      { start: '2028-09-23', end: '2028-10-02', label: 'Spring Break' },
      { start: '2028-12-02', end: '2028-12-31', label: 'Summer Break' },
    ],
  },
  KZN: {
    label: 'KwaZulu-Natal',
    breaks: [
      { start: '2028-01-01', end: '2028-01-12', label: 'Summer Break' },
      { start: '2028-04-07', end: '2028-04-23', label: 'Autumn Break' },
      { start: '2028-06-24', end: '2028-07-03', label: 'Winter Break' },
      { start: '2028-09-16', end: '2028-09-25', label: 'Spring Break' },
      { start: '2028-12-02', end: '2028-12-31', label: 'Summer Break' },
    ],
  },
  EC: {
    label: 'Eastern Cape',
    breaks: [
      { start: '2028-01-01', end: '2028-01-12', label: 'Summer Break' },
      { start: '2028-04-07', end: '2028-04-23', label: 'Autumn Break' },
      { start: '2028-06-24', end: '2028-07-03', label: 'Winter Break' },
      { start: '2028-09-16', end: '2028-09-25', label: 'Spring Break' },
      { start: '2028-12-02', end: '2028-12-31', label: 'Summer Break' },
    ],
  },
  LP: {
    label: 'Limpopo',
    breaks: [
      { start: '2028-01-01', end: '2028-01-12', label: 'Summer Break' },
      { start: '2028-04-07', end: '2028-04-23', label: 'Autumn Break' },
      { start: '2028-06-24', end: '2028-07-03', label: 'Winter Break' },
      { start: '2028-09-16', end: '2028-09-25', label: 'Spring Break' },
      { start: '2028-12-02', end: '2028-12-31', label: 'Summer Break' },
    ],
  },
  MP: {
    label: 'Mpumalanga',
    breaks: [
      { start: '2028-01-01', end: '2028-01-12', label: 'Summer Break' },
      { start: '2028-04-07', end: '2028-04-23', label: 'Autumn Break' },
      { start: '2028-06-24', end: '2028-07-03', label: 'Winter Break' },
      { start: '2028-09-16', end: '2028-09-25', label: 'Spring Break' },
      { start: '2028-12-02', end: '2028-12-31', label: 'Summer Break' },
    ],
  },
  NW: {
    label: 'North West',
    breaks: [
      { start: '2028-01-01', end: '2028-01-12', label: 'Summer Break' },
      { start: '2028-04-07', end: '2028-04-23', label: 'Autumn Break' },
      { start: '2028-06-24', end: '2028-07-03', label: 'Winter Break' },
      { start: '2028-09-16', end: '2028-09-25', label: 'Spring Break' },
      { start: '2028-12-02', end: '2028-12-31', label: 'Summer Break' },
    ],
  },
  NC: {
    label: 'Northern Cape',
    breaks: [
      { start: '2028-01-01', end: '2028-01-12', label: 'Summer Break' },
      { start: '2028-04-07', end: '2028-04-23', label: 'Autumn Break' },
      { start: '2028-06-24', end: '2028-07-03', label: 'Winter Break' },
      { start: '2028-09-16', end: '2028-09-25', label: 'Spring Break' },
      { start: '2028-12-02', end: '2028-12-31', label: 'Summer Break' },
    ],
  },
  FS: {
    label: 'Free State',
    breaks: [
      { start: '2028-01-01', end: '2028-01-12', label: 'Summer Break' },
      { start: '2028-04-07', end: '2028-04-23', label: 'Autumn Break' },
      { start: '2028-06-24', end: '2028-07-03', label: 'Winter Break' },
      { start: '2028-09-16', end: '2028-09-25', label: 'Spring Break' },
      { start: '2028-12-02', end: '2028-12-31', label: 'Summer Break' },
    ],
  },
}

const HOLIDAYS_BY_YEAR = {
  2025: SCHOOL_HOLIDAYS_2025,
  2026: SCHOOL_HOLIDAYS_2026,
  2027: SCHOOL_HOLIDAYS_2027,
  2028: SCHOOL_HOLIDAYS_2028,
}

export const PROVINCES = Object.entries(SCHOOL_HOLIDAYS_2025).map(
  ([code, { label }]) => ({ code, label })
)

function getYearData(year) {
  return HOLIDAYS_BY_YEAR[year] ?? HOLIDAYS_BY_YEAR[2026]
}

export function isSchoolHoliday(dateStr, provinceCode, year) {
  const yearData = getYearData(year ?? parseInt(dateStr.slice(0, 4), 10))
  const province = yearData[provinceCode]
  if (!province) return false
  const d = new Date(dateStr)
  return province.breaks.some((b) => {
    const start = new Date(b.start)
    const end = new Date(b.end)
    return d >= start && d <= end
  })
}

export function getSchoolBreakLabel(dateStr, provinceCode, year) {
  const yearData = getYearData(year ?? parseInt(dateStr.slice(0, 4), 10))
  const province = yearData[provinceCode]
  if (!province) return null
  const d = new Date(dateStr)
  return (
    province.breaks.find((b) => {
      const start = new Date(b.start)
      const end = new Date(b.end)
      return d >= start && d <= end
    })?.label ?? null
  )
}
