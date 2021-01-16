export type XHRResult = {
    status: number,
    response: any
};
export type RemoteResource = string | {
    src: string;
    /** @defaultvalue "anonymous" */
    crossOrigin?: string | null;
    referrerPolicy?: string;
};
  
export type TextureCanvas = HTMLCanvasElement | OffscreenCanvas;
export type TextureSource = HTMLImageElement | HTMLVideoElement | ImageBitmap | TextureCanvas;