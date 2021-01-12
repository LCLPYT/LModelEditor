import * as THREE from 'three';
import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls';
import { TransformControls } from '../../node_modules/three/examples/jsm/controls/TransformControls';

let orbitControls: OrbitControls;
let transformControls: TransformControls;

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

export function updateControls() {
    if(orbitControls === undefined) throw new Error("Call before init");
    orbitControls.update();
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