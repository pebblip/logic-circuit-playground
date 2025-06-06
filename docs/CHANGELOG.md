# 📝 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🎯 Current Status

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

### Known Issues - Priority High 🔴
- 主要機能が正常動作
- coreAPI移行完了により技術的負債を削減
- テストが通過

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

- **Phase 1**: v0.2.0 - Foundation (Zustand, Architecture)
- **Phase 2**: v0.3.0 - UI Unification (In Progress)
- **Phase 3**: v0.4.0 - Core Features (Planned)
- **Phase 4**: v0.5.0 - Advanced Features (Planned)
- **Phase 5**: v1.0.0 - Production Ready (Planned)