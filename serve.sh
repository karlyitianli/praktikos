#!/bin/sh
# Start a local server for the Praktikos reader.
# Run: ./serve.sh
# Then open: http://localhost:8000
# This is needed because the app loads its chapters with fetch(),
# which does not work when you open index.html directly from Finder.
# Stop with Ctrl+C.
cd "$(dirname "$0")"
python3 -m http.server 8000
