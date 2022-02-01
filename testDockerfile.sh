#!/usr/bin/env bash

EXAMPLE_COMMANDS=$(grep -e "^#   " Dockerfile | sed -e "s/^#   //")

IFS=$'\n'; for i in $EXAMPLE_COMMANDS; do
    eval "$i" || exit 1
done
