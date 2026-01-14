export interface BoneRotation {
    x: number;
    y: number;
    z: number;
}

export type BoneRotations = Record<string, BoneRotation>;

export interface Keyframe {
    id: string;
    time: number; // Time in seconds
    rotations: BoneRotations;
}

export interface AnimationClip {
    name: string;
    duration: number;
    keyframes: Keyframe[];
}
