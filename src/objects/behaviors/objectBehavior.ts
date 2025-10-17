/**
 * Behavior interfaces for extensible object types
 * Supports different movement patterns and interactions
 */
import * as THREE from 'three';
import { GridPosition, MovementDirection } from '../../core/types';

/**
 * Base interface for object behaviors
 * Can be extended for different object types with unique patterns
 */
export interface ObjectBehavior {
    /**
     * Update object position based on movement direction
     * Returns true if movement was successful
     */
    move(
        mesh: THREE.Mesh,
        gridPosition: GridPosition,
        direction: MovementDirection,
        gridSpacing: number,
        gridBounds: number
    ): boolean;

    /**
     * Update object animation (called in animation loop)
     */
    animate(mesh: THREE.Mesh, deltaTime?: number): void;

    /**
     * Handle selection state change
     */
    onSelect?(mesh: THREE.Mesh, selected: boolean): void;
}

/**
 * Standard grid-based movement behavior
 * Used by default for all objects
 */
export class GridMovementBehavior implements ObjectBehavior {
    move(
        mesh: THREE.Mesh,
        gridPosition: GridPosition,
        direction: MovementDirection,
        gridSpacing: number,
        gridBounds: number
    ): boolean {
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
        // Standard rotation animation - straight rotation on Y axis only
        mesh.rotation.y += 0.01;
    }

    onSelect(mesh: THREE.Mesh, selected: boolean): void {
        // Scale up selected objects
        if (selected) {
            mesh.scale.set(1.2, 1.2, 1.2);
        } else {
            mesh.scale.set(1, 1, 1);
        }
    }
}
