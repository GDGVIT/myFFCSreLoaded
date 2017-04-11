var node_xj = require("xls-to-json");
var promise = require('promise');
var node_xj = promise.denodeify(node_xj);


module.exports = function allCourses() {
    return new promise(function (fullfill, reject) {
        node_xj({ input: "./public/course/courses.xls", output: null })
            .then((result) => {
                fullfill(result);
            }).catch((e) => {
                reject(e);
                console.log("B");
            });

    });
}



