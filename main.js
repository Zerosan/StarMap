/**
 * Created by Kai on 2016-05-17.
 */

var init = function() {
    var sm = this;
    if (!store.enabled) {
        alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.');
        return;
    }

    sm.stage = new createjs.Stage("demoCanvas");
    sm.stage.update();
    sm.stars = [];

    if(store.get("stars")) {
        sm.stars = store.get("stars");
    }

    sm.stage.on("stagemousedown", function(evt) {
        sm.drawStar(evt.stageX, evt.stageY);
        sm.stars.push({x:evt.stageX, y:evt.stageY});
        store.set("stars", sm.stars);
        sm.updateStarCordsOut();
    });

    sm.drawStar = function(x, y) {
        var star = new createjs.Shape();
        star.graphics.beginFill("LightBlue").drawCircle(0,0,5);
        star.x = x;
        star.y = y;
        sm.stage.addChild(star);
        sm.stage.update();
    };

    sm.updateStarCordsOut = function() {
        var cordOut = $("#cordOut");
        cordOut.empty();
        for(var i = 0; i < sm.stars.length; i++) {
            var star = sm.stars[i];

            $('<li>star #' + i + " x: " + star.x + " y: " + star.y + '</li>')
                .addClass("star-cord")
                .data({
                    index: i
                })
                .on({
                    "click": function() {
                        sm.removeStar($(this).data("index"));
                    }
                })
                .appendTo("#cordOut");
        }
    };


    sm.redrawStars = function() {
        sm.stage.removeAllChildren();
        sm.stage.update();
        for(var i = 0; i < sm.stars.length; i++) {
            sm.drawStar(sm.stars[i].x, sm.stars[i].y);
        }
        sm.updateStarCordsOut();
    };

    sm.removeStar = function(index) {
        sm.stars.splice(index, 1);
        store.set("stars", sm.stars);
        sm.redrawStars();
    };

    sm.redrawStars();
};


document.body.onload = init;