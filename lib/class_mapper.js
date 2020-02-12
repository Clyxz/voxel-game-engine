function Mapper() {
    
    // Maps the absolute x-y position of an object
    // to the relative position in chunk context

    this.getChunkCoordinates = (position) => {

        this.x = Math.floor(position.x / 16);
        this.y = Math.floor(position.y / 16);
        this.z = Math.floor(position.z / 16);
        return {x: this.x, y: this.y, z: this.z};
    }

    this.getTileIndex = (position, chunk) => {

        this.x = Math.floor(position.x - chunk.x * 16);
        this.y = Math.floor(position.y - chunk.y * 16);
        this.z = Math.floor(position.z - chunk.z * 16);

        return this.x + this.y * 16  + this.z * 16 * 16;
    }

    this.getCurrentChunk = (currentChunk, chunkindex) => {

        if (currentChunk == null || currentChunk != chunkindex) {
            currentChunk = chunkindex;
        }
        return currentChunk;
    }

    // Generates a chunkindex out of a x-y chunk coordinate pair
    this.getChunkKey = (position) => {
        return position.x + ":" + position.y + ":" + position.z;
    }

    // Checks if a chunk exists for a given absolute x-y position
    this.chunkExists = (chunkindex) => {

        if (worlddata[chunkindex]) {
            return true;
        }
        return false;
    }

    this.getObject = (index) => {

        try {
            if (renderer.renderlist[index]) {

                return renderer.world.getObjectByProperty('uuid', renderer.renderlist[index].uuid);
            }
        } catch (error) {
            console.log(error)
        }
    }

    this.getObjectPosition = (index) => {

        try {
            this.position = {x: 0, y: 0, z: 0};

            if (renderer.renderlist[index]) {
                this.position = this.getObject(index).position;
            }

            return this.position;

        } catch (error) {
            console.log(error)
        }
    }
}
