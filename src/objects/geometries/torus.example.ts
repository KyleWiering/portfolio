/**
 * Example: Torus geometry with custom floating behavior
 * This demonstrates how to extend the system with a new object type
 */
import * as THREE from 'three';
import { ObjectConfig } from '../../core/types';
import { ObjectBehavior } from '../behaviors/objectBehavior';
import { GridPosition, MovementDirection } from '../../core/types';

/**
 * Create a torus (donut) geometry
 */
export function createTorus(config: ObjectConfig): THREE.Mesh {
    const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    
    let material: THREE.Material;
    
    if (config.useTexture) {
        // Could use a custom texture or reuse existing ones
        const texture = createTorusTexture();
        material = new THREE.MeshStandardMaterial({ map: texture });
    } else {
        const color = config.color || 0xe879f9; // Fuchsia as default
        material = new THREE.MeshStandardMaterial({ color });
    }
    
    return new THREE.Mesh(geometry, material);
}

/**
 * Create a radial gradient texture for torus
 */
function createTorusTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    
    // Create a radial gradient
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, '#e879f9');
    gradient.addColorStop(0.5, '#c026d3');
    gradient.addColorStop(1, '#86198f');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

/**
 * Floating behavior - moves in a wave pattern and rotates on different axes
 * Demonstrates a unique movement pattern different from GridMovementBehavior
 */
export class FloatingBehavior implements ObjectBehavior {
    private floatOffset: number = 0;
    private rotationSpeed: number = 0.02;

    move(
        mesh: THREE.Mesh,
        gridPosition: GridPosition,
        direction: MovementDirection,
        gridSpacing: number,
        gridBounds: number
    ): boolean {
        // Same grid movement as standard, but position is affected by floating
        let moved = false;

        switch (direction) {
            case 'left':
                if (gridPosition.x > -gridBounds) {
                    gridPosition.x -= 1;
                    moved = true;
                }
                break;
            case 'right':
                if (gridPosition.x < gridBounds) {
                    gridPosition.x += 1;
                    moved = true;
                }
                break;
            case 'forward':
                if (gridPosition.z > -gridBounds) {
                    gridPosition.z -= 1;
                    moved = true;
                }
                break;
            case 'backward':
                if (gridPosition.z < gridBounds) {
                    gridPosition.z += 1;
                    moved = true;
                }
                break;
        }

        if (moved) {
            mesh.position.x = gridPosition.x * gridSpacing;
            mesh.position.z = gridPosition.z * gridSpacing;
        }

        return moved;
    }

    animate(mesh: THREE.Mesh): void {
        // Rotate on X and Z axes (different from standard Y rotation)
        mesh.rotation.x += this.rotationSpeed;
        mesh.rotation.z += this.rotationSpeed * 0.5;

        // Add floating motion on Y axis
        this.floatOffset += 0.05;
        mesh.position.y = Math.sin(this.floatOffset) * 0.5;
    }

    onSelect(mesh: THREE.Mesh, selected: boolean): void {
        // Glow effect when selected (different from scale)
        if (selected) {
            mesh.scale.set(1.1, 1.1, 1.1);
            // Could also add emissive material property here
            const material = mesh.material as THREE.MeshStandardMaterial;
            material.emissive = new THREE.Color(0xe879f9);
            material.emissiveIntensity = 0.3;
        } else {
            mesh.scale.set(1, 1, 1);
            const material = mesh.material as THREE.MeshStandardMaterial;
            material.emissive = new THREE.Color(0x000000);
            material.emissiveIntensity = 0;
        }
    }
}

/**
 * USAGE EXAMPLE in ModelManager:
 * 
 * // 1. Import the new geometry and behavior
 * import { createTorus, FloatingBehavior } from '../objects/geometries/torus';
 * 
 * // 2. Add to displayAllModels method
 * const torus = createTorus(config);
 * const torusPos = { x: -6, z: 0 };
 * torus.position.x = torusPos.x * this.gridSpacing;
 * torus.position.z = torusPos.z * this.gridSpacing;
 * this.scene.add(torus);
 * this.models.push({
 *     mesh: torus,
 *     type: 'torus', // Add 'torus' to ObjectType in core/types
 *     gridPosition: torusPos,
 *     behavior: new FloatingBehavior() // Use custom behavior!
 * });
 */
