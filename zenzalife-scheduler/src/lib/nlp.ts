import * as chrono from "chrono-node";

export interface ParsedTask {
  title: string;
  start: Date;
  end?: Date;
}

function replaceWordTimes(text: string) {
  const hourMap: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
  };
  const minuteMap: Record<string, number> = {
    fifteen: 15,
    "forty five": 45,
    "forty-five": 45,
    thirty: 30,
    half: 30,
    quarter: 15,
  };

  return text
    .replace(
      new RegExp(
        `\\b(${Object.keys(hourMap).join("|")})\\s+(${Object.keys(minuteMap).join("|")})\\b`,
        "gi",
      ),
      (_, h: string, m: string) =>
        `${hourMap[h.toLowerCase()]}:${minuteMap[m.toLowerCase()]}`,
    )
    .replace(
      new RegExp(`\\b(${Object.keys(hourMap).join("|")})\\s*(am|pm)?\\b`, "gi"),
      (_, h: string, meridiem?: string) =>
        `${hourMap[h.toLowerCase()]}${meridiem ? " " + meridiem : ""}`,
    );
}

export function parseNaturalTask(
  input: string,
  baseDate: Date = new Date(),
): ParsedTask | null {
  let normalized = input.toLowerCase();
  normalized = replaceWordTimes(normalized);
  normalized = normalized
    .replace(/\b(till|til|until|through)\b/g, "to")
    .replace(/\b(end|stop)\b/g, "")
    .replace(/\b@/g, " at ")
    .replace(/\b(\d{1,2}:\d{2})(?!\s*(am|pm))/g, "$1 pm")
    .replace(/\bto\s+(\d{1,2})(?!\d)/g, (_m, h) => `to ${h} pm`);
  const results = chrono.parse(normalized, baseDate);
  if (!results.length) return null;

  const start = results[0].start.date();
  let end = results[0].end?.date();

  if (!end && results.length > 1) {
    end = results[1].start.date();
  }

  let title = normalized;
  for (const r of results) {
    title = title.replace(r.text, " ");
  }
  title = title
    .replace(/\b(at|on|from|to|until|start(?:ing)?|stop|end|and)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (title) title = title.charAt(0).toUpperCase() + title.slice(1);

  return {
    title: title || "Untitled Task",
    start,
    end,
  };
}
