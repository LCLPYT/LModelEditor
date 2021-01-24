import * as THREE from 'three';
import { LModel } from './data/LModel';
import { SceneModel } from './data/SceneModel';
import { setSelectableObjects, setSelectedObjects } from './render';

export let scene: THREE.Scene;
export let camera: THREE.PerspectiveCamera;
export let objects: THREE.Object3D[] = [];
let selectedObjects: THREE.Object3D[] = [];
export let model: SceneModel | null;

export const AXIS_X = new THREE.Vector3(1, 0, 0);
export const AXIS_Y = new THREE.Vector3(0, 1, 0);
export const AXIS_Z = new THREE.Vector3(0, 0, 1);

export function initScene() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-22.7, 27.7, 33.4);
    camera.rotation.set(-0.57, -0.5, -0.3);
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
    loadModel('creeper');
}

export function loadModel(modelName: string | LModel) {
    const sceneModel = new SceneModel();

    let modelPromise: Promise<LModel>;
    let texturePromise: Promise<THREE.Texture>;

    if(typeof modelName === 'string') {
        modelPromise = sceneModel.loadModel(`resource/${modelName}.json`);
        texturePromise = sceneModel.loadTexture(`resource/${modelName}.png`);
    }
    else if(modelName instanceof LModel) {
        modelPromise = sceneModel.loadModel(modelName);
        if (modelName.texture !== undefined && modelName.texture !== null) texturePromise = sceneModel.loadTexture(modelName.texture);
        else texturePromise = sceneModel.loadTexture('resource/missing.png');
    } else throw new Error('Unimplemented.');

    Promise.all([
        modelPromise,
        texturePromise
    ]).then(() => {
        sceneModel.init();
        scene.add(sceneModel);
        objects.push(...sceneModel.cubes);
        objects.push(...sceneModel.pivotPoints);
    }, error => {
        console.error("Error, some loading promises were rejected.", error);
    }).catch(error => {
        console.error("Error loading model: ", error)
    });

    model = sceneModel;
}

export function removeModel() {
    if(model === null) return;

    scene.remove(model);
    objects = [];

    model = null;
}

export function changeMaterial(standard: boolean) {
    if(model !== null) model.changeMaterial(standard);
}

export function setSelected(obj: THREE.Object3D | null, reset: boolean) {
    if(reset) selectedObjects = [];
    if(obj !== null) selectedObjects.push(obj);
    setSelectedObjects(selectedObjects);
}

export function setSelectable(obj: THREE.Object3D | null, reset: boolean) {
    if(reset) selectedObjects = [];
    if(obj !== null) selectedObjects.push(obj);
    setSelectableObjects(selectedObjects);
}