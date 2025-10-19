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
        // Use solid color with glossy finish - no texture to avoid gray tinting
        // Color will be set in the manager based on piece color
        material = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, // Default white, will be overridden
            roughness: 0.2,  // Glossy surface
            metalness: 0.1,   // Low metalness so color shows
            envMapIntensity: 1.0
        });
    } else {
        const color = config.color || 0xf59e0b; // Amber as default
        material = new THREE.MeshStandardMaterial({ 
            color,
            roughness: 0.2,
            metalness: 0.1
        });
    }
    
    return new THREE.Mesh(geometry, material);
}
