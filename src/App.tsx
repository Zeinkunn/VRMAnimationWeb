import { useState, useCallback, useEffect, useRef } from 'react';
import { Scene } from './components/Scene';
import { Sidebar as InspectorPanel } from './components/Sidebar';
import { HierarchyPanel } from './components/HierarchyPanel';
import { Timeline } from './components/Timeline';
import { Moon, Sun, Save, FolderOpen, Video, Grid3x3, Palette, Monitor } from 'lucide-react';
import type { BoneRotations, Keyframe } from './types';

function App() {
  const [vrm, setVrm] = useState<any>(null);
  const [rotations, setRotations] = useState<BoneRotations>({});
  const [expressions, setExpressions] = useState<Record<string, number>>({});
  const [selectedBone, setSelectedBone] = useState<string | null>(null);
  const [gizmoMode, setGizmoMode] = useState<'translate' | 'rotate' | 'scale'>('rotate');
  
  // Theme & Viewport
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [bgColor, setBgColor] = useState<string>(''); // empty means use theme default

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

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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

  const handleExportPose = () => {
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
    if (keyframes.length === 0) return;

    const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);
    const prevKeyframe = sortedKeyframes.filter(k => k.time <= currentTime).pop();
    const nextKeyframe = sortedKeyframes.find(k => k.time > currentTime);

    if (!prevKeyframe && !nextKeyframe) return;

    let newRotations: BoneRotations = {};

    if (!prevKeyframe && nextKeyframe) {
      newRotations = nextKeyframe.rotations;
    } else if (prevKeyframe && !nextKeyframe) {
      newRotations = prevKeyframe.rotations;
    } else if (prevKeyframe && nextKeyframe) {
      const t1 = prevKeyframe.time;
      const t2 = nextKeyframe.time;
      const factor = (currentTime - t1) / (t2 - t1);

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
  }, [currentTime, keyframes, isPlaying]);

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
      rotations: JSON.parse(JSON.stringify(rotations))
    };

    const filtered = keyframes.filter(k => Math.abs(k.time - currentTime) > 0.05);
    setKeyframes([...filtered, newKeyframe]);
  };

  const handleDeleteKeyframe = (id: string) => {
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
    <div className={`flex flex-col h-screen w-screen overflow-hidden text-sm transition-colors duration-200 ${isDarkMode ? 'dark bg-[#111111] text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
      
      {/* Top Menu Bar */}
      <div className="h-10 flex items-center justify-between px-4 border-b bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-gray-800 shadow-sm z-50 transition-colors">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
            <Video size={18} />
            <span>VRM Animator</span>
          </div>
          <div className="flex items-center gap-1">
            <label className="cursor-pointer px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1.5 text-xs font-medium transition-colors">
              <FolderOpen size={14} /> Open VRM
              <input type="file" accept=".vrm" className="hidden" onChange={handleFileChange} />
            </label>
            <button onClick={handleExportPose} className="px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1.5 text-xs font-medium transition-colors">
              <Save size={14} /> Save Pose
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-gray-500 dark:text-gray-400">FPS: 60</div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Hierarchy */}
        <div className="w-64 flex-shrink-0 z-20 shadow-[1px_0_10px_rgba(0,0,0,0.05)] dark:shadow-none">
          <HierarchyPanel 
            vrm={vrm}
            selectedBone={selectedBone}
            onSelectedBoneChange={setSelectedBone}
          />
        </div>

        {/* Center: 3D Scene Area */}
        <div className="flex-1 relative bg-gray-200 dark:bg-black/50 transition-colors overflow-hidden">
          {/* Viewport Toolbar */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
             <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-1.5 rounded-md shadow-sm border transition-colors backdrop-blur-md flex items-center justify-center ${showGrid ? 'bg-blue-500/20 border-blue-500/50 text-blue-600 dark:text-blue-400' : 'bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'}`}
                title="Toggle Grid"
             >
                <Grid3x3 size={16} />
             </button>
             
             {/* Background Color Picker - Fake button that triggers input color */}
             <div className="relative group">
                 <label 
                    className="cursor-pointer p-1.5 rounded-md shadow-sm border bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-colors backdrop-blur-md flex items-center justify-center"
                    title="Change Background Color"
                 >
                    <Palette size={16} />
                    <input 
                       type="color" 
                       value={bgColor || (isDarkMode ? '#000000' : '#e5e7eb')} 
                       onChange={(e) => setBgColor(e.target.value)} 
                       className="absolute opacity-0 w-0 h-0"
                    />
                 </label>
             </div>

             {/* Clear Background */}
             {bgColor && (
                 <button
                    onClick={() => setBgColor('')}
                    className="p-1.5 rounded-md shadow-sm border bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-red-500 transition-colors backdrop-blur-md flex items-center justify-center"
                    title="Reset Background"
                 >
                    <Monitor size={16} />
                 </button>
             )}
          </div>

          <Scene 
            vrmFile={vrmFile} 
            onVrmLoaded={handleVrmLoaded} 
            rotations={rotations}
            expressions={expressions}
            selectedBone={selectedBone}
            gizmoMode={gizmoMode}
            onRotationChange={handleRotationChange}
            showGrid={showGrid}
            bgColor={bgColor}
          />
        </div>

        {/* Right Panel: Inspector */}
        <div className="w-72 flex-shrink-0 z-20 shadow-[-1px_0_10px_rgba(0,0,0,0.05)] dark:shadow-none">
          <InspectorPanel
            vrm={vrm}
            rotations={rotations}
            expressions={expressions}
            selectedBone={selectedBone}
            gizmoMode={gizmoMode}
            onRotationChange={handleRotationChange}
            onExpressionChange={(name, val) => setExpressions(prev => ({ ...prev, [name]: val }))}
            onGizmoModeChange={setGizmoMode}
            onBoneReset={handleBoneReset}
          />
        </div>
      </div>

      {/* Bottom Panel: Timeline */}
      <div className="h-56 z-30 shadow-[0_-1px_10px_rgba(0,0,0,0.05)] dark:shadow-none">
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
