export { cn } from "cn";

export function getInitials(name: string, limit = 2) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, limit)
    .map((part) => part[0])
    .join("")
    .replace(/\./g, "")
    .toUpperCase();
}
