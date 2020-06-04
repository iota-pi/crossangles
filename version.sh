#!/usr/bin/env bash
set -e
git log -1 --pretty="tformat:%at-%H" $@
