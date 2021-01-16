import * as THREE from 'three';
import { SceneModel } from './data/SceneModel';
import { setSelectableObjects, setSelectedObjects } from './render';

export let scene: THREE.Scene;
export let camera: THREE.PerspectiveCamera;
export let objects: THREE.Object3D[] = [];
let selectedObjects: THREE.Object3D[] = [];
let models: SceneModel[] = [];

export const AXIS_X = new THREE.Vector3(1, 0, 0);
export const AXIS_Y = new THREE.Vector3(0, 1, 0);
export const AXIS_Z = new THREE.Vector3(0, 0, 1);

export function initScene() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-2.5, 2, 3.75);
    scene.add(camera);
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
    light.position.set(0, 1, 0);
    camera.add(light);

    scene.add(new THREE.GridHelper(16, 16, 0x888888, 0x444444));

    // addModel('boat');
    addModel('creeper');
}

function addModel(modelName: string) {
    const sceneModel = new SceneModel();

    Promise.all([
        sceneModel.loadModel(`resource/${modelName}.json`),
        sceneModel.loadTexture(`resource/${modelName}.png`)
    ]).then(() => {
        sceneModel.init();
        scene.add(sceneModel);
        objects.push(...sceneModel.activeObjects);
    }, error => {
        console.error("Error, some loading promises were rejected.", error);
    }).catch(error => {
        console.error("Error loading model: ", error)
    });

    models.push(sceneModel);
}

export function changeMaterial(standard: boolean) {
    models.forEach(model => model.changeMaterial(standard));
}

export function setSelected(obj: THREE.Object3D, reset: boolean) {
    if(reset) selectedObjects = [];
    if(obj != null) selectedObjects.push(obj);
    setSelectedObjects(selectedObjects);
}

export function setSelectable(obj: THREE.Object3D, reset: boolean) {
    if(reset) selectedObjects = [];
    if(obj != null) selectedObjects.push(obj);
    setSelectableObjects(selectedObjects);
}