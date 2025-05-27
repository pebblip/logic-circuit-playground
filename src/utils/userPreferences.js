// ユーザー設定の管理
const STORAGE_KEY = 'logic-circuit-playground-prefs';

export const getUserPreferences = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load user preferences:', error);
  }
  
  return {
    hasVisited: false,
    lastMode: 'explore',
    userLevel: 'beginner',
    showAdvancedTools: false,
    completedLessons: [],
    toolUsage: {}
  };
};

export const saveUserPreferences = (preferences) => {
  try {
    const current = getUserPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Failed to save user preferences:', error);
    return false;
  }
};

export const clearUserPreferences = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear user preferences:', error);
    return false;
  }
};