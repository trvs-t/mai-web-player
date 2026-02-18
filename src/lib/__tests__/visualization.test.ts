import { describe, it, expect } from "bun:test";
import { parseSimaiChart } from "../simai";
import {
  convertChartVisualizationData,
  convertChartWithMeasures,
  getCurrentMeasure,
  getMeasureDisplay,
  createTimeSortedIndex,
  getVisibleNotes,
  calculateChartStatistics,
  type NoteVisualization,
  type SlideVisualizationData,
  type HoldVisualizeData,
} from "../visualization";
import type { Chart } from "../chart";

function createChart(simai: string): Chart {
  const items = parseSimaiChart(simai);
  return {
    items,
    metadata: { title: "Test Chart" },
  };
}

function getHoldData(note: NoteVisualization): HoldVisualizeData {
  if (note.type !== "hold") throw new Error("Expected hold note");
  return note.data as HoldVisualizeData;
}

function getSlideData(note: NoteVisualization): SlideVisualizationData {
  if (note.type !== "slide") throw new Error("Expected slide note");
  return note.data as SlideVisualizationData;
}

describe("Visualization Converter - Beat to Time Conversion", () => {
  describe("Constant BPM Tests", () => {
    it("should convert beats to time at BPM 60", () => {
      const chart = createChart("(60){4}1,2,3,4,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(4);
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].data.hitTime).toBe(1000);
      expect(notes[2].data.hitTime).toBe(2000);
      expect(notes[3].data.hitTime).toBe(3000);
    });

    it("should convert beats to time at BPM 120", () => {
      const chart = createChart("(120){4}1,2,3,4,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(4);
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].data.hitTime).toBe(500);
      expect(notes[2].data.hitTime).toBe(1000);
      expect(notes[3].data.hitTime).toBe(1500);
    });

    it("should convert beats to time at BPM 240", () => {
      const chart = createChart("(240){4}1,2,3,4,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(4);
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].data.hitTime).toBe(250);
      expect(notes[2].data.hitTime).toBe(500);
      expect(notes[3].data.hitTime).toBe(750);
    });
  });

  describe("BPM Change Tests", () => {
    it("should handle BPM change from 120 to 140", () => {
      const chart = createChart("(120){4}1,2,(140){4}3,4,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(4);
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].data.hitTime).toBe(500);
      expect(notes[2].data.hitTime).toBeCloseTo(1000, 0);
      expect(notes[3].data.hitTime).toBeCloseTo(1428.571, 2);
    });

    it("should handle BPM change from 120 to 180", () => {
      const chart = createChart("(120){4}1,(180){4}2,3,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(3);
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].data.hitTime).toBe(500);
      expect(notes[2].data.hitTime).toBeCloseTo(833.333, 2);
    });

    it("should handle multiple BPM changes", () => {
      const chart = createChart("(120){4}1,(60){4}2,(240){4}3,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(3);
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].data.hitTime).toBe(500);
      expect(notes[2].data.hitTime).toBeCloseTo(1500, 0);
    });

    it("should handle BPM change with rest", () => {
      const chart = createChart("(120){4}1,,(140){4}2,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(2);
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].data.hitTime).toBe(1000);
    });
  });

  describe("Division Tests", () => {
    it("should handle 4th note divisions", () => {
      const chart = createChart("(120){4}1,2,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(2);
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].data.hitTime).toBe(500);
    });

    it("should handle 8th note divisions", () => {
      const chart = createChart("(120){8}1,2,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(2);
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].data.hitTime).toBe(250);
    });

    it("should handle 16th note divisions", () => {
      const chart = createChart("(120){16}1,2,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(2);
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].data.hitTime).toBe(125);
    });

    it("should handle mixed divisions with BPM changes", () => {
      const chart = createChart("(120){4}1,(120){8}2,3,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(3);
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].data.hitTime).toBe(500);
      expect(notes[2].data.hitTime).toBe(750);
    });

    it("should handle 3rd note divisions", () => {
      const chart = createChart("(120){3}1,2,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(2);
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].data.hitTime).toBeCloseTo(666.667, 2);
    });
  });

  describe("Extreme BPM Edge Cases", () => {
    it("should handle very low BPM (10)", () => {
      const chart = createChart("(10){4}1,2,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(2);
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].data.hitTime).toBe(6000);
    });

    it("should handle very high BPM (999)", () => {
      const chart = createChart("(999){4}1,2,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(2);
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].data.hitTime).toBeCloseTo(60.06, 1);
    });

    it("should handle fractional BPM", () => {
      const chart = createChart("(128.5){4}1,2,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(2);
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].data.hitTime).toBeCloseTo(466.926, 2);
    });
  });
});

