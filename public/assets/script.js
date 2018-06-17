$(document).ready(main);

var poems = [];
var afterCode = "";
var fetchCounter = 1;

var triggerEvent = "click";
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    triggerEvent = "touchstart";
} 


function main(){
    console.log("script.js is running");

    getPoemsFromDatabase();


    $("body").on(triggerEvent, ".toggle-right", function(){
        nextPoem();
    });

    $("body").on(triggerEvent, ".toggle-left", function(){
        previousPoem();
    });

    $("body").on(triggerEvent, "#random", function(){
        randomPoem();
    });

    window.addEventListener('popstate', function(e) {
      // e.state is equal to the data-attribute of the last image we clicked
    });
 
}



function nextPoem(){
    currentIndex = (currentIndex == poems.length -1) ? 0 : currentIndex + 1;
    displayPoem(poems[currentIndex]);
}


function previousPoem(){
    currentIndex = (currentIndex == 0) ? poems.length - 1 : currentIndex - 1;
    displayPoem(poems[currentIndex]);
}

function randomPoem(){
    var randomIndex = Math.floor(Math.random()*poems.length);
    currentIndex = randomIndex;
    displayPoem(poems[currentIndex]);
}



function getPoemsFromDatabase(){

    console.log("getting poems from DB...");

    $.ajax({
        type: "get",
        url: "/all-poems",
        success: function(response){


            poems = response;
        
            console.log("DONE! Got " + poems.length + " poems");

            currentIndex = 0;
            console.log(window.location.pathname);
            console.log(window.location.pathname.toString().substring(1,window.location.pathname.length));

            if(window.location.pathname != "/"){
                
                currentIndex = 0;

                for(var i = 0; i < poems.length; i++){

                    // get the index of the poem with the ID from the URL
                    if((poems)[i].data.id == window.location.pathname.toString().substring(1,window.location.pathname.length) ){
                        currentIndex = i;
                    }
                }

            }


            displayPoem(poems[currentIndex]);    
            

        }
    });


}

// gets poems directly from a page on reddit
function getPoemsFromThisPage(afterCode){
    
    var getUrl = "https://www.reddit.com/user/Poem_for_your_sprog/comments.json?limit=100&after=" + afterCode;

    $.ajax({
        type: "get",
        url: getUrl,
        success: function(response){
            
            poems = poems.concat(response.data.children);
            afterCode = response.data.after;

            if(fetchCounter < 10){
                
                $("#percent-count").empty().append(10*fetchCounter + "%");

                fetchCounter++;
                getPoemsFromThisPage(afterCode);
            } else {

                console.log("DONE! Got " + poems.length + " poems");
                $("#loading-bar").css("display", "none");

                currentIndex = 0;
                displayPoem(poems[currentIndex]);    
            }

        }
    });
}


function displayPoem(poem){

    $("#skeleton-poem").css("display", "none");

    $(".poem").css("display", "flex");

//    console.log(poem);

    var content = document.createElement('span');
    content.innerHTML = poem.data.body_html.toString();

    // wtf.
    $("#poem-body").empty().append($.parseHTML(content.innerHTML)[0].data);

    $("#happy .count").text(poem.happy)
    $("#sad .count").text(poem.sad)
    $("#deep .count").text(poem.deep)
    $("#sexy .count").text(poem.sexy)
    $("#timmy .count").text(poem.timmy)

    $("#current-count").text(currentIndex + 1);
    $("#total-count").text(poems.length);
    $("#poem-link").attr("href", "https://www.reddit.com" + poem.data.permalink)


    console.log("updating pathname");
    window.history.pushState("object or string", "Title", "/" + poem.data.id);

}






