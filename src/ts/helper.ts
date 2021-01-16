import { BoxGeometry, Vector2 } from "three";
import { Cube } from "./data/Cube";

export function setCubeUVs(geometry: BoxGeometry, cube: Cube) {
    setUVs(geometry, cube.texture.offsetX, cube.texture.offsetY, cube.dimensions.x, cube.dimensions.y, cube.dimensions.z, cube.texture.width, cube.texture.height);
}

/**
 * Source: https://github.com/bs-community/skinview3d/blob/f5c7692c8d1b63631ab016d7873ddbdf12326cbc/src/model.ts
 */
export function setUVs(box: BoxGeometry, u: number, v: number, width: number, height: number, depth: number, textureWidth: number, textureHeight: number): void {
	const toFaceVertices = (x1: number, y1: number, x2: number, y2: number) => [
		new Vector2(x1 / textureWidth, 1.0 - y2 / textureHeight),
		new Vector2(x2 / textureWidth, 1.0 - y2 / textureHeight),
		new Vector2(x2 / textureWidth, 1.0 - y1 / textureHeight),
		new Vector2(x1 / textureWidth, 1.0 - y1 / textureHeight)
    ];
    
	const top = toFaceVertices(u + depth, v, u + width + depth, v + depth);
	const bottom = toFaceVertices(u + width + depth, v, u + width * 2 + depth, v + depth);
	const left = toFaceVertices(u, v + depth, u + depth, v + depth + height);
	const front = toFaceVertices(u + depth, v + depth, u + width + depth, v + depth + height);
	const right = toFaceVertices(u + width + depth, v + depth, u + width + depth * 2, v + height + depth);
    const back = toFaceVertices(u + width + depth * 2, v + depth, u + width * 2 + depth * 2, v + height + depth);
    
	box.faceVertexUvs[0] = [
		[right[3], right[0], right[2]],
		[right[0], right[1], right[2]],
		[left[3], left[0], left[2]],
		[left[0], left[1], left[2]],
		[top[3], top[0], top[2]],
		[top[0], top[1], top[2]],
		[bottom[0], bottom[3], bottom[1]],
		[bottom[3], bottom[2], bottom[1]],
		[front[3], front[0], front[2]],
		[front[0], front[1], front[2]],
		[back[3], back[0], back[2]],
		[back[0], back[1], back[2]]
	];
}