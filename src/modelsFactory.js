import WebglModel from "./webglModel.js";

export default class ModelsFactory {
    static createModels(gl, modelsObj, textures, rotationAngles, translationVector, back) {
        const models = [];

        for (let i = 0; i < modelsObj.meshes.length; i++) {
            const mesh = modelsObj.meshes[i];

            const model = new WebglModel(mesh.vertices, [].concat.apply([], mesh.faces), mesh.normals, mesh.texturecoords[0], textures[i], gl,
                rotationAngles, translationVector);
            models.push(model);

            if(back) {
                model.back = true;
            }
            else {
                model.back = false;
            }
        }

        return models;
    }
}