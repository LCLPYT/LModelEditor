import { BoxGeometry, DoubleSide, Euler, Group, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, MeshStandardMaterial, MeshStandardMaterialParameters, NearestFilter, Object3D, SphereGeometry, Texture, Vector3 } from "three";
import { setCubeUVs } from "../helper";
import { fetchJson, isTextureSource, loadImage, loadModelFromJson, loadSkinToCanvas } from "../loader";
import { RemoteResource, TextureSource } from "../types";
import { Cube } from "./Cube";
import { LModel } from "./LModel";
import { ModelRenderer } from "./ModelRenderer";

export class SceneModel extends Group {

    textureCanvas: HTMLCanvasElement;
    texture: Texture;
    model: LModel;
    pivotPoints: Object3D[] = [];
    cubes: Object3D[] = [];

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

    private addRenderer(renderer: ModelRenderer, parent: Object3D | null = null) {
        const eulerRotation = new Euler(
            renderer.rotation.x,
            -renderer.rotation.y,
            -renderer.rotation.z,
            'ZYX'
        );

        const rotPoint = new Mesh(new SphereGeometry(0.1, 32, 32), new MeshBasicMaterial({ color: 0xff0000 }));
        rotPoint.userData = {
            name: renderer.name
        };
        rotPoint.position.copy(this.getPivotPoint(renderer));
        rotPoint.setRotationFromEuler(eulerRotation);
        rotPoint.visible = renderer.visible;

        this.pivotPoints.push(rotPoint);

        renderer.children.forEach(child => this.addRenderer(child, rotPoint));
        renderer.cubes.forEach(cube => this.addCube(cube, rotPoint));
    
        if(parent === null) this.add(rotPoint);
        else parent.add(rotPoint);
    }

    private addCube(cube: Cube, parent: Object3D) {
        const geometry = new BoxGeometry(cube.dimensions.x, cube.dimensions.y, cube.dimensions.z);
        setCubeUVs(geometry, cube);
    
        const material = new MeshStandardMaterial(this.getMaterialOptions());
        const mesh = new Mesh(geometry, material);
        mesh.position.set(
            // axis direction  |  cube center to begin vertex  | offset correction
            ( cube.position.x) + (cube.dimensions.x / 2 - 0.5) + (0.5),
            (-cube.position.y) - (cube.dimensions.y / 2 + 0.5) + (0.5),
            (-cube.position.z) - (cube.dimensions.z / 2 - 0.5) - (0.5)
        );
        mesh.userData = {
            cubeTexture: cube.texture
        };
    
        parent.add(mesh);
        this.cubes.push(mesh);
    }

    protected getMaterialOptions(): MeshStandardMaterialParameters | MeshBasicMaterialParameters {
        return {
            map: this.texture,
            side: DoubleSide,
            transparent: true,
            alphaTest: 1e-5
        };
    }

    changeMaterial(standard: boolean) {
        this.cubes.forEach(o => {
            if(!(o instanceof Mesh)) return;
            let mesh = <Mesh> o;

            const material = standard ? new MeshStandardMaterial(this.getMaterialOptions()) : new MeshBasicMaterial(this.getMaterialOptions());
            mesh.material = material;
        });
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
        this.cubes = [];

        for (let i = this.children.length - 1; i >= 0; i--) 
            this.remove(this.children[i]);
    }

    updateModel() {
        let model = new LModel(this.model.name);
        model.initialTranslation = this.model.initialTranslation;

        this.children.forEach(pivotPoint => SceneModel.addPivotPoint(pivotPoint, model, model));

        model.texture = this.textureCanvas.toDataURL();

        this.model = model;
    }

    private static addPivotPoint(pivotPoint: Object3D, model: LModel, parent: LModel | ModelRenderer) {
        let data = pivotPoint.userData;
        if(data === undefined || data.name === undefined) return;

        let rotationPoint = new Vector3(
            +(pivotPoint.position.x - ( model.initialTranslation.x * 16)),
            -(pivotPoint.position.y - (-model.initialTranslation.y * 16)),
            -(pivotPoint.position.z - (-model.initialTranslation.z * 16))
        )

        let rotation = new Euler(
            pivotPoint.rotation.x,
            -pivotPoint.rotation.y,
            -pivotPoint.rotation.z,
            'XYZ'
        );
        rotation.reorder('ZYX');

        let renderer = new ModelRenderer(data.name, rotationPoint, rotation.toVector3(), pivotPoint.visible);

        pivotPoint.children.forEach(renderChild => {
            let userData = renderChild.userData;
            if(userData === undefined) return;

            if(userData.name !== undefined) {
                SceneModel.addPivotPoint(renderChild, model, renderer);
                return;
            }

            if(userData.cubeTexture === undefined) return;

            if(!(renderChild instanceof Mesh)) throw new Error(`Unknown conversion from type '${typeof renderChild}'`);
            let mesh = <Mesh> renderChild;
            
            if(!(mesh.geometry instanceof BoxGeometry)) throw new Error(`Unknown geometry type '${typeof mesh.geometry}'`);
            let geometry = <BoxGeometry> mesh.geometry;

            let dimensions = new Vector3(
                geometry.parameters.width * mesh.scale.x, 
                geometry.parameters.height * mesh.scale.y, 
                geometry.parameters.depth * mesh.scale.z
            );

            let position = new Vector3(
                // axis direction   | cube begin to center     | offset correction
                +((mesh.position.x) - (dimensions.x / 2 - 0.5) - (0.5)),
                -((mesh.position.y) + (dimensions.y / 2 + 0.5) - (0.5)),
                -((mesh.position.z) + (dimensions.z / 2 - 0.5) + (0.5))
            );

            let delta = new Vector3(0, 0, 0); // Still unimplemted
            let mirror = false; // Still unimplemented

            let cube = new Cube(position, dimensions, delta, mirror, userData.cubeTexture);

            renderer.cubes.push(cube);
        });

        if(parent instanceof LModel) parent.renderers.push(renderer);
        else parent.children.push(renderer);
    }

}