#!/bin/bash

# Watch for changes in the src/ directory and run bash ./build.sh when a change is detected
while true; do
  inotifywait -e modify -r src/ && bash ./build.sh
done

