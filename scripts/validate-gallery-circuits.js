#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';

// TypeScript ファイルを動的にインポートするためのヘルパー
async function importCircuit(filePath) {
  try {
    const module = await import(filePath);
    // エクスポートされた回路を探す（通常は大文字の定数）
    const circuitKey = Object.keys(module).find(key => 
      key.endsWith('_CIRCUIT') || key.endsWith('_COUNTER') || key.endsWith('_GENERATOR')
    );
    return circuitKey ? module[circuitKey] : null;
  } catch (error) {
    console.error(chalk.red(`Failed to import ${filePath}: ${error.message}`));
    return null;
  }
}

async function validateAllCircuits() {
  console.log(chalk.blue.bold('🔍 Gallery Circuit Validator'));
  console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  
  const galleryDir = 'src/features/gallery/data';
  const files = await fs.readdir(galleryDir);
  const circuitFiles = files.filter(f => f.endsWith('.ts') && f !== 'gallery.ts');
  
  let totalErrors = 0;
  let totalWarnings = 0;
  let validCount = 0;
  
  for (const file of circuitFiles) {
    const filePath = path.join(galleryDir, file);
    const absolutePath = path.resolve(filePath);
    
    console.log(chalk.cyan(`\\n📄 ${file}`));
    
    const circuit = await importCircuit(`file://${absolutePath}`);
    if (!circuit) {
      console.log(chalk.red('  ❌ Failed to load circuit'));
      totalErrors++;
      continue;
    }
    
    // 基本的な検証
    const errors = [];
    const warnings = [];
    
    // 1. simulationConfig チェック
    if (circuit.title && (
      circuit.title.includes('オシレータ') ||
      circuit.title.includes('カオス') ||
      circuit.title.includes('メモリ') ||
      circuit.title.includes('フィボナッチ') ||
      circuit.title.includes('マンダラ') ||
      circuit.title.includes('ジョンソン')
    )) {
      if (!circuit.simulationConfig?.needsAnimation) {
        errors.push('simulationConfig.needsAnimation が設定されていません');
      }
    }
    
    // 2. D-FF メタデータチェック
    if (circuit.gates) {
      circuit.gates.forEach(gate => {
        if (gate.type === 'D-FF' && gate.metadata) {
          if ('state' in gate.metadata) {
            errors.push(`D-FF gate "${gate.id}": 'state' は非推奨です`);
          }
          if (!('previousClockState' in gate.metadata)) {
            warnings.push(`D-FF gate "${gate.id}": 'previousClockState' がありません`);
          }
        }
      });
    }
    
    // 3. 基本構造チェック
    if (!circuit.gates || circuit.gates.length === 0) {
      errors.push('ゲートが定義されていません');
    }
    
    if (!circuit.wires) {
      warnings.push('ワイヤーが定義されていません');
    }
    
    // 結果表示
    if (errors.length === 0) {
      console.log(chalk.green('  ✅ Valid'));
      validCount++;
    } else {
      console.log(chalk.red(`  ❌ ${errors.length} error(s)`));
      errors.forEach(error => {
        console.log(chalk.red(`    - ${error}`));
      });
    }
    
    if (warnings.length > 0) {
      console.log(chalk.yellow(`  ⚠️  ${warnings.length} warning(s)`));
      warnings.forEach(warning => {
        console.log(chalk.yellow(`    - ${warning}`));
      });
    }
    
    totalErrors += errors.length;
    totalWarnings += warnings.length;
  }
  
  // サマリー表示
  console.log(chalk.blue.bold('\\n📊 Validation Summary'));
  console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(`📁 Total circuits: ${circuitFiles.length}`);
  console.log(chalk.green(`✅ Valid: ${validCount}`));
  console.log(chalk.red(`❌ Errors: ${totalErrors}`));
  console.log(chalk.yellow(`⚠️  Warnings: ${totalWarnings}`));
  
  if (totalErrors === 0) {
    console.log(chalk.green.bold('\\n🎉 All circuits passed validation!'));
    process.exit(0);
  } else {
    console.log(chalk.red.bold('\\n💥 Some circuits failed validation!'));
    console.log(chalk.gray('Run "npm run fix:gallery" to apply automatic fixes'));
    process.exit(1);
  }
}

// 実行
validateAllCircuits().catch(error => {
  console.error(chalk.red.bold('Validation failed:'), error);
  process.exit(1);
});