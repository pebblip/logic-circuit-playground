// エラー分析ユーティリティ

/**
 * エラーの種類を定義
 */
export const ERROR_TYPES = {
  CONNECTION: 'connection',
  LOGIC: 'logic', 
  STRUCTURE: 'structure',
  TIMING: 'timing',
  GENERAL: 'general'
};

/**
 * エラーレベルを定義
 */
export const ERROR_LEVELS = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * 回路のエラーを分析する
 */
export const analyzeCircuitErrors = (gates, connections, objective) => {
  const errors = [];
  
  // 接続エラーのチェック
  errors.push(...checkConnectionErrors(gates, connections));
  
  // 論理エラーのチェック
  errors.push(...checkLogicErrors(gates, connections, objective));
  
  // 構造エラーのチェック
  errors.push(...checkStructureErrors(gates, connections));
  
  // タイミングエラーのチェック
  errors.push(...checkTimingErrors(gates, connections));
  
  return errors;
};

/**
 * 接続エラーをチェック
 */
const checkConnectionErrors = (gates, connections) => {
  const errors = [];
  
  // 未接続の入力をチェック
  gates.forEach(gate => {
    if (gate.type === 'INPUT' || gate.type === 'OUTPUT') return;
    
    const inputCount = getGateInputCount(gate.type);
    const connectedInputs = connections.filter(c => 
      c.to === gate.id && c.toType === 'gate'
    ).length;
    
    if (connectedInputs < inputCount) {
      errors.push({
        id: `unconnected-${gate.id}`,
        type: ERROR_TYPES.CONNECTION,
        level: ERROR_LEVELS.ERROR,
        title: '未接続の入力',
        message: `${gate.type}ゲートの入力が${inputCount - connectedInputs}個接続されていません`,
        details: `${gate.type}ゲートは${inputCount}個の入力が必要ですが、現在${connectedInputs}個しか接続されていません。`,
        suggestions: [
          {
            text: '必要な数の入力を接続してください',
            autoFix: false
          }
        ],
        gateId: gate.id
      });
    }
  });
  
  // 出力の未接続をチェック
  const outputGates = gates.filter(g => g.type === 'OUTPUT');
  outputGates.forEach(output => {
    const hasConnection = connections.some(c => c.to === output.id);
    if (!hasConnection) {
      errors.push({
        id: `unconnected-output-${output.id}`,
        type: ERROR_TYPES.CONNECTION,
        level: ERROR_LEVELS.WARNING,
        title: '未接続の出力',
        message: '出力が接続されていません',
        details: '出力端子に信号が接続されていません。回路の結果を確認するには出力を接続してください。',
        suggestions: [
          {
            text: 'ゲートの出力を出力端子に接続してください',
            autoFix: false
          }
        ]
      });
    }
  });
  
  // 多重接続のチェック
  const inputConnections = {};
  connections.forEach(conn => {
    const key = `${conn.to}-${conn.toInput || 0}`;
    if (!inputConnections[key]) {
      inputConnections[key] = [];
    }
    inputConnections[key].push(conn);
  });
  
  Object.entries(inputConnections).forEach(([key, conns]) => {
    if (conns.length > 1) {
      errors.push({
        id: `multiple-connection-${key}`,
        type: ERROR_TYPES.CONNECTION,
        level: ERROR_LEVELS.ERROR,
        title: '多重接続エラー',
        message: '1つの入力に複数の信号が接続されています',
        details: '論理ゲートの入力には1つの信号のみ接続できます。複数の信号を結合する場合は、適切な論理ゲートを使用してください。',
        suggestions: [
          {
            text: 'ORゲートやANDゲートを使って信号を結合してください',
            autoFix: false
          }
        ]
      });
    }
  });
  
  return errors;
};

/**
 * 論理エラーをチェック
 */
const checkLogicErrors = (gates, connections, objective) => {
  const errors = [];
  
  // フィードバックループの検出
  const loops = detectFeedbackLoops(gates, connections);
  loops.forEach((loop, index) => {
    // SRラッチなどの意図的なフィードバックループは除外
    const hasMemoryElement = loop.some(gateId => {
      const gate = gates.find(g => g.id === gateId);
      return gate && (gate.type === 'NOR' || gate.type === 'NAND');
    });
    
    if (!hasMemoryElement) {
      errors.push({
        id: `feedback-loop-${index}`,
        type: ERROR_TYPES.LOGIC,
        level: ERROR_LEVELS.WARNING,
        title: 'フィードバックループ検出',
        message: '回路にフィードバックループが存在します',
        details: 'フィードバックループは意図的でない限り、予期しない動作を引き起こす可能性があります。',
        suggestions: [
          {
            text: 'ループを解消するか、記憶素子（ラッチ）として設計してください',
            autoFix: false
          }
        ],
        learnMore: {
          text: 'フィードバックループについて学ぶ',
          action: () => console.log('Learn about feedback loops')
        }
      });
    }
  });
  
  // 目標との不一致をチェック
  if (objective && objective.targetBehavior) {
    const behaviorMatch = checkBehaviorMatch(gates, connections, objective.targetBehavior);
    if (!behaviorMatch.matches) {
      errors.push({
        id: 'behavior-mismatch',
        type: ERROR_TYPES.LOGIC,
        level: ERROR_LEVELS.ERROR,
        title: '動作が目標と一致しません',
        message: behaviorMatch.message || '回路の動作が期待される動作と異なります',
        details: behaviorMatch.details,
        suggestions: behaviorMatch.suggestions || [
          {
            text: '真理値表を確認して、期待される動作と比較してください',
            autoFix: false
          }
        ]
      });
    }
  }
  
  return errors;
};

