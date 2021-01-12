import * as THREE from 'three';
import { Cube } from './data/Cube';
import { LModel } from './data/LModel';
import { ModelRenderer } from './data/ModelRenderer';
import { getDefaultModel } from './loader';
import { setSelectedObjects } from './render';

export let scene: THREE.Scene;
export let camera: THREE.PerspectiveCamera;
export let objects: THREE.Object3D[] = [];
let selectedObjects: THREE.Object3D[] = [];
let model: LModel;

export function initScene() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-2.5, 2, 3.75);
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

    loadModel(getDefaultModel());
}

function loadModel(model: LModel) {
    model.renderers.forEach(addRenderer);
}

function addRenderer(renderer: ModelRenderer) {
    renderer.children.forEach(addRenderer);
    renderer.cubes.forEach(addCube);
}

function addCube(cube: Cube) {
    const geometry = new THREE.BoxGeometry(cube.dimensions.x, cube.dimensions.y, cube.dimensions.z);
    const material = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(cube.position);
    scene.add(mesh);
    objects.push(mesh);
}

export function setSelected(obj: THREE.Object3D, reset: boolean) {
    if(reset) selectedObjects = [];
    if(obj != null) selectedObjects.push(obj);
    setSelectedObjects(selectedObjects);
}