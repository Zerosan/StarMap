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
    sm.systems = [];
    sm.defaultInitializer = "sol_system_initializer";

    sm.selectedSystem = null;

    if(store.get("systems")) {
        sm.systems = store.get("systems");
    }

    sm.stage.on("stagemouseup", function(evt) {
        if(sm.stage.getObjectUnderPoint(evt.stageX, evt.stageY, 0)) {
            return;
        }
        sm.systems.push({x:evt.stageX, y:evt.stageY, initializer: sm.defaultInitializer});
        sm.redrawSystems();
        sm.updateSystemCordsOut();
    });

    sm.drawSystem = function(x, y) {
        var system = new createjs.Shape();
        system.graphics.beginFill("LightBlue").drawCircle(0,0,5);
        system.x = x;
        system.y = y;
        system.name = system.id;
        system.addEventListener("click", function(event) {
            for(var i = 0; i < sm.systems.length; i++) {
                if (sm.systems[i].id == system.id) {
                    sm.selectSystem(i);
                    break;
                }
            }
        });
        system.addEventListener("pressmove", function(event) {
            event.target.x = event.stageX;
            event.target.y = event.stageY;
            sm.update = true;
        });
        system.addEventListener("pressup", function(event) {
            var id = system.id;
            for(var i = 0; i < sm.systems.length; i++) {
                if(sm.systems[i].id == id) {
                    sm.systems[i].x = event.stageX;
                    sm.systems[i].y = event.stageY;
                    break;
                }
            }
            sm.updateSystemCordsOut();
        });
        sm.stage.addChild(system);
        sm.update = true;
        return system.id;
    };

    sm.updateSystemCordsOut = function() {
        var cordOut = $("#cordOut");
        cordOut.empty();
        for(var i = 0; i < sm.systems.length; i++) {
            var system = sm.systems[i];

            $('<li>#' + i + " x: " + system.x + " y: " + system.y + ' i: ' + system.initializer + '</li>')
                .addClass("system-cord")
                .data({
                    index: i,
                    id: system.id
                })
                .on({
                    "click": function() {
                        sm.removeSystem($(this).data("index"));
                    },
                    "mouseover": function() {
                        sm.update = true;
                    }
                })
                .appendTo("#cordOut");
        }
        store.set("systems", sm.systems);
    };

    sm.redrawSystems = function() {
        sm.stage.removeAllChildren();
        sm.update = true;
        for(var i = 0; i < sm.systems.length; i++) {
            sm.systems[i].id = sm.drawSystem(sm.systems[i].x, sm.systems[i].y);
        }
        sm.updateSystemCordsOut();
    };

    sm.removeSystem = function(index) {
        sm.systems.splice(index, 1);
        store.set("systems", sm.systems);
        sm.redrawSystems();
    };

    sm.tickHandler = function() {
        if(sm.update) {
            sm.update = false;
            sm.stage.update();
        }
    };

    sm.selectSystem = function(index) {
        var box = $("#currentSystem");
        var system = sm.systems[index];
        box.find("span").text("#" + system.id);
        box.find("input").val(sm.systems[index].initializer);
        sm.selectedSystem = index;

        var object = sm.stage.getChildByName(system.id);
        sm.selector = new createjs.Shape();
        sm.selector.graphics.beginStroke("Yellow").drawCircle(0,0,7);
        sm.selector.x = object.x;
        sm.selector.y = object.y;
        sm.stage.addChild(sm.selector);
        sm.update = true;
    };

    createjs.Ticker.addEventListener("tick", sm.tickHandler);

    sm.redrawSystems();

    $(".importButton").button().click(function() {
        var lines = $(".importExportOutput").val().split("\n");
        sm.systems = [];
        console.log(sm.systems)
        for(var i = 0; i < lines.length; i++) {
            var vars = lines[i].split(",");
            if(vars[1]>0 && vars[2] > 0) {
                sm.systems.push({
                    x:vars[1],
                    y:vars[2]
                });
            }
        }
        console.log(sm.systems)
        sm.redrawSystems();
    });
    $(".exportButton").button().click(function() {
        var output = "";
        for(var i = 0; i < sm.systems.length; i++) {
            var system = sm.systems[i];
            output += "System" + i + "," + system.x + "," + system.y + ", " + system.initializer +"\n";
        }
        $(".importExportOutput").text(output);

    });

    $(".importExportBtn").button().on("click", function() {
        $("#importExportDialog").dialog({width:'auto'});;
    });

    $(".clear").button().on("click", function() {
       sm.systems = [];
        sm.redrawSystems();
    });

    $("#initializer").on("input", function() {
        if(sm.selectedSystem !== null) {
            sm.systems[sm.selectedSystem].initializer = $(this).val();
            sm.updateSystemCordsOut();
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