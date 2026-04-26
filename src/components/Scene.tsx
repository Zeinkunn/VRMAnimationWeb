import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, TransformControls } from '@react-three/drei';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three-stdlib';
import type { BoneRotations } from '../types';
import * as THREE from 'three';

interface SceneProps {
    vrmFile: string | null;
    onVrmLoaded?: (vrm: any) => void;
    rotations: BoneRotations;
    expressions?: Record<string, number>;
    selectedBone?: string | null;
    gizmoMode?: 'translate' | 'rotate' | 'scale';
    onRotationChange?: (boneName: string, axis: 'x' | 'y' | 'z', value: number) => void;
    showGrid?: boolean;
    bgColor?: string;
}

const Model = ({ vrmFile, onVrmLoaded, rotations, expressions, selectedBone, gizmoMode, onRotationChange }: SceneProps) => {
    // vrmFile is guaranteed to be non-null here due to parent check
    const gltf = useLoader(GLTFLoader, vrmFile!, (loader) => {
        loader.register((parser) => {
            return new VRMLoaderPlugin(parser as any) as any;
        });
    });

    const [vrm, setVrm] = useState<any>(null);
    const [boneNode, setBoneNode] = useState<THREE.Object3D | null>(null);
    const [skeletonHelper, setSkeletonHelper] = useState<THREE.SkeletonHelper | null>(null);

    // Use Refs to guarantee useFrame always sees the absolute latest state
    const expressionsRef = useRef<Record<string, number>>({});
    const rotationsRef = useRef<BoneRotations>({});

    useEffect(() => {
        if (expressions) {
            expressionsRef.current = expressions;
        }
    }, [expressions]);

    useEffect(() => {
        if (rotations) {
            rotationsRef.current = rotations;
        }
    }, [rotations]);

    useEffect(() => {
        if (gltf && gltf.userData.vrm) {
            const vrmInstance = gltf.userData.vrm;
            VRMUtils.rotateVRM0(vrmInstance);
            setVrm(vrmInstance);
            
            // Create a skeleton helper so user can see all bones
            const helper = new THREE.SkeletonHelper(gltf.scene);
            setSkeletonHelper(helper);

            if (onVrmLoaded) onVrmLoaded(vrmInstance);
        }
    }, [gltf, onVrmLoaded]);

    // Determine target node for TransformControls
    useEffect(() => {
        if (vrm && selectedBone) {
            const node = vrm.humanoid.getNormalizedBoneNode(selectedBone);
            if (node) {
                setBoneNode(node);
            } else {
                setBoneNode(null);
            }
        } else {
            setBoneNode(null);
        }
    }, [vrm, selectedBone]);

    useFrame((_state, delta) => {
        if (vrm) {
            // 1. Apply expressions BEFORE update using REF to avoid any stale closures
            if (vrm.expressionManager) {
                Object.entries(expressionsRef.current).forEach(([name, value]) => {
                    vrm.expressionManager.setValue(name, value);
                });
            }

            // 2. Update VRM
            vrm.update(delta);

            // 3. Apply rotations AFTER update using REF
            if (rotationsRef.current) {
                Object.entries(rotationsRef.current).forEach(([boneName, rotation]) => {
                    const node = vrm.humanoid.getNormalizedBoneNode(boneName);
                    // Prevent stuttering by NOT applying React state to the bone that is actively being dragged
                    if (node && node !== boneNode) {
                        node.rotation.x = rotation.x;
                        node.rotation.y = rotation.y;
                        node.rotation.z = rotation.z;
                    }
                });
            }
        }
    });

    return (
        <>
            <primitive object={gltf.scene} />
            {/* Render the skeleton lines over the character */}
            {skeletonHelper && <primitive object={skeletonHelper} />}
            
            {/* Render the 3D Gizmo */}
            {boneNode && (
                <TransformControls 
                    object={boneNode} 
                    mode={gizmoMode || 'rotate'}
                    space={gizmoMode === 'rotate' ? 'local' : 'world'}
                    size={1} // Normal size
                    onChange={() => {
                        // Sync rotation while dragging
                        if (onRotationChange && selectedBone && boneNode) {
                            onRotationChange(selectedBone, 'x', boneNode.rotation.x);
                            onRotationChange(selectedBone, 'y', boneNode.rotation.y);
                            onRotationChange(selectedBone, 'z', boneNode.rotation.z);
                        }
                    }}
                />
            )}
        </>
    );
};

export const Scene: React.FC<SceneProps> = ({ 
    vrmFile, onVrmLoaded, rotations, expressions, selectedBone, gizmoMode, onRotationChange,
    showGrid = true, bgColor
}) => {
    return (
        <div className="w-full h-full" style={{ backgroundColor: bgColor || 'transparent' }}>
            <Canvas camera={{ position: [0, 1.2, 2.5], fov: 45 }} shadows>
                <ambientLight intensity={0.5} />
                <directionalLight position={[1, 2, 1]} intensity={1} castShadow />
                
                {/* makeDefault allows TransformControls to automatically disable orbiting while dragging the gizmo */}
                <OrbitControls target={[0, 1.2, 0]} makeDefault />
                
                {showGrid && <Grid args={[10, 10]} cellColor="gray" sectionColor="white" sectionThickness={1} cellThickness={0.5} infiniteGrid fadeDistance={20} />}

                <Suspense fallback={null}>
                    {vrmFile && <Model 
                        vrmFile={vrmFile} 
                        onVrmLoaded={onVrmLoaded} 
                        rotations={rotations} 
                        expressions={expressions}
                        selectedBone={selectedBone}
                        gizmoMode={gizmoMode}
                        onRotationChange={onRotationChange}
                    />}
                </Suspense>
            </Canvas>
        </div>
    );
};
