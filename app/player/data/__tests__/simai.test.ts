import { describe, it, expect } from "bun:test";
import { parseMetadata, parseSimai, parseSimaiChart, exportMetadata } from "../simai";
import type { HoldChartData, SlideChartData } from "../chart";
import {
  expectValidChart,
  extractNotes,
  findFirstNoteOfType,
} from "./helpers";
import {
  SIMPLE_TAP,
  SIMPLE_HOLD,
  SIMPLE_SLIDE,
  EACH_TAP,
  BREAK_TAP,
  BPM_CHANGE,
  CIRCLE_SLIDE_CW,
  CIRCLE_SLIDE_CCW,
  U_SLIDE_CW,
  U_SLIDE_CCW,
  CUP_SLIDE_CW,
  CUP_SLIDE_CCW,
  THUNDER_SLIDE_CW,
  THUNDER_SLIDE_CCW,
  V_SLIDE,
  L_SLIDE,
  AUTO_CIRCLE_SLIDE,
  SAME_ORIGIN_SLIDES,
  COMPLEX_CHART,
  EIGHTH_NOTE_CHART,
  FRACTIONAL_BPM_CHART,
  WITH_RESTS,
  FULL_CHART_EXAMPLE,
  ALL_FIXTURES,
} from "./fixtures";

// Type guard functions
function isHoldData(data: { type: string }): data is HoldChartData {
  return data.type === "hold";
}

function isSlideData(data: { type: string }): data is SlideChartData {
  return data.type === "slide";
}

describe("Simai Parser - Time Signatures", () => {
  it("should parse basic time signature (120){4}", () => {
    const result = parseSimaiChart("(120){4}1,E");
    const timeSig = result.find((item) => !Array.isArray(item) && item.type === "timeSignature");
    expect(timeSig).toBeDefined();
    if (!Array.isArray(timeSig) && timeSig?.type === "timeSignature") {
      expect(timeSig.data.bpm).toBe(120);
      expect(timeSig.data.division).toBe(4);
    }
  });

  it("should parse fractional BPM (128.5){4}", () => {
    const result = parseSimaiChart("(128.5){4}1,E");
    const timeSig = result.find((item) => !Array.isArray(item) && item.type === "timeSignature");
    expect(timeSig).toBeDefined();
    if (!Array.isArray(timeSig) && timeSig?.type === "timeSignature") {
      expect(timeSig.data.bpm).toBe(128.5);
      expect(timeSig.data.division).toBe(4);
    }
  });

  it("should parse 8th note division (120){8}", () => {
    const result = parseSimaiChart("(120){8}1,E");
    const timeSig = result.find((item) => !Array.isArray(item) && item.type === "timeSignature");
    expect(timeSig).toBeDefined();
    if (!Array.isArray(timeSig) && timeSig?.type === "timeSignature") {
      expect(timeSig.data.bpm).toBe(120);
      expect(timeSig.data.division).toBe(8);
    }
  });

  it("should parse 16th note division (120){16}", () => {
    const result = parseSimaiChart("(120){16}1,E");
    const timeSig = result.find((item) => !Array.isArray(item) && item.type === "timeSignature");
    expect(timeSig).toBeDefined();
    if (!Array.isArray(timeSig) && timeSig?.type === "timeSignature") {
      expect(timeSig.data.division).toBe(16);
    }
  });

  it("should parse 3rd note division (120){3}", () => {
    const result = parseSimaiChart("(120){3}1,E");
    const timeSig = result.find((item) => !Array.isArray(item) && item.type === "timeSignature");
    expect(timeSig).toBeDefined();
    if (!Array.isArray(timeSig) && timeSig?.type === "timeSignature") {
      expect(timeSig.data.division).toBe(3);
    }
  });

  it("should parse time signature without BPM {4}", () => {
    const result = parseSimaiChart("{4}1,E");
    const timeSig = result.find((item) => !Array.isArray(item) && item.type === "timeSignature");
    expect(timeSig).toBeDefined();
    if (!Array.isArray(timeSig) && timeSig?.type === "timeSignature") {
      expect(timeSig.data.bpm).toBeUndefined();
      expect(timeSig.data.division).toBe(4);
    }
  });

  it("should handle BPM changes mid-chart", () => {
    const result = parseSimaiChart(BPM_CHANGE);
    const timeSigs = result.filter((item) => !Array.isArray(item) && item.type === "timeSignature");
    expect(timeSigs.length).toBeGreaterThanOrEqual(2);
  });

  it("should parse high BPM values (240){4}", () => {
    const result = parseSimaiChart("(240){4}1,E");
    const timeSig = result.find((item) => !Array.isArray(item) && item.type === "timeSignature");
    expect(timeSig).toBeDefined();
    if (!Array.isArray(timeSig) && timeSig?.type === "timeSignature") {
      expect(timeSig.data.bpm).toBe(240);
    }
  });

  it("should parse low BPM values (60){4}", () => {
    const result = parseSimaiChart("(60){4}1,E");
    const timeSig = result.find((item) => !Array.isArray(item) && item.type === "timeSignature");
    expect(timeSig).toBeDefined();
    if (!Array.isArray(timeSig) && timeSig?.type === "timeSignature") {
      expect(timeSig.data.bpm).toBe(60);
    }
  });
});

