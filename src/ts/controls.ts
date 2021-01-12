import * as THREE from 'three';
import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls';
import { TransformControls } from '../../node_modules/three/examples/jsm/controls/TransformControls';
import { objects, setSelected } from './scene';

let orbitControls: OrbitControls;
let transformControls: TransformControls;
let rayCaster: THREE.Raycaster;
let mouse: THREE.Vector2;
let objectsTransformControl = [];

export function initControls(canvas: HTMLCanvasElement, camera: THREE.Camera, scene: THREE.Scene) {
    orbitControls = new OrbitControls(camera, canvas);
    orbitControls.enableDamping = true;
    orbitControls.enableKeys = true;
    orbitControls.minDistance = 1;
    orbitControls.maxDistance = 100;
    orbitControls.update();

    transformControls = new TransformControls(camera, canvas);
    transformControls.addEventListener('dragging-changed', event => orbitControls.enabled = !event.value);
    scene.add(<THREE.Object3D> <unknown> transformControls);
    transformControls.traverse(obj => objectsTransformControl.push(obj));

    rayCaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('keydown', event => {
        if(event.defaultPrevented) return;

        let code = undefined;
        if(event.key !== undefined) code = event.key;
        else if(event.code !== undefined) code = event.code;
        else if(event.keyCode !== undefined) code = event.keyCode;
        // console.log(event.key, event.code, event.keyCode);

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
    window.addEventListener('pointermove', event => {
        if(event.isPrimary === false) return;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        checkIntersections(camera, false);
    }, false);
    canvas.addEventListener('pointerdown', event => {
        checkIntersections(camera, true);
    }, false);
}

export function updateControls() {
    if(orbitControls === undefined) throw new Error("Call before init");
    orbitControls.update();
}

function checkIntersections(camera: THREE.Camera, clicked: boolean) {
    rayCaster.setFromCamera(mouse, camera);

    const intersects = rayCaster.intersectObjects(objects);
    if (intersects.length > 0) {
        const selected = intersects[0].object;
        setSelected(selected, true);
        if(clicked) select(selected);
    } else {
        if(transformControls.axis !== null) return;
        setSelected(null, true);
        if(clicked) selectNothing();
    }
}

function select(obj: THREE.Object3D) {
    transformControls.attach(obj);
}

function selectNothing() {
    transformControls.detach();
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

export function transformObject(obj: THREE.Object3D) {
    if(transformControls === undefined) throw new Error("Call before init");
    transformControls.attach(obj);
}

export function isTransformControlObject(obj: THREE.Object3D) {
    return obj !== null && objectsTransformControl.includes(obj);
}