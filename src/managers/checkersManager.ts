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
        // The board spans from -4 to 4 in both x and z directions (8 unit board, centered at origin)
        // Each square is 1 unit to align with the isometric grid
        // Pieces are centered on each square (at 0.5 offset from grid lines)
        // Dark squares are where (x + z) is odd
        
        // Black pieces: Top 3 rows (z = -3.5, -2.5, -1.5)
        const blackPositions: GridPosition[] = [];
        for (let row = 0; row < 3; row++) {
            const z = -3.5 + row; // Start from -3.5 (center of first row), spacing 1.0
            for (let col = 0; col < 8; col++) {
                const x = -3.5 + col; // From -3.5 to 3.5 (centers of squares), spacing 1.0
                // Only place on dark squares (where col + row is odd)
                if ((col + row) % 2 === 1) {
                    blackPositions.push({ x, z });
                }
            }
        }

        // White pieces: Bottom 3 rows (z = 1.5, 2.5, 3.5)
        const whitePositions: GridPosition[] = [];
        for (let row = 0; row < 3; row++) {
            const z = 1.5 + row; // Start from 1.5 (center of first row), spacing 1.0
            for (let col = 0; col < 8; col++) {
                const x = -3.5 + col; // From -3.5 to 3.5 (centers of squares), spacing 1.0
                // Only place on dark squares (where col + row is odd)
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
        // Use brick texture for all pieces
        const pyramid = createPyramid({ useTexture: true });
        
        // Adjust material properties based on color
        const material = pyramid.material as THREE.MeshStandardMaterial;
        
        // Tint the brick texture based on piece color
        if (color === 'black') {
            material.color = new THREE.Color(0x2a1810); // Dark brown tint for black pieces
            material.roughness = 0.8;
            material.metalness = 0.1;
        } else {
            material.color = new THREE.Color(0xd4a574); // Light tan tint for white pieces
            material.roughness = 0.6;
            material.metalness = 0.0;
        }
        
        // Position the piece - gridPosition already contains final coordinates
        // No need to multiply by gridSpacing since positions are already in world units
        pyramid.position.x = gridPosition.x;
        pyramid.position.z = gridPosition.z;
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
