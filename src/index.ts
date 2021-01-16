import './style.css';
import { initControls } from './ts/controls';
import { camera, fitCameraToWindow, initScene, populateScene, scene } from './ts/scene';
import { initRenderer, canvas, render } from './ts/render';
import { setupGui } from './ts/gui';

initScene();
initRenderer(scene, camera);
initControls(canvas, camera, scene);

setupGui();

window.addEventListener('resize', () => {
    fitCameraToWindow();
    fitCameraToWindow();
});

populateScene();

render();