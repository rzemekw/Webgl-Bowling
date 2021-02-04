import {
    mirrorCorners,
} from './consts/modelConsts.js'
import WebglScene from './webglScene.js';
import BowlingBall from './bowlingBall.js';
import MirrorModel from './mirrorModel.js';
import { camera2Position, cameraInitialLookAt, cameraInitialPosition } from './consts/cameraConsts.js';
import Reflector from './reflector'
import ModelRepository from './repository/modelRepository.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = this.canvas.getContext('webgl2');
        this.scene = new WebglScene(this.gl);
    }
    mouseDown = false;

    async start() {
        try {
            const [
                bowlingHallModels,
                bowlingPinModels,
                bowlingBallModel,
                reflectorModels
            ] = await Promise.all([
                ModelRepository.getBowlingHallModels(this.gl),
                ModelRepository.getBowlingPinModels(this.gl),
                ModelRepository.getBowlingBallModel(this.gl),
                ModelRepository.getReflectorModels(this.gl)
            ])

            this.scene.loadModels([...bowlingHallModels, ...bowlingPinModels, bowlingBallModel, ...reflectorModels]);
            await this.scene.loadPrograms();

            const mirrorModel = new MirrorModel(mirrorCorners[0], mirrorCorners[1], mirrorCorners[2], mirrorCorners[3],
                false, this.scene);
            this.scene.addMirror(mirrorModel);

            this.reflectors = [];
            this.reflectors.push(new Reflector(reflectorModels[0], this.scene, 10, new Float32Array([3, 3, 0])));
            this.reflectors.push(new Reflector(reflectorModels[1], this.scene, 10, new Float32Array([3, 1, 1])));
            this.reflectors.push(new Reflector(reflectorModels[2], this.scene, 10, new Float32Array([0, 2, 4])));
            this.reflectors.forEach(r => this.scene.addReflector(r));

            this.scene.start();

            this.bowlingBall = new BowlingBall(bowlingBallModel, this.scene);

            this._initListeners();
        }
        catch (e) {
            console.error(e);
            return;
        }
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
        switch (e.key) {
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