function Renderer() {
    this.webworker = [];
    this.renderlist = [];
    this.rendersettings = {

        distance: 5

    };

    this.worldinfo = {
        time: {
            isDay: null,
            percent: null,
            sunposition: {
                x: null,
                y: null
            }
        }
    }


    this.init = ()=> {

        this.domElement             = document.getElementById("gl"); 
        this.renderer               = new THREE.WebGLRenderer({ antialias: true });
        this.world                  = new THREE.Scene();
        this.world.background       = new THREE.Color(0x354f5f);
        this.camera                 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        this.controls               = new THREE.OrbitControls( this.camera, this.domElement);
        //this.controls.addEventListener('change', this.effectComposer.render() );
        this.sunlight               = new THREE.DirectionalLight(0xffffff, 1, 100);
        this.hemispherelight        = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.65);
        this.sunlight.shadow        = new THREE.LightShadow(new THREE.PerspectiveCamera( 10.5, 1, 1, 5000 ));
        this.ssaoPass               = new THREE.SSAOPass(this.world, this.camera, window.innerWidth, window.innerHeight);
        this.effectComposer         = new THREE.EffectComposer(this.renderer);
        //this.helper = new THREE.CameraHelper( this.sunlight.shadow.camera );
        //this.world.add( this.helper );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.autoUpdate = false;
        this.renderer.gammaFactor = 1.0;
        this.renderer.gammaOutput = true;
        this.renderer.powerPreference = "high-performance";
        this.renderer.setPixelRatio( window.devicePixelRatio );

        this.domElement.appendChild(this.renderer.domElement);

        this.sunlight.castShadow = true;
        this.sunlight.shadow.mapSize.x = 2048;
        this.sunlight.shadow.mapSize.y = 2048;

        this.world.add(this.sunlight);
        this.world.add(this.hemispherelight);

        this.ssaoPass.kernelRadius = 0.5;
        this.ssaoPass.minDistance = 0.00000001;
        this.ssaoPass.maxDistance = 1;
        this.ssaoPass.output = THREE.SSAOPass.OUTPUT.Default;
        
        this.effectComposer.addPass( this.ssaoPass );
        this.textureloader = new THREE.TextureLoader();
        this.textureloader.crossOrigin = '';
        this.loadedtextures = [];
        this.materials = [];

        window.addEventListener( 'resize', this.updateScreensize, false );
        this.updateScreensize();

    }

    this.updateScreensize = () => {

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( this.width, this.height );
        this.ssaoPass.setSize( this.width, this.height );
        document.getElementById("gl").style.width = window.innerWidth;
        document.getElementById("gl").style.height = window.innerHeight;
    }

    this.init();


    this.render = () => {

        this.renderer.shadowMap.needsUpdate = true;
        //this.renderer.clear(); 
        // this.renderer.render(this.world, this.camera); 
        this.effectComposer.render(); 
    }

    this.updateCameraPosition = async(delta) => {

        this.camera.position.x+= delta.x
        this.camera.position.z+= delta.z

        new TWEEN.Tween(this.controls.target).to({
            x: player.mesh.position.x, 
            y: player.mesh.position.y, 
            z: player.mesh.position.z}, 50).start();
    }

    this.updateShadowCameraPosition = async() => {

        this.sunPos = {
            x: player.mesh.position.x + this.worldinfo.time.sunposition.x,
            y: player.mesh.position.y + this.worldinfo.time.sunposition.y,
            z: player.mesh.position.z + 30 + this.worldinfo.time.sunposition.y * 1.5}

        this.sunlight.position.copy( this.sunPos );
        this.sunlight.target.position.copy( player.mesh.position );
        this.sunlight.target.updateMatrixWorld();
    }

    this.updateDaytimeSunPosition = () => {
        // 2.77777777778        = 1000 ms / 360deg
        // 57.29577951308232    = 180 / Math.Pi

        this.time                   = Date.now() / (2.77777777778 * 2 * 86400); // 400 => 86400
        this.worldinfo.time.percent = this.time % 100;
        this.worldinfo.time.isDay   = this.time % 200 < 100 ? true : false;
        this.radians                = (this.worldinfo.time.percent * 2 - 190) / 57.29577951308232;

        if (this.worldinfo.time.isDay) {
            this.reverse = -1;
        } else {
            this.reverse = 1;
        }

        this.bellvalue = this.bellshape( this.worldinfo.time.percent );

        if (this.worldinfo.time.isDay) {
            this.hemispherelight.intensity = 0.2 + 0.2 * this.bellvalue;
            this.r = 0.0 + 0.9 * this.bellvalue;
            this.g = 0.1 + 0.8 * this.bellvalue;
            this.b = 0.2 + 0.7 * this.bellvalue;

            this.sunlight.color = { r: this.r, g: this.g, b: this.b };

            this.r = 0.8 + 0.2 * this.bellvalue;
            this.g = 0.8 + 0.2 * this.bellvalue;
            this.b = 1.0;

            this.hemispherelight.color = { r: this.r, g: this.g, b: this.b };
        } else {
            renderer.sunlight.color             = {r: 0.0,g: 0.1,b: 0.2};
            renderer.hemispherelight.color      = {r: 0.8,g: 0.8,b: 1.0};
            renderer.hemispherelight.intensity  = 0.2;
        }

        this.worldinfo.time.sunposition.x = 500 * this.reverse * Math.cos( this.radians ) + 0;
        this.worldinfo.time.sunposition.y = -500 * Math.sin( this.radians ) + 0;
    }

    this.bellshape = (x) => {
        this.a = 45;
        this.b = 10;
        this.c = 50;

        return 1 / ( 1 + Math.pow(  Math.abs((x - this.c) / this.a)  , 2 * this.b) );
    }

    this.updateCameraRotation = async(angleX, angleY) => {

        this.controls.rotateLeft(angleX * 0.03);
        this.controls.rotateUp(angleY * 0.03);
    }


    this.generateMesh =  (type, volumedata, dimensions, coordinates, index) => {
        this.webworker[ index ] = new Worker('lib/worker_mesher.js');

        //Send to worker
        this.webworker[ index ].postMessage( [ type, volumedata, dimensions, coordinates ] );

        //Answer from worker
        this.webworker[ index ].addEventListener('message', function(event) {

            if (!event.data.error) {

                this.geometry = new THREE.Geometry();
                this.geometry.faces = event.data.faces;
                this.geometry.faceVertexUvs = event.data.faceVertexUvs,
                this.geometry.vertices = event.data.vertices;

                
                this.geometry = new THREE.BufferGeometry().fromGeometry( this.geometry );
                this.geometry.computeVertexNormals();
                
                this.mesh                   = new THREE.Mesh( this.geometry, renderer.materials );
                this.mesh.castShadow        = true;
                this.mesh.receiveShadow     = true;
                this.mesh.matrixAutoUpdate  = false;
                this.mesh.position.set( coordinates.x, coordinates.y, coordinates.z );


                if(type == "brush") {
                    this.mesh.matrixAutoUpdate  = true;
                    worldcreator.handle.attach( this.mesh );
                }

                if (renderer.renderlist[ index ]) {
                    renderer.removeGeometry( index );
                }

                renderer.world.add(this.mesh);

                renderer.renderlist[ index ] = {
                    uuid:   this.mesh.uuid,
                    type:   type, 
                    x:      coordinates.x / 16,
                    y:      coordinates.y / 16,
                    z:      coordinates.z / 16
                };

            }
        });
    }

    // Removes a chunk or other geometry
    this.removeGeometry = async (index) => {

        try {
            if (this.renderlist[index]) {

                this.object = mapper.getObject(index);

                if (this.object) {

                    this.object.geometry.dispose();
                    this.world.remove(this.object);
                    this.object = null;
                    delete this.renderlist[index];
                    delete this.webworker[index];
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

}
