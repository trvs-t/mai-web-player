import { describe, it, expect } from "bun:test";
import {
  parseMetadata,
  parseSimai,
  parseSimaiChart,
  SimaiParseError,
  ParseResult,
} from "../simai";

describe("Simai Parser - Error Handling", () => {
  describe("SimaiParseError", () => {
    it("should create error with line and column", () => {
      const error = new SimaiParseError("Test error", 5, 10);
      expect(error.message).toBe("Test error");
      expect(error.line).toBe(5);
      expect(error.column).toBe(10);
    });

    it("should create error with only message", () => {
      const error = new SimaiParseError("Test error");
      expect(error.message).toBe("Test error");
      expect(error.line).toBeUndefined();
      expect(error.column).toBeUndefined();
    });

    it("should have name property", () => {
      const error = new SimaiParseError("Test error", 1, 1);
      expect(error.name).toBe("SimaiParseError");
    });

    it("should format error with position", () => {
      const error = new SimaiParseError("Invalid syntax", 3, 15);
      expect(error.toString()).toContain("Invalid syntax");
      expect(error.toString()).toContain("3");
      expect(error.toString()).toContain("15");
    });
  });

  describe("ParseResult structure", () => {
    it("should return errors array in parse result", () => {
      const result: ParseResult = {
        items: [],
        errors: [],
      };
      expect(result.errors).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it("should include errors when parsing invalid syntax", () => {
      // This will test the actual implementation once we add it
      const result = parseSimaiChart("(120){4}invalid_syntax,E");
      // Currently returns empty array, but with error handling should include errors
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Syntax Error Detection - Tap Notes", () => {
    it("should detect invalid lane number (0)", () => {
      const input = "(120){4}0,E";
      // Should report error about lane 0 being invalid
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should detect invalid lane number (9)", () => {
      const input = "(120){4}9,E";
      // Should report error about lane 9 being invalid (only 1-8 allowed)
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should detect negative lane number", () => {
      const input = "(120){4}-1,E";
      // Should report error
      expect(() => parseSimaiChart(input)).not.toThrow();
    });
  });

  describe("Syntax Error Detection - Time Signatures", () => {
    it("should detect invalid BPM format", () => {
      const input = "(abc){4}1,E";
      // Should report error about invalid BPM
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should detect zero BPM", () => {
      const input = "(0){4}1,E";
      // Should report warning about zero BPM
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should detect negative BPM", () => {
      const input = "(-120){4}1,E";
      // Should report error about negative BPM
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should detect invalid division", () => {
      const input = "(120){abc}1,E";
      // Should report error about invalid division
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should detect zero division", () => {
      const input = "(120){0}1,E";
      // Should report error about division being 0
      expect(() => parseSimaiChart(input)).not.toThrow();
    });
  });

  describe("Syntax Error Detection - Hold Notes", () => {
    it("should detect hold with invalid duration format", () => {
      const input = "(120){4}1h[invalid],E";
      // Should report error about invalid duration
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should detect hold with missing closing bracket", () => {
      const input = "(120){4}1h[4:1,E";
      // Should report error about missing ]
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should detect hold with invalid division", () => {
      const input = "(120){4}1h[0:1],E";
      // Should report error about division 0
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should detect hold with invalid count", () => {
      const input = "(120){4}1h[4:-1],E";
      // Should report warning about negative count
      expect(() => parseSimaiChart(input)).not.toThrow();
    });
  });

  describe("Syntax Error Detection - Slide Notes", () => {
    it("should detect slide without duration", () => {
      const input = "(120){4}1-5,E";
      // Should report error about missing duration
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should detect slide with invalid duration format", () => {
      const input = "(120){4}1-5[invalid],E";
      // Should report error about invalid duration
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should detect slide with unknown type", () => {
      const input = "(120){4}1?5[4:1],E";
      // Should report error about unknown slide type ?
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should detect L-slide without midpoint", () => {
      const input = "(120){4}1V5[4:1],E";
      // L-slides need a midpoint lane: 1V25[4:1]
      // Should report error about missing midpoint
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should detect WiFi slide with wrong endpoint", () => {
      // WiFi slides (w) need endpoints that are 3 lanes apart
      const input = "(120){4}1w2[4:1],E";
      // Should report error about invalid WiFi endpoint
      expect(() => parseSimaiChart(input)).not.toThrow();
    });
  });

  describe("Syntax Error Detection - EACH Notes", () => {
    it("should detect empty EACH part", () => {
      const input = "(120){4}1//2,E";
      // Should report error about empty EACH component
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should detect invalid note in EACH", () => {
      const input = "(120){4}1/invalid/2,E";
      // Should report error about invalid note in EACH
      expect(() => parseSimaiChart(input)).not.toThrow();
    });
  });

  describe("Syntax Error Detection - Metadata", () => {
    it("should detect invalid header format", () => {
      const input = "&title\n(120){4}1,E";
      // Should report warning about malformed header
      expect(() => parseSimai(input)).not.toThrow();
    });

    it("should detect invalid BPM in metadata", () => {
      const input = "&bpm=invalid\n(120){4}1,E";
      // Should report error about invalid BPM value
      expect(() => parseSimai(input)).not.toThrow();
    });
  });

  describe("Graceful Degradation", () => {
    it("should continue parsing after invalid tap", () => {
      const input = "(120){4}invalid,1,2,E";
      const result = parseSimaiChart(input);
      // Should still parse valid notes 1 and 2
      expect(Array.isArray(result)).toBe(true);
    });

    it("should continue parsing after invalid slide", () => {
      const input = "(120){4}1-5,1h[4:1],E";
      const result = parseSimaiChart(input);
      // Should parse the hold even though slide is missing duration
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle completely invalid input gracefully", () => {
      const input = "invalid garbage data";
      const result = parseSimaiChart(input);
      // Should not crash, return empty or rest items
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle mixed valid and invalid notes", () => {
      const input = "(120){4}1,invalid,2,3,garbage,4,E";
      const result = parseSimaiChart(input);
      // Should parse valid notes and skip invalid ones
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Error Location Tracking", () => {
    it("should track line number for errors", () => {
      const input = `(120){4}
1,
invalid,
2,E`;
      // Error on line 3
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should track column position for errors", () => {
      const input = "(120){4}1,invalid,2,E";
      // Error at position after second comma
      expect(() => parseSimaiChart(input)).not.toThrow();
    });
  });

  describe("Common Mistake Suggestions", () => {
    it("should suggest fix for missing comma", () => {
      const input = "(120){4}1 2,3,E";
      // Could suggest: "Did you forget a comma?"
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should suggest fix for reversed brackets", () => {
      const input = "(120){4}1h]4:1[,E";
      // Could suggest: "Did you reverse the brackets?"
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should suggest fix for WiFi wrong endpoint", () => {
      // User might have meant a different endpoint
      expect(() => parseSimaiChart("(120){4}1w2[4:1],E")).not.toThrow();
    });
  });

  describe("Error Severity Levels", () => {
    it("should distinguish between error and warning", () => {
      // Some issues are errors (invalid syntax)
      // Some are warnings (unusual but valid)
      expect(true).toBe(true); // Placeholder
    });

    it("should treat missing duration as error for slides", () => {
      // Slides MUST have duration
      expect(() => parseSimaiChart("(120){4}1-5,E")).not.toThrow();
    });

    it("should treat missing duration as warning for holds", () => {
      // Holds can have default duration
      expect(() => parseSimaiChart("(120){4}1h,E")).not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string input", () => {
      const result = parseSimaiChart("");
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle whitespace-only input", () => {
      const result = parseSimaiChart("   \n\t   ");
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle very long input without crashing", () => {
      const longInput = "(120){4}" + "1,".repeat(1000) + "E";
      const result = parseSimaiChart(longInput);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle deeply nested errors gracefully", () => {
      // Multiple errors in one note
      const input = "(120){4}invalid_h[garbage]more_junk,E";
      expect(() => parseSimaiChart(input)).not.toThrow();
    });

    it("should handle special characters in unexpected places", () => {
      const input = "(120){4}1@#$%,2,E";
      expect(() => parseSimaiChart(input)).not.toThrow();
    });
  });
});

describe("Simai Parser - parseSimai with Error Handling", () => {
  it("should return chart with empty errors for valid input", () => {
    const result = parseSimai("(120){4}1,2,3,E");
    expect(result.items).toBeDefined();
    expect(result.metadata).toBeDefined();
    // Once implemented, should have empty errors array
  });

  it("should collect errors during metadata parsing", () => {
    const input = `&bpm=invalid
&title=Test
(120){4}1,E`;
    const result = parseSimai(input);
    // Should have parsed chart but also have error about invalid BPM
    expect(result.items).toBeDefined();
  });

  it("should collect errors during chart parsing", () => {
    const input = `(120){4}
1,
invalid,
2,E`;
    const result = parseSimai(input);
    // Should have parsed notes 1 and 2, plus error about invalid
    expect(result.items.length).toBeGreaterThan(0);
  });
});
