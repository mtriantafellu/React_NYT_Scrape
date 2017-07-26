// Include Server Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require("request");

var Article = require("./models/Article.js");
var Note = require("./models/Note.js");

mongoose.Promise = Promise;

// Express
var app = express();
// Port at 3000
var PORT = process.env.PORT || 3000;

// Run Morgan for Logging
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

app.use(express.static("public"));

// -------------------------------------------------

//mongodb://heroku_crbp6c96:b3bair98qb1438rc8bql941a55@ds125053.mlab.com:25053/heroku_crbp6c96
//mongodb://localhost/nytsearch

if(process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect("mongodb://heroku_crbp6c96:b3bair98qb1438rc8bql941a55@ds125053.mlab.com:25053/heroku_crbp6c96");
}


// MongoDB using nytsearch

var db = mongoose.connection;

db.on("error", function(err) {
  console.log("Mongoose Error: ", err);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// -------------------------------------------------

// Main "/" Route. This will redirect the user to our rendered React application
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

// From MongoScrape
app.get("/scrape", function(req, res) {
  request("http://www.npr.org", function(error, rsponse, html) {
    var $ = cheerio.load(html);

    $("article h2").each(function(i, element) {
      var result = {};

      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      var entry = new Article(result);

      entry.save(function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log(doc);
        }
      });
    });
  });
    res.send("Scrape Complete");
});

app.get("/articles", function(req, res) {
    Article.find({})
        .populate("note")
        .exec(function(error, doc) {
            if (error) {
                console.log(error);
            } else {
                res.json(doc);
            }
        });
});

app.get("/articles/:id", function(req, res) {
    Article.findOne({ "_id": req.params.id })
        .populate("note")
        .exec(function(error, doc) {
            if (error) {
                console.log(error);
            } else {
                res.json(doc);
            }
        });
});

app.post("/articles/:id", function(req, res) {
    var newNote = new Note(req.body);

    newNote.save(function(error, doc) {
        if (error) {
            console.log(error);
        } else {
            Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
                .exec(function(err, doc) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        res.send(doc);
                    }
                });
        }
    });
});
// End from MongoScrape


// -------------------------------------------------

// Starting our express server
app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});
