#!/bin/sh

if pgrep virtuoso-t; then
  echo "killing virtuoso and wait 5 seconds..."
  kill $(pgrep virtuoso-t)
  sleep 5
else
  echo "virtuoso was not running"
fi

