# Building Dammen: A 3D Dutch Checkers Game Through 31 AI-Powered Pull Requests

## From Zero to Game in 31 PRs - All From an iPhone 13 Pro Max

What started as a simple portfolio website evolved into a fully-featured 3D game - and I built it entirely on my phone. Using nothing but the GitHub mobile app and Microsoft Edge on my iPhone 13 Pro Max, I leveraged AI and GitHub Copilot to transform a concept into a complete Dutch Checkers (Dammen) game through 31 pull requests.

This is the story of modern development: AI-assisted prompts, iterative refinement, and the power of mobile-first workflows.

---

## Phase 1: Foundation (PRs #4-6)

### [PR #4: Fix CSS rendering on GitHub Pages](https://github.com/KyleWiering/portfolio/pull/4)
**Prompt:** *"Fix the CSS rendering issue on GitHub Pages. The page displays as unstyled HTML because the styles.css file is returning a 404 error."*

**What happened:** The deployment workflow was only copying `index.html` to the `dist/` directory but not `styles.css`. Modified `.github/workflows/deploy.yml` to copy both files, updated resource paths for GitHub Pages compatibility, and added comprehensive deployment documentation.

**Key accomplishment:** Portfolio now renders correctly with proper styling on GitHub Pages.

---

### [PR #5: Add professional resume page with download link](https://github.com/KyleWiering/portfolio/pull/5)
**Prompt:** *Not provided (manually created)*

**What happened:** Transformed the portfolio from a generic template into a personalized site featuring a complete professional resume page with download functionality, comprehensive work history, and clean navigation between pages.

**Key accomplishment:** Portfolio personalized with Kyle Wiering's professional information and resume.

---

### [PR #6: Add 3D browser game with spinning cube loader using Three.js](https://github.com/KyleWiering/portfolio/pull/6)
**Prompt:** *"Create a basic page with a loader for a 3D browser game. This page should include a spinning cube as the main object and should be a compiled application intended for a single-page application (SPA)."*

**What happened:** Implemented a complete 3D experience using Three.js v0.160.0 with WebGL rendering, a multi-colored spinning cube, visual loader, and seamless navigation. Added esbuild for bundling (~800KB ES module).

**Key accomplishment:** First 3D WebGL experience added to portfolio - the foundation for what would become Dammen.

---

## Phase 2: Model Viewer Evolution (PRs #7-12)

### [PR #7: Update 3D browser application to model viewer](https://github.com/KyleWiering/portfolio/pull/7)
**Prompt:** *"Update the existing 3D browser application to function as a 'model viewer' instead of a game. The viewer should include the ability to display three models: a pyramid, a cube, and a sphere."*

**What happened:** Refactored the spinning cube demo into a modular model viewer with three distinct 3D shapes. Created `src/models/` directory structure with separate files for each model, implemented model interface with color and texture support.

**Key accomplishment:** Modular architecture established - each model in its own file, supporting both color and procedural textures.

---

### [PR #8: Add isometric grid and black background to 3D model viewer](https://github.com/KyleWiering/portfolio/pull/8)
**Prompt:** *"Enhance the 3D model viewer by adding an isometric grid of pixel-thin dashed lines to serve as a playing field. Set the background color of the viewer to black."*

**What happened:** Added `createIsometricGrid()` helper function generating a 20×20 grid with dashed lines using `THREE.LineDashedMaterial`. Changed background from dark blue to pure black for better contrast.

**Key accomplishment:** Visual foundation for a game board established with professional isometric grid.

---

### [PR #9: Add touch-based mobile controls for 3D model viewer grid navigation](https://github.com/KyleWiering/portfolio/pull/9)
**Prompt:** *"Enhance the isometric grid in the 3D model viewer to allow movement using mobile phone controls. The grid should support movement back and forth, as well as left and right, without rotation or pivoting."*

**What happened:** Implemented swipe gesture detection with `touchstart` and `touchend` events. Added 50px swipe threshold, grid position management, and arrow key support for desktop. Models constrained to grid boundaries (±10 units).

**Key accomplishment:** Mobile-first controls implemented - the game can now be played on touch devices.

---

### [PR #10: Add in-WebGL menu with modular architecture and separation of concerns](https://github.com/KyleWiering/portfolio/pull/10)
**Prompt:** *"Enhance the WebGL application by adding a menu directly inside the WebGL interface. Move the list of models (pyramid, cube, sphere) into this menu."*

