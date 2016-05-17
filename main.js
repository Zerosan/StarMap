/**
 * Created by Kai on 2016-05-17.
 */
document.body.onload = init;
var stars = [];
function init() {
    if (!store.enabled) {
        alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.');
        return;
    }

    var stage = new createjs.Stage("demoCanvas");
    stage.update();

    if(store.get("stars")) {
        stars = store.get("stars");
        redrawStars(stage, stars);
    }

    stage.on("stagemousedown", function(evt) {
        drawStar(stage, evt.stageX, evt.stageY, 5);
        stars.push({x:evt.stageX, y:evt.stageY});
        store.set("stars", stars);
        updateStarCordsOut(stars);
    });

    function drawStar(stage, x, y, size) {
        var star = new createjs.Shape();
        star.graphics.beginFill("LightBlue").drawCircle(0,0,size);
        star.x = x;
        star.y = y;
        stage.addChild(star);
        stage.update();
    }

    function updateStarCordsOut(stars) {
        var cordOut = $("#cordOut");
        cordOut.empty();
        for(var i = 0; i < stars.length; i++) {
            var star = stars[i];

            cordOut.append("<li>star #" + i + " x: " + star.x + " y: " + star.y + "</li>");
            cordOut.children().last().data("index",i);
        }
    }


    function redrawStars(stage, stars) {
        stage.removeAllChildren();
        stars.forEach(function(star) {
            drawStar(stage, star.x, star.y, 5);
        });
        updateStarCordsOut(stars);
    }

    $(document).on("click", "#cordOut li", function() {
        var index = $(this).data("index");
        stars.splice(index, 1);
        store.set("stars", stars);
        redrawStars(stage, stars);
    });
}

