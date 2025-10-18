/**
 * Hourglass geometry creator
 * Creates an inverted hourglass shape (two pyramids base to base, elongated)
 */
import * as THREE from 'three';

export function createHourglass(config: { color?: number } = {}): THREE.Group {
    const group = new THREE.Group();
    
    // Create two cone geometries for the hourglass shape
    const coneGeometry = new THREE.ConeGeometry(0.3, 0.5, 4);
    
    // Create material with smooth gradient texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    
    // Create radial gradient for smooth appearance
    const gradient = context.createRadialGradient(128, 128, 30, 128, 128, 128);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#cccccc');
    gradient.addColorStop(1, '#888888');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    
    const material = new THREE.MeshStandardMaterial({ 
        map: texture,
        color: config.color || 0xffffff,
        emissive: 0x444444,
        emissiveIntensity: 0.3,
        roughness: 0.4,
        metalness: 0.3
    });
    
    // Top pyramid (pointing up)
    const topCone = new THREE.Mesh(coneGeometry, material);
    topCone.position.y = 0.25;
    group.add(topCone);
    
    // Bottom pyramid (pointing down)
    const bottomCone = new THREE.Mesh(coneGeometry, material.clone());
    bottomCone.rotation.z = Math.PI; // Flip upside down
    bottomCone.position.y = -0.25;
    group.add(bottomCone);
    
    return group;
}
