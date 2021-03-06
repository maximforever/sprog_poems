const database = require("./database");
const nodemailer = require('nodemailer');                 // send email
var request = require('request');                         // send HTTP requests


function getPoems(db, callback){

    var sortQuery = {};
    sortQuery["data.created"] = 1;

    database.sortRead(db, "poems", {}, sortQuery, function(poems){

        var formattedPoems = [];

        for(var i = 0; i < poems.length; i++){
            
            var poem = poems[i].data;
            var parentLink = poem.link_permalink + poem.parent_id.substr(3);

            var thisPoem = {
                body: poem.body,
                html: poem.body_html,
                link: poem.link_permalink + poem.id,
                parent: parentLink,
                id: poem.id, 
                votes: {
                    happy: 0,
                    sad: 0,
                    deep: 0,
                    sexy: 0,
                    timmy: 0
                },
                ipVotes: {
                    happy: false,
                    sad: false,
                    deep: false,
                    sexy: false,
                    timmy: false
                }
            }

            formattedPoems.unshift(thisPoem);

        }


        callback(formattedPoems);
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
