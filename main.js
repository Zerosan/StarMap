/**
 * Created by Kai on 2016-05-17.
 */
function System(x, y, initializer) {
    var self = this;
    self.id = ko.observable(null);
    self.x = ko.observable(x);
    self.y = ko.observable(y);
    self.selected = ko.observable(false);
    self.highlight = ko.observable(false);
    self.initializer = ko.observable(initializer);

    self.status = ko.computed(function() {
        if(self.selected()) return "selected";
        if(self.highlight()) return "highlight";
        return null;
    });
}

function SystemMapperModel() {
    var self = this;
    if (!store.enabled) {
        alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.');
        return;
    }

    self.stage = new createjs.Stage("demoCanvas");
    self.stage.enableMouseOver(10);
    self.systems = ko.observableArray();
    self.defaultInitializer = ko.observable("sol_system_initializer");

    self.stage.on("stagemouseup", function(evt) {
        var x = Math.round(evt.stageX);
        var y = Math.round(evt.stageY);
        if(self.stage.getObjectUnderPoint(x, y, 0)) {
            return;
        }
        self.systems.push(new System(x, y, self.defaultInitializer()));
    });

    self.drawSystem = function(x, y) {
        var system = new createjs.Shape();
        system.graphics.beginFill("LightBlue").drawCircle(0,0,5);
        system.x = x;
        system.y = y;
        system.on("mouseover", function(event) {
            self.systems().forEach(function(s) {
               if(s.id() == system.id) {
                   s.highlight(true);
               }
            });
        });
        system.on("mouseout", function(event) {
            self.systems().forEach(function(s) {
                if(s.id() == system.id) {
                    s.highlight(false);
                }
            });
        });
        system.on("click", function(event) {
            self.systems().forEach(function(s) {
                if(s.id() == system.id) {
                    s.selected(true);
                }else{
                    s.selected(false);
                }
            });
        });
        system.name = system.id;
        self.stage.addChild(system);
        self.update = true;
        return system.id;
    };


    self.removeSystem = function(system) {
        self.systems.remove(system);
    };

    self.systems.subscribe(function(changes) {
        changes.forEach(function(change) {
           if(change.status === 'added') {
               change.value.id(self.drawSystem(change.value.x(), change.value.y()));
           }else
            if(change.status === "deleted") {
                var stageObject = self.stage.getChildByName(change.value.id());
                self.stage.removeChild(stageObject);
                self.update = true;
            }
        })
    }, null, "arrayChange");

    self.tickHandler = function() {
        if(self.update) {
            self.update = false;
            self.stage.update();
        }
    };
    createjs.Ticker.on("tick", self.tickHandler);

    $(".importButton").button().click(function() {

    });

    $(".exportButton").button().click(function() {

    });

    self.importExportShow = function() {
        $("#importExportDialog").dialog({width:'auto'});
    };

    self.clearAll = function() {
        self.systems.removeAll();
    };

    self.save = function() {
        var output = [];
        self.systems().forEach(function(system) {
            output.push({
                x: system.x(),
                y: system.y(),
                initializer: system.initializer(),
                selected: system.selected()
            });
        });
        store.set("systems", output);
        console.log("saved");
        window.setTimeout(self.save, 2000);
    };

    self.load = function() {
        var input = store.get("systems");
        if(input !== undefined && input !== "undefined") {
            input.forEach(function(system) {
                self.systems.push(new System(system.x, system.y, system.initializer).selected(system.selected));
            });
        }
    };

    self.load();
    window.setTimeout(self.save, 2000);
}

var systemMapperModel = new SystemMapperModel();

ko.applyBindings(systemMapperModel);