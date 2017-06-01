var promise = require('bluebird');
var exec = require('child_process').exec
var user = require('../models/user')
var course = require('./courses.js');

/*module.exports=(slots)=>{
  return new promise((full,rej)=>{
    let path = "http://localhost:3000/rendertt"
    let fname = "randomString.png"
    let phantomScript = "./models/render.js"
    console.log(slots)
    let slot_args = slots.join(" ")
    console.log(slot_args)
    let cmd = "./models/phantomjs "+phantomScript+" "+path+" "+fname+" "+slot_args
    console.log(cmd)
    exec(cmd,(error,stdout,stderr)=>{
      if (error !== null) {
        console.log('exec error: ' + error);
        rej(error)
      }
      else{
          console.log("done")
          full()
      }
    })
  })
}*/

exports.doPrint=(uid)=>{
	return new promise((full,rej)=>{
    let path = "http://localhost:3000/rendertt/"+uid
    let fname = "./downloads/"+uid+".png"
    let phantomScript = "./models/test.js"
    let cmd = "node "+phantomScript+" "+path+" "+fname
    console.log(cmd)
    exec(cmd,(error,stdout,stderr)=>{
      if (error !== null) {
        console.log('exec error: ' + error);
        rej(error)
      }
      else{
          console.log("done")
          full()
      }
    })
  })
}

exports.render=(uid)=>{
	console.log("helo")
	return new promise((full,rej)=>{
		user.User.findById(uid,(err,data)=>{
			console.log(data.courses)
			course.Course.find({'_id' : {$in : data.courses}},'Slot -_id Faculty Crscd Crsnm Credits Venue',(err,dat)=>{
				console.log(dat);
				full([dat,data.name])
			})
		})
	})
}
