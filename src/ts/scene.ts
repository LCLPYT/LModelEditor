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
    fetchJson('resource/dummy.json', (status, response) => {
        if(status !== 200) {
            console.error("An error occured. HTTP " + status);
            return;
        }

        let model = <LModel> response;
        loadModel(model);
    });
}

function loadModel(model: LModel) {
    model.renderers.forEach(addRenderer);
}

function addRenderer(renderer: ModelRenderer) {
    renderer.children.forEach(addRenderer);
    renderer.cubes.forEach(cube => addCube(cube, renderer));
}

function addCube(cube: Cube, renderer: ModelRenderer) {
    const geometry = new THREE.BoxGeometry(cube.dimensions.x, cube.dimensions.y, cube.dimensions.z);
    const material = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(fixCubeCoordinates(convertCoordinates(cube.position), cube.dimensions)).add(fixRotationPoint(convertCoordinates(renderer.rotationPoint)));

    let pivotPoint = new THREE.Vector3(
        mesh.position.x - cube.dimensions.x / 2,
        mesh.position.y - cube.dimensions.y / 2,
        mesh.position.z + cube.dimensions.z / 2
    );

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

function fixCubeCoordinates(vec: THREE.Vector3, dimensions: THREE.Vector3): THREE.Vector3 {
    return new THREE.Vector3(
        vec.x + dimensions.x / 2 - 0.5,
        vec.y - dimensions.y / 2 + 0.5,
        vec.z - dimensions.z / 2 - 0.5
    );
}

function convertCoordinates(vec: THREE.Vector3): THREE.Vector3 {
    return new THREE.Vector3(
        vec.x + 0.25, 
        -vec.y, 
        -vec.z + 0.25
    );
}

function fixRotationPoint(vec: THREE.Vector3): THREE.Vector3 {
    return new THREE.Vector3(
        vec.x,
        vec.y + 23.5,
        vec.z
    );
}

export function setSelected(obj: THREE.Object3D, reset: boolean) {
    if(reset) selectedObjects = [];
    if(obj != null) selectedObjects.push(obj);
    setSelectedObjects(selectedObjects);
}