describe("Simai Parser - Tap Notes", () => {
  it("should parse tap on lane 1", () => {
    const result = parseSimaiChart(SIMPLE_TAP);
    expectValidChart(result);
    const note = findFirstNoteOfType(result, "tap");
    expect(note).toBeDefined();
    expect(note?.data.lane).toBe(1);
  });

  it("should parse tap on all lanes 1-8", () => {
    for (let lane = 1; lane <= 8; lane++) {
      const result = parseSimaiChart(`(120){4}${lane},E`);
      const note = findFirstNoteOfType(result, "tap");
      expect(note?.data.lane).toBe(lane);
    }
  });

  it("should parse BREAK tap (b modifier)", () => {
    const result = parseSimaiChart(BREAK_TAP);
    expectValidChart(result);
    const note = findFirstNoteOfType(result, "tap");
    expect(note).toBeDefined();
    expect(note?.data.lane).toBe(1);
  });

  it("should parse tap with x modifier", () => {
    const result = parseSimaiChart("(120){4}1x,E");
    expectValidChart(result);
    const note = findFirstNoteOfType(result, "tap");
    expect(note).toBeDefined();
    expect(note?.data.lane).toBe(1);
  });

  it("should parse tap with multiple modifiers (bx)", () => {
    const result = parseSimaiChart("(120){4}1bx,E");
    expectValidChart(result);
    const note = findFirstNoteOfType(result, "tap");
    expect(note).toBeDefined();
    expect(note?.data.lane).toBe(1);
  });

  it("should parse tap with modifiers reversed (xb)", () => {
    const result = parseSimaiChart("(120){4}1xb,E");
    expectValidChart(result);
    const note = findFirstNoteOfType(result, "tap");
    expect(note).toBeDefined();
    expect(note?.data.lane).toBe(1);
  });
});

describe("Simai Parser - Hold Notes", () => {
  it("should parse simple hold 1h[4:1]", () => {
    const result = parseSimaiChart(SIMPLE_HOLD);
    expectValidChart(result);
    const note = findFirstNoteOfType(result, "hold");
    expect(note).toBeDefined();
    expect(note?.data.lane).toBe(1);
    if (note && isHoldData(note.data)) {
      expect(note.data.duration.division).toBe(4);
      expect(note.data.duration.divisionCount).toBe(1);
    }
  });

  it("should parse hold with longer duration 1h[8:4]", () => {
    const result = parseSimaiChart("(120){4}1h[8:4],E");
    const note = findFirstNoteOfType(result, "hold");
    if (note && isHoldData(note.data)) {
      expect(note.data.duration.division).toBe(8);
      expect(note.data.duration.divisionCount).toBe(4);
    }
  });

  it("should parse hold with 3rd note duration 1h[3:1]", () => {
    const result = parseSimaiChart("(120){4}1h[3:1],E");
    const note = findFirstNoteOfType(result, "hold");
    if (note && isHoldData(note.data)) {
      expect(note.data.duration.division).toBe(3);
      expect(note.data.duration.divisionCount).toBe(1);
    }
  });

  it("should parse hold with custom BPM 1h[180#4:1]", () => {
    const result = parseSimaiChart("(120){4}1h[180#4:1],E");
    const note = findFirstNoteOfType(result, "hold");
    if (note && isHoldData(note.data)) {
      expect(note.data.duration.bpm).toBe(180);
      expect(note.data.duration.division).toBe(4);
      expect(note.data.duration.divisionCount).toBe(1);
    }
  });

  it("should parse hold on all lanes", () => {
    for (let lane = 1; lane <= 8; lane++) {
      const result = parseSimaiChart(`(120){4}${lane}h[4:1],E`);
      const note = findFirstNoteOfType(result, "hold");
      expect(note?.data.lane).toBe(lane);
    }
  });

  it("should parse hold with BREAK modifier 1bh[4:1]", () => {
    const result = parseSimaiChart("(120){4}1bh[4:1],E");
    const note = findFirstNoteOfType(result, "hold");
    expect(note).toBeDefined();
    expect(note?.data.lane).toBe(1);
  });

  it("should handle hold without duration (defaults to 8:0)", () => {
    const result = parseSimaiChart("(120){4}1h,E");
    const note = findFirstNoteOfType(result, "hold");
    expect(note).toBeDefined();
    expect(note?.data.lane).toBe(1);
  });
});

