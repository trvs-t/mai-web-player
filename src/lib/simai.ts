import { getLaneDifference } from "@/utils/lane";
import {
  SlideType,
  holdItem,
  restItem,
  slideItem,
  tapItem,
  timeSignatureItem,
  touchItem,
  touchHoldItem,
  type Chart,
  type ChartMetadata,
} from "./chart";

/**
 * Custom error class for simai parsing errors with line/column information.
 */
export class SimaiParseError extends Error {
  line?: number;
  column?: number;
  severity: "error" | "warning";
  suggestion?: string;

  constructor(
    message: string,
    line?: number,
    column?: number,
    severity: "error" | "warning" = "error",
    suggestion?: string,
  ) {
    super(message);
    this.name = "SimaiParseError";
    this.line = line;
    this.column = column;
    this.severity = severity;
    this.suggestion = suggestion;
  }

  toString(): string {
    let result = `${this.name}: ${this.message}`;
    if (this.line !== undefined) {
      result += ` (line ${this.line}`;
      if (this.column !== undefined) {
        result += `, column ${this.column}`;
      }
      result += `)`;
    }
    if (this.suggestion) {
      result += `\n  Suggestion: ${this.suggestion}`;
    }
    return result;
  }
}

/**
 * Result type for parsing operations that may contain errors.
 */
export interface ParseResult {
  items: Chart["items"];
  errors: SimaiParseError[];
  warnings: SimaiParseError[];
}

/**
 * Context for tracking parse position and collecting errors.
 */
interface ParseContext {
  line: number;
  column: number;
  errors: SimaiParseError[];
  warnings: SimaiParseError[];
}

function createParseContext(): ParseContext {
  return {
    line: 1,
    column: 1,
    errors: [],
    warnings: [],
  };
}

function addError(
  ctx: ParseContext,
  message: string,
  line?: number,
  column?: number,
  suggestion?: string,
) {
  ctx.errors.push(
    new SimaiParseError(
      message,
      line ?? ctx.line,
      column ?? ctx.column,
      "error",
      suggestion,
    ),
  );
}

function addWarning(
  ctx: ParseContext,
  message: string,
  line?: number,
  column?: number,
  suggestion?: string,
) {
  ctx.warnings.push(
    new SimaiParseError(
      message,
      line ?? ctx.line,
      column ?? ctx.column,
      "warning",
      suggestion,
    ),
  );
}

