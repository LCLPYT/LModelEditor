import { LModel } from "./data/LModel";
import { RemoteResource, TextureCanvas, TextureSource, XHRResult } from "./types";

export function convertModelToJson(model: LModel, pretty: boolean) {
    if (pretty) return JSON.stringify(model, null, 2);
    else return JSON.stringify(model);
}

export function loadModelFromJson(json: string | object): LModel {
    let model: LModel;
    if (typeof json === "string") model = <LModel> JSON.parse(json);
    else model = <LModel> json;
    
    Object.setPrototypeOf(model, LModel.prototype);
    return model;
}

export function fetchJson(url: string): Promise<XHRResult> {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = () => resolve({
            status: xhr.status,
            response: xhr.response
        });
        xhr.onerror = () => reject({
            status: xhr.status,
            response: xhr.response
        });
        xhr.send();
    });
}

export function isTextureSource(value: unknown): value is TextureSource {
    return value instanceof HTMLImageElement ||
        value instanceof HTMLVideoElement ||
        value instanceof HTMLCanvasElement ||
        (typeof ImageBitmap !== "undefined" && value instanceof ImageBitmap) ||
        (typeof OffscreenCanvas !== "undefined" && value instanceof OffscreenCanvas);
}

export async function loadImage(source: RemoteResource): Promise<HTMLImageElement> {
    const image = document.createElement("img");
    return new Promise((resolve, reject) => {
        image.onload = (): void => resolve(image);
        image.onerror = error => reject({ msg: 'Could not load image.', source: source, error: error });
        image.crossOrigin = "anonymous";
        if (typeof source === "string") {
            image.src = source;
        } else {
            if (source.crossOrigin !== undefined) image.crossOrigin = source.crossOrigin;
            if (source.referrerPolicy !== undefined) image.referrerPolicy = source.referrerPolicy;
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