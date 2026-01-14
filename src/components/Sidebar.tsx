import React from 'react';
import { ChevronDown, ChevronRight, Rotate3d, RotateCcw } from 'lucide-react';

interface BoneRotation {
    x: number;
    y: number;
    z: number;
}

interface SidebarProps {
    vrm: any;
    rotations: Record<string, BoneRotation>;
    onRotationChange: (boneName: string, axis: 'x' | 'y' | 'z', value: number) => void;
    onExport: () => void;
    onFileChange: (file: File) => void;
    onBoneReset: (boneName: string) => void;
}

const BONE_GROUPS = {
    Torso: ['hips', 'spine', 'chest', 'upperChest'],
    Head: ['neck', 'head', 'leftEye', 'rightEye', 'jaw'],
    LeftArm: ['leftShoulder', 'leftUpperArm', 'leftLowerArm', 'leftHand'],
    RightArm: ['rightShoulder', 'rightUpperArm', 'rightLowerArm', 'rightHand'],
    LeftLeg: ['leftUpperLeg', 'leftLowerLeg', 'leftFoot', 'leftToes'],
    RightLeg: ['rightUpperLeg', 'rightLowerLeg', 'rightFoot', 'rightToes'],
    LeftFingers: [
        'leftThumbProximal', 'leftThumbIntermediate', 'leftThumbDistal',
        'leftIndexProximal', 'leftIndexIntermediate', 'leftIndexDistal',
        'leftMiddleProximal', 'leftMiddleIntermediate', 'leftMiddleDistal',
        'leftRingProximal', 'leftRingIntermediate', 'leftRingDistal',
        'leftLittleProximal', 'leftLittleIntermediate', 'leftLittleDistal'
    ],
    RightFingers: [
        'rightThumbProximal', 'rightThumbIntermediate', 'rightThumbDistal',
        'rightIndexProximal', 'rightIndexIntermediate', 'rightIndexDistal',
        'rightMiddleProximal', 'rightMiddleIntermediate', 'rightMiddleDistal',
        'rightRingProximal', 'rightRingIntermediate', 'rightRingDistal',
        'rightLittleProximal', 'rightLittleIntermediate', 'rightLittleDistal'
    ]
};

export const Sidebar: React.FC<SidebarProps> = ({ vrm, rotations, onRotationChange, onExport, onFileChange, onBoneReset }) => {
    const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
        Torso: true,
        Head: false,
        LeftArm: false,
        RightArm: false,
        LeftLeg: false,
        RightLeg: false,
        LeftFingers: false,
        RightFingers: false,
    });

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const getBoneNode = (boneName: string) => {
        return vrm?.humanoid?.getNormalizedBoneNode(boneName);
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800 text-sm">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950 gap-2">
                <h2 className="font-bold flex items-center gap-2 text-nowrap">
                    <Rotate3d className="w-4 h-4 text-blue-400" />
                    Controls
                </h2>
                <div className="flex gap-2">
                    <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs transition-colors border border-gray-700">
                        Open VRM
                        <input
                            type="file"
                            accept=".vrm"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files?.[0]) onFileChange(e.target.files[0]);
                            }}
                        />
                    </label>
                    <button
                        onClick={onExport}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                        Export
                    </button>
                </div>
            </div>

            {!vrm && <div className="p-4 text-center text-gray-500 mt-10">No VRM Loaded<br /><span className="text-xs opacity-70">Load a model or wait for default</span></div>}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {Object.entries(BONE_GROUPS).map(([groupName, bones]) => (
                    <div key={groupName} className="border border-gray-800 rounded-lg overflow-hidden bg-gray-800/30">
                        <button
                            className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-750 flex items-center justify-between transition-colors"
                            onClick={() => toggleGroup(groupName)}
                        >
                            <span className="font-medium text-gray-200">{groupName}</span>
                            {expandedGroups[groupName] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>

                        {expandedGroups[groupName] && (
                            <div className="p-3 space-y-4">
                                {bones.map(boneName => {
                                    const hasBone = getBoneNode(boneName);
                                    if (!hasBone) return null;

                                    return (
                                        <div key={boneName} className="space-y-2 pb-2 border-b border-gray-800 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="text-xs text-blue-300 font-mono">{boneName}</div>
                                                <button
                                                    onClick={() => onBoneReset(boneName)}
                                                    className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
                                                    title="Reset Bone"
                                                >
                                                    <RotateCcw size={10} />
                                                </button>
                                            </div>
                                            {['x', 'y', 'z'].map((axis) => (
                                                <div key={axis} className="flex items-center gap-2">
                                                    <span className="w-3 text-[10px] uppercase text-gray-500 font-bold">{axis}</span>
                                                    <input
                                                        type="range"
                                                        min="-3.14" // Pi
                                                        max="3.14"
                                                        step="0.01"
                                                        value={rotations[boneName]?.[axis as keyof BoneRotation] || 0}
                                                        onChange={(e) => onRotationChange(boneName, axis as any, parseFloat(e.target.value))}
                                                        className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                                                    />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={(rotations[boneName]?.[axis as keyof BoneRotation] || 0).toFixed(2)}
                                                        onChange={(e) => onRotationChange(boneName, axis as any, parseFloat(e.target.value))}
                                                        className="w-12 text-[10px] text-right font-mono text-gray-400 bg-transparent border-b border-gray-700 focus:border-blue-500 focus:outline-none focus:text-gray-200 transition-colors"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}

                {/* Additional Instructions */}
                <div className="text-xs text-gray-500 mt-6 p-2 border border-gray-800 rounded bg-gray-950/50">
                    Tip: Use these sliders to create key poses. Click Export to save the parameters.
                </div>
            </div>
        </div>
    );
};
