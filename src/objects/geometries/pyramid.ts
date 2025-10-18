/**
 * Pyramid geometry creator
 * Creates a pyramid mesh with optional texture support
 */
import * as THREE from 'three';
import { ObjectConfig } from '../../core/types';
import { createCheckeredTexture, createBrickTexture } from '../../core/textures/textureGenerator';

export function createPyramid(config: ObjectConfig): THREE.Mesh {
    // Taller pyramid for better shadows: increased height by 50%
    const geometry = new THREE.ConeGeometry(0.525, 1.3125, 4);
    
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
