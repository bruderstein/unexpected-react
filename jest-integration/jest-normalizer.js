module.exports = function (jestJson, commonPath) {

    delete jestJson.startTime;
    jestJson.testResults.forEach(function (result) {

        delete result.startTime;
        delete result.endTime;
        result.assertionResults.forEach(function (test) {
            delete test.failureMessages;
        });

        result.assertionResults = result.assertionResults.sort(function (a, b) {
            if (a.title < b.title) {
                return -1;
            } else if (a.title > b.title) {
                return 1;
            }
            return 0;
        });

        if (result.name.substr(0, commonPath.length) === commonPath) {
            result.name = result.name.substr(commonPath.length)
        }
    });

    jestJson.testResults = jestJson.testResults.sort(function (a, b) {
        if (a.name < b.name) {
            return -1;
        } else if (a.name > b.name) {
            return 1;
        }
        return 0;
    });

    return jestJson;
}
