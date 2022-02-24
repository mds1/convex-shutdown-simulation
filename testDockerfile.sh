#!/usr/bin/env bash

# Run all of the example commands in the Dockerfile in this directory.

# Every line in the Dockerfile that starts with this pattern is presumed to be
# an example command:
EXAMPLE_CMD_PREFIX="^#   "

# Extract all of the example commands from the Dockerfile, in the order they
# appear:
EXAMPLE_CMDS=$( \
    grep -e $EXAMPLE_CMD_PREFIX Dockerfile \
        | sed -e "s/${EXAMPLE_CMD_PREFIX}//" \
)

# Run all of the example commands:
IFS=$'\n'; for i in $EXAMPLE_CMDS; do
    eval "$i" || exit 1 # fail this script if the command failed
done
