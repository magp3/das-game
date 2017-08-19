import * as BABYLON from 'babylonjs';


let keyState = {};

let player;
let camera;


var createScene = function(engine,canvas) {
    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);
    scene.enablePhysics();
    //will do collisions in worker thread for better rendering times - seems to not work..
    // scene.workerCollisions = true;
    scene.collisionsEnabled = true;
    // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
    camera = new BABYLON.ArcRotateCamera("arcrotateCamera",0,0,0,BABYLON.Vector3.Zero(),scene);

    // target the camera to scene origin
    //x,y,z
    camera.setPosition(new BABYLON.Vector3(0,15,-30));
    camera.collisionRadius = new BABYLON.Vector3(0.5, 0.5, 0.5)
    camera.checkCollisions = true;
    // attach the camera to the canvas
    camera.attachControl(canvas, false);

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

    // create a built-in "sphere" shape; its constructor takes 4 params: name, subdivisions, radius, scene
    player = BABYLON.Mesh.CreateSphere('sphere1', 30, 2, scene);

    // move the sphere upward 1/2 of its height
    player.position.y = 10;
    player.ellipsoid = new BABYLON.Vector3(1, 1, 1);
    player.applyGravity = true;
    player.checkCollisions = true;
    camera.setTarget(player);

    // create a built-in "ground" shape; its constructor takes 5 params: name, width, height, subdivisions and scene
    var ground = BABYLON.Mesh.CreateGround('ground1', 1000, 1000, 4, scene);
    var grassMaterial = new BABYLON.StandardMaterial("grassMaterial", scene);
    //Texture used under https://creativecommons.org/licenses/by/2.0/ , from https://www.flickr.com/photos/pixelbuffer/3581676159 .
    var grassTexture = new BABYLON.Texture("grass.jpg", scene);
    grassTexture.uScale = 8;
    grassTexture.vScale = 8;
    grassMaterial.diffuseTexture = grassTexture;
    ground.material = grassMaterial;
    ground.checkCollisions = true;

    player.physicsImpostor = new BABYLON.PhysicsImpostor(player, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, scene);
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
    // return the created scene



    return scene;
};

let engine;



let main = () =>
{
    let canvas = document.getElementById('renderCanvas');
    engine = new BABYLON.Engine(canvas, true);
    let scene = createScene(engine,canvas);
    var fpsLabel = document.getElementById("fpsLabel");
    // fpsLabel.style.right = document.body.clientWidth - (canvas.clientWidth) + "px";
    fpsLabel.style.right = document.body.clientWidth - (canvas.clientWidth) + "px";
    let moveSpeed = 1;
    let showAxis = function(size) {
        var axisX = BABYLON.Mesh.CreateLines("axisX", [BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0) ], scene);
        axisX.color = new BABYLON.Color3(1, 0, 0);
        var axisY = BABYLON.Mesh.CreateLines("axisY", [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0) ], scene);
        axisY.color = new BABYLON.Color3(0, 1, 0);
        var axisZ = BABYLON.Mesh.CreateLines("axisZ", [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size) ], scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1);
    };
    showAxis(10);
    engine.runRenderLoop(function() {
        fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";
        if(keyState["w"])
        {
            player.position.x -= Math.cos(camera.alpha) * moveSpeed;
            player.position.z -= Math.sin(camera.alpha) * moveSpeed;

        }
        else if(keyState["s"]) {
            player.position.x += Math.cos(camera.alpha) * moveSpeed;
            player.position.z += Math.sin(camera.alpha) * moveSpeed;
        }
        if(keyState["d"])
        {
            player.position.x -= Math.sin(camera.alpha) * moveSpeed;
            player.position.z += Math.cos(camera.alpha) * moveSpeed;
        }
        else if(keyState["a"])
        {
            player.position.x += Math.sin(camera.alpha) * moveSpeed;
            player.position.z -= Math.cos(camera.alpha) * moveSpeed;
        }

        if(keyState[" "])
        {
            player.position.y += 1;
        }


        scene.render();
    });
};
window.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener("keydown",(e) =>
    {
        keyState[e.key] = true;
    });
    document.body.addEventListener("keyup",(e) =>
    {
        keyState[e.key] = false;
        console.log(e);
    });

    main();
});


window.addEventListener('resize', function() {
    engine.resize();
});