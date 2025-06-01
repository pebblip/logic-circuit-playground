import { useState, useCallback, useEffect } from 'react';
import { Discovery, PlayerProgress } from '../../../entities/types/discovery';
import { DISCOVERIES, MILESTONES } from '../../data/discoveries';
import { BaseGate } from '../../../entities/gates/BaseGate';
import { Circuit } from '../../../entities/circuit/Circuit';

const STORAGE_KEY = 'logic-circuit-discoveries';

export function useDiscovery() {
  const [progress, setProgress] = useState<PlayerProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      discoveries: {},
      unlockedGates: ['AND', 'OR', 'NOT'], // 初期ゲート
      milestones: {},
      totalExperiments: 0,
      favoriteCircuits: []
    };
  });

  // 進捗を保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  // 回路から発見をチェック
  const checkDiscoveries = useCallback((circuit: any) => {
    const gateTypes = new Set<string>();
    const gates: any[] = [];

    // 回路内のゲートタイプを収集
    const circuitGates = circuit.gates || [];
    circuitGates.forEach((gate: any) => {
      gateTypes.add(gate.type);
      gates.push(gate);
    });

    const newDiscoveries: string[] = [];

    // 各発見条件をチェック
    DISCOVERIES.forEach(category => {
      category.discoveries.forEach(discovery => {
        if (progress.discoveries[discovery.id]) return; // 既に発見済み

        let discovered = false;

        switch (discovery.type) {
          case 'gate_combination':
            // 特定のゲートの組み合わせをチェック
            if (discovery.id === 'first_and' && gateTypes.has('AND')) {
              discovered = true;
            } else if (discovery.id === 'or_discovery' && gateTypes.has('OR')) {
              discovered = true;
            } else if (discovery.id === 'not_magic' && gateTypes.has('NOT')) {
              discovered = true;
            } else if (discovery.id === 'nand_creation') {
              // ANDの出力がNOTに接続されているかチェック
              discovered = checkNANDPattern(gates);
            }
            break;

          case 'circuit_pattern':
            // 特定の回路パターンをチェック
            if (discovery.id === 'feedback_loop') {
              discovered = checkFeedbackLoop(gates);
            } else if (discovery.id === 'sr_latch_discovery') {
              discovered = checkSRLatchPattern(gates);
            }
            break;

          case 'logic_principle':
            // より高度な論理原理の発見（ユーザーのアクションに基づく）
            break;
        }

        if (discovered) {
          newDiscoveries.push(discovery.id);
        }
      });
    });

    if (newDiscoveries.length > 0) {
      return makeDiscovery(newDiscoveries);
    }
    return [];
  }, [progress]);

  // 発見を記録
  const makeDiscovery = useCallback((discoveryIds: string[]) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      const newUnlockedGates = new Set(prev.unlockedGates);

      discoveryIds.forEach(id => {
        newProgress.discoveries[id] = true;

        // ゲートのアンロック
        const discovery = DISCOVERIES.flatMap(cat => cat.discoveries).find(d => d.id === id);
        if (discovery?.unlocksGates) {
          discovery.unlocksGates.forEach(gate => newUnlockedGates.add(gate));
        }
      });

      // マイルストーンのチェック
      const newMilestones = { ...prev.milestones };
      MILESTONES.forEach(milestone => {
        if (!newMilestones[milestone.id]) {
          const achieved = milestone.requiredDiscoveries.every(
            reqId => newProgress.discoveries[reqId]
          );
          if (achieved) {
            newMilestones[milestone.id] = true;
            // 報酬の処理
            if (milestone.reward.type === 'gate') {
              newUnlockedGates.add(milestone.reward.value);
            }
          }
        }
      });

      return {
        ...newProgress,
        unlockedGates: Array.from(newUnlockedGates),
        milestones: newMilestones
      };
    });

    // 発見通知を表示（親コンポーネントでハンドリング）
    return discoveryIds;
  }, []);

  // 実験回数を増やす
  const incrementExperiments = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      totalExperiments: prev.totalExperiments + 1
    }));
  }, []);

  // お気に入り回路の追加/削除
  const toggleFavoriteCircuit = useCallback((circuitId: string) => {
    setProgress(prev => {
      const favorites = [...prev.favoriteCircuits];
      const index = favorites.indexOf(circuitId);
      if (index >= 0) {
        favorites.splice(index, 1);
      } else {
        favorites.push(circuitId);
      }
      return { ...prev, favoriteCircuits: favorites };
    });
  }, []);

  return {
    progress,
    checkDiscoveries,
    makeDiscovery,
    incrementExperiments,
    toggleFavoriteCircuit,
    discoveries: DISCOVERIES,
    milestones: MILESTONES
  };
}

// パターン検出のヘルパー関数
function checkNANDPattern(gates: any[]): boolean {
  // ANDゲートの出力がNOTゲートの入力に接続されているかチェック
  const andGates = gates.filter(g => g.type === 'AND');
  const notGates = gates.filter(g => g.type === 'NOT');

  // TODO: 接続情報を使用した正確な判定を実装
  // 現在はゲートの存在のみをチェック
  return andGates.length > 0 && notGates.length > 0;
}

function checkFeedbackLoop(gates: any[]): boolean {
  // TODO: フィードバックループの検出実装
  // 現在は簡易的にfalseを返す
  return false;
}

function checkSRLatchPattern(gates: any[]): boolean {
  // 2つのNORゲートが存在するかチェック
  const norGates = gates.filter(g => g.type === 'NOR');
  // TODO: クロス接続の判定を実装
  return norGates.length >= 2;
}