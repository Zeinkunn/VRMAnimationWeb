# VRM Animation Web

A web application built with React, TypeScript, and Vite for loading and animating VRM 3D models. This tool allows users to pose VRM characters, interactively adjust bone rotations, and export pose data.

## Features

- **Interactive 3D Scene**: View and manipulate 3D VRM models in real-time.
- **VRM Model Support**: Load custom `.vrm` files directly into the scene.
- **Granular Bone Control**: Precise control over individual bone rotations, including limbs and fingers.
- **Pose Export system**: Save and export your custom poses as JSON data.
- **Modern UI**: Clean and responsive user interface styled with Tailwind CSS.

## Tech Stack

- **Core**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **3D & VRM**: 
  - [Three.js](https://threejs.org/)
  - [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
  - [@react-three/drei](https://github.com/pmndrs/drei)
  - [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [clsx](https://github.com/lukeed/clsx), [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd VRM-Animation-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at standard Vite port, usually `http://localhost:5173`.

### Building for Production

Create a production-ready build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

- `src/components`: Reusable UI and 3D components.
- `src/App.tsx`: Main application component.
- `src/types.ts`: TypeScript type definitions.
- `public`: Static assets.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
