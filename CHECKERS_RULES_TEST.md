# Checkers Rules Implementation Test

This document describes how each rule from the problem statement is implemented in the code.

## Rules Implementation

### 1. A checker may move forward 1 space if there are no opposing piece
**Implementation**: `executeRegularMove()` method validates diagonal forward movement of 1 space.
- Location: `src/managers/checkersManager.ts:396-430`
- Checks: Forward direction, diagonal movement, empty target square

### 2. If the checker has never moved before it may move one or two spaces
**Implementation**: `hasMoved` flag tracked per piece, 2-space move allowed if false.
- Location: `src/managers/checkersManager.ts:396-430`
- Piece tracking: Line 12 (`hasMoved: boolean`)
- Validation: Line 408-424

### 3. If a checker reaches the opposite side of the board it becomes a king
**Implementation**: `checkKingPromotion()` checks if piece reached opposite end.
- Location: `src/managers/checkersManager.ts:491-507`
- Black pieces: z >= 3.5
- White pieces: z <= -3.5
- Visual change: Scale 1.2x, yellow glow

### 4. A checker must jump over an opposing checker diagonally if the opportunity arises
**Implementation**: `hasAvailableJumps()` checks for forced captures before regular moves.
- Location: `src/managers/checkersManager.ts:396-430`
- Forced capture check: Line 398-400
- Validation: Returns error if jumps available but not taken

### 5. A continued jump may also occur if there is another neighbor diagonal
**Implementation**: `getJumpMoves()` recursively finds multi-jump sequences.
- Location: `src/managers/checkersManager.ts:348-387`
- Recursive check: Line 374-378
- Continues until no more jumps available

### 6. Checkers may only jump over a neighbor to the next spot in the line on the diagonal
**Implementation**: Jump validation ensures exact 2-square diagonal distance.
- Location: `src/managers/checkersManager.ts:432-471`
- Distance check: Line 437-440
- Middle square validation: Line 442-446

### 7. Checkers may only move backwards with diagonal jumps
**Implementation**: `isForwardMove()` restricts regular pieces to forward, allows backward jumps.
- Location: `src/managers/checkersManager.ts:332-339`
- Forward check for regular moves: Line 416-418
- Backward jumps allowed: Line 366-370

### 8. Only one movement per turn per color is allowed
**Implementation**: `currentPlayer` tracks whose turn it is, switches after valid move.
- Location: `src/managers/checkersManager.ts:293-302`
- Turn switch: Line 297-298
- Exception: Multi-jump continues same turn until complete

### 9. Turns alternate back and forth for colors
**Implementation**: `currentPlayer` alternates between 'black' and 'white'.
- Location: `src/managers/checkersManager.ts:297`
- Switch logic: `currentPlayer = currentPlayer === 'black' ? 'white' : 'black'`
- UI display updates automatically

### 10. When an opposing color piece is jumped over, that piece is removed from the board
**Implementation**: `removePiece()` called after successful jump.
- Location: `src/managers/checkersManager.ts:459-461`
- Capture tracking: MoveResult includes `captured` array
- Removal: Disposes mesh, geometry, material and removes from scene

## Game State Management

- **Current Player**: Tracked with `currentPlayer: CheckersColor`
- **King Status**: Tracked with `isKing: boolean` per piece
- **First Move**: Tracked with `hasMoved: boolean` per piece
- **Forced Captures**: Tracked with `mustCaptureFrom: number[]`

## User Interface

- Current player displayed in settings panel
- Status message shows "Must capture!" when forced
- Blue sphere indicates selected piece
- Kings are visually distinct (1.2x scale, yellow glow)

## Testing Notes

To test the implementation:
1. Build the project: `npm run build`
2. Serve the files: `npx http-server src -p 8080`
3. Navigate to: `http://localhost:8080/checkers.html`
4. Click pieces to select and move them
5. Verify rules are enforced through console messages
