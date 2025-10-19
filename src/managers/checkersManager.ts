// Checkers Manager - Handles checkers piece creation and management
import * as THREE from 'three';
import { createHockeyPuck, createHourglass } from '../objects/geometries';
import { CheckersPieceBehavior } from '../behaviors/checkersBehavior';
import { GridPosition, CheckersColor, MoveResult } from '../core/types';
import { 
    BOARD_MIN, 
    BOARD_MAX, 
    PIECES_PER_SIDE_ROWS, 
    WHITE_PIECE_START_ROW,
    BOARD_Y_POSITION,
    PUCK_Y_OFFSET,
    SELECTION_INDICATOR_HEIGHT_OFFSET
} from '../core/constants/boardConfig';

interface CheckersPiece {
    mesh: THREE.Mesh;
    gridPosition: GridPosition;
    behavior: CheckersPieceBehavior;
    color: CheckersColor;
    isKing: boolean;
    hasMoved: boolean;
}

/**
 * CheckersManager - Manages checkers pieces on the board
 */
export class CheckersManager {
    private scene: THREE.Scene;
    private pieces: CheckersPiece[] = [];
    private selectedPieceIndex: number = -1;
    private gridSpacing: number = 1;
    private selectionIndicator: THREE.Group | null = null;
    private currentPlayer: CheckersColor = 'white'; // White goes first
    private validMovesIndicators: THREE.Mesh[] = [];
    private mustCaptureFrom: number[] = []; // Indices of pieces that must capture

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.createSelectionIndicator();
    }

    /**
     * Create the inverted hourglass selection indicator (two pyramids base to base)
     */
    private createSelectionIndicator(): void {
        this.selectionIndicator = createHourglass({ color: 0xffffff });
        this.selectionIndicator.visible = false; // Hidden by default
        this.scene.add(this.selectionIndicator);
    }

    /**
     * Initialize the checkers board with pieces
     * Setup: 4 rows per side with pieces on DARK squares only (20 pieces per side)
     * Black pieces start at the top (negative z), white at bottom (positive z)
     * Dark squares are where (row + col) is odd
     */
    public initializeBoard(): void {
        // Remove any existing pieces
        this.removeAllPieces();

        // Checkers board is 10x10
        // The board spans from -5 to 5 in both x and z directions (10 unit board, centered at origin)
        // Each square is 1 unit to align with the isometric grid
        // Pieces are centered on each square (at 0.5 offset from grid lines)
        
        // Helper function to check if a square is dark (checkerboard pattern)
        const isDarkSquare = (row: number, col: number): boolean => {
            return (row + col) % 2 === 1;
        };
        
        // Black pieces: Top rows (DARK squares only)
        const blackPositions: GridPosition[] = [];
        for (let row = 0; row < PIECES_PER_SIDE_ROWS; row++) {
            const z = BOARD_MIN + row; // Start from BOARD_MIN (center of first row), spacing 1.0
            for (let col = 0; col < 10; col++) {
                const x = BOARD_MIN + col; // From BOARD_MIN to BOARD_MAX (centers of squares), spacing 1.0
                // Place only on DARK squares
                if (isDarkSquare(row, col)) {
                    blackPositions.push({ x, z });
                }
            }
        }

        // White pieces: Bottom rows (DARK squares only)
        const whitePositions: GridPosition[] = [];
        for (let row = 0; row < PIECES_PER_SIDE_ROWS; row++) {
            const z = BOARD_MIN + WHITE_PIECE_START_ROW + row; // Start from white pieces start row
            for (let col = 0; col < 10; col++) {
                const x = BOARD_MIN + col; // From BOARD_MIN to BOARD_MAX (centers of squares), spacing 1.0
                // Place only on DARK squares (use WHITE_PIECE_START_ROW to account for bottom rows)
                if (isDarkSquare(row + WHITE_PIECE_START_ROW, col)) {
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
    private createPiece(gridPosition: GridPosition, color: CheckersColor): void {
        // Use brick texture for all pieces - now using hockey pucks
        const puck = createHockeyPuck({ useTexture: true });
        
        // Enable shadow casting and receiving
        puck.castShadow = true;
        puck.receiveShadow = true;
        
        // Adjust material properties based on color
        const material = puck.material as THREE.MeshStandardMaterial;
        
        // Set distinct colors for clear visibility - white pieces vs black pieces
        // Pure solid colors with glossy finish for high contrast
        if (color === 'black') {
            material.color = new THREE.Color(0x000000); // Pure black
            material.roughness = 0.25; // Glossy finish
            material.metalness = 0.15; // Low metalness to preserve black color
            material.emissive = new THREE.Color(0x000000);
            material.emissiveIntensity = 0.0;
        } else {
            material.color = new THREE.Color(0xffffff); // Pure white
            material.roughness = 0.25; // Glossy finish
            material.metalness = 0.05; // Very low metalness to preserve white color
            material.emissive = new THREE.Color(0xffffff); // Slight white glow
            material.emissiveIntensity = 0.15; // Enhanced glow for better visibility
        }
        
        // Position the piece - gridPosition already contains final coordinates
        // No need to multiply by gridSpacing since positions are already in world units
        puck.position.x = gridPosition.x;
        puck.position.z = gridPosition.z;
        puck.position.y = BOARD_Y_POSITION + PUCK_Y_OFFSET; // On the board, raised by half the puck height
        
        // Add to scene
        this.scene.add(puck);
        
        // Update matrix for raycasting
        puck.updateMatrixWorld(true);
        
        // Create behavior for this piece
        const behavior = new CheckersPieceBehavior();
        
        // Store piece info
        this.pieces.push({
            mesh: puck,
            gridPosition: { x: gridPosition.x, z: gridPosition.z },
            behavior,
            color,
            isKing: false,
            hasMoved: false
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
            
            // Show selection indicator above the piece with color representing current player
            if (this.selectionIndicator) {
                this.selectionIndicator.position.x = piece.mesh.position.x;
                this.selectionIndicator.position.y = piece.mesh.position.y + SELECTION_INDICATOR_HEIGHT_OFFSET;
                this.selectionIndicator.position.z = piece.mesh.position.z;
                
                // Update indicator color based on current player's turn
                this.selectionIndicator.children.forEach((child) => {
                    const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                    if (this.currentPlayer === 'black') {
                        // Dark gray for black player's turn
                        material.color = new THREE.Color(0x505050);
                        material.emissive = new THREE.Color(0x202020);
                    } else {
                        // Light tan/beige for white player's turn
                        material.color = new THREE.Color(0xe8d4b8);
                        material.emissive = new THREE.Color(0xb8a080);
                    }
                });
                
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

    /**
     * Get the current player
     */
    public getCurrentPlayer(): CheckersColor {
        return this.currentPlayer;
    }

    /**
     * Check if a position is on the board
     */
    private isOnBoard(pos: GridPosition): boolean {
        return pos.x >= BOARD_MIN && pos.x <= BOARD_MAX && pos.z >= BOARD_MIN && pos.z <= BOARD_MAX;
    }

    /**
     * Get piece at a specific position
     */
    private getPieceAt(pos: GridPosition): CheckersPiece | null {
        return this.pieces.find(p => 
            Math.abs(p.gridPosition.x - pos.x) < 0.1 && 
            Math.abs(p.gridPosition.z - pos.z) < 0.1
        ) || null;
    }

    /**
     * Remove a piece from the board
     */
    private removePiece(piece: CheckersPiece): void {
        const index = this.pieces.indexOf(piece);
        if (index !== -1) {
            piece.behavior.dispose();
            this.scene.remove(piece.mesh);
            piece.mesh.geometry.dispose();
            if (Array.isArray(piece.mesh.material)) {
                piece.mesh.material.forEach((m: THREE.Material) => m.dispose());
            } else {
                piece.mesh.material.dispose();
            }
            this.pieces.splice(index, 1);
        }
    }

    /**
     * Check if a piece can capture (has valid jump moves)
     */
    private canCapture(piece: CheckersPiece): boolean {
        const moves = this.getValidMoves(piece);
        return moves.some(move => move.captured && move.captured.length > 0);
    }

    /**
     * Get all valid moves for a piece
     */
    private getValidMoves(piece: CheckersPiece): MoveResult[] {
        const validMoves: MoveResult[] = [];
        const directions = this.getMovementDirections(piece);

        // Check regular moves (1 or 2 spaces forward)
        for (const dir of directions) {
            // Check 1 space move
            const oneSpace = {
                x: piece.gridPosition.x + dir.x,
                z: piece.gridPosition.z + dir.z
            };
            
            if (this.isOnBoard(oneSpace) && !this.getPieceAt(oneSpace)) {
                // Only allow forward movement, not backward
                if (this.isForwardMove(piece, dir)) {
                    validMoves.push({ success: true });
                }
            }

            // Check 2 space move (only if never moved before)
            if (!piece.hasMoved) {
                const twoSpace = {
                    x: piece.gridPosition.x + dir.x * 2,
                    z: piece.gridPosition.z + dir.z * 2
                };
                const midPoint = {
                    x: piece.gridPosition.x + dir.x,
                    z: piece.gridPosition.z + dir.z
                };
                
                if (this.isOnBoard(twoSpace) && !this.getPieceAt(twoSpace) && 
                    !this.getPieceAt(midPoint) && this.isForwardMove(piece, dir)) {
                    validMoves.push({ success: true });
                }
            }
        }

        // Check jump moves
        const jumpMoves = this.getJumpMoves(piece, piece.gridPosition, []);
        validMoves.push(...jumpMoves);

        return validMoves;
    }

    /**
     * Get movement directions for a piece
     */
    private getMovementDirections(piece: CheckersPiece): Array<{x: number, z: number}> {
        // Checkers move diagonally
        if (piece.isKing) {
            // Kings can move in all diagonal directions
            return [
                { x: 1, z: 1 },   // forward-right
                { x: -1, z: 1 },  // forward-left
                { x: 1, z: -1 },  // backward-right
                { x: -1, z: -1 }  // backward-left
            ];
        } else {
            // Regular pieces move diagonally forward only
            const forward = piece.color === 'black' ? 1 : -1;
            return [
                { x: 1, z: forward },   // forward-right
                { x: -1, z: forward }   // forward-left
            ];
        }
    }

    /**
     * Check if a move is in the forward direction for a piece
     */
    private isForwardMove(piece: CheckersPiece, direction: {x: number, z: number}): boolean {
        if (piece.isKing) {
            return true; // Kings can move in any direction
        }
        
        const forward = piece.color === 'black' ? 1 : -1;
        return direction.z === forward;
    }

    /**
     * Get all jump moves recursively (for multi-jumps)
     */
    private getJumpMoves(
        piece: CheckersPiece, 
        fromPos: GridPosition, 
        capturedSoFar: GridPosition[]
    ): MoveResult[] {
        const jumpMoves: MoveResult[] = [];
        
        // All diagonal directions for jumps
        const jumpDirections = [
            { x: 1, z: 1 },
            { x: -1, z: 1 },
            { x: 1, z: -1 },
            { x: -1, z: -1 }
        ];

        for (const dir of jumpDirections) {
            const jumpOverPos = {
                x: fromPos.x + dir.x,
                z: fromPos.z + dir.z
            };
            const landingPos = {
                x: fromPos.x + dir.x * 2,
                z: fromPos.z + dir.z * 2
            };

            // Check if jump is valid
            if (!this.isOnBoard(jumpOverPos) || !this.isOnBoard(landingPos)) {
                continue;
            }

            const jumpOverPiece = this.getPieceAt(jumpOverPos);
            const landingPiece = this.getPieceAt(landingPos);

            // Must jump over an opponent piece to an empty square
            if (jumpOverPiece && jumpOverPiece.color !== piece.color && !landingPiece) {
                // Check if we haven't already captured this piece
                const alreadyCaptured = capturedSoFar.some(p => 
                    Math.abs(p.x - jumpOverPos.x) < 0.1 && Math.abs(p.z - jumpOverPos.z) < 0.1
                );
                
                if (!alreadyCaptured) {
                    const newCaptured = [...capturedSoFar, jumpOverPos];
                    
                    // Check for continued jumps
                    const continuedJumps = this.getJumpMoves(piece, landingPos, newCaptured);
                    
                    if (continuedJumps.length > 0) {
                        // Add all continued jump sequences
                        jumpMoves.push(...continuedJumps);
                    } else {
                        // This is a terminal jump
                        jumpMoves.push({
                            success: true,
                            captured: newCaptured
                        });
                    }
                }
            }
        }

        return jumpMoves;
    }

    /**
     * Attempt to move the selected piece to a target position
     */
    public movePiece(targetPos: GridPosition): MoveResult {
        if (this.selectedPieceIndex < 0) {
            return { success: false, message: "No piece selected" };
        }

        const piece = this.pieces[this.selectedPieceIndex];
        
        // Check if it's this piece's turn
        if (piece.color !== this.currentPlayer) {
            return { success: false, message: `It's ${this.currentPlayer}'s turn` };
        }

        // Check if must capture
        if (this.mustCaptureFrom.length > 0 && !this.mustCaptureFrom.includes(this.selectedPieceIndex)) {
            return { success: false, message: "You must continue capturing with the same piece." };
        }

        // Calculate move
        const dx = targetPos.x - piece.gridPosition.x;
        const dz = targetPos.z - piece.gridPosition.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        // Check if target is occupied
        if (this.getPieceAt(targetPos)) {
            return { success: false, message: "Target position is occupied" };
        }

        // Determine move type
        let result: MoveResult = { success: false };

        // Check for jump move (distance ~2.83 for diagonal 2 squares)
        if (distance > 2.5 && distance < 3) {
            result = this.executeJumpMove(piece, targetPos);
        }
        // Check for regular 1-space move (distance ~1.41 for diagonal)
        else if (distance > 1.2 && distance < 1.6) {
            result = this.executeRegularMove(piece, targetPos, 1);
        }
        // Check for 2-space first move (distance ~2.83 for diagonal 2 squares)
        else if (!piece.hasMoved && distance > 2.5 && distance < 3) {
            result = this.executeRegularMove(piece, targetPos, 2);
        }
        else {
            return { success: false, message: "Invalid move distance" };
        }

        // If move was successful, update game state
        if (result.success) {
            // Mark piece as moved
            piece.hasMoved = true;
            
            // Check for king promotion
            const shouldPromote = this.checkKingPromotion(piece);
            if (shouldPromote) {
                piece.isKing = true;
                result.becameKing = true;
                this.updatePieceAppearance(piece);
            }

            // Check if piece can continue jumping
            if (result.captured && result.captured.length > 0 && this.canCapture(piece)) {
                // Must continue jumping - don't switch turns
                this.mustCaptureFrom = [this.selectedPieceIndex];
                
                // Update selection indicator to follow the piece to its new position
                if (this.selectionIndicator) {
                    this.selectionIndicator.position.x = piece.mesh.position.x;
                    this.selectionIndicator.position.z = piece.mesh.position.z;
                }
            } else {
                // Switch turns
                this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
                this.mustCaptureFrom = [];
                this.deselectPiece();
                
                // Check if new player has forced captures
                this.checkForForcedCaptures();
            }
        }

        return result;
    }

    /**
     * Execute a regular (non-jump) move
     */
    private executeRegularMove(piece: CheckersPiece, targetPos: GridPosition, spaces: number): MoveResult {
        // Check if there are any jumps available
        if (this.hasAvailableJumps(piece.color)) {
            return { success: false, message: "Must capture when available" };
        }

        const dx = (targetPos.x - piece.gridPosition.x) / spaces;
        const dz = (targetPos.z - piece.gridPosition.z) / spaces;
        
        // Verify it's a diagonal move
        if (Math.abs(dx) !== 1 || Math.abs(dz) !== 1) {
            return { success: false, message: "Must move diagonally" };
        }

        // Check if move is forward
        if (!piece.isKing && !this.isForwardMove(piece, { x: dx, z: dz })) {
            return { success: false, message: "Regular pieces can only move forward" };
        }

        // Check intermediate squares are empty (for 2-space move)
        if (spaces === 2) {
            const midPoint = {
                x: piece.gridPosition.x + dx,
                z: piece.gridPosition.z + dz
            };
            if (this.getPieceAt(midPoint)) {
                return { success: false, message: "Path is blocked" };
            }
        }

        // Move the piece
        piece.gridPosition = { x: targetPos.x, z: targetPos.z };
        piece.mesh.position.x = targetPos.x;
        piece.mesh.position.z = targetPos.z;

        return { success: true };
    }

    /**
     * Execute a jump move
     */
    private executeJumpMove(piece: CheckersPiece, targetPos: GridPosition): MoveResult {
        const dx = targetPos.x - piece.gridPosition.x;
        const dz = targetPos.z - piece.gridPosition.z;
        
        // Must be exactly 2 squares diagonally
        if (Math.abs(dx) !== 2 || Math.abs(dz) !== 2) {
            return { success: false, message: "Invalid jump distance" };
        }

        const jumpOverPos = {
            x: piece.gridPosition.x + dx / 2,
            z: piece.gridPosition.z + dz / 2
        };

        const jumpOverPiece = this.getPieceAt(jumpOverPos);
        
        if (!jumpOverPiece) {
            return { success: false, message: "No piece to jump over" };
        }

        if (jumpOverPiece.color === piece.color) {
            return { success: false, message: "Cannot jump over own piece" };
        }

        // Execute the jump
        piece.gridPosition = { x: targetPos.x, z: targetPos.z };
        piece.mesh.position.x = targetPos.x;
        piece.mesh.position.z = targetPos.z;

        // Remove captured piece
        this.removePiece(jumpOverPiece);

        return { 
            success: true, 
            captured: [jumpOverPos]
        };
    }

    /**
     * Check if a piece should be promoted to king
     */
    private checkKingPromotion(piece: CheckersPiece): boolean {
        if (piece.isKing) {
            return false;
        }

        // Black pieces reach the opposite side at BOARD_MAX
        // White pieces reach the opposite side at BOARD_MIN
        if (piece.color === 'black' && piece.gridPosition.z >= BOARD_MAX) {
            return true;
        }
        if (piece.color === 'white' && piece.gridPosition.z <= BOARD_MIN) {
            return true;
        }

        return false;
    }

    /**
     * Update piece appearance for king
     */
    private updatePieceAppearance(piece: CheckersPiece): void {
        if (piece.isKing) {
            // Make kings slightly larger and add glow
            piece.mesh.scale.set(1.2, 1.2, 1.2);
            const material = piece.mesh.material as THREE.MeshStandardMaterial;
            material.emissive = new THREE.Color(0xffff00);
            material.emissiveIntensity = 0.3;
        }
    }

    /**
     * Check if a color has any available jumps
     */
    private hasAvailableJumps(color: CheckersColor): boolean {
        return this.pieces
            .filter(p => p.color === color)
            .some(p => this.canCapture(p));
    }

    /**
     * Check for forced captures at the start of a turn
     */
    private checkForForcedCaptures(): void {
        const piecesWithCaptures = this.pieces
            .map((p, i) => ({ piece: p, index: i }))
            .filter(({ piece }) => piece.color === this.currentPlayer && this.canCapture(piece));

        if (piecesWithCaptures.length > 0) {
            this.mustCaptureFrom = piecesWithCaptures.map(p => p.index);
        } else {
            this.mustCaptureFrom = [];
        }
    }

    /**
     * Get game status message
     */
    public getStatusMessage(): string {
        const playerText = this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1);
        
        if (this.mustCaptureFrom.length > 0) {
            return `${playerText}'s turn - Must capture!`;
        }
        
        return `${playerText}'s turn`;
    }

    /**
     * Check if there's a winner (one player has no pieces left)
     */
    public checkWinner(): CheckersColor | null {
        const blackPieces = this.pieces.filter(p => p.color === 'black').length;
        const whitePieces = this.pieces.filter(p => p.color === 'white').length;
        
        if (blackPieces === 0) {
            return 'white'; // White wins
        }
        if (whitePieces === 0) {
            return 'black'; // Black wins
        }
        
        return null; // No winner yet
    }

    /**
     * Get piece counts for each color
     */
    public getPieceCounts(): { black: number, white: number } {
        const blackPieces = this.pieces.filter(p => p.color === 'black').length;
        const whitePieces = this.pieces.filter(p => p.color === 'white').length;
        
        return { black: blackPieces, white: whitePieces };
    }

    /**
     * Check if current player has any valid moves
     */
    public hasValidMoves(): boolean {
        const currentPlayerPieces = this.pieces.filter(p => p.color === this.currentPlayer);
        
        for (const piece of currentPlayerPieces) {
            const moves = this.getValidMoves(piece);
            if (moves.length > 0) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Skip turn (advance to next player)
     */
    public skipTurn(): void {
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.mustCaptureFrom = [];
        this.deselectPiece();
        this.checkForForcedCaptures();
    }
}
