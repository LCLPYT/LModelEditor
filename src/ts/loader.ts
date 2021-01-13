import { Vector2, Vector3 } from "three";
import { Cube } from "./data/Cube";
import { CubeTexture } from "./data/CubeTexture";
import { LModel } from "./data/LModel";
import { ModelRenderer } from "./data/ModelRenderer";

export function convertModelToJson(model: LModel) {
    return JSON.stringify(model);
}

export function loadModelFromJson(json: string): LModel {
    return JSON.parse(json);
}

export function fetchJson(url: string, callback: (status: number, response: any) => void) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = () => {
        var status = xhr.status;
        callback(status, xhr.response);
    };
    xhr.send();
}

export function getDefaultModel(): LModel {
    let model = new LModel("Unnamed Model");
    let renderer = new ModelRenderer("Main Part", new Vector3(0, 0, 0), new Vector3(0, 0, 0), true);
    let tex = new CubeTexture(0, 0, 64, 64);
    let cube = new Cube(new Vector3(0, 0, 0), new Vector3(1, 1, 1), new Vector3(0, 0, 0), false, tex);
    renderer.cubes.push(cube);
    model.renderers.push(renderer);
    return model;
}