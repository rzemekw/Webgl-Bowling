import bowlingHall from '../models/bowlingHall.json'
import bowlingBall from '../models/bowlingBall.json'
import bowlingPin from '../models/bowlingPin.json'

import wallsImg from '../textures/walls.png'
import floorimg from '../textures/floor.png'
import blackWallImg from '../textures/blackWall.png'
import barrierImg from '../textures/barrier.png'
import holeImg from '../textures/hole.png'

import bowlingBallImg from '../textures/bowlingBall.png'

import bowlingPinImg from '../textures/bowlingPin.png'

export const bowlingHallModelPath = bowlingHall
export const bowlingHallTexturesPaths = [
    wallsImg,
    floorimg,
    blackWallImg,
    barrierImg,
    holeImg,
]
export const floorZ = -0.868;

export const bowlingBallModelPath = bowlingBall
export const bowlingBallTexturePath = bowlingBallImg
// export const bowlingBallInitialRotation = [-90, 0, 0];
// export const bowlingBallInitialRotation = [-30, -45, 0];
export const bowlingBallInitialRotation = [-30 * Math.PI / 180, -45 * Math.PI / 180, 0];
export const bowlingBallInitialTranslation = new Float32Array([0, 18, 0]);
export const bowlingBallRadius = 0.406;


export const bowlingPinModelPath = bowlingPin
export const bowlingPinTexturePath = bowlingPinImg

const firstBowlingPinInitialTranslation = [0, -21.4238, -1.371];
const bowlingPinXChange = 0.25844
const bowlingPinYChange = 0.44763

export const bowlingPinInitialTranslations = []
for (let i = 0; i < 4; i++) {
    for (let j = 0; j <= i; j++) {
        bowlingPinInitialTranslations.push(new Float32Array([
            firstBowlingPinInitialTranslation[0] + bowlingPinXChange*i - bowlingPinXChange * j * 2,
            firstBowlingPinInitialTranslation[1] - bowlingPinYChange*i,
            firstBowlingPinInitialTranslation[2]
        ]))
        bowlingPinInitialTranslations.push(new Float32Array([
            firstBowlingPinInitialTranslation[0] + bowlingPinXChange*i - bowlingPinXChange * j * 2,
            firstBowlingPinInitialTranslation[1] - bowlingPinYChange*i,
            firstBowlingPinInitialTranslation[2]
        ]))
        bowlingPinInitialTranslations.push(new Float32Array([
            firstBowlingPinInitialTranslation[0] + bowlingPinXChange*i - bowlingPinXChange * j * 2 - 3.06,
            firstBowlingPinInitialTranslation[1] - bowlingPinYChange*i,
            firstBowlingPinInitialTranslation[2]
        ]))
        bowlingPinInitialTranslations.push(new Float32Array([
            firstBowlingPinInitialTranslation[0] + bowlingPinXChange*i - bowlingPinXChange * j * 2 + 3.06,
            firstBowlingPinInitialTranslation[1] - bowlingPinYChange*i,
            firstBowlingPinInitialTranslation[2]
        ]))
    }
}

export const mirrorCorners = [
    [-6.02, 18, -0.75],
    [-6.02, 18, 1.5],
    [-6.02, 0, 1.5],
    [-6.02, 0, -0.75],
]

