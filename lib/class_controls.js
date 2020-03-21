function controls() {

    this.haveEvents = 'ongamepadconnected' in window;
    this.gamepads = new Array();

    window.addEventListener( "gamepadconnected", ( e ) => {

        gamepadHandler( e.gamepad, true );

    }, false );

    window.addEventListener( "gamepaddisconnected", ( e ) => {

        gamepadHandler( e, false );

    }, false );

    gamepadHandler = ( gamepad, connecting ) => {

        if ( connecting ) {

            this.gamepads[ gamepad.index ] = gamepad;
            console.log( "Gamepad connected" );

        } else {

            delete this.gamepads[ gamepad.index ];
            console.log( "Gamepad disconnected" );

        }
    }

    this.readGamepad = () => {

        if ( !this.haveEvents ) {

            this.scangamepads();

        }

        if ( this.gamepads[ 0 ] ) {

            if ( player ) {

                this.speed = 0.1;
                this.deltaX = this.gamepads[ 0 ].axes[ 0 ] * this.speed;
                this.deltaZ = this.gamepads[ 0 ].axes[ 1 ] * this.speed;
                Math.abs( this.deltaX ) < 0.2 * this.speed ? this.deltaX = 0 : null;
                Math.abs( this.deltaZ ) < 0.2 * this.speed ? this.deltaZ = 0 : null;

                if ( this.deltaX != 0 || this.deltaZ != 0 ) {

                    this.quaternion = new THREE.Quaternion();
                    this.quaternion.setFromAxisAngle(  new THREE.Vector3( 0, 1, 0 ), renderer.controls.getAzimuthalAngle() );

                    this.vector = new THREE.Vector3( this.deltaX, 0, this.deltaZ );
                    this.vector.applyQuaternion( this.quaternion );

                    player.updatePosition( {
                        x: this.vector.x + player.mesh.position.x,
                        y: this.vector.x + player.mesh.position.y,
                        z: this.vector.z + player.mesh.position.z
                    } );

                    renderer.updateCameraPosition( {
                        x: this.vector.x,
                        y: this.vector.x,
                        z: this.vector.z
                    } );

                    renderer.updateShadowCameraPosition();
                }

                this.rotationX = this.gamepads[ 0 ].axes[ 2 ];
                this.rotationZ = this.gamepads[ 0 ].axes[ 3 ];
                Math.abs( this.rotationX ) < 0.2 ? this.rotationX = 0 : null;
                Math.abs( this.rotationZ ) < 0.2 ? this.rotationZ = 0 : null;

                if ( this.rotationX != 0 || this.rotationZ != 0 ) {

                    renderer.updateCameraRotation( this.rotationX, this.rotationZ );

                }

                if( this.deltaX != 0 || this.deltaZ != 0 || this.rotationX != 0 || this.rotationZ != 0 ) {
                    renderer.render();
                }
            }
        }
    }

    this.scangamepads = () => {

        this.gps = navigator.getGamepads ? navigator.getGamepads() : ( navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [] );

        for ( var i = 0; i < this.gps.length; i++ ) {

            if ( this.gps[ i ] ) {

                if ( this.gps[ i ].index in this.gamepads ) {

                    this.gamepads[ this.gps[ i ].index ] = this.gps[ i ];

                } else {
                    //addgamepad( this.gps[ i ] );
                }
            }
        }
    }
}



