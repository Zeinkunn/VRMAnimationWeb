
import React, { Suspense, useEffect } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three-stdlib';
import type { BoneRotations } from '../types';

interface SceneProps {
    vrmFile: string | null;
    onVrmLoaded?: (vrm: any) => void;
    rotations: BoneRotations;
}

const Model = ({ vrmFile, onVrmLoaded, rotations }: SceneProps) => {
    // vrmFile is guaranteed to be non-null here due to parent check
    const gltf = useLoader(GLTFLoader, vrmFile!, (loader) => {
        loader.register((parser) => {
            return new VRMLoaderPlugin(parser as any) as any;
        });
    });

    useEffect(() => {
        if (gltf && gltf.userData.vrm) {
            const vrm = gltf.userData.vrm;
            VRMUtils.rotateVRM0(vrm);

            // Cleanup previous VRM if needed or just replace
            // VRM needs to be added to scene manually if using plain loader, 
            // but R3F primitive handles it.

            if (onVrmLoaded) onVrmLoaded(vrm);
        }
    }, [gltf, onVrmLoaded]);

    useFrame((_state, delta) => {
        if (gltf.userData.vrm) {
            const vrm = gltf.userData.vrm;
            vrm.update(delta);

            // Apply rotations
            if (rotations) {
                Object.entries(rotations).forEach(([boneName, rotation]) => {
                    const node = vrm.humanoid.getNormalizedBoneNode(boneName);
                    if (node) {
                        node.rotation.x = rotation.x;
                        node.rotation.y = rotation.y;
                        node.rotation.z = rotation.z;
                    }
                });
            }
        }
    });

    return <primitive object={gltf.scene} />;
};

export const Scene: React.FC<SceneProps> = ({ vrmFile, onVrmLoaded, rotations }) => {
    return (
        <div className="w-full h-full bg-gray-900">
            <Canvas camera={{ position: [0, 1.5, 3], fov: 45 }} shadows>
                <ambientLight intensity={0.5} />
                <directionalLight position={[1, 2, 1]} intensity={1} castShadow />
                <OrbitControls target={[0, 1, 0]} />
                <Grid args={[10, 10]} cellColor="gray" sectionColor="white" sectionThickness={1} cellThickness={0.5} infiniteGrid />

                <Suspense fallback={null}>
                    {vrmFile && <Model vrmFile={vrmFile} onVrmLoaded={onVrmLoaded} rotations={rotations} />}
                </Suspense>
            </Canvas>
        </div>
    );
};
