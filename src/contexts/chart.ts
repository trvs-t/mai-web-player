import { createContext } from "react";
import { Chart } from "../lib/chart";

export const ChartContext = createContext<Chart | null>(null);