**What happened:** Replaced external HTML panels with integrated menu using glassmorphism design. Refactored monolithic codebase into focused modules: SceneRenderer, ModelManager, MenuController, and InputController. Main entry point reduced from 353 lines to 66 lines (81% reduction).

**Key accomplishment:** Clean separation of concerns achieved - better maintainability and GitHub Actions compatibility.

---

### [PR #11: Display all three 3D models simultaneously with independent movement controls](https://github.com/KyleWiering/portfolio/pull/11)
**Prompt:** *"Adjust the WebGL application to display a list of all objects on the isometric grid rather than a single object. Add the pyramid, sphere, and cube models to the grid and position them in distinct locations."*

**What happened:** Refactored ModelManager to support multiple models with independent movement. Added `selectNextModel()`, `selectPreviousModel()`, and `moveSelectedModel()` methods. Selected model scaled 1.2x larger for identification.

**Key accomplishment:** Multi-object management system - foundation for game pieces.

---

### [PR #12: Add direct touch selection to 3D models in game viewer](https://github.com/KyleWiering/portfolio/pull/12)
**Prompt:** *"Add direct touch selection to the 3D models in the game viewer. Implement raycasting to allow users to tap on a model to select it directly via touch."*

**What happened:** Implemented Three.js raycasting for touch selection. Distinguished taps from swipes (tap: <300ms AND <10px movement). Added callback architecture for centralized selection updates.

**Key accomplishment:** Intuitive touch interaction - tap to select, swipe to move.

---

## Phase 3: Checkers Foundation (PRs #13-17)

### [PR #13: Reorganize repository structure for extensible 3D model viewer](https://github.com/KyleWiering/portfolio/pull/13)
**Prompt:** *"Clean up the repository structure to better organize the code for a 3D model viewer. Prepare for adding more movable objects with texture maps that behave differently."*

**What happened:** Created comprehensive directory structure with `/src/core/` for shared modules, `/src/objects/` for 3D definitions, and introduced ObjectBehavior interface for extensible interactions. Eliminated code duplication by extracting shared types and textures.

**Key accomplishment:** Scalable architecture - easy to add new object types with unique behaviors.

---

### [PR #14: Implement Checkers 3D Viewer with Overhead Camera and Piece Selection](https://github.com/KyleWiering/portfolio/pull/14)
**Prompt:** *"1. Rename the model viewer to '3D Hello World'. 2. Duplicate the 3D Hello World and call it 'Checkers'. 3. For Checkers, adjust the camera perspective to be 'above, looking down' on the isometric grid."*

**What happened:** Created separate `checkers.html` page with overhead camera at position (0, 12, 8). Implemented 16 pyramids (8 black, 8 white) in two vertical columns per side. Added CheckersPieceBehavior with static animation, and blue sphere selection indicator.

**Key accomplishment:** Game foundation established - dual pages with distinct 3D experiences.

---

### [PR #15: Add checkerboard texture, reposition pieces, and apply brick facade](https://github.com/KyleWiering/portfolio/pull/15)
**Prompt:** *"For the Checkers game: 1. Draw a black and white checkerboard on the grid using a texture instead of many square objects. 2. Line up the checkers across from each other."*

**What happened:** Created procedural checkerboard texture (8×8 pattern with 64px squares) and brick facade texture with mortar lines. Repositioned 24 pieces in standard checkers formation (12 per side, 3 rows each). Reduced pyramid size by 30% to prevent overlap.

**Key accomplishment:** Professional game board with realistic textures and proper piece positioning.

---

### [PR #16: Fix Checkers game loading issue - incorrect JavaScript file path](https://github.com/KyleWiering/portfolio/pull/16)
**Prompt:** *"The Checkers game is no longer loading and gets stuck on 'loading 3D scene'. Investigate and fix the issue preventing the scene from loading properly."*

**What happened:** Fixed script path in `checkers.html` from `../dist/checkers.js` to `./checkers.js` to match deployment structure. The relative path worked locally but broke when deployed to GitHub Pages.

**Key accomplishment:** Deployment issue resolved - game now loads correctly in production.

---

### [PR #17: Implement complete checkers movement rules and game logic](https://github.com/KyleWiering/portfolio/pull/17)
**Prompt:** *"Implement the following checkers movement rules for each piece on the board: 1. A checker may move forward 1 space if there are no opposing piece. 2. If the checker has never moved before it may move one or two spaces..."*