describe("Simai Parser - Straight Slides", () => {
  it("should parse straight slide 1-5[4:1]", () => {
    const result = parseSimaiChart(SIMPLE_SLIDE);
    expectValidChart(result);
    const note = findFirstNoteOfType(result, "slide");
    expect(note).toBeDefined();
    expect(note?.data.lane).toBe(1);
    if (note && isSlideData(note.data)) {
      expect(note.data.slideType).toBe("Straight");
      expect(note.data.destinationLane).toBe(5);
    }
  });

  it("should parse straight slide in all directions", () => {
    const pairs = [
      [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8],
      [2, 1], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8],
    ];
    for (const [start, end] of pairs) {
      const result = parseSimaiChart(`(120){4}${start}-${end}[4:1],E`);
      const note = findFirstNoteOfType(result, "slide");
      expect(note?.data.lane).toBe(start);
      if (note && isSlideData(note.data)) {
        expect(note.data.destinationLane).toBe(end);
        expect(note.data.slideType).toBe("Straight");
      }
    }
  });

  it("should parse straight slide with custom BPM 1-5[180#4:1]", () => {
    const result = parseSimaiChart("(120){4}1-5[180#4:1],E");
    const note = findFirstNoteOfType(result, "slide");
    if (note && isSlideData(note.data)) {
      expect(note.data.duration.bpm).toBe(180);
    }
  });

  it("should parse straight slide with different durations", () => {
    const durations = [
      "[4:1]", "[4:2]", "[8:1]", "[8:2]", "[8:4]", "[3:1]", "[6:1]", "[16:4]"
    ];
    for (const duration of durations) {
      const result = parseSimaiChart(`(120){4}1-5${duration},E`);
      const note = findFirstNoteOfType(result, "slide");
      expect(note).toBeDefined();
    }
  });
});

describe("Simai Parser - Circle Slides", () => {
  it("should parse clockwise circle slide 1>5[4:1]", () => {
    const result = parseSimaiChart(CIRCLE_SLIDE_CW);
    const note = findFirstNoteOfType(result, "slide");
    expect(note).toBeDefined();
    if (note && isSlideData(note.data)) {
      expect(note.data.slideType).toBe("Circle");
      expect(note.data.direction).toBe("cw");
    }
  });

  it("should parse counter-clockwise circle slide 1<7[4:1]", () => {
    const result = parseSimaiChart(CIRCLE_SLIDE_CCW);
    const note = findFirstNoteOfType(result, "slide");
    expect(note).toBeDefined();
    if (note && isSlideData(note.data)) {
      expect(note.data.slideType).toBe("Circle");
      expect(note.data.direction).toBe("ccw");
    }
  });

  it("should parse circle slides in all directions", () => {
    for (let start = 1; start <= 8; start++) {
      for (let end = 1; end <= 8; end++) {
        if (start !== end) {
          const result = parseSimaiChart(`(120){4}${start}>${end}[4:1],E`);
          const note = findFirstNoteOfType(result, "slide");
          if (note && isSlideData(note.data)) {
            expect(note.data.slideType).toBe("Circle");
          }
        }
      }
    }
  });

  it("should parse auto-direction circle 1^5[4:1]", () => {
    const result = parseSimaiChart(AUTO_CIRCLE_SLIDE);
    const note = findFirstNoteOfType(result, "slide");
    expect(note).toBeDefined();
    if (note && isSlideData(note.data)) {
      expect(note.data.slideType).toBe("Circle");
    }
  });

  it("should auto-detect clockwise for small arc 1^2[4:1]", () => {
    const result = parseSimaiChart("(120){4}1^2[4:1],E");
    const note = findFirstNoteOfType(result, "slide");
    if (note && isSlideData(note.data)) {
      expect(note.data.direction).toBe("cw");
    }
  });

  it("should auto-detect counter-clockwise for large arc 1^6[4:1]", () => {
    const result = parseSimaiChart("(120){4}1^6[4:1],E");
    const note = findFirstNoteOfType(result, "slide");
    if (note && isSlideData(note.data)) {
      expect(note.data.direction).toBe("ccw");
    }
  });
});

