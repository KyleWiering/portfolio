# 3D Model Viewer - Architecture

This document describes the architecture of the 3D Model Viewer application.

## Separation of Concerns

The application is organized into distinct modules with clear responsibilities:

### 📁 `/src/core/`
**Shared Core Modules** - Common types, utilities, and resources

#### `/src/core/types/`
- Defines shared interfaces and type definitions
- `ObjectConfig`, `GridPosition`, `ObjectType`, `MovementDirection`
- Ensures type consistency across all modules

#### `/src/core/textures/`
- **textureGenerator.ts** - Procedural texture creation
- Provides texture generators for different object types
- Gradient, striped, and checkered patterns
- Reusable texture utilities

### 📁 `/src/objects/`
**3D Object Definitions** - Geometry and behavior modules

#### `/src/objects/geometries/`
- **cube.ts**, **sphere.ts**, **pyramid.ts** - Geometry creators
- Each creates a THREE.Mesh with optional texture support
- Uses shared textures from core module
- Cleanly separated geometry definitions

#### `/src/objects/behaviors/`
- **objectBehavior.ts** - Behavior interfaces and implementations
- `ObjectBehavior` interface for extensible behavior patterns
- `GridMovementBehavior` - Standard grid-based movement
- Supports different movement patterns and animations
- Easy to extend for unique object behaviors

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
- Delegates movement to object behaviors
- Manages model rotation for animation
- Uses behavior pattern for extensible functionality

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

## Data Flow

```
User Input (Keyboard/Touch)
    ↓
InputController
    ↓ (movement callback)
ModelManager
    ↓ (delegates to)
ObjectBehavior → Updates mesh position/state
    ↓
SceneRenderer (render)
    ↑
MenuController
    ↑
User Interaction (UI Clicks)
```

## Extensibility

The new architecture supports easy extension:

1. **New Object Types**: Add geometry creators in `/src/objects/geometries/`
2. **Custom Behaviors**: Implement `ObjectBehavior` interface for unique movement patterns
3. **Texture Variations**: Add texture generators in `/src/core/textures/`
4. **Shared Types**: Update `/src/core/types/` for new object types

## Benefits

1. **Maintainability**: Each module has a single, clear responsibility
2. **Testability**: Modules can be tested independently
3. **Reusability**: Components can be reused in other projects
4. **Scalability**: Easy to add new features, objects, or behaviors
5. **Modularity**: Clear separation between geometry, behavior, and presentation
6. **Extensibility**: Behavior pattern allows diverse object interactions
7. **DRY Principle**: Shared types and textures eliminate code duplication
8. **GitHub Actions Compatibility**: Clean separation makes CI/CD easier

## Main Entry Point

`/src/game.ts` - Initializes all modules and wires them together:
1. Creates SceneRenderer
2. Creates ModelManager with scene reference
3. Creates MenuController
4. Creates InputController with canvas reference
5. Sets up callbacks between modules
6. Initializes animation loop
