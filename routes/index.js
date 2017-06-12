var express = require("express");
var router = express.Router();
var promise = require('bluebird');
var user = require('../models/user');
var course = require('../models/courses');
var suggestion = require('../models/suggest');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var auth = require('../authentication/auth');
var phantomPrint = require('../models/phantomworker.js')
var exec = require('child_process').exec;
var fs = require("fs");
var updater = require('../course/CourseUpdate')

// course.allCourseCode(null, null).then((res) => {			//slot,crsnm
// 	console.log(res);
// });

// course.allSlots("CSE2006", null).then((res) => {			//crscd,faculty
// 	console.log(res);
// });

// course.allFaculty(null, "L1+L2").then((res) => {			//crscd,slot
// 	console.log(res);
// });

// course.allCourseName("CSE3009").then((res) => {			//crscd
// 	console.log(res);
// });

router.get('/', function (req, res) {
	res.render('home', { data: false });
});

router.post('/register', function (req, res) {
	data = req.body;
	if (data.type != undefined && data.type != null) {
		user.insertUser(data.name, data.regno, data.password)
			.then(function (action) {
				res.status(200);
				res.json({ status: "done" });
			}).catch(function (error) {
				res.status(500);
				res.json({ status: "error" });
			});
	}
	else {
		user.insertUser(data.name, data.regno, data.password)
			.then(function (action) {
				req.login(action, function (err) {
					if (!err) {
						res.redirect('/home');
						console.log("It worked : " + req.user);
					} else {
						res.redirect('/');
						console.log(err);
					}
				})
				// res.status(200);
				// res.render('home', { data: true, message: action });
			}).catch(function (error) {
				res.status(200);
				res.render('home', { data: true, message: error });
			});
	}
});



router.post('/login', passport.authenticate('local', { successRedirect: '/home', failureRedirect: '/failed' }));

router.post('/apiLogin', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return res.send({"error":"server faliure","status":false}); }
    if (!user) { return res.send({"message":"user not found","status":false}); }

    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.send({"message":"success","status":true});
    });

  })(req, res, next);
});

router.get('/home', (req, res) => {
	if (req.user == undefined) {
		res.redirect('/');
	} else {
		//Uncomment after new xls
		// course.staticArray(req,res);


		fs.readFile('crsnm.txt', 'utf8', function (err, contents1) {
			var arr = contents1.split(',');
			fs.readFile('crscd.txt', 'utf8', function (err, contents2) {
				var arr1 = contents2.split(',');
				if (err) {
					console.log(err);
				}
				else {
					res.render('newtt', { user: req.user, codes: arr1, names: arr });
				}
			});

		});


	}
});


router.get('/getslot/', (req, res) => {
	var crscd = req.query.q;
	course.allSlots(crscd, null)
		.then((res1) => {
			res.status(200);
			res.send(res1);
		})
		.catch((res2) => {
			res.status(500);
			res.send({ message: 'error' });
		});
});


router.get("/getcourse/", (req, res) => {
	course.all(req.query.courseCode, req.query.slots)
		.then((res1) => {
			res.status(200);
			res.send(res1);
		})
		.catch((res2) => {
			res.status(500);
			res.send({ message: 'error' });
		});
});

router.get('/failed', function (req, res) {
	res.status(500);
	res.render('home', { message: "Invalid Credentials", data: true });
});




router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

router.post('/addcourse', (req, res) => {
	promise.all([
		course.checkClash(req.body.courseId, req.headers.token),
		suggestion.incrementCount(req.body.courseId, req.headers.token),
		course.incrementCount(req.body.courseId, req.headers.token)
	])
		.then(([r0, r1, r2]) => {
			res.status(200);
			res.json({ 'status': true });
		})
		.catch((err) => {
			res.status(500);
			res.json({ 'status': false });
		});


});

router.post('/validate', (req, res) => {
	user.getRegisterNo(req.headers.token)
		.then((regno) => {
			promise.all([
				course.validateCredits(req.body.courseId, regno),
				course.validateSlots(req.body.courseId, regno),
				course.validateFaculty(req.body.courseId, regno)
			])
				.then(() => {
					res.redirect('/addcourse/' + req.body.courseId + '/' + regno);
				})
				.catch((err) => {
					console.log(err)
					res.status(200);
					res.json({ 'status': false, 'message': err });
				})
		})
		.catch((err) => {
			console.log(err)
			res.status(200);
			res.json({ 'status': false, 'message': err });
		});


});

router.get('/addcourse/:p1/:p2', (req, res) => {
	var courseId = req.params.p1;
	var token = req.params.p2;
	promise.all([
		suggestion.incrementCount(courseId, token),
		course.incrementCount(courseId, token)
	])
		.then(() => {
			res.status(200);
			res.json({ 'status': true });
		})
		.catch((err) => {
			res.status(500);
			res.json({ 'status': false });
		});
});


