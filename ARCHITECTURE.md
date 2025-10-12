# 3D Model Viewer - Architecture

This document describes the architecture of the 3D Model Viewer application.

## Separation of Concerns

The application is organized into distinct modules with clear responsibilities:

### 📁 `/src/rendering/`
**SceneRenderer** - Handles WebGL scene setup and rendering
- Creates and manages the THREE.js scene, camera, and renderer
- Sets up lighting (ambient and point lights)
- Creates the isometric grid
- Handles window resize events
- Provides render method for the animation loop

### 📁 `/src/managers/`
**ModelManager** - Manages model lifecycle and grid positioning
- Creates and displays 3D models (pyramid, cube, sphere)
- Manages model disposal and cleanup
- Handles grid-based positioning
- Provides movement methods (left, right, forward, backward)
- Manages model rotation for animation

### 📁 `/src/ui/`
**MenuController** - Handles menu UI interactions
- Manages model selection buttons
- Handles texture toggle checkbox
- Controls settings panel visibility
- Provides callbacks for model and texture changes
- Manages active state of UI elements

### 📁 `/src/controllers/`
**InputController** - Handles keyboard and touch input
- Keyboard controls for desktop (arrow keys)
- Touch/swipe controls for mobile devices
- Provides movement callbacks
- Manages input thresholds and validation

### 📁 `/src/models/`
**Model Creators** - Individual model creation functions
- `createPyramid()` - Creates pyramid geometry
- `createCube()` - Creates cube geometry
- `createSphere()` - Creates sphere geometry

## Data Flow

```
User Input (Keyboard/Touch)
    ↓
InputController
    ↓ (movement callback)
ModelManager → SceneRenderer (render)
    ↑
MenuController
    ↑
User Interaction (UI Clicks)
```

## Benefits

1. **Maintainability**: Each module has a single responsibility
2. **Testability**: Modules can be tested independently
3. **Reusability**: Components can be reused in other projects
4. **Scalability**: Easy to add new features or models
5. **GitHub Actions Compatibility**: Clean separation makes CI/CD easier

## Main Entry Point

`/src/game.ts` - Initializes all modules and wires them together:
1. Creates SceneRenderer
2. Creates ModelManager with scene reference
3. Creates MenuController
4. Creates InputController with canvas reference
5. Sets up callbacks between modules
6. Initializes animation loop
