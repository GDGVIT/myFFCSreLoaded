var webshot = require('webshot');
var path = process.argv[2];
var fname= process.argv[3];
var options = {
	takeShotOnCallback:true,
	errorIfJSException:true,
	defaultWhiteBackground:true,
	screenSize: {
		width: 1500
		,height: 1000
	}
	,shotSize: {
		width: 1500
		,height: 'all'
	},
}; 

webshot(path,fname,options, function(err) {
  console.log(err);
  console.log("test")
});
