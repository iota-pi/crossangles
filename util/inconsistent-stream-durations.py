#!/usr/bin/env python3
import json
import sys


with open(sys.argv[1]) as f:
    data = json.load(f)

for course in data['courses']:
    lastDurations = None
    lastComponent = None
    for stream in course['streams']:
        if stream['component'] != lastComponent:
            lastComponent = stream['component']
            lastDurations = None

        durations = []
        for time in stream['times']:
            startAndEnd = [float(x) for x in time['time'][1:].split('-')]
            if len(startAndEnd) == 1:
                startAndEnd.append(startAndEnd[0] + 1)
            start, end = startAndEnd
            durations.append(end - start)
        if not durations:
            # Skip web streams
            continue

        durations = sorted(durations)
        if lastDurations is not None and durations != lastDurations:
            print(lastDurations, durations)
            print(course['code'], stream['component'])
            break
        lastDurations = durations
