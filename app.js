
/* dependencies */

const fs = require("fs");                               // file system
const path = require("path");                           // access paths
const express = require("express");                     // express
const MongoClient = require('mongodb').MongoClient;     // talk to mongo
const bodyParser = require('body-parser');              // parse request body

const app = express();
const http = require("http").Server(app);


app.set("port", process.env.PORT || 3000)                       // we're gonna start a server on whatever the environment port is or on 3000
app.set("views", path.join(__dirname, "/public/views"));        // tells us where our views are
app.set("view engine", "ejs");                                  // tells us what view engine to use

app.use(express.static('public'));                              // sets the correct directory for static files we're going to serve - I believe this whole folder is sent to the user

const dbops = require("./app/dbops");
const database = require("./app/database");

if(process.env.LIVE){                                                                           // this is how I do config, folks. put away your pitforks, we're all learning here.
    dbAddress = "mongodb://" + process.env.MLAB_USERNAME + ":" + process.env.MLAB_PASSWORD + "@ds139960.mlab.com:39960/sprog";
} else {
    dbAddress = "mongodb://localhost:27017/sprog";
}

MongoClient.connect(dbAddress, function(err, client){
    if (err){
        console.log("MAYDAY! MAYDAY! Crashing.");
        return console.log(err);
    } else {

        var db = client.db('sprog');            // this is a Mongo 3.0 thing
        app.use(function(req, res, next){                                           // logs request URL

            var timeNow = new Date();
            console.log("-----> " + req.method.toUpperCase() + " " + req.url + " on " + timeNow);

            next();
        });

        // routes


        app.get("/all-poems", function(req, res){
            dbops.getPoems(db, function(poems){
                res.send(poems);
            })
        })

        app.get("/", function(req, res){
            res.render("index");
        })

        app.get("/test", function(req, res){
            res.render("test");
        })




        app.get("/import", function(req, res){
            dbops.importPoems(db, function(response){

                if(response.status == "success"){
                    console.log("Success!");
                    res.redirect("/");
                } else {
                    res.send(":(");
                }

            })

        })


        app.get("/:id", function(req, res){
            res.render("index");
        })


    }




/* END ROUTES */


    /* 404 */

    app.use(function(req, res) {
        res.status(404);
        res.redirect("/");
    });

    http.listen(app.get("port"), function() {
        console.log("Server started on port " + app.get("port"));
    });


});
