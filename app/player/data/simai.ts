import { getLaneDifference } from "@/utils/lane";
import {
  SlideType,
  holdItem,
  restItem,
  slideItem,
  tapItem,
  timeSignatureItem,
  type Chart,
} from "./chart";

export function parseSimaiChart(i_note: string) {
  const parts = i_note
    .replace("\n", "")
    .replace("\t", "")
    .replace(" ", "")
    .trim()
    .split(",");
  const result = parts.map(parseSimaiNote).flat();
  return result;
}

const timeSignatureExp = /^(?:\((\d+\.?\d+)\))?(?:\{(\d+)\})?(.*)$/;
const touchExp =
  /^(?<zone>[A-E])(?<position>[1-8])?(?<hold>h)?(?<hanabi>f)?(?<duration>\[(?<bpm>\d+(?:#))?(?<division>\d+):(?<count>\d+)\])?$/;
const noteExp =
  /^(?<lane>[1-8])(?<modifiers>[bx]*)(?:(?<hold>h.*)|(?<slide>(?:[-<>pqszvwV^]|pp|qq).*))?$/;
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
      // TODO wifi slide lmao
      return { type: "Straight", direction: "ccw" };
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
  const [_, bpm, division, body] = timeSignatureMatch;
  const parts = body.split("/");
  const parsedBody = [];
  for (const part of parts) {
    const touchMatch = part.match(touchExp);
    if (touchMatch) {
      // TODO: touch notes
      continue;
    }

    const noteMatch = part.match(noteExp);
    if (noteMatch?.groups) {
      const { lane, modifiers, hold, slide, body } = noteMatch.groups;
      if (hold) {
        const { duration, bpm, division, count } =
          hold.match(holdExp)?.groups ?? {};
        if (!duration) {
          console.warn("Hold note without duration");
          parsedBody.push(
            holdItem(+lane, {
              division: 8,
              divisionCount: 0,
            })
          );
          continue;
        }
        parsedBody.push(
          holdItem(+lane, {
            bpm: bpm ? +bpm : undefined,
            division: +division,
            divisionCount: +count,
          })
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
              +dest
            )
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
