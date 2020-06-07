#!/usr/bin/env bash
set -e
paths=$@
if [[ $paths =~ contact|image ]]; then
  paths+=" lambda-shared"
fi
git log -1 --pretty="tformat:%at-%H" $paths
