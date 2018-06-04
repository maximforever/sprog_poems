const database = require("./database");
const nodemailer = require('nodemailer');                 // send email
var request = require('request');                         // send HTTP requests


function getPoems(db, callback){

    database.read(db, "poems", {}, function(poems){
        callback(poems); 
    
    })
}

function getOnePoem(db, poemID, callback){

    var poemQuery = {}
    poemQuery["data.id"] = poemID;

    database.read(db, "poems", poemQuery, function(poem){
        callback(poem); 
    })
}


function importPoems(db, callback){

    var poems = [];


    getPoemsFromThisPage("", 0, poems, function(poemJSON){

            console.log("poemJSON has " + poemJSON.length + " poems");

            for(var i = 0; i < poemJSON.length; i++){

                var thisPoem = poemJSON[i].data;

                var existingPoemQuery = {}
                existingPoemQuery["data.id"] = thisPoem.id;

                var poemRecord = {
                    data: thisPoem,
                    timmy: 0,
                    happy: 0,
                    sad: 0,
                    funny: 0,
                    deep: 0,
                    sexy: 0
                }

                database.update(db, "poems", existingPoemQuery, poemRecord, function updatedPoem(updatedPoem){
                    console.log("done!");
                })

            }

            callback({
                status: "success",
                poems: poemJSON
            });
    });
}


function getPoemsFromThisPage(afterCode, fetchCounter, poems, callback){
    
    fetchCounter++;

    console.log("Getting poems for fetchCounter " + fetchCounter);

    var getUrl = "https://www.reddit.com/user/Poem_for_your_sprog/comments.json?limit=100&after=" + afterCode;

    request.get(getUrl, function (error, apiRes, body) {

        afterCode = JSON.parse(body).data.after;
        poems = poems.concat(JSON.parse(body).data.children);

        if(fetchCounter < 10){
            getPoemsFromThisPage(afterCode, fetchCounter, poems, callback);
        } else {
            callback(poems) 
        }
    })
    
}

/* MODULE EXPORES */
module.exports.importPoems = importPoems;
module.exports.getPoems = getPoems;
module.exports.getOnePoem = getOnePoem;
