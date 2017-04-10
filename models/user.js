var mongoose = require('mongoose');
var promise = require('bluebird');
var bcrypt = require('bcrypt');
var user = mongoose.Schema({
	name:{
		type:String
	},
	regno:{
		type:String,
		unique:true
	},
	passwd:{
		type:String,
		bcrypt:true
	}
});

var User = mongoose.model("User",user);

function userPresent(regno){
	return new promise(function(fullfill,reject){
		User.find({regno:regno},function(err,data){
			if (err) reject("Mongo error: "+err);
			if(data.length>0){
				fullfill(true);
			}
		});
	});
}

function userInsert(name,regno,passwd){
	return new promise(function(fullfill,reject){
		userPresent(regno)
		.then(function(is){
			if(is){
				fullfill('You have already registered once');
			}
			else{
				bcrypt.hash(passwd,7,function(err,hash){
					if (err) {
						console.log(err);
						reject("Bcrypt error :"+err);
					}
					else{
						passwd= hash;
						var newUser = new User({
							name:name,
							regno:regno,
							passwd:passwd
						});
						newUser.save(function(error, data){
							if(err)
								reject('Mongo error: '+error);
							else{
								fullfill('User inserted :'+ name);
							}
						});
					}

				});
			}
		})
		.catch(function(e){
			reject(e);
		});
		

		
	});
}

exports.insertUser = userInsert;


