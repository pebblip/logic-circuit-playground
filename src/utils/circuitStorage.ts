/**
 * 回路の保存・読み込みを管理するユーティリティ
 */

interface UserPreferences {
  mode: string | null;
  theme: string;
  tutorialCompleted: boolean;
  showTutorialOnStartup: boolean;
}

interface TutorialState {
  completed: boolean;
  lastStep: number;
  timestamp?: number;
}

interface CircuitMetadata {
  createdAt: number;
  updatedAt: number;
  version: number;
  gateCount: number;
  connectionCount: number;
}

interface SavedCircuit {
  gates: any[];
  connections: any[];
  metadata: CircuitMetadata;
}

interface CustomGateMetadata {
  createdAt: number;
  updatedAt: number;
  version: number;
  category: string;
}

interface CustomGate {
  inputs: any[];
  outputs: any[];
  circuit: {
    gates: any[];
    connections: any[];
  };
  metadata: CustomGateMetadata;
}

interface ExportData {
  version: string;
  exportedAt: string;
  savedCircuits: Record<string, SavedCircuit>;
  customGates: Record<string, CustomGate>;
  preferences: UserPreferences;
  tutorialState: TutorialState;
}

const STORAGE_KEYS = {
  SAVED_CIRCUITS: 'logicPlayground_savedCircuits',
  CUSTOM_GATES: 'logicPlayground_customGates',
  USER_PREFERENCES: 'logicPlayground_userPreferences',
  TUTORIAL_STATE: 'logicPlayground_tutorialState'
} as const;

/**
 * ユーザー設定を取得
 */
export const getUserPreferences = (): UserPreferences => {
  try {
    const prefs = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return prefs ? JSON.parse(prefs) : {
      mode: null, // null = 未選択, 'learning', 'free', 'advanced'
      theme: 'modern',
      tutorialCompleted: false,
      showTutorialOnStartup: true
    };
  } catch (error) {
    console.error('Failed to load user preferences:', error);
    return {
      mode: null,
      theme: 'modern',
      tutorialCompleted: false,
      showTutorialOnStartup: true
    };
  }
};

/**
 * ユーザー設定を保存
 */
export const saveUserPreferences = (preferences: UserPreferences): boolean => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Failed to save user preferences:', error);
    return false;
  }
};

/**
 * チュートリアル状態を保存
 */
export const saveTutorialState = (state: Partial<TutorialState>): boolean => {
  try {
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_STATE, JSON.stringify({
      completed: state.completed || false,
      lastStep: state.lastStep || 0,
      timestamp: Date.now()
    }));
    return true;
  } catch (error) {
    console.error('Failed to save tutorial state:', error);
    return false;
  }
};

/**
 * チュートリアル状態を取得
 */
export const getTutorialState = (): TutorialState => {
  try {
    const state = localStorage.getItem(STORAGE_KEYS.TUTORIAL_STATE);
    return state ? JSON.parse(state) : { completed: false, lastStep: 0 };
  } catch (error) {
    console.error('Failed to load tutorial state:', error);
    return { completed: false, lastStep: 0 };
  }
};

/**
 * 保存された回路一覧を取得
 */
export const getSavedCircuits = (): Record<string, SavedCircuit> => {
  try {
    const circuits = localStorage.getItem(STORAGE_KEYS.SAVED_CIRCUITS);
    return circuits ? JSON.parse(circuits) : {};
  } catch (error) {
    console.error('Failed to load saved circuits:', error);
    return {};
  }
};

/**
 * 回路を保存
 */
export const saveCircuit = (name: string, circuitData: any): boolean => {
  try {
    const circuits = getSavedCircuits();
    
    // 名前の重複チェック
    if (circuits[name]) {
      const confirm = window.confirm(`"${name}" は既に存在します。上書きしますか？`);
      if (!confirm) return false;
    }
    
    circuits[name] = {
      gates: circuitData.gates || [],
      connections: circuitData.connections || [],
      metadata: {
        createdAt: circuits[name]?.metadata?.createdAt || Date.now(),
        updatedAt: Date.now(),
        version: (circuits[name]?.metadata?.version || 0) + 1,
        gateCount: circuitData.gates?.length || 0,
        connectionCount: circuitData.connections?.length || 0
      }
    };
    
    localStorage.setItem(STORAGE_KEYS.SAVED_CIRCUITS, JSON.stringify(circuits));
    return true;
  } catch (error) {
    console.error('Failed to save circuit:', error);
    return false;
  }
};

/**
 * 回路を読み込み
 */
