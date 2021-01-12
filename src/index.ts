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
    
    orbitControls = new OrbitControls(camera, canvas);
    orbitControls.enableDamping = true;
    orbitControls.enableKeys = true;
    orbitControls.minDistance = 1;
    orbitControls.maxDistance = 100;

    initScene();
}

function initScene() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const light = new THREE.PointLight(0xffffff, 0.7);
    light.position.set(5, 7, 10);
    scene.add(light);

    addCube();
}

function addCube() {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    orbitControls.update();
}

init();
animate();