import { useMemo } from "react";
import { Chart } from "../lib/chart";
import {
  convertChartVisualizationData,
  calculateChartStatistics,
} from "../lib/visualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatisticsPanelProps {
  chart: Chart | null;
}

export function StatisticsPanel({ chart }: StatisticsPanelProps) {
  const stats = useMemo(() => {
    if (!chart) return null;
    try {
      const notes = convertChartVisualizationData(chart);
      const measureData = chart.items.reduce((duration, item) => {
        if (!Array.isArray(item) && item.type === "rest") {
          return duration + item.data.divisionCount * 500;
        }
        return duration + 500;
      }, 0);
      return calculateChartStatistics(notes, measureData);
    } catch {
      return null;
    }
  }, [chart]);

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chart Statistics</CardTitle>
        </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
          <p className="text-muted-foreground text-sm">
            No chart data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-muted p-3 rounded">
            <div className="text-2xl font-bold text-blue-600">
              {stats.noteCounts.total}
            </div>
            <div className="text-sm text-muted-foreground">Total Notes</div>
          </div>
          <div className="bg-muted p-3 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {stats.estimatedDifficulty > 0
                ? `${stats.estimatedDifficulty}+`
                : "-"}
            </div>
            <div className="text-sm text-muted-foreground">Est. Difficulty</div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium">Note Breakdown</h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex justify-between bg-muted px-2 py-1 rounded">
              <span className="text-muted-foreground">Taps</span>
              <span className="font-semibold">{stats.noteCounts.tap}</span>
            </div>
            <div className="flex justify-between bg-muted px-2 py-1 rounded">
              <span className="text-muted-foreground">Holds</span>
              <span className="font-semibold">{stats.noteCounts.hold}</span>
            </div>
            <div className="flex justify-between bg-muted px-2 py-1 rounded">
              <span className="text-muted-foreground">Slides</span>
              <span className="font-semibold">{stats.noteCounts.slide}</span>
            </div>
            <div className="flex justify-between bg-muted px-2 py-1 rounded">
              <span className="text-muted-foreground">Touch</span>
              <span className="font-semibold">{stats.noteCounts.touch}</span>
            </div>
            <div className="flex justify-between bg-muted px-2 py-1 rounded">
              <span className="text-muted-foreground">T-Hold</span>
              <span className="font-semibold">
                {stats.noteCounts.touchHold}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium">Chart Info</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span>{formatDuration(stats.totalDuration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Peak Density</span>
              <span>{stats.peakDensity.value.toFixed(1)} notes/sec</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Peak Time</span>
              <span>{formatDuration(stats.peakDensity.time)}</span>
            </div>
          </div>
        </div>

        {stats.densityData.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Density Graph</h4>
            <div className="h-24 bg-muted rounded p-2 flex items-end gap-px overflow-hidden">
              {stats.densityData.map((point, i) => {
                const maxValue = Math.max(
                  ...stats.densityData.map((d) => d.notesPerSecond),
                  1,
                );
                const height = (point.notesPerSecond / maxValue) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-blue-400 hover:bg-blue-500 transition-colors"
                    style={{ height: `${Math.max(4, height)}%` }}
                    title={`${point.notesPerSecond.toFixed(1)} notes/sec at ${formatDuration(point.time)}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
