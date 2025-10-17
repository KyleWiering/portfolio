/**
 * Core type definitions for the 3D Model Viewer
 * Shared across all modules for consistency
 */

/**
 * Configuration for creating a 3D object
 */
export interface ObjectConfig {
    useTexture: boolean;
    color?: number;
    textureUrl?: string;
}

/**
 * Grid position in 2D space
 */
export interface GridPosition {
    x: number;
    z: number;
}

/**
 * Supported object types in the viewer
 */
export type ObjectType = 'pyramid' | 'cube' | 'sphere';

/**
 * Movement directions for objects
 */
export type MovementDirection = 'left' | 'right' | 'forward' | 'backward';

/**
 * Checkers piece color
 */
export type CheckersColor = 'black' | 'white';

/**
 * Move result for checkers
 */
export interface MoveResult {
    success: boolean;
    captured?: GridPosition[];
    becameKing?: boolean;
    message?: string;
}
