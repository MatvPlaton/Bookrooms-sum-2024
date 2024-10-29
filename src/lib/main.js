import * as THREE from '../../node_modules/three/build/three.module.js';
import { FBXLoader } from '../../node_modules/three/examples/jsm/loaders/FBXLoader.js';
import { MapControls } from '../../node_modules/three/examples/jsm/controls/MapControls.js';

import { FontLoader } from '../../node_modules/three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from '../../node_modules/three/examples/jsm/geometries/TextGeometry.js';
import {curr_cap, curr_id, curr_room, showFloorsButton, showSubmit} from "./store.js";


class CustomShape {
    constructor(scene, points = [], name = '', associatedModel = null, textRotation = { x: - Math.PI / 2, y: 0, z: Math.PI / 4 }, textPosition = {x: 0, y: 0, z: 0}) {
        // Define Shape colors
        const color1 = 0x423e52;
        const color2 = 0x8C879F;

        // Create a buffer geometry and set its vertices from the given points
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(points.length * 3);

        for (let i = 0; i < points.length; i++) {
            vertices[i * 3] = points[i].x;
            vertices[i * 3 + 1] = points[i].y;
            vertices[i * 3 + 2] = points[i].z;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // Compute the face indices (assuming the points form a convex polygon)
        const indices = [];
        for (let i = 1; i < points.length - 1; i++) {
            indices.push(0, i, i + 1);
        }
        geometry.setIndex(indices);

        // Compute normals for proper lighting
        geometry.computeVertexNormals();

        this.material1 = new THREE.MeshBasicMaterial({ color: color1, side: THREE.DoubleSide });
        this.material2 = new THREE.MeshBasicMaterial({ color: color2, side: THREE.DoubleSide });

        this.mesh = new THREE.Mesh(geometry, this.material1);
        this.mesh.userData.name = name; // Add name for identification
        this.mesh.userData.isQuad = true; // Mark as a quad
        this.mesh.userData.associatedModel = associatedModel; // Associated model
        this.mesh.userData.quad = this; // Reference to this instance
        this.mesh.visible = false; // Initially invisible

        this.textMesh = null; // Store the text mesh

        clickableParts[this.mesh.uuid] = this.mesh; // Add to clickable parts

        // Add the shape to the scene
        scene.add(this.mesh);

        // Add text to the center of the shape
        this.addText(scene, name, geometry, textRotation, textPosition);
    }

    // Compute the center of the shape and add text
    addText(scene, text, geometry, textRotation, textPosition) {
        const center = new THREE.Vector3();
        geometry.computeBoundingBox();
        geometry.boundingBox.getCenter(center);

        const fontLoader = new FontLoader();
        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            const textGeometry = new TextGeometry(text, {
                font: font,
                size: 0.03,
                height: 0
            });
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            this.textMesh = new THREE.Mesh(textGeometry, textMaterial);

            // Offset slightly above the shape
            this.textMesh.position.copy(center);
            this.textMesh.position.x -= 0.05 + textPosition.x;
            this.textMesh.position.y += 0.05 + textPosition.y;
            this.textMesh.position.z += 0.05 + textPosition.z;

            // Set initial rotation
            this.textMesh.rotation.x = textRotation.x;
            this.textMesh.rotation.y = textRotation.y;
            this.textMesh.rotation.z = textRotation.z;

            // Initially set visibility
            this.textMesh.visible = this.mesh.visible;

            scene.add(this.textMesh);
        });
    }

    setVisibility(visible) {
        this.mesh.visible = visible;
        if (this.textMesh) {
            this.textMesh.visible = visible;
        }
        this.mesh.material = this.material1; // Reset to initial color
    }

    changeColor() {
        this.mesh.material = this.mesh.material === this.material1 ? this.material2 : this.material1;
    }

    // Methods to rotate text
    rotateTextX(angle) {
        if (this.textMesh) {
            this.textMesh.rotation.x += angle;
        }
    }

    rotateTextY(angle) {
        if (this.textMesh) {
            this.textMesh.rotation.y += angle;
        }
    }

    rotateTextZ(angle) {
        if (this.textMesh) {
            this.textMesh.rotation.z += angle;
        }
    }
}


