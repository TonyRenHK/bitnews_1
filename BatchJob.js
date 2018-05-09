var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');

var DatabaseName = 'heroku_qktxqs41';


var app = express();
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;
// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://tonyrenhk-salesforce-prcn-5343300:27017", function(err, client) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    // Save database object from the callback for reuse.
    db = client.db();
    console.log("Database connection ready");
    var dbo = client.db(DatabaseName);
    var query = {};
    console.log('******connect***');
    var GetNewsTimeList = [];
    dbo.collection("News").find(query).toArray(function(err, result) {
        if (err) throw err;
        console.log('******Get Data***');
        //console.log(result);

        for (var i = 0; i < result.length; i++) {
            console.log(result[i].Time);
            GetNewsTimeList.push(result[i].Time);
        }
        client.close();
        CrawlWeb(GetNewsTimeList);
    });

});



function CrawlWeb(TimeList) {

    request('https://www.bixuncn.com', function(error, response, body) {
        if (error) {
            console.log('error:', error); // Print the error if one occurred
        }
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        //console.log('body:', body); // Print the HTML for the Google homepage.
        //writingFile(body);
        $ = cheerio.load(body, { decodeEntities: false, normalizeWhitespace: true });

        var WebTimeStamp = '';
        $(".date").each(function() {
            //console.log('Now Date' + $(this).html());
            //console.log('Now Date' + $(this).next().attr('data-day')); //yyyymmdd
            WebTimeStamp = $(this).next().attr('data-day');
            var date = new Date();
            //console.log('system date : ' + date.yyyymmdd());

        });
        var NewsContentList = [];
        $(".onepixel").each(function() {
            console.log('Get Time:' + $(this).children().children().html());
            if (TimeList.indexOf($(this).children().children().html()) == -1) {
                console.log('Get Content:' + $(this).children().next().html());
                NewsContentList.push({
                    CreateDate: WebTimeStamp,
                    Time: $(this).children().children().html(),
                    Content: $(this).children().next().html()
                });
            }



        });
        if (NewsContentList.length > 0) {
            InsertDataIntoDB(NewsContentList);
        }

    });
}









function writingFile(InputBody) {
    fs.writeFile("Data/1.txt", InputBody, function(err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}








Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
    ].join('');
};



function InsertDataIntoDB(InsertList) {

    mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://tonyrenhk-salesforce-prcn-5343300:27017", function(err, db) {
        //MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(DatabaseName);
        dbo.collection("News").insertMany(InsertList, function(err, res) {
            if (err) throw err;
            console.log("Number of documents inserted: " + res.insertedCount);
            db.close();
        });
    });

}
