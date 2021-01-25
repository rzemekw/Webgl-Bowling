import { bowlingBallRadius } from "./consts/modelConsts.js";

export default class BowlingBall {
    constructor(model, scene) {
        this.model = model;
        this.scene = scene;
        this.prevTranslation = model.translationVector.map(x => x);
        this.model.addOnUpdateEvent(this._onUpdate);
    }

    vx = 0;
    vy = 0;
    vz = 0;

    changeTranslation(x, y) {
        const pos = this.model.translationVector;

        pos[0] = x;
        pos[1] = y;
        this.model.applyTransform();
    }

    calculateXY(start, end) {
        const dx = start[0] - end[0];
        const dy = start[1] - end[1];
        const dz = start[2] - end[2];

        const pos = this.model.translationVector

        const dz2 = start[2] - pos[2];

        const c = dz2 / dz;

        const x = start[0] - dx * c;
        const y = start[1] - dy * c;

        return { x, y };
    }

    rayThrough(start, end) {
        const dx = start[0] - end[0];
        const dy = start[1] - end[1];
        const dz = start[2] - end[2];

        const pos = this.model.translationVector

        const dy2 = start[1] - pos[1];

        const c = dy2 / dy;

        const x = start[0] - dx * c;
        const z = start[2] - dz * c;

        return (pos[0] - x) * (pos[0] - x) + (pos[2] - z) * (pos[2] - z) < (bowlingBallRadius * bowlingBallRadius);
    }

    startMoving() {
        this.scene.addUpdateEvent(this.moveEvent);
    }

    stopMoving() {
        this.scene.removeUpdateEvent(this.moveEvent);
    }

    moveEvent = interval => {
        const pos = this.model.translationVector;

        pos[0] += this.vx * interval;
        pos[1] += this.vy * interval;
        pos[2] += this.vz * interval;

        // this.model.xRotationAngle += 0.03
        this.model.xRotationAngle -= Math.sqrt(this.vy*this.vy + this.vx * this.vx) * interval / bowlingBallRadius;
        if (this.vy != 0) {
            this.model.zRotationAngle = -Math.atan(this.vx / this.vy);
            if(this.vy < 0) {
                this.model.zRotationAngle += Math.PI;
            }
        }
        else {
            this.model.zRotationAngle = this.vx > 0 ? Math.PI / 2 : -Math.PI / 2;
        }

        this.model.applyTransform();
    }

    _onUpdate = (translation, interval) => {
        this.vx = (translation[0] - this.prevTranslation[0]) / interval;
        this.vy = (translation[1] - this.prevTranslation[1]) / interval;

        this.prevTranslation = translation;
    }
}