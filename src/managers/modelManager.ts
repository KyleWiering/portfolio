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
    gridPosition: GridPosition;
}

/**
 * ModelManager - Manages 3D model lifecycle and grid positioning
 */
export class ModelManager {
    private scene: THREE.Scene;
    private models: ModelInfo[] = [];
    private selectedModelIndex: number = 0; // Track which model is selected
    private gridSpacing: number = 1;
    private gridBounds: number = 10;

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
        const pyramidPos = { x: -3, z: 0 };
        pyramid.position.x = pyramidPos.x * this.gridSpacing;
        pyramid.position.z = pyramidPos.z * this.gridSpacing;
        this.scene.add(pyramid);
        this.models.push({ mesh: pyramid, type: 'pyramid', gridPosition: pyramidPos });

        // Create cube at position (0, 0) - center
        const cube = createCube(config);
        const cubePos = { x: 0, z: 0 };
        cube.position.x = cubePos.x * this.gridSpacing;
        cube.position.z = cubePos.z * this.gridSpacing;
        this.scene.add(cube);
        this.models.push({ mesh: cube, type: 'cube', gridPosition: cubePos });

        // Create sphere at position (3, 0)
        const sphere = createSphere(config);
        const spherePos = { x: 3, z: 0 };
        sphere.position.x = spherePos.x * this.gridSpacing;
        sphere.position.z = spherePos.z * this.gridSpacing;
        this.scene.add(sphere);
        this.models.push({ mesh: sphere, type: 'sphere', gridPosition: spherePos });

        // Select the first model by default
        this.selectedModelIndex = 0;
        this.updateSelectedModelHighlight();
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

    /**
     * Select the next model (cycle through models)
     */
    public selectNextModel(): void {
        this.selectedModelIndex = (this.selectedModelIndex + 1) % this.models.length;
        this.updateSelectedModelHighlight();
    }

    /**
     * Select the previous model (cycle through models)
     */
    public selectPreviousModel(): void {
        this.selectedModelIndex = (this.selectedModelIndex - 1 + this.models.length) % this.models.length;
        this.updateSelectedModelHighlight();
    }

    /**
     * Move the currently selected model on the grid
     */
    public moveSelectedModel(direction: 'left' | 'right' | 'forward' | 'backward'): void {
        if (this.models.length === 0) return;

        const selectedModel = this.models[this.selectedModelIndex];
        
        switch (direction) {
            case 'left':
                if (selectedModel.gridPosition.x > -this.gridBounds) {
                    selectedModel.gridPosition.x -= 1;
                }
                break;
            case 'right':
                if (selectedModel.gridPosition.x < this.gridBounds) {
                    selectedModel.gridPosition.x += 1;
                }
                break;
            case 'forward':
                if (selectedModel.gridPosition.z > -this.gridBounds) {
                    selectedModel.gridPosition.z -= 1;
                }
                break;
            case 'backward':
                if (selectedModel.gridPosition.z < this.gridBounds) {
                    selectedModel.gridPosition.z += 1;
                }
                break;
        }
        
        this.updateModelPosition(selectedModel);
    }

    /**
     * Update model position based on grid position
     */
    private updateModelPosition(modelInfo: ModelInfo): void {
        modelInfo.mesh.position.x = modelInfo.gridPosition.x * this.gridSpacing;
        modelInfo.mesh.position.z = modelInfo.gridPosition.z * this.gridSpacing;
    }

    /**
     * Update visual highlight for selected model
     */
    private updateSelectedModelHighlight(): void {
        this.models.forEach((modelInfo, index) => {
            if (index === this.selectedModelIndex) {
                // Scale up the selected model slightly
                modelInfo.mesh.scale.set(1.2, 1.2, 1.2);
            } else {
                // Reset scale for non-selected models
                modelInfo.mesh.scale.set(1, 1, 1);
            }
        });
    }

    /**
     * Get the currently selected model type
     */
    public getSelectedModelType(): ModelType {
        return this.models[this.selectedModelIndex]?.type || 'cube';
    }
}
