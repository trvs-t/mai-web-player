"use client";

import { ChartMetadata } from "../data/chart";

interface MetadataPanelProps {
  metadata: ChartMetadata;
}

export function MetadataPanel({ metadata }: MetadataPanelProps) {
  const hasMetadata =
    metadata.title ||
    metadata.artist ||
    metadata.bpm ||
    metadata.charter ||
    metadata.difficulty;

  if (!hasMetadata) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-gray-500 text-sm">
        No metadata found. Add metadata using simai headers:
        <pre className="mt-2 text-xs bg-gray-200 p-2 rounded">
          {"&title=Song Title\n&artist=Artist Name\n&bpm=150\n&charter=Your Name\n&difficulty=13+"}
        </pre>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4 space-y-2">
      <h3 className="font-semibold text-gray-800 mb-3">Chart Info</h3>
      {metadata.title && (
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">Title</span>
          <span className="font-medium text-sm">{metadata.title}</span>
        </div>
      )}
      {metadata.artist && (
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">Artist</span>
          <span className="font-medium text-sm">{metadata.artist}</span>
        </div>
      )}
      {metadata.bpm && (
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">BPM</span>
          <span className="font-medium text-sm">{metadata.bpm}</span>
        </div>
      )}
      {metadata.difficulty && (
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">Difficulty</span>
          <span className="font-medium text-sm">{metadata.difficulty}</span>
        </div>
      )}
      {metadata.charter && (
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">Charter</span>
          <span className="font-medium text-sm">{metadata.charter}</span>
        </div>
      )}
    </div>
  );
}
