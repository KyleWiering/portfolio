# 3D Model Viewer - Structure Overview

## Directory Tree

```
src/
├── core/                           # Shared core modules
│   ├── types/                      # Type definitions
│   │   └── index.ts                # ObjectConfig, GridPosition, ObjectType, MovementDirection
│   └── textures/                   # Texture generators
│       └── textureGenerator.ts     # Gradient, Striped, Checkered patterns
│
├── objects/                        # 3D object definitions
│   ├── geometries/                 # Geometry creators
│   │   ├── index.ts                # Barrel exports
│   │   ├── cube.ts                 # Cube geometry
│   │   ├── sphere.ts               # Sphere geometry
│   │   ├── pyramid.ts              # Pyramid geometry
│   │   └── torus.example.ts        # Example: Custom torus with FloatingBehavior
│   └── behaviors/                  # Behavior patterns
│       ├── index.ts                # Barrel exports
│       ├── objectBehavior.ts       # ObjectBehavior interface + GridMovementBehavior
│       └── exampleBehaviors.ts     # Example: Jumping, Pulsing, Static behaviors
│
├── managers/                       # State management
│   └── modelManager.ts             # Model lifecycle, grid positioning, behavior delegation
│
├── controllers/                    # Input handling
│   └── inputController.ts          # Keyboard and touch controls
│
├── rendering/                      # WebGL rendering
│   └── sceneRenderer.ts            # Scene setup, camera, lighting, grid
│
├── ui/                            # User interface
│   └── menu.ts                     # Menu controls
│
└── game.ts                         # Main entry point
```

## Component Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                         game.ts (Entry Point)                    │
│  Initializes and wires together all components                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
    ┌──────────────────┐ ┌──────────┐ ┌─────────────┐
    │ SceneRenderer    │ │ModelMgr  │ │InputCtrl    │
    │ (rendering/)     │ │(managers)│ │(controllers)│
    └──────────────────┘ └──────────┘ └─────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
           ┌──────────────┐      ┌──────────────┐
           │  Geometries  │      │  Behaviors   │
           │  (objects/)  │      │  (objects/)  │
           └──────────────┘      └──────────────┘
                    │                     │
           ┌────────┴────────┐   ┌────────┴────────┐
           │                 │   │                 │
           ▼                 ▼   ▼                 ▼
    ┌─────────┐       ┌─────────────┐      ┌──────────┐
    │ Types   │       │  Textures   │      │Interface │
    │ (core/) │       │   (core/)   │      │Behavior  │
    └─────────┘       └─────────────┘      └──────────┘
```

## Data Flow: Adding a New Object

```
1. Define Geometry
   ─────────────────────────────────────────────────
   src/objects/geometries/newObject.ts
   
   import { ObjectConfig } from '../../core/types';
   
   export function createNewObject(config: ObjectConfig) {
     // Create THREE.js geometry
     // Apply textures if config.useTexture
     return mesh;
   }

2. (Optional) Custom Texture
   ─────────────────────────────────────────────────
   src/core/textures/textureGenerator.ts
   
   export function createNewTexture(): THREE.Texture {
     // Generate procedural texture
   }

3. (Optional) Custom Behavior
   ─────────────────────────────────────────────────
   src/objects/behaviors/customBehavior.ts
   
   import { ObjectBehavior } from './objectBehavior';
   
   export class CustomBehavior implements ObjectBehavior {
     move() { /* custom movement */ }
     animate() { /* custom animation */ }
     onSelect() { /* custom selection */ }
   }

4. Update Type Definitions
   ─────────────────────────────────────────────────
   src/core/types/index.ts
   
   export type ObjectType = 'pyramid' | 'cube' | 'sphere' | 'newObject';

5. Use in ModelManager
   ─────────────────────────────────────────────────
   src/managers/modelManager.ts
   
   import { createNewObject } from '../objects/geometries/newObject';
   import { CustomBehavior } from '../objects/behaviors/customBehavior';
   
   this.models.push({
     mesh: createNewObject(config),
     type: 'newObject',
     gridPosition: pos,
     behavior: new CustomBehavior()  // or GridMovementBehavior
   });
```

## Behavior Pattern Examples

### GridMovementBehavior (Default)
- Standard grid-based movement
- Rotation on X and Y axes
- Scale up when selected

### FloatingBehavior (Example)
- Grid-based movement
- Sine wave vertical motion
- Rotation on X and Z axes
- Glow effect when selected

### JumpingBehavior (Example)
- Parabolic jump to new grid positions
- Rotation on Y axis
- Scale up when selected
- Movement disabled while jumping

### PulsingBehavior (Example)
- Standard grid movement
- Rhythmic scale pulsing
- Gentle Y rotation
- Faster pulse when selected

### StaticBehavior (Example)
- Standard grid movement
- No animation
- Opacity change for selection

## Key Benefits

✅ **Modularity**: Each component has a single responsibility
✅ **Extensibility**: Easy to add new objects and behaviors
✅ **Reusability**: Shared types and textures eliminate duplication
✅ **Type Safety**: TypeScript interfaces ensure consistency
✅ **Scalability**: Structure supports complex scenarios
✅ **Maintainability**: Clear organization aids debugging
