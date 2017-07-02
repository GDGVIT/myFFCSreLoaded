var node_xj = require("xls-to-json");
var promise = require('promise');
var node_xj = promise.denodeify(node_xj);
let course = require('../models/courses')

module.exports = () =>{
	return new promise((f,r)=>{
	node_xj({ input: "./public/course/final.xlsx", output: null })
		.then((result) => {
			let x = result.map((res)=>{
				return new promise((full,rej)=>{
					DocFind(res)
					.then(()=>{
						full();
					})
					.catch(()=>{
						console.log("error")
					})	
				})
			})
			
			promise.all(x)
			.then(()=>{
				console.log("updated")
				f()
			})
			.catch(()=>{
				r()
			})
		})
		.catch((e) => {
			reject(e);
		});

	/*function Save(newCourse) {
		return new promise((fullfill, reject) => {
			newCourse.save((err, data) => {
				if (err) reject(err);
				else fullfill(data);
			});
		});
	}*/

	let DocFind = (res) =>{
		return new promise((full,rej)=>{
			course.Course.find({Faculty: res.Faculty, Crscd: res['Course Code'], Crsnm: res['Course Name'], Slot: res["Slot"], Venue: res["Venue"]},(err,doc)=>{
				let x = res.Credits.split(" ")
				x=x.filter((v)=>{
					if(v.toString().length>0)
					return v
				});
				if(res["Slot"].indexOf("L")>=0){
					credits = parseInt(x[2])/2
					doc[0].Credits = credits;
				}
				else{
					credits = parseInt(x[0])+parseInt(x[1])+(parseInt(x[3])/4)
					doc[0].Credits = credits;
				}
				
				/*if(res["Slot"].indexOf("L")>=0)
				//console.log(doc[0].Credits)
				//console.log(res["Slot"])*/
				/*doc[0].save((er,d)=>{
					if(!err){
						full()
						console.log(d.Mode)
						console.log(res.Mode+"\n\n")
					}
					else
					rej()
				})*/
			})
		})
	}
	})	
}
