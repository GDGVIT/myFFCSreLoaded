var node_xj = require("xls-to-json");
var promise = require('promise');
var node_xj = promise.denodeify(node_xj);
let course = require('../models/courses')

module.exports = () =>{
	return new promise((f,r)=>{
	node_xj({ input: "./public/course/actual.xlsx", output: null })
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

	function Save(newCourse) {
		return new promise((fullfill, reject) => {
			newCourse.save((err, data) => {
				if (err) reject(err);
				else fullfill(data);
			});
		});
	}

	let DocFind = (res) =>{
		return new promise((full,rej)=>{
			course.Course.find({Faculty: res.Faculty, Crscd: res['Course Code'], Crsnm: res['Course Name'], Slot: res["Slot"], Credits: res["Credits"], Venue: res["Venue"]},(err,doc)=>{
				doc[0].Type = res["Type"]
				doc[0].Mode = res["Mode"]
				doc[0].save((er,d)=>{
					if(!err){
						full()
						console.log(d.Mode)
						console.log(res.Mode+"\n\n")
					}
					else
					rej()
				})
			})
		})
	}
	})	
}
