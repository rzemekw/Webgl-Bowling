export default class Reflector {
    constructor(model, scene, focus, intensity) {
        this.model = model;
        this.scene = scene;
        this.focus = focus;
        this.intensity = intensity;
    }

    getWorld() {
        return this.model.worldMatrix;
    }

    startMoving({ vx = 0, vy = 0, vz = 0, vax = 0, vay = 0, vaz = 0, xBound, yBound, zBound } = {}) {
        this.moveData = {vx, vy, vz, vax, vay, vaz, xBound, yBound, zBound };
        this.scene.addUpdateEvent(this.moveEvent);
    }

    stopMoving() {
        this.scene.removeUpdateEvent(this.moveEvent);
    }

    moveEvent = interval => {
        const pos = this.model.translationVector;

        pos[0] += this.moveData.vx * interval;
        pos[1] += this.moveData.vy * interval;
        pos[2] += this.moveData.vz * interval;

        if(this.moveData.xBound) {
            if(this.moveData.xBound[0] >= pos[0]) {
                this.moveData.vx =  Math.abs(this.moveData.vx);
            }
            else if(this.moveData.xBound[1] <= pos[0]) {
                this.moveData.vx = -Math.abs(this.moveData.vx);
            }
        }
        if(this.moveData.yBound) {
            if(this.moveData.yBound[0] >= pos[1]) {
                this.moveData.vy =  Math.abs(this.moveData.vy);
            }
            else if(this.moveData.yBound[1] <= pos[1]) {
                this.moveData.vy = -Math.abs(this.moveData.vy);
            }
        } 
        if(this.moveData.zBound ) {
            if(this.moveData.zBound[0] >= pos[2]) {
                this.moveData.vz =  Math.abs(this.moveData.vz);
            }
            else if(this.moveData.zBound[1] <= pos[2]) {
                this.moveData.vz = -Math.abs(this.moveData.vz);
            }
        } 

        this.model.xRotationAngle += this.moveData.vax;
        this.model.yRotationAngle += this.moveData.vay;
        this.model.zRotationAngle += this.moveData.vaz;

        this.model.applyTransform();
    }

}