export let  scene, camera, renderer, controls, raycaster, mouse;
const models = {};
const cameraPositions = {};
const clickableParts = {};
const quads = [];


let initialCameraPositions = {
    'Floor 1': { position: new THREE.Vector3(2.79, 3.62, 3.09), target: new THREE.Vector3( 0.15, 0, 0.72) },
    'Floor 2': { position: new THREE.Vector3(-3.81, 4.57, 3.01), target: new THREE.Vector3(-0.82, 0, -0.61) },
    'Floor 3': { position: new THREE.Vector3(-3.81, 4.57, 3.01), target: new THREE.Vector3(-0.82, 0, -0.61) },
    'Floor 4': { position: new THREE.Vector3(-3.81, 4.57, 3.01), target: new THREE.Vector3(-0.82, 0, -0.61) }
};


function init() {
    // Scene
    scene = new THREE.Scene();
    //scene.background = new THREE.Color(0xa0a0a0);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(3.3, 3, 3);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new MapControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0.75);

    //controls.enableRotate = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Enable damping (inertia) and set damping factor
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    // Optional: further tuning of controls for more "inertial" feel
    controls.rotateSpeed = 0.7;
    controls.zoomSpeed = 0.7;
    controls.panSpeed = 0.7;

    controls.update();

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 5);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight1.position.set(10, 40, 10);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight2.position.set(-10, -40, -10);
    scene.add(directionalLight2);

    const pointLight1 = new THREE.PointLight(0xffffff, 2, 1000);
    pointLight1.position.set(50, 50, 50);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 2, 1000);
    pointLight2.position.set(-50, 50, -50);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffffff, 2, 1000);
    pointLight3.position.set(50, -50, 50);
    scene.add(pointLight3);

    const pointLight4 = new THREE.PointLight(0xffffff, 2, 1000);
    pointLight4.position.set(-50, -50, -50);
    scene.add(pointLight4);


    // Raycaster and mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Loader
    const loader = new FBXLoader();

    // Load models
    loadModel(loader, '/uni_1.fbx', 'Floor 1');
    loadModel(loader, '/uni_2.fbx', 'Floor 2');
    loadModel(loader, '/uni_3.fbx', 'Floor 3');
    loadModel(loader, '/uni_4.fbx', 'Floor 4');

    // Buttons
    // document.getElementById('show_floor_1').addEventListener('click', () => showModel(['Floor 1']));

    // document.getElementById('show_floor_2').addEventListener('click', () => showModel('Floor 2'));
    // document.getElementById('show_floor_3').addEventListener('click', () => showModel('Floor 3'));
    // document.getElementById('show_floor_4').addEventListener('click', () => showModel('Floor 4'));

    // document.getElementById('show_camera_position').addEventListener('click', () => showCameraPosition());

    // Create and position flat quadrilaterals
    create_first_floor();
    create_second_floor();
    create_third_floor();
    create_fourth_floor();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('click', onMouseClick, false);
    window.addEventListener('mousemove', onMouseMove, false);

    window.addEventListener('click', devModelClick, false);

    showModel('Floor 1');

    animate();
}

