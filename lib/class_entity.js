function Entity( type, position ) {
     
    this.health         = 100;
    this.stamina        = 100;
    this.type           = type;
    this.uuid           = mesher.generateEntity( position );
    this.mesh           = renderer.world.getObjectByProperty( 'uuid', this.uuid );
    this.previousChunk  = 'initial';
    this.currentChunk   = null;

    // Updates the entities x-y position to its mesh
    // the z value needs to be mapped to the tile
    // For visualization

    this.updatePosition = async (coords) => {

        coords.y = 16; //TODO: Make variable
        this.chunkcoordinates   = mapper.getChunkCoordinates( coords );
        this.chunkindex         = mapper.getChunkKey( this.chunkcoordinates );
        this.currentchunk       = mapper.getCurrentChunk( this.currentChunk, this.chunkindex ); //TODO: Only if chunk changed

        this.mesh.position.set( coords.x, coords.y, coords.z );

        if ( this.currentchunk != this.previousChunk ) {
            this.previousChunk = this.currentchunk;
            chunkmanager.updateChunks( this.chunkcoordinates );
        }
    }

    this.updatePosition( position );
}

