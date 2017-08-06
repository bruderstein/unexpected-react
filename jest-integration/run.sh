#!/bin/bash

set -e

cd "$(dirname "$0")"

./run-with-version.sh 16.0.0-beta1 "$@"
