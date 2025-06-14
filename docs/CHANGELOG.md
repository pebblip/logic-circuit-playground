# 📝 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Documentation Updates - 2024-12-13
- 📝 Updated ROADMAP.md to reflect Phase 0,1 completion and Phase 2 progress (80%)
- 📝 Updated ARCHITECTURE.md to match actual directory structure and implementation
- 📝 Updated PROJECT_BLUEPRINT.md to show 4 modes and implemented features
- 📝 Updated README.md with current version info and feature list
- 📝 Updated CHANGELOG.md with latest changes and phase history

## [0.3.0] - 2024-12-13 - Phase 2: UI/UX Improvements (80% Complete)

### Added
- ✅ **Learning Mode Production Quality**: 18/22 lessons with unified 7-step structure (4 lessons remain in beta)
- ✅ **Property Panel Enhancement**: Integrated gate info and truth tables for placed gates
- ✅ **Error Notifications**: Toast-style visual error feedback with auto-dismiss
- ✅ **Keyboard Shortcuts**: Delete, Undo/Redo (Ctrl+Z/Y), Copy/Paste (Ctrl+C/V), SelectAll (Ctrl+A)
- ✅ **Keyboard Help Modal**: Press "?" to view all available shortcuts
- ✅ **URL Sharing**: Base64-encoded circuit sharing functionality
- ✅ **Responsive Improvements**: Better mobile and tablet experience
- ✅ **Error Slice**: Centralized error handling in Zustand store

### Fixed  
- 🐛 **Property Panel Selection**: Implemented mutual exclusion between tool palette and placed gates
- 🐛 **Learning Resource Display**: Added learning resources for placed gates in property panel
- 🐛 **Error Message Clarity**: Improved connection error messages with visual feedback
- 🐛 **Keyboard Shortcut Conflicts**: Resolved event handling for overlapping shortcuts

## [0.2.0] - 2024-12-01 - Phase 1: Architecture & Core Features

### Architecture Decision
- 🏗️ Adopted **Hybrid Feature-Domain Architecture**
  - Feature層: UI and feature-specific logic
  - Domain層: Business logic and core models
  - Appropriate complexity for project scale

### Documentation Updates
- 📝 Complete architecture redesign (`ARCHITECTURE.md`)
- 📝 Realistic roadmap with achievable milestones (`ROADMAP.md`) 
- 📝 Documentation structure guide (`docs/README.md`)
- 📝 Updated interaction model to drag-and-drop placement
- 📝 Created CHANGELOG.md for version tracking

### Added
- ✅ **Type-safe simulation**: Result<T,E> pattern implementation
- ✅ **Custom gate creation**: Create new gates from circuits
- ✅ **Truth table display**: Visualize custom gate behavior
- ✅ **Test suite**: TruthTableDisplay.test.tsx (7 test cases)
- ✅ **Defensive programming**: Fallback with safeOutputNames
- ✅ **Required field indicators**: Red asterisk for UI improvement
- ✅ Zustand store implementation for global state management
- ✅ Responsive layout implementation with mockup CSS
- ✅ Performance optimization with React.memo
- ✅ Right sidebar (PropertyPanel) visibility fix
- ✅ Truth table automatic generation for combinational circuits
- ✅ Structured gate descriptions with rich JSX rendering (replaced Markdown)
- ✅ Advanced gates (XOR, NAND, NOR, CLOCK, D-FF, SR-LATCH, MUX)
- ✅ Gate description modal with detailed explanations and analogies
- ✅ CLOCK gate animation and frequency control

### Changed
- 🔄 Architecture: from Feature-Sliced Design to Hybrid Feature-Domain
- 🔄 Interaction model: drag-and-drop placement only (removed auto-placement)
- 🔄 Mode naming: unified to 学習モード, フリーモード, パズルモード
- 🔄 Grid layout fix: `minmax(0, 1fr)` for proper constraint

### Fixed
- 🐛 **Truth table output headers**: Fixed undefined output names issue
- 🐛 **Custom gate pin positions**: Unified calculation with CustomGateRenderer
- 🐛 **複数CLOCKゲート同期問題**: Canvas useEffect依存配列を修正
- 🐛 **カスタムゲート作成ダイアログ**: イベント伝播とprops受け渡し修正
- 🐛 **テスト期待値ミス**: pinPositionCalculator期待値を80→85に修正
- 🐛 Right sidebar not visible due to grid overflow
- 🐛 Build errors related to TypeScript strict mode
- 🐛 CLOCK gate modal close button not working due to state update conflicts
- 🐛 Special gates preview shapes mismatch with actual rendering
- 🐛 Gate selection issues with SVG event handling
- 🐛 Custom gate creation dialog validation and UI issues

## [0.1.0] - 2024-11-15 - Phase 0: Basic Functionality

### Added
- ✅ **Drag & Drop Placement**: Intuitive gate placement from tool palette
- ✅ **Coordinate Transformation**: Proper SVG coordinate handling
- ✅ **Wire Connection**: Visual feedback during connection
- ✅ **Responsive Design**: Desktop, tablet, and mobile layouts
- ✅ **Basic Gates**: AND, OR, NOT, XOR, NAND, NOR
- ✅ **Special Gates**: INPUT, OUTPUT, CLOCK
- ✅ **Advanced Gates**: D-FF, SR-LATCH, MUX, Register

### Current Status
- ✅ **Phase 0**: Basic functionality (Complete)
- ✅ **Phase 1**: Architecture & core features (Complete)
- 🚧 **Phase 2**: UI/UX improvements (80% Complete)
  - 18/22 lessons at production quality, 4 lessons in beta
  - Property panel enhanced
  - Error handling improved
  - Keyboard shortcuts implemented
  - URL sharing functional
- 📋 **Phase 3**: Next-generation features (Planned)

### Technical Debt
- ✅ **改善完了**: coreAPI移行によりResult<T,E>パターン導入
- ✅ **改善完了**: 型安全性の向上（anyタイプ削減）
- ✅ **改善完了**: 防御的プログラミングによる安定性向上
- 🏚️ Multiple architectural patterns coexist


---

## Versioning Guide

- **Major (X.0.0)**: Breaking changes, major feature releases
- **Minor (0.X.0)**: New features, minor improvements
- **Patch (0.0.X)**: Bug fixes, documentation updates

## Phase Mapping

- **Phase 0**: v0.1.0 - Basic Functionality (Complete)
- **Phase 1**: v0.2.0 - Architecture & Core Features (Complete)
- **Phase 2**: v0.3.0 - UI/UX Improvements (80% Complete)
- **Phase 3**: v0.4.0 - Next-Generation Features (Planned)
- **v1.0.0**: Production Ready (Target: 2025)