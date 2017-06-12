var mongoose = require('mongoose');
var promise = require('bluebird');
var getCourses = require('../course/CoursesXlToJson');
var fs  = require('fs');
var course = mongoose.Schema({
    Faculty: {
        type: String,
    },
    Count: {
        type: Array,
    },
    Crscd: {
        type: String
    },
    Crsnm: {
        type: String
    },
    Slot: {
        type: String
    },
    Credits: {
        type: Number
    },
    Venue: {
        type: String
    },
    Type: {
        type: String
    },
    Mode: {
        type: String
    }
});

var Course = mongoose.model("Course", course);
var User = require('./user').User;
exports.Course = Course;

exports.test = "test";
var sl = require('./slots');

exports.validateCredits = (cid, uid) => {
    return new promise((full, rej) => {
        Course.findById(cid, (err, crs) => {
            if (!err)
                User.findOne({ 'regno': uid }, (er, usr) => {
                    if (usr.Credits + crs.Credits <= 27)
                        full();
                    else
                        rej('You cannot take more that 27 credits');
                });
        });
    });
}


exports.validateSlots=(cid,uid)=>{
	return new promise((full,rej)=>{
	Course.findById(cid,(err,crs)=>{
		if(crs.Slot == 'NIL'){
			full()
		}
		else{
		User.findOne({'regno':uid},(er,usr)=>{
			if(!er && usr){
			Course.find({'_id':{'$in':usr.courses}},'Slot -_id',(err,data)=>{
				var c=[];
				var d=data.map((item)=>{
					return c.push(item.Slot);
				});
				var x=c.join(" ");
				x=x.replace(/\+/g," ");
				var dd=x.split(' ');
				var c=dd.map((item)=>{
					return dd.push(sl[item]);
				});
				var crsS=crs.Slot.split(/\+/g);
				var v=[];
				var crd=crsS.map((item)=>{
					if(dd.indexOf(item)<0)
					return v.push(true);
					else
					return v.push(false);
				});
				if(v.indexOf(false)<0){
					console.log(v);
					full();
				}
				else{
					console.log(dd.join(" "));
					console.log(crs.Slot);
					rej('Slots clashing');
				}
			});	
			}
		})
	}
	});
	});
}

exports.validateFaculty=(cid,uid)=>{
	return new promise((full,rej)=>{
	Course.findById(cid,(err,crs)=>{
		if(crs.Faculty == 'ACAD FACULTY'){
			full()
		}
		else{
		User.findOne({'regno':uid},(er,usr)=>{
			Course.find({'_id':{'$in':usr.courses},'Crscd':crs.Crscd,'Slot':{"$ne":"NIL"}},(er1,data)=>{
				if(data.length>0 && !er1){
				if(data.length>1){
					rej('already selected both');
				}
				else{
					var cc=[];
					if(data[0].Faculty==crs.Faculty){
						if((data[0].Slot.includes('L') && !crs.Slot.includes('L'))||(!data[0].Slot.includes('L') && crs.Slot.includes('L')))
						full()
						else{
							console.log(data[0].slot);
							console.log(crs.Slot);
							rej('You have selected both theory slots');
						}
						
					}
					else{
						rej('Please select same faculty for theory and lab');
					}
				}
				
				full();
			}
			else
			full();
			});
		});
	}
	});
	});
}

exports.checkClash = (cid, uid) => {
    return new promise((full, rej) => {
        Course.findById(cid, (er, crs) => {
            if (er)
                rej(er);
            if (crs.Count.indexOf(uid) < 0) {
                User.findOne({ 'regno': uid }, 'courses', (err, data) => {
                    if (data)
                        Course.find({ '_id': { $in: data.courses } }, 'Slot -_id', (err, dat) => {
                            var s = dat.map((value) => {
                                return value.Slot
                            });
                            console.log(s);
                            full('done');
                        });
                });
            }
        });
    });
}

