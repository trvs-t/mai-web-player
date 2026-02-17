/**
 * Test fixtures for mai-web-charter simai chart parsing.
 * These are complete, valid simai chart strings that can be parsed
 * by the parseSimaiChart function.
 */

/**
 * Single tap note on lane 1.
 * Expected result: One tap note at BPM 120, 4th division.
 */
export const SIMPLE_TAP = "(120){4}1,E";

/**
 * Single hold note on lane 1 with duration of 4 divisions at 1 count.
 * Expected result: One hold note with specified duration.
 */
export const SIMPLE_HOLD = "(120){4}1h[4:1],E";

/**
 * Single straight slide from lane 1 to lane 5.
 * Expected result: One slide note of type "Straight".
 */
export const SIMPLE_SLIDE = "(120){4}1-5[4:1],E";

/**
 * Simultaneous tap notes on lanes 1 and 5 (EACH).
 * Expected result: Array containing two tap notes.
 */
export const EACH_TAP = "(120){4}1/5,E";

/**
 * Break modifier tap on lane 1.
 * Expected result: Tap note with break modifier.
 */
export const BREAK_TAP = "(120){4}1b,E";

/**
 * BPM change mid-chart from 120 to 140.
 * Expected result: Chart with two time signatures.
 */
export const BPM_CHANGE = "(120){4}1,(140){4}2,E";

/**
 * Circle slide clockwise from lane 1 to lane 3.
 * Expected result: Slide note of type "Circle" with direction "cw".
 */
export const CIRCLE_SLIDE_CW = "(120){4}1>3[4:1],E";

/**
 * Circle slide counter-clockwise from lane 1 to lane 7.
 * Expected result: Slide note of type "Circle" with direction "ccw".
 */
export const CIRCLE_SLIDE_CCW = "(120){4}1<7[4:1],E";

/**
 * U-shape slide clockwise from lane 1 to lane 5.
 * Expected result: Slide note of type "U" with direction "cw".
 */
export const U_SLIDE_CW = "(120){4}1q5[4:1],E";

/**
 * U-shape slide counter-clockwise from lane 1 to lane 5.
 * Expected result: Slide note of type "U" with direction "ccw".
 */
export const U_SLIDE_CCW = "(120){4}1p5[4:1],E";

/**
 * CUP slide clockwise from lane 1 to lane 5.
 * Expected result: Slide note of type "CUP" with direction "cw".
 */
export const CUP_SLIDE_CW = "(120){4}1qq5[4:1],E";

/**
 * CUP slide counter-clockwise from lane 1 to lane 5.
 * Expected result: Slide note of type "CUP" with direction "ccw".
 */
export const CUP_SLIDE_CCW = "(120){4}1pp5[4:1],E";

/**
 * Thunder slide clockwise from lane 1 to lane 5.
 * Expected result: Slide note of type "Thunder" with direction "cw".
 */
export const THUNDER_SLIDE_CW = "(120){4}1z5[4:1],E";

/**
 * Thunder slide counter-clockwise from lane 1 to lane 5.
 * Expected result: Slide note of type "Thunder" with direction "ccw".
 */
export const THUNDER_SLIDE_CCW = "(120){4}1s5[4:1],E";

/**
 * V-shape slide from lane 1 to lane 5.
 * Expected result: Slide note of type "V".
 */
export const V_SLIDE = "(120){4}1v5[4:1],E";

/**
 * L-shape slide from lane 1 via lane 2 to lane 3.
 * Expected result: Slide note of type "L" with midpoint at lane 2.
 */
export const L_SLIDE = "(120){4}1V235[4:1],E";

/**
 * Auto-direction circle slide using ^ notation.
 * Expected result: Slide note of type "Circle" with auto-detected direction.
 */
export const AUTO_CIRCLE_SLIDE = "(120){4}1^5[4:1],E";

/**
 * Multiple slides from same origin (same-origin slides).
 * Expected result: Multiple slide notes all starting from lane 1.
 */
export const SAME_ORIGIN_SLIDES = "(120){4}1-5[4:1]*1>3[4:1],E";

/**
 * Complex chart with multiple note types.
 * Contains: tap, hold, slide, and EACH notes.
 */
export const COMPLEX_CHART = `
(120){4}
1,
2h[4:2],
[1/5],
3-7[4:1],
4>6[4:1],
E
`.trim();

/**
 * Chart with 8th note divisions instead of 4th.
 * Tests different time signature handling.
 */
export const EIGHTH_NOTE_CHART = "(120){8}1,2,3,4,E";

/**
 * Chart with fractional BPM (128.5).
 * Tests decimal BPM parsing.
 */
export const FRACTIONAL_BPM_CHART = "(128.5){4}1,2,E";

/**
 * Chart with rest notes (empty divisions).
 * Tests rest handling between notes.
 */
export const WITH_RESTS = "(120){4}1,,2,,3,E";

/**
 * Complete valid chart with metadata simulation.
 * This represents how a real chart might look with proper structure.
 */
export const FULL_CHART_EXAMPLE = `
(120){4}
1,2,3,4,
1h[4:2],2h[4:2],
[1/5],[2/6],
1-5[4:1],2-6[4:1],
1>3[4:1],2<8[4:1],
E
`.trim();

/**
 * All fixtures collection for batch testing.
 */
export const ALL_FIXTURES = [
  { name: "SIMPLE_TAP", simai: SIMPLE_TAP },
  { name: "SIMPLE_HOLD", simai: SIMPLE_HOLD },
  { name: "SIMPLE_SLIDE", simai: SIMPLE_SLIDE },
  { name: "EACH_TAP", simai: EACH_TAP },
  { name: "BREAK_TAP", simai: BREAK_TAP },
  { name: "BPM_CHANGE", simai: BPM_CHANGE },
  { name: "CIRCLE_SLIDE_CW", simai: CIRCLE_SLIDE_CW },
  { name: "CIRCLE_SLIDE_CCW", simai: CIRCLE_SLIDE_CCW },
  { name: "U_SLIDE_CW", simai: U_SLIDE_CW },
  { name: "U_SLIDE_CCW", simai: U_SLIDE_CCW },
  { name: "CUP_SLIDE_CW", simai: CUP_SLIDE_CW },
  { name: "CUP_SLIDE_CCW", simai: CUP_SLIDE_CCW },
  { name: "THUNDER_SLIDE_CW", simai: THUNDER_SLIDE_CW },
  { name: "THUNDER_SLIDE_CCW", simai: THUNDER_SLIDE_CCW },
  { name: "V_SLIDE", simai: V_SLIDE },
  { name: "L_SLIDE", simai: L_SLIDE },
  { name: "AUTO_CIRCLE_SLIDE", simai: AUTO_CIRCLE_SLIDE },
  { name: "SAME_ORIGIN_SLIDES", simai: SAME_ORIGIN_SLIDES },
  { name: "COMPLEX_CHART", simai: COMPLEX_CHART },
  { name: "EIGHTH_NOTE_CHART", simai: EIGHTH_NOTE_CHART },
  { name: "FRACTIONAL_BPM_CHART", simai: FRACTIONAL_BPM_CHART },
  { name: "WITH_RESTS", simai: WITH_RESTS },
  { name: "FULL_CHART_EXAMPLE", simai: FULL_CHART_EXAMPLE },
] as const;
