import * as THREE from 'three';
import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls';
import { TransformControls } from '../../node_modules/three/examples/jsm/controls/TransformControls';
import { Bootstrap } from '../js/bootstrap';
import { Highlight } from '../js/Highlight';
import { copyTextToClipboard, downloadModelJson, selectElement } from './helper';
import { convertModelToJson, loadModel, loadTextureFromUpload } from './loader';
import { objects, setSelectable, setSelected, model as sceneModel, removeModel, loadModel as addModel } from './scene';

let orbitControls: OrbitControls;
let transformControls: TransformControls;
let rayCaster: THREE.Raycaster;
let mouse: THREE.Vector2;
let objectsTransformControl: THREE.Object3D[] = [];
let mouseDownPointer: THREE.Vector2 = new THREE.Vector2(0, 0);

export function initControls(canvas: HTMLCanvasElement, camera: THREE.Camera, scene: THREE.Scene) {
    orbitControls = new OrbitControls(camera, canvas);
    orbitControls.enableDamping = true;
    orbitControls.enableKeys = true;
    orbitControls.minDistance = 1;
    orbitControls.maxDistance = 100;
    orbitControls.target.set(0, 8, 0);
    orbitControls.update();

    transformControls = new TransformControls(camera, canvas);
    transformControls.addEventListener('dragging-changed', event => orbitControls.enabled = !event.value);
    scene.add(<THREE.Object3D> <unknown> transformControls);
    transformControls.traverse(obj => objectsTransformControl.push(obj));

    rayCaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    registerUIListeners();

    window.addEventListener('keydown', event => {
        if(event.defaultPrevented) return;

        let code: string | number | undefined = undefined;
        if(event.key !== undefined) code = event.key;
        else if(event.code !== undefined) code = event.code;
        else if(event.keyCode !== undefined) code = event.keyCode;
        // console.log(event.key, event.code, event.keyCode);

        if(code !== undefined && handleKeyDown(code)) event.preventDefault();
    }, true);
    window.addEventListener('keyup', event => {
        if(event.defaultPrevented) return;

        let code: string | number | undefined = undefined;
        if(event.key !== undefined) code = event.key;
        else if(event.code !== undefined) code = event.code;
        else if(event.keyCode !== undefined) code = event.keyCode;

        if(code !== undefined && handleKeyUp(code)) event.preventDefault();
    });
    window.addEventListener('pointermove', event => {
        if(event.isPrimary === false) return;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        checkIntersections(camera, false, false);
    }, false);
    canvas.addEventListener('pointerdown', event => {
        mouseDownPointer.set(event.clientX, event.clientY);
        checkIntersections(camera, true, true);
    }, false);
    canvas.addEventListener('pointerup', event => {
        const dx = event.clientX - mouseDownPointer.x, dy = event.clientY - mouseDownPointer.y;
        if(dx * dx + dy * dy <= 1) { // camera didn't move
            checkIntersections(camera, true, false);
        }
    });
}

const uploadModelError = <HTMLElement> document.getElementById('uploadModelError');
const uploadTextureError = <HTMLElement> document.getElementById('uploadTextureError');
const uploadTextureNotice = <HTMLElement> document.getElementById('uploadTextureNotice');

