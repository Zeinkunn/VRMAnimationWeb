import { useState, useCallback } from 'react';
import { Scene } from './components/Scene';
import { Sidebar } from './components/Sidebar';
import type { BoneRotations } from './types';

function App() {
  const [vrm, setVrm] = useState<any>(null);
  const [rotations, setRotations] = useState<BoneRotations>({});

  const [vrmFile, setVrmFile] = useState<string | null>(null);

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
    setRotations(prev => ({
      ...prev,
      [boneName]: {
        ...prev[boneName] || { x: 0, y: 0, z: 0 },
        [axis]: value
      }
    }));
  }, []);

  const handleBoneReset = useCallback((boneName: string) => {
    setRotations(prev => {
      const newRotations = { ...prev };
      delete newRotations[boneName]; // Removing it resets to default (0,0,0) in logic effectively, but let's be explicit if we want to keep the entry or just remove it. 
      // Actually, removing it is cleaner as long as the UI handles undefined as 0.
      // Looking at Sidebar: `value={(rotations[boneName]?.[axis] || 0) ...}` handles it.
      // Looking at Scene: `Object.entries(rotations)` iterates. If key is missing, it won't be applied.
      // However, if we remove it, the previous rotation might persist in the VRM model because useFrame only applies *entries present in rotations*.

      // FIX: We must explicitly set to 0,0,0 OR handle "reset" in useFrame to clear distinct bones.
      // Simplest way: Set to 0,0,0.
      return {
        ...prev,
        [boneName]: { x: 0, y: 0, z: 0 }
      };
    });
  }, []);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rotations, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "pose_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950 text-white">
      {/* 3D Scene Area */}
      <div className="flex-1 relative">
        <Scene vrmFile={vrmFile} onVrmLoaded={handleVrmLoaded} rotations={rotations} />
      </div>

      {/* Sidebar Controls */}
      <div className="w-80 border-l border-gray-800 bg-gray-900 h-full overflow-y-auto">
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
  );
}

export default App;
