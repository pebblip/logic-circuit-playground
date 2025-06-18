/**
 * 🚨 カオス発生器デバッグ注入スクリプト
 * 
 * このスクリプトをブラウザコンソールで実行し、
 * リアルタイムでカオス発生器の状態を監視します。
 */

(() => {
    console.log('🌀 カオス発生器デバッグ注入開始');
    
    let isDebugging = true;
    let lastOutputState = null;
    let stateChangeCount = 0;
    
    // 詳細ログ関数
    function detailedLog(message, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`🔍 [${timestamp}] ${message}`);
        if (data) {
            console.log('📊 データ:', data);
        }
    }
    
    // Zustandストアへのアクセス試行
    function findCircuitStore() {
        try {
            // React Fiber経由でストア探索
            const rootElement = document.querySelector('#root');
            if (!rootElement) {
                detailedLog('Rootエレメントが見つかりません', 'error');
                return null;
            }
            
            // Reactの内部構造を探索
            const reactFiber = rootElement._reactInternalFiber || 
                              rootElement._reactInternals ||
                              Object.keys(rootElement).find(key => key.startsWith('__reactInternalInstance'));
            
            if (reactFiber) {
                detailedLog('React Fiberが見つかりました');
            }
            
            // window経由でZustandストアを探索
            if (window.__ZUSTAND_STORES) {
                detailedLog('Zustandストアが見つかりました');
                return window.__ZUSTAND_STORES;
            }
            
        } catch (error) {
            detailedLog(`ストア探索エラー: ${error.message}`, 'error');
        }
        
        return null;
    }
    
    // DOM経由での状態監視
    function monitorDOMState() {
        try {
            // カオス発生器の出力ゲート要素を探す
            const outputElements = Array.from(document.querySelectorAll('*')).filter(el => {
                const text = el.textContent || '';
                const className = el.className || '';
                const id = el.id || '';
                
                return text.includes('out_bit') || 
                       text.includes('random_output') ||
                       className.includes('output') ||
                       id.includes('output');
            });
            
            detailedLog(`出力要素候補: ${outputElements.length}個`);
            
            // SVG要素での出力ゲート検索
            const svgElements = document.querySelectorAll('svg *[data-gate-id], svg circle, svg rect');
            let activeElements = 0;
            let totalElements = svgElements.length;
            
            svgElements.forEach((element, index) => {
                const style = window.getComputedStyle(element);
                const fill = style.fill || element.getAttribute('fill');
                const stroke = style.stroke || element.getAttribute('stroke');
                
                // アクティブ色（#00ff88系）をチェック
                if (fill && (fill.includes('00ff88') || fill.includes('rgb(0, 255, 136)')) ||
                    stroke && (stroke.includes('00ff88') || stroke.includes('rgb(0, 255, 136)'))) {
                    activeElements++;
                }
            });
            
            const currentState = `${activeElements}/${totalElements}`;
            
            if (lastOutputState !== currentState) {
                stateChangeCount++;
                detailedLog(`状態変化 #${stateChangeCount}: ${lastOutputState} → ${currentState}`);
                lastOutputState = currentState;
                
                // 全出力が停止した場合の詳細調査
                if (activeElements === 0 && totalElements > 0) {
                    detailedLog('🚨 全出力停止を検出！詳細調査開始', 'error');
                    investigateStoppageReason();
                }
            }
            
            return { activeElements, totalElements, currentState };
            
        } catch (error) {
            detailedLog(`DOM監視エラー: ${error.message}`, 'error');
            return null;
        }
    }
    
    // 停止原因の詳細調査
    function investigateStoppageReason() {
        try {
            // 1. コンソールエラーの確認
            detailedLog('1. 最近のエラーログを確認中...');
            
            // 2. パフォーマンスの確認
            if (performance.memory) {
                const memory = performance.memory;
                const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
                const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
                detailedLog(`2. メモリ使用量: ${usedMB}MB / ${limitMB}MB`);
                
                if (usedMB / limitMB > 0.8) {
                    detailedLog('🚨 メモリ使用量が高い（>80%）', 'warning');
                }
            }
            
            // 3. animationFrameの状態確認
            let frameCallbackExecuted = false;
            requestAnimationFrame(() => {
                frameCallbackExecuted = true;
                detailedLog('3. AnimationFrame正常動作確認');
            });
            
            setTimeout(() => {
                if (!frameCallbackExecuted) {
                    detailedLog('🚨 AnimationFrameが動作していません', 'error');
                }
            }, 100);
            
            // 4. タブの可視性確認
            detailedLog(`4. タブ可視性: ${!document.hidden ? '可視' : '非可視'}`);
            
            // 5. イベントリスナーの確認
            const eventListeners = getEventListeners ? getEventListeners(document) : {};
            detailedLog(`5. イベントリスナー数: ${Object.keys(eventListeners).length}`);
            
            // 6. setInterval/setTimeoutの確認
            detailedLog('6. タイマー関数の監視を開始');
            
        } catch (error) {
            detailedLog(`停止調査エラー: ${error.message}`, 'error');
        }
    }
    
    // ローカルストレージ監視
    function monitorLocalStorage() {
        try {
            const keys = Object.keys(localStorage);
            const circuitKeys = keys.filter(key => 
                key.includes('circuit') || 
                key.includes('gallery') || 
                key.includes('chaos')
            );
            
            circuitKeys.forEach(key => {
                const value = localStorage.getItem(key);
                try {
                    const parsed = JSON.parse(value);
                    if (parsed && parsed.gates) {
                        const clockGates = parsed.gates.filter(g => g.type === 'CLOCK');
                        clockGates.forEach(clock => {
                            detailedLog(`ローカルストレージCLOCK ${clock.id}: isRunning=${clock.metadata?.isRunning}`);
                        });
                    }
                } catch (e) {
                    // JSON以外のデータは無視
                }
            });
            
        } catch (error) {
            detailedLog(`ローカルストレージ監視エラー: ${error.message}`, 'error');
        }
    }
    
    // 網羅的な監視関数
    function comprehensiveMonitor() {
        if (!isDebugging) return;
        
        try {
            detailedLog('=== 包括的監視実行 ===');
            
            // DOM状態監視
            const domState = monitorDOMState();
            
            // ストア監視
            findCircuitStore();
            
            // ローカルストレージ監視
            monitorLocalStorage();
            
            // パフォーマンス監視
            const now = performance.now();
            detailedLog(`現在時刻: ${now.toFixed(2)}ms`);
            
            detailedLog('=== 監視完了 ===');
            
        } catch (error) {
            detailedLog(`包括的監視エラー: ${error.message}`, 'error');
        }
    }
    
    // 元のconsole.errorを監視
    const originalConsoleError = console.error;
    console.error = function(...args) {
        detailedLog(`🚨 新しいエラー: ${args.join(' ')}`, 'error');
        originalConsoleError.apply(console, args);
    };
    
    // 初期状態の記録
    detailedLog('初期状態を記録中...');
    comprehensiveMonitor();
    
    // 定期監視の開始（1秒間隔）
    const monitorInterval = setInterval(() => {
        if (isDebugging) {
            comprehensiveMonitor();
        } else {
            clearInterval(monitorInterval);
        }
    }, 1000);
    
    // 停止・制御関数の公開
    window.stopChaosDebug = () => {
        isDebugging = false;
        detailedLog('デバッグ停止', 'warning');
    };
    
    window.forceChaosCheck = () => {
        detailedLog('強制チェック実行');
        comprehensiveMonitor();
    };
    
    window.getChaosStats = () => {
        return {
            stateChangeCount,
            lastOutputState,
            isDebugging
        };
    };
    
    detailedLog('デバッグ注入完了！');
    detailedLog('停止: stopChaosDebug()');
    detailedLog('強制チェック: forceChaosCheck()');
    detailedLog('統計取得: getChaosStats()');
    
})();