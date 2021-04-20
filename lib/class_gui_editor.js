function Guieditor () {

    this.getRayCollission = (mouse) => {

        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1,
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        this.vector = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject( renderer.camera );
        this.ray = new THREE.Raycaster(
            renderer.camera.position,
            this.vector.sub( renderer.camera.position ).normalize()
        );

        this.ray.params.Points.threshold = 0.3;

        this.intersects  = this.ray.intersectObjects( renderer.world.children );

        if ( this.intersects.length > 0 ) {
            return this.intersects[ 0 ].point;
        } else {
            return false;
        }
    }

    this.geometry_change_brushsizex = ( input ) => {
        tool.preview.dimensions[ 0 ] = parseInt( input.value );
        chunkmanager.generatePreviewMesh();
    }

    this.geometry_change_brushsizey = ( input ) => {
        tool.preview.dimensions[ 1 ] = parseInt( input.value );
        chunkmanager.generatePreviewMesh();
    }

    this.geometry_change_brushsizez = ( input ) => {
        tool.preview.dimensions[ 2 ] = parseInt( input.value );
        chunkmanager.generatePreviewMesh();
    }

    this.geometry_change_texture = ( texture ) => {
        tool.active = 'brush';
        tool.preview.texture = texture;
        chunkmanager.generatePreviewMesh( 'brush' );
        this.updateGUI( 'brush' );
    }

    this.geometry_select_brush = () => {
        tool.active = 'brush';
        chunkmanager.generatePreviewMesh( 'brush' );
        this.updateGUI( 'brush' );
    }

    this.geometry_select_pipette = () => {
        tool.active = 'pipette';
        tool.preview.texture = 17;
        chunkmanager.generatePreviewMesh( 'pipette' );
        this.updateGUI( 'pipette' );
    }

    this.geometry_select_paste = () => {
        tool.active = 'paste';
        chunkmanager.generatePreviewMesh( 'paste' );
        this.updateGUI( 'paste' );
    }

    this.save = () => {
        this.a = document.createElement( 'a' );
        this.file = new Blob( [ JSON.stringify( worlddata ) ], { type: 'text/javascript' } );
        this.a.href = URL.createObjectURL( this.file );
        this.a.download = 'data_world.js';
        this.a.click();
    }

    document.addEventListener( 'keyup', ( e ) => {

        if ( e.code === 'Space' ) {
            if ( tool.active == 'brush' ) chunkmanager.editMass();
            if ( tool.active == 'paste' ) chunkmanager.editMass();
            if ( tool.active == 'pipette' ) chunkmanager.copyMass();
        }
    } );

    this.updateGUI = ( element ) => {

        var tools = document.querySelectorAll( '.guitool' );
        for ( var i = 0; i < tools.length; i++ ) {
            tools[ i ].classList.remove( 'active' )
        }
        document.querySelectorAll( '#guitool_' + element )[ 0 ].classList.add( 'active' );


        if ( tool.active == 'brush' ) {
            document.querySelectorAll( '#guitool_dimensionslider' )[ 0 ].classList.remove( 'hidden' );
            document.querySelectorAll( '#guitool_texturepalette' )[ 0 ].classList.remove( 'hidden' );
        }
        if ( tool.active == 'pipette' ) {
            document.querySelectorAll( '#guitool_dimensionslider' )[ 0 ].classList.remove( 'hidden' );
            document.querySelectorAll( '#guitool_texturepalette' )[ 0 ].classList.add( 'hidden' );
        }
        if ( tool.active == 'paste' ) {
            document.querySelectorAll( '#guitool_dimensionslider' )[ 0 ].classList.add( 'hidden' );
            document.querySelectorAll( '#guitool_texturepalette' )[ 0 ].classList.add( 'hidden' );
        }

        var textures = document.querySelectorAll( '.texturesample' );
        for ( var i = 0; i < textures.length; i++ ) {
            textures[ i ].classList.remove( 'active' );
        }
        document.querySelectorAll( '#texture' + tool.preview.texture )[ 0 ].classList.add( 'active' );
    }
}