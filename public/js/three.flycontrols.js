/**
 * @author James Baicoianu / http://www.baicoianu.com/
 */

THREE.FlyControls = function ( object, jet, domElement ) {

    this.object = object;
    this.jet = jet;
    this.domElement = ( domElement !== undefined ) ? domElement : document;
    if ( domElement ) this.domElement.setAttribute( 'tabindex', -1 );

    // API

    this.movementSpeed = 1.0;
    this.rollSpeed = 0.005;

    this.dragToLook = false;
    this.autoForward = false;

    // disable default target object behavior

    // internals

    this.tmpQuaternion = new THREE.Quaternion();

    this.mouseStatus = 0;

    this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
    this.moveVector = new THREE.Vector3( 0, 0, 0 );
    this.rotationVector = new THREE.Vector3( 0, 0, 0 );

    this.handleEvent = function ( event ) {

        if ( typeof this[ event.type ] == 'function' ) {

            this[ event.type ]( event );

        }

    };

    this.keydown = function( event ) {

        if ( event.altKey ) {

            return;

        }

        //event.preventDefault();

        switch ( event.keyCode ) {

            case 16: /* shift */ this.movementSpeedMultiplier = .1; break;

            case 87: /*W*/ this.moveState.up = 1; break;
            case 83: /*S*/ this.moveState.down = 1; break;

            case 65: /*A*/ this.moveState.left = 1; break;
            case 68: /*D*/ this.moveState.right = 1; break;


            case 38: /*up*/ this.moveState.up = 1; break;
            case 40: /*down*/  this.moveState.down = 1; break;

            case 37: /*left*/ this.moveState.left = 1; break;
            case 39: /*right*/ this.moveState.right = 1; break;


        }

        this.updateMovementVector();

    };

    this.keyup = function( event ) {

        switch ( event.keyCode ) {

            case 16: /* shift */ this.movementSpeedMultiplier = 1; break;

            case 87: /*W*/ this.moveState.up = 0; break;
            case 83: /*S*/ this.moveState.down = 0; break;

            case 65: /*A*/ this.moveState.left = 0; break;
            case 68: /*D*/ this.moveState.right = 0; break;

            case 38: /*up*/ this.moveState.up  = 0; break;
            case 40: /*down*/ this.moveState.down = 0; break;

            case 37: /*left*/ this.moveState.left = 0; break;
            case 39: /*right*/ this.moveState.right = 0; break;


        }

        this.updateMovementVector();

    };

    
    this.update = function( delta ) {

        var moveMult = delta * this.movementSpeed;
        var rotMult = delta * this.rollSpeed;

        this.object.translateX( this.moveVector.x * moveMult );
        this.object.translateY( this.moveVector.y * moveMult );
        this.object.translateZ( this.moveVector.z * moveMult );

        this.tmpQuaternion.set( this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1 ).normalize();
        this.object.quaternion.multiply( this.tmpQuaternion );

        // expose the rotation vector for convenience
        this.object.rotation.setFromQuaternion( this.object.quaternion, this.object.rotation.order );


    };

    this.updateMovementVector = function() {

        var forward = ( this.moveState.forward || ( this.autoForward && !this.moveState.back ) ) ? 1 : 0;

        this.moveVector.x = ( -this.moveState.left    + this.moveState.right );
        this.moveVector.y = ( -this.moveState.down    + this.moveState.up );
        this.moveVector.z = ( -forward + this.moveState.back );

        //console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );

    };

   
    this.getContainerDimensions = function() {

        if ( this.domElement != document ) {

            return {
                size    : [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
                offset  : [ this.domElement.offsetLeft,  this.domElement.offsetTop ]
            };

        } else {

            return {
                size    : [ window.innerWidth, window.innerHeight ],
                offset  : [ 0, 0 ]
            };

        }

    };

    function bind( scope, fn ) {

        return function () {

            fn.apply( scope, arguments );

        };

    };

    this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );


    window.addEventListener( 'keydown', bind( this, this.keydown ), false );
    window.addEventListener( 'keyup',   bind( this, this.keyup ), false );

    this.updateMovementVector();

};
