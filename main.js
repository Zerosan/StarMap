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
    sm.defaultInitializer = "sol_system_initializer";

    sm.selectedSystem = null;

    if(store.get("stars")) {
        sm.stars = store.get("stars");
    }

    sm.stage.on("stagemouseup", function(evt) {
        if(sm.stage.getObjectUnderPoint(evt.stageX, evt.stageY, 0)) {
            return;
        }
        sm.stars.push({x:evt.stageX, y:evt.stageY, initializer: sm.defaultInitializer});
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
            for(var i = 0; i < sm.stars.length; i++) {
                if (sm.stars[i].id == star.id) {
                    sm.selectSystem(i);
                    break;
                }
            }
        });
        star.addEventListener("pressmove", function(event) {
            event.target.x = event.stageX;
            event.target.y = event.stageY;
            sm.update = true;
        });
        star.addEventListener("pressup", function(event) {
            var id = star.id;
            for(var i = 0; i < sm.stars.length; i++) {
                if(sm.stars[i].id == id) {
                    sm.stars[i].x = event.stageX;
                    sm.stars[i].y = event.stageY;
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

            $('<li>#' + i + " x: " + star.x + " y: " + star.y + ' i: ' + star.initializer + '</li>')
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

    sm.selectSystem = function(index) {
        var box = $("#currentSystem");
        var star = sm.stars[index];
        box.find("span").text("#" + star.id);
        box.find("input").val(sm.stars[index].initializer);
        sm.selectedSystem = index;

        var object = sm.stage.getChildByName(star.id);
        sm.selector = new createjs.Shape();
        sm.selector.graphics.beginStroke("Yellow").drawCircle(0,0,7);
        sm.selector.x = object.x;
        sm.selector.y = object.y;
        sm.stage.addChild(sm.selector);
        sm.update = true;
    };

    createjs.Ticker.addEventListener("tick", sm.tickHandler);

    sm.redrawStars();

    $(".importButton").button().click(function() {
        var lines = $(".importExportOutput").val().split("\n");
        sm.stars = [];
        console.log(sm.stars)
        for(var i = 0; i < lines.length; i++) {
            var vars = lines[i].split(",");
            if(vars[1]>0 && vars[2] > 0) {
                sm.stars.push({
                    x:vars[1],
                    y:vars[2]
                });
            }
        }
        console.log(sm.stars)
        sm.redrawStars();
    });
    $(".exportButton").button().click(function() {
        var output = "";
        for(var i = 0; i < sm.stars.length; i++) {
            var star = sm.stars[i];
            output += "Star" + i + "," + star.x + "," + star.y + ", " + star.initializer +"\n";
        }
        $(".importExportOutput").text(output);

    });

    $(".importExportBtn").button().on("click", function() {
        $("#importExportDialog").dialog({width:'auto'});;
    });

    $(".clear").button().on("click", function() {
       sm.stars = [];
        sm.redrawStars();
    });

    $("#initializer").on("input", function() {
        if(sm.selectedSystem !== null) {
            sm.stars[sm.selectedSystem].initializer = $(this).val();
            sm.updateStarCordsOut();
        }
    });

    $("#defaultInitializer").on("input", function() {
       sm.defaultInitializer = $(this).val();
    });


};

$(".importExportOutput").focus(function() {
    var $this = $(this);
    $this.select();

    // Work around Chrome's little problem
    $this.mouseup(function() {
        // Prevent further mouseup intervention
        $this.unbind("mouseup");
        return false;
    });
});

document.body.onload = init;