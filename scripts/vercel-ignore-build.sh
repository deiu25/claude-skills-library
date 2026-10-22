#!/usr/bin/env bash
# Vercel's ignoreCommand: exit 0 cancels the build, exit 1 runs it, and any git error builds.
[ "$VERCEL_GIT_PREVIOUS_SHA" != "$(git rev-parse HEAD 2>/dev/null)" ] || exit 1
git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" HEAD -- . ':(exclude,glob)*.md' ':(exclude)e2e' ':(exclude).claude' \
  ':(exclude).github' 2>/dev/null || exit 1
