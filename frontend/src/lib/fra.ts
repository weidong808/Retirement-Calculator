export function calculateAgeFromBirthDate(birthDate: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/** SSA full retirement age by birth year (matches backend FraCalculator). */
export function getFullRetirementAge(birthYear: number): number {
  if (birthYear <= 1937) return 65;
  if (birthYear <= 1942) return 65 + (birthYear - 1937) * (2 / 12);
  if (birthYear <= 1954) return 66;
  if (birthYear <= 1959) return 66 + (birthYear - 1954) * (2 / 12);
  return 67;
}

export function formatFra(fra: number): string {
  const wholeYears = Math.floor(fra);
  const months = Math.round((fra - wholeYears) * 12);
  if (months === 0) return String(wholeYears);
  return `${wholeYears} years, ${months} months`;
}

export function getFraFromBirthDate(birthDate: string): { fra: number; label: string } | null {
  if (!birthDate) return null;
  const year = new Date(birthDate).getFullYear();
  if (Number.isNaN(year)) return null;
  const fra = getFullRetirementAge(year);
  return { fra, label: formatFra(fra) };
}
