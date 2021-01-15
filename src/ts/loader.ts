import { Texture, Vector2, Vector3 } from "three";
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

export type RemoteImage = string | {
    src: string;
    /** @defaultvalue "anonymous" */
    crossOrigin?: string | null;
    referrerPolicy?: string;
};
  
export type TextureCanvas = HTMLCanvasElement | OffscreenCanvas;
export type TextureSource = HTMLImageElement | HTMLVideoElement | ImageBitmap | TextureCanvas;

export function isTextureSource(value: unknown): value is TextureSource {
    return value instanceof HTMLImageElement ||
        value instanceof HTMLVideoElement ||
        value instanceof HTMLCanvasElement ||
        (typeof ImageBitmap !== "undefined" && value instanceof ImageBitmap) ||
        (typeof OffscreenCanvas !== "undefined" && value instanceof OffscreenCanvas);
}

export async function loadImage(source: RemoteImage): Promise<HTMLImageElement> {
    const image = document.createElement("img");
    return new Promise((resolve, reject) => {
        image.onload = (): void => resolve(image);
        image.onerror = reject;
        image.crossOrigin = "anonymous";
        if (typeof source === "string") {
            image.src = source;
        } else {
            if (source.crossOrigin !== undefined) {
                image.crossOrigin = source.crossOrigin;
            }
            if (source.referrerPolicy !== undefined) {
                image.referrerPolicy = source.referrerPolicy;
            }
            image.src = source.src;
        }
    });
}

export function loadSkinToCanvas(canvas: TextureCanvas, image: TextureSource): void {
	const context = canvas.getContext("2d")!;
	canvas.width = image.width;
	canvas.height = image.height;
	context.clearRect(0, 0, image.width, image.height);
	context.drawImage(image, 0, 0, canvas.width, canvas.height);
}

export function loadSkin(source: TextureSource | RemoteImage | null, canvas: HTMLCanvasElement, texture: Texture): void | Promise<void> {
    if (isTextureSource(source)) {
        loadSkinToCanvas(canvas, source);
        texture.needsUpdate = true;
    } else {
        return loadImage(source).then(image => loadSkin(image, canvas, texture));
    }
}