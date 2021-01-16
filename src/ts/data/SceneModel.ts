import { BoxGeometry, DoubleSide, Euler, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, NearestFilter, Object3D, Scene, SphereGeometry, Texture, Vector2, Vector3 } from "three";
import { setCubeUVs } from "../helper";
import { fetchJson, isTextureSource, loadSkinToCanvas, loadImage, loadModelFromJson } from "../loader";
import { RemoteResource, TextureSource } from "../types";
import { Cube } from "./Cube";
import { LModel } from "./LModel";
import { ModelRenderer } from "./ModelRenderer";

export class SceneModel extends Group {

    textureCanvas: HTMLCanvasElement;
    texture: Texture;
    model: LModel;
    activeObjects: Object3D[] = [];

    constructor() {
        super();

        this.textureCanvas = document.createElement("canvas");

		this.texture = new Texture(this.textureCanvas);
		this.texture.magFilter = NearestFilter;
        this.texture.minFilter = NearestFilter;
    }

    async loadModel(model: LModel | string): Promise<LModel> {
        if (model instanceof LModel) {
            this.model = model;
            return this.model;
        } else if (typeof model === "string") {
            const result = await fetchJson(<string> model);
            if (result.status !== 200)
                throw new Error(`An error occured. (HTTP ${result.status}, ${result.response})`);
            
            let m = loadModelFromJson(result.response);
            return await this.loadModel(m);
        } else {
            throw new Error(`Unexpected type ${typeof model}`);
        }
    }

    async loadTexture(source: TextureSource | RemoteResource): Promise<Texture> {
        if (isTextureSource(source)) {
            loadSkinToCanvas(this.textureCanvas, source);
            this.texture.needsUpdate = true;
            return this.texture;
        } else {
            return this.loadTexture(await loadImage(source));
        }
    }

    init() {
        if(this.model === undefined) throw new Error("Model not loaded.");
        if(this.texture === undefined) throw new Error("Texture not loaded.");

        this.clearChildren();

        if(this.model.initialTranslation === undefined) this.model.initialTranslation = new Vector3(0, -1.5, 0);
        this.model.renderers.forEach(renderer => this.addRenderer(renderer));
    }

    private addRenderer(renderer: ModelRenderer) {
        renderer.children.forEach(child => this.addRenderer(child));
        renderer.cubes.forEach(cube => this.addCube(cube, renderer));
    
        const rotPoint = new Mesh(new SphereGeometry(0.1, 32, 32), new MeshBasicMaterial({ color: 0xff0000 }));
        rotPoint.position.copy(this.getPivotPoint(renderer));
    
        this.add(rotPoint);
    }

    private addCube(cube: Cube, renderer: ModelRenderer) {
        const geometry = new BoxGeometry(cube.dimensions.x, cube.dimensions.y, cube.dimensions.z);
        setCubeUVs(geometry, cube);
    
        const material = new MeshStandardMaterial({
            map: this.texture,
            side: DoubleSide,
            transparent: true,
            alphaTest: 1e-5
        });
        // const material = new THREE.MeshStandardMaterial({
        //     color: 0xaaaaaa
        // });
        const mesh = new Mesh(geometry, material);
        mesh.position.set(
            // axis direction  |  cube center to begin vertex  | offset correction
            ( cube.position.x) + (cube.dimensions.x / 2 - 0.5) + (0.5),
            (-cube.position.y) - (cube.dimensions.y / 2 + 0.5) + (0.5),
            (-cube.position.z) - (cube.dimensions.z / 2 - 0.5) - (0.5)
        );
    
        let pivotPoint = this.getPivotPoint(renderer);
    
        mesh.position.add(pivotPoint);
    
        const eulerRotation = new Euler(
            renderer.rotation.x,
            -renderer.rotation.y,
            -renderer.rotation.z,
            'ZYX'
        );
    
        mesh.position.sub(pivotPoint);
        mesh.position.applyEuler(eulerRotation);
        mesh.position.add(pivotPoint);
    
        mesh.setRotationFromEuler(eulerRotation);
    
        this.add(mesh);
        this.activeObjects.push(mesh);
    }

    getPivotPoint(renderer: ModelRenderer) {
        if(this.model === undefined) throw new Error("Model not loaded.");

        return new Vector3(
            // axis direction           | initial offset
            ( renderer.rotationPoint.x) + ( this.model.initialTranslation.x * 16),
            (-renderer.rotationPoint.y) + (-this.model.initialTranslation.y * 16),
            (-renderer.rotationPoint.z) + (-this.model.initialTranslation.z * 16)
        );
    }

    clearChildren() {
        this.activeObjects = [];

        for (let i = this.children.length - 1; i >= 0; i--) 
            this.remove(this.children[i]);
    }

}