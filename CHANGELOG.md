# 📝 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-01-26

### 🎯 Current Phase: Phase 1 - アーキテクチャ整理 & Phase 2 - UI/UX改善

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
- 🐛 Right sidebar not visible due to grid overflow
- 🐛 Build errors related to TypeScript strict mode
- 🐛 CLOCK gate modal close button not working due to state update conflicts
- 🐛 Special gates preview shapes mismatch with actual rendering
- 🐛 Gate selection issues with SVG event handling
- 🐛 Custom gate creation dialog validation and UI issues

### Known Issues - Priority High 🔴
- ⚠️ None currently (基本機能は全て動作)

### Technical Debt
- 🏚️ src_old directory needs to be cleaned up
- 🏚️ ViewModelパターン needs to be integrated with Zustand
- 🏚️ Multiple architectural patterns coexist

## [0.2.0] - 2024-01-XX (Phase 1 Completed)

### Added
- Feature-Sliced Design architecture documentation
- Zustand store with immer middleware
- Bidirectional sync between ViewModel and store
- Basic responsive hooks

### Changed
- Migrated from function-based to class-based domain models
- Implemented ViewModelパターン with EventEmitter

## [0.1.0] - 2024-01-XX (Initial Release)

### Added
- Basic circuit editor with gate placement
- Real-time circuit simulation
- Basic gate types (AND, OR, NOT, XOR, NAND, NOR)
- Input/Output components (Switch, LED)
- Connection wire drawing
- Mode selection screen

### Technical Stack
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Vitest for testing
- SVG-based rendering

---

## Versioning Guide

- **Major (X.0.0)**: Breaking changes, major feature releases
- **Minor (0.X.0)**: New features, minor improvements
- **Patch (0.0.X)**: Bug fixes, documentation updates

## Phase Mapping

- **Phase 1**: v0.2.0 - Foundation (Zustand, Architecture)
- **Phase 2**: v0.3.0 - UI Unification (In Progress)
- **Phase 3**: v0.4.0 - Core Features (Planned)
- **Phase 4**: v0.5.0 - Advanced Features (Planned)
- **Phase 5**: v1.0.0 - Production Ready (Planned)