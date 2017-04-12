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
                    var item = { Faculty: res.Faculty, Count: [], Crscd: res['Course Code'], Crsnm: res['Course Name'], Slot: res.Slot }
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


function allCourseCode(slot, crsnm) {
    return new Promise((fullfill, reject) => {
        var arr = new Array();
        if (slot == null && crsnm == null) {
            Course.find({}, (err, data) => {
                if (err) reject(err);
                else {
                    for (i = 0; i < data.length; i++) {
                        if (arr.indexOf(data[i].Crscd) == -1) {
                            arr.push(data[i].Crscd);
                        }
                    }
                    if (arr.length == 0) fullfill("No course as such");
                    else fullfill(arr);
                }
            });
        }
        else if (crsnm == null) {
            Course.find({ Slot: slot }, (err, data) => {
                if (err) reject(err);
                else {
                    for (i = 0; i < data.length; i++) {
                        if (arr.indexOf(data[i].Crscd) == -1) {
                            arr.push(data[i].Crscd);
                        }
                    }
                    if (arr.length == 0) fullfill(["No course as such"]);
                    else fullfill(arr);
                }
            });
        }
        else if (slot == null) {
            Course.find({ Crsnm: crsnm }, (err, data) => {
                if (err) reject(err);
                else {
                    for (i = 0; i < data.length; i++) {
                        if (arr.indexOf(data[i].Crscd) == -1) {
                            arr.push(data[i].Crscd);
                        }
                    }
                    if (arr.length == 0) fullfill(["No course as such"]);
                    else fullfill(arr);
                }
            });
        }
        else {
            Course.find({ Crsnm: crsnm, Slot: slot }, (err, data) => {
                if (err) reject(err);
                else {
                    for (i = 0; i < data.length; i++) {
                        if (arr.indexOf(data[i].Crscd) == -1) {
                            arr.push(data[i].Crscd);
                        }
                    }
                    if (arr.length == 0) fullfill(["No course as such"]);
                    else fullfill(arr);
                }
            });
        }
    });
}

function allSlots(crscd, faculty) {
    return new Promise((fullfill, reject) => {
        var arr = new Array();
        if (crscd == null && faculty == null) {
            Course.find({}, (err, data) => {
                if (err) reject(err);
                else {
                    for (i = 0; i < data.length; i++) {
                        if (arr.indexOf(data[i].Slot) == -1) {
                            arr.push(data[i].Slot);
                        }
                    }
                    if (arr.length == 0) fullfill("No course as such");
                    else fullfill(arr);
                }
            });
        }
        else if (faculty == null) {
            Course.find({ Crscd: crscd }, (err, data) => {
                if (err) reject(err);
                else {
                    for (i = 0; i < data.length; i++) {
                        if (arr.indexOf(data[i].Slot) == -1) {
                            arr.push(data[i].Slot);
                        }
                    }
                    if (arr.length == 0) fullfill(["No course as such"]);
                    else fullfill(arr);
                }
            });
        }
        else if (crscd == null) {
            Course.find({ Faculty: faculty }, (err, data) => {
                if (err) reject(err);
                else {
                    for (i = 0; i < data.length; i++) {
                        if (arr.indexOf(data[i].Slot) == -1) {
                            arr.push(data[i].Slot);
                        }
                    }
                    if (arr.length == 0) fullfill(["No course as such"]);
                    else fullfill(arr);
                }
            });
        }
        else {
            Course.find({ Faculty: faculty, Crscd: crscd }, (err, data) => {
                if (err) reject(err);
                else {
                    for (i = 0; i < data.length; i++) {
                        if (arr.indexOf(data[i].Slot) == -1) {
                            arr.push(data[i].Slot);
                        }
                    }
                    if (arr.length == 0) fullfill(["No course as such"]);
                    else fullfill(arr);
                }
            });
        }
    });
}


function allFaculty(crscd, slot) {
    return new Promise((fullfill, reject) => {
        var arr = new Array();
        if (crscd == null && slot == null) {
            Course.find({}, (err, data) => {
                if (err) reject(err);
                else {
                    for (i = 0; i < data.length; i++) {
                        if (arr.indexOf(data[i].Faculty) == -1) {
                            arr.push(data[i].Faculty);
                        }
                    }
                    if (arr.length == 0) fullfill("No course as such");
                    else fullfill(arr);
                }
            });
        }
        else if (slot == null) {
            Course.find({ Crscd: crscd }, (err, data) => {
                if (err) reject(err);
                else {
                    for (i = 0; i < data.length; i++) {
                        if (arr.indexOf(data[i].Faculty) == -1) {
                            arr.push(data[i].Faculty);
                        }
                    }
                    if (arr.length == 0) fullfill(["No course as such"]);
                    else fullfill(arr);
                }
            });
        }
        else if (crscd == null) {
            Course.find({ Slot: slot }, (err, data) => {
                if (err) reject(err);
                else {
                    for (i = 0; i < data.length; i++) {
                        if (arr.indexOf(data[i].Faculty) == -1) {
                            arr.push(data[i].Faculty);
                        }
                    }
                    if (arr.length == 0) fullfill(["No course as such"]);
                    else fullfill(arr);
                }
            });
        }
        else {
            Course.find({ Slot: slot, Crscd: crscd }, (err, data) => {
                if (err) reject(err);
                else {
                    for (i = 0; i < data.length; i++) {
                        if (arr.indexOf(data[i].Faculty) == -1) {
                            arr.push(data[i].Faculty);
                        }
                    }
                    if (arr.length == 0) fullfill(["No course as such"]);
                    else fullfill(arr);
                }
            });
        }
    });
}

function all(crscd,slot) {
    return new Promise((fullfill, reject) => {
        Course.find({Crscd:crscd,Slot:slot}, (err, data) => {
            if (err) reject(err);
            else fullfill(data);
        });
    });
}

function allCourseName(crscd) {
    return new Promise((fullfill, reject) => {
        var arr = new Array();
        if (crscd == null) {
            Course.find({}, (err, data) => {
                if (err) reject(err);
                else {
                    for (i = 0; i < data.length; i++) {
                        if (arr.indexOf(data[i].Crsnm) == -1) {
                            arr.push(data[i].Crsnm);
                        }
                    }
                    fullfill(arr);
                }
            });
        }
        else {
            Course.find({ Crscd: crscd }, (err, data) => {
                if (err) reject(err);
                else {
                    for (i = 0; i < data.length; i++) {
                        if (arr.indexOf(data[i].Crsnm) == -1) {
                            arr.push(data[i].Crsnm);
                        }
                    }
                    fullfill(arr);
                }
            });
        }

    });
}


exports.insertCourses = insertCourses;
exports.allSlots = allSlots;
exports.allCourseCode = allCourseCode;
exports.allCourseName = allCourseName;
exports.allFaculty = allFaculty;
exports.all = all;