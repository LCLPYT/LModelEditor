import * as THREE from 'three';
import './style.css';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls';
import { TransformControls } from '../node_modules/three/examples/jsm/controls/TransformControls';
import { GUI } from '../node_modules/three/examples/jsm/libs/dat.gui.module';

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let canvas: HTMLCanvasElement;
let orbitControls: OrbitControls;
let transformControls: TransformControls;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    canvas = renderer.domElement;
    document.body.appendChild(canvas);

    initControls();
    
    window.addEventListener('resize', () => {
        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        render();
    });

    initScene();
}

function initControls() {
    orbitControls = new OrbitControls(camera, canvas);
    orbitControls.enableDamping = true;
    orbitControls.enableKeys = true;
    orbitControls.minDistance = 1;
    orbitControls.maxDistance = 100;
    orbitControls.update();

    transformControls = new TransformControls(camera, canvas);
    transformControls.addEventListener('dragging-changed', event => orbitControls.enabled = !event.value);

    window.addEventListener('keydown', event => {
        if(event.defaultPrevented) return;

        let code = undefined;
        if(event.key !== undefined) code = event.key;
        else if(event.code !== undefined) code = event.code;
        else if(event.keyCode !== undefined) code = event.keyCode;
        console.log(event.key, event.code, event.keyCode);

        if(handleKeyDown(code)) event.preventDefault();
    }, true);
    window.addEventListener('keyup', event => {
        if(event.defaultPrevented) return;

        let code = undefined;
        if(event.key !== undefined) code = event.key;
        else if(event.code !== undefined) code = event.code;
        else if(event.keyCode !== undefined) code = event.keyCode;

        if(handleKeyUp(code)) event.preventDefault();
    });
}

function handleKeyDown(code: string|number): boolean {
    if(code === undefined) return false;
    if(code === "r" || code === "KeyR" || code === 82) {
        transformControls.setMode('rotate');
        return false;
    }
    else if(code === "t" || code === "KeyT" || code === 84) {
        transformControls.setMode('translate');
        return true;
    }
    else if(code === "s" || code === "KeyS" || code === 83) {
        transformControls.setMode('scale');
        return true;
    }
    else if(code === "Shift" || code === "ShiftLeft" || code === 16) {
        transformControls.setTranslationSnap(0.5);
        transformControls.setRotationSnap(THREE.MathUtils.degToRad(45));
        transformControls.setScaleSnap(0.25);
        return true;
    }
    return false;
}

function handleKeyUp(code: string|number): boolean {
    if(code === undefined) return false;
    if(code === "Shift" || code === "ShiftLeft" || code === 16) {
        transformControls.setTranslationSnap(null);
        transformControls.setRotationSnap(null);
        transformControls.setScaleSnap(null);
        return true;
    }
    return false;
}

function initScene() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const light = new THREE.PointLight(0xffffff, 0.7);
    light.position.set(5, 7, 10);
    scene.add(light);

    scene.add(new THREE.GridHelper(10, 10, 0x888888, 0x444444));

    scene.add(<THREE.Object3D> <unknown> transformControls);

    addCube();
}

function addCube() {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    transformControls.attach(cube);
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    orbitControls.update();
}

init();
render();