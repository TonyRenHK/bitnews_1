//heroku run node BatchJob_DeleteData.js


var mongodb = require("mongodb");
var DatabaseName = 'heroku_qktxqs41';
var TestingMongoDBURL = 'mongodb://tonyrenhk-salesforce-prcn-5343300:27017';

//Today
var TodayDate = new Date();

var mm = TodayDate.getMonth() + 1;
var dd = TodayDate.getDate() - 2;

var selectDate = [TodayDate.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('');

console.log('Now selectDate : ' + selectDate);



mongodb.MongoClient.connect(process.env.MONGODB_URI || TestingMongoDBURL, function(err, db) {
    //MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DatabaseName);
    var myquery = { CreateDate: selectDate };
    dbo.collection("News").deleteMany(myquery, function(err, obj) {
        if (err) throw err;
        console.log(obj.result.n + " document(s) deleted");
        db.close();
    });

});
