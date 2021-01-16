import { GUI } from '../../node_modules/three/examples/jsm/libs/dat.gui.module';
import { changeMaterial } from './scene';

let options = {
    shading: true
};

export function setupGui() {
    const gui = new GUI()
    const cameraFolder = gui.addFolder("Scene");
    cameraFolder.add(options, 'shading').onChange((value: boolean) => changeMaterial(value));
    cameraFolder.open();
}