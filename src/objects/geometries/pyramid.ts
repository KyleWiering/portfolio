/**
 * Pyramid geometry creator
 * Creates a pyramid mesh with optional texture support
 */
import * as THREE from 'three';
import { ObjectConfig } from '../../core/types';
import { createCheckeredTexture } from '../../core/textures/textureGenerator';

export function createPyramid(config: ObjectConfig): THREE.Mesh {
    const geometry = new THREE.ConeGeometry(0.75, 1.25, 4);
    
    let material: THREE.Material;
    
    if (config.useTexture) {
        const texture = createCheckeredTexture();
        material = new THREE.MeshStandardMaterial({ map: texture });
    } else {
        const color = config.color || 0xf59e0b; // Amber as default
        material = new THREE.MeshStandardMaterial({ color });
    }
    
    return new THREE.Mesh(geometry, material);
}
