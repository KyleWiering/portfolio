// 3D Model Viewer - Main Application Entry Point
// Separation of Concerns:
// - SceneRenderer: Handles WebGL scene setup and rendering
// - ModelManager: Manages model lifecycle and grid positioning
// - MenuController: Handles menu UI interactions
// - InputController: Handles keyboard and touch input

import { SceneRenderer } from './rendering/sceneRenderer';
import { ModelManager } from './managers/modelManager';
import { MenuController } from './ui/menu';
import { InputController } from './controllers/inputController';
import type { ModelType } from './managers/modelManager';

/**
 * Initialize the 3D model viewer application
 */
function initModelViewer(): void {
    // Initialize renderer (handles scene, camera, lighting, grid)
    const renderer = new SceneRenderer('game-container');
    
    // Initialize model manager (handles model creation and positioning)
    const modelManager = new ModelManager(renderer.getScene());
    
    // Initialize menu controller (handles UI interactions)
    const menuController = new MenuController();
    
    // Initialize input controller (handles keyboard and touch input)
    const inputController = new InputController(renderer.getCanvas());
    
    // Set up menu callbacks
    menuController.onModelChange((modelType: string) => {
        modelManager.displayModel(modelType as ModelType, modelManager.isUsingTexture());
    });
    
    menuController.onTextureChange((useTexture: boolean) => {
        modelManager.displayModel(modelManager.getCurrentModelType(), useTexture);
    });
    
    // Set up input callbacks
    inputController.onMovement((direction) => {
        modelManager.moveModel(direction);
    });
    
    // Initialize all controllers
    menuController.initialize();
    inputController.initialize();
    menuController.registerCanvasClickHandler(renderer.getCanvas());
    
    // Initialize with default model (cube)
    modelManager.displayModel('cube', false);
    menuController.setActiveModel('cube');

    // Animation loop
    function animate(): void {
        requestAnimationFrame(animate);
        
        // Rotate the current model
        modelManager.rotateModel();
        
        // Render the scene
        renderer.render();
    }

    // Start animation
    animate();

    // Hide loader after scene is ready
    const loader = document.querySelector('.loader') as HTMLElement;
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 1000);
    }
}

// Initialize when DOM is loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initModelViewer);
} else {
    initModelViewer();
}
