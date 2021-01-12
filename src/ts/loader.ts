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

export function getDefaultModel(): LModel {
    let model = new LModel("Unnamed Model");
    let renderer = new ModelRenderer("Main Part");
    let tex = new CubeTexture(new Vector2(0, 0), new Vector2(64, 64));
    let cube = new Cube(new Vector3(0, 0, 0), new Vector3(1, 1, 1), new Vector3(0, 0, 0), false, tex);
    renderer.cubes.push(cube);
    model.renderers.push(renderer);
    return model;
}