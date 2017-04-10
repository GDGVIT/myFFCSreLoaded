var express = require("express");
var router = express.Router();
var user = require('../models/user');

router.get('/',function(req,res){
	res.render('home',{data:false});
});

router.post('/register',function(req,res){
	var data = req.body;
	user.insertUser(data.name,data.regno,data.password)
	.then(function(action){
		console.log('adjba');
		res.render('home',{data:true,message:action});
	}).catch(function(error){
		res.render('home',{data:true,message:error});
	});
});

module.exports = router;