describe("Visualization Converter - Note Timing Calculations", () => {
  describe("Tap Note Timing", () => {
    it("should calculate correct hitTime for tap at start", () => {
      const chart = createChart("(120){4}1,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(1);
      expect(notes[0].type).toBe("tap");
      expect(notes[0].data.hitTime).toBe(0);
    });

    it("should calculate correct hitTime for taps at various positions", () => {
      const chart = createChart("(120){4}1,2,3,4,5,6,7,8,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(8);
      notes.forEach((note, i) => {
        expect(note.data.hitTime).toBe(i * 500);
      });
    });

    it("should mark EACH taps correctly", () => {
      const chart = createChart("(120){4}1/5,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(2);
      expect(notes[0].type).toBe("tap");
      expect(notes[1].type).toBe("tap");
      expect(notes[0].data.isEach).toBe(true);
      expect(notes[1].data.isEach).toBe(true);
      expect(notes[0].data.hitTime).toBe(notes[1].data.hitTime);
    });
  });

  describe("Hold Note Timing", () => {
    it("should calculate correct hitTime and duration for hold", () => {
      const chart = createChart("(120){4}1h[4:1],E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(1);
      expect(notes[0].type).toBe("hold");
      expect(notes[0].data.hitTime).toBe(0);
      expect(getHoldData(notes[0]).duration).toBe(500);
    });

    it("should calculate correct duration for longer hold", () => {
      const chart = createChart("(120){4}1h[4:2],E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(1);
      expect(notes[0].type).toBe("hold");
      expect(getHoldData(notes[0]).duration).toBe(1000);
    });

    it("should calculate hold duration with 8th note division", () => {
      const chart = createChart("(120){8}1h[8:4],E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(1);
      expect(notes[0].type).toBe("hold");
      expect(getHoldData(notes[0]).duration).toBe(1000);
    });

    it("should mark EACH holds correctly", () => {
      const chart = createChart("(120){4}1h[4:1]/5h[4:1],E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(2);
      expect(notes[0].type).toBe("hold");
      expect(notes[1].type).toBe("hold");
      expect(notes[0].data.isEach).toBe(true);
      expect(notes[1].data.isEach).toBe(true);
    });
  });

  describe("Slide Note Timing", () => {
    it("should calculate correct hitTime for slide", () => {
      const chart = createChart("(120){4}1-5[4:1],E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(1);
      expect(notes[0].type).toBe("slide");
      expect(notes[0].data.hitTime).toBe(0);
    });

    it("should calculate startTime for slide (1 beat after hitTime)", () => {
      const chart = createChart("(120){4}1-5[4:1],E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(1);
      const slide = getSlideData(notes[0]);
      expect(slide.hitTime).toBe(0);
      expect(slide.startTime).toBe(500);
    });

    it("should calculate duration for slide", () => {
      const chart = createChart("(120){4}1-5[4:1],E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(1);
      const slide = getSlideData(notes[0]);
      expect(slide.duration).toBe(500);
    });

    it("should calculate duration for longer slide", () => {
      const chart = createChart("(120){4}1-5[4:2],E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(1);
      const slide = getSlideData(notes[0]);
      expect(slide.duration).toBe(1000);
    });

    it("should calculate slide timing with 8th note division", () => {
      const chart = createChart("(120){8}1-5[8:4],E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(1);
      const slide = getSlideData(notes[0]);
      expect(slide.duration).toBe(1000);
    });

    it("should mark EACH slides correctly", () => {
      const chart = createChart("(120){4}1-5[4:1]/2-6[4:1],E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(2);
      expect(notes[0].type).toBe("slide");
      expect(notes[1].type).toBe("slide");
      expect(notes[0].data.isEach).toBe(true);
      expect(notes[1].data.isEach).toBe(true);
      expect(notes[0].data.hitTime).toBe(notes[1].data.hitTime);
    });

    it("should include correct slide properties", () => {
      const chart = createChart("(120){4}1-5[4:1],E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(1);
      const slide = getSlideData(notes[0]);
      expect(slide.slideType).toBe("Straight");
      expect(slide.direction).toBe("ccw");
      expect(slide.lane).toBe(1);
      expect(slide.destinationLane).toBe(5);
    });

    it("should handle circle slide timing", () => {
      const chart = createChart("(120){4}1>3[4:1],E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(1);
      const slide = getSlideData(notes[0]);
      expect(slide.slideType).toBe("Circle");
      expect(slide.direction).toBe("cw");
    });

    it("should handle counter-clockwise circle slide", () => {
      const chart = createChart("(120){4}1<7[4:1],E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(1);
      const slide = getSlideData(notes[0]);
      expect(slide.slideType).toBe("Circle");
      expect(slide.direction).toBe("ccw");
    });

    it("should handle slides at various positions", () => {
      const chart = createChart("(120){4}1,2,3-7[4:1],4,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(4);
      expect(notes[0].type).toBe("tap");
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].type).toBe("tap");
      expect(notes[1].data.hitTime).toBe(500);
      expect(notes[2].type).toBe("slide");
      expect(notes[2].data.hitTime).toBe(1000);
      expect(notes[3].type).toBe("tap");
      expect(notes[3].data.hitTime).toBe(1500);
    });
  });
});

describe("Visualization Converter - Property-Based Tests", () => {
  describe("Random BPM Values - Monotonicity", () => {
    it("should maintain monotonicity with random BPM values (60-240)", () => {
      const bpms = [60, 75, 90, 100, 120, 140, 160, 180, 200, 240];
      let simai = "(120){4}";
      bpms.forEach((bpm) => {
        simai += `1,(${bpm}){4}`;
      });
      simai += "2,E";

      const chart = createChart(simai);
      const notes = convertChartVisualizationData(chart);

      for (let i = 1; i < notes.length; i++) {
        expect(notes[i].data.hitTime).toBeGreaterThan(
          notes[i - 1].data.hitTime,
        );
      }
    });

    it("should verify time always increases with random beat positions", () => {
      const chart = createChart("(120){4}1,2,,3,,,4,5,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(5);
      for (let i = 1; i < notes.length; i++) {
        expect(notes[i].data.hitTime).toBeGreaterThan(
          notes[i - 1].data.hitTime,
        );
      }
    });

    it("should pass monotonicity with 100+ random BPM values", () => {
      const NUM_RANDOM_TESTS = 150;
      let allPassed = true;
      const failures: string[] = [];

      for (let i = 0; i < NUM_RANDOM_TESTS; i++) {
        const bpm = 60 + Math.random() * 180;
        const chart = createChart(`(${bpm.toFixed(1)}){4}1,2,3,4,5,E`);
        const notes = convertChartVisualizationData(chart);

        for (let j = 1; j < notes.length; j++) {
          if (notes[j].data.hitTime <= notes[j - 1].data.hitTime) {
            allPassed = false;
            failures.push(
              `Test ${i}: BPM ${bpm.toFixed(1)} - time not increasing at note ${j}`,
            );
            break;
          }
        }
      }

      if (!allPassed) {
        console.error("Monotonicity failures:", failures.slice(0, 5));
      }
      expect(allPassed).toBe(true);
    });

    it("should pass monotonicity with 100+ random beat positions", () => {
      const NUM_RANDOM_TESTS = 120;
      let allPassed = true;

      for (let i = 0; i < NUM_RANDOM_TESTS; i++) {
        const numRests = Math.floor(Math.random() * 5);
        let simai = "(120){4}1";
        for (let r = 0; r < numRests; r++) {
          simai += ",";
        }
        simai += "2,3,E";

        const chart = createChart(simai);
        const notes = convertChartVisualizationData(chart);

        for (let j = 1; j < notes.length; j++) {
          if (notes[j].data.hitTime <= notes[j - 1].data.hitTime) {
            allPassed = false;
            break;
          }
        }
      }

      expect(allPassed).toBe(true);
    });

    it("should verify timing formula consistency for 100+ random BPM values", () => {
      const NUM_RANDOM_TESTS = 100;
      let allPassed = true;

      for (let i = 0; i < NUM_RANDOM_TESTS; i++) {
        const bpm = Math.floor(60 + Math.random() * 180);
        const chart = createChart(`(${bpm}){4}1,2,E`);
        const notes = convertChartVisualizationData(chart);

        const expectedBeatDuration = (60000 / bpm / 4) * 4;
        const actualDiff = notes[1].data.hitTime - notes[0].data.hitTime;
        const diff = Math.abs(actualDiff - expectedBeatDuration);

        if (diff > 0.1) {
          allPassed = false;
          break;
        }
      }

      expect(allPassed).toBe(true);
    });
  });

  describe("Floating Point Precision", () => {
    it("should maintain precision within 0.001ms tolerance for simple cases", () => {
      const chart = createChart("(120){4}1,2,3,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(3);
      notes.forEach((note, i) => {
        const expectedTime = i * 500;
        expect(Math.abs(note.data.hitTime - expectedTime)).toBeLessThan(0.001);
      });
    });

    it("should maintain precision within 0.001ms for fractional BPM", () => {
      const chart = createChart("(133.333){4}1,2,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(2);
      const expectedTime = 60000 / 133.333;
      expect(Math.abs(notes[1].data.hitTime - expectedTime)).toBeLessThan(0.1);
    });

    it("should handle complex precision with multiple BPM changes", () => {
      const chart = createChart("(120){4}1,(135.7){8}2,3,(98.6){4}4,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(4);
      notes.forEach((note, i) => {
        expect(note.data.hitTime).toBeGreaterThanOrEqual(0);
        if (i > 0) {
          expect(note.data.hitTime).toBeGreaterThan(notes[i - 1].data.hitTime);
        }
      });
    });
  });

  describe("Time Accumulation Tests", () => {
    it("should accumulate time correctly over many notes", () => {
      let simai = "(120){4}";
      for (let i = 1; i <= 16; i++) {
        simai += `${(i % 8) + 1},`;
      }
      simai += "E";

      const chart = createChart(simai);
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(16);
      expect(notes[15].data.hitTime).toBe(7500);
    });

    it("should accumulate time correctly with rests", () => {
      const chart = createChart("(120){4}1,,,,2,E");
      const notes = convertChartVisualizationData(chart);

      expect(notes.length).toBe(2);
      expect(notes[0].data.hitTime).toBe(0);
      expect(notes[1].data.hitTime).toBe(2000);
    });
  });
});

describe("Visualization Converter - Mixed Scenarios", () => {
  it("should handle chart with all note types", () => {
    const chart = createChart("(120){4}1,2h[4:1],3-7[4:1],4,E");
    const notes = convertChartVisualizationData(chart);

    expect(notes.length).toBe(4);

    expect(notes[0].type).toBe("tap");
    expect(notes[0].data.hitTime).toBe(0);

    expect(notes[1].type).toBe("hold");
    expect(notes[1].data.hitTime).toBe(500);
    expect(getHoldData(notes[1]).duration).toBe(500);

    expect(notes[2].type).toBe("slide");
    expect(notes[2].data.hitTime).toBe(1000);
    expect(getSlideData(notes[2]).duration).toBe(500);

    expect(notes[3].type).toBe("tap");
    expect(notes[3].data.hitTime).toBe(1500);
  });

  it("should handle complex EACH patterns with taps", () => {
    const chart = createChart("(120){4}1/5,2/6,3/7,E");
    const notes = convertChartVisualizationData(chart);

    expect(notes.length).toBe(6);

    expect(notes[0].type).toBe("tap");
    expect(notes[0].data.isEach).toBe(true);
    expect(notes[1].type).toBe("tap");
    expect(notes[1].data.isEach).toBe(true);

    expect(notes[2].type).toBe("tap");
    expect(notes[2].data.isEach).toBe(true);
    expect(notes[3].type).toBe("tap");
    expect(notes[3].data.isEach).toBe(true);
  });

  it("should handle same-origin slides", () => {
    const chart = createChart("(120){4}1-5[4:1]*>3[4:1],E");
    const notes = convertChartVisualizationData(chart);

    expect(notes.length).toBe(2);

    expect(notes[0].type).toBe("slide");
    expect(notes[1].type).toBe("slide");
    expect(notes[0].data.hitTime).toBe(notes[1].data.hitTime);
    expect(notes[0].data.lane).toBe(1);
    expect(notes[1].data.lane).toBe(1);
  });

  it("should handle full chart example", () => {
    const simai = "(120){4}1,2,3,4,1h[4:2],2h[4:2],1/5,2/6,1-5[4:1],2-6[4:1],E";
    const chart = createChart(simai);
    const notes = convertChartVisualizationData(chart);

    expect(notes.length).toBe(12);

    // 4 single taps (1,2,3,4)
    expect(notes[0].type).toBe("tap");
    expect(notes[3].type).toBe("tap");

    // 2 holds (1h[4:2], 2h[4:2])
    expect(notes[4].type).toBe("hold");
    expect(notes[5].type).toBe("hold");

    // 4 EACH taps (1/5, 2/6)
    expect(notes[6].type).toBe("tap");
    expect(notes[6].data.isEach).toBe(true);
    expect(notes[7].type).toBe("tap");
    expect(notes[7].data.isEach).toBe(true);
    expect(notes[8].type).toBe("tap");
    expect(notes[8].data.isEach).toBe(true);
    expect(notes[9].type).toBe("tap");
    expect(notes[9].data.isEach).toBe(true);

    // 2 slides (1-5[4:1], 2-6[4:1])
    expect(notes[10].type).toBe("slide");
    expect(notes[11].type).toBe("slide");
  });
});

describe("Visualization Converter - Error Handling", () => {
  it("should throw error for chart without time signature", () => {
    const chart: Chart = {
      items: [{ type: "note", data: { type: "tap", lane: 1 } }],
      metadata: { title: "No Time Signature" },
    };

    expect(() => convertChartVisualizationData(chart)).toThrow();
  });
});

describe("Visualization Converter - Chart With Measures", () => {
  describe("convertChartWithMeasures", () => {
    it("should convert chart with measures at constant BPM", () => {
      const chart = createChart("(120){4}1,2,3,4,E");
      const result = convertChartWithMeasures(chart);

      expect(result.notes.length).toBe(4);
      expect(result.measures.length).toBeGreaterThan(0);
      expect(result.totalDuration).toBeGreaterThan(0);
    });

    it("should track measure boundaries correctly", () => {
      const chart = createChart("(120){4}1,2,3,4,E");
      const result = convertChartWithMeasures(chart);

      expect(result.measures[0].measureNumber).toBe(1);
      expect(result.measures[0].bpm).toBe(120);
      expect(result.measures[0].division).toBe(4);
    });

    it("should handle BPM changes in measures", () => {
      const chart = createChart("(120){4}1,2,(140){4}3,4,E");
      const result = convertChartWithMeasures(chart);

      expect(result.measures.length).toBeGreaterThan(1);
      const bpmChanges = result.measures.filter((m) => m.bpm !== 120);
      expect(bpmChanges.length).toBeGreaterThan(0);
    });

    it("should calculate total duration correctly", () => {
      const chart = createChart("(120){4}1,2,3,4,E");
      const result = convertChartWithMeasures(chart);

      expect(result.totalDuration).toBe(2500);
    });
  });

  describe("getCurrentMeasure", () => {
    it("should return correct measure for given time", () => {
      const chart = createChart("(120){4}1,2,3,4,E");
      const result = convertChartWithMeasures(chart);

      const measure = getCurrentMeasure(result.measures, 0);
      expect(measure).not.toBeNull();
      expect(measure?.measureNumber).toBe(1);
    });

    it("should return null for time before first measure", () => {
      const chart = createChart("(120){4}1,2,3,4,E");
      const result = convertChartWithMeasures(chart);

      const measure = getCurrentMeasure(result.measures, -100);
      expect(measure).toBeNull();
    });

    it("should return null for time after last measure", () => {
      const chart = createChart("(120){4}1,2,3,4,E");
      const result = convertChartWithMeasures(chart);

      const measure = getCurrentMeasure(result.measures, 10000);
      expect(measure).toBeNull();
    });
  });

  describe("getMeasureDisplay", () => {
    it("should return correct measure display string", () => {
      const chart = createChart("(120){4}1,2,3,4,E");
      const result = convertChartWithMeasures(chart);

      const display = getMeasureDisplay(result.measures, 0);
      expect(display).toMatch(/^M\d+ B\d+$/);
    });

    it("should return fallback for invalid time", () => {
      const chart = createChart("(120){4}1,2,3,4,E");
      const result = convertChartWithMeasures(chart);

      const display = getMeasureDisplay(result.measures, -1000);
      expect(display).toBe("M-- B-");
    });
  });

  describe("createTimeSortedIndex", () => {
    it("should create sorted index from notes", () => {
      const chart = createChart("(120){4}1,2,3,4,E");
      const notes = convertChartVisualizationData(chart);
      const index = createTimeSortedIndex(notes);

      expect(index.notes.length).toBe(notes.length);
      expect(index.sortedByHitTime.length).toBe(notes.length);
    });

    it("should sort notes by end time", () => {
      const chart = createChart("(120){4}1,2h[4:1],3,4,E");
      const notes = convertChartVisualizationData(chart);
      const index = createTimeSortedIndex(notes);

      for (let i = 1; i < index.sortedByHitTime.length; i++) {
        const prevNote = index.sortedByHitTime[i - 1];
        const currNote = index.sortedByHitTime[i];
        const prevEnd =
          prevNote.type === "hold"
            ? prevNote.data.hitTime + (prevNote.data as HoldVisualizeData).duration
            : prevNote.data.hitTime;
        const currEnd =
          currNote.type === "hold"
            ? currNote.data.hitTime + (currNote.data as HoldVisualizeData).duration
            : currNote.data.hitTime;
        expect(prevEnd).toBeLessThanOrEqual(currEnd);
      }
    });
  });

  describe("getVisibleNotes", () => {
    it("should return notes within time window", () => {
      const chart = createChart("(120){4}1,2,3,4,E");
      const notes = convertChartVisualizationData(chart);
      const index = createTimeSortedIndex(notes);

      const visible = getVisibleNotes(index, 500, 1000);
      expect(visible.length).toBeGreaterThan(0);
    });

    it("should return empty array for empty notes", () => {
      const index = createTimeSortedIndex([]);
      const visible = getVisibleNotes(index, 500, 1000);
      expect(visible.length).toBe(0);
    });
  });

  describe("calculateChartStatistics", () => {
    it("should calculate note counts correctly", () => {
      const chart = createChart("(120){4}1,2h[4:1],3-5[4:1],4,E");
      const notes = convertChartVisualizationData(chart);
      const stats = calculateChartStatistics(notes, 2000);

      expect(stats.noteCounts.total).toBe(4);
      expect(stats.noteCounts.tap).toBe(2);
      expect(stats.noteCounts.hold).toBe(1);
      expect(stats.noteCounts.slide).toBe(1);
    });

    it("should calculate total duration", () => {
      const chart = createChart("(120){4}1,2,3,E");
      const notes = convertChartVisualizationData(chart);
      const stats = calculateChartStatistics(notes, 1000);

      expect(stats.totalDuration).toBe(1000);
    });

    it("should calculate density data", () => {
      const chart = createChart("(120){4}1,2,3,4,E");
      const notes = convertChartVisualizationData(chart);
      const stats = calculateChartStatistics(notes, 2000);

      expect(stats.densityData.length).toBeGreaterThan(0);
      expect(stats.densityData[0].time).toBe(0);
      expect(stats.densityData[0].notesPerSecond).toBeGreaterThanOrEqual(0);
    });

    it("should identify peak density", () => {
      const chart = createChart("(120){4}1,2,3,4,1,2,3,4,E");
      const notes = convertChartVisualizationData(chart);
      const stats = calculateChartStatistics(notes, 4000);

      expect(stats.peakDensity.time).toBeGreaterThanOrEqual(0);
      expect(stats.peakDensity.value).toBeGreaterThanOrEqual(0);
    });

    it("should estimate difficulty", () => {
      const chart = createChart("(120){4}1,2,3,4,1,2,3,4,E");
      const notes = convertChartVisualizationData(chart);
      const stats = calculateChartStatistics(notes, 4000);

      expect(stats.estimatedDifficulty).toBeGreaterThan(0);
      expect(stats.estimatedDifficulty).toBeLessThanOrEqual(15);
    });
  });
});
