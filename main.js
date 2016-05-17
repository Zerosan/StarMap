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
    sm.stage.enableMouseOver(10)
    sm.stars = [];
    sm.dragTarget = null;

    if(store.get("stars")) {
        sm.stars = store.get("stars");
    }

    sm.stage.on("stagemouseup", function(evt) {
        if(sm.stage.getObjectUnderPoint(evt.stageX, evt.stageY, 0)) {
            return;
        }
        sm.stars.push({x:evt.stageX, y:evt.stageY});
        sm.redrawStars();
        sm.updateStarCordsOut();
    });

    sm.drawStar = function(x, y) {
        var star = new createjs.Shape();
        star.graphics.beginFill("LightBlue").drawCircle(0,0,5);
        star.x = x;
        star.y = y;
        star.name = star.id;
        star.addEventListener("click", function(event) {
            console.log(star)
        });
        star.addEventListener("mouseover", function(event) {
            console.log(star.id);
        });
        star.addEventListener("pressmove", function(event) {
            event.target.x = event.stageX;
            event.target.y = event.stageY;
            sm.update = true;
        });
        star.addEventListener("pressup", function(event) {
            var id = star.id;
            for(var i = 0; i < sm.stars.length; i++) {
                if(stars[i].id == id) {
                    stars[i].x = event.stageX;
                    stars[i].y = event.stageY;
                    break;
                }
            }
            sm.updateStarCordsOut();
        });
        sm.stage.addChild(star);
        sm.update = true;
        return star.id;
    };

    sm.updateStarCordsOut = function() {
        var cordOut = $("#cordOut");
        cordOut.empty();
        for(var i = 0; i < sm.stars.length; i++) {
            var star = sm.stars[i];

            $('<li>star #' + i + " x: " + star.x + " y: " + star.y + '</li>')
                .addClass("star-cord")
                .data({
                    index: i,
                    id: star.id
                })
                .on({
                    "click": function() {
                        sm.removeStar($(this).data("index"));
                    },
                    "mouseover": function() {
                        sm.update = true;
                    }
                })
                .appendTo("#cordOut");
        }
        store.set("stars", sm.stars);
    };


    sm.redrawStars = function() {
        sm.stage.removeAllChildren();
        sm.update = true;
        for(var i = 0; i < sm.stars.length; i++) {
            sm.stars[i].id = sm.drawStar(sm.stars[i].x, sm.stars[i].y);
        }
        sm.updateStarCordsOut();
    };

    sm.removeStar = function(index) {
        sm.stars.splice(index, 1);
        store.set("stars", sm.stars);
        sm.redrawStars();
    };

    sm.tickHandler = function() {
        if(sm.update) {
            sm.update = false;
            sm.stage.update();
        }
    };

    createjs.Ticker.addEventListener("tick", sm.tickHandler);

    sm.redrawStars();


};


document.body.onload = init;