import * as THREE from 'three';
import { transformObject } from './controls';

export let scene: THREE.Scene;
export let camera: THREE.PerspectiveCamera;

export function initScene() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
}

export function fitCameraToWindow() {
    if(camera === undefined) throw new Error("Call before init");

    const aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
}

export function populateScene() {
    if(scene === undefined) throw new Error("Call before init");

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const light = new THREE.PointLight(0xffffff, 0.7);
    light.position.set(5, 7, 10);
    scene.add(light);

    scene.add(new THREE.GridHelper(10, 10, 0x888888, 0x444444));

    addCube();
}

function addCube() {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    transformObject(cube);
}