/**
 * 構造エラーをチェック
 */
const checkStructureErrors = (gates, connections) => {
  const errors = [];
  
  // 浮いているゲート（入力も出力も接続されていない）
  gates.forEach(gate => {
    if (gate.type === 'INPUT' || gate.type === 'OUTPUT') return;
    
    const hasInput = connections.some(c => c.to === gate.id);
    const hasOutput = connections.some(c => c.from === gate.id);
    
    if (!hasInput && !hasOutput) {
      errors.push({
        id: `floating-gate-${gate.id}`,
        type: ERROR_TYPES.STRUCTURE,
        level: ERROR_LEVELS.WARNING,
        title: '浮いているゲート',
        message: `${gate.type}ゲートが回路に接続されていません`,
        details: 'このゲートは入力も出力も接続されていないため、回路に影響を与えません。',
        suggestions: [
          {
            text: '必要ない場合は削除してください',
            autoFix: true,
            action: () => ({ type: 'REMOVE_GATE', gateId: gate.id })
          },
          {
            text: '回路に接続してください',
            autoFix: false
          }
        ]
      });
    }
  });
  
  // 入力なしで動作するゲート
  const inputGates = gates.filter(g => g.type === 'INPUT');
  if (inputGates.length === 0 && gates.length > 0) {
    errors.push({
      id: 'no-inputs',
      type: ERROR_TYPES.STRUCTURE,
      level: ERROR_LEVELS.INFO,
      title: '入力がありません',
      message: '回路に入力が設定されていません',
      details: '動作を確認するには、入力を追加してください。',
      suggestions: [
        {
          text: 'INPUTを追加してください',
          autoFix: false
        }
      ]
    });
  }
  
  return errors;
};

/**
 * タイミングエラーをチェック
 */
const checkTimingErrors = (gates, connections) => {
  const errors = [];
  
  // 長いパスの検出
  const criticalPath = findCriticalPath(gates, connections);
  if (criticalPath && criticalPath.length > 10) {
    errors.push({
      id: 'long-critical-path',
      type: ERROR_TYPES.TIMING,
      level: ERROR_LEVELS.INFO,
      title: '長い信号経路',
      message: `信号が${criticalPath.length}個のゲートを通過します`,
      details: '信号経路が長いと、実際の回路では遅延が大きくなります。',
      suggestions: [
        {
          text: '可能であれば、より効率的な回路設計を検討してください',
          autoFix: false
        }
      ]
    });
  }
  
  return errors;
};

/**
 * ゲートタイプごとの入力数を返す
 */
const getGateInputCount = (gateType) => {
  const inputCounts = {
    'AND': 2,
    'OR': 2,
    'NOT': 1,
    'NAND': 2,
    'NOR': 2,
    'XOR': 2,
    'XNOR': 2
  };
  return inputCounts[gateType] || 2;
};

/**
 * フィードバックループを検出
 */
const detectFeedbackLoops = (gates, connections) => {
  const loops = [];
  const visited = new Set();
  const stack = new Set();
  
  const dfs = (gateId, path = []) => {
    if (stack.has(gateId)) {
      // ループを検出
      const loopStart = path.indexOf(gateId);
      if (loopStart !== -1) {
        loops.push(path.slice(loopStart));
      }
      return;
    }
    
    if (visited.has(gateId)) return;
    
    visited.add(gateId);
    stack.add(gateId);
    path.push(gateId);
    
    // このゲートからの出力を探す
    const outputs = connections.filter(c => c.from === gateId);
    outputs.forEach(conn => {
      if (conn.toType === 'gate') {
        dfs(conn.to, [...path]);
      }
    });
    
    stack.delete(gateId);
  };
  
  gates.forEach(gate => {
    if (!visited.has(gate.id)) {
      dfs(gate.id);
    }
  });
  
  return loops;
};

/**
 * クリティカルパスを見つける
 */
