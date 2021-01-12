import { ModelRenderer } from "./ModelRenderer";

export class LModel {

    name: string;
    renderers: ModelRenderer[] = [];

    constructor(name: string) {
        this.name = name;
    }

}