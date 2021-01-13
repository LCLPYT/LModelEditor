import { Vector3 } from "three";
import { Cube } from "./Cube";

export class ModelRenderer {

    name: string;
    cubes: Cube[] = [];
    children: ModelRenderer[] = [];
    rotationPoint: Vector3;
    rotation: Vector3;
    visible: boolean = true;

    constructor(name: string, rotationPoint: Vector3, rotation: Vector3, visible: boolean) {
        this.name = name;
        this.rotationPoint = rotationPoint;
        this.rotation = rotation;
        this.visible = visible;
    }

}