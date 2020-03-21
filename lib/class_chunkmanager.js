function Chunkmanager() {

    this.updateChunks = async ( chunkCoordinates ) => {

        for ( this.item in renderer.renderlist ) {
            if ( renderer.renderlist[ this.item ].type == 'chunk' ) {

                if( Math.abs( chunkCoordinates[ 0 ] - renderer.renderlist[ this.item ].x ) > renderer.rendersettings.distance
                    || Math.abs( chunkCoordinates[ 1 ] - renderer.renderlist[ this.item ].y ) > renderer.rendersettings.distance
                    || Math.abs( chunkCoordinates[ 2 ] - renderer.renderlist[ this.item ].z ) > renderer.rendersettings.distance ) {

                    this.index = mapper.getChunkKey( {
                        0: renderer.renderlist[ this.item ].x,
                        1: renderer.renderlist[ this.item ].y,
                        2: renderer.renderlist[ this.item ].z
                    } );

                    mesher.removeGeometry( this.index );
                }
            }
        }

        for( var z = -renderer.rendersettings.distance; z <= renderer.rendersettings.distance; z++ ) {
            for( var y = -renderer.rendersettings.distance; y <= renderer.rendersettings.distance; y++ ) {
                for( var x = -renderer.rendersettings.distance; x <= renderer.rendersettings.distance; x++ ) {

                    this.chunkindex = mapper.getChunkKey( {
                        0: parseInt( chunkCoordinates[ 0 ] ) + parseInt( x ),
                        1: parseInt( chunkCoordinates[ 1 ] ) + parseInt( y ),
                        2: parseInt( chunkCoordinates[ 2 ] ) + parseInt( z )
                    } );

                    if ( renderer.renderlist[this.chunkindex] == undefined ) {
                        if ( worlddata[this.chunkindex] != undefined ) {

                            mesher.generateGeometry(
                                'chunk',
                                worlddata[this.chunkindex].geometry,
                                [ 16, 16, 16 ],
                                {   x: ( chunkCoordinates[ 0 ] + x ) * 16,
                                    y: ( chunkCoordinates[ 1 ] + y ) * 16,
                                    z: ( chunkCoordinates[ 2 ] + z ) * 16
                                },
                                this.chunkindex )
                        }
                    }
                }
            }
        }
    }

    this.editMass = () => {

        if ( renderer.renderlist[ 'previewMesh' ] && ( tool.active == 'brush' || tool.active == 'paste' ) ) {

            this.coordinates = mapper.getObjectPosition( 'previewMesh' );
            this.editedchunks = [];
            this.dimensions = null;

            if ( tool.active == 'brush' ) {
                this.dimensions = Object.assign( {}, tool.preview.dimensions );
            }
            if ( tool.active == 'paste' ) {
                this.dimensions = Object.assign( {}, tool.paste.dimensions );
            }

            for ( var i = 0; i < this.dimensions[ 2 ]; i++ ) {
                for ( var j = 0; j < this.dimensions[ 1 ]; j++ ) {
                    for ( var k = 0; k < this.dimensions[ 0 ]; k++ ) {

                        this.editcoordinate = {
                            x: this.coordinates.x + k,
                            y: this.coordinates.y + j,
                            z: this.coordinates.z + i
                        };

                        this.chunkcoordinates   = mapper.getChunkCoordinates( this.editcoordinate );
                        this.chunkindex         = mapper.getChunkKey( this.chunkcoordinates );
                        this.tileindex          = mapper.getTileIndex( this.editcoordinate, this.chunkcoordinates );

                        if ( !worlddata[this.chunkindex] ) {
                            this.createChunk( this.chunkindex );
                        }

                        if ( tool.active == 'brush' ) {
                            worlddata[ this.chunkindex ].geometry[ this.tileindex ] = tool.preview.texture;
                            this.editedchunks[ this.chunkindex ] = this.chunkcoordinates;
                        }

                        if ( tool.active == 'paste' ) {
                            this.pastedvalue = tool.paste.volume[ k + j * this.dimensions[ 0 ] + i * this.dimensions[ 0 ] * this.dimensions[ 1 ] ];

                            if ( this.pastedvalue != 0 ) {
                                worlddata[ this.chunkindex ].geometry[ this.tileindex ] = this.pastedvalue;
                                this.editedchunks [ this.chunkindex ] = this.chunkcoordinates;
                            }
                        }
                    }
                }
            }

            for ( var key in this.editedchunks ) {
                mesher.generateGeometry(
                    'chunk',
                    worlddata[ key ].geometry,
                    [ 16, 16, 16 ],
                    {   x: this.editedchunks[ key ][ 0 ] * 16,
                        y: this.editedchunks[ key ][ 1 ] * 16,
                        z: this.editedchunks[ key ][ 2 ] * 16
                    },
                    key );
            }
        }
    }

    this.copyMass = () => {

        if ( renderer.renderlist['previewMesh'] && tool.active == 'pipette' ) {

            this.volume = [];
            this.brushcoordinates = mapper.getObjectPosition( 'previewMesh' );
            this.dimensions = Object.assign( {}, tool.preview.dimensions );

            for ( var i = 0; i < this.dimensions[ 2 ]; i++ ) {
                for ( var j = 0; j < this.dimensions[ 1 ]; j++ ) {
                    for ( var k = 0; k < this.dimensions[ 0 ]; k++ ) {

                        this.editcoordinate = {
                            x: this.brushcoordinates.x + k,
                            y: this.brushcoordinates.y + j,
                            z: this.brushcoordinates.z + i
                        };

                        this.chunkcoordinates   = mapper.getChunkCoordinates( this.editcoordinate );
                        this.chunkindex         = mapper.getChunkKey( this.chunkcoordinates );
                        this.tileindex          = mapper.getTileIndex( this.editcoordinate, this.chunkcoordinates );

                        if ( !worlddata[ this.chunkindex ] ) {
                            this.volume.push( 0 );
                        } else {
                            this.volume.push( worlddata[ this.chunkindex ].geometry[ this.tileindex ] );
                        }
                    }
                }
            }
            tool.paste.dimensions = Object.assign( {}, this.dimensions );
            tool.paste.volume = Object.assign( {}, this.volume );
        }
    }

    this.createChunk = async ( chunkindex ) => {
        worlddata[ chunkindex ] = {
            geometry: Array( 4097 ).fill( 0 ),
            name: 'Insel',
            objects : []
        }
    }

    this.generatePreviewMesh = async () => {

        if ( tool.active == null ) {
            return;
        }

        this.brush = mapper.getObject( 'previewMesh' );
        this.position = mapper.getObjectPosition( 'previewMesh' );

        if ( this.brush ) {
            renderer.handle.detach( this.brush );
            mesher.removeGeometry( 'previewMesh' );
        }

        if ( tool.active == 'brush' ) {
            this.dimensions = Object.assign( {}, tool.preview.dimensions );
            this.volumendata = Array( this.dimensions[ 0 ] * this.dimensions[ 1 ] * this.dimensions[ 2 ]).fill( tool.preview.texture );
        }

        if ( tool.active == 'pipette' ) {
            this.dimensions = Object.assign( {}, tool.preview.dimensions );
            this.volumendata = Array( this.dimensions[ 0 ] * this.dimensions[ 1 ] * this.dimensions[ 2 ]).fill( tool.preview.texture );
        }

        if ( tool.active == 'paste' ) {
            this.volumendata = Object.assign( {}, tool.paste.volume );
            this.dimensions = Object.assign( {}, tool.paste.dimensions );
        }

        mesher.generateGeometry( 'previewMesh', this.volumendata, this.dimensions, this.position, 'previewMesh' );
    }
}