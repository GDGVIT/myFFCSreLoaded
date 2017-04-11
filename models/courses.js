var mongoose = require('mongoose');
var promise = require('bluebird');
var getCourses = require('../course/CoursesXlToJson');
var course = mongoose.Schema({
    Faculty: {
        type: String,
    },
    Count: {
        type: Array
    },
    Crscd: {
        type: String
    },
    Crsnm: {
        type: String
    },
    Slot: {
        type: String
    }
});

var Course = mongoose.model("Course", course);
exports.Course = Course;

function insertCourses() {
    return new promise((fullfill, reject) => {
        getCourses()
            .then((result) => {
                result.forEach((res) => {
                    var item = {Faculty:res.Faculty,Count:[],Crscd:res['Course Code'],Crsnm:res['Course Name'],Slot:res.Slot}
                    var newCourse = new Course(item);
                    return Save(newCourse);
                });

            })
            .catch((e) => {
                console.log(e);
            })
            .then((q) => {
                if (q.length > 0) console.log("Courses inserted: " + q.length);
            })
            .catch((e) => {
                console.log("Mongo Save error: " + e);
            });
    });
};

function Save(newCourse) {
    return new promise((fullfill, reject) => {
        newCourse.save((err, data) => {
            if (err) reject(err);
            else fullfill(data);
        });
    });
}

exports.insertCourses = insertCourses;