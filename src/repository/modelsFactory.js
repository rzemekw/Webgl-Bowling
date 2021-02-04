import WebglModel from "./webglModel.js";

export default class ModelsFactory {
    static createModels(gl, modelsObj, textures, materials, rotationAngles, translationVector) {
        const models = [];

        for (let i = 0; i < modelsObj.meshes.length; i++) {
            const mesh = modelsObj.meshes[i];

            const model = new WebglModel(rotationAngles, translationVector, materials[i]);
            model.initBuffers(mesh.vertices, [].concat.apply([], mesh.faces), mesh.normals, mesh.texturecoords[0], textures[i], gl)
            models.push(model);
        }

        return models;
    }

    static createSameModels(number, gl, modelsObj, textures, materials, rotationAngles, translationVectors) {
        const models = [];

        for (let i = 0; i < modelsObj.meshes.length; i++) {
            const mesh = modelsObj.meshes[i];

            const model = new WebglModel(rotationAngles[0], translationVectors[0], materials[i]);
            
            model.initBuffers(mesh.vertices, [].concat.apply([], mesh.faces), mesh.normals, mesh.texturecoords[0], textures[i], gl)
            models.push(model);
        }


        for (let i = 1; i < number; i++) {
            for(let j = 0; j < modelsObj.meshes.length; j++) {
                const model = new WebglModel(rotationAngles[i], translationVectors[i], materials[j]);
                model.nbo = models[j].nbo;
                model.vbo = models[j].vbo;
                model.ibo = models[j].ibo;
                model.tbo = models[j].tbo;
                model.n = models[j].n;
                model.texture = models[j].texture;
                models.push(model);
            }
        }

        return models;
    }
}