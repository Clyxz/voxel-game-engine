function Guieditor () {

    this.geometry_change_texture = (texture) => {
        tool.brush.texture = texture;
        worldcreator.generateBrush();
    }

    this.geometry_change_brushsizex = (input) => {
        tool.brush.dimensions[0] = parseInt( input.value );
        worldcreator.generateBrush();
    }

    this.geometry_change_brushsizey = (input) => {
        tool.brush.dimensions[1] = parseInt( input.value  );
        worldcreator.generateBrush();
    }

    this.geometry_change_brushsizez = (input) => {
        tool.brush.dimensions[2] = parseInt( input.value );
        worldcreator.generateBrush();
    }

    this.save = () => {
        this.a = document.createElement("a");
        this.file = new Blob([JSON.stringify(worlddata)], {type: 'text/javascript'});
        this.a.href = URL.createObjectURL(this.file);
        this.a.download = 'data_world.js';
        this.a.click();
    }

    document.addEventListener('keyup', (e) => {

        if (e.code === "Space") {
            chunkmanager.editMass();
        }
    });
}