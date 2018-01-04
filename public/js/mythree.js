var renderer;
var scene;
var camera;
var cube;
var cube2;
var n;
var jet;
var manager;
var surface;
var controls;

THREE.Cache.enabled = true;
var WINDOW_WIDTH = window.innerWidth;
var WINDOW_HEIGHT = window.innerHeight;


// Width and height of the surface we're going to create
var WORLD_WIDTH = 2000;
var WORLD_HEIGHT = 1900;

var clock = new THREE.Clock();

//to initialize three.js scene and its objects
function initialize() {

    //scene 
    scene = new THREE.Scene();

    //camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

    //rectanle
    var cubeMaterialArray = [];
    // order to add materials: x+,x-,y+,y-,z+,z-
    cubeMaterialArray.push(new THREE.MeshBasicMaterial({ color: 0xff3333 }));
    cubeMaterialArray.push(new THREE.MeshBasicMaterial({ color: 0xff8800 }));
    cubeMaterialArray.push(new THREE.MeshBasicMaterial({ color: 0xffff33 }));
    cubeMaterialArray.push(new THREE.MeshBasicMaterial({ color: 0x33ff33 }));
    cubeMaterialArray.push(new THREE.MeshBasicMaterial({ color: 0x3333ff }));
    cubeMaterialArray.push(new THREE.MeshBasicMaterial({ color: 0x8833ff }));
    var cubeMaterials = new THREE.MeshFaceMaterial(cubeMaterialArray);

    var cubeGeometry = new THREE.CubeGeometry(60, 10, 100);

    cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
    cube.position.set(0, 5, 0);
    // scene.add(cube);

    //cubes
    var cubeGeometry2 = new THREE.CubeGeometry(60, 60, 60);
    cube2 = new THREE.Mesh(cubeGeometry2, cubeMaterials);
    cube2.position.set(0, 5, -400);
    cube2.rotation.y = 10;
    // scene.add(cube2);

    //light
    var directionalLight = new THREE.DirectionalLight(16777215);
    directionalLight.position.set(200, 200, 1e3).normalize();
    directionalLight.castShadow = false;
    directionalLight.shadowDarkness = .5;
    directionalLight.shadowCameraNear = 3;
    directionalLight.shadowCameraFar = 500;
    directionalLight.shadowMapBias = .0039;
    directionalLight.shadowMapDarkness = .5;
    directionalLight.shadowMapWidth = 1024;
    directionalLight.shadowMapHeight = 1024;
    camera.add(directionalLight);

    var ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    //adding grid
    var size = 1000;
    var step = 20;
    var gridHelper = new THREE.GridHelper(size, step, new THREE.Color(0xff0000), new THREE.Color(0xff0000));
    // scene.add(gridHelper);

    camera.position.z = 0;
    camera.position.y = 20;

    // Start New


    // load jet material
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setBaseUrl('objects/testObj/');
    mtlLoader.setPath('objects/testObj/');
    var url = "materials.mtl";
    mtlLoader.load(url, function(materials) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('objects/testObj/');
        objLoader.load('model.obj', function(object) {
            console.log("Loaded");
            jet = object;
            object.position.set(0, 80, -100);
            // object.rotation.y = 20;

            scene.add(object);

        }, function(xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        }, function(error) {

            console.log('An error happened');

        });

    });

    // end New



    //Renderer properties
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        logarithmicDepthBuffer: false,
        alpha: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.setClearColor(new THREE.Color().setRGB(0, 0, 0));

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //event to resize window
    window.addEventListener("resize", onWindowResize, false);

    var effect = new THREE.VREffect(renderer);
    effect.setSize(WINDOW_WIDTH, WINDOW_HEIGHT);

    // Create a VR manager helper to enter and exit VR mode
    manager = new WebVRManager(renderer, effect);

    // Terrain
    var terrainURL = "data/Gale_HRSC_DEM_50m_300x285.bin";

    // Utility to load the DEM data
    var terrainLoader = new THREE.TerrainLoader();

    // We'll need this later

    // Create the plane geometry
    var geometry = new THREE.PlaneGeometry(WORLD_WIDTH, WORLD_HEIGHT, 299, 284);

    terrainLoader.load(terrainURL, function(data) {


        console.log(data);
        // var data =[];
        // Adjust each vertex in the plane to correspond to the height value in the DEM file.
        for (var i = 0, l = geometry.vertices.length; i < l; i++) {
            // data.push(Math.random()*5000);
            geometry.vertices[i].z = data[i] / 65535 * 100;
        }
        console.log(data);

        var textureLoader = new THREE.TextureLoader();
        var textureURL = "data/Gale_texture_high_4096px.jpg";
        // This goes inside the TerrainLoader callback function
        textureLoader.load(textureURL, function(texture) {
            // Lambert is a type non-reflective material
            var material = new THREE.MeshLambertMaterial({
                map: texture
            });

            surface = new THREE.Mesh(geometry, material);
            surface.rotation.x = 4.713;
            surface.position.y -= 100;
            surface.position.z -= 1000;
            scene.add(surface);

            var surface2 = surface.clone();
            surface2.position.z -= 1900;
            surface2.position.y -= 50;
            scene.add(surface2);

            var surface3 = surface2.clone();
            surface3.position.z -= 1900;
            surface3.position.y -= 50;
            scene.add(surface3);

        });

    }, function(xhr) {
        console.log("_______________________" + xhr);
    }, function(xhr) {
        console.log("error" + xhr);
    });


    var is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Conditionally load VR or Fly controls, based on whether we're on a mobile device
    if (is_mobile) {
        controls = new THREE.VRControls(camera);
    } else {
        // WASD-style movement controls
        controls = new THREE.FlyControls(camera);

        // Disable automatic forward movement
        controls.autoForward = true;

        // Click and drag to look around with the mouse
        controls.dragToLook = true;

        // Movement and roll speeds, adjust these and see what happens!
        controls.movementSpeed = 100;
        controls.rollSpeed = Math.PI / 12;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    myFunction();
    if(clock && controls){
        var delta = clock.getDelta();
        controls.update(delta);

    }

    requestAnimationFrame(render);
    manager.render(scene, camera);
}


var direction = +1;

function myFunction() {
    if (surface) {
        // surface.position.y -=0.1;
    }

    if (jet) {
        if (jet.rotation.y < 2.65) {
            jet.rotation.y += 0.05;
        } else {
            if (jet.position.y < 79) {
                direction = +1;
            } else if (jet.position.y > 81) {
                direction = -1;
            }

            jet.position.y += direction * 0.1;
            cube2.position.z += 0.5;
        }



        if (jet.rotation.y >= 2.65 && camera.position.y < 80) {
            camera.position.y += 1;
            camera.position.z += 1;
        }

        if(jet.rotation.y >= 2.65 && camera.position.y >= 80){
            jet.position.z = camera.position.z-200; 
            jet.position.x = camera.position.x; 
            jet.position.y = camera.position.y; 
            // jet.rotation.z = -camera.rotation.z; 
            // jet.rotation.x = camera.rotation.z/2; 
        }
    }

    // console.log(jet);
}


initialize();

render();