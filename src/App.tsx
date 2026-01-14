import { useState, useCallback, useEffect, useRef } from 'react';
import { Scene } from './components/Scene';
import { Sidebar } from './components/Sidebar';
import { Timeline } from './components/Timeline';
import type { BoneRotations, Keyframe } from './types';

function App() {
  const [vrm, setVrm] = useState<any>(null);
  const [rotations, setRotations] = useState<BoneRotations>({});

  // Animation State
  const [duration] = useState(10); // seconds
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);

  const [vrmFile, setVrmFile] = useState<string | null>(null);

  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  const handleVrmLoaded = useCallback((loadedVrm: any) => {
    setVrm(loadedVrm);
    console.log('VRM set in App', loadedVrm);
  }, []);

  const handleFileChange = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setVrmFile(url);
    setVrm(null); // Reset current vrm
  }, []);

  const handleRotationChange = useCallback((boneName: string, axis: 'x' | 'y' | 'z', value: number) => {
    if (isPlaying) return; // Disable manual control while playing

    setRotations(prev => ({
      ...prev,
      [boneName]: {
        ...prev[boneName] || { x: 0, y: 0, z: 0 },
        [axis]: value
      }
    }));
  }, [isPlaying]);

  const handleBoneReset = useCallback((boneName: string) => {
    if (isPlaying) return;
    setRotations(prev => {
      return {
        ...prev,
        [boneName]: { x: 0, y: 0, z: 0 }
      };
    });
  }, [isPlaying]);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rotations, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "pose_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Animation Logic
  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined && previousTimeRef.current !== null) {
      const deltaTime = (time - previousTimeRef.current) / 1000;

      setCurrentTime(prevTime => {
        let newTime = prevTime + deltaTime;
        if (newTime >= duration) {
          newTime = 0; // Loop
        }
        return newTime;
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = null;
    }
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, duration]);

  // Interpolation System
  useEffect(() => {
    // Whenever currentTime changes, calculate new rotations
    if (keyframes.length === 0) return;

    // Sort keyframes
    const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);

    // Find surrounding keyframes
    // If we have keyframes, we want to interpolate between them.
    // If time is before first keyframe, use first.
    // If time is after last, use last.

    // Simplest approach: Interpolate between the two closest frames.

    const prevKeyframe = sortedKeyframes.filter(k => k.time <= currentTime).pop();
    const nextKeyframe = sortedKeyframes.find(k => k.time > currentTime);

    if (!prevKeyframe && !nextKeyframe) return;

    let newRotations: BoneRotations = {};

    if (!prevKeyframe && nextKeyframe) {
      // Before first keyframe
      newRotations = nextKeyframe.rotations;
    } else if (prevKeyframe && !nextKeyframe) {
      // After last keyframe
      newRotations = prevKeyframe.rotations;
    } else if (prevKeyframe && nextKeyframe) {
      // Linear Interpolation
      const t1 = prevKeyframe.time;
      const t2 = nextKeyframe.time;
      const factor = (currentTime - t1) / (t2 - t1);

      // Merge all bones from both
      const allBones = new Set([
        ...Object.keys(prevKeyframe.rotations),
        ...Object.keys(nextKeyframe.rotations)
      ]);

      allBones.forEach(bone => {
        const rot1 = prevKeyframe.rotations[bone] || { x: 0, y: 0, z: 0 };
        const rot2 = nextKeyframe.rotations[bone] || { x: 0, y: 0, z: 0 };

        newRotations[bone] = {
          x: rot1.x + (rot2.x - rot1.x) * factor,
          y: rot1.y + (rot2.y - rot1.y) * factor,
          z: rot1.z + (rot2.z - rot1.z) * factor,
        };
      });
    }

    setRotations(newRotations);
  }, [currentTime, keyframes, isPlaying]); // Depend on currentTime which updates every frame

  // Timeline Handlers
  const handleTogglePlay = () => setIsPlaying(p => !p);
  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleAddKeyframe = () => {
    const newKeyframe: Keyframe = {
      id: Math.random().toString(36).substr(2, 9),
      time: currentTime,
      rotations: JSON.parse(JSON.stringify(rotations)) // Deep copy
    };

    // Remove existing keyframe at same time if any (or very close)
    const filtered = keyframes.filter(k => Math.abs(k.time - currentTime) > 0.05);
    setKeyframes([...filtered, newKeyframe]);
  };

  const handleDeleteKeyframe = (id: string) => {
    // Not implemented in UI yet, but handler exists
    setKeyframes(prev => prev.filter(k => k.id !== id));
  };

  const handleExportAnimation = () => {
    const exportData = {
      duration,
      keyframes
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "animation.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-950 text-white">
      <div className="flex flex-1 overflow-hidden">
        {/* 3D Scene Area */}
        <div className="flex-1 relative">
          <Scene vrmFile={vrmFile} onVrmLoaded={handleVrmLoaded} rotations={rotations} />
        </div>

        {/* Sidebar Controls */}
        <div className="w-80 border-l border-gray-800 bg-gray-900 h-full overflow-y-auto z-10">
          <Sidebar
            vrm={vrm}
            rotations={rotations}
            onRotationChange={handleRotationChange}
            onExport={handleExport}
            onFileChange={handleFileChange}
            onBoneReset={handleBoneReset}
          />
        </div>
      </div>

      {/* Timeline Area */}
      <div className="h-48 z-20">
        <Timeline
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          keyframes={keyframes}
          onTimeChange={(t) => {
            setCurrentTime(t);
            if (isPlaying) setIsPlaying(false); // Pause on scrub
          }}
          onPlayPause={handleTogglePlay}
          onStop={handleStop}
          onAddKeyframe={handleAddKeyframe}
          onDeleteKeyframe={handleDeleteKeyframe}
          onExport={handleExportAnimation}
        />
      </div>
    </div>
  );
}

export default App;
