import { createContext } from "react";
import { Chart } from "../data/chart";

export const ChartContext = createContext<Chart | null>(null);
