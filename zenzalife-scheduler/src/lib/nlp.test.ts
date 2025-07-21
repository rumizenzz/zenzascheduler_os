import { describe, it, expect } from "vitest";
import { parseNaturalTask } from "./nlp";

describe("parseNaturalTask", () => {
  it("parses basic phrase", () => {
    const result = parseNaturalTask(
      "Dentist at 2pm tomorrow",
      new Date("2024-05-01T09:00:00Z"),
    );
    expect(result).not.toBeNull();
    expect(result?.title).toBe("Dentist");
    expect(result?.start.getHours()).toBe(14);
  });

  it("parses start and end time", () => {
    const res = parseNaturalTask(
      "Walk at 4:30 pm today and stop at 5:30 pm",
      new Date("2024-05-01T09:00:00Z"),
    );
    expect(res).not.toBeNull();
    expect(res?.title).toBe("Walk");
    expect(res?.start.getHours()).toBe(16);
    expect(res?.end?.getHours()).toBe(17);
  });

  it("handles spelled numbers and synonyms", () => {
    const res = parseNaturalTask(
      "Meeting at two thirty tomorrow till four",
      new Date("2024-05-01T09:00:00Z"),
    );
    expect(res).not.toBeNull();
    expect(res?.title).toBe("Meeting");
    expect(res?.start.getHours()).toBe(14);
    expect(res?.end?.getHours()).toBe(16);
  });
});
