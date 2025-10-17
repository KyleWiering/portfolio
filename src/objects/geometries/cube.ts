/**
 * Cube geometry creator
 * Creates a cube mesh with optional texture support
 */
import * as THREE from 'three';
import { ObjectConfig } from '../../core/types';
import { createGradientTexture } from '../../core/textures/textureGenerator';

export function createCube(config: ObjectConfig): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    
    let material: THREE.Material;
    
    if (config.useTexture) {
        const texture = createGradientTexture();
        material = new THREE.MeshStandardMaterial({ map: texture });
    } else {
        const color = config.color || 0x2563eb; // Blue as default
        material = new THREE.MeshStandardMaterial({ color });
    }
    
    return new THREE.Mesh(geometry, material);
}
