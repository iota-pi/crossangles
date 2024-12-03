#!/usr/bin/env bash
set -e
cd "$(dirname "$(realpath "$0")")"/..
paths=$@
excluded_paths=':(exclude)*.spec.[tj]s :(exclude)*.test.[tj]s :(exclude)*.snap :(exclude)*.br :(exclude)*.gitignore'
git log -1 --pretty="tformat:%at-%H" $paths $excluded_paths
