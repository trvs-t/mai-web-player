import { ChartMetadata } from "../lib/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Card>
        <CardHeader>
          <CardTitle>Chart Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            No metadata found. Add metadata using simai headers:
            <pre className="mt-2 text-xs bg-muted p-2 rounded">
              {
                "&title=Song Title\n&artist=Artist Name\n&bpm=150\n&charter=Your Name\n&difficulty=13+"
              }
            </pre>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart Metadata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
        {metadata.title && (
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Title</span>
            <span className="font-medium text-sm">{metadata.title}</span>
          </div>
        )}
        {metadata.artist && (
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Artist</span>
            <span className="font-medium text-sm">{metadata.artist}</span>
          </div>
        )}
        {metadata.bpm && (
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">BPM</span>
            <span className="font-medium text-sm">{metadata.bpm}</span>
          </div>
        )}
        {metadata.difficulty && (
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Difficulty</span>
            <span className="font-medium text-sm">{metadata.difficulty}</span>
          </div>
        )}
        {metadata.charter && (
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Charter</span>
            <span className="font-medium text-sm">{metadata.charter}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