**What happened:** Implemented comprehensive game state management with turn alternation, move validation, capture system, multi-jump support, and king promotion. Added 500 lines of game logic including `getValidMoves()`, `getJumpMoves()`, `movePiece()`, and winner detection. Board expanded to 2 rows per side with pieces on all squares.

**Key accomplishment:** Fully playable checkers game with all 10 movement rules enforced.

---

## Phase 4: Core Gameplay (PRs #18-23)

### [PR #18: Add piece movement functionality and adjust pyramid positioning](https://github.com/KyleWiering/portfolio/pull/18)
**Prompt:** *"1. The pieces need to be able to move now that the rules are in place. 2. The pyramids are too 'high' off of the board. 3. Zoom in closer to the board a bit as well."*

**What happened:** Fixed pyramid Y positioning from y=0 to y=-1.9 to match board plane. Adjusted camera from (0,12,8) to (0,10,5) for ~20% closer view. Reduced selection indicator offset from +1.5 to +1.0 to match new piece height.

**Key accomplishment:** Visual alignment perfected - pieces sit properly on board with better camera framing.

---

### [PR #19: Add rotation, zoom, and interactive zoom controls to checkers game](https://github.com/KyleWiering/portfolio/pull/19)
**Prompt:** *"Regular movement needs to be straight instead of diagonal. Zoom in a bit more on everything as well."*

**What happened:** Added Y-axis rotation animation for vertical spinning. Moved camera from (0, 10, 5) to (0, 8, 4) for additional zoom. Implemented interactive zoom with mouse wheel (desktop) and pinch-to-zoom (mobile), limited between 6-12 units.

**Key accomplishment:** Enhanced interactivity - user-controlled zoom for optimal viewing.

---

### [PR #20: Improve black piece contrast and add player-aware selection indicator](https://github.com/KyleWiering/portfolio/pull/20)
**Prompt:** *"Make the black side contrast more with the textured tile that is also black. Change the indication sphere to be textured smoothly, represent the side whose turn it is, with sufficient contrast."*

