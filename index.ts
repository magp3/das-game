import * as BABYLON from 'babylonjs';
import _ from "lodash";


window["BABYLON"] = BABYLON;

let keyState = {};
let mouseState = {};

let player;
let camera;
let theSkeleton;

var createScene = function(engine,canvas) {
    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);
    scene.enablePhysics();
    BABYLON.DebugLayer.InspectorURL = location.href  + "babylon.inspector.bundle.js";
    scene.debugLayer.show();
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
    camera.attachControl(canvas, true);

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

    // create a built-in "sphere" shape; its constructor takes 4 params: name, subdivisions, radius, scene
    // player = BABYLON.Mesh.CreateSphere('sphere1', 30, 2, scene);

    // move the sphere upward 1/2 of its height


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
    ground.renderingGroupId = 1;


    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
    // return the created scene

    BABYLON.SceneLoader.ImportMesh("", "", "zombie_textured.babylon", scene, function (newMeshes, particleSystems,skeletons) {
        player = newMeshes[0];

        console.log(particleSystems);
        player.scaling.x = 2;
        player.scaling.y = 2;
        player.scaling.z = 2;
        player.position.y = 10;
        player.ellipsoid = new BABYLON.Vector3(2, 2, 2);
        player.applyGravity = true;
        player.checkCollisions = true;
        player.physicsImpostor = new BABYLON.PhysicsImpostor(player, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, scene);

        // let material = new BABYLON.StandardMaterial("texture1", scene);
        // player.material = material;
        player.material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        // material.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.7);
         player.faceDirection = -Math.PI/2;
        player.renderingGroupId = 1;
        camera.setTarget(player);
        theSkeleton = skeletons[0];
        BABYLON.SceneLoader.ImportMesh("", "", "sword.babylon", scene, function (newMeshes, particleSystems) {
            let sword = newMeshes[0];
            sword.rotate(BABYLON.Axis.Z,Math.PI,BABYLON.Space.LOCAL);
            sword.renderingGroupId = 1;
            sword.material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
            sword.scaling.x = 0.5;
            sword.scaling.y = 0.5;
            sword.scaling.z = 0.5;
            let swordArmBone = theSkeleton.bones.find((bone) =>
            {
                return bone.id === "Arm2.r.001";
            });
            console.log("attaching stuff");
            console.log(theSkeleton);
            sword.attachToBone(swordArmBone,player);
            sword.position.y -= 0.7;




        });
    });



    return scene;
};

let engine;


let turnPlayer = () =>
{
    if(player)
    {
        let diff = camera.alpha - player.faceDirection;
        player.rotate(BABYLON.Axis.Y, -diff, BABYLON.Space.LOCAL);
        player.faceDirection += diff;
    }
}

let playerAnimation;
let punchAnimation;

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
        axisX.renderingGroupId = 1;
        axisY.renderingGroupId = 1;
        axisZ.renderingGroupId = 1;
    };
    showAxis(10);

    var skybox = BABYLON.Mesh.CreateBox("skyBox", 100.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    skybox.infiniteDistance = true;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skybox.renderingGroupId = 0;
    // myMesh.renderingGroupId = 1;
    engine.runRenderLoop(function() {
        fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";

        //turn player according to camera angle


        if(keyState["w"])
        {
            player.position.x -= Math.cos(camera.alpha) * moveSpeed;
            player.position.z -= Math.sin(camera.alpha) * moveSpeed;
            if(!playerAnimation && !punchAnimation)
            {
                playerAnimation = true;
                scene.beginAnimation(theSkeleton, 332, 346, false, 1,() =>
                {
                    playerAnimation = false;
                });
            }

            turnPlayer();

        }
        else if(keyState["s"]) {
            player.position.x += Math.cos(camera.alpha) * moveSpeed;
            player.position.z += Math.sin(camera.alpha) * moveSpeed;
            turnPlayer();
        }
        if(keyState["d"])
        {
            player.position.x -= Math.sin(camera.alpha) * moveSpeed;
            player.position.z += Math.cos(camera.alpha) * moveSpeed;
            turnPlayer();
        }
        else if(keyState["a"])
        {
            player.position.x += Math.sin(camera.alpha) * moveSpeed;
            player.position.z -= Math.cos(camera.alpha) * moveSpeed;
            turnPlayer();
        }

        if(keyState[" "])
        {
            player.position.y += 1;
        }

        if(mouseState[0])
        {
            if(!punchAnimation)
            {
                console.log("starting to punch ppl");
                punchAnimation = true;
                let derp = scene.beginAnimation(theSkeleton, 290, 303, false, 1.0,() =>
                {
                    punchAnimation = false;
                });
                console.log(derp);
            }
            console.log("clicking");


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
    });
    document.body.addEventListener("mousedown",(e) =>
    {
        mouseState[e.button] = true;
        // e.preventDefault();
    });
    document.body.addEventListener("mouseup",(e) =>
    {
        mouseState[e.button] = false;
        e.preventDefault();
    });


    main();
});


window.addEventListener('resize', function() {
    engine.resize();
});