/**
 * Sphere geometry creator
 * Creates a sphere mesh with optional texture support
 */
import * as THREE from 'three';
import { ObjectConfig } from '../../core/types';
import { createStripedTexture } from '../../core/textures/textureGenerator';

export function createSphere(config: ObjectConfig): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(1.5, 32, 32);
    
    let material: THREE.Material;
    
    if (config.useTexture) {
        const texture = createStripedTexture();
        material = new THREE.MeshStandardMaterial({ map: texture });
    } else {
        const color = config.color || 0x10b981; // Green as default
        material = new THREE.MeshStandardMaterial({ color });
    }
    
    return new THREE.Mesh(geometry, material);
}