function create_first_floor() {

    const room_101_coor = [
        { x: 1.4482323087670588, y: 0.002, z: 3.850324320681368 },
        { x: 1.190360783072871, y: 0.002, z: 4.155034101478478 },
        { x: 1.4328647796576521, y: 0.002, z: 4.3594058171772 },
        { x: 1.7526701396098088, y: 0.002, z: 3.977311836344748 },
        { x: 1.5918557468030246, y: 0.002, z: 3.83927799408304 }
    ];
    const room_101 = new CustomShape(scene, room_101_coor, 'Room 101', 'Floor 1');
    quads.push(room_101);

    const room_102_coor = [
        { x: 1.217620468210941, y: 0.002, z: 3.6858189657302174 },
        { x: 0.9759755422286867, y: 0.002, z: 3.9728584574651093},
        { x: 1.1673596294227513, y: 0.002, z: 4.133903711383199 },
        { x: 1.4100467932536775, y: 0.002, z: 3.844196572949911 }
    ];
    const room_102 = new CustomShape(scene, room_102_coor, 'Room 102', 'Floor 1');
    quads.push(room_102);

    const room_103_coor = [
        { x: 0.7614367919494145, y: 0.002, z: 3.294211205413139 },
        { x: 0.5163922476834581,y: 0.002, z: 3.584197937351859 },
        { x: 0.7140383343886788,y: 0.002, z: 3.7488253124816286 },
        { x: 0.9577358662921422, y: 0.002, z: 3.461444391275732 }
    ];
    const room_103 = new CustomShape(scene, room_103_coor, 'Room 103', 'Floor 1');
    quads.push(room_103);

    const room_104_coor = [
        { x: 0.5308913154251094, y: 0.002, z: 3.0973578612684296 },
        { x: 0.28312171678412956,y: 0.002, z: 3.3886136107996165 },
        { x: 0.49387132319070565,y: 0.002, z: 3.566282858520322 },
        { x: 0.7387167409172957, y: 0.002, z: 3.2761964187937953 }
    ];
    const room_104 = new CustomShape(scene, room_104_coor, 'Room 104', 'Floor 1');
    quads.push(room_104);

    const room_105_coor = [
        { x: 0.33514000493191376, y: 0.002, z: 2.419391532211928 },
        { x: -0.16702338884480022,y: 0.002, z: 3.0084893949938247 },
        { x: 0.26116205280538834,y: 0.002, z: 3.3704218363925693 },
        { x: 0.7636705887276485, y: 0.002, z: 2.782724670995163 }
    ];
    const room_105 = new CustomShape(scene, room_105_coor, 'Room 105', 'Floor 1');
    quads.push(room_105);

    const room_106_coor = [
        { x: 1.2343471498125267,y: 0.002, z: 1.3357470164408352 },
        { x: 0.7662933393847344,y: 0.002, z: 1.8892508858423107 },
        { x: 1.2021434328000866,y: 0.002, z: 2.25124330754297 },
        { x: 1.66700548742364,y: 0.002, z: 1.7004499452267985 }
    ];
    const room_106 = new CustomShape(scene, room_106_coor, 'Room 106', 'Floor 1');
    quads.push(room_106);

    const room_107_coor = [
        { x: -0.8329080208503128,y: 0.002, z: 1.512610036263962 },
        { x: -1.2913158400611198,y: 0.002, z: 2.0578689282038254 },
        { x: -0.8621178614218051,y: 0.002, z: 2.4223629827653426 },
        { x: -0.40541515144227824,y: 0.002, z: 1.881251871896406 }
    ];
    const room_107 = new CustomShape(scene, room_107_coor, 'Room 107', 'Floor 1');
    quads.push(room_107);

    const room_108_coor = [
        { x: 0.32807014785912836, y: 0.002, z: 0.5709131960108905 },
        { x: -0.18865946893620533, y: 0.002, z: 1.1796499528584559 },
        { x: 0.24482643910055235, y: 0.002, z: 1.5453443757105887 },
        { x: 0.758901845521841, y: 0.002, z: 0.9345336578901356 }
    ];
    const room_108 = new CustomShape(scene, room_108_coor, 'Room 108', 'Floor 1');
    quads.push(room_108);

    const room_111_coor = [
        { x: -1.1972457808078547, y: 0.002, z: 1.466805889722244 },
        { x: -1.5282681337629505, y: 0.002, z: 1.8604642257512802 },
        { x: -1.3176080670554289, y: 0.002, z: 2.035871698660885 },
        { x: -0.9842853923459474, y: 0.002, z: 1.6475017031806864 }
    ];
    const room_111 = new CustomShape(scene, room_111_coor, 'Room 111', 'Floor 1');
    quads.push(room_111);
}

