import React from 'react';
import type { CustomGateDefinition, CustomGatePin } from '@/types/circuit';
import { IdGenerator } from '@/shared/id';
import { useCustomGateForm } from '@/hooks/useCustomGateForm';
import { BasicInfoForm } from './custom-gate-dialog/BasicInfoForm';
import { PinEditor } from './custom-gate-dialog/PinEditor';
import { GatePreview } from './custom-gate-dialog/GatePreview';

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
  const {
    formData,
    setters,
    handlers,
    utils,
  } = useCustomGateForm({
    initialInputs,
    initialOutputs,
    isOpen,
  });

  const handleSave = () => {
    if (!formData.gateName) {
      alert('内部名は必須です');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.gateName)) {
      alert('内部名は英数字とアンダースコアのみ使用できます');
      return;
    }

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
    <div
      className="dialog-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="dialog-content"
        style={{
          width: '700px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          backgroundColor: '#0f1441',
          border: '1px solid rgba(0, 255, 136, 0.5)',
          borderRadius: '16px',
          color: 'white',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column' as const,
        }}
      >
        {/* ヘッダーバー */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            backgroundColor: 'rgba(0, 255, 136, 0.05)',
            borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#00ff88',
            }}
          >
            カスタムゲートの作成
          </h2>
          <button
            onClick={handleCancel}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1,
              borderRadius: '4px',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor =
                'rgba(255, 255, 255, 0.1)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        {/* コンテンツエリア */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}
        >
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
          />
        </div>

        {/* フッターアクション */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 24px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            キャンセル
          </button>

          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#00ff88',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            作成
          </button>
        </div>
      </div>
    </div>
  );
};