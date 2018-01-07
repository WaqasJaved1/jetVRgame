var renderer;
var scene;
var camera;
var n;
var jet;
var manager;
var surface;
var surface2;
var surface3;
var stars = [];
var moveState = {};

var surfaces = [];
var cube;

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
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 4500);



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
        logarithmicDepthBuffer: true,
        alpha: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;

    // renderer.setClearColorHex( 0xffffff, 1 );
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
    var geometry = new THREE.PlaneGeometry(WORLD_WIDTH, WORLD_HEIGHT, 299, 284);
    var geometry2 = new THREE.PlaneGeometry(WORLD_WIDTH-1800, WORLD_HEIGHT, 299, 284);

    terrainLoader.load(terrainURL, function(data) {

        // Adjust each vertex in the plane to correspond to the height value in the DEM file.
        for (var i = 0, l = geometry.vertices.length; i < l; i++) {
            geometry.vertices[i].z = data[i] / 65535 * 100;
            geometry2.vertices[i].z = Math.random() * 1000 / 65535 * 100;
        }

        var textureLoader = new THREE.TextureLoader();
        // This goes inside the TerrainLoader callback function
        textureLoader.load("data/f1.jpg", function(texture) {
            // Lambert is a type non-reflective material
            var material = new THREE.MeshLambertMaterial({
                map: texture
            });

            surface = new THREE.Mesh(geometry, material);
            surface.rotation.x = 4.713;
            surface.position.y -= 100;
            surface.position.z -= 1000;

            textureLoader.load("data/f1.jpg", function(texture) {
                // Lambert is a type non-reflective material
                var material = new THREE.MeshLambertMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0.2
                });

                surface2 = new THREE.Mesh(geometry2, material);
                surface2.position.y += 50;
                surface2.rotation.x = 4.713;
                surface2.position.z -= 1000;

                var surface3 = surface2.clone();

                surface2.rotation.y = Math.PI / 2;
                surface2.position.x -= 1000;

                surface3.rotation.y = -Math.PI / 2;
                surface3.position.x += 1000;

                // ------

                surfaces.push(surface);
                surfaces.push(surface2);
                surfaces.push(surface3);

                for (var i = 0; i < 3; i++) {
                    var surface5 = surface.clone();
                    surface5.position.z -= (1200 * (i + 1));
                    surface5.depthWrite = false;

                    var surface6 = surface2.clone();
                    surface6.position.z -= (1200 * (i + 1));
                    surface6.depthWrite = false;

                    var surface7 = surface3.clone();
                    surface7.position.z -= (1200 * (i + 1));
                    surface7.depthWrite = false;

                    surfaces.push(surface5);
                    surfaces.push(surface6);
                    surfaces.push(surface7);
                }

                for (var i in surfaces) {
                    scene.add(surfaces[i]);
                }


            });
        });



    }, function(xhr) {
        console.log("_______________________" + xhr);
    }, function(xhr) {
        console.log("error" + xhr);
    });



    addSphere(scene);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {

    if (surface2) {

        // surface2.position.x -= 0.5;
        // console.log(surface2.position)
    }
    animateStars();
    myFunction();


    requestAnimationFrame(render);
    manager.render(scene, camera);
}

var move_speed= 200;
var max_move = 950;
var max_speed = 1000;
function moveUpdate() {
   
    var delta = clock.getDelta();

    for (var i in surfaces) {
        surfaces[i].position.z += delta * 1000;

        if(surfaces[i].position.z >= 400){
            surfaces[i].position.z = -4900;
        }
    }


    if(!moveState.left && camera.position.x < -max_move){
        camera.position.x += 10;
        return;
    } 

    if(!moveState.right && camera.position.x > max_move){
        camera.position.x -= 10;
        return;
    }    

    if(moveState.left){
        if(move_speed < max_speed){
            move_speed += delta *500;
        }
        if(jet.position.x > -max_move){
            jet.position.x -= delta*move_speed;
        }
        if(camera.position.x > -max_move-150){
            camera.position.x -= delta*move_speed;
        }

    }else if(moveState.right){
        if(move_speed < max_speed){
            move_speed += delta *500;
        }
        if(jet.position.x < max_move){
            jet.position.x += delta*move_speed;
        }

        if(camera.position.x < max_move+150){
            camera.position.x += delta*move_speed;
        }

    }
}
function myFunction() {
    // return;

    if (jet) {
        if (jet.rotation.y < 2.65) {
            jet.rotation.y += 0.05;
        } 



        if (jet.rotation.y >= 2.65 && camera.position.y < 200) {
            jet.position.y += 0.5;
            camera.position.y += 1;
            camera.position.z += 1.5;
        }

        if (jet.rotation.y >= 2.65 && camera.position.y >= 200) {
            moveUpdate();
        }
    }

    // console.log(jet);
}

function addSphere(scene) {

    // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position. 
    for (var z = -1000; z < 1000; z += 20) {

        // Make a sphere (exactly the same as before). 
        var geometry = new THREE.SphereGeometry(0.5, 32, 32)
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        var sphere = new THREE.Mesh(geometry, material)

        // This time we give the sphere random x and y positions between -500 and 500
        sphere.position.x = Math.random() * 10000 - 5000;
        sphere.position.y = Math.random() * 10000 - 5000;

        // Then set the z position to where it is in the loop (distance of camera)
        sphere.position.z = Math.random() *-1000 - 3000;

        // scale it up a bit
        sphere.scale.x = sphere.scale.y = Math.random()*20;

        //add the sphere to the scene
        scene.add(sphere);

        //finally push it to the stars array 
        stars.push(sphere);
    }
}

function animateStars() {

    // loop through each star
    for (var i = 0; i < stars.length; i++) {

        star = stars[i];

        // and move it forward dependent on the mouseY position. 
        // star.position.z += i / 10;

        star.position.x += star.position.x/100;
        star.position.y += star.position.y/100;

        // if the particle is too close move it to the back
        if (star.position.x > 5000 || star.position.x < -5000 || star.position.y < -5000 || star.position.y > 5000) {

            star.position.x = Math.random() * 10000 - 5000;
            star.position.y = Math.random() * 10000 - 5000;
        };

    }

}


document.onkeydown = function(event) {

    if (event.altKey) {

        return;

    }
    //event.preventDefault();

    switch (event.keyCode) {

        case 38:
            /*up*/
            moveState.up = 1;
            break;
        case 40:
            /*down*/
            moveState.down = 1;
            break;

        case 37:
            /*left*/
            moveState.left = 1;
            jet.rotation.z = -Math.PI/16;
            jet.rotation.x = Math.PI/16;
            break;
        case 39:
            /*right*/
            moveState.right = 1;
            jet.rotation.z = Math.PI/16;

            break;


    }

};

document.onkeyup = function(event) {

    if (event.altKey) {

        return;

    }
    //event.preventDefault();

    switch (event.keyCode) {

        case 38:
            /*up*/
            moveState.up = 0;
            break;
        case 40:
            /*down*/
            moveState.down = 0;
            break;

        case 37:
            /*left*/
            move_speed = 200;
            moveState.left = 0;
            jet.rotation.z = 0;
            jet.rotation.x = 0;

            break;
        case 39:
            /*right*/
            move_speed = 200;
            moveState.right = 0;
            jet.rotation.z = 0;

            break;


    }

};


initialize();

render();