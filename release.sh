#!/usr/bin/env bash

last_released_commit=$(git log origin/release -n 1 --format=%H)
body=$(git log $last_released_commit.. --format="* %s")
title=$(git log -n 1 --format="%s")
pr=$(gh pr create --base release --title "$title" --body "$body")
echo "Created a PR for release: $pr"
