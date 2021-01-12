import './style.css';
import { GUI } from '../node_modules/three/examples/jsm/libs/dat.gui.module';
import { initControls } from './ts/controls';
import { camera, fitCameraToWindow, initScene, populateScene, scene } from './ts/scene';
import { initRenderer, canvas, renderer, render } from './ts/render';

initScene();
initRenderer();
initControls(canvas, camera, scene);

window.addEventListener('resize', () => {
    fitCameraToWindow();
    fitCameraToWindow();
});

populateScene();

render();