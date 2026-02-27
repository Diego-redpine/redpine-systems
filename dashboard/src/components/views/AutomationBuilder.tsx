'use client';

import { useState, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { TriggerType, ActionType, WorkflowAction } from '@/types/data';
import { getContrastText } from '@/lib/view-colors';
import CenterModal from '@/components/ui/CenterModal';

interface AutomationBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  configColors: DashboardColors;
  existingWorkflow?: {
    id?: string;
    name?: string;
    description?: string;
    trigger_type?: TriggerType;
    trigger_config?: Record<string, unknown>;
    actions?: WorkflowAction[];
    status?: string;
    enabled?: boolean;
  } | null;
  isSaving?: boolean;
}

const TRIGGER_TYPES: { type: TriggerType; label: string; icon: string; description: string }[] = [
  { type: 'record_created', label: 'Record Created', icon: '➕', description: 'When a new record is added' },
  { type: 'record_updated', label: 'Record Updated', icon: '✏️', description: 'When a record is modified' },
  { type: 'status_changed', label: 'Status Changed', icon: '🔄', description: 'When a record status changes' },
  { type: 'field_changed', label: 'Field Changed', icon: '📝', description: 'When a specific field changes' },
  { type: 'form_submitted', label: 'Form Submitted', icon: '📋', description: 'When a public form is submitted' },
  { type: 'schedule', label: 'Schedule', icon: '⏰', description: 'Run on a recurring schedule' },
  { type: 'manual', label: 'Manual', icon: '▶️', description: 'Triggered manually by user' },
];

const ACTION_TYPES: { type: ActionType; label: string; icon: string; description: string }[] = [
  { type: 'send_email', label: 'Send Email', icon: '✉️', description: 'Send an email to a recipient' },
  { type: 'send_sms', label: 'Send SMS', icon: '💬', description: 'Send a text message' },
  { type: 'create_record', label: 'Create Record', icon: '➕', description: 'Create a new record in an entity' },
  { type: 'update_record', label: 'Update Record', icon: '✏️', description: 'Update fields on a record' },
  { type: 'create_task', label: 'Create Task', icon: '✅', description: 'Create a new task or to-do' },
  { type: 'send_notification', label: 'Send Notification', icon: '🔔', description: 'Send an in-app notification' },
  { type: 'webhook', label: 'Webhook', icon: '🌐', description: 'Call an external URL' },
  { type: 'wait', label: 'Wait / Delay', icon: '⏳', description: 'Wait before the next action' },
];

const ENTITY_OPTIONS = [
  'clients', 'appointments', 'invoices', 'leads', 'tasks', 'products',
  'reviews', 'waivers', 'forms', 'messages', 'documents',
];

const SCHEDULE_OPTIONS = [
  { value: 'hourly', label: 'Every hour' },
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'Every month' },
];

