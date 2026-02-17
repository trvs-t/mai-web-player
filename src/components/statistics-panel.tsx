import { useMemo } from "react";
import { Chart } from "../lib/chart";
import { convertChartVisualizationData, calculateChartStatistics } from "../lib/visualization";

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
      <div className="p-4 border rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Chart Statistics</h3>
        <p className="text-gray-500 text-sm">No chart data available</p>
      </div>
    );
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Chart Statistics</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {stats.noteCounts.total}
          </div>
          <div className="text-sm text-gray-600">Total Notes</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {stats.estimatedDifficulty > 0 ? `${stats.estimatedDifficulty}+` : "-"}
          </div>
          <div className="text-sm text-gray-600">Est. Difficulty</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-medium text-gray-700">Note Breakdown</h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex justify-between bg-white px-2 py-1 rounded">
            <span className="text-gray-600">Taps</span>
            <span className="font-semibold">{stats.noteCounts.tap}</span>
          </div>
          <div className="flex justify-between bg-white px-2 py-1 rounded">
            <span className="text-gray-600">Holds</span>
            <span className="font-semibold">{stats.noteCounts.hold}</span>
          </div>
          <div className="flex justify-between bg-white px-2 py-1 rounded">
            <span className="text-gray-600">Slides</span>
            <span className="font-semibold">{stats.noteCounts.slide}</span>
          </div>
          <div className="flex justify-between bg-white px-2 py-1 rounded">
            <span className="text-gray-600">Touch</span>
            <span className="font-semibold">{stats.noteCounts.touch}</span>
          </div>
          <div className="flex justify-between bg-white px-2 py-1 rounded">
            <span className="text-gray-600">T-Hold</span>
            <span className="font-semibold">{stats.noteCounts.touchHold}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-medium text-gray-700">Chart Info</h4>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Duration</span>
            <span>{formatDuration(stats.totalDuration)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Peak Density</span>
            <span>{stats.peakDensity.value.toFixed(1)} notes/sec</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Peak Time</span>
            <span>{formatDuration(stats.peakDensity.time)}</span>
          </div>
        </div>
      </div>

      {stats.densityData.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Density Graph</h4>
          <div className="h-24 bg-white rounded p-2 flex items-end gap-px overflow-hidden">
            {stats.densityData.map((point, i) => {
              const maxValue = Math.max(...stats.densityData.map((d) => d.notesPerSecond), 1);
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
    </div>
  );
}
