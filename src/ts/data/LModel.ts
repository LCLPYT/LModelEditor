import { Vector3 } from "three";
import { ModelRenderer } from "./ModelRenderer";

export class LModel {

    name: string;
    renderers: ModelRenderer[] = [];
    initialTranslation: Vector3 = new Vector3(0, -1.5, 0);
    texture: string | null = null;

    constructor(name: string) {
        this.name = name;
    }

}