router.post('/deletecourse', (req, res) => {
	console.log(req.headers.token);
	user.getRegisterNo(req.headers.token)
		.then((regno) => {
			console.log(regno);
			promise.all([
				//user.deleteCourse(req.body.courseId, regno),
				course.removeUserFromCourse(regno, req.body.courseId),
				suggestion.removeFromSuggestCourse(req.body.courseId, regno)
			])
				.then(([r1, r2]) => {
					res.status(200);
					res.json({ 'status': true });
				})

		})
		.catch((err) => {
			res.status(500);
			res.json({ 'status': false });
		});


});


router.get('/detail', (req, res) => {
	user.getRegisterNo(req.headers.token || req.user._id)
		.then((regno) => {
			console.log(regno);
			course.details(regno)
				.then((course_arr) => {
					console.log(JSON.stringify(course_arr, null, 4));
					res.status(200);
					res.json({ 'status': true, 'data': { 'newAllotedCourse2': course_arr } });
				})

		})
		.catch((e) => {
			res.status(500);
			res.json({ 'status': false, 'data': { 'newAllotedCourse2': [] } });
		});
});


router.post('/suggestcourse', (req, res) => {
	user.getRegisterNo(req.body.reg)
		.then((regno) => {
			suggestion.getData(regno)
				.then((re) => {
					res.status(200);
					res.json({ message: true, data: re });
				})
		})
		.catch((er) => {
			res.status(500);
			res.json({ message: false });
		});

});

/*router.post('/downloadtt',(req,res)=>{
	console.log(typeof(req.session.passport.user));
	var uid = req.session.passport.user
	phantomPrint.render(uid)
	.then((data)=>{
		res.render("newtt3.ejs",{info:data})
	})
	.catch((e)=>{
		res.send("error")
	})
	/*let data = req.body
	let len = Object.keys(data).length
	let slots = data["slots[]"] || data["slots"]
	console.log(req.session.passport.user);
	phantomPrint(slots)
	.then(()=>{
		res.send("done")
	})
	.catch((e)=>{
		res.send("error")
		console.log(e)
	})
})*/

router.post('/downloadtt', (req, res) => {
	console.log(typeof (req.session.passport.user));
	var uid = req.session.passport.user
	phantomPrint.doPrint(uid)
		.then(() => {
			console.log("done print")
			res.send({ "status": true, "link": "/download/" + req.session.passport.user, "token2": req.headers.token })
		})
		.catch((e) => {
			console.log(e)
		})
})

router.get('/rendertt/:uid', (req, res) => {
	var uid = req.params.uid;
	phantomPrint.render(uid)
		.then((datax) => {
			data = datax[0]
			nam = datax[1]
			var slot = []
			var pr = data.map((value) => {
				return new promise((full, rej) => {
					var sl = value.Slot.split('+');
					var x = sl.map((val) => {
						return new promise((f, r) => {
							slot.push(val)
							f()
						})
					})
					promise.all(x)
						.then(() => {
							full()
						})
				})
			})
			promise.all(pr)
				.then(() => {
					res.render("newtt3.ejs", { info: data, slots: slot, name: "YOUR" })
				})
		})
		.catch((e) => {
			res.send("error")
		})
})

router.get('/download/:uid/:reg', (req, res) => {
	var uid = req.params.uid;
	var reg = req.params.reg;
	user.getRegisterNo(reg)
		.then((regno) => {
			if (req.session.passport.user == uid) {
				var filename = "myFFCStt.png"
				console.log(filename)
				res.download("./downloads/" + uid + ".png", regno + "_" + filename)
			}
			else {
				console.log(req.session.passport.user + " " + uid)
			}
		})
		.catch((e) => {
			res.send("error");
		})
})

router.get('/share/:uid', (req, res) => {
	var uid = req.params.uid;
	phantomPrint.render(uid)
		.then((datax) => {
			data = datax[0]
			nam = datax[1]
			var slot = []
			var pr = data.map((value) => {
				return new promise((full, rej) => {
					var sl = value.Slot.split('+');
					var x = sl.map((val) => {
						return new promise((f, r) => {
							slot.push(val)
							f()
						})
					})
					promise.all(x)
						.then(() => {
							full()
						})
				})
			})
			promise.all(pr)
				.then(() => {
					let namm = nam + "'s"
					res.render("newtt_share.ejs", { info: data, slots: slot, name: namm })
				})
		})
		.catch((e) => {
			res.send("error")
		})
})


//CAN BE USED TO UPDATE EXISTING COURSEDB SCHEMA WITHOUT LOSING
//EXISTING VALUES
/*
router.get('/updater',(req,res)=>{
	updater()
	.then(()=>{
		res.send("done")
	})
	.catch(()=>{
		res.send("failed")
	})
})
* */

module.exports = router;