**What happened:** Changed black pieces from dark brown (#2a1810) to medium gray (#4a4a4a) with emissive lighting. Replaced blue sphere with player-aware indicator: dark gray for black's turn, light tan for white's turn. Increased geometry quality to 32×32 segments with radial gradient texture.

**Key accomplishment:** Clear visual distinction - selection indicator now represents current player.

---

### [PR #21: Implement 10x10 checkers board with 20 pieces per side, shadows, and game controls](https://github.com/KyleWiering/portfolio/pull/21)
**Prompt:** *"1. I need the pieces to only be in the dark parts of the board. 2. I need the board to be 10 by 10. 3. I need each side to have 20 pieces..."*

**What happened:** Expanded board from 8×8 to 10×10 grid. Placed pieces exclusively on dark squares using `(row + col) % 2 === 1` logic. Increased pieces per side from 16 to 20 (4 rows of 5 pieces). Replaced ambient + point light with directional light and shadow mapping (PCFSoftShadowMap, 2048×2048). Added "Skip Turn (Stuck)" button and winner detection.

**Key accomplishment:** Proper Dutch Checkers board configuration with realistic lighting and shadows.

---

### [PR #22: Address PR #21 code review nitpicks](https://github.com/KyleWiering/portfolio/pull/22)
**Prompt:** *"Address the Copilot code review nitpicks from PR #21: 1. Optimize HUD updates to run only on state changes instead of every frame..."*

**What happened:** Optimized HUD updates from ~60 times/second to only on state changes. Created `src/core/constants/boardConfig.ts` for centralized configuration. Made shadow map size configurable. Added accessible label and button type to stuck button. Derived tile size dynamically.

**Key accomplishment:** Performance optimization and code quality improvements.

---

### [PR #23: Enhance 3D Checkers Game with collapsible menu, hourglass indicator, fullscreen](https://github.com/KyleWiering/portfolio/pull/23)
**Prompt:** *"1. Render the menu/HUD in the game. 2. Make the menu collapsible instead of overlaying the board. 3. Change sphere indicators to inverted hourglass shape..."*

**What happened:** Implemented collapsible menu with smooth slide animation. Created hourglass selection indicator (two pyramids base-to-base). Added HTML5 Fullscreen API support. Increased pyramid height by 50% for better shadows. Added brown wood border with procedural wood grain, grassy field (200×200 units), and cloud-free sky gradient.

**Key accomplishment:** Complete environmental graphics - immersive 3D experience with realistic scenery.

---

## Phase 5: Visual Polish (PRs #24-27)

### [PR #24: Fix 5 bugs in checkers game](https://github.com/KyleWiering/portfolio/pull/24) [DRAFT]
**Prompt:** *"Fix the following bugs in the checkers game: 1. Continued jumps get stuck. 2. White side should go first..."*

**What happened:** Fixed multi-jump index tracking in `removePiece()` method by adjusting `selectedPieceIndex` and `mustCaptureFrom` array indices. Changed starting player from black to white. Enhanced sky gradient with very light blue at horizon. Rewrote grass texture with opaque colors and 1000+ elements. Created comprehensive wood texture with vertical grain, cross-grain, and knots.

**Key accomplishment:** Critical bug fixes and visual quality improvements.

---

### [PR #25: Fix checkers game bugs: continued jumps, turn order, horizon](https://github.com/KyleWiering/portfolio/pull/25)
**Prompt:** *"Fix the following bugs in the checkers game: 1. Fix the bug where continued jumps get stuck. 2. Fix the bug where the white side is supposed to go first..."*

**What happened:** Updated `movePiece()` to reposition selection indicator after each jump. Changed initial `currentPlayer` to 'white'. Extended grassy field from 200 to 500 units with 100×100 texture repetition. Extended camera far clipping plane to 2000 units. Redesigned grass texture with darker base (#2d5016), 1000 patches, and 800 individual blades. Increased wood texture resolution to 512×512 with 8 growth rings and 30 grain lines.

**Key accomplishment:** Multi-jump indicator tracking and photorealistic environmental textures.

---

### [PR #26: Implement checkers game enhancements: panning, water pool effects](https://github.com/KyleWiering/portfolio/pull/26)
**Prompt:** *"Implement the following features in the checkers game: 1. When no pieces are selected, allow panning around the board..."*

**What happened:** Added camera panning (right-click drag for desktop, two-finger drag for mobile). Implemented click-outside-board piece deselection. Created "endless pool" effect with semi-transparent blue water strips, vertical waterfall planes, and 40 randomly placed stone formations. Increased pyramid size by 30%. Hidden isometric grid for cleaner appearance.

**Key accomplishment:** Interactive camera controls and dramatic water pool scenery.

---

### [PR #27: Convert checkers pieces to hockey pucks with realistic wood textures](https://github.com/KyleWiering/portfolio/pull/27)
**Prompt:** *"Implement the following updates in the checkers game: 1. Add shadows from the pieces. 2. Convert the pieces from pyramids to hockey pucks..."*

**What happened:** Replaced pyramid geometry with cylinder geometry (hockey pucks). Created beachwood texture for light pieces (blonde/tan #f5deb3 gradient with wood grain) and ebony texture for dark pieces (very dark brown #1a0f0a with deep grain lines). Made pucks cover 90% of squares. Collapsed menu by default. Replaced waterfall with solid stone walls. Extracted all magic numbers to `boardConfig.ts`.

**Key accomplishment:** Authentic wooden game pieces with distinct beachwood and ebony finishes.

---

## Phase 6: Bug Fixes and Refinement (PRs #28-30)

### [PR #28: Fix multi-jump bug by adjusting array indices when pieces are captured](https://github.com/KyleWiering/portfolio/pull/28)
**Prompt:** *"Fix the multi-jump bug where the game doesn't allow a second jump even though it's still the player's turn."*

**What happened:** Modified `removePiece()` method to maintain index integrity by decrementing `selectedPieceIndex` when pieces before it are removed, and mapping all indices in `mustCaptureFrom` array accordingly. This ensures validation checks work correctly across multi-jump sequences.

**Key accomplishment:** Multi-jump functionality fully operational - captured pieces no longer cause index mismatches.

---

### [PR #29: Fix bugs in checkers game functionality and UI](https://github.com/KyleWiering/portfolio/pull/29)
**Prompt:** *"Fix the following bugs in the checkers game: 1. Victory is caught but only displayed in the setting menu. Add a 'play again' button to render over the screen..."*

**What happened:** Added "Play Again" button overlay when game is won. Implemented full-length diagonal movement for kings (previously restricted to 1-2 spaces). Enhanced beachwood texture with more visual detail. Changed displayed game name from "Checkers" to "Dammen (Dutch Checkers)".

**Key accomplishment:** Proper king movement and victory UI improvements.

---

### [PR #30: Implement Dutch Checkers enhancements: king jumps, bot player, and color rotation](https://github.com/KyleWiering/portfolio/pull/30)
**Prompt:** *"Implement the following features for the Dammen (Dutch Checkers) game: 1. Kings must be able to jump the same as they move (full diagonal distance)..."*

**What happened:** Enhanced king jumping to scan along diagonals at any distance (1-9 squares). Added validation preventing kings from jumping over multiple pieces. Removed Y-axis rotation animation. Implemented AI bot player with move evaluation scoring (captures: 10 pts, promotions: 5 pts). Added player color rotation - starting player alternates between games.

**Key accomplishment:** Complete AI opponent and authentic Dutch Checkers rules.

---

## Phase 7: Final Touches (PRs #31-32)

### [PR #31: Fix Dammen game: black background, bot player, and mobile menu positioning](https://github.com/KyleWiering/portfolio/pull/31)
**Prompt:** *"Fix the following issues in the Dammen game: 1. Change the purple-like background in the web viewer to black..."*

**What happened:** Set scene background to solid black (#000000), removing sky gradient and grassy field. Fixed bot to always play black pieces while white player (human) always starts. Added responsive CSS media queries for mobile with menu at bottom in portrait mode. Adjusted wall height to 1.0 units to align with water moat edge.

**Key accomplishment:** Black background and proper mobile menu rendering.

---

### [PR #32: Fix Dammen game: Remove 2-space first move and add Wikipedia rules link](https://github.com/KyleWiering/portfolio/pull/32)
**Prompt:** *"Fix the following bugs in the Dammen game: 1. Regular pieces can move two places, but should only be able to move one place..."*

**What happened:** Removed all logic permitting 2-space first moves for regular pieces - they now correctly move only 1 space diagonally forward. Added link to Dutch Wikipedia article on Dammen (https://nl.m.wikipedia.org/wiki/Dammen) in Settings panel with proper security attributes. Updated rules display to remove outdated text.

**Key accomplishment:** Rules aligned with standard Dammen - game now follows authentic Dutch Checkers gameplay.

---

## Conclusion: The Power of AI-Assisted Development from Mobile

### By the Numbers
- **31 Pull Requests** from #4 through #32 (excluding open PR #3)
- **100% Mobile Development** - Every prompt, every review, every merge done on iPhone 13 Pro Max
- **Tools Used:** GitHub mobile app + Microsoft Edge browser
- **AI Partner:** GitHub Copilot coding agent
- **Architecture:** Modular TypeScript with Three.js, compiled with esbuild
- **Final Features:**
  - Full 3D WebGL game engine
  - Authentic Dutch Checkers (Dammen) rules
  - AI bot opponent with move evaluation
  - Touch and mouse controls
  - Camera panning and zoom
  - Realistic textures (wood, water, stone)
  - Complete environmental graphics
  - Mobile-responsive UI

### The Journey

What started as "fix the CSS" evolved through model viewers, touch controls, and modular architecture into a complete 3D game. Each PR built on the previous, guided by natural language prompts and AI-generated code. The development process was iterative - bugs were caught and fixed, features were refined, and the codebase was continuously refactored for better maintainability.

### The Mobile Workflow

Every single interaction happened on mobile:
- Typed prompts in GitHub mobile app
- Reviewed AI-generated code in Microsoft Edge
- Approved and merged PRs from phone
- Tested the deployed game in mobile browser
- Created issues and provided feedback - all from the same device

This wasn't a proof of concept - this was real development, producing production-quality code, entirely from mobile. No laptop required.

### The AI Advantage

GitHub Copilot didn't just write code - it understood context, maintained consistency across 31 PRs, and made intelligent architectural decisions. From implementing raycasting for touch selection to creating procedural textures for wood grain, the AI consistently produced functional, well-structured code.

The prompts evolved too. Early PRs had detailed specifications. Later PRs could say "fix these 5 bugs" and Copilot would diagnose, implement, and document the solutions.

### Modern Development

This project demonstrates what's possible with modern development tools:
- AI can handle complex game logic and 3D graphics
- Mobile devices are legitimate development platforms
- Natural language is a powerful programming interface
- Iterative refinement through PRs produces quality results

The future of development isn't about replacing developers - it's about augmenting them. With AI handling implementation details, developers can focus on creative vision, architectural decisions, and user experience.

### Play the Game

Experience the result of this journey: [Dammen (Dutch Checkers)](https://kylewiering.github.io/portfolio/checkers.html)

The complete source code and all 31 PRs are available in the [KyleWiering/portfolio](https://github.com/KyleWiering/portfolio) repository.

---

*Built with ❤️, AI, and an iPhone 13 Pro Max*
