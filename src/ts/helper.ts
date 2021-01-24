import { BoxGeometry, Vector2 } from "three";
import { Cube } from "./data/Cube";
import { LModel } from "./data/LModel";
import { convertModelToJson } from "./loader";

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

export function copyTextToClipboard(text: string) {
	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(text);
		return;
	}
	navigator.clipboard.writeText(text).then(function() {
		console.log('Async: Copying to clipboard was successful!');
	}, function(err) {
		console.error('Async: Could not copy text: ', err);
	});
}

function fallbackCopyTextToClipboard(text: string) {
	var textArea = document.createElement("textarea");
	textArea.value = text;

	// Avoid scrolling to bottom
	textArea.style.top = "0";
	textArea.style.left = "0";
	textArea.style.position = "fixed";

	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Fallback: Copying text command was ' + msg);
	} catch (err) {
		console.error('Fallback: Oops, unable to copy', err);
	}

	document.body.removeChild(textArea);
}

export function selectElement(element: HTMLElement) {
	if(!element) return;

    if (window.getSelection) {
		const selection = window.getSelection();
		if(selection === null) throw new Error("window selection unsupported.");
        const range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
	}
	
	// IE only feature
	let documentBody = <any> document.body;
	if (!documentBody.createTextRange) {
	    let range = documentBody.createTextRange();
	    range.moveToElementText(element);
	    range.select();
	}
}

export function downloadText(text: string, filename: string) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}

export function downloadModelJson(model: LModel) {
	downloadText(convertModelToJson(model, false), `${model.name}.json`);
}