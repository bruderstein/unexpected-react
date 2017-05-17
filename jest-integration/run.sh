#!/bin/bash

set -e

cd "$(dirname "$0")"

./run-with-version 0.14.x "$@"
./run-with-version 15.4.x "$@"
./run-with-version 15.5.x "$@"
