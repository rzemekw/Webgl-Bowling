export default class Sun {
    constructor(direction, maxIntensity, minIntensity, scene) {
        this.direction = direction;
        this.maxIntensity = maxIntensity;
        this.minIntensity = minIntensity;
        this.intensity = [...maxIntensity]
        this.scene = scene;
    }

    stop = 0;
    nightDayTime;

    startDayChanging(intensityChange) {
        this.intensityChange = intensityChange;
        this.nightDayTime = 0.25 / intensityChange;
        this.scene.addUpdateEvent(this.changeEvent);
    }

    stopDatChanging() {
        this.scene.removeUpdateEvent(this.changeEvent);
    }

    changeEvent = interval => {
        if (interval > 1000) {
            interval = 1000;
        }
        if (this.stop >= 0) {
            this.stop -= interval;
            return;
        }


        for (let i = 0; i < 3; i++) {
            this.intensity[i] -= this.maxIntensity[i] * this.intensityChange * interval;
        }

        for (let i = 0; i < 3; i++) {
            if (this.intensity[i] <= this.minIntensity[i]) {
                this.intensityChange = -Math.abs(this.intensityChange);
                this.stop = this.nightDayTime;
                break;
            }
            else if (this.intensity[i] >= this.maxIntensity[i]) {
                this.intensityChange = Math.abs(this.intensityChange);
                this.stop = this.nightDayTime;
                break;
            }
        }
    }
}