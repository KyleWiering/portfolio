/**
 * Pyramid geometry creator
 * Creates a pyramid mesh with optional texture support
 */
import * as THREE from 'three';
import { ObjectConfig } from '../../core/types';
import { createCheckeredTexture, createBrickTexture } from '../../core/textures/textureGenerator';

export function createPyramid(config: ObjectConfig): THREE.Mesh {
    // Reduced by 30%: 0.75 * 0.7 = 0.525, 1.25 * 0.7 = 0.875
    const geometry = new THREE.ConeGeometry(0.525, 0.875, 4);
    
    let material: THREE.Material;
    
    if (config.useTexture) {
        // Use brick texture for checker pieces
        const texture = createBrickTexture();
        material = new THREE.MeshStandardMaterial({ map: texture });
    } else {
        const color = config.color || 0xf59e0b; // Amber as default
        material = new THREE.MeshStandardMaterial({ color });
    }
    
    return new THREE.Mesh(geometry, material);
}