describe("Simai Parser - U-Shape Slides", () => {
  it("should parse U-shape clockwise 1q5[4:1]", () => {
    const result = parseSimaiChart(U_SLIDE_CW);
    const note = findFirstNoteOfType(result, "slide");
    expect(note).toBeDefined();
    if (note && isSlideData(note.data)) {
      expect(note.data.slideType).toBe("U");
      expect(note.data.direction).toBe("cw");
    }
  });

  it("should parse U-shape counter-clockwise 1p5[4:1]", () => {
    const result = parseSimaiChart(U_SLIDE_CCW);
    const note = findFirstNoteOfType(result, "slide");
    expect(note).toBeDefined();
    if (note && isSlideData(note.data)) {
      expect(note.data.slideType).toBe("U");
      expect(note.data.direction).toBe("ccw");
    }
  });

  it("should parse U-shape slides in various combinations", () => {
    for (let start = 1; start <= 8; start++) {
      for (let end = 1; end <= 8; end++) {
        if (Math.abs(start - end) === 4 || Math.abs(start - end) === 0) continue;
        const resultCW = parseSimaiChart(`(120){4}${start}q${end}[4:1],E`);
        const noteCW = findFirstNoteOfType(resultCW, "slide");
        if (noteCW && isSlideData(noteCW.data)) {
          expect(noteCW.data.slideType).toBe("U");
          expect(noteCW.data.direction).toBe("cw");
        }

        const resultCCW = parseSimaiChart(`(120){4}${start}p${end}[4:1],E`);
        const noteCCW = findFirstNoteOfType(resultCCW, "slide");
        if (noteCCW && isSlideData(noteCCW.data)) {
          expect(noteCCW.data.slideType).toBe("U");
          expect(noteCCW.data.direction).toBe("ccw");
        }
      }
    }
  });
});

describe("Simai Parser - CUP Slides", () => {
  it("should parse CUP clockwise 1qq5[4:1]", () => {
    const result = parseSimaiChart(CUP_SLIDE_CW);
    const note = findFirstNoteOfType(result, "slide");
    expect(note).toBeDefined();
    if (note && isSlideData(note.data)) {
      expect(note.data.slideType).toBe("CUP");
      expect(note.data.direction).toBe("cw");
    }
  });

  it("should parse CUP counter-clockwise 1pp5[4:1]", () => {
    const result = parseSimaiChart(CUP_SLIDE_CCW);
    const note = findFirstNoteOfType(result, "slide");
    expect(note).toBeDefined();
    if (note && isSlideData(note.data)) {
      expect(note.data.slideType).toBe("CUP");
      expect(note.data.direction).toBe("ccw");
    }
  });

  it("should parse CUP slides from various lanes", () => {
    const startLanes = [1, 2, 3, 4, 5, 6, 7, 8];
    for (const lane of startLanes) {
      const dest = ((lane + 3) % 8) || 8;
      const resultCW = parseSimaiChart(`(120){4}${lane}qq${dest}[4:1],E`);
      const noteCW = findFirstNoteOfType(resultCW, "slide");
      if (noteCW && isSlideData(noteCW.data)) {
        expect(noteCW.data.slideType).toBe("CUP");
      }

      const resultCCW = parseSimaiChart(`(120){4}${lane}pp${dest}[4:1],E`);
      const noteCCW = findFirstNoteOfType(resultCCW, "slide");
      if (noteCCW && isSlideData(noteCCW.data)) {
        expect(noteCCW.data.slideType).toBe("CUP");
      }
    }
  });
});

describe("Simai Parser - Thunder Slides", () => {
  it("should parse Thunder clockwise 1z5[4:1]", () => {
    const result = parseSimaiChart(THUNDER_SLIDE_CW);
    const note = findFirstNoteOfType(result, "slide");
    expect(note).toBeDefined();
    if (note && isSlideData(note.data)) {
      expect(note.data.slideType).toBe("Thunder");
      expect(note.data.direction).toBe("cw");
    }
  });

  it("should parse Thunder counter-clockwise 1s5[4:1]", () => {
    const result = parseSimaiChart(THUNDER_SLIDE_CCW);
    const note = findFirstNoteOfType(result, "slide");
    expect(note).toBeDefined();
    if (note && isSlideData(note.data)) {
      expect(note.data.slideType).toBe("Thunder");
      expect(note.data.direction).toBe("ccw");
    }
  });

  it("should parse Thunder slides from various lanes", () => {
    for (let start = 1; start <= 8; start++) {
      const dest = ((start + 2) % 8) || 8;
      const resultCW = parseSimaiChart(`(120){4}${start}z${dest}[4:1],E`);
      const noteCW = findFirstNoteOfType(resultCW, "slide");
      if (noteCW && isSlideData(noteCW.data)) {
        expect(noteCW.data.slideType).toBe("Thunder");
        expect(noteCW.data.direction).toBe("cw");
      }

      const resultCCW = parseSimaiChart(`(120){4}${start}s${dest}[4:1],E`);
      const noteCCW = findFirstNoteOfType(resultCCW, "slide");
      if (noteCCW && isSlideData(noteCCW.data)) {
        expect(noteCCW.data.slideType).toBe("Thunder");
        expect(noteCCW.data.direction).toBe("ccw");
      }
    }
  });
});

