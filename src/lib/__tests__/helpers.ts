import type { Chart, ChartItem, NoteData } from "../chart";

export type ParsedChartResult = Chart["items"];

export function createChartInput(simai: string): string {
  const trimmed = simai.trim();
  const withEndMarker = trimmed.endsWith("E") ? trimmed : `${trimmed},E`;
  return withEndMarker;
}

export function expectValidChart(result: ParsedChartResult): boolean {
  if (!Array.isArray(result)) {
    throw new Error("Chart result must be an array");
  }
  if (result.length === 0) {
    throw new Error("Chart result must not be empty");
  }
  const firstItem = result[0];
  if (Array.isArray(firstItem) || firstItem?.type !== "timeSignature") {
    throw new Error("Chart must start with a time signature");
  }
  return true;
}

export function isNoteItem(
  item: ChartItem | { type: "note"; data: NoteData }[],
): item is { type: "note"; data: NoteData } {
  return !Array.isArray(item) && item.type === "note";
}

export function findFirstNote(
  result: ParsedChartResult,
): { type: "note"; data: NoteData } | undefined {
  for (const item of result) {
    if (Array.isArray(item)) {
      const note = item.find((subItem) => subItem.type === "note");
      if (note) return note;
    } else if (item.type === "note") {
      return item;
    }
  }
  return undefined;
}

export function expectNoteType(
  item: { type: "note"; data: NoteData },
  type: "tap" | "hold" | "slide",
): boolean {
  if (item.data.type !== type) {
    throw new Error(`Expected note type '${type}' but got '${item.data.type}'`);
  }
  return true;
}

export function expectLane(
  item: { type: "note"; data: NoteData },
  lane: number,
): boolean {
  if (item.data.lane !== lane) {
    throw new Error(`Expected lane ${lane} but got lane ${item.data.lane}`);
  }
  return true;
}

export function snapshotPath(testName: string): string {
  return testName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function extractNotes(
  result: ParsedChartResult,
): Array<{ type: "note"; data: NoteData }> {
  const notes: Array<{ type: "note"; data: NoteData }> = [];
  for (const item of result) {
    if (Array.isArray(item)) {
      for (const subItem of item) {
        if (subItem.type === "note") {
          notes.push(subItem);
        }
      }
    } else if (item.type === "note") {
      notes.push(item);
    }
  }
  return notes;
}

export function countNotes(result: ParsedChartResult): number {
  return extractNotes(result).length;
}

export function findFirstNoteOfType(
  result: ParsedChartResult,
  type: "tap" | "hold" | "slide",
): { type: "note"; data: NoteData } | undefined {
  const notes = extractNotes(result);
  return notes.find((note) => note.data.type === type);
}

export function expectValidMetadata(chart: Chart): boolean {
  if (!chart.metadata) {
    throw new Error("Chart must have metadata");
  }
  if (typeof chart.metadata.title !== "string") {
    throw new Error("Chart metadata must have a title string");
  }
  return true;
}
