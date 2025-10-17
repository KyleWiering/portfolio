// Checkers Manager - Handles checkers piece creation and management
import * as THREE from 'three';
import { createPyramid } from '../objects/geometries';
import { CheckersPieceBehavior } from '../behaviors/checkersBehavior';
import { GridPosition } from '../core/types';

interface CheckersPiece {
    mesh: THREE.Mesh;
    gridPosition: GridPosition;
    behavior: CheckersPieceBehavior;
    color: 'black' | 'white';
}

/**
 * CheckersManager - Manages checkers pieces on the board
 */
export class CheckersManager {
    private scene: THREE.Scene;
    private pieces: CheckersPiece[] = [];
    private selectedPieceIndex: number = -1;
    private gridSpacing: number = 1;
    private selectionIndicator: THREE.Mesh | null = null;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.createSelectionIndicator();
    }

    /**
     * Create the blue sphere selection indicator
     */
    private createSelectionIndicator(): void {
        const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const sphereMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x0000ff, // Blue
            emissive: 0x0000ff,
            emissiveIntensity: 0.5
        });
        this.selectionIndicator = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.selectionIndicator.visible = false; // Hidden by default
        this.scene.add(this.selectionIndicator);
    }

    /**
     * Initialize the checkers board with pieces
     * Standard checkers setup: 12 pieces per side on dark squares
     * Black pieces start at the top (negative z), white at bottom (positive z)
     */
    public initializeBoard(): void {
        // Remove any existing pieces
        this.removeAllPieces();

        // Standard checkers board is 8x8, with pieces on dark squares only
        // The board spans from -6 to 6 in both x and z directions (12 unit board, centered at origin)
        // Dark squares are where (x + z) is odd
        
        // Black pieces: Top 3 rows (z = -5.25, -3.75, -2.25)
        const blackPositions: GridPosition[] = [];
        for (let row = 0; row < 3; row++) {
            const z = -5.25 + row * 1.5; // Start from -5.25, spacing 1.5
            for (let col = 0; col < 8; col++) {
                const x = -5.25 + col * 1.5; // From -5.25 to 5.25, spacing 1.5
                // Only place on dark squares (where x + z is odd)
                if ((col + row) % 2 === 1) {
                    blackPositions.push({ x, z });
                }
            }
        }

        // White pieces: Bottom 3 rows (z = 2.25, 3.75, 5.25)
        const whitePositions: GridPosition[] = [];
        for (let row = 0; row < 3; row++) {
            const z = 2.25 + row * 1.5; // Start from 2.25, spacing 1.5
            for (let col = 0; col < 8; col++) {
                const x = -5.25 + col * 1.5; // From -5.25 to 5.25, spacing 1.5
                // Only place on dark squares (where x + z is odd)
                if ((col + row) % 2 === 1) {
                    whitePositions.push({ x, z });
                }
            }
        }

        // Create black pieces
        blackPositions.forEach(pos => {
            this.createPiece(pos, 'black');
        });

        // Create white pieces
        whitePositions.forEach(pos => {
            this.createPiece(pos, 'white');
        });
    }

    /**
     * Create a single checkers piece at the specified position
     */
    private createPiece(gridPosition: GridPosition, color: 'black' | 'white'): void {
        const colorValue = color === 'black' ? 0x000000 : 0xffffff;
        const pyramid = createPyramid({ useTexture: false, color: colorValue });
        
        // Adjust material properties for better visibility
        const material = pyramid.material as THREE.MeshStandardMaterial;
        if (color === 'black') {
            material.roughness = 0.7;
            material.metalness = 0.1;
        } else {
            material.roughness = 0.5;
            material.metalness = 0.0;
            material.emissive = new THREE.Color(0x222222); // Slight glow for white pieces
            material.emissiveIntensity = 0.1;
        }
        
        // Position the piece
        pyramid.position.x = gridPosition.x * this.gridSpacing;
        pyramid.position.z = gridPosition.z * this.gridSpacing;
        pyramid.position.y = 0; // On the grid
        
        // Add to scene
        this.scene.add(pyramid);
        
        // Update matrix for raycasting
        pyramid.updateMatrixWorld(true);
        
        // Create behavior for this piece
        const behavior = new CheckersPieceBehavior();
        
        // Store piece info
        this.pieces.push({
            mesh: pyramid,
            gridPosition: { x: gridPosition.x, z: gridPosition.z },
            behavior,
            color
        });
    }

    /**
     * Remove all pieces from the scene
     */
    private removeAllPieces(): void {
        this.pieces.forEach(piece => {
            piece.behavior.dispose();
            this.scene.remove(piece.mesh);
            piece.mesh.geometry.dispose();
            if (Array.isArray(piece.mesh.material)) {
                piece.mesh.material.forEach((m: THREE.Material) => m.dispose());
            } else {
                piece.mesh.material.dispose();
            }
        });
        this.pieces = [];
        this.selectedPieceIndex = -1;
    }

    /**
     * Animate all pieces (currently does nothing since rotation is disabled)
     */
    public animatePieces(): void {
        this.pieces.forEach(piece => {
            piece.behavior.animate(piece.mesh);
        });
    }

    /**
     * Get all piece meshes for raycasting
     */
    public getPieceMeshes(): THREE.Mesh[] {
        return this.pieces.map(piece => piece.mesh);
    }

    /**
     * Select a piece by index
     */
    public selectPieceByIndex(index: number): void {
        if (index >= 0 && index < this.pieces.length) {
            // Deselect previous piece
            if (this.selectedPieceIndex >= 0 && this.selectedPieceIndex < this.pieces.length) {
                const prevPiece = this.pieces[this.selectedPieceIndex];
                prevPiece.behavior.onSelect(prevPiece.mesh, false);
            }
            
            // Select new piece
            this.selectedPieceIndex = index;
            const piece = this.pieces[this.selectedPieceIndex];
            piece.behavior.onSelect(piece.mesh, true);
            
            // Show selection indicator above the piece
            if (this.selectionIndicator) {
                this.selectionIndicator.position.x = piece.mesh.position.x;
                this.selectionIndicator.position.y = piece.mesh.position.y + 1.5;
                this.selectionIndicator.position.z = piece.mesh.position.z;
                this.selectionIndicator.visible = true;
            }
        }
    }

    /**
     * Deselect the currently selected piece
     */
    public deselectPiece(): void {
        if (this.selectedPieceIndex >= 0 && this.selectedPieceIndex < this.pieces.length) {
            const piece = this.pieces[this.selectedPieceIndex];
            piece.behavior.onSelect(piece.mesh, false);
            this.selectedPieceIndex = -1;
        }
        
        // Hide selection indicator
        if (this.selectionIndicator) {
            this.selectionIndicator.visible = false;
        }
    }

    /**
     * Get the currently selected piece index
     */
    public getSelectedPieceIndex(): number {
        return this.selectedPieceIndex;
    }
}