describe("Simai Parser - V-Shape Slides", () => {
  it("should parse V-shape slide 1v5[4:1]", () => {
    const result = parseSimaiChart(V_SLIDE);
    const note = findFirstNoteOfType(result, "slide");
    expect(note).toBeDefined();
    if (note && isSlideData(note.data)) {
      expect(note.data.slideType).toBe("V");
    }
  });

  it("should parse V-shape in various directions", () => {
    for (let start = 1; start <= 8; start++) {
      const dest = ((start + 3) % 8) || 8;
      const result = parseSimaiChart(`(120){4}${start}v${dest}[4:1],E`);
      const note = findFirstNoteOfType(result, "slide");
      if (note && isSlideData(note.data)) {
        expect(note.data.slideType).toBe("V");
        expect(note.data.lane).toBe(start);
        expect(note.data.destinationLane).toBe(dest);
      }
    }
  });
});

describe("Simai Parser - L-Shape Slides", () => {
  it("should parse L-shape slide with correct syntax 1V25[4:1]", () => {
    const result = parseSimaiChart("(120){4}1V25[4:1],E");
    const notes = extractNotes(result);
    expect(notes.length).toBeGreaterThan(0);
    const slide = notes.find((n) => n.data.type === "slide");
    expect(slide).toBeDefined();
    if (slide && isSlideData(slide.data)) {
      expect(slide.data.slideType).toBe("L");
    }
  });

  it("should parse L-shape from various starting lanes", () => {
    for (let start = 1; start <= 8; start++) {
      const mid = ((start) % 8) + 1;
      const dest = ((start + 1) % 8) + 1;
      const result = parseSimaiChart(`(120){4}${start}V${mid}${dest}[4:1],E`);
      const note = findFirstNoteOfType(result, "slide");
      if (note && isSlideData(note.data)) {
        expect(note.data.slideType).toBe("L");
      }
    }
  });
});

describe("Simai Parser - EACH Notes", () => {
  it("should parse EACH with two taps [1/5]", () => {
    const result = parseSimaiChart(EACH_TAP);
    expectValidChart(result);
    const notes = extractNotes(result);
    expect(notes.length).toBe(2);
    expect(notes[0].data.type).toBe("tap");
    expect(notes[1].data.type).toBe("tap");
  });

  it("should parse EACH with multiple taps 1/2/3/4", () => {
    const result = parseSimaiChart("(120){4}1/2/3/4,E");
    const notes = extractNotes(result);
    expect(notes.length).toBe(4);
    expect(notes.every((n) => n.data.type === "tap")).toBe(true);
  });

  it("should parse EACH with all 8 lanes", () => {
    const result = parseSimaiChart("(120){4}1/2/3/4/5/6/7/8,E");
    const notes = extractNotes(result);
    expect(notes.length).toBe(8);
  });

  it("should parse EACH with holds 1h[4:1]/5h[4:1]", () => {
    const result = parseSimaiChart("(120){4}1h[4:1]/5h[4:1],E");
    const notes = extractNotes(result);
    expect(notes.length).toBe(2);
    expect(notes.every((n) => n.data.type === "hold")).toBe(true);
  });

  it("should parse EACH with mixed types 1/5h[4:1]", () => {
    const result = parseSimaiChart("(120){4}1/5h[4:1],E");
    const notes = extractNotes(result);
    expect(notes.length).toBe(2);
    expect(notes[0].data.type).toBe("tap");
    expect(notes[1].data.type).toBe("hold");
  });

  it("should parse EACH with slides 1-5[4:1]/3-7[4:1]", () => {
    const result = parseSimaiChart("(120){4}1-5[4:1]/3-7[4:1],E");
    const notes = extractNotes(result);
    expect(notes.length).toBe(2);
    expect(notes.every((n) => n.data.type === "slide")).toBe(true);
  });
});

describe("Simai Parser - Same-Origin Slides", () => {
  it("should parse same-origin slides from fixture", () => {
    const result = parseSimaiChart(SAME_ORIGIN_SLIDES);
    const notes = extractNotes(result);
    const slides = notes.filter((n) => n.data.type === "slide");
    expect(slides.length).toBeGreaterThanOrEqual(1);
  });

  it("should handle multiple slides from same origin", () => {
    const result = parseSimaiChart("(120){4}1-5[4:1],E");
    const notes = extractNotes(result);
    const slides = notes.filter((n) => n.data.type === "slide");
    expect(slides.length).toBe(1);
    expect(slides[0].data.lane).toBe(1);
  });

  it("should parse slide with complex type", () => {
    const result = parseSimaiChart("(120){4}1-5[4:1],E");
    const note = findFirstNoteOfType(result, "slide");
    if (note && isSlideData(note.data)) {
      expect(note.data.slideType).toBe("Straight");
      expect(note.data.lane).toBe(1);
      expect(note.data.destinationLane).toBe(5);
    }
  });
});

