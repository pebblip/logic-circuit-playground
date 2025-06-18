import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportImportDialog } from '@/components/dialogs/ExportImportDialog';
import { useCircuitStore } from '@/stores/circuitStore';
import '@testing-library/jest-dom';

// モック
vi.mock('@/stores/circuitStore');

// Blob URLのモック
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// ダウンロードリンクのモック
HTMLAnchorElement.prototype.click = vi.fn();

describe('ExportImportDialog', () => {
  const mockOnClose = vi.fn();
  const mockGates = [
    { id: 'g1', type: 'AND', position: { x: 100, y: 100 }, inputs: ['', ''], output: false },
    { id: 'g2', type: 'INPUT', position: { x: 50, y: 100 }, inputs: [], output: false }
  ];
  const mockWires = [
    { id: 'w1', from: { gateId: 'g2', pinIndex: -1 }, to: { gateId: 'g1', pinIndex: 0 }, isActive: false }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // useCircuitStoreのモック設定
    vi.mocked(useCircuitStore).mockReturnValue({
      gates: mockGates,
      wires: mockWires,
      metadata: {
        name: 'テスト回路',
        description: 'これはテスト用の回路です',
        author: 'テストユーザー',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: ['test', 'sample']
      },
      loadCircuit: vi.fn(),
      clearCircuit: vi.fn()
    } as any);
  });

  it('ダイアログが正しく表示される', () => {
    render(<ExportImportDialog isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('回路のエクスポート/インポート')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'エクスポート' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'インポート' })).toBeInTheDocument();
  });

  it('エクスポートタブでJSON形式でエクスポートできる', async () => {
    render(<ExportImportDialog isOpen={true} onClose={mockOnClose} />);
    
    // エクスポートタブがデフォルトで選択されている
    expect(screen.getByText('エクスポート形式:')).toBeInTheDocument();
    
    // JSON形式を選択（デフォルト）
    expect(screen.getByLabelText('JSON形式')).toBeChecked();
    
    // エクスポートボタンをクリック
    const exportButton = screen.getByText('エクスポート');
    fireEvent.click(exportButton);
    
    // createObjectURLが呼ばれたことを確認
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    
    // ダウンロードリンクが作成されたことを確認
    const call = vi.mocked(global.URL.createObjectURL).mock.calls[0][0];
    expect(call).toBeInstanceOf(Blob);
    expect(call.type).toBe('application/json');
  });

  it('エクスポートタブでPNG形式でエクスポートできる', async () => {
    // Canvas要素のモック
    const mockCanvas = document.createElement('canvas');
    const mockContext = {
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      clearRect: vi.fn()
    };
    mockCanvas.getContext = vi.fn(() => mockContext) as any;
    mockCanvas.toBlob = vi.fn((callback) => {
      callback(new Blob(['mock-png-data'], { type: 'image/png' }));
    }) as any;
    
    // SVGElementのモック
    const mockSvgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.querySelector = vi.fn(() => mockSvgElement) as any;
    
    render(<ExportImportDialog isOpen={true} onClose={mockOnClose} />);
    
    // PNG形式を選択
    const pngRadio = screen.getByLabelText('PNG画像');
    fireEvent.click(pngRadio);
    
    // エクスポートボタンをクリック
    const exportButton = screen.getByText('エクスポート');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(mockCanvas.toBlob).toHaveBeenCalled();
    });
  });

  it('インポートタブでJSONファイルをインポートできる', async () => {
    const user = userEvent.setup();
    render(<ExportImportDialog isOpen={true} onClose={mockOnClose} />);
    
    // インポートタブに切り替え
    const importTab = screen.getByRole('tab', { name: 'インポート' });
    await user.click(importTab);
    
    // ファイル選択入力が表示される
    const fileInput = screen.getByLabelText('回路ファイルを選択');
    expect(fileInput).toBeInTheDocument();
    
    // テスト用のJSONファイルを作成
    const testCircuitData = {
      version: '1.0',
      metadata: {
        name: 'インポートテスト回路',
        description: 'インポートテスト用'
      },
      gates: mockGates,
      wires: mockWires
    };
    
    const file = new File([JSON.stringify(testCircuitData)], 'test-circuit.json', {
      type: 'application/json'
    });
    
    // ファイルを選択
    await user.upload(fileInput, file);
    
    // プレビューが表示される
    await waitFor(() => {
      expect(screen.getByText('インポートテスト回路')).toBeInTheDocument();
      expect(screen.getByText('ゲート数: 2')).toBeInTheDocument();
      expect(screen.getByText('ワイヤー数: 1')).toBeInTheDocument();
    });
    
    // インポートボタンをクリック
    const importButton = screen.getByText('インポート実行');
    await user.click(importButton);
    
    // loadCircuitが呼ばれたことを確認
    expect(useCircuitStore().loadCircuit).toHaveBeenCalledWith(
      testCircuitData.gates,
      testCircuitData.wires,
      testCircuitData.metadata
    );
    
    // ダイアログが閉じられる
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('不正なJSONファイルでエラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    render(<ExportImportDialog isOpen={true} onClose={mockOnClose} />);
    
    // インポートタブに切り替え
    const importTab = screen.getByRole('tab', { name: 'インポート' });
    await user.click(importTab);
    
    // 不正なJSONファイル
    const invalidFile = new File(['{ invalid json }'], 'invalid.json', {
      type: 'application/json'
    });
    
    const fileInput = screen.getByLabelText('回路ファイルを選択');
    await user.upload(fileInput, invalidFile);
    
    // エラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText(/ファイルの読み込みに失敗しました/)).toBeInTheDocument();
    });
  });

  it('CSVエクスポートオプションが表示される', async () => {
    render(<ExportImportDialog isOpen={true} onClose={mockOnClose} />);
    
    // CSV形式を選択
    const csvRadio = screen.getByLabelText('CSV（ゲート一覧）');
    fireEvent.click(csvRadio);
    
    // CSVエクスポートボタンをクリック
    const exportButton = screen.getByText('エクスポート');
    fireEvent.click(exportButton);
    
    // CSV形式でエクスポートされることを確認
    const call = vi.mocked(global.URL.createObjectURL).mock.calls[0][0];
    expect(call).toBeInstanceOf(Blob);
    expect(call.type).toBe('text/csv;charset=utf-8');
  });

  it('ドラッグアンドドロップでファイルをインポートできる', async () => {
    render(<ExportImportDialog isOpen={true} onClose={mockOnClose} />);
    
    // インポートタブに切り替え
    const importTab = screen.getByRole('tab', { name: 'インポート' });
    fireEvent.click(importTab);
    
    // ドロップゾーンを取得
    const dropZone = screen.getByTestId('file-drop-zone');
    
    // テスト用ファイル
    const file = new File([JSON.stringify({
      version: '1.0',
      gates: mockGates,
      wires: mockWires
    })], 'drag-drop.json', { type: 'application/json' });
    
    // ドラッグエンター
    fireEvent.dragEnter(dropZone, {
      dataTransfer: {
        files: [file],
        types: ['Files']
      }
    });
    
    // ドロップゾーンがアクティブになる
    expect(dropZone).toHaveClass('drag-active');
    
    // ドロップ
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
        types: ['Files']
      }
    });
    
    // ファイルが処理される
    await waitFor(() => {
      expect(screen.getByText('ゲート数: 2')).toBeInTheDocument();
    });
  });

  it('エクスポート前にメタデータを編集できる', async () => {
    const user = userEvent.setup();
    render(<ExportImportDialog isOpen={true} onClose={mockOnClose} />);
    
    // メタデータ編集セクションを開く
    const editMetadataButton = screen.getByText('メタデータを編集');
    await user.click(editMetadataButton);
    
    // メタデータフィールドが表示される
    const nameInput = screen.getByLabelText('回路名');
    const descriptionInput = screen.getByLabelText('説明');
    const authorInput = screen.getByLabelText('作成者');
    
    // 値を変更
    await user.clear(nameInput);
    await user.type(nameInput, '更新された回路名');
    
    await user.clear(descriptionInput);
    await user.type(descriptionInput, '更新された説明');
    
    // エクスポート
    const exportButton = screen.getByText('エクスポート');
    await user.click(exportButton);
    
    // 更新されたメタデータでエクスポートされることを確認
    const blob = vi.mocked(global.URL.createObjectURL).mock.calls[0][0];
    const text = await blob.text();
    const exported = JSON.parse(text);
    
    expect(exported.metadata.name).toBe('更新された回路名');
    expect(exported.metadata.description).toBe('更新された説明');
  });
});