import React, { useState, useEffect } from 'react';
import {
  getCustomFieldDefinitions,
  createCustomFieldDefinition,
  updateCustomFieldDefinition,
  deleteCustomFieldDefinition
} from '../services/api';

const FIELD_TYPES = [
  { value: 'TEXT', label: 'Text (single line)' },
  { value: 'TEXTAREA', label: 'Text (multi-line)' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'DATE', label: 'Date' },
  { value: 'DROPDOWN', label: 'Dropdown' },
  { value: 'CHECKBOX', label: 'Checkbox' }
];

/**
 * CustomFieldManager component - allows admins to manage custom field definitions for a board.
 */
const CustomFieldManager = ({ boardId, onClose }) => {
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
      setError('Failed to load custom fields');
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
      setError('Failed to save custom field');
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
    if (!window.confirm('Delete this custom field? All values will be lost.')) {
      return;
    }
    try {
      await deleteCustomFieldDefinition(id);
      fetchDefinitions();
    } catch (err) {
      setError('Failed to delete custom field');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Manage Custom Fields</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}

          {/* Existing Fields */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Existing Fields</h3>
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : definitions.length === 0 ? (
              <div className="text-gray-500 text-sm">No custom fields defined yet.</div>
            ) : (
              <div className="space-y-2">
                {definitions.map((def) => (
                  <div
                    key={def.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{def.name}</span>
                      <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                        {def.fieldType}
                      </span>
                      {def.isRequired && (
                        <span className="ml-2 text-xs text-red-500">Required</span>
                      )}
                      {def.showInCard && (
                        <span className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                          Visible
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(def)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(def.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add/Edit Form */}
          {isAdding ? (
            <form onSubmit={handleSubmit} className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {editingId ? 'Edit Field' : 'Add New Field'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Type
                  </label>
                  <select
                    value={formData.fieldType}
                    onChange={(e) => setFormData(prev => ({ ...prev, fieldType: e.target.value }))}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.fieldType === 'DROPDOWN' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Options
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={optionInput}
                        onChange={(e) => setOptionInput(e.target.value)}
                        placeholder="Add option..."
                        className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                      />
                      <button
                        type="button"
                        onClick={addOption}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.options.map((opt, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                        >
                          {opt}
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
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
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isRequired" className="text-sm text-gray-700">
                    Required field
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showInCard"
                    checked={formData.showInCard}
                    onChange={(e) => setFormData(prev => ({ ...prev, showInCard: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="showInCard" className="text-sm text-gray-700">
                    Show in task card (max 3)
                  </label>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingId ? 'Save Changes' : 'Add Field'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              + Add Custom Field
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomFieldManager;

