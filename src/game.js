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
    bowlingPinMaterial,
    reflectorModelPath,
    reflectorTexturePath,
    reflectorInitialRotation,
    reflectorInitialTranslation,
    reflectorMaterial
} from './consts/modelConsts.js'
import { phongVsShaderPath, phongFsShaderPath, mirrorVsShaderPath, mirrorFsShaderPath, staticVsShaderPath, staticFsShaderPath } from './consts/shaderConsts.js'
import ModelsFactory from './modelsFactory.js';
import WebglProgramFactory from './webglProgramFactory.js';
import WebglScene from './webglScene.js';
import BowlingBall from './bowlingBall.js';
import MirrorModel from './mirrorModel.js';
import { camera2Position, cameraInitialLookAt, cameraInitialPosition } from './consts/cameraConsts.js';
import Reflector from './reflector'

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
    }
    gl = null;
    mouseDown = false;

    async start() {
        try {
            const promises = [];

            promises.push(loadTextResource(phongVsShaderPath));
            promises.push(loadTextResource(phongFsShaderPath));
            promises.push(loadTextResource(mirrorVsShaderPath));
            promises.push(loadTextResource(mirrorFsShaderPath));
            promises.push(loadTextResource(staticVsShaderPath));
            promises.push(loadTextResource(staticFsShaderPath));
            promises.push(loadJSONResource(bowlingHallModelPath));
            promises.push(Promise.all(bowlingHallTexturesPaths.map(p => loadImage(p))));
            promises.push(loadJSONResource(bowlingPinModelPath));
            promises.push(loadImage(bowlingPinTexturePath));
            promises.push(loadJSONResource(bowlingBallModelPath));
            promises.push(loadImage(bowlingBallTexturePath));
            promises.push(loadJSONResource(reflectorModelPath));
            promises.push(loadImage(reflectorTexturePath));

            const [
                phongVsShaderText, phongFsShaderText,
                mirrorVsShaderText, mirrorFsShaderText,
                staticVsShaderText, staticFsShaderText,
                bowlingHallModelsObj, bowlingHallTextures,
                bowlingPinModelObj, bowlingPinTexture,
                bowlingBallModelObj, bowlingBallTexture,
                reflectorModelObj, reflectorTexture
            ] = await Promise.all(promises);

            this._initWebGL(phongVsShaderText, phongFsShaderText, mirrorVsShaderText, mirrorFsShaderText, staticVsShaderText, staticFsShaderText);

            const bowlingHallModels = ModelsFactory.createModels(this.gl, bowlingHallModelsObj, bowlingHallTextures, bowlingHallMaterials);
            const bowlingPinModels = ModelsFactory.createSameModels(bowlingPinInitialTranslations.length, this.gl, bowlingPinModelObj, [bowlingPinTexture],
                [bowlingPinMaterial], [], bowlingPinInitialTranslations);
            const bowlingBallModel = ModelsFactory.createModels(this.gl, bowlingBallModelObj, [bowlingBallTexture],
                [bowlingBallMaterial], bowlingBallInitialRotation, bowlingBallInitialTranslation);
            const reflectorModel = ModelsFactory.createModels(this.gl, reflectorModelObj, [reflectorTexture],
                [reflectorMaterial], reflectorInitialRotation, reflectorInitialTranslation);

            this.scene = new WebglScene(this.gl, this.phongProgram, bowlingHallModels.concat(bowlingPinModels, bowlingBallModel, reflectorModel),
                this.mirrorProgram, this.staticProgram);
            this.scene.load();

            const mirrorModel = new MirrorModel(mirrorCorners[0], mirrorCorners[1], mirrorCorners[2], mirrorCorners[3],
                false, this.scene);
            this.scene.addMirror(mirrorModel);
            
            this.reflector = new Reflector(reflectorModel[0], this.scene, 10, new Float32Array([1.5, 1.5, 1.5]));
            this.scene.addReflector(this.reflector);

            this.scene.start();

            this.bowlingBall = new BowlingBall(bowlingBallModel[0], this.scene);

            this._initListeners();
        }
        catch (e) {
            console.error(e);
            return;
        }
    }

    _initWebGL(vsShaderText, fsShaderText, mirrorVsShaderText, mirrorFsShaderText, staticVsShaderText, staticFsShaderText) {
        this.gl = this.canvas.getContext('webgl2');
        if (!this.gl) {
            throw new Error('Your browser does not support WebGL');
        }

        this.phongProgram = WebglProgramFactory.createProgram(this.gl, vsShaderText, fsShaderText)
        this.mirrorProgram = WebglProgramFactory.createProgram(this.gl, mirrorVsShaderText, mirrorFsShaderText)
        this.staticProgram = WebglProgramFactory.createProgram(this.gl, staticVsShaderText, staticFsShaderText)
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
        document.addEventListener('keydown', this._onKeyPress);
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
        if (this.mouseMoveActive) {
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

    _changeToStaticShading() {
        this.scene.mode = 'STATIC';
    }

    _changeToPhongShading() {
        this.scene.mode = 'PHONG';
    }

    _startBowlingBallFollow() {
        this._resetCamera();
        this.scene.addUpdateEvent(this._followBallEvent);
    }

    _resetCamera() {
        this.scene.removeUpdateEvent(this._followBallEvent);
        this.scene.removeUpdateEvent(this._lookAtBowlingBallEvent);
        this.scene.camera.position = cameraInitialPosition;
        this.scene.camera.lookAt = cameraInitialLookAt;
    }

    _followBallEvent = () => {
        const pos = this.bowlingBall.getPos();
        pos[1] += 3;
        this.scene.camera.position = pos;
        this.scene.camera.lookAt = this.bowlingBall.getPos()
    }

    _startBowlingBallLookAt() {
        this._resetCamera();
        this.scene.camera.position = camera2Position;
        this.scene.addUpdateEvent(this._lookAtBowlingBallEvent);
    }

    _lookAtBowlingBallEvent = () => {
        this.scene.camera.lookAt = this.bowlingBall.getPos()
    }

    _onKeyPress = e => {
        switch(e.key) {
            case "z":
                this._changeToStaticShading();
                return;
            case "x":
                this._changeToPhongShading();
                return;
            case "c":
                this._startBowlingBallFollow();
                return;
            case "v":
                this._resetCamera();
                return;
            case "b":
                this._startBowlingBallLookAt();
                return;
        }
    }
}