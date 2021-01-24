import { AJV } from "../js/AJV";
import { LModel } from "./data/LModel";
import { RemoteResource, TextureCanvas, TextureSource, XHRResult } from "./types";

export class ModelParseError extends Error {

    constructor(message: string | undefined) {
        super(message);
        this.name = 'ModelParseError';
    }

}

export function convertModelToJson(model: LModel, pretty: boolean) {
    if (pretty) return JSON.stringify(model, null, 2);
    else return JSON.stringify(model);
}

export function loadModelFromJson(json: string | object): LModel {
    let model: LModel;
    if (typeof json === "string") model = <LModel> JSON.parse(json);
    else model = <LModel> json;

    const result = AJV.validateModel(model);
    if(!result || !result.success) throw new ModelParseError('Could not parse model');
    
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

export function loadModel(file: File, callback: (model: LModel | null, error: string | null) => void) {
    const reader = new FileReader();
    reader.addEventListener('load', event => {
        let target = event.target;
        if(target === null) return;

        let result = target.result;
        if(typeof result !== 'string') throw new Error(`Unhandled type '${typeof result}'`);

        let model: LModel | null = null;
        try {
            model = loadModelFromJson(result);
        } catch (err) {}

        // finally
        if(model == null) {
            callback(null, 'Could not load JSON file. Make sure it is in a supported format!');
        } else {
            callback(model, null);
        }
    });
    reader.readAsText(file);
}