import * as THREE from 'three';
import { updateControls } from './controls';
import { camera, scene } from './scene';

export let renderer: THREE.WebGLRenderer;
export let canvas: HTMLCanvasElement;

export function initRenderer() {
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    canvas = renderer.domElement;
    document.body.appendChild(canvas);
}

export function fitRendererForWindow() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

export function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    updateControls();
}