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
    private selectionIndicator: THREE.Mesh | null = null;
    private scene: THREE.Scene | null = null;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

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
        // No rotation animation for checkers pieces
    }

    onSelect(mesh: THREE.Mesh, selected: boolean): void {
        if (selected) {
            // Create blue sphere indicator above the piece
            if (!this.selectionIndicator && this.scene) {
                const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
                const sphereMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x0000ff, // Blue
                    emissive: 0x0000ff,
                    emissiveIntensity: 0.5
                });
                this.selectionIndicator = new THREE.Mesh(sphereGeometry, sphereMaterial);
                this.scene.add(this.selectionIndicator);
            }
            
            // Position the indicator above the selected piece
            if (this.selectionIndicator) {
                this.selectionIndicator.position.x = mesh.position.x;
                this.selectionIndicator.position.y = mesh.position.y + 2.5; // Above the pyramid
                this.selectionIndicator.position.z = mesh.position.z;
                this.selectionIndicator.visible = true;
            }
        } else {
            // Hide the indicator when deselected
            if (this.selectionIndicator) {
                this.selectionIndicator.visible = false;
            }
        }
    }

    // Clean up the indicator when behavior is destroyed
    public dispose(): void {
        if (this.selectionIndicator && this.scene) {
            this.scene.remove(this.selectionIndicator);
            this.selectionIndicator.geometry.dispose();
            (this.selectionIndicator.material as THREE.Material).dispose();
            this.selectionIndicator = null;
        }
    }
}
