import { Cube } from "./Cube";

export class ModelRenderer {

    name: string;
    cubes: Cube[] = [];
    children: ModelRenderer[] = [];

    constructor(name: string) {
        this.name = name;
    }

}