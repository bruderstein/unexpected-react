#!/bin/bash

set -e

cd "$(dirname "$0")"

./run-with-version.sh 15.5.x "$@"
