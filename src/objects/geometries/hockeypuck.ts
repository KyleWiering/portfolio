/**
 * Hockey puck geometry creator
 * Creates a cylinder mesh that looks like a hockey puck
 */
import * as THREE from 'three';
import { ObjectConfig } from '../../core/types';
import { createBrickTexture } from '../../core/textures/textureGenerator';
import { PUCK_RADIUS, PUCK_HEIGHT, PUCK_RADIAL_SEGMENTS } from '../../core/constants/boardConfig';

export function createHockeyPuck(config: ObjectConfig): THREE.Mesh {
    // Hockey puck dimensions - short and wide
    // Uses constants to cover 90% of the square
    const geometry = new THREE.CylinderGeometry(PUCK_RADIUS, PUCK_RADIUS, PUCK_HEIGHT, PUCK_RADIAL_SEGMENTS);
    
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
