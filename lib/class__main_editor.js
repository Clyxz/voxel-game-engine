function Editor() {

    this.init = () => {
        gui             = new Guieditor();
        mapper          = new Mapper();
        renderer        = new Renderer();

        materialloader  = new Materialloader();
        chunkmanager    = new Chunkmanager();
        worldcreator    = new Worldcreator();
        player          = new Entity("cameratarget", {x: 0, y: 0, z: 0});

        renderer.controls.target = new THREE.Vector3(0,0,0);
        renderer.camera.position.set(-15, 20, 15);


        setInterval(renderer.updateDaytimeSunPosition)//, 1000 * 1.5);
    }

    this.init();
    this.lock = false;

    this.lastUpdate = Date.now();

    this.update = () => {

        player.updatePosition({
            x: renderer.controls.target.x,
            y: renderer.controls.target.y,
            z: renderer.controls.target.z});

        //TODO: Provisorisch
        renderer.updateShadowCameraPosition();
        renderer.controls.update();
        renderer.render();
    }

    this.animate = (time) => {
        //TWEEN.update(time); 
        this.update();
        requestAnimationFrame( this.animate );
    }

    this.animate();

}


editor = new Editor();

