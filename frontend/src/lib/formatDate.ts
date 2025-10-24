export function formatDateISOToMMDDYYYY(input?: string | Date | null) {
  if (!input) return "";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

// Backwards-compatible alias: older imports may use the previous name.
export const formatDateISOToDDMMYYYY = formatDateISOToMMDDYYYY;

export default formatDateISOToMMDDYYYY;
