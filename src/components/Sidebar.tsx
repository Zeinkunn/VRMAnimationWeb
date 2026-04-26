import React from 'react';
import { ChevronDown, ChevronRight, Rotate3d, RotateCcw, Move3d, Maximize, Smile, Settings2 } from 'lucide-react';

interface BoneRotation {
    x: number;
    y: number;
    z: number;
}

interface SidebarProps {
    vrm: any;
    rotations: Record<string, BoneRotation>;
    expressions: Record<string, number>;
    selectedBone: string | null;
    gizmoMode: 'translate' | 'rotate' | 'scale';
    onRotationChange: (boneName: string, axis: 'x' | 'y' | 'z', value: number) => void;
    onExpressionChange: (name: string, value: number) => void;
    onGizmoModeChange: (mode: 'translate' | 'rotate' | 'scale') => void;
    onBoneReset: (boneName: string) => void;
}

interface SliderInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
}

const SliderInput: React.FC<SliderInputProps> = ({ value, onChange, min = -3.14, max = 3.14, step = 0.01, className }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 0.1 : -0.1;
            const newVal = Math.max(min, Math.min(max, value + delta));
            onChange(newVal);
        };

        const currentInput = inputRef.current;
        if (currentInput) {
            currentInput.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (currentInput) {
                currentInput.removeEventListener('wheel', handleWheel);
            }
        };
    }, [value, onChange, min, max]);

    return (
        <input
            ref={inputRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className={className}
        />
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
    vrm, rotations, expressions, selectedBone, gizmoMode, 
    onRotationChange, onExpressionChange, onGizmoModeChange, onBoneReset 
}) => {
    const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
        Expressions: true,
        Transform: true
    });

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-[#1a1a1a] border-l border-gray-300 dark:border-gray-800 text-xs text-gray-800 dark:text-gray-300 transition-colors">
            <div className="p-2 border-b border-gray-300 dark:border-gray-800 flex justify-between items-center bg-gray-200 dark:bg-[#111111] transition-colors">
                <h2 className="font-bold flex items-center gap-2 uppercase tracking-wider text-[11px] text-gray-600 dark:text-gray-400">
                    <Settings2 size={14} className="text-orange-500" />
                    Inspector
                </h2>
            </div>

            {!vrm && <div className="p-4 text-center text-gray-500 mt-4 opacity-50">No Selection</div>}

            {vrm && (
                <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
                    
                    {/* Transform Group (Only visible if bone is selected) */}
                    {selectedBone && (
                        <div className="border border-gray-300 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-800/30 shadow-sm">
                            <button
                                className="w-full px-2 py-1.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-750 flex items-center justify-between transition-colors"
                                onClick={() => toggleGroup('Transform')}
                            >
                                <span className="font-bold text-[11px] uppercase tracking-wider text-gray-700 dark:text-gray-200">Transform</span>
                                {expandedGroups['Transform'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>

                            {expandedGroups['Transform'] && (
                                <div className="p-3 space-y-4">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-800">
                                        <div className="text-[11px] font-mono text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                                            {selectedBone}
                                        </div>
                                        <button
                                            onClick={() => onBoneReset(selectedBone)}
                                            className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                            title="Reset Bone"
                                        >
                                            <RotateCcw size={12} />
                                        </button>
                                    </div>

                                    {/* Gizmo Tools */}
                                    <div className="flex gap-1 bg-gray-200 dark:bg-gray-900 p-1 rounded">
                                        <button onClick={() => onGizmoModeChange('translate')} className={`flex-1 flex justify-center p-1 rounded transition-colors ${gizmoMode==='translate'?'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm':'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><Move3d size={14}/></button>
                                        <button onClick={() => onGizmoModeChange('rotate')} className={`flex-1 flex justify-center p-1 rounded transition-colors ${gizmoMode==='rotate'?'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm':'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><Rotate3d size={14}/></button>
                                        <button onClick={() => onGizmoModeChange('scale')} className={`flex-1 flex justify-center p-1 rounded transition-colors ${gizmoMode==='scale'?'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm':'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><Maximize size={14}/></button>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        {['x', 'y', 'z'].map((axis) => (
                                            <div key={axis} className="flex items-center gap-2">
                                                <span className={`w-3 text-[10px] uppercase font-bold ${axis==='x'?'text-red-500 dark:text-red-400':axis==='y'?'text-green-500 dark:text-green-400':'text-blue-500 dark:text-blue-400'}`}>{axis}</span>
                                                <SliderInput
                                                    min={-3.14} max={3.14} step={0.01}
                                                    value={rotations[selectedBone]?.[axis as keyof BoneRotation] || 0}
                                                    onChange={(val) => onRotationChange(selectedBone, axis as any, val)}
                                                    className="flex-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-600 dark:accent-gray-400"
                                                />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={(rotations[selectedBone]?.[axis as keyof BoneRotation] || 0).toFixed(2)}
                                                    onChange={(e) => onRotationChange(selectedBone, axis as any, parseFloat(e.target.value))}
                                                    className="w-12 text-[10px] text-right font-mono text-gray-700 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Expressions Group */}
                    {vrm?.expressionManager && (
                        <div className="border border-gray-300 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-800/30 shadow-sm">
                            <button
                                className="w-full px-2 py-1.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-750 flex items-center justify-between transition-colors"
                                onClick={() => toggleGroup('Expressions')}
                            >
                                <span className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                    <Smile size={12} className="text-purple-500" /> Blendshapes
                                </span>
                                {expandedGroups['Expressions'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>

                            {expandedGroups['Expressions'] && (
                                <div className="p-3 space-y-3">
                                    {vrm.expressionManager.expressions.map((exp: any) => {
                                        const expName = exp.expressionName || exp.name;
                                        if (!expName) return null;
                                        return (
                                            <div key={expName} className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center text-[10px] text-gray-600 dark:text-gray-400">
                                                    <span className="capitalize">{expName}</span>
                                                    <span className="font-mono">{(expressions[expName] || 0).toFixed(2)}</span>
                                                </div>
                                                <SliderInput
                                                    min={0} max={1} step={0.01}
                                                    value={expressions[expName] || 0}
                                                    onChange={(val) => {
                                                        if (vrm.expressionManager) {
                                                            vrm.expressionManager.setValue(expName, val);
                                                            vrm.expressionManager.update();
                                                        }
                                                        onExpressionChange(expName, val);
                                                    }}
                                                    className="w-full h-1 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
