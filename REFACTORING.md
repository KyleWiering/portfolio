# Repository Structure Reorganization

## Overview

This document describes the reorganization of the 3D Model Viewer codebase to support better modularity and extensibility.

## Changes Made

### New Directory Structure

#### `/src/core/` - Core shared modules
- **`/types/`** - Shared TypeScript interfaces and type definitions
  - `ObjectConfig` - Configuration for creating 3D objects
  - `GridPosition` - 2D grid position type
  - `ObjectType` - Supported object types
  - `MovementDirection` - Movement direction type
  
- **`/textures/`** - Texture generation utilities
  - `createGradientTexture()` - Blue-purple gradient for cubes
  - `createStripedTexture()` - Green striped pattern for spheres
  - `createCheckeredTexture()` - Orange checkered pattern for pyramids

#### `/src/objects/` - 3D object definitions
- **`/geometries/`** - Geometry creators (moved from `/src/models/`)
  - `cube.ts` - Cube geometry with texture support
  - `sphere.ts` - Sphere geometry with texture support
  - `pyramid.ts` - Pyramid geometry with texture support
  - `index.ts` - Barrel exports for easy imports
  
- **`/behaviors/`** - Object behavior patterns
  - `ObjectBehavior` interface - Extensible behavior contract
  - `GridMovementBehavior` - Standard grid-based movement
  - Supports unique movement patterns per object type

### Removed
- `/src/models/` - Replaced by `/src/objects/geometries/`

### Modified Files
- `src/managers/modelManager.ts` - Updated to use new structure and behavior pattern
- `src/controllers/inputController.ts` - Updated to use shared types
- `ARCHITECTURE.md` - Updated documentation

## Benefits

1. **Better Modularity**: Clear separation between types, textures, geometry, and behavior
2. **DRY Principle**: Eliminated duplicate code (ModelConfig, texture generation)
3. **Extensibility**: Easy to add new object types with unique behaviors
4. **Type Safety**: Shared types ensure consistency across modules
5. **Scalability**: Structure supports adding diverse object types with different:
   - Movement patterns (jumping, floating, teleporting, etc.)
   - Interaction patterns (selectable, draggable, clickable, etc.)
   - Animation patterns (spinning, pulsing, morphing, etc.)

## How to Extend

### Adding a New Object Type

1. Create geometry in `/src/objects/geometries/newObject.ts`:
```typescript
import { ObjectConfig } from '../../core/types';
import { createCustomTexture } from '../../core/textures/textureGenerator';

export function createNewObject(config: ObjectConfig): THREE.Mesh {
  const geometry = new THREE.CustomGeometry(...);
  // ... implement
}
```

2. (Optional) Add custom texture in `/src/core/textures/textureGenerator.ts`

3. (Optional) Create custom behavior in `/src/objects/behaviors/`:
```typescript
import { ObjectBehavior } from './objectBehavior';

export class CustomBehavior implements ObjectBehavior {
  move(...) { /* custom movement */ }
  animate(...) { /* custom animation */ }
  onSelect(...) { /* custom selection */ }
}
```

4. Update `/src/core/types/index.ts` to include new object type
5. Use in ModelManager or create new managers for complex scenarios

## Migration Notes

All imports have been updated to use the new structure. The old `/src/models/` directory has been removed. The functionality remains the same, but the code is now better organized for future expansion.
