import { describe, it, expect } from "bun:test";
import { parseSimaiChart } from "../simai";
import {
  createChartInput,
  expectValidChart,
  expectNoteType,
  expectLane,
  snapshotPath,
  extractNotes,
  countNotes,
  findFirstNoteOfType,
  findFirstNote,
} from "./helpers";
import {
  SIMPLE_TAP,
  SIMPLE_HOLD,
  SIMPLE_SLIDE,
  EACH_TAP,
  BREAK_TAP,
  BPM_CHANGE,
  ALL_FIXTURES,
} from "./fixtures";

describe("Test Helpers", () => {
  describe("createChartInput", () => {
    it("should wrap raw simai with proper formatting", () => {
      const input = createChartInput("(120){4}1");
      expect(input).toBe("(120){4}1,E");
    });

    it("should not duplicate E marker", () => {
      const input = createChartInput("(120){4}1,E");
      expect(input).toBe("(120){4}1,E");
    });
  });

  describe("expectValidChart", () => {
    it("should validate a proper chart structure", () => {
      const result = parseSimaiChart(SIMPLE_TAP);
      expect(expectValidChart(result)).toBe(true);
    });

    it("should throw for empty array", () => {
      expect(() => expectValidChart([])).toThrow("Chart result must not be empty");
    });
  });

  describe("expectNoteType", () => {
    it("should validate tap note type", () => {
      const result = parseSimaiChart(SIMPLE_TAP);
      const noteItem = findFirstNote(result);
      expect(noteItem).toBeDefined();
      if (noteItem) {
        expect(expectNoteType(noteItem, "tap")).toBe(true);
      }
    });

    it("should validate hold note type", () => {
      const result = parseSimaiChart(SIMPLE_HOLD);
      const noteItem = findFirstNote(result);
      expect(noteItem).toBeDefined();
      if (noteItem) {
        expect(expectNoteType(noteItem, "hold")).toBe(true);
      }
    });

    it("should validate slide note type", () => {
      const result = parseSimaiChart(SIMPLE_SLIDE);
      const noteItem = findFirstNote(result);
      expect(noteItem).toBeDefined();
      if (noteItem) {
        expect(expectNoteType(noteItem, "slide")).toBe(true);
      }
    });
  });

  describe("expectLane", () => {
    it("should validate correct lane", () => {
      const result = parseSimaiChart(SIMPLE_TAP);
      const noteItem = findFirstNote(result);
      expect(noteItem).toBeDefined();
      if (noteItem) {
        expect(expectLane(noteItem, 1)).toBe(true);
      }
    });
  });

  describe("snapshotPath", () => {
    it("should generate consistent snapshot identifiers", () => {
      expect(snapshotPath("Simple Tap Test")).toBe("simple-tap-test");
      expect(snapshotPath("Complex Chart Parsing!")).toBe("complex-chart-parsing");
    });
  });

  describe("extractNotes", () => {
    it("should extract all notes including EACH arrays", () => {
      const result = parseSimaiChart(EACH_TAP);
      const notes = extractNotes(result);
      expect(notes.length).toBe(2);
    });
  });

  describe("countNotes", () => {
    it("should count total notes correctly", () => {
      const result = parseSimaiChart(EACH_TAP);
      expect(countNotes(result)).toBe(2);
    });
  });

  describe("findFirstNoteOfType", () => {
    it("should find first tap note", () => {
      const result = parseSimaiChart(SIMPLE_TAP);
      const note = findFirstNoteOfType(result, "tap");
      expect(note).toBeDefined();
      expect(note?.data.type).toBe("tap");
    });
  });
});

describe("Test Fixtures", () => {
  it("should parse all fixtures without errors", () => {
    const results = ALL_FIXTURES.map(({ name, simai }) => {
      try {
        const parsed = parseSimaiChart(simai);
        return { name, success: true, parsed };
      } catch (error) {
        return { name, success: false, error };
      }
    });

    const failures = results.filter((r) => !r.success);
    if (failures.length > 0) {
      console.error("Failed fixtures:", failures.map((f) => f.name));
    }
    expect(failures.length).toBe(0);
  });

  describe("SIMPLE_TAP", () => {
    it("should parse to a tap note on lane 1", () => {
      const result = parseSimaiChart(SIMPLE_TAP);
      expectValidChart(result);
      const note = findFirstNoteOfType(result, "tap");
      expect(note).toBeDefined();
      expect(note?.data.lane).toBe(1);
    });
  });

  describe("SIMPLE_HOLD", () => {
    it("should parse to a hold note", () => {
      const result = parseSimaiChart(SIMPLE_HOLD);
      expectValidChart(result);
      const note = findFirstNoteOfType(result, "hold");
      expect(note).toBeDefined();
      expect(note?.data.lane).toBe(1);
    });
  });

  describe("SIMPLE_SLIDE", () => {
    it("should parse to a slide note", () => {
      const result = parseSimaiChart(SIMPLE_SLIDE);
      expectValidChart(result);
      const note = findFirstNoteOfType(result, "slide");
      expect(note).toBeDefined();
      expect(note?.data.lane).toBe(1);
    });
  });

  describe("EACH_TAP", () => {
    it("should parse to two simultaneous tap notes", () => {
      const result = parseSimaiChart(EACH_TAP);
      expectValidChart(result);
      const notes = extractNotes(result);
      expect(notes.length).toBe(2);
      expect(notes[0].data.type).toBe("tap");
      expect(notes[1].data.type).toBe("tap");
    });
  });

  describe("BREAK_TAP", () => {
    it("should parse a break tap correctly", () => {
      const result = parseSimaiChart(BREAK_TAP);
      expectValidChart(result);
      const note = findFirstNoteOfType(result, "tap");
      expect(note).toBeDefined();
      expect(note?.data.lane).toBe(1);
    });
  });

  describe("BPM_CHANGE", () => {
    it("should parse multiple time signatures", () => {
      const result = parseSimaiChart(BPM_CHANGE);
      const timeSignatures = result.filter((item) => !Array.isArray(item) && item?.type === "timeSignature");
      expect(timeSignatures.length).toBeGreaterThanOrEqual(2);
    });
  });
});