export const loadCircuit = (name: string): SavedCircuit | null => {
  try {
    const circuits = getSavedCircuits();
    return circuits[name] || null;
  } catch (error) {
    console.error('Failed to load circuit:', error);
    return null;
  }
};

/**
 * 回路を削除
 */
export const deleteCircuit = (name: string): boolean => {
  try {
    const circuits = getSavedCircuits();
    if (!circuits[name]) return false;
    
    const confirm = window.confirm(`"${name}" を削除しますか？`);
    if (!confirm) return false;
    
    delete circuits[name];
    localStorage.setItem(STORAGE_KEYS.SAVED_CIRCUITS, JSON.stringify(circuits));
    return true;
  } catch (error) {
    console.error('Failed to delete circuit:', error);
    return false;
  }
};

/**
 * カスタムゲート一覧を取得
 */
export const getCustomGates = (): Record<string, CustomGate> => {
  try {
    const gates = localStorage.getItem(STORAGE_KEYS.CUSTOM_GATES);
    return gates ? JSON.parse(gates) : {};
  } catch (error) {
    console.error('Failed to load custom gates:', error);
    return {};
  }
};

/**
 * カスタムゲートとして保存
 */
export const saveAsCustomGate = (name: string, gateDefinition: any): boolean => {
  try {
    const customGates = getCustomGates();
    
    // 名前の重複チェック
    if (customGates[name]) {
      const confirm = window.confirm(`カスタムゲート "${name}" は既に存在します。上書きしますか？`);
      if (!confirm) return false;
    }
    
    customGates[name] = {
      inputs: gateDefinition.inputs || [],
      outputs: gateDefinition.outputs || [],
      circuit: {
        gates: gateDefinition.gates || [],
        connections: gateDefinition.connections || []
      },
      metadata: {
        createdAt: customGates[name]?.metadata?.createdAt || Date.now(),
        updatedAt: Date.now(),
        version: (customGates[name]?.metadata?.version || 0) + 1,
        category: gateDefinition.category || 'custom'
      }
    };
    
    localStorage.setItem(STORAGE_KEYS.CUSTOM_GATES, JSON.stringify(customGates));
    return true;
  } catch (error) {
    console.error('Failed to save custom gate:', error);
    return false;
  }
};

/**
 * カスタムゲートを保存（新しいAPIエイリアス）
 */
export const saveCustomGate = (gateDefinition: any): boolean => {
  return saveAsCustomGate(gateDefinition.name, gateDefinition);
};

/**
 * 回路をURLエンコード（共有用）
 */
export const encodeCircuitForURL = (circuitData: any): string | null => {
  try {
    const json = JSON.stringify({
      g: circuitData.gates,
      c: circuitData.connections
    });
    return btoa(encodeURIComponent(json));
  } catch (error) {
    console.error('Failed to encode circuit:', error);
    return null;
  }
};

/**
 * URLから回路をデコード
 */
export const decodeCircuitFromURL = (encodedData: string): any | null => {
  try {
    const json = decodeURIComponent(atob(encodedData));
    const data = JSON.parse(json);
    return {
      gates: data.g || [],
      connections: data.c || []
    };
  } catch (error) {
    console.error('Failed to decode circuit:', error);
    return null;
  }
};

/**
 * ストレージの使用量を取得
 */
export const getStorageUsage = (): number => {
  let totalSize = 0;
  
  for (const key of Object.values(STORAGE_KEYS)) {
    const item = localStorage.getItem(key);
    if (item) {
      totalSize += item.length;
    }
  }
  
  // バイトをKBに変換
  return Math.round(totalSize / 1024 * 100) / 100;
};

/**
 * すべてのデータをエクスポート
 */
export const exportAllData = (): void => {
  const data: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    savedCircuits: getSavedCircuits(),
    customGates: getCustomGates(),
    preferences: getUserPreferences(),
    tutorialState: getTutorialState()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `logic-playground-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * データをインポート
 */
export const importData = async (file: File): Promise<boolean> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as ExportData;
    
    if (!data.version || data.version !== '1.0') {
      throw new Error('Unsupported file version');
    }
    
    // データを復元
    if (data.savedCircuits) {
      localStorage.setItem(STORAGE_KEYS.SAVED_CIRCUITS, JSON.stringify(data.savedCircuits));
    }
    if (data.customGates) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_GATES, JSON.stringify(data.customGates));
    }
    if (data.preferences) {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(data.preferences));
    }
    if (data.tutorialState) {
      localStorage.setItem(STORAGE_KEYS.TUTORIAL_STATE, JSON.stringify(data.tutorialState));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};