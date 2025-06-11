import React from 'react';
import type { CustomGateDefinition, CustomGatePin } from '@/types/circuit';
import { IdGenerator } from '@/shared/id';
import { useCustomGateForm } from '@/hooks/useCustomGateForm';
import { BasicInfoForm } from './custom-gate-dialog/BasicInfoForm';
import { PinEditor } from './custom-gate-dialog/PinEditor';
import { GatePreview } from './custom-gate-dialog/GatePreview';
import { debug } from '@/shared/debug';
import { TERMS } from '@/features/learning-mode/data/terms';

interface CreateCustomGateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (definition: CustomGateDefinition) => void;
  initialInputs?: CustomGatePin[];
  initialOutputs?: CustomGatePin[];
  isReadOnly?: boolean;
}

export const CreateCustomGateDialog: React.FC<CreateCustomGateDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialInputs,
  initialOutputs,
  isReadOnly = false,
}) => {
  // デバッグ: CreateCustomGateDialog でのprops受け取りを確認
  React.useEffect(() => {
    if (isOpen) {
      debug.log('=== CreateCustomGateDialog Props Debug ===');
      debug.log('isOpen:', isOpen);
      debug.log('initialInputs props:', initialInputs);
      debug.log('initialOutputs props:', initialOutputs);
      debug.log('isReadOnly:', isReadOnly);
    }
  }, [isOpen, initialInputs, initialOutputs, isReadOnly]);

  const { formData, setters, handlers, utils } = useCustomGateForm({
    initialInputs,
    initialOutputs,
    isOpen,
  });

  const handleSave = () => {
    if (!formData.gateName) {
      alert(
        'カスタムゲートには名前を付けてください。\nこの名前は回路内でゲートを識別するために使用されます。'
      );
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.gateName)) {
      alert(
        'ゲート名には半角の英数字とアンダースコア（_）のみ使用できます。\n例：my_gate、Counter、LED_Display'
      );
      return;
    }

    // デバッグ: 保存時のフォームデータを確認
    debug.log('=== CreateCustomGateDialog Save Debug ===');
    debug.log('formData:', formData);
    debug.log('formData.inputs:', formData.inputs);
    debug.log('formData.outputs:', formData.outputs);
    debug.log(
      'formData.outputs structure:',
      JSON.stringify(formData.outputs, null, 2)
    );

    const definition: CustomGateDefinition = {
      id: IdGenerator.generateGateId(),
      name: formData.gateName,
      displayName: formData.displayName || formData.gateName,
      icon: formData.selectedIcon,
      category: formData.selectedCategory,
      description: formData.description,
      inputs: formData.inputs,
      outputs: formData.outputs,
      truthTable: utils.generateTruthTable(),
      width: formData.gateWidth,
      height: formData.gateHeight,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    debug.log('Final definition created:', definition);
    debug.log('definition.outputs:', definition.outputs);

    onSave(definition);
    // 保存後に状態をリセット
    utils.resetForm();
    onClose();
  };

  const handleCancel = () => {
    utils.resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: '700px' }}>
        {/* ヘッダー */}
        <div className="modal__header">
          <h2 className="modal__title">
            {TERMS.CUSTOM_GATE}の{TERMS.CREATE}
          </h2>
          <button
            className="modal__close"
            onClick={handleCancel}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* コンテンツエリア */}
        <div className="modal__content">
          {/* 基本情報 */}
          <BasicInfoForm
            gateName={formData.gateName}
            displayName={formData.displayName}
            description={formData.description}
            selectedIcon={formData.selectedIcon}
            selectedCategory={formData.selectedCategory}
            onGateNameChange={setters.setGateName}
            onDisplayNameChange={setters.setDisplayName}
            onDescriptionChange={setters.setDescription}
            onIconChange={setters.setSelectedIcon}
            onCategoryChange={setters.setSelectedCategory}
          />

          {/* 入出力ピン設定 */}
          <PinEditor
            inputs={formData.inputs}
            outputs={formData.outputs}
            onAddInput={handlers.handleAddInput}
            onRemoveInput={handlers.handleRemoveInput}
            onUpdateInputName={handlers.handleUpdateInputName}
            onAddOutput={handlers.handleAddOutput}
            onRemoveOutput={handlers.handleRemoveOutput}
            onUpdateOutputName={handlers.handleUpdateOutputName}
            isReadOnly={isReadOnly}
          />

          {/* プレビュー */}
          <GatePreview
            displayName={formData.displayName}
            selectedIcon={formData.selectedIcon}
            inputs={formData.inputs}
            outputs={formData.outputs}
            gateWidth={formData.gateWidth}
            gateHeight={formData.gateHeight}
            isFromCircuit={isReadOnly}
          />
        </div>

        {/* フッターアクション */}
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={handleCancel}>
            キャンセル
          </button>

          <button className="btn btn--primary" onClick={handleSave}>
            {TERMS.CREATE}
          </button>
        </div>
      </div>
    </div>
  );
};
