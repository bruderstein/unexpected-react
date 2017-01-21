#!/bin/bash
pushd . > /dev/null

USE_RELEASED_UNEXPECTED_REACT=no

cd "$(dirname "$0")"

cd baseTemplate
rm -rf node_modules
yarn install
cd ..

# Clean and prepare the build from the baseTemplate
prepareBuild() {
	rm -rf build
	mkdir build
	cp -r baseTemplate/* build
	if [ $USE_RELEASED_UNEXPECTED_REACT == "yes" ]; then
	    cd build
	    ../useReleasedUnexpectedReact/prepare.sh ../useReleasedUnexpectedReact
	    cd ..;
	fi
}

rm -rf output
mkdir output

FAILED_STEPS=0


runTest() {
    TESTNAME=$1

	if [ -d "tests/$TESTNAME" ]; then
	    prepareBuild
	    for STEP in $(ls tests/$TESTNAME | sort -V); do
	       STEP_FAILED=0
	       if [ -d "tests/$TESTNAME/$STEP" ]; then
	          if [ -f "tests/$TESTNAME/$STEP/prepare.sh" ]; then
	            pushd . > /dev/null
	            cd build
	            source ../tests/$TESTNAME/$STEP/prepare.sh "../tests/$TESTNAME/$STEP";
	            popd > /dev/null
	          fi

	          if [ -f "tests/$TESTNAME/$STEP/run.sh" ]; then
	            mkdir -p output/$TESTNAME/$STEP
	            pushd . > /dev/null
	            cd build
	            printf "Running $TESTNAME $STEP..."
	            source ../tests/$TESTNAME/$STEP/run.sh "../tests/$TESTNAME/$STEP" > ../output/${TESTNAME}/${STEP}/stdout 2> ../output/$TESTNAME/$STEP/stderr;
	            popd > /dev/null

                if [ -f output/$TESTNAME/$STEP/stderr ]; then
                    # Jest outputs a time for all tests on stdout, and the version number
                    # we strip these out to allow a clean test
                    # we do this whether there's expected stdout or not, so it's easy
                    # to update the expected stdout
                    cat output/$TESTNAME/$STEP/stdout | grep -v 'Done in [0-9.]' | grep -v 'yarn test v' > output/$TESTNAME/$STEP/stdout_clean;
                fi
                if [ -f output/${TESTNAME}/${STEP}/stdout_clean ] && [ -f tests/$TESTNAME/$STEP/expected_stdout ]; then
                    diff tests/$TESTNAME/$STEP/expected_stdout output/$TESTNAME/$STEP/stdout_clean > output/$TESTNAME/$STEP/stdout_diff
                    if [ $? == 1 ]; then
	                    echo "******************************************************************" >> output/results.txt
                        echo "x  Failed $TESTNAME $STEP - stdout differed" >> output/results.txt
                        cat output/$TESTNAME/$STEP/stdout_diff >> output/results.txt
                        echo "" >> output/results.txt;
                        STEP_FAILED=1
                    fi
                fi
                if [ -f output/$TESTNAME/$STEP/stderr ]; then
                    # Jest outputs timings for each test and the complete times, 
                    # so we strip those to get a clean thing to compare
                    # we do this whether there's expected stderr or not, so it's easy
                    # to update the expected stderr
                    cat output/$TESTNAME/$STEP/stderr | grep -v '^Time: ' | sed -E -e 's/\([0-9]+ms\)$//' > output/$TESTNAME/$STEP/stderr_clean;
                fi

                if [ -f output/${TESTNAME}/${STEP}/stderr_clean ] && [ -f tests/$TESTNAME/$STEP/expected_stderr ]; then

                    diff tests/$TESTNAME/$STEP/expected_stderr output/$TESTNAME/$STEP/stderr_clean > output/$TESTNAME/$STEP/stderr_diff
                    if [ $? == 1 ]; then
	                    echo "******************************************************************" >> output/results.txt
                        echo "x  Failed $TESTNAME $STEP - stderr differed" >> output/results.txt;
                        cat output/$TESTNAME/$STEP/stderr_diff >> output/results.txt
                        echo "" >> output/results.txt;
                        STEP_FAILED=1
                    fi
                fi
                FAILED_STEPS=$((FAILED_STEPS+STEP_FAILED))
                if [ $STEP_FAILED -ne 0 ]; then
                    printf "\rFAIL $TESTNAME $STEP               \n";
                else
                    printf "\rPASS $TESTNAME $STEP               \n";
                fi
	          fi
	       fi;
	    done
	fi;
}

TEST_ALL=true
while [[ $# -ge 1 ]]; do
key="$1"

case $key in
    --use-released)
    USE_RELEASED_UNEXPECTED_REACT=yes
    ;;
    *)
    TEST_ALL=false
    runTest $key
    ;;
esac
shift # past argument or value
done

if [ "$TEST_ALL" == "true" ]; then
    for TESTNAME in $(ls tests | sort -V); do
        runTest $TESTNAME
    done;
fi

if [ $FAILED_STEPS -ne 0 ]; then
    cat output/results.txt
    echo ""
    echo "$FAILED_STEPS steps failed.";
else
    echo "Passed!";
fi

popd > /dev/null

