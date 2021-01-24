export type AJVResult = {
    success: boolean;
    errors: object
};

export namespace AJV {

    export function validateModel(model: any): AJVResult | null;

}