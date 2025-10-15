// Model Manager - Handles model creation and management
import * as THREE from 'three';
import { createPyramid } from '../models/pyramid';
import { createCube } from '../models/cube';
import { createSphere } from '../models/sphere';

export type ModelType = 'pyramid' | 'cube' | 'sphere';

export interface GridPosition {
    x: number;
    z: number;
}

interface ModelInfo {
    mesh: THREE.Mesh;
    type: ModelType;
}

/**
 * ModelManager - Manages 3D model lifecycle and grid positioning
 */
export class ModelManager {
    private scene: THREE.Scene;
    private models: ModelInfo[] = [];
    private gridSpacing: number = 1;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    /**
     * Display all models on the grid at distinct positions
     */
    public displayAllModels(withTexture: boolean): void {
        // Remove any existing models
        this.removeAllModels();

        const config = { useTexture: withTexture, color: undefined };
        
        // Create pyramid at position (-3, 0)
        const pyramid = createPyramid(config);
        pyramid.position.x = -3 * this.gridSpacing;
        pyramid.position.z = 0 * this.gridSpacing;
        this.scene.add(pyramid);
        this.models.push({ mesh: pyramid, type: 'pyramid' });

        // Create cube at position (0, 0) - center
        const cube = createCube(config);
        cube.position.x = 0 * this.gridSpacing;
        cube.position.z = 0 * this.gridSpacing;
        this.scene.add(cube);
        this.models.push({ mesh: cube, type: 'cube' });

        // Create sphere at position (3, 0)
        const sphere = createSphere(config);
        sphere.position.x = 3 * this.gridSpacing;
        sphere.position.z = 0 * this.gridSpacing;
        this.scene.add(sphere);
        this.models.push({ mesh: sphere, type: 'sphere' });
    }

    /**
     * Remove all models from scene
     */
    private removeAllModels(): void {
        this.models.forEach(modelInfo => {
            this.scene.remove(modelInfo.mesh);
            modelInfo.mesh.geometry.dispose();
            if (Array.isArray(modelInfo.mesh.material)) {
                modelInfo.mesh.material.forEach((m: THREE.Material) => m.dispose());
            } else {
                modelInfo.mesh.material.dispose();
            }
        });
        this.models = [];
    }

    /**
     * Rotate all models in animation loop
     */
    public rotateModels(): void {
        this.models.forEach(modelInfo => {
            modelInfo.mesh.rotation.x += 0.01;
            modelInfo.mesh.rotation.y += 0.01;
        });
    }
}
