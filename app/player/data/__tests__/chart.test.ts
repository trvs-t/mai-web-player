import { describe, it, expect } from "bun:test";
import type {
  Chart,
  ChartItem,
  NoteData,
  TapChartData,
  HoldChartData,
  SlideChartData,
  SlideType,
  DurationInBpm,
  TimeSignature,
  Rest,
  ChartMetadata,
} from "../chart";
import {
  validateChart,
  tapItem,
  holdItem,
  slideItem,
  restItem,
  timeSignatureItem,
  testChart,
} from "../chart";

describe("Chart Type Validation", () => {
  describe("TapChartData", () => {
    it("should create valid tap data with correct structure", () => {
      const tap: TapChartData = { type: "tap", lane: 1 };
      expect(tap.type).toBe("tap");
      expect(tap.lane).toBe(1);
    });

    it("should allow any lane number 1-8", () => {
      for (let lane = 1; lane <= 8; lane++) {
        const tap: TapChartData = { type: "tap", lane };
        expect(tap.lane).toBe(lane);
      }
    });

    it("should have type property discriminant", () => {
      const tap: TapChartData = { type: "tap", lane: 5 };
      expect(tap.type).toBeDefined();
      expect(typeof tap.type).toBe("string");
    });

    it("should create tap via helper function", () => {
      const item = tapItem(3);
      expect(item.type).toBe("note");
      expect(item.data.type).toBe("tap");
      expect(item.data.lane).toBe(3);
    });
  });

  describe("HoldChartData", () => {
    it("should create valid hold data with required fields", () => {
      const hold: HoldChartData = {
        type: "hold",
        lane: 2,
        duration: { division: 4, divisionCount: 2 },
      };
      expect(hold.type).toBe("hold");
      expect(hold.lane).toBe(2);
      expect(hold.duration.division).toBe(4);
      expect(hold.duration.divisionCount).toBe(2);
    });

    it("should support optional bpm in duration", () => {
      const hold: HoldChartData = {
        type: "hold",
        lane: 1,
        duration: { bpm: 150, division: 8, divisionCount: 4 },
      };
      expect(hold.duration.bpm).toBe(150);
    });

    it("should create hold via helper function", () => {
      const duration: DurationInBpm = { division: 4, divisionCount: 2 };
      const item = holdItem(5, duration);
      expect(item.type).toBe("note");
      expect(item.data.type).toBe("hold");
      expect(item.data.lane).toBe(5);
      expect(item.data.duration).toEqual(duration);
    });

    it("should have type property discriminant", () => {
      const hold: HoldChartData = {
        type: "hold",
        lane: 1,
        duration: { division: 4, divisionCount: 1 },
      };
      expect(hold.type).toBe("hold");
    });
  });

  describe("SlideChartData", () => {
    it("should create valid slide data with all required fields", () => {
      const slide: SlideChartData = {
        type: "slide",
        lane: 1,
        duration: { division: 4, divisionCount: 2 },
        slideType: "Straight",
        direction: "cw",
        destinationLane: 5,
      };
      expect(slide.type).toBe("slide");
      expect(slide.slideType).toBe("Straight");
      expect(slide.direction).toBe("cw");
      expect(slide.destinationLane).toBe(5);
    });

    it("should support all SlideType enum values", () => {
      const slideTypes: SlideType[] = [
        "CUP",
        "Circle",
        "U",
        "L",
        "Thunder",
        "V",
        "Straight",
      ];
      slideTypes.forEach((slideType) => {
        const slide: SlideChartData = {
          type: "slide",
          lane: 1,
          duration: { division: 4, divisionCount: 1 },
          slideType,
          direction: "cw",
          destinationLane: 5,
        };
        expect(slide.slideType).toBe(slideType);
      });
    });

    it("should support both direction values", () => {
      const slideCw: SlideChartData = {
        type: "slide",
        lane: 1,
        duration: { division: 4, divisionCount: 1 },
        slideType: "Circle",
        direction: "cw",
        destinationLane: 5,
      };
      expect(slideCw.direction).toBe("cw");

      const slideCcw: SlideChartData = {
        type: "slide",
        lane: 1,
        duration: { division: 4, divisionCount: 1 },
        slideType: "Circle",
        direction: "ccw",
        destinationLane: 5,
      };
      expect(slideCcw.direction).toBe("ccw");
    });

    it("should create slide via helper function", () => {
      const duration: DurationInBpm = { division: 8, divisionCount: 4 };
      const item = slideItem(1, duration, "CUP", "cw", 5);
      expect(item.type).toBe("note");
      expect(item.data.type).toBe("slide");
      expect(item.data.lane).toBe(1);
      expect(item.data.slideType).toBe("CUP");
      expect(item.data.direction).toBe("cw");
      expect(item.data.destinationLane).toBe(5);
    });

    it("should have type property discriminant", () => {
      const slide: SlideChartData = {
        type: "slide",
        lane: 1,
        duration: { division: 4, divisionCount: 1 },
        slideType: "Straight",
        direction: "cw",
        destinationLane: 5,
      };
      expect(slide.type).toBe("slide");
    });
  });

  describe("NoteData Union Type", () => {
    it("should discriminate tap from NoteData union", () => {
      const note: NoteData = { type: "tap", lane: 1 };
      expect(note.type).toBe("tap");
      if (note.type === "tap") {
        expect(note.lane).toBe(1);
      }
    });

    it("should discriminate hold from NoteData union", () => {
      const note: NoteData = {
        type: "hold",
        lane: 1,
        duration: { division: 4, divisionCount: 2 },
      };
      expect(note.type).toBe("hold");
      if (note.type === "hold") {
        expect(note.duration).toBeDefined();
      }
    });

    it("should discriminate slide from NoteData union", () => {
      const note: NoteData = {
        type: "slide",
        lane: 1,
        duration: { division: 4, divisionCount: 2 },
        slideType: "Straight",
        direction: "cw",
        destinationLane: 5,
      };
      expect(note.type).toBe("slide");
      if (note.type === "slide") {
        expect(note.slideType).toBe("Straight");
      }
    });
  });

  describe("DurationInBpm", () => {
    it("should create duration with required fields", () => {
      const duration: DurationInBpm = { division: 4, divisionCount: 2 };
      expect(duration.division).toBe(4);
      expect(duration.divisionCount).toBe(2);
      expect(duration.bpm).toBeUndefined();
    });

    it("should create duration with optional bpm", () => {
      const duration: DurationInBpm = { bpm: 180, division: 8, divisionCount: 4 };
      expect(duration.bpm).toBe(180);
      expect(duration.division).toBe(8);
      expect(duration.divisionCount).toBe(4);
    });
  });

  describe("TimeSignature", () => {
    it("should create time signature with required fields", () => {
      const ts: TimeSignature = { division: 4 };
      expect(ts.division).toBe(4);
      expect(ts.bpm).toBeUndefined();
    });

    it("should create time signature with optional bpm", () => {
      const ts: TimeSignature = { bpm: 120, division: 4 };
      expect(ts.bpm).toBe(120);
      expect(ts.division).toBe(4);
    });

    it("should create time signature via helper function with number args", () => {
      const item = timeSignatureItem(120, 4);
      expect(item.type).toBe("timeSignature");
      expect(item.data.bpm).toBe(120);
      expect(item.data.division).toBe(4);
    });

    it("should create time signature via helper function with string args", () => {
      const item = timeSignatureItem("150", "8");
      expect(item.type).toBe("timeSignature");
      expect(item.data.bpm).toBe(150);
      expect(item.data.division).toBe(8);
    });

    it("should handle undefined bpm in helper function", () => {
      const item = timeSignatureItem(undefined, 4);
      expect(item.type).toBe("timeSignature");
      expect(item.data.bpm).toBeUndefined();
      expect(item.data.division).toBe(4);
    });
  });

  describe("Rest", () => {
    it("should create rest with divisionCount", () => {
      const rest: Rest = { divisionCount: 4 };
      expect(rest.divisionCount).toBe(4);
    });

    it("should create rest via helper function", () => {
      const item = restItem(8);
      expect(item.type).toBe("rest");
      expect(item.data.divisionCount).toBe(8);
    });
  });

  describe("ChartItem Union Type", () => {
    it("should discriminate note item", () => {
      const item: ChartItem = {
        type: "note",
        data: { type: "tap", lane: 1 },
      };
      expect(item.type).toBe("note");
      if (item.type === "note") {
        expect(item.data.type).toBe("tap");
      }
    });

    it("should discriminate rest item", () => {
      const item: ChartItem = {
        type: "rest",
        data: { divisionCount: 4 },
      };
      expect(item.type).toBe("rest");
      if (item.type === "rest") {
        expect(item.data.divisionCount).toBe(4);
      }
    });

    it("should discriminate timeSignature item", () => {
      const item: ChartItem = {
        type: "timeSignature",
        data: { bpm: 120, division: 4 },
      };
      expect(item.type).toBe("timeSignature");
      if (item.type === "timeSignature") {
        expect(item.data.bpm).toBe(120);
      }
    });
  });

  describe("ChartMetadata", () => {
    it("should create metadata with title", () => {
      const metadata: ChartMetadata = { title: "Test Song" };
      expect(metadata.title).toBe("Test Song");
    });
  });

  describe("Chart Interface", () => {
    it("should create valid chart structure", () => {
      const chart: Chart = {
        metadata: { title: "Test" },
        items: [
          { type: "timeSignature", data: { division: 4 } },
          { type: "note", data: { type: "tap", lane: 1 } },
        ],
      };
      expect(chart.metadata.title).toBe("Test");
      expect(chart.items.length).toBe(2);
    });

    it("should support array of notes for EACH notation", () => {
      const chart: Chart = {
        metadata: { title: "Test" },
        items: [
          { type: "timeSignature", data: { division: 4 } },
          [
            { type: "note", data: { type: "tap", lane: 1 } },
            { type: "note", data: { type: "tap", lane: 5 } },
          ],
        ],
      };
      expect(Array.isArray(chart.items[1])).toBe(true);
    });

    it("should validate testChart structure", () => {
      expect(testChart.metadata).toBeDefined();
      expect(testChart.metadata.title).toBe("Test Chart");
      expect(Array.isArray(testChart.items)).toBe(true);
      expect(testChart.items.length).toBeGreaterThan(0);
    });
  });

  describe("validateChart function", () => {
    it("should return true for valid chart with time signature first", () => {
      const chart: Chart = {
        metadata: { title: "Test" },
        items: [
          { type: "timeSignature", data: { bpm: 120, division: 4 } },
          { type: "note", data: { type: "tap", lane: 1 } },
        ],
      };
      expect(validateChart(chart)).toBe(true);
    });

    it("should return false when first item is not timeSignature", () => {
      const chart: Chart = {
        metadata: { title: "Test" },
        items: [
          { type: "note", data: { type: "tap", lane: 1 } },
        ],
      };
      expect(validateChart(chart)).toBe(false);
    });

    it("should return false when first item is array", () => {
      const chart: Chart = {
        metadata: { title: "Test" },
        items: [
          [
            { type: "note", data: { type: "tap", lane: 1 } },
          ],
        ],
      };
      expect(validateChart(chart)).toBe(false);
    });
  });

  describe("Runtime type guards", () => {
    it("should detect valid TapChartData shape", () => {
      const obj = { type: "tap", lane: 1 };
      const isTap = obj.type === "tap" && typeof obj.lane === "number";
      expect(isTap).toBe(true);
    });

    it("should detect invalid tap data missing lane", () => {
      const obj = { type: "tap" };
      const isTap = obj.type === "tap" && typeof (obj as any).lane === "number";
      expect(isTap).toBe(false);
    });

    it("should detect valid HoldChartData shape", () => {
      const obj = {
        type: "hold",
        lane: 1,
        duration: { division: 4, divisionCount: 2 },
      };
      const isHold =
        obj.type === "hold" &&
        typeof obj.lane === "number" &&
        obj.duration &&
        typeof obj.duration.division === "number";
      expect(isHold).toBe(true);
    });

    it("should detect valid SlideChartData shape", () => {
      const obj = {
        type: "slide",
        lane: 1,
        duration: { division: 4, divisionCount: 2 },
        slideType: "Straight",
        direction: "cw",
        destinationLane: 5,
      };
      const isSlide =
        obj.type === "slide" &&
        typeof obj.lane === "number" &&
        typeof obj.destinationLane === "number" &&
        ["cw", "ccw"].includes(obj.direction);
      expect(isSlide).toBe(true);
    });

    it("should handle null values safely", () => {
      const obj = null;
      const isValid = obj && typeof obj === "object";
      expect(isValid).toBeFalsy();
    });

    it("should handle undefined values safely", () => {
      const obj = undefined;
      const isValid = obj && typeof obj === "object";
      expect(isValid).toBeFalsy();
    });

    it("should detect valid DurationInBpm shape", () => {
      const obj = { division: 4, divisionCount: 2 };
      const isDuration =
        typeof obj.division === "number" &&
        typeof obj.divisionCount === "number";
      expect(isDuration).toBe(true);
    });

    it("should detect partial DurationInBpm as invalid", () => {
      const partialObj = { division: 4 };
      const isDuration =
        typeof partialObj.division === "number" &&
        typeof (partialObj as any).divisionCount === "number";
      expect(isDuration).toBe(false);
    });

    it("should detect valid ChartItem type property", () => {
      const obj = { type: "note", data: { type: "tap", lane: 1 } };
      const isChartItem = ["note", "rest", "timeSignature"].includes(obj.type);
      expect(isChartItem).toBe(true);
    });

    it("should reject invalid ChartItem type", () => {
      const obj = { type: "invalid", data: {} };
      const isChartItem = ["note", "rest", "timeSignature"].includes(
        (obj as any).type
      );
      expect(isChartItem).toBe(false);
    });

    it("should detect array vs object types correctly", () => {
      const arr = [1, 2, 3];
      const obj = { a: 1 };
      expect(Array.isArray(arr)).toBe(true);
      expect(Array.isArray(obj)).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle zero lane number", () => {
      const tap: TapChartData = { type: "tap", lane: 0 };
      expect(tap.lane).toBe(0);
    });

    it("should handle negative lane number", () => {
      const tap: TapChartData = { type: "tap", lane: -1 };
      expect(tap.lane).toBe(-1);
    });

    it("should handle large division values", () => {
      const duration: DurationInBpm = { division: 128, divisionCount: 64 };
      expect(duration.division).toBe(128);
      expect(duration.divisionCount).toBe(64);
    });

    it("should handle zero divisionCount", () => {
      const rest: Rest = { divisionCount: 0 };
      expect(rest.divisionCount).toBe(0);
    });

    it("should handle float bpm values", () => {
      const ts: TimeSignature = { bpm: 120.5, division: 4 };
      expect(ts.bpm).toBe(120.5);
    });

    it("should handle empty items array", () => {
      const chart: Chart = {
        metadata: { title: "Empty" },
        items: [],
      };
      expect(chart.items.length).toBe(0);
      expect(() => validateChart(chart)).toThrow();
    });

    it("should distinguish between note item and note array", () => {
      const singleNote: ChartItem = { type: "note", data: { type: "tap", lane: 1 } };
      const noteArray = [
        { type: "note" as const, data: { type: "tap" as const, lane: 1 } },
        { type: "note" as const, data: { type: "tap" as const, lane: 2 } },
      ];
      expect(Array.isArray(singleNote)).toBe(false);
      expect(Array.isArray(noteArray)).toBe(true);
    });
  });
});
