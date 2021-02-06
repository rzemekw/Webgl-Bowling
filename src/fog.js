export default class Fog {
    constructor(color, initialDensity) {
        this.color = color;
        if(initialDensity) {
            this.density = initialDensity;
        }
        else {
            this.density = 0;
        }
    }

    incrementDensity(amount) {
        this.density += amount;
    }

    decrementDensity(amount) {
        this.density -= amount;
        if(this.density < 0) {
            this.density = 0;
        }
    }
}