var express = require("express");
var router = express.Router();
var promise = require('bluebird');
var user = require('../models/user');
var passport= require('passport');
var LocalStrategy  =require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var auth = require('../authentication/auth');


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


router.post('/login',passport.authenticate('local', { successRedirect: '/success',failureRedirect: '/failed'}));

router.get('/failed',function(req,res){
	res.render('home',{message:"Invalid Credentials",data:true});
});

router.get('/logout',(req,res)=>{
	req.logout();
	res.redirect('/');
});

module.exports = router;