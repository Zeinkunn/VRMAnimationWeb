# VRM Animation Web

A web application built with React, TypeScript, and Vite for loading and animating VRM 3D models. This tool allows users to pose VRM characters, interactively adjust bone rotations, and export pose data.

## Features

- **Interactive 3D Scene**: View and manipulate 3D VRM models in real-time.
- **VRM Model Support**: Load custom `.vrm` files directly into the scene.
- **Granular Bone Control**: Precise control over individual bone rotations, including limbs and fingers.
- **Pose Export system**: Save and export your custom poses as JSON data.
- **Modern UI**: Clean and responsive user interface styled with Tailwind CSS.
- **Professional Layout**: 4-panel UI inspired by industry standards (Blender, Live2D Cubism).
- **Dark/Light Mode**: Aesthetic and comfortable viewing in any environment.
- **Bone Manipulation**: 3D Gizmo (Translate, Rotate, Scale) with real-time feedback.
- **Expression Control**: Sliders for facial blendshapes.
- **Timeline & Dope Sheet**: Add keyframes, scrub through time, and visualize your animation.
- **Export Capabilities**: Save your pose data or animation as JSON.

## Author & License

- **Created By**: Zeinkunn
- **License**: Commercial Use License
  - This software is fully licensed for commercial use. You are free to use it for creating animations, videos, and professional projects without restrictions on monetization.

## Development Setup

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Technologies Used

- React 19
- Three.js
- React Three Fiber (`@react-three/fiber`)
- React Three Drei (`@react-three/drei`)
- Pixiv Three VRM (`@pixiv/three-vrm`)
- TailwindCSS
- Vite
- TypeScript

## Project Structure

- `src/components`: Reusable UI and 3D components.
- `src/App.tsx`: Main application component.
- `src/types.ts`: TypeScript type definitions.
- `public`: Static assets.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
