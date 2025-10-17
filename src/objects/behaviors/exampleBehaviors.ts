/**
 * Example: Alternative behavior patterns
 * Demonstrates various ways to extend ObjectBehavior for different interaction patterns
 */
import * as THREE from 'three';
import { ObjectBehavior } from './objectBehavior';
import { GridPosition, MovementDirection } from '../../core/types';

/**
 * Jumping behavior - objects jump to new positions instead of sliding
 */
export class JumpingBehavior implements ObjectBehavior {
    private isJumping: boolean = false;
    private jumpProgress: number = 0;
    private jumpHeight: number = 2;

    move(
        mesh: THREE.Mesh,
        gridPosition: GridPosition,
        direction: MovementDirection,
        gridSpacing: number,
        gridBounds: number
    ): boolean {
        if (this.isJumping) return false; // Can't move while jumping

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
            this.isJumping = true;
            this.jumpProgress = 0;
            mesh.position.x = gridPosition.x * gridSpacing;
            mesh.position.z = gridPosition.z * gridSpacing;
        }

        return moved;
    }

    animate(mesh: THREE.Mesh): void {
        // Rotate continuously
        mesh.rotation.y += 0.02;

        // Jump animation
        if (this.isJumping) {
            this.jumpProgress += 0.05;
            
            // Parabolic jump
            const jumpY = Math.sin(this.jumpProgress * Math.PI) * this.jumpHeight;
            mesh.position.y = jumpY;

            if (this.jumpProgress >= 1) {
                this.isJumping = false;
                mesh.position.y = 0;
            }
        }
    }

    onSelect(mesh: THREE.Mesh, selected: boolean): void {
        if (selected) {
            mesh.scale.set(1.3, 1.3, 1.3);
        } else {
            mesh.scale.set(1, 1, 1);
        }
    }
}

/**
 * Pulsing behavior - objects pulse in size rhythmically
 */
export class PulsingBehavior implements ObjectBehavior {
    private pulsePhase: number = 0;
    private baseScale: number = 1;

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
        // Gentle rotation
        mesh.rotation.y += 0.01;

        // Pulsing scale animation
        this.pulsePhase += 0.05;
        const scaleFactor = this.baseScale + Math.sin(this.pulsePhase) * 0.1;
        mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }

    onSelect(mesh: THREE.Mesh, selected: boolean): void {
        // Selected objects pulse faster and larger
        if (selected) {
            this.baseScale = 1.2;
        } else {
            this.baseScale = 1;
        }
    }
}

/**
 * Static behavior - objects don't rotate or animate
 * Useful for architectural elements or background objects
 */
export class StaticBehavior implements ObjectBehavior {
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
        // No animation - static
    }

    onSelect(mesh: THREE.Mesh, selected: boolean): void {
        // Simple highlight with opacity change
        if (selected) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            material.opacity = 1.0;
            material.transparent = false;
        } else {
            const material = mesh.material as THREE.MeshStandardMaterial;
            material.opacity = 0.7;
            material.transparent = true;
        }
    }
}