export function parseMetadata(input: string): {
  metadata: ChartMetadata;
  notes: string;
  errors: SimaiParseError[];
} {
  const metadata: ChartMetadata = {};
  const lines = input.split(/\r?\n/);
  const noteLines: string[] = [];
  const errors: SimaiParseError[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const trimmed = line.trim();
    const lineNumber = lineIndex + 1;

    if (trimmed.startsWith("&")) {
      const match = trimmed.match(/^&([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        switch (key.toLowerCase()) {
          case "title":
            metadata.title = value;
            break;
          case "artist":
            metadata.artist = value;
            break;
          case "bpm":
            const bpm = parseFloat(value);
            if (!isNaN(bpm)) {
              if (bpm <= 0) {
                errors.push(
                  new SimaiParseError(
                    `Invalid BPM value: ${bpm}. BPM must be positive.`,
                    lineNumber,
                    1,
                    "error",
                  ),
                );
              } else {
                metadata.bpm = bpm;
              }
            } else {
              errors.push(
                new SimaiParseError(
                  `Invalid BPM value: "${value}". Expected a number.`,
                  lineNumber,
                  1,
                  "error",
                ),
              );
            }
            break;
          case "charter":
            metadata.charter = value;
            break;
          case "difficulty":
            metadata.difficulty = value;
            break;
        }
        continue;
      } else {
        errors.push(
          new SimaiParseError(
            `Malformed header line: "${trimmed}". Expected format: &key=value`,
            lineNumber,
            1,
            "warning",
          ),
        );
      }
    }

    if (trimmed.startsWith("#")) {
      const comment = trimmed.slice(1).trim();
      const match = comment.match(/^([^:=]+)[:=](.*)$/);
      if (match) {
        const [, key, value] = match;
        const normalizedKey = key.trim().toLowerCase();
        const normalizedValue = value.trim();

        switch (normalizedKey) {
          case "title":
            metadata.title = normalizedValue;
            break;
          case "artist":
            metadata.artist = normalizedValue;
            break;
          case "bpm":
            const bpm = parseFloat(normalizedValue);
            if (!isNaN(bpm)) {
              if (bpm <= 0) {
                errors.push(
                  new SimaiParseError(
                    `Invalid BPM value: ${bpm}. BPM must be positive.`,
                    lineNumber,
                    1,
                    "error",
                  ),
                );
              } else {
                metadata.bpm = bpm;
              }
            } else {
              errors.push(
                new SimaiParseError(
                  `Invalid BPM value: "${normalizedValue}". Expected a number.`,
                  lineNumber,
                  1,
                  "error",
                ),
              );
            }
            break;
          case "charter":
          case "mapper":
          case "author":
            metadata.charter = normalizedValue;
            break;
          case "difficulty":
          case "level":
            metadata.difficulty = normalizedValue;
            break;
        }
        continue;
      }
    }

    if (trimmed) {
      noteLines.push(line);
    }
  }

  const notes = noteLines.join("\n");

  return { metadata, notes, errors };
}

export function parseSimaiChart(i_note: string): Chart["items"] {
  const parts = i_note
    .replace(/\n/g, "")
    .replace(/\t/g, "")
    .replace(/ /g, "")
    .trim()
    .split(",");
  const result = parts.map(parseSimaiNote).flat();
  return result;
}

export function parseSimaiChartWithErrors(i_note: string): {
  items: Chart["items"];
  errors: SimaiParseError[];
} {
  const errors: SimaiParseError[] = [];
  const parts = i_note
    .replace(/\n/g, "")
    .replace(/\t/g, "")
    .replace(/ /g, "")
    .trim()
    .split(",");

  const result = parts
    .map((part, index) => {
      const items = parseSimaiNoteWithErrors(part, index, errors);
      return items;
    })
    .flat();

  return { items: result, errors };
}

export function parseSimai(
  input: string,
): Chart & { errors: SimaiParseError[] } {
  const { metadata, notes, errors: metadataErrors } = parseMetadata(input);
  const { items, errors: chartErrors } = parseSimaiChartWithErrors(notes);
  return {
    metadata,
    items,
    errors: [...metadataErrors, ...chartErrors],
  };
}

export function exportMetadata(metadata: ChartMetadata): string {
  const lines: string[] = [];

  if (metadata.title) {
    lines.push(`&title=${metadata.title}`);
  }
  if (metadata.artist) {
    lines.push(`&artist=${metadata.artist}`);
  }
  if (metadata.bpm) {
    lines.push(`&bpm=${metadata.bpm}`);
  }
  if (metadata.charter) {
    lines.push(`&charter=${metadata.charter}`);
  }
  if (metadata.difficulty) {
    lines.push(`&difficulty=${metadata.difficulty}`);
  }

  return lines.join("\n");
}

const timeSignatureExp = /^(?:\((\d+\.?\d+)\))?(?:\{(\d+)\})?(.*)$/;
const touchExp =
  /^(?<zone>[A-E])(?<position>[1-8])?(?<hold>h)?(?<hanabi>f)?(?<duration>\[(?<bpm>\d+(?:#))?(?<division>\d+):(?<count>\d+)\])?$/;
const noteExp =
  /^(?<lane>[1-8])(?<modifiers>[bx]*)(?<visibility>[?!]?)(?:(?<hold>h.*)|(?<slide>(?:[-<>pqszvwV^]|pp|qq).*))?$/;
const holdExp =
  /^h(?<duration>\[(?:(?<bpm>\d+)#)?(?<division>\d+):(?<count>\d+)\])?$/;
const slideExp =
  /^(?<type>[-<>pqszvwV^]|pp|qq)(?<mid>[1-8])?(?<dest>[1-8])(?<duration>\[(?:(?<bpm>\d+)#)?(?<division>\d+):(?<count>\d+)\])?$/;

function convertSlideType(data: {
  lane: number;
  type: string;
  mid?: number;
  dest: number;
}): { type: SlideType; direction: "cw" | "ccw" } | undefined {
  const { lane, type, mid, dest } = data;
  switch (type) {
    case "-":
      return { type: "Straight", direction: "ccw" };
    case "<":
      return { type: "Circle", direction: "ccw" };
    case ">":
      return { type: "Circle", direction: "cw" };
    case "p":
      return { type: "U", direction: "ccw" };
    case "q":
      return { type: "U", direction: "cw" };
    case "s":
      return { type: "Thunder", direction: "ccw" };
    case "z":
      return { type: "Thunder", direction: "cw" };
    case "v":
      return { type: "V", direction: "ccw" };
    case "w":
      return { type: "WiFi", direction: "ccw" };
    case "V":
      if (!mid) return;
      const midDistance = mid - lane + (mid < lane ? 8 : 0);
      return { type: "L", direction: midDistance == 2 ? "cw" : "ccw" };
    case "pp":
      return { type: "CUP", direction: "ccw" };
    case "qq":
      return { type: "CUP", direction: "cw" };
    case "^":
      const diff = getLaneDifference(lane, dest);
      return {
        type: "Circle",
        direction: diff == 7 ? "cw" : diff < 4 ? "cw" : "ccw",
      };
  }
}

function parseSimaiNote(str: string): Chart["items"] {
  const note = str.trim();
  if (note.length === 0) {
    return [restItem(1)];
  }
  const timeSignatureMatch = note.match(timeSignatureExp);
  if (!timeSignatureMatch) return [];
  const [, bpm, division, body] = timeSignatureMatch;
  const parts = body.split("/");
  const parsedBody = [];
  for (const part of parts) {
    const touchMatch = part.match(touchExp);
    if (touchMatch?.groups) {
      const { zone, position, hold, hanabi, duration, bpm: touchBpm, division: touchDivision, count } =
        touchMatch.groups;
      
      const isEndMarker = !position && !hold && zone === "E";
      if (!isEndMarker) {
        const zoneTyped = zone as "A" | "B" | "C" | "D" | "E";
        const positionNum = position ? +position : 1;
        const isHanabi = !!hanabi;

        if (hold) {
          if (!duration) {
            console.warn("Touch hold without duration");
            parsedBody.push(
              touchHoldItem(zoneTyped, positionNum, { division: 8, divisionCount: 0 }, isHanabi),
            );
            continue;
          }
          parsedBody.push(
            touchHoldItem(zoneTyped, positionNum, {
              bpm: touchBpm ? +touchBpm.replace("#", "") : undefined,
              division: +touchDivision,
              divisionCount: +count,
            }, isHanabi),
          );
        } else {
          parsedBody.push(touchItem(zoneTyped, positionNum, isHanabi));
        }
        continue;
      }
    }

    const noteMatch = part.match(noteExp);
    if (noteMatch?.groups) {
      const { lane, hold, slide, visibility } = noteMatch.groups;
      const starVisibility = visibility === "?" ? "fadeIn" : visibility === "!" ? "hidden" : "normal";
      if (hold) {
        const { duration, bpm, division, count } =
          hold.match(holdExp)?.groups ?? {};
        if (!duration) {
          console.warn("Hold note without duration");
          parsedBody.push(
            holdItem(+lane, {
              division: 8,
              divisionCount: 0,
            }),
          );
          continue;
        }
        parsedBody.push(
          holdItem(+lane, {
            bpm: bpm ? +bpm : undefined,
            division: +division,
            divisionCount: +count,
          }),
        );
      } else if (slide) {
        const slideParts = slide.split("*");
        for (const slidePart of slideParts) {
          const { type, mid, dest, duration, bpm, division, count } =
            slidePart.match(slideExp)?.groups ?? {};
          if (!duration) {
            console.error("Slide note without duration", slidePart);
            continue;
          }
          const conversion = convertSlideType({
            lane: +lane,
            type,
            mid: +mid,
            dest: +dest,
          });
          if (!conversion) {
            continue;
          }
          const { type: convertedType, direction } = conversion;
          parsedBody.push(
            slideItem(
              +lane,
              {
                bpm: bpm ? +bpm : undefined,
                division: +division,
                divisionCount: +count,
              },
              convertedType,
              direction,
              +dest,
              starVisibility,
            ),
          );
        }
      } else {
        parsedBody.push(tapItem(+lane));
      }
    }
  }

  const result = parsedBody.length ? parsedBody : restItem(1);

  return division ? [timeSignatureItem(bpm, division), result] : [result];
}

function parseSimaiNoteWithErrors(
  str: string,
  noteIndex: number,
  errors: SimaiParseError[],
): Chart["items"] {
  const note = str.trim();
  if (note.length === 0) {
    return [restItem(1)];
  }

  const timeSignatureMatch = note.match(timeSignatureExp);
  if (!timeSignatureMatch) {
    errors.push(
      new SimaiParseError(
        `Invalid time signature in note: "${note.substring(0, 20)}"`,
        undefined,
        undefined,
        "error",
        "Time signature should be in format (BPM){division} like (120){4}",
      ),
    );
    return [];
  }

  const [, bpm, division, body] = timeSignatureMatch;

  if (bpm) {
    const bpmValue = parseFloat(bpm);
    if (isNaN(bpmValue)) {
      errors.push(
        new SimaiParseError(
          `Invalid BPM value: "${bpm}"`,
          undefined,
          undefined,
          "error",
          "BPM must be a positive number like 120 or 128.5",
        ),
      );
    } else if (bpmValue <= 0) {
      errors.push(
        new SimaiParseError(
          `BPM must be positive, got: ${bpmValue}`,
          undefined,
          undefined,
          "error",
        ),
      );
    }
  }

  if (division) {
    const divValue = parseInt(division, 10);
    if (isNaN(divValue) || divValue <= 0) {
      errors.push(
        new SimaiParseError(
          `Invalid division value: "${division}"`,
          undefined,
          undefined,
          "error",
          "Division must be a positive integer like 4, 8, or 16",
        ),
      );
    }
  }

  const parts = body.split("/");
  const parsedBody: Chart["items"] = [];

  for (const part of parts) {
    const touchMatch = part.match(touchExp);
    if (touchMatch?.groups) {
      const { zone, position, hold, hanabi, duration, bpm, division, count } =
        touchMatch.groups;
      
      const isEndMarker = !position && !hold && zone === "E";
      if (isEndMarker) {
        continue;
      }
      
      const zoneTyped = zone as "A" | "B" | "C" | "D" | "E";
      const positionNum = position ? +position : 1;
      const isHanabi = !!hanabi;

      if (hold) {
        if (!duration) {
          errors.push(
            new SimaiParseError(
              `Touch hold missing duration`,
              undefined,
              undefined,
              "warning",
              "Add duration like Ch[4:1]",
            ),
          );
          parsedBody.push(
            touchHoldItem(zoneTyped, positionNum, { division: 8, divisionCount: 0 }, isHanabi),
          );
          continue;
        }
        const divValue = parseInt(division, 10);
        const countValue = parseInt(count, 10);
        if (isNaN(divValue) || divValue <= 0) {
          errors.push(
            new SimaiParseError(
              `Invalid touch hold division: "${division}"`,
              undefined,
              undefined,
              "error",
            ),
          );
        }
        if (isNaN(countValue) || countValue < 0) {
          errors.push(
            new SimaiParseError(
              `Invalid touch hold count: "${count}"`,
              undefined,
              undefined,
              "error",
            ),
          );
        }
        parsedBody.push(
          touchHoldItem(zoneTyped, positionNum, {
            bpm: bpm ? +bpm.replace("#", "") : undefined,
            division: divValue,
            divisionCount: countValue,
          }, isHanabi),
        );
      } else {
        parsedBody.push(touchItem(zoneTyped, positionNum, isHanabi));
      }
      continue;
    }

    const noteMatch = part.match(noteExp);
    if (noteMatch?.groups) {
      const { lane, hold, slide, visibility } = noteMatch.groups;
      const starVisibility = visibility === "?" ? "fadeIn" : visibility === "!" ? "hidden" : "normal";
      const laneNum = parseInt(lane, 10);

      if (isNaN(laneNum) || laneNum < 1 || laneNum > 8) {
        errors.push(
          new SimaiParseError(
            `Invalid lane number: "${lane}". Lanes must be 1-8.`,
            undefined,
            undefined,
            "error",
            "Use numbers 1-8 for the 8 lanes on the ring",
          ),
        );
        continue;
      }

      if (hold) {
        const holdMatch = hold.match(holdExp);
        if (!holdMatch) {
          errors.push(
            new SimaiParseError(
              `Invalid hold note syntax: "${hold.substring(0, 30)}"`,
              undefined,
              undefined,
              "error",
              "Hold duration format: h[division:count] like h[4:1] or h[180#4:1] for custom BPM",
            ),
          );
          parsedBody.push(
            holdItem(laneNum, {
              division: 8,
              divisionCount: 0,
            }),
          );
          continue;
        }

        const { duration, bpm, division, count } = holdMatch.groups ?? {};

        if (!duration) {
          errors.push(
            new SimaiParseError(
              `Hold note missing duration: "${hold}"`,
              undefined,
              undefined,
              "warning",
              "Add duration like h[4:1]. Using default duration.",
            ),
          );
          parsedBody.push(
            holdItem(laneNum, {
              division: 8,
              divisionCount: 0,
            }),
          );
          continue;
        }

        const divValue = parseInt(division, 10);
        const countValue = parseInt(count, 10);

        if (isNaN(divValue) || divValue <= 0) {
          errors.push(
            new SimaiParseError(
              `Invalid hold division: "${division}"`,
              undefined,
              undefined,
              "error",
              "Division must be a positive integer",
            ),
          );
        }

        if (isNaN(countValue) || countValue < 0) {
          errors.push(
            new SimaiParseError(
              `Invalid hold count: "${count}"`,
              undefined,
              undefined,
              "error",
              "Count must be a non-negative integer",
            ),
          );
        }

        parsedBody.push(
          holdItem(laneNum, {
            bpm: bpm ? +bpm : undefined,
            division: divValue,
            divisionCount: countValue,
          }),
        );
      } else if (slide) {
        const slideParts = slide.split("*");
        for (const slidePart of slideParts) {
          const slideMatch = slidePart.match(slideExp);
          if (!slideMatch) {
            errors.push(
              new SimaiParseError(
                `Invalid slide syntax: "${slidePart.substring(0, 30)}"`,
                undefined,
                undefined,
                "error",
                "Slide format: lane type dest[division:count] like 1-5[4:1]",
              ),
            );
            continue;
          }

          const { type, mid, dest, duration, bpm, division, count } =
            slideMatch.groups ?? {};

          if (!duration) {
            errors.push(
              new SimaiParseError(
                `Slide missing duration: "${slidePart}". Slides require [division:count].`,
                undefined,
                undefined,
                "error",
                "Add duration like [4:1], [8:2], or [180#4:1] for custom BPM",
              ),
            );
            continue;
          }

          const destNum = parseInt(dest, 10);
          if (isNaN(destNum) || destNum < 1 || destNum > 8) {
            errors.push(
              new SimaiParseError(
                `Invalid slide destination lane: "${dest}". Must be 1-8.`,
                undefined,
                undefined,
                "error",
              ),
            );
            continue;
          }

          const conversion = convertSlideType({
            lane: laneNum,
            type,
            mid: mid ? +mid : undefined,
            dest: destNum,
          });

          if (!conversion) {
            errors.push(
              new SimaiParseError(
                `Unknown or invalid slide type: "${type}"`,
                undefined,
                undefined,
                "error",
                "Valid types: - (straight), < > (circle), p q (U), pp qq (CUP), s z (thunder), v (V), V (L), ^ (auto-circle)",
              ),
            );
            continue;
          }

          const { type: convertedType, direction } = conversion;

          // Check for L-slide without midpoint
          if (type === "V" && !mid) {
            errors.push(
              new SimaiParseError(
                `L-slide (V) requires midpoint lane: "${laneNum}V${destNum}". Use format: ${laneNum}V${(laneNum % 8) + 1}${destNum}[4:1]`,
                undefined,
                undefined,
                "error",
                `Example: ${laneNum}V${(laneNum % 8) + 1}${destNum}[4:1]`,
              ),
            );
          }

          // Check for WiFi slides
          if (type === "w") {
            const laneDiff = Math.abs(laneNum - destNum);
            if (laneDiff !== 3 && laneDiff !== 5) {
              errors.push(
                new SimaiParseError(
                  `WiFi slide endpoint must be 3 lanes away from start (got ${laneNum} to ${destNum}).`,
                  undefined,
                  undefined,
                  "error",
                  `For WiFi from lane ${laneNum}, use endpoint ${((laneNum + 2) % 8) + 1} or ${((laneNum + 4) % 8) + 1}`,
                ),
              );
            }
          }

          const divValue = parseInt(division, 10);
          const countValue = parseInt(count, 10);

          if (isNaN(divValue) || divValue <= 0) {
            errors.push(
              new SimaiParseError(
                `Invalid slide division: "${division}"`,
                undefined,
                undefined,
                "error",
              ),
            );
          }

          if (isNaN(countValue) || countValue < 0) {
            errors.push(
              new SimaiParseError(
                `Invalid slide count: "${count}"`,
                undefined,
                undefined,
                "error",
              ),
            );
          }

          parsedBody.push(
            slideItem(
              laneNum,
              {
                bpm: bpm ? +bpm : undefined,
                division: divValue,
                divisionCount: countValue,
              },
              convertedType,
              direction,
              destNum,
              starVisibility,
            ),
          );
        }
      } else {
        parsedBody.push(tapItem(laneNum));
      }
    }
  }

  const result = parsedBody.length ? parsedBody : [restItem(1)];
  return division ? [timeSignatureItem(bpm, division), ...result] : result;
}
