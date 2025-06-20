# CLOCKゲートの初期エッジ問題の調査結果

## 問題の概要

LFSRのout_bit3（dff1の出力）が光らない問題を調査した結果、以下の問題が判明しました。

## 調査結果

### 1. CLOCKのstartTimeは問題ない
- CLOCKゲートのstartTimeは正しく初期化され、保持されている
- CLOCKの波形自体は正しく生成されている（500ms周期で正しくトグル）

### 2. 本当の問題：D-FFの初期エッジ検出
テストログから判明した問題：
```
t=0ms: D=false, CLK=true, Q=false, prevClk=true
```

初回評価（t=0）でCLOCKがfalse→trueに変化するが、D-FFのpreviousClockStateが既にtrueになっている。

### 3. 問題の流れ
1. 初期状態：CLOCKはfalse、D-FFのpreviousClockState=false
2. t=0の評価：
   - CLOCKが評価され、output=trueになる
   - D-FFが評価され、inputs=[D, true]を受け取る
   - この時点で立ち上がりエッジを検出すべきだが、しない
   - updateGateMetadataでpreviousClockState=trueに設定
3. 以降の評価：
   - previousClockStateがtrueのままなので、立ち上がりエッジが検出されない

### 4. 根本原因
評価の順序とタイミングの問題：
- CLOCKの出力が変化した「同じ評価サイクル内」でD-FFが評価される
- D-FFの評価時には既にCLOCK=trueになっているため、「前回の状態」が失われる

### 5. LFSRへの影響
- 初期状態でdff1のqOutput=trueに設定されているが、表示に反映されない
- 立ち上がりエッジが検出されないため、状態が更新されない
- 結果として、out_bit3は常にfalse（光らない）

## 解決策の検討

### 案1: 初期評価時の特別処理
初回評価時（previousClockStateがundefinedの場合）は、現在のCLOCK状態をpreviousClockStateに設定するだけで、エッジ検出は行わない。

### 案2: 評価サイクルの分離
CLOCKの評価と、CLOCKに依存するゲートの評価を別々のフェーズで行う。

### 案3: previousClockStateの初期化タイミング変更
D-FFのpreviousClockStateを、CLOCKの「評価前」の状態で初期化する。

## 推奨される修正

案3が最も適切と考えられます。circuitEvaluation.tsで、D-FFのメタデータ初期化時に、接続されているCLOCKゲートの現在の出力値を使用してpreviousClockStateを設定する必要があります。