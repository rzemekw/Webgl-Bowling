import {
    bowlingBallInitialRotation, bowlingBallInitialTranslation, bowlingBallMaterial,
    bowlingBallModelPath, bowlingBallTexturePath, bowlingHallMaterials, bowlingHallModelPath,
    bowlingHallTexturesPaths, bowlingPinInitialTranslations, bowlingPinMaterial, bowlingPinModelPath,
    bowlingPinTexturePath, reflectorInitialRotations, reflectorInitialTranslations, reflectorMaterial,
    reflectorModelPath, reflectorTexturePath
} from "../consts/modelConsts";
import ModelsFactory from "./modelsFactory";
import { loadImage, loadJSONResource } from "./util";

export default class ModelRepository {
    static async getBowlingBallModel(gl) {
        const [bowlingBallModelObj, bowlingBallTexture] = await Promise.all([loadJSONResource(bowlingBallModelPath), loadImage(bowlingBallTexturePath)]);
        return ModelsFactory.createModels(gl, bowlingBallModelObj, [bowlingBallTexture],
            [bowlingBallMaterial], bowlingBallInitialRotation, bowlingBallInitialTranslation)[0];
    }

    static async getBowlingHallModels(gl) {
        const [bowlingHallModelsObj, bowlingHallTextures] = await Promise.all([loadJSONResource(bowlingHallModelPath),
            Promise.all(bowlingHallTexturesPaths.map(p => loadImage(p)))]);
        return ModelsFactory.createModels(gl, bowlingHallModelsObj, bowlingHallTextures, bowlingHallMaterials);
    }

    static async getBowlingPinModels(gl) {
        const [bowlingPinModelObj, bowlingPinTexture] = await Promise.all([loadJSONResource(bowlingPinModelPath), loadImage(bowlingPinTexturePath)]);
        return ModelsFactory.createSameModels(bowlingPinInitialTranslations.length, gl, bowlingPinModelObj, [bowlingPinTexture],
            [bowlingPinMaterial], [], bowlingPinInitialTranslations);
    }

    static async getReflectorModels(gl) {
        const [reflectorModelObj, reflectorTexture] = await Promise.all([loadJSONResource(reflectorModelPath), loadImage(reflectorTexturePath)]);
        return ModelsFactory.createSameModels(reflectorInitialTranslations.length, gl, reflectorModelObj, [reflectorTexture],
            [reflectorMaterial], reflectorInitialRotations, reflectorInitialTranslations);
    }
}