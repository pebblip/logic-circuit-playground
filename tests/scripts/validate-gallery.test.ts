/**
 * ギャラリー回路検証スクリプト
 * validate:galleryコマンドで実行される
 */
import { describe, it, expect } from 'vitest';
import { FEATURED_CIRCUITS } from '@/features/gallery/data';
import type { GalleryCircuit } from '@/features/gallery/data/types';

// 色付きコンソール出力
const blue = (text: string) => `\x1b[34m${text}\x1b[0m`;
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;
const gray = (text: string) => `\x1b[90m${text}\x1b[0m`;
const bold = (text: string) => `\x1b[1m${text}\x1b[0m`;

describe('Gallery Circuit Validation', () => {
  console.log(blue(bold('🔍 Gallery Circuit Validator')));
  console.log(gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

  let totalErrors = 0;
  let totalWarnings = 0;
  let validCount = 0;

  FEATURED_CIRCUITS.forEach((circuit: GalleryCircuit) => {
    describe(`📄 ${circuit.id}`, () => {
      const errors: string[] = [];
      const warnings: string[] = [];

      it('should have valid structure', () => {
        // 基本構造チェック
        expect(circuit.id).toBeTruthy();
        expect(circuit.title).toBeTruthy();
        expect(circuit.gates).toBeDefined();
        expect(circuit.gates.length).toBeGreaterThan(0);
        
        if (!circuit.wires || circuit.wires.length === 0) {
          warnings.push('ワイヤーが定義されていません');
        }
      });

      it('should have proper simulation config for oscillating circuits', () => {
        // オシレーション回路のチェック
        if (
          circuit.title.includes('オシレータ') ||
          circuit.title.includes('カオス') ||
          circuit.title.includes('メモリ') ||
          circuit.title.includes('フィボナッチ') ||
          circuit.title.includes('マンダラ') ||
          circuit.title.includes('ジョンソン')
        ) {
          if (!circuit.simulationConfig?.needsAnimation) {
            errors.push('simulationConfig.needsAnimation が設定されていません');
          }
          expect(circuit.simulationConfig?.needsAnimation).toBe(true);
        }
      });

      it('should have proper D-FF metadata', () => {
        // D-FFメタデータチェック
        circuit.gates.forEach(gate => {
          if (gate.type === 'D-FF' && gate.metadata) {
            if ('state' in gate.metadata) {
              errors.push(`D-FF gate "${gate.id}": 'state' は非推奨です`);
              expect(gate.metadata).not.toHaveProperty('state');
            }
            if (!('previousClockState' in gate.metadata)) {
              warnings.push(`D-FF gate "${gate.id}": 'previousClockState' がありません`);
            }
          }
        });
      });

      // 結果集計
      afterAll(() => {
        console.log(`\n${blue(`📄 ${circuit.id}`)}`);
        
        if (errors.length === 0 && warnings.length === 0) {
          console.log(green('  ✅ Valid'));
          validCount++;
        } else {
          if (errors.length > 0) {
            console.log(red(`  ❌ ${errors.length} error(s)`));
            errors.forEach(error => {
              console.log(red(`    - ${error}`));
            });
            totalErrors += errors.length;
          }
          
          if (warnings.length > 0) {
            console.log(yellow(`  ⚠️  ${warnings.length} warning(s)`));
            warnings.forEach(warning => {
              console.log(yellow(`    - ${warning}`));
            });
            totalWarnings += warnings.length;
          }
        }
      });
    });
  });

  afterAll(() => {
    // サマリー表示
    console.log(blue(bold('\n📊 Validation Summary')));
    console.log(gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(`📁 Total circuits: ${FEATURED_CIRCUITS.length}`);
    console.log(green(`✅ Valid: ${validCount}`));
    console.log(red(`❌ Errors: ${totalErrors}`));
    console.log(yellow(`⚠️  Warnings: ${totalWarnings}`));
    
    if (totalErrors === 0) {
      console.log(green(bold('\n🎉 All circuits passed validation!')));
    } else {
      console.log(red(bold('\n💥 Some circuits failed validation!')));
      console.log(gray('Fix the errors and run the test again'));
    }
  });
});