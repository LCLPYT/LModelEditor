import { Vector2 } from "three";

export class CubeTexture {

    offset: Vector2;
    dimensions: Vector2;

    constructor(offset: Vector2, dimensions: Vector2) {
        this.offset = offset;
        this.dimensions = dimensions;
    }

}