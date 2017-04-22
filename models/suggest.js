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
    return new promise((full, rej) => {
        Course.findById(id, (err, data) => {
            var crscd = data.Crscd;
            Suggest.findOne({ ffd: reg }, (err, doc) => {
                if (err) rej(err);
                if (doc) {
                    var arr = doc.cnt;
                    var obj = { 'crscd': crscd, 'count': 0 };
                    flag = 0;
                    console.log(arr.length);
                    for (i = 0; i < arr.length; i++) {
                        if (arr[i].crscd == crscd) {
                            arr[i].count = arr[i].count + 1;
                            flag = 1;
                            console.log(arr[i]);

                        }

                        if (i == arr.length - 1 && flag == 0) {
                            console.log(obj);
                            arr.push(obj);
                        }
                    }
                    console.log(arr.length);
                    Suggest.findOneAndUpdate({ ffd: reg }, { $set: { cnt: arr } }, { new: true }, (e, docs) => {
                        if (e) rej(e);
                        else {
                            console.log('Register : ' + reg + ' was ther but new doc');
                            console.log(docs);
                        }

                    });
                }
                else {
                    var a = [{ "crscd": crscd, "count": 1 }];
                    console.log(a, crscd);
                    var item = { ffd: reg, cnt: a };
                    var newSuggest = new Suggest(item);
                    newSuggest.save((e, d) => {
                        if (e) {
                            rej(e);
                        }
                        else {
                            console.log('New ' + reg + " inserted\n");
                            console.log(d);
                        }
                    });
                }

            });
        });
    });

}


exports.getData = (reg) => {
    var reg = reg.substring(0, 5);
    return new promise((full, rej) => {
        Suggest.findOne({ ffd: reg }, (err, doc)=>{
            if(err) rej(err);
            else{
                full(doc.cnt);
            }
        });
    });

}

