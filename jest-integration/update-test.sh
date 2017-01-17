#!/bin/sh

if [ $# -ne 1 ]; then
    echo "Usage: $0 tests/<test-name>/<step-name>"
    return;
fi

if [ -d $1 ]; then
  STEPNAME=$(basename $1)
  TESTDIR=$(dirname $1)
  TESTNAME=$(basename $TESTDIR)

  cp "output/$TESTNAME/$STEPNAME/stderr_clean" "tests/$TESTNAME/$STEPNAME/expected_stderr"
  cp "output/$TESTNAME/$STEPNAME/stdout_clean" "tests/$TESTNAME/$STEPNAME/expected_stdout"

  echo Updated $TESTNAME $STEPNAME;
else
  echo Test $TESTNAME step $STEPNAME was not found
fi
