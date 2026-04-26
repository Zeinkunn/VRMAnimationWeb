import React, { useRef } from 'react';
import { Play, Pause, Square, Plus, Download, Scissors, Trash2, Clock } from 'lucide-react';
import type { Keyframe } from '../types';

interface TimelineProps {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    keyframes: Keyframe[];
    onTimeChange: (time: number) => void;
    onPlayPause: () => void;
    onStop: () => void;
    onAddKeyframe: () => void;
    onDeleteKeyframe: (id: string) => void;
    onExport: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
    currentTime,
    duration,
    isPlaying,
    keyframes,
    onTimeChange,
    onPlayPause,
    onStop,
    onAddKeyframe,
    onDeleteKeyframe,
    onExport,
}) => {
    const timelineRef = useRef<HTMLDivElement>(null);

    const handleTimelineClick = (e: React.MouseEvent) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        onTimeChange(percentage * duration);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        handleTimelineClick(e);
        const handleWindowMouseMove = (moveEvent: MouseEvent) => {
            if (!timelineRef.current) return;
            const rect = timelineRef.current.getBoundingClientRect();
            const x = moveEvent.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, x / rect.width));
            onTimeChange(percentage * duration);
        };
        const handleWindowMouseUp = () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);
    };

    // Calculate ticks for the ruler (1 tick per second, sub-ticks every 0.25s)
    const ticks = [];
    for (let i = 0; i <= duration; i += 0.25) {
        ticks.push(i);
    }

    return (
        <div className="w-full h-full bg-white dark:bg-[#1a1a1a] flex flex-col transition-colors border-t border-gray-300 dark:border-gray-800">
            {/* Toolbar */}
            <div className="h-10 border-b border-gray-300 dark:border-gray-800 flex items-center justify-between px-4 bg-gray-100 dark:bg-[#111111] transition-colors">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-0.5 rounded shadow-sm border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onPlayPause}
                            className={`p-1.5 rounded transition-colors ${isPlaying ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                        </button>
                        <button
                            onClick={onStop}
                            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                            title="Stop"
                        >
                            <Square size={14} />
                        </button>
                    </div>

                    <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-2" />

                    <button
                        onClick={onAddKeyframe}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-[11px] font-bold transition-colors shadow-sm"
                        title="Add Keyframe at current time"
                    >
                        <Plus size={14} /> Add Keyframe
                    </button>

                    <button
                        onClick={onExport}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 text-[11px] font-bold transition-colors shadow-sm"
                        title="Export Animation JSON"
                    >
                        <Download size={14} /> Export Anim
                    </button>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[11px] font-mono bg-white dark:bg-gray-800 px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700 shadow-inner">
                        <Clock size={12} className="text-gray-400" />
                        <span className="text-blue-600 dark:text-blue-400 font-bold w-12 text-right">{currentTime.toFixed(2)}s</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-500 w-12">{duration.toFixed(2)}s</span>
                    </div>
                </div>
            </div>

            {/* Dope Sheet Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left labels column */}
                <div className="w-48 flex-shrink-0 border-r border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#151515] flex flex-col">
                    <div className="h-6 border-b border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-[#111111]" /> {/* Header spacer */}
                    <div className="flex-1 p-2">
                        <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            Global Track
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                            (Contains all bone & expression data)
                        </div>
                    </div>
                </div>

                {/* Right tracks column */}
                <div className="flex-1 flex flex-col relative overflow-x-auto custom-scrollbar">
                    {/* Ruler Header */}
                    <div className="h-6 border-b border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-[#111111] relative"
                         ref={timelineRef}
                         onMouseDown={handleMouseDown}
                    >
                        {ticks.map((t) => (
                            <div
                                key={t}
                                className="absolute top-0 bottom-0 flex flex-col justify-end"
                                style={{ left: `${(t / duration) * 100}%` }}
                            >
                                <div className={`w-px bg-gray-400 dark:bg-gray-600 ${t % 1 === 0 ? 'h-3' : 'h-1.5'}`} />
                                {t % 1 === 0 && (
                                    <span className="absolute bottom-3 text-[9px] text-gray-500 font-mono -translate-x-1/2">
                                        {t}s
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Track Background & Grid */}
                    <div className="flex-1 relative bg-[length:20px_20px] dark:bg-[length:20px_20px]" 
                         style={{ 
                             backgroundImage: 'linear-gradient(to right, rgba(128,128,128,0.05) 1px, transparent 1px)',
                             backgroundSize: `${(1 / duration) * 100}% 100%`
                         }}>
                        
                        {/* The Track Row */}
                        <div className="h-8 absolute left-0 right-0 top-1 bg-blue-50/50 dark:bg-blue-900/10 border-y border-blue-100 dark:border-blue-900/30">
                            {/* Keyframes */}
                            {keyframes.map(kf => (
                                <div
                                    key={kf.id}
                                    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-yellow-400 rotate-45 border border-yellow-600 hover:bg-yellow-200 hover:scale-125 transition-all cursor-pointer z-10 shadow-sm"
                                    style={{ left: `${(kf.time / duration) * 100}%`, marginLeft: '-5px' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTimeChange(kf.time);
                                    }}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteKeyframe(kf.id);
                                    }}
                                    title={`Time: ${kf.time.toFixed(2)}s\nDouble click to delete`}
                                />
                            ))}
                        </div>

                        {/* Playhead Line */}
                        <div
                            className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
                            style={{ left: `${(currentTime / duration) * 100}%` }}
                        >
                            {/* Playhead Handle */}
                            <div className="absolute -top-6 -translate-x-1/2 w-2.5 h-3 bg-red-500" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%)' }} />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Status Bar */}
            <div className="h-6 border-t border-gray-300 dark:border-gray-800 bg-gray-200 dark:bg-[#111111] flex items-center px-4 text-[10px] text-gray-500 gap-4">
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-yellow-400 rotate-45 border border-yellow-600" /> Keyframe</span>
                <span className="flex items-center gap-1.5"><div className="w-0.5 h-2.5 bg-red-500" /> Playhead</span>
                <span className="ml-auto flex items-center gap-1"><Trash2 size={10} /> Double-click a keyframe to delete it</span>
            </div>
        </div>
    );
};