function create_second_floor () {
    const room_300_coor = [
        { x: -3.306230700346897, y: 0.002, z: 1.6654728619975165 },
        { x: -3.9150247529814735, y: 0.002, z: 1.1568245165433293 },
        { x: -4.313485857162303, y: 0.002, z: 1.628087753404455 },
        { x: -3.7047500941576956, y: 0.002, z: 2.1332624516992906 }
    ];
    const room_300 = new CustomShape(scene, room_300_coor, 'Room 300', 'Floor 3', {x:-Math.PI/2, y:0, z:-Math.PI/180*40}, {x:0.1, y:0, z:-0.07});
    quads.push(room_300);

    const room_301_coor = [
        { x: -3.3408850547095077, y: 0.002, z: 0.9973419188522767 },
        { x: -3.60495984517455, y: 0.002, z: 0.7840687724233167 },
        { x: -3.8231362248760683, y: 0.002, z: 1.0517817390103674 },
        { x: -3.566915340471356, y: 0.002, z: 1.2665740611222052 }
    ];
    const room_301 = new CustomShape(scene, room_301_coor, 'Room 301', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.03, y:0, z:-0.15});
    quads.push(room_301);

    const room_302_coor = [
        { x: -2.800840207506515, y: 0.002, z: 0.7387942125221467 },
        { x: -3.24671799614078, y: 0.002, z: 0.366264683167641 },
        { x: -3.467460757385681, y: 0.002, z: 0.6319086132310927 },
        { x: -3.025897717644717, y: 0.002, z: 1.0022218764417938 }
    ];
    const room_302 = new CustomShape(scene, room_302_coor, 'Room 302', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.03, y:0, z:-0.15});
    quads.push(room_302);

    const room_303_coor = [
        { x: -2.614758961319627, y: 0.002, z: 0.5232046784826306 },
        { x: -3.066948257885804, y: 0.002, z: 0.1454711744442151 },
        { x: -3.232808762149072, y: 0.002, z: 0.34234076564538024 },
        { x: -2.783877359281384, y: 0.002, z: 0.7246472497988722 }
    ];
    const room_303 = new CustomShape(scene, room_303_coor, 'Room 303', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.03, y:0, z:-0.15});
    quads.push(room_303)

    const room_304_coor = [
        { x: -2.4065805488682472, y: 0.002, z: 0.27523645350774095 },
        { x: -2.8643040811875013, y: 0.002, z: -0.09505911169545146 },
        { x: -3.0540465197038182, y: 0.002, z: 0.1301573418941166 },
        { x: -2.604166538190314, y: 0.002, z: 0.5105877020166673 }
    ];
    const room_304 = new CustomShape(scene, room_304_coor, 'Room 304', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.03, y:0, z:-0.15});
    quads.push(room_304);

    const room_305_coor = [
        { x: -2.180658778786707, y: 0.002, z: 0.007222647876093125 },
        { x: -2.6331367094183307, y: 0.002, z: -0.3694452637454081 },
        { x: -2.850162045307092, y: 0.002, z: -0.11184513192455879 },
        { x: -2.3990558628256826, y: 0.002, z: 0.2662735446468133 }
    ];
    const room_305 = new CustomShape(scene, room_305_coor, 'Room 305', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.03, y:0, z:-0.15});
    quads.push(room_305);

    const room_306_coor = [
        { x: -2.041857432405172, y: 0.002, z: -0.457318378533321 },
        { x: -2.345642358052814, y: 0.002, z: -0.7110237379698608 },
        { x: -2.5100061928777113, y: 0.002, z: -0.5226159152946867 },
        { x: -2.1997593953443575, y: 0.002, z: -0.26136392200246394 }
    ];
    const room_306 = new CustomShape(scene, room_306_coor, 'Room 306', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.03, y:0, z:-0.15});
    quads.push(room_306);

    const room_307_coor = [
        { x: -1.232166185729808, y: 0.002, z: -1.1188071127943136 },
        { x: -1.682596376393088, y: 0.002, z: -1.4976974861921948 },
        { x: -2.0507387727906505, y: 0.002, z: -1.0607276279687619 },
        { x: -1.5962021828419621, y: 0.002, z: -0.6840641007986764 }
    ];
    const room_307 = new CustomShape(scene, room_307_coor, 'Room 307', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.03, y:0, z:-0.15});
    quads.push(room_307);

    const room_308_coor = [
        { x: -1.0283952689688995, y: 0.002, z: -1.3622282386804623 },
        { x: -1.4767944363810157, y: 0.002, z: -1.7419759176593228 },
        { x: -1.6699226919158912, y: 0.002, z: -1.5127406292066838 },
        { x: -1.2194474404419045, y: 0.002, z: -1.134207368178688 }
    ];
    const room_308 = new CustomShape(scene, room_308_coor, 'Room 308', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.03, y:0, z:-0.15});
    quads.push(room_308);

    const room_312_coor = [
        { x: 0.21513716852732895, y: 0.002, z: -0.3169643611154631 },
        { x: -0.26214759819508243, y: 0.002, z: -0.7169110105860077 },
        { x: -0.4535058883225546, y: 0.002, z: -0.4901109275341417 },
        { x: 0.02252283541904627, y: 0.002, z: -0.08833956830238833 }
    ];
    const room_312 = new CustomShape(scene, room_312_coor, 'Room 312', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.03, y:0, z:-0.15});
    quads.push(room_312);

    const room_313_coor = [
        { x: 0.012848360282920981, y: 0.002, z: -0.0768563874508032 },
        { x: -0.4664386448149808, y: 0.002, z: -0.4769236322060486 },
        { x: -0.8338359655129465, y: 0.002, z: -0.037087038577305456 },
        { x: -0.3570923036329715, y: 0.002, z: 0.362247017709309 }
    ]
    const room_313 = new CustomShape(scene, room_313_coor, 'Room 313', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.03, y:0, z:-0.15});
    quads.push(room_313)

    const room_314_coor = [
        { x: -0.37071064158620026, y: 0.002, z: 0.3784113896052588 },
        { x: -0.8443707749376514, y: 0.002, z: -0.024777576081088666 },
        { x: -1.012883952317815, y: 0.002, z: 0.17618300969470505 },
        { x: -0.5393822313304065, y: 0.002, z: 0.5786171910278503 }
    ];
    const room_314 = new CustomShape(scene, room_314_coor, 'Room 314', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.03, y:0, z:-0.15});
    quads.push(room_314);

    const room_316_coor = [
        { x: -0.9397809132450958, y: 0.002, z: 1.0538729316815414 },
        { x: -1.4207217282343563, y: 0.002, z: 0.6486448728494905 },
        { x: -1.64297879576638, y: 0.002, z: 0.9106020212176935 },
        { x: -1.1613220779174982, y: 0.002, z: 1.3168326100521948 }
    ];
    const room_316 = new CustomShape(scene, room_316_coor, 'Room 316', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.03, y:0, z:-0.15});
    quads.push(room_316);

    const room_317_coor = [
        { x: -1.1731576139220228, y: 0.002, z: 1.3308808762821558 },
        { x: -1.653780954756136, y: 0.002, z: 0.9234688389923718 },
        { x: -1.8452834584847302, y: 0.002, z: 1.1515739303460166 },
        { x: -1.362958111724222, y: 0.002, z: 1.5561657738883758 }
    ];
    const room_317 = new CustomShape(scene, room_317_coor, 'Room 317', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.03, y:0, z:-0.15});
    quads.push(room_317);

    const room_318_coor = [
        { x: -1.3752245371553575, y: 0.002, z: 1.5707254842415967 },
        { x: -1.859160453393654, y: 0.002, z: 1.168103272680192 },
        { x: -2.023008107016663, y: 0.002, z: 1.3632676179178416 },
        { x: -1.5399358916967965, y: 0.002, z: 1.7662306654714834 }
    ];
    const room_318 = new CustomShape(scene, room_318_coor, 'Room 318', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.03, y:0, z:-0.15});
    quads.push(room_318);

    const room_320_coor = [
        { x: -1.9160386367227107, y: 0.002, z: 2.212648186660854 },
        { x: -2.212366941298269, y: 0.002, z: 1.968901179358224 },
        { x: -2.4268530159520174, y: 0.002, z: 2.2243827327191514 },
        { x: -2.135721207002697, y: 0.002, z: 2.4734017898779053 }
    ];
    const room_320 = new CustomShape(scene, room_320_coor, 'Room 320', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.03, y:0, z:-0.15});
    quads.push(room_320);

    const room_321_coor = [
        { x: -2.226371930469941, y: 0.002, z: 2.5810002436553763 },
        { x: -2.7106761795258665, y: 0.002, z: 2.1775092818738715 },
        { x: -3.103848212218076, y: 0.002, z: 2.6483790957730675 },
        { x: -2.6228444821965287, y: 0.002, z: 3.0515958369447036 }
    ];
    const room_321 = new CustomShape(scene, room_321_coor, 'Room 321', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.03, y:0, z:-0.15});
    quads.push(room_321);

    const room_3_1_coor = [
        { x: -2.873702961413585, y: 0.002, z: 1.4025463253223196 },
        { x: -3.0536549239145914, y: 0.002, z: 1.2515896310840373 },
        { x: -3.1960877489160278, y: 0.002, z: 1.4212459999715465 },
        { x: -3.015213647144131, y: 0.002, z: 1.5719645331738588 }
    ];
    const room_3_1 = new CustomShape(scene, room_3_1_coor, 'Room 3.1', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.02, y:0, z:-0.1});
    quads.push(room_3_1);

    const room_3_2_coor = [
        { x: -1.783710632845977, y: 0.002, z: 0.9031940368858328 },
        { x: -1.9616515590818007, y: 0.002, z: 0.7528391937870939 },
        { x: -2.1036110465986497, y: 0.002, z: 0.9220526729645109 },
        { x: -1.9250512709503484, y: 0.002, z: 1.0719598047569214 }
    ];
    const room_3_2 = new CustomShape(scene, room_3_2_coor, 'Room 3.2', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.02, y:0, z:-0.1});
    quads.push(room_3_2);

    const room_3_3_coor = [
        { x: -1.5447099976933794, y: 0.002, z: -0.17527952931992086 },
        { x: -1.7238287193077895, y: 0.002, z: -0.3253564805683079 },
        { x: -1.8665601102341907, y: 0.002, z: -0.15574945710864754 },
        { x: -1.6883822612632704, y: 0.002, z: -0.004680510426144892 }
    ];
    const room_3_3 = new CustomShape(scene, room_3_3_coor, 'Room 3.3', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.02, y:0, z:-0.1});
    quads.push(room_3_3);

    const room_3_4_coor = [
        { x: -0.6908422420518106, y: 0.002, z: -0.3943904839715478 },
        { x: -0.8699812174640239, y: 0.002, z: -0.5437118320446107 },
        { x: -1.0131425286028086, y: 0.002, z: -0.3749510071797425 },
        { x: -0.8329301493692587, y: 0.002, z: -0.22303458243743218 }
    ];
    const room_3_4 = new CustomShape(scene, room_3_4_coor, 'Room 3.4', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.02, y:0, z:-0.1});
    quads.push(room_3_4);

    const room_3_5_coor = [
        { x: 1.1156785710847177, y: 0.002, z: -0.6051862448709971 },
        { x: 1.1162860339437086, y: 0.002, z: -0.8296507451406897 },
        { x: 0.9337249261911087, y: 0.002, z: -0.830151806765391 },
        { x: 0.93394785725688, y: 0.002, z: -0.604015039751386 }
    ];
    const room_3_5 = new CustomShape(scene, room_3_5_coor, 'Room 3.5', 'Floor 3', { x: - Math.PI / 2, y: 0, z: -Math.PI / 180 * 40}, {x:0.02, y:0, z:-0.1});
    quads.push(room_3_5);
}

