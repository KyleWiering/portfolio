/**
 * Hockey puck geometry creator
 * Creates a cylinder mesh that looks like a hockey puck
 */
import * as THREE from 'three';
import { ObjectConfig } from '../../core/types';
import { createBeachwoodTexture, createEbonyTexture } from '../../core/textures/textureGenerator';
import { PUCK_RADIUS, PUCK_HEIGHT, PUCK_RADIAL_SEGMENTS } from '../../core/constants/boardConfig';

export function createHockeyPuck(config: ObjectConfig & { woodType?: 'beachwood' | 'ebony' }): THREE.Mesh {
    // Hockey puck dimensions - short and wide
    // Uses constants to cover 90% of the square
    const geometry = new THREE.CylinderGeometry(PUCK_RADIUS, PUCK_RADIUS, PUCK_HEIGHT, PUCK_RADIAL_SEGMENTS);
    
    let material: THREE.Material;
    
    if (config.useTexture && config.woodType) {
        // Use wood texture based on piece color
        const texture = config.woodType === 'beachwood' ? createBeachwoodTexture() : createEbonyTexture();
        material = new THREE.MeshStandardMaterial({ 
            map: texture,
            roughness: 0.3,  // Wood-appropriate glossiness
            metalness: 0.0,  // Wood is not metallic
            envMapIntensity: 0.5
        });
    } else if (config.useTexture) {
        // Fallback to solid color
        material = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.1,
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
