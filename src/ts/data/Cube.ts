import { Vector3 } from "three";
import { CubeTexture } from "./CubeTexture";

export class Cube {

    position: Vector3;
    dimensions: Vector3;
    delta: Vector3;
    mirror: boolean;
    texture: CubeTexture;

    constructor(position: Vector3, dimensions: Vector3, delta: Vector3, mirror: boolean, texture: CubeTexture) {
        this.position = position;
        this.dimensions = dimensions;
        this.delta = delta;
        this.mirror = mirror;
        this.texture = texture;
    }

}