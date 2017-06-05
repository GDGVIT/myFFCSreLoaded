var mongoose = require('mongoose');
var Course = require('./courses').Course;
var promise = require('bluebird');
var suggestion = mongoose.Schema({
    ffd: {
        type: String
    },
    cnt: []
});

var Suggest = mongoose.model('Suggest', suggestion);

exports.incrementCount = (id, reg) => {
    var reg = reg.substring(0, 5);
    console.log("I m in suggestions func");
    return new promise((full, rej) => {
        Course.findById(id, (err, data) => {
            var crscd = data.Crscd;
            var crsnm = data.Crsnm;
            var credits = data.Credits;
            Suggest.findOne({ ffd: reg }, (err, doc) => {
                if (err) rej(err);
                if (doc) {
                    var arr = doc.cnt;
                    var obj = { 'crscd': crscd,'crsnm':crsnm,'credits':credits ,'count': 1 };
                    flag = 0;
                    for (i = 0; i < arr.length; i++) {
                        if (arr[i].crscd == crscd) {
                            arr[i].count = arr[i].count + 1;
                            flag = 1;
                        }
                    }
                    if (flag == 0) {
                        arr.push(obj);
                    }
                    Suggest.findOneAndUpdate({ ffd: reg }, { $set: { cnt: arr } }, { new: true }, (e, docs) => {
                        if (e) rej(e);
                        else {
                            full("suggestion updated");
                        }
                    });
                }
                else {
                    var a = [{ "crscd": crscd, 'crsnm':crsnm,'credits':credits , "count": 1 }];
                    var item = { ffd: reg, cnt: a };
                    var newSuggest = new Suggest(item);
                    newSuggest.save((e, d) => {
                        if (e) {
                            rej(e);
                        }
                        else {
                            full("suggestion updated");
                        }
                    });
                }

            });
        });
    });

}


exports.removeFromSuggestCourse = (id, reg) => {
    var reg = reg.substring(0, 5);
    return new promise((full, rej) => {
        Course.findById(id, (err, data) => {
            var crscd = data.Crscd;
            Suggest.findOne({ ffd: reg }, (err, doc) => {
                if (err) rej(err);
                else if (doc) {
                    var arr = doc.cnt;
                    for (i = 0; i < arr.length; i++) {
                        if (arr[i].crscd == crscd) {
                            arr[i].count = arr[i].count - 1;
                            if(arr[i].count == 0 ){
                                arr.splice(i,1);
                            }
                        }
                    }
                    Suggest.findOneAndUpdate({ ffd: reg }, { $set: { cnt: arr } }, { new: true }, (e, docs) => {
                        if (e) rej(e);
                        else {
                            full("suggestion updated");
                        }
                    });
                }
                else {
                    full('Some problem in register no.');
                }

            });
        });
    });
}


exports.getData = (reg) => {
    var reg = reg.substring(0, 5);
    return new promise((full, rej) => {
        Suggest.findOne({ ffd: reg }, (err, doc) => {
            if (err) rej(err);
            else if(doc != null){
                full(doc.cnt);
            }
            else{
                var u = "You are first among all " + reg +"'s";
                full([ { "count" : " - ", "credits" : ' - ', "crsnm" : "No suggestions till now", "crscd" : u }]);
            }
        });
    });

}

