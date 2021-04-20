function Editor() {

    this.init = () => {
        gui             = new Guieditor();
        mapper          = new Mapper();
        renderer        = new Renderer();
        mesher          = new Mesher();
        materialloader  = new Materialloader();
        chunkmanager    = new Chunkmanager();
        player          = new Entity( 'cameratarget', { x: 0, y: 16, z: 41 } );

        renderer.controls.target = new THREE.Vector3( 0,16,41 );
        renderer.camera.position.set( 82, 88, 110 );

        setInterval( renderer.updateDaytimeSunPosition ); // , 1000 * 1.5 );
    }

    this.init();
    this.lock = false;

    this.lastUpdate = Date.now();

    this.update = () => {

        player.updatePosition( {
            x: renderer.controls.target.x,
            y: renderer.controls.target.y,
            z: renderer.controls.target.z
        } );

        //TODO: Provisorisch
        renderer.updateShadowCameraPosition();
        renderer.controls.update();
        renderer.render();
    }

    this.animate = ( time ) => {
        //TWEEN.update( time ); 
        this.update();
        requestAnimationFrame( this.animate );
    }

    this.animate();
}

editor = new Editor();

