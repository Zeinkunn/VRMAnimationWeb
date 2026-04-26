import React from 'react';
import { ChevronDown, ChevronRight, Bone } from 'lucide-react';

interface HierarchyPanelProps {
    vrm: any;
    selectedBone: string | null;
    onSelectedBoneChange: (boneName: string | null) => void;
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

export const HierarchyPanel: React.FC<HierarchyPanelProps> = ({ vrm, selectedBone, onSelectedBoneChange }) => {
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
        <div className="flex flex-col h-full bg-gray-100 dark:bg-[#1a1a1a] border-r border-gray-300 dark:border-gray-800 text-xs text-gray-800 dark:text-gray-300 transition-colors">
            <div className="p-2 border-b border-gray-300 dark:border-gray-800 flex justify-between items-center bg-gray-200 dark:bg-[#111111] transition-colors">
                <h2 className="font-bold flex items-center gap-2 uppercase tracking-wider text-[11px] text-gray-600 dark:text-gray-400">
                    <Bone size={14} className="text-blue-500" />
                    Hierarchy
                </h2>
            </div>

            {!vrm ? (
                <div className="p-4 text-center text-gray-500 mt-4 opacity-50">No VRM Loaded</div>
            ) : (
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {Object.entries(BONE_GROUPS).map(([groupName, bones]) => {
                        const hasBones = bones.some(b => getBoneNode(b));
                        if (!hasBones) return null;

                        return (
                            <div key={groupName} className="select-none">
                                <div
                                    className="flex items-center gap-1 px-1 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer transition-colors"
                                    onClick={() => toggleGroup(groupName)}
                                >
                                    {expandedGroups[groupName] ? <ChevronDown size={12} className="text-gray-500" /> : <ChevronRight size={12} className="text-gray-500" />}
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{groupName}</span>
                                </div>

                                {expandedGroups[groupName] && (
                                    <div className="ml-4 space-y-0.5 border-l border-gray-300 dark:border-gray-800 pl-1 my-1">
                                        {bones.map(boneName => {
                                            if (!getBoneNode(boneName)) return null;
                                            const isSelected = selectedBone === boneName;

                                            return (
                                                <div
                                                    key={boneName}
                                                    onClick={() => onSelectedBoneChange(isSelected ? null : boneName)}
                                                    className={`
                                                        px-2 py-1 rounded cursor-pointer flex items-center gap-2 font-mono text-[11px] transition-colors
                                                        ${isSelected 
                                                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold' 
                                                            : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                        }
                                                    `}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-500' : 'bg-transparent border border-gray-400'}`} />
                                                    {boneName}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
