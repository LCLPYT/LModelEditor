const modelSchema = {
    definitions: {
        vec3d: {
            type: 'object',
            properties: {
                x: {type: 'number'},
                y: {type: 'number'},
                z: {type: 'number'}
            },
            required: ['x', 'y', 'z'],
            additionalProperties: false
        },
        modelRenderers: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: {type: 'string'},
                    rotationPoint: {$ref: '#/definitions/vec3d'},
                    rotation: {$ref: '#/definitions/vec3d'},
                    visible: {type: 'boolean'},
                    cubes: {$ref: '#/definitions/cubes'},
                    children: {$ref: '#/definitions/modelRenderers'}
                },
                required: ['name', 'rotationPoint', 'rotation', 'visible', 'children', 'cubes'],
                additionalProperties: false
            },
        },
        cubes: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    position: {$ref: '#/definitions/vec3d'},
                    dimensions: {$ref: '#/definitions/vec3d'},
                    delta: {$ref: '#/definitions/vec3d'},
                    mirror: {type: 'boolean'},
                    texture: {$ref: '#/definitions/cubeTex'}
                },
                required: ['position', 'dimensions', 'delta', 'mirror', 'texture'],
                additionalProperties: false         
            }
        },
        cubeTex: {
            type: 'object',
            properties: {
                offsetX: {type: 'integer'},
                offsetY: {type: 'integer'},
                width: {type: 'integer'},
                height: {type: 'integer'}
            },
            required: ['offsetX', 'offsetY', 'width', 'height'],
            additionalProperties: false
        }
    },
    type: 'object',
    properties: {
        name: {type: 'string'},
        initialTranslation: {$ref: '#/definitions/vec3d'},
        renderers: {$ref: '#/definitions/modelRenderers'},
        texture: {type: 'string'}
    },
    required: ['name', 'initialTranslation', 'renderers'],
    additionalProperties: false,
};

const AJV = {
    validateModel: model => {
        const Ajv = window.ajv7.default
        const ajv = new Ajv();
        const validate = ajv.compile(modelSchema);
    
        return {
            success: validate(model),
            errors: validate.errors
        };
    }
};

export { AJV };