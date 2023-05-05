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
  const parts = i_note.trim().split(",");
  return parts.map(parseSimaiNote).flat();
}

const timeSignatureExp = /^(?:\((\d+)\))?(?:\{(\d*)\})?(.*)$/;
const touchExp =
  /^(?<zone>[A-E])(?<position>[1-8])?(?<hold>h)?(?<hanabi>f)?(?<duration>\[(?<bpm>\d+(?:#))?(?<division>\d+):(?<count>\d+)\])?$/;
const noteExp =
  /^(?<lane>[1-8])(?<modifiers>[bx]*)(?:(?<hold>h)|(?<slide>(?<type>[-<>pqszvwV]|pp|qq)(?<mid>[1-8])?(?<dest>[1-8]))(?<duration>\[(?:(?<bpm>\d+)#)?(?<division>\d+):(?<count>\d+)\])?)?(.*)$/;

function convertSlideType(
  lane: number,
  type: string,
  mid?: number
): { type: SlideType; direction: "cw" | "ccw" } | undefined {
  switch (type) {
    case "-":
      return { type: "Straight", direction: "cw" };
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
      return { type: "Straight", direction: "cw" };
    case "V":
      if (!mid) return;
      const midDistance = mid - lane + (mid < lane ? 8 : 0);
      return { type: "L", direction: midDistance == 2 ? "cw" : "ccw" };
    case "pp":
      return { type: "CUP", direction: "ccw" };
    case "qq":
      return { type: "CUP", direction: "cw" };
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
      const {
        lane,
        modifiers,
        hold,
        slide,
        type,
        mid,
        dest,
        duration,
        bpm,
        division,
        count,
      } = noteMatch.groups;
      if (hold) {
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
        if (!duration) {
          console.error("Slide note without duration");
          continue;
        }
        const conversion = convertSlideType(+lane, type, +mid);
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
      } else {
        parsedBody.push(tapItem(1));
      }
    }
  }

  const result = parsedBody.length ? parsedBody : restItem(1);

  return division ? [timeSignatureItem(bpm, division), result] : [result];
}
