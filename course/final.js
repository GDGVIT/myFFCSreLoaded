var getCourses = require('./CoursesXlToJson');
var converter = require('json-2-csv');
var final = []
var json2csv = require('json2csv');
getCourses()
	.then((result) => {
		result.forEach((res) => {
			var item = { Faculty: res.Faculty, Count: [], Crscd: res['Course Code'], Crsnm: res['Course Name'], Slot: res["Slot"], Venue: res["Venue"],Type: res["type"] }
			var credits = 0
			if(res["Course Name"].indexOf("L")>0){
				var x = res.Credits.split(" ")
				credits = parseInt(x[2])/2
			}
			else{
				var x = res.Credits.split(" ")
				credits = parseInt(x[0])+parseInt(x[1])+parseInt(x[])
			}
			var fields = ['Faculty','Course Code','Course name','Slot','Credits','Venue','type'];
			final.push(item)
		});

	})
	.catch((e) => {
		//console.log(e);
	})
