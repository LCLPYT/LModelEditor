import * as THREE from 'three';
import { updateControls } from './controls';
import { camera, scene } from './scene';
import { EffectComposer } from '../../node_modules/three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from '../../node_modules/three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from '../../node_modules/three/examples/jsm/postprocessing/ShaderPass';
import { OutlinePass } from '../three/OutlinePass';
import { FXAAShader } from '../../node_modules/three/examples/jsm/shaders/FXAAShader';
import { Object3D } from 'three';

export let renderer: THREE.WebGLRenderer;
export let canvas: HTMLCanvasElement;
let composer: EffectComposer;
let effectFXAA: ShaderPass;
let outlinePassSelected: OutlinePass;
let outlinePassSelectable: OutlinePass;

export function initRenderer(scene: THREE.Scene, camera: THREE.Camera) {
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    canvas = renderer.domElement;
    document.body.appendChild(canvas);
    
    composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    outlinePassSelected = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    outlinePassSelected.visibleEdgeColor = new THREE.Color(0xeb8909);
    composer.addPass(outlinePassSelected);

    outlinePassSelectable = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    outlinePassSelectable.visibleEdgeColor = new THREE.Color(0xdddddd);
    composer.addPass(outlinePassSelectable);

    effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    composer.addPass(effectFXAA);
}

export function fitRendererForWindow() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

export function render() {
    if(scene === undefined || camera === undefined) throw new Error("Tried to use scene module before init");

    requestAnimationFrame(render);

    composer.render();

    updateControls();
}

export function setSelectedObjects(objects: Object3D[]) {
    let toRemove = [];
    outlinePassSelectable.selectedObjects.forEach(o => {
        let idx = objects.indexOf(o);
        if(idx != -1) toRemove.push(idx);
    });
    toRemove.forEach(i => outlinePassSelectable.selectedObjects.splice(i, 1));

    outlinePassSelected.selectedObjects = objects;
}

export function setSelectableObjects(objects: Object3D[]) {
    let toRemove = [];
    outlinePassSelected.selectedObjects.forEach(o => {
        let idx = objects.indexOf(o);
        if(idx != -1) toRemove.push(idx);
    });
    toRemove.forEach(i => objects.splice(i, 1));

    outlinePassSelectable.selectedObjects = objects;
}