const findCriticalPath = (gates, connections) => {
  // 簡易実装：最長パスを見つける
  const inputGates = gates.filter(g => g.type === 'INPUT');
  const outputGates = gates.filter(g => g.type === 'OUTPUT');
  
  let longestPath = [];
  
  const findPath = (fromId, toId, visited = new Set()) => {
    if (fromId === toId) return [fromId];
    if (visited.has(fromId)) return null;
    
    visited.add(fromId);
    
    const nextConnections = connections.filter(c => c.from === fromId);
    for (const conn of nextConnections) {
      const path = findPath(conn.to, toId, new Set(visited));
      if (path) {
        return [fromId, ...path];
      }
    }
    
    return null;
  };
  
  inputGates.forEach(input => {
    outputGates.forEach(output => {
      const path = findPath(input.id, output.id);
      if (path && path.length > longestPath.length) {
        longestPath = path;
      }
    });
  });
  
  return longestPath;
};

/**
 * 動作の一致をチェック
 */
const checkBehaviorMatch = (gates, connections, targetBehavior) => {
  // 簡易実装：特定のパターンをチェック
  const gateTypes = gates.map(g => g.type).sort();
  
  switch (targetBehavior) {
    case 'NAND':
      if (!gateTypes.includes('AND') || !gateTypes.includes('NOT')) {
        return {
          matches: false,
          message: 'NANDゲートにはANDゲートとNOTゲートが必要です',
          details: 'NANDゲートは「NOT AND」を意味します。',
          suggestions: [
            { text: 'ANDゲートを配置してください', autoFix: false },
            { text: 'NOTゲートを配置してください', autoFix: false },
            { text: 'ANDの出力をNOTの入力に接続してください', autoFix: false }
          ]
        };
      }
      break;
      
    case 'NOR':
      if (!gateTypes.includes('OR') || !gateTypes.includes('NOT')) {
        return {
          matches: false,
          message: 'NORゲートにはORゲートとNOTゲートが必要です',
          details: 'NORゲートは「NOT OR」を意味します。',
          suggestions: [
            { text: 'ORゲートを配置してください', autoFix: false },
            { text: 'NOTゲートを配置してください', autoFix: false },
            { text: 'ORの出力をNOTの入力に接続してください', autoFix: false }
          ]
        };
      }
      break;
      
    case 'XOR':
      // XORの実装は複数の方法があるため、より柔軟なチェックが必要
      const hasBasicGates = gateTypes.includes('AND') && gateTypes.includes('OR') && gateTypes.includes('NOT');
      if (!hasBasicGates) {
        return {
          matches: false,
          message: 'XORゲートには基本ゲート（AND、OR、NOT）が必要です',
          details: 'XORは「排他的論理和」で、入力が異なるときに1を出力します。',
          suggestions: [
            { text: '(A AND NOT B) OR (NOT A AND B)の形で実装してください', autoFix: false }
          ]
        };
      }
      break;
      
    case 'HALF_ADDER':
      if (!gateTypes.includes('XOR') || !gateTypes.includes('AND')) {
        return {
          matches: false,
          message: '半加算器にはXORゲートとANDゲートが必要です',
          details: 'XORゲートで和を、ANDゲートで桁上がりを計算します。',
          suggestions: [
            { text: 'XORゲートを配置してください（和の計算用）', autoFix: false },
            { text: 'ANDゲートを配置してください（桁上がりの計算用）', autoFix: false }
          ]
        };
      }
      break;
  }
  
  return { matches: true };
};

/**
 * エラーの修正提案を生成
 */
export const generateFixSuggestions = (error, circuit) => {
  const suggestions = [];
  
  switch (error.type) {
    case ERROR_TYPES.CONNECTION:
      if (error.id.startsWith('unconnected-')) {
        suggestions.push({
          text: '自動接続を試みる',
          autoFix: true,
          action: () => ({ type: 'AUTO_CONNECT', targetId: error.gateId })
        });
      }
      break;
      
    case ERROR_TYPES.STRUCTURE:
      if (error.id.startsWith('floating-gate-')) {
        suggestions.push({
          text: 'ゲートを削除する',
          autoFix: true,
          action: () => ({ type: 'REMOVE_GATE', gateId: error.gateId })
        });
      }
      break;
  }
  
  return suggestions;
};

/**
 * エラーメッセージをユーザーフレンドリーに変換
 */
export const formatErrorMessage = (error) => {
  const templates = {
    'unconnected-input': '入力が接続されていません',
    'unconnected-output': '出力が接続されていません',
    'multiple-connection': '複数の信号が1つの入力に接続されています',
    'feedback-loop': 'フィードバックループが検出されました',
    'behavior-mismatch': '期待される動作と異なります'
  };
  
  for (const [key, message] of Object.entries(templates)) {
    if (error.id.includes(key)) {
      return message;
    }
  }
  
  return error.message || 'エラーが発生しました';
};