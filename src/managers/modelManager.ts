// Model Manager - Handles model creation and management
import * as THREE from 'three';
import { createPyramid, createCube, createSphere } from '../objects/geometries';
import { ObjectBehavior, GridMovementBehavior } from '../objects/behaviors';
import { ObjectType, GridPosition } from '../core/types';

export type ModelType = ObjectType;

interface ModelInfo {
    mesh: THREE.Mesh;
    type: ModelType;
    gridPosition: GridPosition;
    behavior: ObjectBehavior;
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
    private onSelectCallback?: (modelType: ModelType) => void;

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
        this.models.push({ 
            mesh: pyramid, 
            type: 'pyramid', 
            gridPosition: pyramidPos,
            behavior: new GridMovementBehavior()
        });

        // Create cube at position (0, 0) - center
        const cube = createCube(config);
        const cubePos = { x: 0, z: 0 };
        cube.position.x = cubePos.x * this.gridSpacing;
        cube.position.z = cubePos.z * this.gridSpacing;
        this.scene.add(cube);
        this.models.push({ 
            mesh: cube, 
            type: 'cube', 
            gridPosition: cubePos,
            behavior: new GridMovementBehavior()
        });

        // Create sphere at position (3, 0)
        const sphere = createSphere(config);
        const spherePos = { x: 3, z: 0 };
        sphere.position.x = spherePos.x * this.gridSpacing;
        sphere.position.z = spherePos.z * this.gridSpacing;
        this.scene.add(sphere);
        this.models.push({ 
            mesh: sphere, 
            type: 'sphere', 
            gridPosition: spherePos,
            behavior: new GridMovementBehavior()
        });

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
            modelInfo.behavior.animate(modelInfo.mesh);
        });
    }

    /**
     * Select the next model (cycle through models)
     */
    public selectNextModel(): void {
        this.selectedModelIndex = (this.selectedModelIndex + 1) % this.models.length;
        this.updateSelectedModelHighlight();
        if (this.onSelectCallback) {
            this.onSelectCallback(this.models[this.selectedModelIndex].type);
        }
    }

    /**
     * Select the previous model (cycle through models)
     */
    public selectPreviousModel(): void {
        this.selectedModelIndex = (this.selectedModelIndex - 1 + this.models.length) % this.models.length;
        this.updateSelectedModelHighlight();
        if (this.onSelectCallback) {
            this.onSelectCallback(this.models[this.selectedModelIndex].type);
        }
    }

    /**
     * Move the currently selected model on the grid
     */
    public moveSelectedModel(direction: 'left' | 'right' | 'forward' | 'backward'): void {
        if (this.models.length === 0) return;

        const selectedModel = this.models[this.selectedModelIndex];
        selectedModel.behavior.move(
            selectedModel.mesh,
            selectedModel.gridPosition,
            direction,
            this.gridSpacing,
            this.gridBounds
        );
    }

    /**
     * Update visual highlight for selected model
     */
    private updateSelectedModelHighlight(): void {
        this.models.forEach((modelInfo, index) => {
            const isSelected = index === this.selectedModelIndex;
            if (modelInfo.behavior.onSelect) {
                modelInfo.behavior.onSelect(modelInfo.mesh, isSelected);
            }
        });
    }

    /**
     * Get the currently selected model type
     */
    public getSelectedModelType(): ModelType {
        return this.models[this.selectedModelIndex]?.type || 'cube';
    }

    /**
     * Set callback for model selection
     */
    public onSelect(callback: (modelType: ModelType) => void): void {
        this.onSelectCallback = callback;
    }

    /**
     * Select a model by index
     */
    public selectModelByIndex(index: number): void {
        if (index >= 0 && index < this.models.length) {
            this.selectedModelIndex = index;
            this.updateSelectedModelHighlight();
            if (this.onSelectCallback) {
                this.onSelectCallback(this.models[this.selectedModelIndex].type);
            }
        }
    }

    /**
     * Get all model meshes for raycasting
     */
    public getModelMeshes(): THREE.Mesh[] {
        return this.models.map(modelInfo => modelInfo.mesh);
    }
}