function registerUIListeners() {

    const importBtn = <HTMLButtonElement> document.getElementById('import-btn');
    importBtn.addEventListener('click', () => {
        if (confirm('Are you sure? The current model will be lost!')) {
            uploadModelError.hidden = true;
            Bootstrap.openModal('modalUpload');
        }
    });

    const exportBtn = <HTMLButtonElement> document.getElementById('export-btn');
    exportBtn.addEventListener('click', () => {
        if(sceneModel === null) return;

        sceneModel.updateModel();
        Bootstrap.openModal('modalExport');
    });

    const jsonRaw = <HTMLElement> document.getElementById('jsonRaw');
    const exportShowJson = <HTMLAnchorElement> document.getElementById('exportShowJson');
    const exportDownloadJson = <HTMLAnchorElement> document.getElementById('exportDownloadJson');
    const exportJsonButton = <HTMLButtonElement> document.getElementById('exportJsonButton');

    exportShowJson.addEventListener('click', event => {
        event.preventDefault();
        Bootstrap.closeModal('modalExport');

        if(sceneModel === null) return;
        
        jsonRaw.innerHTML = convertModelToJson(sceneModel.model, true);
        Highlight.highlight(jsonRaw);

        Bootstrap.openModal('modalJsonRaw');
    });

    exportDownloadJson.addEventListener('click', event => {
        event.preventDefault();

        if(sceneModel !== null) downloadModelJson(sceneModel.model);
    });

    exportJsonButton.addEventListener('click', () => {
        if(sceneModel !== null) downloadModelJson(sceneModel.model);
    });

    const jsonRawCopy = <HTMLButtonElement> document.getElementById('jsonRawCopy');
    jsonRawCopy.addEventListener('click', () => {
        if(sceneModel === null) return;

        copyTextToClipboard(convertModelToJson(sceneModel.model, false));
        selectElement(jsonRaw);
    });

    const modelInput = <HTMLInputElement> document.getElementById('modelInput');
    modelInput.addEventListener('change', event => {
        const fileList = (<HTMLInputElement> event.target).files;
        if(fileList === undefined || fileList === null || fileList.length <= 0) return;

        const file = fileList[0];
        if(file.type !== "application/json") {
            uploadModelError.innerHTML = 'Please select a valid .json file.';
            uploadModelError.hidden = false;
        } else {
            tryUploadModel(file, false);
        }
    });

    const textureInput = <HTMLInputElement> document.getElementById('textureInput');
    textureInput.addEventListener('change', event => {
        const fileList = (<HTMLInputElement> event.target).files;
        if(fileList === undefined || fileList === null || fileList.length <= 0) return;

        const file = fileList[0];
        if(!file.type.startsWith("image/")) {
            uploadTextureError.innerHTML = 'Please select a valid image file.';
            uploadTextureError.hidden = false;
        } else {
            tryUploadTexture(file);
        }
    });

    document.body.addEventListener('dragover', event => {
        event.stopPropagation();
        event.preventDefault();

        if(event.dataTransfer === null) return;
        event.dataTransfer.dropEffect = 'copy';
    });

    document.body.addEventListener('drop', event => {
        event.stopPropagation();
        event.preventDefault();

        if(event.dataTransfer === null) return;

        const fileList = event.dataTransfer.files;
        if(fileList.length <= 0) return;

        const file = fileList[0];
        if(file.type === 'application/json') {
            tryUploadModel(file, true);
        }
        else if(file.type.startsWith('image/')) {
            tryUploadTexture(file);
        }
    });
}

function tryUploadModel(file: File, dropped: boolean) {
    uploadModelError.hidden = true;

    loadModel(file, (model, error) => {
        if(!model) {
            if(dropped) Bootstrap.openModal('modalUpload');

            uploadModelError.innerHTML = error === null ? "Unknown error" : error;
            uploadModelError.hidden = false;
        } else {
            Bootstrap.closeModal('modalUpload');
            removeModel();
            addModel(model);

            if(model.texture === undefined || model.texture === null) {
                uploadTextureNotice.hidden = false;
                Bootstrap.openModal('modalUploadTexture');
            }
        }
    });
}

function tryUploadTexture(file: File) {
    uploadTextureError.hidden = true;

    loadTextureFromUpload(file, data => {
        if(sceneModel === null) throw new Error("No model loaded.");

        sceneModel.loadTexture(data).then(() => {
            Bootstrap.closeModal('modalUploadTexture');
            uploadTextureNotice.hidden = true;
        });
    });
}

export function updateControls() {
    if(orbitControls === undefined) throw new Error("Call before init");
    orbitControls.update();
}

function checkIntersections(camera: THREE.Camera, clicked: boolean, clickDown: boolean) {
    rayCaster.setFromCamera(mouse, camera);

    const intersects = rayCaster.intersectObjects(objects);
    if (intersects.length > 0) {
        const selected = intersects[0].object;
        setSelectable(selected, true);
        if(clicked && clickDown && !transformControls.dragging) select(selected);
    } else {
        if(transformControls.axis !== null) return;
        setSelectable(null, true);
        if(clicked && !clickDown) selectNothing();
    }
}

function select(obj: THREE.Object3D) {
    setSelected(obj, true);
    transformControls.attach(obj);
}

function selectNothing() {
    setSelected(null, true);
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