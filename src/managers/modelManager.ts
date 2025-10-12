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

/**
 * ModelManager - Manages 3D model lifecycle and grid positioning
 */
export class ModelManager {
    private scene: THREE.Scene;
    private currentModel: THREE.Mesh | null = null;
    private currentModelType: ModelType = 'cube';
    private useTexture: boolean = false;
    private gridPosition: GridPosition = { x: 0, z: 0 };
    private gridSpacing: number = 1;
    private gridBounds: number = 10;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    /**
     * Display a specific model
     */
    public displayModel(modelType: ModelType, withTexture: boolean): void {
        // Remove current model if exists
        this.removeCurrentModel();

        // Create new model based on type
        const config = { useTexture: withTexture, color: undefined };
        
        switch (modelType) {
            case 'pyramid':
                this.currentModel = createPyramid(config);
                break;
            case 'cube':
                this.currentModel = createCube(config);
                break;
            case 'sphere':
                this.currentModel = createSphere(config);
                break;
        }

        this.scene.add(this.currentModel);
        this.currentModelType = modelType;
        this.useTexture = withTexture;
        this.updateModelPosition();
    }

    /**
     * Remove current model from scene
     */
    private removeCurrentModel(): void {
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
            this.currentModel.geometry.dispose();
            if (Array.isArray(this.currentModel.material)) {
                this.currentModel.material.forEach((m: THREE.Material) => m.dispose());
            } else {
                this.currentModel.material.dispose();
            }
        }
    }

    /**
     * Update model position on grid
     */
    private updateModelPosition(): void {
        if (this.currentModel) {
            this.currentModel.position.x = this.gridPosition.x * this.gridSpacing;
            this.currentModel.position.z = this.gridPosition.z * this.gridSpacing;
        }
    }

    /**
     * Move model on grid
     */
    public moveModel(direction: 'left' | 'right' | 'forward' | 'backward'): void {
        switch (direction) {
            case 'left':
                if (this.gridPosition.x > -this.gridBounds) {
                    this.gridPosition.x -= 1;
                }
                break;
            case 'right':
                if (this.gridPosition.x < this.gridBounds) {
                    this.gridPosition.x += 1;
                }
                break;
            case 'forward':
                if (this.gridPosition.z > -this.gridBounds) {
                    this.gridPosition.z -= 1;
                }
                break;
            case 'backward':
                if (this.gridPosition.z < this.gridBounds) {
                    this.gridPosition.z += 1;
                }
                break;
        }
        this.updateModelPosition();
    }

    /**
     * Rotate model in animation loop
     */
    public rotateModel(): void {
        if (this.currentModel) {
            this.currentModel.rotation.x += 0.01;
            this.currentModel.rotation.y += 0.01;
        }
    }

    /**
     * Get current model type
     */
    public getCurrentModelType(): ModelType {
        return this.currentModelType;
    }

    /**
     * Get current texture state
     */
    public isUsingTexture(): boolean {
        return this.useTexture;
    }
}
