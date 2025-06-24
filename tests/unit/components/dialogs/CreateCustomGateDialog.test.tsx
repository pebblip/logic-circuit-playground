import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { CreateCustomGateDialog } from '@/components/dialogs/CreateCustomGateDialog';
import { handleError } from '@/infrastructure/errorHandler';

// エラーハンドラーをモック
vi.mock('@/infrastructure/errorHandler', () => ({
  handleError: vi.fn(),
}));

// IdGeneratorをモック
vi.mock('@/shared/id', () => ({
  IdGenerator: {
    generateGateId: () => 'test-gate-id',
  },
}));

describe('CreateCustomGateDialog Validation', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ゲート名が空の場合エラーになる', async () => {
    const { getByRole } = render(<CreateCustomGateDialog {...defaultProps} />);

    // 保存ボタンをクリック
    const saveButton = getByRole('button', { name: /作成/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(handleError).toHaveBeenCalledWith(
        expect.any(Error),
        'CreateCustomGateDialog',
        expect.objectContaining({
          userAction: 'カスタムゲートの保存',
          severity: 'low',
          showToUser: true,
        })
      );
    });

    const errorCall = vi.mocked(handleError).mock.calls[0];
    expect(errorCall[0].message).toContain('カスタムゲートには名前を付けてください');
  });

  it('ゲート名に無効な文字が含まれる場合エラーになる', async () => {
    const { getByPlaceholderText, getByRole } = render(
      <CreateCustomGateDialog {...defaultProps} />
    );

    const gateNameInput = getByPlaceholderText('MyCustomGate');
    fireEvent.change(gateNameInput, { target: { value: 'my-gate!' } });

    const saveButton = getByRole('button', { name: /作成/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(handleError).toHaveBeenCalledWith(
        expect.any(Error),
        'CreateCustomGateDialog',
        expect.objectContaining({
          userAction: 'カスタムゲートの保存',
        })
      );
    });

    const errorCall = vi.mocked(handleError).mock.calls[0];
    expect(errorCall[0].message).toContain('半角の英数字とアンダースコア（_）のみ使用できます');
  });

  it('ゲート名が30文字を超える場合エラーになる', async () => {
    const { getByPlaceholderText, getAllByText, getByRole } = render(
      <CreateCustomGateDialog {...defaultProps} />
    );

    const longName = 'a'.repeat(31);
    const gateNameInput = getByPlaceholderText('MyCustomGate');
    fireEvent.change(gateNameInput, { target: { value: longName } });

    // 入出力ピンを追加（検証を通過するため）
    const addButtons = getAllByText('+ 追加');
    fireEvent.click(addButtons[0]); // 入力ピン追加
    fireEvent.click(addButtons[1]); // 出力ピン追加

    const saveButton = getByRole('button', { name: /作成/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(handleError).toHaveBeenCalledWith(
        expect.any(Error),
        'CreateCustomGateDialog',
        expect.objectContaining({
          userAction: 'カスタムゲートの保存',
        })
      );
    });

    const errorCall = vi.mocked(handleError).mock.calls[0];
    expect(errorCall[0].message).toContain('ゲート名は30文字以内で入力してください');
  });

  it('表示名が20文字を超える場合エラーになる', async () => {
    const { getByLabelText, getByText } = render(
      <CreateCustomGateDialog {...defaultProps} />
    );

    const gateNameInput = getByLabelText('ゲート名');
    fireEvent.change(gateNameInput, { target: { value: 'ValidGate' } });

    const displayNameInput = getByLabelText('表示名');
    const longDisplayName = 'あ'.repeat(21);
    fireEvent.change(displayNameInput, { target: { value: longDisplayName } });

    // 入出力ピンを追加
    const addInputButton = getByText('入力ピンを追加');
    const addOutputButton = getByText('出力ピンを追加');
    fireEvent.click(addInputButton);
    fireEvent.click(addOutputButton);

    const saveButton = getByText('作成');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(handleError).toHaveBeenCalledWith(
        expect.any(Error),
        'CreateCustomGateDialog',
        expect.objectContaining({
          userAction: 'カスタムゲートの保存',
        })
      );
    });

    const errorCall = vi.mocked(handleError).mock.calls[0];
    expect(errorCall[0].message).toContain('表示名は20文字以内で入力してください');
  });

  it('表示名に特殊文字が含まれる場合エラーになる', async () => {
    const { getByLabelText, getByText } = render(
      <CreateCustomGateDialog {...defaultProps} />
    );

    const gateNameInput = getByLabelText('ゲート名');
    fireEvent.change(gateNameInput, { target: { value: 'ValidGate' } });

    const displayNameInput = getByLabelText('表示名');
    fireEvent.change(displayNameInput, { target: { value: '<script>alert</script>' } });

    // 入出力ピンを追加
    const addInputButton = getByText('入力ピンを追加');
    const addOutputButton = getByText('出力ピンを追加');
    fireEvent.click(addInputButton);
    fireEvent.click(addOutputButton);

    const saveButton = getByText('作成');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(handleError).toHaveBeenCalledWith(
        expect.any(Error),
        'CreateCustomGateDialog',
        expect.objectContaining({
          userAction: 'カスタムゲートの保存',
        })
      );
    });

    const errorCall = vi.mocked(handleError).mock.calls[0];
    expect(errorCall[0].message).toContain('表示名に特殊文字（< > " \' &）は使用できません');
  });

  it('入力ピンがない場合エラーになる', async () => {
    const { getByLabelText, getByText } = render(
      <CreateCustomGateDialog {...defaultProps} />
    );

    const gateNameInput = getByLabelText('ゲート名');
    fireEvent.change(gateNameInput, { target: { value: 'ValidGate' } });

    // 出力ピンのみ追加
    const addOutputButton = getByText('出力ピンを追加');
    fireEvent.click(addOutputButton);

    const saveButton = getByText('作成');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(handleError).toHaveBeenCalledWith(
        expect.any(Error),
        'CreateCustomGateDialog',
        expect.objectContaining({
          userAction: 'カスタムゲートの保存',
        })
      );
    });

    const errorCall = vi.mocked(handleError).mock.calls[0];
    expect(errorCall[0].message).toContain('少なくとも1つの入力ピンが必要です');
  });

  it('出力ピンがない場合エラーになる', async () => {
    const { getByLabelText, getByText } = render(
      <CreateCustomGateDialog {...defaultProps} />
    );

    const gateNameInput = getByLabelText('ゲート名');
    fireEvent.change(gateNameInput, { target: { value: 'ValidGate' } });

    // 入力ピンのみ追加
    const addInputButton = getByText('入力ピンを追加');
    fireEvent.click(addInputButton);

    const saveButton = getByText('作成');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(handleError).toHaveBeenCalledWith(
        expect.any(Error),
        'CreateCustomGateDialog',
        expect.objectContaining({
          userAction: 'カスタムゲートの保存',
        })
      );
    });

    const errorCall = vi.mocked(handleError).mock.calls[0];
    expect(errorCall[0].message).toContain('少なくとも1つの出力ピンが必要です');
  });

  it('ピンの合計数が20を超える場合エラーになる', async () => {
    const { getByLabelText, getByText } = render(
      <CreateCustomGateDialog {...defaultProps} />
    );

    const gateNameInput = getByLabelText('ゲート名');
    fireEvent.change(gateNameInput, { target: { value: 'ValidGate' } });

    // 多数のピンを追加
    const addInputButton = getByText('入力ピンを追加');
    const addOutputButton = getByText('出力ピンを追加');

    // 11個の入力ピンと10個の出力ピン = 合計21個
    for (let i = 0; i < 11; i++) {
      fireEvent.click(addInputButton);
    }
    for (let i = 0; i < 10; i++) {
      fireEvent.click(addOutputButton);
    }

    const saveButton = getByText('作成');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(handleError).toHaveBeenCalledWith(
        expect.any(Error),
        'CreateCustomGateDialog',
        expect.objectContaining({
          userAction: 'カスタムゲートの保存',
        })
      );
    });

    const errorCall = vi.mocked(handleError).mock.calls[0];
    expect(errorCall[0].message).toContain('ピンの合計数が多すぎます');
    expect(errorCall[0].message).toContain('21個');
  });

  it('有効な入力の場合、正常に保存される', async () => {
    const { getByLabelText, getByText } = render(
      <CreateCustomGateDialog {...defaultProps} />
    );

    const gateNameInput = getByLabelText('ゲート名');
    fireEvent.change(gateNameInput, { target: { value: 'MyGate' } });

    const displayNameInput = getByLabelText('表示名');
    fireEvent.change(displayNameInput, { target: { value: 'マイゲート' } });

    // 入出力ピンを追加
    const addInputButton = getByText('入力ピンを追加');
    const addOutputButton = getByText('出力ピンを追加');
    fireEvent.click(addInputButton);
    fireEvent.click(addOutputButton);

    const saveButton = getByText('作成');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-gate-id',
          name: 'MyGate',
          displayName: 'マイゲート',
          inputs: expect.any(Array),
          outputs: expect.any(Array),
        })
      );
    });

    expect(handleError).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});