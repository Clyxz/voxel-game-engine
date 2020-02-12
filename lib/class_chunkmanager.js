function Chunkmanager() {

    this.updateChunks = async (chunkCoordinates) => {

        for (this.item in renderer.renderlist) {
            if (renderer.renderlist[this.item].type == "chunk") {

                if(Math.abs(chunkCoordinates.x - renderer.renderlist[this.item].x) > renderer.rendersettings.distance
                || Math.abs(chunkCoordinates.y - renderer.renderlist[this.item].y) > renderer.rendersettings.distance
                || Math.abs(chunkCoordinates.z - renderer.renderlist[this.item].z) > renderer.rendersettings.distance) {

                    this.index = mapper.getChunkKey({
                            x: renderer.renderlist[this.item].x,
                            y: renderer.renderlist[this.item].y,
                            z: renderer.renderlist[this.item].z});

                    renderer.removeGeometry(this.index);

                }
            }
        }

        for(var z = -renderer.rendersettings.distance; z <= renderer.rendersettings.distance; z++) {
            for(var y = -renderer.rendersettings.distance; y <= renderer.rendersettings.distance; y++) {
                for(var x = -renderer.rendersettings.distance; x <= renderer.rendersettings.distance; x++) {

                    this.chunkindex = mapper.getChunkKey({
                        x: parseInt(chunkCoordinates.x) + parseInt(x),
                        y: parseInt(chunkCoordinates.y) + parseInt(y),
                        z: parseInt(chunkCoordinates.z) + parseInt(z)});

                    if (renderer.renderlist[this.chunkindex] == undefined) {
                        if (renderer.webworker[this.chunkindex] == undefined
                            && worlddata[this.chunkindex] != undefined) {

                                renderer.generateMesh(
                                    "chunk",
                                    worlddata[this.chunkindex].geometry,
                                    [16, 16, 16],
                                    {   x: (chunkCoordinates.x + x) * 16,
                                        y: (chunkCoordinates.y + y) * 16,
                                        z: (chunkCoordinates.z + z) * 16},
                                    this.chunkindex)
                            }
                    }
                }
            }
        }
    }

    this.editMass = () => {

        if (renderer.renderlist['brush']) {

            this.brushcoordinates   = mapper.getObjectPosition("brush");
            this.dimensions         = tool.brush.dimensions;
            this.editedchunks       = [];

            for (var i = 0; i < this.dimensions[0]; i++) {
                for (var j = 0; j < this.dimensions[1]; j++) {
                    for (var k = 0; k < this.dimensions[2]; k++) {
                        this.editcoordinate = {
                            x: this.brushcoordinates.x + i,
                            y: this.brushcoordinates.y + j,
                            z: this.brushcoordinates.z + k};

                            this.chunkcoordinates   = mapper.getChunkCoordinates(this.editcoordinate);
                            this.chunkindex         = mapper.getChunkKey(this.chunkcoordinates);
                            this.tileindex          = mapper.getTileIndex(this.editcoordinate, this.chunkcoordinates);

                            if (!worlddata[this.chunkindex]) {
                                this.createChunk(this.chunkindex);
                            }

                            worlddata[this.chunkindex].geometry[this.tileindex] = tool.brush.texture;
                            this.editedchunks [this.chunkindex ] = this.chunkcoordinates;
                    }
                }
            }

            for (var key in this.editedchunks) {
                renderer.generateMesh(
                    "chunk",
                    worlddata[ key ].geometry,
                    [16, 16, 16],
                    {   x: this.editedchunks[ key ].x * 16,
                        y: this.editedchunks[ key ].y * 16,
                        z: this.editedchunks[ key ].z * 16},
                        key );
            }
        }
    }

    this.createChunk = async (chunkindex) => {
        worlddata[ chunkindex ] = {
            geometry:   Array(4097).fill(0),
            name:       "Insel",
            objects :   []
        }
    }








    this.generateEntity = (position) => {

        try {

            this.geometry               = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            this.material               = new THREE.MeshLambertMaterial({color: 0x00ff00});
            this.mesh                   = new THREE.Mesh(this.geometry, this.material);
            this.mesh.castShadow        = true;
            this.mesh.receiveShadow     = true;
            renderer.world.add(this.mesh);
            return this.mesh.uuid;

        } catch (error) {

            console.log(error);

        }
    }

    this.removeEntity = async () => {

    }
}