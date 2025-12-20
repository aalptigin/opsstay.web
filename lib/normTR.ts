export function normTR(s: string = "") {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[âáàä]/g, "a")
    .replace(/[îíìï]/g, "i")
    .replace(/[ûúùü]/g, "u");
}