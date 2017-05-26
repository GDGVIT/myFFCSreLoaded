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
	data=req.body; 
	if(data.type != undefined && data.type!=null){
		user.insertUser(data.name, data.regno, data.password)
		.then(function (action) {
			res.status(200);
			res.json({status:"inserted"});
		}).catch(function (error) {
			res.status(500);
			res.json({status:"error"});
		});
	}
	else{
		user.insertUser(data.name, data.regno, data.password)
		.then(function (action) {
			res.status(200);
			res.render('home', { data: true, message: action });
		}).catch(function (error) {
			res.status(500);
			res.render('home', { data: true, message: error });
		});
	}
	
});



router.post('/login', passport.authenticate('local', { successRedirect: '/home', failureRedirect: '/failed' }));

router.get('/home', (req, res) => {
	// if (req.user == undefined) {
	// 	res.redirect('/');
	// } else {
		course.all().then((res1) => {
			course.allCourseCode(null, null).then((res2) => {
				course.allSlots("CSE2006", null).then((res3) => {
					res.status(200);
					res.render('newtt', { user: req.user, data: res1, codes: res2, slots: res3 });
				});

			});

		});
	// }
});


router.get('/getslot/', (req, res) => {
	var crscd = req.query.q;
	course.allSlots(crscd, null)
	.then((res1) => {
		res.status(200);
		res.send(res1);
	})
	.catch((res2)=>{
		res.status(500);
		res.send({message:'error'});
	});
});


router.get("/getcourse/",(req,res)=>{
	course.all(req.query.courseCode,req.query.slots)
	.then((res1)=>{
		res.status(200);
		res.send(res1);
	})
	.catch((res2)=>{
		res.status(500);
		res.send({message:'error'});
	});
});

router.get('/failed', function (req, res) {
	res.status(500);
	res.render('home', { message: "Invalid Credentials", data: true });
});


// router.get('/oldtimetable',(req,res)=>{
// 	if(req.user ==undefined){
// 		res.render('home',{data:true,message:"Login First"});
// 		res.location('/');
// 	}
// 	else{
// 		res.render('oldtt',{user:req.user});
// 	}
// });



router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

router.post('/addcourse',(req,res)=>{
	promise.all([
		course.checkClash(req.body.courseId,req.headers.token),
		suggestion.incrementCount(req.body.courseId,req.headers.token),
		course.incrementCount(req.body.courseId,req.headers.token)
	])
	.then(([r0,r1,r2])=>{
		res.status(200);
		res.json({'status':true});
	})
	.catch((err)=>{
		res.status(500);
		res.json({'status':false});
	});


});

router.post('/validate',(req,res)=>{
	promise.all([
		course.validateCredits(req.body.courseId,req.headers.token),
		course.validateSlots(req.body.courseId,req.headers.token),
		course.validateFaculty(req.body.courseId,req.headers.token)
	])
	.then(()=>{
		res.redirect('/addcourse/'+req.body.courseId+'/'+req.headers.token);
	})
	.catch((err)=>{
		res.status(500);
		res.json({'status':false});
	});
});

router.get('/addcourse/:p1/:p2',(req,res)=>{
	var courseId=req.params.p1;
	var token=req.params.p2;
	promise.all([
		suggestion.incrementCount(courseId,token),
		course.incrementCount(courseId,token)
	])
	.then(()=>{
		res.status(200);
		res.json({'status':true});
	})
	.catch((err)=>{
		res.status(500);
		res.json({'status':false});
	});
});


router.post('/deletecourse',(req,res)=>{
	console.log(req.body);
	promise.all([
		user.deleteCourse(req.body.courseId,req.headers.token),
		course.removeUserFromCourse(req.headers.token,req.body.courseId),
		suggestion.removeFromSuggestCourse(req.body.courseId,req.headers.token)
	])
	.then(([r1,r2])=>{
		res.status(200);
		res.json({'status':true});
	})
	.catch((err)=>{
		res.status(500);
		res.json({'status':false});
	});
});


router.get('/detail',(req,res)=>{
	course.details(req.headers.token)
		.then((course_arr)=>{
			console.log(JSON.stringify(course_arr,null,4));
			res.status(200);
			res.json({'status':true,'data':{'newAllotedCourse2':course_arr}});
		})
		.catch((e)=>{
			res.status(500);
			res.json({'status':false,'data':{'newAllotedCourse2':[]}});
		});
});


router.post('/suggestcourse',(req,res)=>{
	suggestion.getData(req.body.reg)
	.then((re)=>{
		res.status(200);
		res.json({message:true,data:re});
	})
	.catch((er)=>{
		res.status(500);
		res.json({message:false});
	});
});

module.exports = router;
