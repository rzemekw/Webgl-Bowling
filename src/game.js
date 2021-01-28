import { loadImage, loadTextResource, loadJSONResource } from './util.js'
import {
    bowlingHallModelPath, bowlingHallTexturesPaths, bowlingPinModelPath, bowlingPinTexturePath,
    bowlingPinInitialTranslations,
    bowlingBallModelPath,
    bowlingBallTexturePath,
    bowlingBallInitialRotation,
    bowlingBallInitialTranslation,
    mirrorCorners,
    bowlingHallMaterials,
    bowlingBallMaterial,
    bowlingPinMaterial
} from './consts/modelConsts.js'
import { vsShaderPath, fsShaderPath, mirrorVsShaderPath, mirrorFsShaderPath } from './consts/shaderConsts.js'
import ModelsFactory from './modelsFactory.js';
import WebglProgramFactory from './webglProgramFactory.js';
import WebglScene from './webglScene.js';
import BowlingBall from './bowlingBall.js';
import MirrorModel from './mirrorModel.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
    }
    gl = null;
    mouseDown = false;

    async start() {
        try {
            const promises = [];

            promises.push(loadTextResource(vsShaderPath));
            promises.push(loadTextResource(fsShaderPath));
            promises.push(loadTextResource(mirrorVsShaderPath));
            promises.push(loadTextResource(mirrorFsShaderPath));
            promises.push(loadJSONResource(bowlingHallModelPath));
            promises.push(Promise.all(bowlingHallTexturesPaths.map(p => loadImage(p))));
            promises.push(loadJSONResource(bowlingPinModelPath));
            promises.push(loadImage(bowlingPinTexturePath));
            promises.push(loadJSONResource(bowlingBallModelPath));
            promises.push(loadImage(bowlingBallTexturePath));

            const [
                vsShaderText, fsShaderText,
                mirrorVsShaderText, mirrorFsShaderText,
                bowlingHallModelsObj, bowlingHallTextures,
                bowlingPinModelObj, bowlingPinTexture,
                bowlingBallModelObj, bowlingBallTexture
            ] = await Promise.all(promises);

            this._initWebGL(vsShaderText, fsShaderText, mirrorVsShaderText, mirrorFsShaderText )

            const bowlingHallModels = ModelsFactory.createModels(this.gl, bowlingHallModelsObj, bowlingHallTextures, bowlingHallMaterials);
            const bowlingPinModels = [].concat.apply([], bowlingPinInitialTranslations.map(t =>
                ModelsFactory.createModels(this.gl, bowlingPinModelObj, [bowlingPinTexture], [bowlingPinMaterial], undefined, t)));
            const bowlingBallModel = ModelsFactory.createModels(this.gl, bowlingBallModelObj, [bowlingBallTexture],
                [bowlingBallMaterial], bowlingBallInitialRotation, bowlingBallInitialTranslation);

            this.scene = new WebglScene(this.gl, this.program, bowlingHallModels.concat(bowlingPinModels, bowlingBallModel), this.mirrorProgram);
            this.scene.load();

            const mirrorModel = new MirrorModel(mirrorCorners[0], mirrorCorners[1], mirrorCorners[2], mirrorCorners[3],
                false, this.scene, vsShaderText, fsShaderText);
            this.scene.addMirror(mirrorModel);

            this.scene.start();

            this.bowlingBall = new BowlingBall(bowlingBallModel[0], this.scene);

            this._initListeners();
        }
        catch (e) {
            console.error(e);
            return;
        }
    }

    _initWebGL(vsShaderText, fsShaderText, mirrorVsShaderText, mirrorFsShaderText) {
        this.gl = this.canvas.getContext('webgl2');
        const gl = this.gl;
        if (!this.gl) {
            throw new Error('Your browser does not support WebGL');
        }

        this.program = WebglProgramFactory.createProgram(this.gl, vsShaderText, fsShaderText)
        this.mirrorProgram = WebglProgramFactory.createProgram(this.gl, mirrorVsShaderText, mirrorFsShaderText)
    }

    _getClickCoords(clientX, clientY) {

        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const clipX = x / rect.width * 2 - 1;
        const clipY = y / rect.height * -2 + 1;

        return { x: clipX, y: clipY }
    }

    _initListeners() {
        this.canvas.addEventListener('mousedown', this._onMouseDown);
        this.canvas.addEventListener('mouseup', this._onMouseUp);
    }

    _onMouseDown = e => {
        this.bowlingBall.stopMoving();

        const p = this._getClickCoords(e.clientX, e.clientY);

        const ray = this.scene.unprojectPoint(p.x, p.y);

        if (this.bowlingBall.rayThrough(ray.start, ray.end)) {
            this.mouseMoveActive = true;
            this.canvas.addEventListener('mousemove', this._onMouseMove);
        }
    }

    _onMouseUp = e => {
        if(this.mouseMoveActive) {
            this.mouseMoveActive = false;
            this.canvas.removeEventListener('mousemove', this._onMouseMove);
            this.bowlingBall.startMoving();
        }
    }

    _onMouseMove = e => {
        const p = this._getClickCoords(e.clientX, e.clientY);
        const ray = this.scene.unprojectPoint(p.x, p.y);

        const xy = this.bowlingBall.calculateXY(ray.start, ray.end);

        this.bowlingBall.changeTranslation(xy.x, xy.y)
    }
}