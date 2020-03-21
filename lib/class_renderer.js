function Renderer() {

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
    this.colors = {
        dawn: {
            r: 1.00,
            g: 0.72,
            b: 0.51,
        },
        day: {
            r: 0.90,
            g: 0.80,
            b: 0.80,
        },
        night: {
            r: 0.40,
            g: 0.45,
            b: 0.50,
        }
    }


    this.init = ()=> {

        this.domElement             = document.getElementById('gl'); 
        this.renderer               = new THREE.WebGLRenderer( { antialias: true } );
        this.world                  = new THREE.Scene();
        this.world.background       = new THREE.Color( 0x354f5f );
        this.camera                 = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
        this.controls               = new THREE.OrbitControls( this.camera, this.domElement );
        //this.controls.addEventListener('change', this.effectComposer.render() );
        this.sunlight               = new THREE.DirectionalLight( 0xffffff, 1, 100 );
        this.hemispherelight        = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.65 );
        this.sunlight.shadow        = new THREE.LightShadow( new THREE.PerspectiveCamera( 10.5, 1, 1, 5000 ));
        this.ssaoPass               = new THREE.SSAOPass( this.world, this.camera, window.innerWidth, window.innerHeight );
        this.effectComposer         = new THREE.EffectComposer( this.renderer );
        //this.helper = new THREE.CameraHelper( this.sunlight.shadow.camera );
        //this.world.add( this.helper );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.autoUpdate = false;
        this.renderer.gammaFactor = 1.0;
        this.renderer.gammaOutput = true;
        this.renderer.powerPreference = 'high-performance';
        this.renderer.setPixelRatio( window.devicePixelRatio );

        this.domElement.appendChild( this.renderer.domElement );

        this.sunlight.castShadow = true;
        this.sunlight.shadow.mapSize.x = 2048;
        this.sunlight.shadow.mapSize.y = 2048;

        this.world.add( this.sunlight );
        this.world.add( this.hemispherelight );

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
        document.getElementById( 'gl' ).style.width = window.innerWidth;
        document.getElementById( 'gl' ).style.height = window.innerHeight;
    }

    this.init();

    this.render = () => {

        this.renderer.shadowMap.needsUpdate = true;
        //this.renderer.clear();
        // this.renderer.render(this.world, this.camera);
        this.effectComposer.render();
    }

    this.updateCameraPosition = async(delta) => {

        this.camera.position.x += delta.x;
        this.camera.position.z += delta.z;

        new TWEEN.Tween(this.controls.target).to( {
            x: player.mesh.position.x,
            y: player.mesh.position.y,
            z: player.mesh.position.z
        }, 50 ).start();
    }

    this.updateShadowCameraPosition = async() => {

        this.sunPos = {
            x: player.mesh.position.x + this.worldinfo.time.sunposition.x,
            y: player.mesh.position.y + this.worldinfo.time.sunposition.y,
            z: player.mesh.position.z + 30 + this.worldinfo.time.sunposition.y * 1.5
        }

        this.sunlight.position.copy( this.sunPos );
        this.sunlight.target.position.copy( player.mesh.position );
        this.sunlight.target.updateMatrixWorld();
    }

    this.updateDaytimeSunPosition = () => {

        this.hour                   = 3600;                     // One game hour has 3600 seconds
        this.dayinseconds           = this.hour * 24;           // 24 hours make a game day
        this.timeoffset             = this.hour * 1;            // GMT+1 (timeoffset)
        this.sunrise                = this.dayinseconds / 4;    // 6:00am is sunrise = daybegin

        this.time                   = ( Date.now() / 1000 + this.timeoffset + this.sunrise ) % this.dayinseconds;
        this.worldinfo.time.percent = this.time / this.dayinseconds * 100 * 2 % 100;
        this.worldinfo.time.total   = ( 24 * this.worldinfo.time.percent / 200 + this.sunrise / this.hour ) % 12;
        this.worldinfo.time.isDay   = this.time < this.dayinseconds / 2 ? false : true;
        this.radians                = ( this.worldinfo.time.percent * 2 - 210 ) / 66.84507609859604;

        if ( this.worldinfo.time.isDay ) {
            this.reverse = -1;
        } else {
            this.reverse = 1;
        }

        this.bellvalue = this.bellshape( this.worldinfo.time.percent );
        this.bellvaluedawn = 1 - this.bellvalue;

        if ( this.worldinfo.time.isDay ) {

            this.r = this.colors.day.r * this.bellvalue     + this.colors.day.r * this.colors.dawn.r * this.bellvaluedawn;
            this.g = this.colors.day.g * this.bellvalue     + this.colors.day.g * this.colors.dawn.g * this.bellvaluedawn;
            this.b = this.colors.day.b * this.bellvalue     + this.colors.day.b * this.colors.dawn.b * this.bellvaluedawn;

            this.sunlight.color = { r: this.r, g: this.g, b: this.b };
            this.hemispherelight.color = { r: this.r, g: this.g, b: this.b };
            this.hemispherelight.intensity = 0.2 + 0.2 * this.bellvalue + 0.2 * this.bellvaluedawn;
        } else {

            this.r = this.colors.night.r;
            this.g = this.colors.night.g;
            this.b = this.colors.night.b;

            this.sunlight.color             = { r: this.r, g: this.g, b: this.b };
            this.hemispherelight.color      = { r: 0.5,g: 0.6,b: 0.7 };
            this.hemispherelight.intensity  = 0.2 + 0.2 * this.bellvalue + 0.2 * this.bellvaluedawn;
        }

        this.worldinfo.time.sunposition.x = 500 * this.reverse * Math.cos( this.radians ) + 0;
        this.worldinfo.time.sunposition.y = -500 * Math.sin( this.radians ) + 0;
    }

    this.bellshape = (x) => {
        this.a = 35;
        this.b = 10;
        this.c = 50;

        return 1 / ( 1 + Math.pow(  Math.abs( ( x - this.c ) / this.a )  , 2 * this.b ) );
    }

    this.updateCameraRotation = async( angleX, angleY ) => {

        this.controls.rotateLeft( angleX * 0.03 );
        this.controls.rotateUp( angleY * 0.03 );
    }
}
