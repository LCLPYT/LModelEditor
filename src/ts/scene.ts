import * as THREE from 'three';
import { Cube } from './data/Cube';
import { LModel } from './data/LModel';
import { ModelRenderer } from './data/ModelRenderer';
import { convertModelToJson, fetchJson, getDefaultModel, loadModelFromJson } from './loader';
import { setSelectedObjects } from './render';

export let scene: THREE.Scene;
export let camera: THREE.PerspectiveCamera;
export let objects: THREE.Object3D[] = [];
let selectedObjects: THREE.Object3D[] = [];
let model: LModel;

export const AXIS_X = new THREE.Vector3(1, 0, 0);
export const AXIS_Y = new THREE.Vector3(0, 1, 0);
export const AXIS_Z = new THREE.Vector3(0, 0, 1);

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

    scene.add(new THREE.GridHelper(16, 16, 0x888888, 0x444444));

    // loadModel(getDefaultModel());
    fetchJson('resource/creeper.json', (status, response) => {
        if(status !== 200) {
            console.error("An error occured. HTTP " + status);
            return;
        }

        let model = <LModel> response;
        loadModel(model);
    });
}

function loadModel(model: LModel) {
    if(model.initialTranslation === undefined) model.initialTranslation = new THREE.Vector3(0, -1.5, 0);
    model.renderers.forEach(r => addRenderer(r, model));
}

function addRenderer(renderer: ModelRenderer, model: LModel) {
    renderer.children.forEach(r => addRenderer(r, model));
    renderer.cubes.forEach(cube => addCube(cube, renderer, model));

    const rotPoint = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    rotPoint.position.set(
        // axis direction           | initial offset
        ( renderer.rotationPoint.x) + ( model.initialTranslation.x * 16),
        (-renderer.rotationPoint.y) + (-model.initialTranslation.y * 16),
        (-renderer.rotationPoint.z) + (-model.initialTranslation.z * 16)
    );

    scene.add(rotPoint);
}

function addCube(cube: Cube, renderer: ModelRenderer, model: LModel) {
    const geometry = new THREE.BoxGeometry(cube.dimensions.x, cube.dimensions.y, cube.dimensions.z);
    const material = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
        // axis direction  |  cube center to begin vertex  | offset correction
        ( cube.position.x) + (cube.dimensions.x / 2 - 0.5) + (0.5),
        (-cube.position.y) - (cube.dimensions.y / 2 + 0.5) + (0.5),
        (-cube.position.z) - (cube.dimensions.z / 2 - 0.5) - (0.5)
    );

    let pivotPoint = new THREE.Vector3(
        // axis direction           | initial offset
        ( renderer.rotationPoint.x) + ( model.initialTranslation.x * 16),
        (-renderer.rotationPoint.y) + (-model.initialTranslation.y * 16),
        (-renderer.rotationPoint.z) + (-model.initialTranslation.z * 16)
    );

    mesh.position.add(pivotPoint);

    const eulerRotation = new THREE.Euler(
        renderer.rotation.x,
        -renderer.rotation.y,
        -renderer.rotation.z,
        'ZYX'
    );

    mesh.position.sub(pivotPoint);
    mesh.position.applyEuler(eulerRotation);
    mesh.position.add(pivotPoint);

    mesh.setRotationFromEuler(eulerRotation);

    scene.add(mesh);
    objects.push(mesh);
}

export function setSelected(obj: THREE.Object3D, reset: boolean) {
    if(reset) selectedObjects = [];
    if(obj != null) selectedObjects.push(obj);
    setSelectedObjects(selectedObjects);
}