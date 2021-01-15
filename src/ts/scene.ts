import * as THREE from 'three';
import { Cube } from './data/Cube';
import { LModel } from './data/LModel';
import { ModelRenderer } from './data/ModelRenderer';
import { convertModelToJson, fetchJson, getDefaultModel, loadModelFromJson, loadSkin } from './loader';
import { setSelectableObjects, setSelectedObjects } from './render';

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

    // loadModel(getDefaultModel());

    let modelName = 'boat';

    fetchJson(`resource/${modelName}.json`, (status, response) => {
        if(status !== 200) {
            console.error("An error occured. HTTP " + status);
            return;
        }

        const canvas = document.createElement("canvas");
		const texture = new THREE.Texture(canvas);
		texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        loadSkin(`resource/${modelName}.png`, canvas, texture);

        let model = <LModel> response;
        loadModel(model, texture);
    });
}

function loadModel(model: LModel, texture: THREE.Texture) {
    if(model.initialTranslation === undefined) model.initialTranslation = new THREE.Vector3(0, -1.5, 0);
    model.renderers.forEach(r => addRenderer(r, model, texture));
}

function addRenderer(renderer: ModelRenderer, model: LModel, texture: THREE.Texture) {
    renderer.children.forEach(r => addRenderer(r, model, texture));
    renderer.cubes.forEach(cube => addCube(cube, renderer, model, texture));

    const rotPoint = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    rotPoint.position.set(
        // axis direction           | initial offset
        ( renderer.rotationPoint.x) + ( model.initialTranslation.x * 16),
        (-renderer.rotationPoint.y) + (-model.initialTranslation.y * 16),
        (-renderer.rotationPoint.z) + (-model.initialTranslation.z * 16)
    );

    scene.add(rotPoint);
}

function addCube(cube: Cube, renderer: ModelRenderer, model: LModel, texture: THREE.Texture) {
    const geometry = new THREE.BoxGeometry(cube.dimensions.x, cube.dimensions.y, cube.dimensions.z);
    setUVs(geometry, cube.texture.offsetX, cube.texture.offsetY, cube.dimensions.x, cube.dimensions.y, cube.dimensions.z, cube.texture.width, cube.texture.height);

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        alphaTest: 1e-5
    });
    // const material = new THREE.MeshStandardMaterial({
    //     color: 0xaaaaaa
    // });
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

/**
 * Source: https://github.com/bs-community/skinview3d/blob/f5c7692c8d1b63631ab016d7873ddbdf12326cbc/src/model.ts
 */
function setUVs(box: THREE.BoxGeometry, u: number, v: number, width: number, height: number, depth: number, textureWidth: number, textureHeight: number): void {
	const toFaceVertices = (x1: number, y1: number, x2: number, y2: number) => [
		new THREE.Vector2(x1 / textureWidth, 1.0 - y2 / textureHeight),
		new THREE.Vector2(x2 / textureWidth, 1.0 - y2 / textureHeight),
		new THREE.Vector2(x2 / textureWidth, 1.0 - y1 / textureHeight),
		new THREE.Vector2(x1 / textureWidth, 1.0 - y1 / textureHeight)
    ];
    
	const top = toFaceVertices(u + depth, v, u + width + depth, v + depth);
	const bottom = toFaceVertices(u + width + depth, v, u + width * 2 + depth, v + depth);
	const left = toFaceVertices(u, v + depth, u + depth, v + depth + height);
	const front = toFaceVertices(u + depth, v + depth, u + width + depth, v + depth + height);
	const right = toFaceVertices(u + width + depth, v + depth, u + width + depth * 2, v + height + depth);
    const back = toFaceVertices(u + width + depth * 2, v + depth, u + width * 2 + depth * 2, v + height + depth);
    
	box.faceVertexUvs[0] = [
		[right[3], right[0], right[2]],
		[right[0], right[1], right[2]],
		[left[3], left[0], left[2]],
		[left[0], left[1], left[2]],
		[top[3], top[0], top[2]],
		[top[0], top[1], top[2]],
		[bottom[0], bottom[3], bottom[1]],
		[bottom[3], bottom[2], bottom[1]],
		[front[3], front[0], front[2]],
		[front[0], front[1], front[2]],
		[back[3], back[0], back[2]],
		[back[0], back[1], back[2]]
	];
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