export default function AutomationBuilder({
  isOpen,
  onClose,
  onSave,
  configColors,
  existingWorkflow,
  isSaving,
}: AutomationBuilderProps) {
  const [step, setStep] = useState(0); // 0: info, 1: trigger, 2: actions, 3: review
  const [name, setName] = useState(existingWorkflow?.name || '');
  const [description, setDescription] = useState(existingWorkflow?.description || '');
  const [triggerType, setTriggerType] = useState<TriggerType>(existingWorkflow?.trigger_type || 'record_created');
  const [triggerConfig, setTriggerConfig] = useState<Record<string, unknown>>(existingWorkflow?.trigger_config || { entity: 'clients' });
  const [actions, setActions] = useState<WorkflowAction[]>(existingWorkflow?.actions || []);
  const [enabled, setEnabled] = useState(existingWorkflow?.enabled !== false);

  const buttonBg = configColors.buttons || '#1a1a1a';
  const buttonText = getContrastText(buttonBg);
  const cardBg = configColors.cards || '#ffffff';
  const textColor = configColors.text || '#1a1a1a';
  const headingColor = configColors.headings || textColor;
  const borderColor = configColors.borders || '#e5e7eb';

  const addAction = useCallback((type: ActionType) => {
    const actionDef = ACTION_TYPES.find(a => a.type === type);
    const newAction: WorkflowAction = {
      id: `action_${Date.now()}`,
      type,
      label: actionDef?.label || type,
      config: {},
    };
    setActions(prev => [...prev, newAction]);
  }, []);

  const removeAction = useCallback((actionId: string) => {
    setActions(prev => prev.filter(a => a.id !== actionId));
  }, []);

  const updateActionConfig = useCallback((actionId: string, key: string, value: unknown) => {
    setActions(prev => prev.map(a =>
      a.id === actionId ? { ...a, config: { ...a.config, [key]: value } } : a
    ));
  }, []);

  const handleSave = useCallback(() => {
    if (!name) return;
    onSave({
      name,
      description,
      trigger_type: triggerType,
      trigger_config: triggerConfig,
      actions,
      status: 'active',
      enabled,
      run_count: existingWorkflow?.id ? undefined : 0,
    });
  }, [name, description, triggerType, triggerConfig, actions, enabled, onSave, existingWorkflow]);

  const isEditing = !!existingWorkflow?.id;

  const renderStep = () => {
    switch (step) {
      case 0: return renderInfoStep();
      case 1: return renderTriggerStep();
      case 2: return renderActionsStep();
      case 3: return renderReviewStep();
      default: return null;
    }
  };

  const renderInfoStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: headingColor }}>
          Automation Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Welcome new clients"
          className="w-full px-3 py-2 border text-sm"
          style={{ borderColor, color: textColor, backgroundColor: cardBg }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: headingColor }}>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What does this automation do?"
          rows={2}
          className="w-full px-3 py-2 border text-sm"
          style={{ borderColor, color: textColor, backgroundColor: cardBg }}
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e => setEnabled(e.target.checked)}
          className="rounded"
        />
        <span className="text-sm" style={{ color: textColor }}>Enable this automation</span>
      </label>
    </div>
  );

  const renderTriggerStep = () => (
    <div className="space-y-3">
      <p className="text-sm" style={{ color: textColor }}>When should this automation run?</p>
      <div className="grid grid-cols-2 gap-2">
        {TRIGGER_TYPES.map(trigger => (
          <button
            key={trigger.type}
            onClick={() => setTriggerType(trigger.type)}
            className="p-3 border text-left transition-all"
            style={{
              borderColor: triggerType === trigger.type ? buttonBg : borderColor,
              backgroundColor: triggerType === trigger.type ? `${buttonBg}10` : cardBg,
              boxShadow: triggerType === trigger.type ? `0 0 0 2px ${buttonBg}33` : 'none',
            }}
          >
            <span className="text-lg">{trigger.icon}</span>
            <p className="text-sm font-medium mt-1" style={{ color: headingColor }}>{trigger.label}</p>
            <p className="text-[11px] mt-0.5 opacity-60" style={{ color: textColor }}>{trigger.description}</p>
          </button>
        ))}
      </div>

      {/* Trigger config */}
      {(triggerType === 'record_created' || triggerType === 'record_updated' || triggerType === 'record_deleted' || triggerType === 'status_changed' || triggerType === 'field_changed') && (
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: headingColor }}>Entity</label>
          <select
            value={String(triggerConfig.entity || 'clients')}
            onChange={e => setTriggerConfig(prev => ({ ...prev, entity: e.target.value }))}
            className="w-full px-3 py-2 border text-sm"
            style={{ borderColor, color: textColor, backgroundColor: cardBg }}
          >
            {ENTITY_OPTIONS.map(e => (
              <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
            ))}
          </select>
        </div>
      )}

      {triggerType === 'status_changed' && (
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: headingColor }}>To Status</label>
          <input
            type="text"
            value={String(triggerConfig.to_status || '')}
            onChange={e => setTriggerConfig(prev => ({ ...prev, to_status: e.target.value }))}
            placeholder="e.g., completed, overdue"
            className="w-full px-3 py-2 border text-sm"
            style={{ borderColor, color: textColor, backgroundColor: cardBg }}
          />
        </div>
      )}

      {triggerType === 'schedule' && (
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: headingColor }}>Frequency</label>
          <select
            value={String(triggerConfig.frequency || 'daily')}
            onChange={e => setTriggerConfig(prev => ({ ...prev, frequency: e.target.value }))}
            className="w-full px-3 py-2 border text-sm"
            style={{ borderColor, color: textColor, backgroundColor: cardBg }}
          >
            {SCHEDULE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  const renderActionsStep = () => (
    <div className="space-y-3">
      <p className="text-sm" style={{ color: textColor }}>What should happen when triggered?</p>

      {/* Current actions */}
      {actions.length > 0 && (
        <div className="space-y-2">
          {actions.map((action, index) => {
            const actionDef = ACTION_TYPES.find(a => a.type === action.type);
            return (
              <div
                key={action.id}
                className="p-3 border"
                style={{ borderColor, backgroundColor: cardBg }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold opacity-40" style={{ color: textColor }}>{index + 1}</span>
                    <span className="text-sm">{actionDef?.icon}</span>
                    <span className="text-sm font-medium" style={{ color: headingColor }}>{actionDef?.label}</span>
                  </div>
                  <button
                    onClick={() => removeAction(action.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                {/* Action-specific config */}
                {action.type === 'send_email' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={String(action.config.to || '')}
                      onChange={e => updateActionConfig(action.id, 'to', e.target.value)}
                      placeholder="Recipient (e.g., {{record.email}})"
                      className="w-full px-2 py-1.5 border text-xs"
                      style={{ borderColor, color: textColor, backgroundColor: cardBg }}
                    />
                    <input
                      type="text"
                      value={String(action.config.subject || '')}
                      onChange={e => updateActionConfig(action.id, 'subject', e.target.value)}
                      placeholder="Subject line"
                      className="w-full px-2 py-1.5 border text-xs"
                      style={{ borderColor, color: textColor, backgroundColor: cardBg }}
                    />
                  </div>
                )}

                {action.type === 'send_sms' && (
                  <input
                    type="text"
                    value={String(action.config.to || '')}
                    onChange={e => updateActionConfig(action.id, 'to', e.target.value)}
                    placeholder="Phone (e.g., {{record.phone}})"
                    className="w-full px-2 py-1.5 border text-xs"
                    style={{ borderColor, color: textColor, backgroundColor: cardBg }}
                  />
                )}

                {action.type === 'create_task' && (
                  <input
                    type="text"
                    value={String(action.config.title || '')}
                    onChange={e => updateActionConfig(action.id, 'title', e.target.value)}
                    placeholder="Task title (e.g., Follow up with {{record.name}})"
                    className="w-full px-2 py-1.5 border text-xs"
                    style={{ borderColor, color: textColor, backgroundColor: cardBg }}
                  />
                )}

                {action.type === 'create_record' && (
                  <select
                    value={String(action.config.entity || '')}
                    onChange={e => updateActionConfig(action.id, 'entity', e.target.value)}
                    className="w-full px-2 py-1.5 border text-xs"
                    style={{ borderColor, color: textColor, backgroundColor: cardBg }}
                  >
                    <option value="">Select entity...</option>
                    {ENTITY_OPTIONS.map(e => (
                      <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
                    ))}
                  </select>
                )}

                {action.type === 'webhook' && (
                  <input
                    type="text"
                    value={String(action.config.url || '')}
                    onChange={e => updateActionConfig(action.id, 'url', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2 py-1.5 border text-xs"
                    style={{ borderColor, color: textColor, backgroundColor: cardBg }}
                  />
                )}

                {action.type === 'wait' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={String(action.config.duration || '')}
                      onChange={e => updateActionConfig(action.id, 'duration', parseInt(e.target.value) || 0)}
                      placeholder="Duration"
                      className="w-20 px-2 py-1.5 border text-xs"
                      style={{ borderColor, color: textColor, backgroundColor: cardBg }}
                    />
                    <select
                      value={String(action.config.unit || 'minutes')}
                      onChange={e => updateActionConfig(action.id, 'unit', e.target.value)}
                      className="px-2 py-1.5 border text-xs"
                      style={{ borderColor, color: textColor, backgroundColor: cardBg }}
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add action buttons */}
      <div>
        <p className="text-xs font-medium mb-2 opacity-60" style={{ color: textColor }}>Add an action:</p>
        <div className="flex flex-wrap gap-1.5">
          {ACTION_TYPES.map(action => (
            <button
              key={action.type}
              onClick={() => addAction(action.type)}
              className="px-2.5 py-1.5 border text-xs transition-colors hover:opacity-80"
              style={{ borderColor, color: textColor, backgroundColor: cardBg }}
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const triggerDef = TRIGGER_TYPES.find(t => t.type === triggerType);
    return (
      <div className="space-y-4">
        <div className="p-4 border" style={{ borderColor, backgroundColor: `${buttonBg}05` }}>
          <h3 className="text-sm font-bold mb-2" style={{ color: headingColor }}>{name || '(Untitled)'}</h3>
          {description && <p className="text-xs opacity-60 mb-3" style={{ color: textColor }}>{description}</p>}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide opacity-40" style={{ color: textColor }}>Trigger</span>
              <span className="text-sm" style={{ color: textColor }}>
                {triggerDef?.icon} {triggerDef?.label}
                {triggerConfig.entity ? <span className="opacity-60"> on {String(triggerConfig.entity)}</span> : null}
              </span>
            </div>

            {actions.map((action, i) => {
              const actionDef = ACTION_TYPES.find(a => a.type === action.type);
              return (
                <div key={action.id} className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide opacity-40" style={{ color: textColor }}>
                    {i === 0 ? 'Then' : 'And'}
                  </span>
                  <span className="text-sm" style={{ color: textColor }}>
                    {actionDef?.icon} {actionDef?.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 "
            style={{ backgroundColor: enabled ? '#10B981' : '#9CA3AF' }}
          />
          <span className="text-sm" style={{ color: textColor }}>
            {enabled ? 'Enabled — will run automatically' : 'Disabled — won\'t run until enabled'}
          </span>
        </div>
      </div>
    );
  };

  const stepTitles = ['Details', 'Trigger', 'Actions', 'Review'];

  return (
    <CenterModal isOpen={isOpen} onClose={onClose} maxWidth="640px">
      <div className="p-6" style={{ backgroundColor: cardBg }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: headingColor }}>
            {isEditing ? 'Edit Automation' : 'New Automation'}
          </h2>
          <button onClick={onClose} className="opacity-40 hover:opacity-100 text-lg" style={{ color: textColor }}>×</button>
        </div>

        {/* Step indicators */}
        <div className="flex gap-1 mb-5">
          {stepTitles.map((title, i) => (
            <button
              key={i}
              onClick={() => i <= step && setStep(i)}
              className="flex-1 text-center py-1.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: i === step ? buttonBg : i < step ? `${buttonBg}20` : `${borderColor}`,
                color: i === step ? buttonText : textColor,
                opacity: i > step ? 0.4 : 1,
              }}
            >
              {title}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[280px]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-5 pt-4 border-t" style={{ borderColor }}>
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="px-4 py-2 border text-sm"
            style={{ borderColor, color: textColor }}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && !name}
              className="px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
              style={{ backgroundColor: buttonBg, color: buttonText }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving || !name}
              className="px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
              style={{ backgroundColor: buttonBg, color: buttonText }}
            >
              {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Automation'}
            </button>
          )}
        </div>
      </div>
    </CenterModal>
  );
}
