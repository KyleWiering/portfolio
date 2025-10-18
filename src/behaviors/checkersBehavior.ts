/**
 * Checkers-specific behavior for pyramid pieces
 * - No rotation animation
 * - Can be selected individually
 * - Shows blue sphere indicator when selected
 */
import * as THREE from 'three';
import { ObjectBehavior } from '../objects/behaviors/objectBehavior';
import { GridPosition, MovementDirection } from '../core/types';

export class CheckersPieceBehavior implements ObjectBehavior {
    move(
        mesh: THREE.Mesh,
        gridPosition: GridPosition,
        direction: MovementDirection,
        gridSpacing: number,
        gridBounds: number
    ): boolean {
        // Checkers pieces don't move via keyboard - they're static
        return false;
    }

    animate(mesh: THREE.Mesh): void {
        // Straight rotation animation on Y-axis only
        mesh.rotation.y += 0.01;
    }

    onSelect(mesh: THREE.Mesh, selected: boolean): void {
        // Selection indicator is managed by CheckersManager
        // This method is kept for interface compatibility
    }

    // Clean up method for interface compatibility
    public dispose(): void {
        // Nothing to dispose - indicator is managed by CheckersManager
    }
}
