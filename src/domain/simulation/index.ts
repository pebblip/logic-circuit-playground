/**
 * シミュレーションドメイン
 *
 * 論理回路のシミュレーション、信号処理、クロック制御を担当
 */

export * from './circuitSimulation';
export * from './signalConversion';

// デフォルトエクスポート（後方互換性のため）
export { evaluateCircuit as default } from './circuitSimulation';