function create_third_floor () {

}

function create_fourth_floor () {

}

function loadModel(loader, path, name) {
    loader.load(path, (object) => {
        object.name = name;
        object.scale.set(0.01, 0.01, 0.01); // Adjust model scale if needed
        // object.position.set(0, 0, 0);
        // object.rotation.set(0, 0, 0);
        object.visible = false;

        // Traverse the object to apply edge highlighting and transparency
        object.traverse((child) => {
            if (child.isMesh) {
                child.material.color.set(0x423e52);
                child.material.transparent = true;
                child.material.opacity = 0.75;

                const edges = new THREE.EdgesGeometry(child.geometry);
                const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x3e4452 }));
                // const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
                child.add(line);
            }
        })

        scene.add(object);
        models[name] = object;

        // Initialize camera position for the model
        cameraPositions[name] = {
            position: initialCameraPositions[name].position.clone(),
            target: initialCameraPositions[name].target.clone()
        };
    });
}


export function showModel(names) {
    if (!Array.isArray(names)) {
        names = [names];
    }

    Object.keys(models).forEach(key => {
        if (models[key].visible) {
            cameraPositions[key] = {
                position: camera.position.clone(),
                target: controls.target.clone()
            };
        }
    });

    Object.keys(models).forEach(key => {
        const modelVisible = names.includes(key);
        models[key].visible = modelVisible;

        quads.forEach(quad => {
            if (quad.mesh.userData.associatedModel === key) {
                quad.setVisibility(modelVisible);

                if (modelVisible) {
                    clickableParts[quad.mesh.uuid] = quad.mesh;
                } else {
                    delete clickableParts[quad.mesh.uuid];
                }
            }
        });
    });

    if (cameraPositions[names[0]]) {
        camera.position.copy(cameraPositions[names[0]].position);
        controls.target.copy(cameraPositions[names[0]].target);
        controls.update();
    }

    onMouseMove(mouse);
}




