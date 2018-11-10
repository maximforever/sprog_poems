//$(document).ready(main);

var poems = [];
var afterCode = "";
var fetchCounter = 1;

var triggerEvent = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ? "touchstart" : "click";


var app = new Vue({
    el: "#app",
    data: {
        data: null,
        currentlySelectedPoems: null,
        currentPoem: null,
        currentIndex: 0 
    },
    methods: {
        nextPoem(){
            this.currentIndex = (this.currentIndex == poems.length -1) ? 0 : this.currentIndex + 1;
            this.displayPoem();
        },


        previousPoem(){
            this.currentIndex = (this.currentIndex == 0) ? poems.length - 1 : this.currentIndex - 1;
            this.displayPoem();
        },

        randomPoem(){
            console.log("getting random poem");
            this.currentIndex = Math.floor(Math.random()*poems.length);;
            this.displayPoem();
        },

        displayPoem(){

            this.currentPoem = this.currentlySelectedPoems[this.currentIndex];
            this.currentPoem.html = decodeHTMLEntities(this.currentPoem.html);

            window.history.pushState("object or string", "Title", "/" + this.currentPoem.id);

        }
    },
    computed: {
        currentPoemNumber(){
            return (this.data.length - this.currentIndex)
        }
    },
    mounted: getPoemsFromDatabase()

});




function getPoemsFromDatabase(){

    console.log("getting poems from DB...");

    var self = this;

    axios.get("/all-poems")
        .then(function (response) {

            poems = response.data;

            app.$data.data = response.data;
            app.$data.currentlySelectedPoems = response.data;

            console.log("DONE! Got " + poems.length + " poems");

            currentIndex = app.$data.currentlySelectedPoems.length;
            //console.log(window.location.pathname.toString().substring(1,window.location.pathname.length));

            // if we're not on the homepage, figure out the index
            if(window.location.pathname != "/"){
                for(var i = 0; i < poems.length; i++){
                    // get the index of the poem with the ID from the URL
                    if((poems)[i].id == window.location.pathname.toString().substring(1,window.location.pathname.length) ){
                        app.$data.currentIndex = i;
                        // self.currentIndex = i;
                    }
                }
            }

            app.displayPoem();

        })
        .catch(function (error) {
            console.log(error);
        })

}

// gets poems directly from a page on reddit
function getPoemsFromThisPage(afterCode){

    var redditURL = "https://www.reddit.com/user/Poem_for_your_sprog/comments.json?limit=100&after=" + afterCode;

    axios.get(redditURL)
        .then(function (response) {
            
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

        })
        .catch(function (error) {
            console.log(error);
        });
}

// reddit HTML is encoded, so we need decode to get our tags back in order to use the v-html directive
function decodeHTMLEntities(text) {
    var entities = [
        ['amp', '&'],
        ['apos', '\''],
        ['#x27', '\''],
        ['#x2F', '/'],
        ['#39', '\''],
        ['#47', '/'],
        ['lt', '<'],
        ['gt', '>'],
        ['nbsp', ' '],
        ['quot', '"']
    ];

    for (var i = 0; max =  i < entities.length; i++){
        text = text.replace(new RegExp('&'+entities[i][0]+';', 'g'), entities[i][1]);
    } 
        

    return text;
}