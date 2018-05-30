const database = require("./database");
const nodemailer = require('nodemailer');                 // send email
var request = require('request');                         // send HTTP requests

function search(db, req, callback){

    database.read(db, "terms", searchQuery, function(searchResult){

        callback({
            status: "success",
            count: searchResult.length,
            body: searchResult
        });
        

    });
}

/* MODULE EXPORES */
module.exports.search = search;