export function highlightQuadByName(name) {
    quads.forEach(quad => {
        if (quad.mesh.userData.name === name) {
            quad.changeColor();

            // Center and scale the camera on the highlighted quad
            const center = new THREE.Vector3();
            quad.mesh.geometry.computeBoundingBox();
            quad.mesh.geometry.boundingBox.getCenter(center);

            // Calculate bounding box size to adjust camera distance
            const size = new THREE.Vector3();
            quad.mesh.geometry.boundingBox.getSize(size);

            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));

            // Adjust for aspect ratio
            cameraZ *= (window.innerWidth / window.innerHeight);

            // Apply a scaling factor to pull the camera further back
            const scalingFactor = 4;
            cameraZ *= scalingFactor;

            // Set the new camera position
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            const newCameraPosition = center.clone().add(direction.negate().multiplyScalar(cameraZ));

            camera.position.copy(newCameraPosition);
            controls.target.copy(center);
            controls.update();
        }
    });
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects(Object.values(clickableParts), true);

    if (intersects.length > 0) {
        const intersected = intersects[0].object;
        if (intersected.userData.isQuad) {
            const associatedModel = intersected.userData.associatedModel;
        }
    }
}

function devModelClick(event) {
    // Calculate mouse position in normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects(Object.values(models), true);

    if (intersects.length > 0) {

    }
}



function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects(Object.values(clickableParts), true);

    // Reset all quads to initial color
    Object.values(clickableParts).forEach(part => {
        if (part.userData.isQuad) {
            part.material = part.userData.quad.material1;
        }
    });

    if (intersects.length > 0) {
        const intersected = intersects[0].object;
        if (intersected.userData.isQuad) {
            intersected.userData.quad.changeColor();
        }
    }
}



function animate() {
    requestAnimationFrame(animate);
    controls.update();
    //console.log(camera.position)
    renderer.render(scene, camera);
}


init();

