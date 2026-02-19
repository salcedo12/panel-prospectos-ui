function removeAccents(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function slugifyName(fullName) {
  return removeAccents(fullName)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function initials(fullName) {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
}

const names = [
  "Adriana Montaña Cortez",
  "Alexander Zuluaga Santacruz",
  "Angelica Acevedo",
  "Angelica Reyes",
  "Beatriz Adriana Garzón",
  "Carlos Alberto Rojas",
  "Claudia Patricia Bolaños Vega",
  "Diana Carolina Salazar Rosas",
  "Edwin Mauricio Ramirez Vega",
  "Isabel Betancourth",
  "Juana María Ávila Rojas",
  "Laura Buriticá",
  "Laura Torres",
  "Luis Carlos Machado",
  "Luisa Zuluaga",
  "Luz Adriana Franco Murillo",
  "Orlando Rodriguez",
  "Oscar Eduardo Narvaez Rojas",
  "Valentina Andrade Calderon",
];

export const advisors = names.map((name) => ({
  id: slugifyName(name),
  name,
  initials: initials(name),
  photo: `/asesores/${slugifyName(name)}.webp`,
}));
