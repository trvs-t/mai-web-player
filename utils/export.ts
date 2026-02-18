import { Chart } from "@/lib/chart";

export function downloadChart(chart: Chart, filename: string) {
  const simaiText = chartToSimai(chart);
  const blob = new Blob([simaiText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename.endsWith(".txt") || filename.endsWith(".simai")
      ? filename
      : `${filename}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function chartToSimai(chart: Chart): string {
  const lines: string[] = [];

  if (chart.metadata.title) {
    lines.push(`&title=${chart.metadata.title}`);
  }
  if (chart.metadata.artist) {
    lines.push(`&artist=${chart.metadata.artist}`);
  }
  if (chart.metadata.bpm) {
    lines.push(`&bpm=${chart.metadata.bpm}`);
  }
  if (chart.metadata.charter) {
    lines.push(`&charter=${chart.metadata.charter}`);
  }
  if (chart.metadata.difficulty) {
    lines.push(`&difficulty=${chart.metadata.difficulty}`);
  }

  lines.push("");

  const noteLines: string[] = [];
  let currentTimeSignature = "";

  for (const item of chart.items) {
    if (Array.isArray(item)) {
      const eachNotes = item
        .map((chartItem) => chartItemToSimai(chartItem))
        .join("/");
      noteLines.push(eachNotes);
    } else {
      switch (item.type) {
        case "timeSignature": {
          const { bpm, division } = item.data;
          const bpmPart = bpm ? `(${bpm})` : "";
          currentTimeSignature = `${bpmPart}{${division}}`;
          noteLines.push(currentTimeSignature);
          break;
        }
        case "rest":
          noteLines.push(",".repeat(item.data.divisionCount));
          break;
        case "note":
          noteLines.push(chartItemToSimai(item));
          break;
      }
    }
  }

  lines.push(...noteLines);
  lines.push("E");

  return lines.join("\n");
}

function chartItemToSimai(item: { type: "note"; data: unknown }): string {
  const data = item.data as { type: string };

  switch (data.type) {
    case "tap": {
      const lane = (data as unknown as { lane: number }).lane;
      return `${lane}`;
    }
    case "hold": {
      const d = data as unknown as {
        lane: number;
        duration: { bpm?: number; division: number; divisionCount: number };
      };
      const bpmPart = d.duration.bpm ? `${d.duration.bpm}#` : "";
      return `${d.lane}h[${bpmPart}${d.duration.division}:${d.duration.divisionCount}]`;
    }
    case "slide": {
      const d = data as unknown as {
        lane: number;
        slideType: string;
        destinationLane: number;
        duration: { bpm?: number; division: number; divisionCount: number };
        starVisibility?: string;
      };
      const visibilityPrefix =
        d.starVisibility === "fadeIn"
          ? "?"
          : d.starVisibility === "hidden"
            ? "!"
            : "";
      const slideChar = getSlideChar(d.slideType);
      const bpmPart = d.duration.bpm ? `${d.duration.bpm}#` : "";
      return `${visibilityPrefix}${d.lane}${slideChar}${d.destinationLane}[${bpmPart}${d.duration.division}:${d.duration.divisionCount}]`;
    }
    case "touch": {
      const d = data as unknown as {
        zone: string;
        position: number;
        isHanabi: boolean;
      };
      const hanabi = d.isHanabi ? "f" : "";
      return `${d.zone}${d.position}${hanabi}`;
    }
    case "touchHold": {
      const d = data as unknown as {
        zone: string;
        position: number;
        duration: { bpm?: number; division: number; divisionCount: number };
        isHanabi: boolean;
      };
      const bpmPart = d.duration.bpm ? `${d.duration.bpm}#` : "";
      const hanabi = d.isHanabi ? "f" : "";
      return `${d.zone}${d.position}h${hanabi}[${bpmPart}${d.duration.division}:${d.duration.divisionCount}]`;
    }
    default:
      return "";
  }
}

function getSlideChar(slideType: string): string {
  switch (slideType) {
    case "Straight":
      return "-";
    case "Circle":
      return "^";
    case "U":
      return "q";
    case "CUP":
      return "qq";
    case "Thunder":
      return "z";
    case "V":
      return "v";
    case "L":
      return "V";
    case "WiFi":
      return "w";
    default:
      return "-";
  }
}

const LOCAL_STORAGE_KEY = "mai-web-player-autosave";

export function saveToLocalStorage(chart: Chart, simaiText: string) {
  const data = {
    chart,
    simaiText,
    timestamp: Date.now(),
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

export function loadFromLocalStorage(): {
  chart: Chart;
  simaiText: string;
  timestamp: number;
} | null {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved) as {
      chart: Chart;
      simaiText: string;
      timestamp: number;
    };
  } catch {
    return null;
  }
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
