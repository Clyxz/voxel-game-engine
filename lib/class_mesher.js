function Mesher() {

    this.generateToolHandle = () => {

        renderer.handle = new THREE.TransformControls( renderer.camera, renderer.domElement );

        renderer.handle.setTranslationSnap( 1 );
        renderer.handle.addEventListener( 'dragging-changed', ( event ) => {
            renderer.controls.enabled = ! event.value;
        } );

        renderer.renderlist[ 'toolhandle' ] = { uuid: renderer.handle.uuid };
        renderer.world.add( renderer.handle );
    }

    this.generateToolHandle();

    this.generateEntity = ( position ) => { 

        try {
            this.geometry               = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
            this.material               = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
            this.mesh                   = new THREE.Mesh( this.geometry, this.material );
            this.mesh.castShadow        = true;
            this.mesh.receiveShadow     = true;
            renderer.world.add( this.mesh );
            return this.mesh.uuid;

        } catch ( error ) {
            console.log( error );
        }
    }

    this.removeEntity = async () => {
    }

    this.generateGeometry =  ( type, volumedata, dimensions, coordinates, index ) => {

        var mesh = this.generateMeshData( type, volumedata, dimensions, coordinates )

        if ( !mesh.error ) {

            this.geometry = new THREE.Geometry();
            this.geometry.faces = mesh.faces;
            this.geometry.faceVertexUvs = mesh.faceVertexUvs,
            this.geometry.vertices = mesh.vertices;

            this.geometry = new THREE.BufferGeometry().fromGeometry( this.geometry );
            this.geometry.computeVertexNormals();
            
            this.mesh                   = new THREE.Mesh( this.geometry, renderer.materials );
            this.mesh.castShadow        = true;
            this.mesh.receiveShadow     = true;
            this.mesh.matrixAutoUpdate  = false;
            this.mesh.position.set( coordinates.x, coordinates.y, coordinates.z );

            if( type == 'previewMesh' ) {
                this.mesh.matrixAutoUpdate  = true;
                renderer.handle.attach( this.mesh );
            }

            if ( renderer.renderlist[ index ] ) {
                mesher.removeGeometry( index );
            }

            renderer.world.add( this.mesh );

            renderer.renderlist[ index ] = {
                uuid:   this.mesh.uuid,
                type:   type, 
                x:      coordinates.x / 16,
                y:      coordinates.y / 16,
                z:      coordinates.z / 16
            };
        }
    }

    // Removes a chunk or other geometry
    this.removeGeometry = async ( index ) => {

        try {
            if ( renderer.renderlist[ index ] ) {

                this.object = mapper.getObject(index);

                if ( this.object ) {

                    this.object.geometry.dispose();
                    renderer.world.remove( this.object );
                    this.object = null;
                    delete renderer.renderlist[ index ];
                }
            }
        } catch ( error ) {
            console.log( error );
        }
    }


    this.generateMeshData = ( type, volumedata, dimensions, offset ) => {

        var geometry   = { vertices: [], faces: [], faceVertexUvs: { 0: [] } };
        var uvs        = [];
        var raw        = this.greedyMesh( volumedata, dimensions, offset, type );

        if ( type == 'previewMesh' ) {
            offset = { x: 0, y: 0, z: 0 };
        }

        for ( var i = 0; i < raw.vertices.length; i++ ) {

            var q = raw.vertices[ i ];

            geometry.vertices.push( {
                x: q[ 0 ] + offset.x,
                y: q[ 1 ] + offset.y,
                z: q[ 2 ] + offset.z
            } );
        }

        for ( var i = 0; i < raw.faces.length; i++ ) {

            var q = raw.faces[ i ];

            geometry.faces.push(
                { a: q[ 0 ], b: q[ 1 ], c: q[ 2 ], color: {}, normal: { x: 0, y: 0, z: 0 }, vertexNormals: [], vertexColors: [] },
                { a: q[ 2 ], b: q[ 3 ], c: q[ 0 ], color: {}, normal: { x: 0, y: 0, z: 0 }, vertexNormals: [], vertexColors: [] }
            );

            var uvcoords;
            var top = '';

            var v0 = geometry.vertices[ q[ 0 ] ];
            var v1 = geometry.vertices[ q[ 1 ] ];
            var v2 = geometry.vertices[ q[ 2 ] ];
            var v3 = geometry.vertices[ q[ 3 ] ];

            if ( v0.x == v1.x && v1.x == v2.x && v2.x == v3.x ) {

                uvcoords = this.getUVCoords(
                    { x: v0.y, y: v0.z },
                    { x: v1.y, y: v1.z },
                    { x: v2.y, y: v2.z },
                    { x: v3.y, y: v3.z }, 1
                );

            } else if ( v0.y == v1.y && v1.y == v2.y  && v2.y == v3.y ) {

                top = '_top';
                uvcoords = this.getUVCoords(
                    { x: v0.x, y: v0.z },
                    { x: v1.x, y: v1.z },
                    { x: v2.x, y: v2.z },
                    { x: v3.x, y: v3.z }, -1
                );

            } else if ( v0.z == v1.z && v1.z == v2.z  && v2.z == v3.z ) {

                uvcoords = this.getUVCoords(
                    { x: v0.x, y: v0.y },
                    { x: v1.x, y: v1.y },
                    { x: v2.x, y: v2.y },
                    { x: v3.x, y: v3.y }, -1
                );
            }

            uvs.push( { x: uvcoords[ 'a' ].y, y: uvcoords[ 'a' ].x } );
            uvs.push( { x: uvcoords[ 'b' ].y, y: uvcoords[ 'b' ].x } );
            uvs.push( { x: uvcoords[ 'c' ].y, y: uvcoords[ 'c' ].x } );
            uvs.push( { x: uvcoords[ 'd' ].y, y: uvcoords[ 'd' ].x } );

            geometry.faces[ geometry.faces.length - 1 ].materialIndex = q[ 4 ] + top;
            geometry.faces[ geometry.faces.length - 2 ].materialIndex = q[ 4 ] + top;

            geometry.faceVertexUvs[ 0 ].push( [ uvs[ q[ 0 ] ],       uvs[ q[ 0 ] + 1 ],  uvs[ q[ 0 ] + 2] ] );
            geometry.faceVertexUvs[ 0 ].push( [ uvs[ q[ 0 ] + 2 ],   uvs[ q[ 0 ] + 3 ],  uvs[ q[ 0 ] ] ] );

        }

        return {
            error:          false,
            faces:          geometry.faces,
            faceVertexUvs:  geometry.faceVertexUvs,
            vertices:       geometry.vertices
        };
    }
    
    this.getUVCoords = ( v0, v1, v2, v3, dir ) => {

        const minx = Math.min( v0.x, v1.x, v2.x );
        const miny = Math.min( v0.y, v1.y, v2.y );

        return {
            a: { x: ( v0.x - minx ) * dir, y: ( v0.y - miny ) * dir },
            b: { x: ( v1.x - minx ) * dir, y: ( v1.y - miny ) * dir },
            c: { x: ( v2.x - minx ) * dir, y: ( v2.y - miny ) * dir },
            d: { x: ( v3.x - minx ) * dir, y: ( v3.y - miny ) * dir }
        };
    }
    
    this.greedyMesh = ( volume, dims, offset, type ) => {

        var mask = new Int32Array( 4096 );

        function f( segment, i, j, k ) {
            return segment[ i + dims[ 0 ] * ( j + dims[ 1 ] * k ) ];
        }

        var vertices = [], faces = [];

        for ( var d = 0; d < 3; ++d ) {

            var i, j, k, l, w, h
                , u = ( d + 1 ) % 3
                , v = ( d + 2 ) % 3
                , x = [ 0,0,0 ]
                , q = [ 0,0,0 ];

            if ( mask.length < dims[ u ] * dims[ v ] ) {
                mask = new Int32Array( dims[ u ] * dims[ v ] );
            }

            q[ d ] = 1;

            for ( x[ d ] =- 1; x[ d ] < dims[ d ]; ) {

                //Compute mask
                var n = 0;

                for ( x[ v ] = 0; x[ v ] < dims[ v ]; ++x[ v ] ) {
                    for ( x[ u ] = 0; x[ u ] < dims[ u ]; ++x[ u ], ++n) {

                        var a = ( 0 <= x[ d ]               ? f( volume, x[ 0 ], x[ 1 ], x[ 2 ] ) : null );
                        var b = ( x[ d ] < dims[ d ] - 1    ? f( volume, x[ 0 ] + q[ 0 ], x[ 1 ] + q[ 1 ], x[ 2 ]+q[ 2 ] ) : null );

                        if ( type == 'chunk' && x[ d ] < 0 ) {

                            var coordinates = mapper.getChunkCoordinates( offset );
                            var chunkkey = mapper.getChunkKeyNeighbor( coordinates, d, -1 );

                            if ( mapper.chunkExists( chunkkey ) ) {
                                var voxel = { 0: x[ 0 ], 1: x[ 1 ], 2: x[ 2 ] };
                                voxel[ d ] = 15;
                                a = f( worlddata[ chunkkey ][ 'geometry' ], voxel[ 0 ], voxel[ 1 ], voxel[ 2 ] );
                            } else {
                                a = null;
                            }
                        }

                        if ( type == 'chunk' && x[ d ] >= dims[ d ] - 1 ) {

                            var coordinates = mapper.getChunkCoordinates( offset );
                            var chunkkey = mapper.getChunkKeyNeighbor( coordinates, d, 1 );

                            if ( mapper.chunkExists( chunkkey ) ) {
                                var voxel = { 0: x[ 0 ], 1: x[ 1 ], 2: x[ 2 ] };
                                voxel[ d ] = 0;
                                b = f( worlddata[ chunkkey ][ 'geometry' ], voxel[ 0 ], voxel[ 1 ], voxel[ 2 ]);
                            } else {
                                b = null;
                            }
                        }

                        if ( ( !!a ) === ( !!b ) ) {
                            mask[ n ] = null;
                        } else if ( !!a ) {
                            mask[ n ] = a;
                        } else {
                            mask[ n ] = -b;
                        }
                    }
                }

                ++x[ d ];

                //Generate mesh for mask using lexicographic ordering
                n = 0;

                for ( j = 0; j < dims[ v ]; ++j ) {
                    for ( i = 0; i < dims[ u ]; ) {

                        var c = mask[ n ];

                        if ( !!c ) {

                            //Compute width
                            for ( w = 1; c === mask[ n+w ] && i + w < dims[ u ]; ++w ) {
                            }

                            //Compute height (this is slightly awkward
                            var done = false;

                            for ( h = 1; j + h < dims[ v ]; ++h ) {
                                for ( k = 0; k < w; ++k ) {
                                    if ( c !== mask[ n + k + h * dims[ u ] ] ) {
                                        done = true;
                                        break;
                                    }
                                }
                                if( done ) {
                                    break;
                                }
                            }

                            //Add quad
                            x[ u ] = i;  x[ v ] = j;
                            var du = [ 0,0,0 ], dv = [ 0,0,0 ];

                            if( c > 0 ) {
                                dv[ v ] = h;
                                du[ u ] = w;
                            } else {
                                c = -c;
                                du[ v ] = h;
                                dv[ u ] = w;
                            }

                            var vertex_count = vertices.length;
                            vertices.push( [ x[ 0 ],                        x[ 1 ],                     x[ 2 ] ] );
                            vertices.push( [ x[ 0 ] + du[ 0 ],              x[ 1 ] + du[ 1 ],           x[ 2 ] + du[ 2 ] ] );
                            vertices.push( [ x[ 0 ] + du[ 0 ] + dv[ 0 ],    x[ 1 ] + du[ 1 ] + dv[ 1 ], x[ 2 ] + du[ 2 ] + dv[ 2 ] ] );
                            vertices.push( [ x[ 0 ] + dv[ 0 ],              x[ 1 ]  + dv[ 1 ],          x[ 2 ] + dv[ 2 ] ] );

                            faces.push( [ vertex_count, vertex_count + 1, vertex_count + 2, vertex_count + 3, c ] );

                            //Zero-out mask
                            for ( l = 0; l < h; ++l ) {
                                for ( k = 0; k < w; ++k ) {
                                    mask[ n + k + l * dims[ u ] ] = null;
                                }
                            }

                            //Increment counters and continue
                            i += w; n += w;
                        } else {
                            ++i; ++n;
                        }
                    }
                }
            }
        }
        return { vertices: vertices, faces: faces };
    }
}