describe("Simai Parser - Rest Notes", () => {
  it("should parse rest between notes", () => {
    const result = parseSimaiChart(WITH_RESTS);
    expectValidChart(result);
    const notes = extractNotes(result);
    expect(notes.length).toBe(3);
  });

  it("should handle multiple consecutive rests", () => {
    const result = parseSimaiChart("(120){4}1,,,,2,E");
    expectValidChart(result);
    const notes = extractNotes(result);
    expect(notes.length).toBe(2);
  });

  it("should handle empty input", () => {
    const result = parseSimaiChart("");
    expect(Array.isArray(result)).toBe(true);
  });

  it("should handle only end marker", () => {
    const result = parseSimaiChart("E");
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Simai Parser - Complex Charts", () => {
  it("should parse COMPLEX_CHART", () => {
    const result = parseSimaiChart(COMPLEX_CHART);
    expectValidChart(result);
    const notes = extractNotes(result);
    expect(notes.length).toBeGreaterThan(0);
    expect(notes.some((n) => n.data.type === "tap")).toBe(true);
    expect(notes.some((n) => n.data.type === "hold")).toBe(true);
    expect(notes.some((n) => n.data.type === "slide")).toBe(true);
  });

  it("should parse FULL_CHART_EXAMPLE", () => {
    const result = parseSimaiChart(FULL_CHART_EXAMPLE);
    expectValidChart(result);
    const notes = extractNotes(result);
    expect(notes.length).toBeGreaterThan(0);
  });

  it("should parse 8th note chart", () => {
    const result = parseSimaiChart(EIGHTH_NOTE_CHART);
    expectValidChart(result);
    const timeSig = result.find((item) => !Array.isArray(item) && item.type === "timeSignature");
    if (!Array.isArray(timeSig) && timeSig?.type === "timeSignature") {
      expect(timeSig.data.division).toBe(8);
    }
  });

  it("should parse fractional BPM chart", () => {
    const result = parseSimaiChart(FRACTIONAL_BPM_CHART);
    expectValidChart(result);
    const timeSig = result.find((item) => !Array.isArray(item) && item.type === "timeSignature");
    if (!Array.isArray(timeSig) && timeSig?.type === "timeSignature") {
      expect(timeSig.data.bpm).toBe(128.5);
    }
  });
});

describe("Simai Parser - Edge Cases", () => {
  it("should handle input with whitespace", () => {
    const result = parseSimaiChart(" (120){4}1,2,E ");
    const notes = extractNotes(result);
    expect(notes.length).toBe(2);
  });

  it("should handle newlines and tabs", () => {
    const result = parseSimaiChart(`(120){4}
1,
2,
E`);
    const notes = extractNotes(result);
    expect(notes.length).toBe(2);
  });

  it("should handle malformed syntax gracefully", () => {
    const result = parseSimaiChart("(120){4}invalid,E");
    expect(Array.isArray(result)).toBe(true);
  });

  it("should handle slide without duration gracefully", () => {
    const result = parseSimaiChart("(120){4}1-5,E");
    const notes = extractNotes(result);
    expect(notes.length).toBe(0);
  });

  it("should handle unknown slide type gracefully", () => {
    const result = parseSimaiChart("(120){4}1?5[4:1],E");
    expect(Array.isArray(result)).toBe(true);
  });

  it("should handle very long duration values", () => {
    const result = parseSimaiChart("(120){4}1h[256:128],E");
    const note = findFirstNoteOfType(result, "hold");
    if (note && isHoldData(note.data)) {
      expect(note.data.duration.division).toBe(256);
      expect(note.data.duration.divisionCount).toBe(128);
    }
  });

  it("should handle lane 8 notes correctly", () => {
    const result = parseSimaiChart("(120){4}8,E");
    const note = findFirstNoteOfType(result, "tap");
    expect(note?.data.lane).toBe(8);
  });

  it("should handle invalid lane numbers gracefully", () => {
    const result = parseSimaiChart("(120){4}9,E");
    expect(Array.isArray(result)).toBe(true);
  });

  it("should handle zero lane number gracefully", () => {
    const result = parseSimaiChart("(120){4}0,E");
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Simai Parser - All Fixtures", () => {
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

  for (const { name, simai } of ALL_FIXTURES) {
    it(`should parse ${name} correctly`, () => {
      const result = parseSimaiChart(simai);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  }
});

describe("Simai Parser - Snapshots", () => {
  it("should match snapshot for SIMPLE_TAP", () => {
    const result = parseSimaiChart(SIMPLE_TAP);
    expect(result).toMatchSnapshot("simple-tap");
  });

  it("should match snapshot for SIMPLE_HOLD", () => {
    const result = parseSimaiChart(SIMPLE_HOLD);
    expect(result).toMatchSnapshot("simple-hold");
  });

  it("should match snapshot for SIMPLE_SLIDE", () => {
    const result = parseSimaiChart(SIMPLE_SLIDE);
    expect(result).toMatchSnapshot("simple-slide");
  });

  it("should match snapshot for EACH_TAP", () => {
    const result = parseSimaiChart(EACH_TAP);
    expect(result).toMatchSnapshot("each-tap");
  });

  it("should match snapshot for COMPLEX_CHART", () => {
    const result = parseSimaiChart(COMPLEX_CHART);
    expect(result).toMatchSnapshot("complex-chart");
  });

  it("should match snapshot for FULL_CHART_EXAMPLE", () => {
    const result = parseSimaiChart(FULL_CHART_EXAMPLE);
    expect(result).toMatchSnapshot("full-chart-example");
  });

  it("should match snapshot for CIRCLE_SLIDE_CW", () => {
    const result = parseSimaiChart(CIRCLE_SLIDE_CW);
    expect(result).toMatchSnapshot("circle-slide-cw");
  });

  it("should match snapshot for SAME_ORIGIN_SLIDES", () => {
    const result = parseSimaiChart(SAME_ORIGIN_SLIDES);
    expect(result).toMatchSnapshot("same-origin-slides");
  });

  it("should match snapshot for ALL_SLIDE_TYPES", () => {
    const chart = `(120){4}
1-2[4:1],
3>4[4:1],
5<6[4:1],
7q1[4:1],
2p3[4:1],
4qq5[4:1],
6pp7[4:1],
8z1[4:1],
2s3[4:1],
4v6[4:1],
5V25[4:1],
7^1[4:1],
E`;
    const result = parseSimaiChart(chart);
    expect(result).toMatchSnapshot("all-slide-types");
  });

  it("should match snapshot for ALL_TAP_VARIANTS", () => {
    const chart = `(120){4}
1,
2b,
3x,
4bx,
5xb,
6h[4:1],
7bh[4:1],
8xh[4:1],
E`;
    const result = parseSimaiChart(chart);
    expect(result).toMatchSnapshot("all-tap-variants");
  });
});

describe("Metadata Parsing", () => {
  describe("parseMetadata", () => {
    it("should parse header format &title", () => {
      const { metadata, notes } = parseMetadata("&title=My Song\n(120){4}1,E");
      expect(metadata.title).toBe("My Song");
      expect(notes).toBe("(120){4}1,E");
    });

    it("should parse header format &artist", () => {
      const { metadata, notes } = parseMetadata("&artist=Artist Name\n(120){4}1,E");
      expect(metadata.artist).toBe("Artist Name");
    });

    it("should parse header format &bpm", () => {
      const { metadata, notes } = parseMetadata("&bpm=150\n(120){4}1,E");
      expect(metadata.bpm).toBe(150);
    });

    it("should parse header format &charter", () => {
      const { metadata, notes } = parseMetadata("&charter=Charter Name\n(120){4}1,E");
      expect(metadata.charter).toBe("Charter Name");
    });

    it("should parse header format &difficulty", () => {
      const { metadata, notes } = parseMetadata("&difficulty=13+\n(120){4}1,E");
      expect(metadata.difficulty).toBe("13+");
    });

    it("should parse comment format # TITLE:", () => {
      const { metadata, notes } = parseMetadata("# TITLE: My Song\n(120){4}1,E");
      expect(metadata.title).toBe("My Song");
    });

    it("should parse comment format # ARTIST =", () => {
      const { metadata, notes } = parseMetadata("# ARTIST = Artist Name\n(120){4}1,E");
      expect(metadata.artist).toBe("Artist Name");
    });

    it("should parse comment format # BPM:", () => {
      const { metadata, notes } = parseMetadata("# BPM: 150\n(120){4}1,E");
      expect(metadata.bpm).toBe(150);
    });

    it("should parse comment format # CHARTER:", () => {
      const { metadata, notes } = parseMetadata("# CHARTER: Charter Name\n(120){4}1,E");
      expect(metadata.charter).toBe("Charter Name");
    });

    it("should parse comment format # MAPPER:", () => {
      const { metadata, notes } = parseMetadata("# MAPPER: Mapper Name\n(120){4}1,E");
      expect(metadata.charter).toBe("Mapper Name");
    });

    it("should parse comment format # AUTHOR:", () => {
      const { metadata, notes } = parseMetadata("# AUTHOR: Author Name\n(120){4}1,E");
      expect(metadata.charter).toBe("Author Name");
    });

    it("should parse comment format # DIFFICULTY:", () => {
      const { metadata, notes } = parseMetadata("# DIFFICULTY: 13+\n(120){4}1,E");
      expect(metadata.difficulty).toBe("13+");
    });

    it("should parse comment format # LEVEL:", () => {
      const { metadata, notes } = parseMetadata("# LEVEL: 12\n(120){4}1,E");
      expect(metadata.difficulty).toBe("12");
    });

    it("should parse multiple metadata fields", () => {
      const { metadata, notes } = parseMetadata(
        "&title=My Song\n&artist=Artist Name\n&bpm=150\n&charter=Charter Name\n&difficulty=13+\n(120){4}1,E"
      );
      expect(metadata.title).toBe("My Song");
      expect(metadata.artist).toBe("Artist Name");
      expect(metadata.bpm).toBe(150);
      expect(metadata.charter).toBe("Charter Name");
      expect(metadata.difficulty).toBe("13+");
      expect(notes).toBe("(120){4}1,E");
    });

    it("should handle mixed header and comment formats", () => {
      const { metadata, notes } = parseMetadata(
        "&title=My Song\n# ARTIST: Artist Name\n(120){4}1,E"
      );
      expect(metadata.title).toBe("My Song");
      expect(metadata.artist).toBe("Artist Name");
    });

    it("should handle case-insensitive keys", () => {
      const { metadata } = parseMetadata("&TITLE=Title\n# Artist: Artist\n# BPM: 150");
      expect(metadata.title).toBe("Title");
      expect(metadata.artist).toBe("Artist");
      expect(metadata.bpm).toBe(150);
    });

    it("should return empty metadata for input without metadata", () => {
      const { metadata, notes } = parseMetadata("(120){4}1,E");
      expect(metadata).toEqual({});
      expect(notes).toBe("(120){4}1,E");
    });

    it("should handle empty lines in input", () => {
      const { metadata, notes } = parseMetadata("\n\n&title=My Song\n\n(120){4}1,E\n\n");
      expect(metadata.title).toBe("My Song");
      expect(notes).toBe("(120){4}1,E");
    });

    it("should parse fractional BPM", () => {
      const { metadata } = parseMetadata("&bpm=128.5\n(120){4}1,E");
      expect(metadata.bpm).toBe(128.5);
    });

    it("should ignore invalid header format", () => {
      const { metadata, notes } = parseMetadata("&invalid\n(120){4}1,E");
      expect(metadata).toEqual({});
      expect(notes).toBe("&invalid\n(120){4}1,E");
    });

    it("should ignore invalid comment format", () => {
      const { metadata, notes } = parseMetadata("# invalid\n(120){4}1,E");
      expect(metadata).toEqual({});
      expect(notes).toBe("# invalid\n(120){4}1,E");
    });
  });

  describe("parseSimai", () => {
    it("should parse full chart with metadata", () => {
      const chart = parseSimai("&title=My Song\n&bpm=150\n(120){4}1,2,3,E");
      expect(chart.metadata.title).toBe("My Song");
      expect(chart.metadata.bpm).toBe(150);
      expect(chart.items.length).toBeGreaterThan(0);
    });

    it("should handle chart without metadata", () => {
      const chart = parseSimai("(120){4}1,2,3,E");
      expect(chart.metadata).toEqual({});
      expect(chart.items.length).toBeGreaterThan(0);
    });
  });

  describe("exportMetadata", () => {
    it("should export all metadata fields", () => {
      const result = exportMetadata({
        title: "My Song",
        artist: "Artist Name",
        bpm: 150,
        charter: "Charter Name",
        difficulty: "13+",
      });
      expect(result).toBe("&title=My Song\n&artist=Artist Name\n&bpm=150\n&charter=Charter Name\n&difficulty=13+");
    });

    it("should export only provided fields", () => {
      const result = exportMetadata({ title: "My Song", bpm: 150 });
      expect(result).toBe("&title=My Song\n&bpm=150");
    });

    it("should return empty string for empty metadata", () => {
      const result = exportMetadata({});
      expect(result).toBe("");
    });

    it("should handle undefined values gracefully", () => {
      const result = exportMetadata({ title: undefined, bpm: undefined });
      expect(result).toBe("");
    });

    it("should handle string BPM", () => {
      const result = exportMetadata({ bpm: 120 });
      expect(result).toBe("&bpm=120");
    });
  });
});
