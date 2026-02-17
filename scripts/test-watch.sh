#!/bin/bash
# Convenience script to run tests in watch mode
# Usage: ./scripts/test-watch.sh

echo "Starting test watcher..."
echo "Press Ctrl+C to stop"
bun test --watch