exports.removeUserFromCourse = (uid, cid) => {
    return new promise((full, rej) => {
        Course.findById(cid, (er1, csr) => {
            if (csr) {
                User.findOne({ 'regno': uid }, (err, data) => {
                    if (!err && data) {
                        data.courses.splice(data.courses.indexOf(new mongoose.mongo.ObjectID(cid)), 1);
                        data.Credits -= csr.Credits;
                        data.save((er, usd) => {
                            if (er)
                                rej(er);
                            else {
                                csr.Count.splice(csr.Count.indexOf(uid), 1);
                                csr.save((er2, csdc) => {
                                    full();
                                })
                            }
                        });
                    }
                    else {
                        if (err)
                            rej(err);
                        else
                            rej('not found');
                    }
                });
            }
        });
    });
}


exports.incrementCount = (id, reg) => {
    return new promise((full, rej) => {
        Course.findById(id, (err, doc) => {
            if (doc) {
                if (doc.Count.indexOf(reg) < 0) {
                    doc.Count.push(reg);
                    User.findOne({ 'regno': reg }, (er, us) => {
                        if (!err && doc) {
                            us.Credits += doc.Credits;
                            us.courses.push(new mongoose.mongo.ObjectId(id));
                            us.save((err2) => {
                                if (err2)
                                    console.log(err2);
                                doc.save((err, d) => {
                                    if (!err) {
                                        full(doc.Count.length);
                                    }

                                });
                            });
                        }
                        else
                            rej(er);
                    });
                }
                else {
                    full(doc.Count.length);
                }
            }
            else {
                rej(err);
            }
        });
    });
}


exports.details = (reg) => {
    return new promise((full, rej) => {
        User.aggregate([{ $unwind: "$courses" }, {
            $lookup:
            {
                from: "courses",
                localField: "courses",
                foreignField: "_id",
                as: "course_docs"
            }
        }]).match({ 'regno': reg }).unwind('courses').exec((err, us) => {
            if (err) {
                rej(err)
            }
            else {
                full(us);
            }

        });
    });
}

function insertCourses() {
    return new promise((fullfill, reject) => {
        getCourses()
            .then((result) => {
                result.forEach((res) => {
                    var item = { Faculty: res.Faculty, Count: [], Crscd: res['Course Code'], Crsnm: res['Course Name'], Slot: res["Slot"], Credits: res["Credits"], Venue: res["Venue"],Type: res["type"] }
                    var newCourse = new Course(item);
                    return Save(newCourse);
                });

            })
            .catch((e) => {
                //console.log(e);
            })
            .then((q) => {
                if (q.length > 0) console.log("Courses inserted: " + q.length);
            })
            .catch((e) => {
                //console.log("Mongo Save error: " + e);
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

function all(crscd, slot) {
    return new Promise((fullfill, reject) => {
        if (crscd == null && slot == null){
            Course.find({}, (err, data) => {
                if (err) reject(err);
                else fullfill(data);
            });
        }
        else{
            Course.find({ Crscd: crscd, Slot: slot }, (err, data) => {
                if (err) reject(err);
                else fullfill(data);
            });
        }            
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

exports.staticArray = (req,res)=>{
    all(null, null).then((res1) => {
			j = 0;
			arr = [];
			arr1 = [];
			for (i = 0; i < res1.length; i++) {
				var a = res1[i].Crscd + " - " + res1[i].Crsnm;
				if (arr.indexOf(a) == -1) {
					arr.push(a);
				}
				if (j == res1.length - 1) {
					res.status(200);
					for (i = 0; i < arr.length; i++) {
						arr1.push(arr[i].split(" - ")[0]);
					}
					arr2 = arr;
					arr3 = arr1;
					fs.writeFile("crsnm.txt", arr2.join(), function (err) {
						if (err) {
							return console.log(err);
						}

						else{
							console.log("The  crsnm file was saved!");
						}
					});
					fs.writeFile("crscd.txt", arr3.join(), function (err) {
						if (err) {
							return console.log(err);
						}

						else{
							console.log("The  crscd file was saved!");
						}

					});
					res.render('newtt', { user: req.user, codes: arr1, names: arr });
				}
				j++;
			}
		});
}


exports.insertCourses = insertCourses;
exports.allSlots = allSlots;
exports.allCourseCode = allCourseCode;
exports.allCourseName = allCourseName;
exports.allFaculty = allFaculty;
exports.all = all;
