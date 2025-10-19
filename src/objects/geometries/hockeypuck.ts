/**
 * Hockey puck geometry creator
 * Creates a cylinder mesh that looks like a hockey puck
 */
import * as THREE from 'three';
import { ObjectConfig } from '../../core/types';
import { createCircularPuckTexture } from '../../core/textures/textureGenerator';
import { PUCK_RADIUS, PUCK_HEIGHT, PUCK_RADIAL_SEGMENTS } from '../../core/constants/boardConfig';

export function createHockeyPuck(config: ObjectConfig): THREE.Mesh {
    // Hockey puck dimensions - short and wide
    // Uses constants to cover 90% of the square
    const geometry = new THREE.CylinderGeometry(PUCK_RADIUS, PUCK_RADIUS, PUCK_HEIGHT, PUCK_RADIAL_SEGMENTS);
    
    let material: THREE.Material;
    
    if (config.useTexture) {
        // Use circular pattern texture for hockey pucks
        const texture = createCircularPuckTexture();
        material = new THREE.MeshStandardMaterial({ 
            map: texture,
            roughness: 0.1,  // Very smooth, glossy surface
            metalness: 0.8,   // High metalness for mirror-like reflections
            envMapIntensity: 1.5 // Enhanced environment map reflections
        });
    } else {
        const color = config.color || 0xf59e0b; // Amber as default
        material = new THREE.MeshStandardMaterial({ 
            color,
            roughness: 0.1,
            metalness: 0.8
        });
    }
    
    return new THREE.Mesh(geometry, material);
}
