import React, { useState, useEffect } from 'react';
import {
  getCustomFieldDefinitions,
  createCustomFieldDefinition,
  updateCustomFieldDefinition,
  deleteCustomFieldDefinition
} from '../services/api';
import { useTranslation } from '../contexts/I18nContext';

const getFieldTypes = (t) => [
  { value: 'TEXT', label: t('board.fieldTypes.TEXT') },
  { value: 'TEXTAREA', label: t('board.fieldTypes.TEXTAREA') },
  { value: 'NUMBER', label: t('board.fieldTypes.NUMBER') },
  { value: 'DATE', label: t('board.fieldTypes.DATE') },
  { value: 'DROPDOWN', label: t('board.fieldTypes.DROPDOWN') },
  { value: 'CHECKBOX', label: t('board.fieldTypes.CHECKBOX') }
];

/**
 * CustomFieldManager component - allows admins to manage custom field definitions for a board.
 */
const CustomFieldManager = ({ boardId, onClose }) => {
  const t = useTranslation();
  const [definitions, setDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    fieldType: 'TEXT',
    options: [],
    isRequired: false,
    showInCard: false
  });
  const [optionInput, setOptionInput] = useState('');

  useEffect(() => {
    fetchDefinitions();
  }, [boardId]);

  const fetchDefinitions = async () => {
    try {
      setLoading(true);
      const data = await getCustomFieldDefinitions(boardId);
      setDefinitions(data);
    } catch (err) {
      setError(t('board.failedToLoadCustomFields'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      fieldType: 'TEXT',
      options: [],
      isRequired: false,
      showInCard: false
    });
    setOptionInput('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        boardId,
        displayOrder: definitions.length
      };

      if (editingId) {
        await updateCustomFieldDefinition(editingId, payload);
      } else {
        await createCustomFieldDefinition(payload);
      }
      
      resetForm();
      fetchDefinitions();
    } catch (err) {
      setError(t('board.failedToSaveCustomField'));
      console.error(err);
    }
  };

  const handleEdit = (definition) => {
    setFormData({
      name: definition.name,
      fieldType: definition.fieldType,
      options: definition.options || [],
      isRequired: definition.isRequired || false,
      showInCard: definition.showInCard || false
    });
    setEditingId(definition.id);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('board.deleteCustomFieldConfirm'))) {
      return;
    }
    try {
      await deleteCustomFieldDefinition(id);
      fetchDefinitions();
    } catch (err) {
      setError(t('board.failedToDeleteCustomField'));
      console.error(err);
    }
  };

  const addOption = () => {
    if (optionInput.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, optionInput.trim()]
      }));
      setOptionInput('');
    }
  };

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-07 dark:bg-base-01 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-base-02 dark:border-base-03 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-base-05">
            <i className="fas fa-tags mr-2" aria-hidden="true"></i>
            {t('board.manageCustomFields')}
          </h2>
          <button
            onClick={onClose}
            className="text-base-04 hover:text-base-05 text-2xl leading-none"
            aria-label={t('common.close')}
          >
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-base-08/10 dark:bg-base-08/20 text-base-08 rounded border border-base-08/30">
              <i className="fas fa-exclamation-circle mr-2" aria-hidden="true"></i>
              {error}
            </div>
          )}

          {/* Existing Fields */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-base-05 mb-2">
              <i className="fas fa-list mr-2" aria-hidden="true"></i>
              {t('board.existingFields')}
            </h3>
            {loading ? (
              <div className="text-base-04">
                <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
                {t('common.loading')}
              </div>
            ) : definitions.length === 0 ? (
              <div className="text-base-04 text-sm">{t('board.noCustomFieldsDefined')}</div>
            ) : (
              <div className="space-y-2">
                {definitions.map((def) => (
                  <div
                    key={def.id}
                    className="flex items-center justify-between p-3 bg-base-01 dark:bg-base-02 rounded border border-base-02 dark:border-base-03"
                  >
                    <div>
                      <span className="font-medium text-base-05">{def.name}</span>
                      <span className="ml-2 text-xs text-base-04 bg-base-02 dark:bg-base-03 px-2 py-0.5 rounded">
                        {def.fieldType}
                      </span>
                      {def.isRequired && (
                        <span className="ml-2 text-xs text-base-08 bg-base-08/20 px-2 py-0.5 rounded">
                          {t('board.required')}
                        </span>
                      )}
                      {def.showInCard && (
                        <span className="ml-2 text-xs text-base-0E bg-base-0E/20 px-2 py-0.5 rounded">
                          {t('board.visible')}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(def)}
                        className="text-base-0D hover:text-base-0D/80 text-sm"
                      >
                        <i className="fas fa-edit mr-1" aria-hidden="true"></i>
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(def.id)}
                        className="text-base-08 hover:text-base-08/80 text-sm"
                      >
                        <i className="fas fa-trash mr-1" aria-hidden="true"></i>
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add/Edit Form */}
          {isAdding ? (
            <form onSubmit={handleSubmit} className="border-t border-base-02 dark:border-base-03 pt-4">
              <h3 className="text-sm font-medium text-base-05 mb-3">
                <i className={`fas fa-${editingId ? 'edit' : 'plus'} mr-2`} aria-hidden="true"></i>
                {editingId ? t('board.editField') : t('board.addNewField')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-base-05 mb-1">
                    {t('board.fieldName')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-base-03 dark:border-base-02 rounded focus:outline-none focus:ring-2 focus:ring-base-0D bg-base-07 dark:bg-base-00 text-base-05"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-05 mb-1">
                    {t('board.fieldType')}
                  </label>
                  <select
                    value={formData.fieldType}
                    onChange={(e) => setFormData(prev => ({ ...prev, fieldType: e.target.value }))}
                    className="w-full px-3 py-2 border border-base-03 dark:border-base-02 rounded focus:outline-none focus:ring-2 focus:ring-base-0D bg-base-07 dark:bg-base-00 text-base-05"
                  >
                    {getFieldTypes(t).map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.fieldType === 'DROPDOWN' && (
                  <div>
                    <label className="block text-sm font-medium text-base-05 mb-1">
                      {t('board.options')}
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={optionInput}
                        onChange={(e) => setOptionInput(e.target.value)}
                        placeholder={t('board.addOptionPlaceholder')}
                        className="flex-1 px-3 py-2 border border-base-03 dark:border-base-02 rounded focus:outline-none focus:ring-2 focus:ring-base-0D bg-base-07 dark:bg-base-00 text-base-05"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                      />
                      <button
                        type="button"
                        onClick={addOption}
                        className="px-3 py-2 bg-base-01 dark:bg-base-02 hover:bg-base-02 dark:hover:bg-base-03 rounded text-base-05"
                      >
                        <i className="fas fa-plus mr-1" aria-hidden="true"></i>
                        {t('board.addOption')}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.options.map((opt, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-base-0D/20 text-base-0D rounded text-sm"
                        >
                          {opt}
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="text-base-0D hover:text-base-0D/80"
                            aria-label={t('common.delete')}
                          >
                            <i className="fas fa-times" aria-hidden="true"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                    className="rounded border-base-03 dark:border-base-02 text-base-0D"
                  />
                  <label htmlFor="isRequired" className="text-sm text-base-05">
                    {t('board.requiredField')}
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showInCard"
                    checked={formData.showInCard}
                    onChange={(e) => setFormData(prev => ({ ...prev, showInCard: e.target.checked }))}
                    className="rounded border-base-03 dark:border-base-02 text-base-0D"
                  />
                  <label htmlFor="showInCard" className="text-sm text-base-05">
                    {t('board.showInTaskCard')}
                  </label>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-base-05 hover:text-base-05 hover:bg-base-01 dark:hover:bg-base-02 rounded"
                  >
                    <i className="fas fa-times mr-2" aria-hidden="true"></i>
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-base-0D text-base-07 rounded hover:bg-base-0D/90"
                  >
                    <i className={`fas fa-${editingId ? 'save' : 'plus'} mr-2`} aria-hidden="true"></i>
                    {editingId ? t('board.saveChanges') : t('board.addField')}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2 border-2 border-dashed border-base-03 dark:border-base-02 text-base-04 rounded hover:border-base-0D hover:text-base-0D transition-colors"
            >
              <i className="fas fa-plus mr-2" aria-hidden="true"></i>
              {t('board.addCustomField')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomFieldManager;

