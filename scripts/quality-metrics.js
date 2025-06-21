#!/usr/bin/env node

/**
 * Quality Metrics Collection Script
 * 
 * CI/CD品質ゲートシステム用のメトリクス収集・分析ツール
 * 理想テスト比率、実装依存度、仕様カバレッジを算出
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class QualityMetricsCollector {
  constructor() {
    this.projectRoot = process.cwd();
    this.testDir = path.join(this.projectRoot, 'tests');
    this.srcDir = path.join(this.projectRoot, 'src');
  }

  /**
   * 全体の品質メトリクスを収集
   */
  async collectAllMetrics() {
    console.log('🔍 Collecting Quality Metrics...');
    
    const metrics = {
      timestamp: new Date().toISOString(),
      tests: await this.collectTestMetrics(),
      code: await this.collectCodeMetrics(),
      build: await this.collectBuildMetrics(),
      quality: await this.calculateQualityScores(),
    };

    return metrics;
  }

  /**
   * テスト関連メトリクス
   */
  async collectTestMetrics() {
    const idealTests = this.findTestFiles([
      'tests/core',
      'tests/adapters'
    ]);
    
    const integrationTests = this.findTestFiles([
      'tests/integration'
    ]);
    
    const legacyTests = this.findTestFiles([
      'tests/services',
      'tests/stores',
      'tests/domain',
      'tests/features'
    ]);

    const totalTests = idealTests.length + integrationTests.length + legacyTests.length;
    
    return {
      total: totalTests,
      ideal: idealTests.length,
      integration: integrationTests.length,
      legacy: legacyTests.length,
      idealRatio: totalTests > 0 ? (idealTests.length / totalTests) : 0,
      files: {
        ideal: idealTests,
        integration: integrationTests,
        legacy: legacyTests
      }
    };
  }

  /**
   * コード品質メトリクス
   */
  async collectCodeMetrics() {
    const srcFiles = this.findSourceFiles();
    const testFiles = this.findTestFiles(['tests']);
    
    return {
      sourceFiles: srcFiles.length,
      testFiles: testFiles.length,
      testCoverage: await this.calculateTestCoverage(),
      typeScriptErrors: await this.countTypeScriptErrors(),
      lintWarnings: await this.countLintWarnings(),
    };
  }

  /**
   * ビルド関連メトリクス
   */
  async collectBuildMetrics() {
    try {
      // ビルドサイズ取得
      const distPath = path.join(this.projectRoot, 'dist');
      let buildSize = 0;
      let buildExists = false;

      if (fs.existsSync(distPath)) {
        buildExists = true;
        const sizeOutput = execSync(`du -sb ${distPath}`, { encoding: 'utf-8' });
        buildSize = parseInt(sizeOutput.split('\t')[0]);
      }

      return {
        exists: buildExists,
        sizeBytes: buildSize,
        sizeMB: (buildSize / (1024 * 1024)).toFixed(2),
        withinLimit: buildSize < (10 * 1024 * 1024), // 10MB limit
      };
    } catch (error) {
      return {
        exists: false,
        sizeBytes: 0,
        sizeMB: '0.00',
        withinLimit: true,
        error: error.message
      };
    }
  }

  /**
   * 品質スコア計算
   */
  async calculateQualityScores() {
    const testMetrics = await this.collectTestMetrics();
    const codeMetrics = await this.collectCodeMetrics();
    
    // Test Quality Score (TQS)
    const idealTestRatio = testMetrics.idealRatio;
    const implementationDependency = testMetrics.legacy / testMetrics.total;
    const specificationCoverage = (testMetrics.ideal + testMetrics.integration) / testMetrics.total;
    
    // Overall Quality Score
    const qualityScore = (
      (idealTestRatio * 40) +
      ((1 - implementationDependency) * 30) +
      (specificationCoverage * 30)
    ) * 100;

    return {
      idealTestRatio: parseFloat((idealTestRatio * 100).toFixed(1)),
      implementationDependency: parseFloat((implementationDependency * 100).toFixed(1)),
      specificationCoverage: parseFloat((specificationCoverage * 100).toFixed(1)),
      overallScore: parseFloat(qualityScore.toFixed(1)),
      grade: this.getQualityGrade(qualityScore),
    };
  }

  /**
   * ファイル検索ヘルパー
   */
  findTestFiles(directories) {
    const testFiles = [];
    
    directories.forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        this.walkDirectory(fullPath, (file) => {
          if (file.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
            testFiles.push(path.relative(this.projectRoot, file));
          }
        });
      }
    });
    
    return testFiles;
  }

  findSourceFiles() {
    const sourceFiles = [];
    
    if (fs.existsSync(this.srcDir)) {
      this.walkDirectory(this.srcDir, (file) => {
        if (file.match(/\.(ts|tsx)$/) && !file.includes('.d.ts')) {
          sourceFiles.push(path.relative(this.projectRoot, file));
        }
      });
    }
    
    return sourceFiles;
  }

  walkDirectory(dir, callback) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.walkDirectory(fullPath, callback);
      } else {
        callback(fullPath);
      }
    });
  }

  /**
   * TypeScriptエラー数取得
   */
  async countTypeScriptErrors() {
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      return 0;
    } catch (error) {
      const output = error.stdout ? error.stdout.toString() : '';
      const errorMatches = output.match(/error TS\d+:/g);
      return errorMatches ? errorMatches.length : 0;
    }
  }

  /**
   * ESLint警告数取得
   */
  async countLintWarnings() {
    try {
      const output = execSync('npx eslint src --format json', { encoding: 'utf-8' });
      const results = JSON.parse(output);
      return results.reduce((total, result) => total + result.warningCount, 0);
    } catch (error) {
      return 0;
    }
  }

  /**
   * テストカバレッジ取得（概算）
   */
  async calculateTestCoverage() {
    const testMetrics = await this.collectTestMetrics();
    const codeMetrics = await this.collectCodeMetrics();
    
    // 簡易的なカバレッジ計算
    if (codeMetrics.sourceFiles === 0) return 0;
    
    const coverageRatio = testMetrics.total / codeMetrics.sourceFiles;
    return Math.min(100, coverageRatio * 100);
  }

  /**
   * 品質グレード判定
   */
  getQualityGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  }

  /**
   * レポート生成
   */
  generateReport(metrics) {
    const report = `
=== QUALITY METRICS REPORT ===
Generated: ${metrics.timestamp}

📊 TEST METRICS:
Total Tests: ${metrics.tests.total}
Ideal Tests: ${metrics.tests.ideal} (${metrics.quality.idealTestRatio}%)
Integration Tests: ${metrics.tests.integration}
Legacy Tests: ${metrics.tests.legacy}

📏 CODE METRICS:
Source Files: ${metrics.code.sourceFiles}
Test Files: ${metrics.code.testFiles}
TypeScript Errors: ${metrics.code.typeScriptErrors}
Lint Warnings: ${metrics.code.lintWarnings}

🏗️ BUILD METRICS:
Build Exists: ${metrics.build.exists}
Build Size: ${metrics.build.sizeMB}MB
Within Limit: ${metrics.build.withinLimit}

🎯 QUALITY SCORES:
Ideal Test Ratio: ${metrics.quality.idealTestRatio}%
Implementation Dependency: ${metrics.quality.implementationDependency}%
Specification Coverage: ${metrics.quality.specificationCoverage}%
Overall Score: ${metrics.quality.overallScore}/100 (Grade: ${metrics.quality.grade})

================================
`;
    
    return report;
  }
}

// メイン実行
async function main() {
  const collector = new QualityMetricsCollector();
  
  try {
    const metrics = await collector.collectAllMetrics();
    const report = collector.generateReport(metrics);
    
    console.log(report);
    
    // メトリクスをJSONファイルとして保存
    const outputPath = path.join(process.cwd(), 'quality-metrics.json');
    fs.writeFileSync(outputPath, JSON.stringify(metrics, null, 2));
    console.log(`📊 Metrics saved to: ${outputPath}`);
    
    // 品質ゲート判定
    const passed = metrics.quality.overallScore >= 70;
    console.log(`\n🎯 Quality Gate: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    process.exit(passed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Error collecting metrics:', error);
    process.exit(1);
  }
}

// メイン実行時の分岐処理（ES Modules対応）
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default QualityMetricsCollector;