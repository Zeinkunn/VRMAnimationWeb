import React, { useRef } from 'react';
import { Play, Pause, Square, Plus, Download } from 'lucide-react';
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
    onDeleteKeyframe: _onDeleteKeyframe, // Unused for now
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

    // Simple drag implementation
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


    return (
        <div className="w-full bg-gray-900 border-t border-gray-800 p-4 flex flex-col gap-4">
            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onPlayPause}
                        className="p-2 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                    >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                        onClick={onStop}
                        className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                    >
                        <Square size={16} />
                    </button>
                    <div className="w-4" />
                    <button
                        onClick={onAddKeyframe}
                        className="flex items-center gap-2 px-3 py-2 rounded bg-green-600 hover:bg-green-500 text-white text-sm transition-colors"
                    >
                        <Plus size={14} /> Keyframe
                    </button>
                    <button
                        onClick={onExport} // We need to wire this up
                        className="flex items-center gap-2 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors ml-2"
                    >
                        <Download size={14} /> Export Anim
                    </button>
                </div>
                <div className="text-gray-400 font-mono text-sm">
                    {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
                </div>
            </div>

            {/* Timeline Track */}
            <div
                className="relative h-8 bg-gray-800 rounded cursor-pointer group"
                ref={timelineRef}
                onMouseDown={handleMouseDown}
            >
                {/* Playhead */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                />

                {/* Keyframe Markers */}
                {keyframes.map(kf => (
                    <div
                        key={kf.id}
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 rotate-45 border border-black hover:bg-yellow-200 transition-colors z-0"
                        style={{ left: `${(kf.time / duration) * 100}%`, marginLeft: '-6px' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onTimeChange(kf.time);
                        }}
                        title={`Keyframe at ${kf.time.toFixed(2)}s`}
                    >
                        {/* Delete context menu or button could go here, but kept simple for now */}
                    </div>
                ))}

                {/* Hover Highlight current position? Optional */}
                <div className="absolute top-0 bottom-0 left-0 right-0 bg-transparent" />
            </div>

            {/* Optional: List of keyframes closely for deletion? */}
            {/* For MVP, let's just rely on the scrubber jumping to it and having a delete button in the controls? 
          Actually, let's add a "Delete Keyframe" button that is active if close to a keyframe? 
          Or just a list below. Let's keep it clean. 
          Maybe right-click on marker? 
          Let's just add a generic "Delete Keyframe at Current Time" button logic in App or here. 
      */}
            <div className="flex gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-400 rotate-45"></div> Keyframe</span>
                <span className="flex items-center gap-1"><div className="w-0.5 h-3 bg-red-500"></div> Playhead</span>
            </div>
        </div>
    );
};
