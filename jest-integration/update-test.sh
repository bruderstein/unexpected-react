#!/bin/sh

if [ $# -ne 2 ]; then
    echo "Usage: $0 tests/<test-name>/<step-name> <stdout|stderr|json>"
    return;
fi

if [ -d $1 ]; then
  STEPNAME=$(basename $1)
  TESTDIR=$(dirname $1)
  TESTNAME=$(basename $TESTDIR)

  if [ "$2" = "stderr" ]; then
    cp "output/$TESTNAME/$STEPNAME/stderr_clean" "tests/$TESTNAME/$STEPNAME/expected_stderr"
  elif [ "$2" = "json" ]; then
    cp "output/$TESTNAME/$STEPNAME/testRunOutput_clean.json" "tests/$TESTNAME/$STEPNAME/expectedOutput.json"
  elif [ "$2" = "stdout" ]; then
    cp "output/$TESTNAME/$STEPNAME/stdout_clean" "tests/$TESTNAME/$STEPNAME/expected_stdout"
  else 
    echo "Must specify to update 'stdout', 'stderr' or 'json' as the second parameter"
    exit 1
  fi

  echo Updated $TESTNAME $STEPNAME;
else
  echo Test $TESTNAME step $STEPNAME was not found
fi
