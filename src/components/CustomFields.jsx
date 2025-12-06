import React, { useState, useEffect } from 'react';
import {
  getCustomFieldDefinitions,
  getTaskCustomFieldValues,
  setTaskCustomFieldValue
} from '../services/api';

/**
 * CustomFields component - displays and allows editing of custom field values for a task.
 */
const CustomFields = ({ taskId, boardId, readOnly = false }) => {
  const [definitions, setDefinitions] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState(null);

  useEffect(() => {
    fetchData();
  }, [taskId, boardId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [defs, vals] = await Promise.all([
        getCustomFieldDefinitions(boardId),
        getTaskCustomFieldValues(taskId)
      ]);
      
      setDefinitions(defs);
      
      // Convert values array to a map for easy lookup
      const valuesMap = {};
      vals.forEach(v => {
        valuesMap[v.fieldDefinitionId] = v.value;
      });
      setValues(valuesMap);
    } catch (err) {
      console.error('Failed to load custom fields:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = async (fieldId, newValue) => {
    if (readOnly) return;
    
    // Optimistic update
    setValues(prev => ({ ...prev, [fieldId]: newValue }));
    
    try {
      setSavingField(fieldId);
      await setTaskCustomFieldValue(taskId, fieldId, newValue);
    } catch (err) {
      console.error('Failed to save field value:', err);
      // Revert on error
      fetchData();
    } finally {
      setSavingField(null);
    }
  };

  const renderFieldInput = (definition) => {
    const value = values[definition.id] || '';
    const isSaving = savingField === definition.id;

    switch (definition.fieldType) {
      case 'TEXT':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleValueChange(definition.id, e.target.value)}
            disabled={readOnly || isSaving}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          />
        );

      case 'TEXTAREA':
        return (
          <textarea
            value={value}
            onChange={(e) => handleValueChange(definition.id, e.target.value)}
            disabled={readOnly || isSaving}
            rows={2}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 resize-y"
          />
        );

      case 'NUMBER':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleValueChange(definition.id, e.target.value)}
            disabled={readOnly || isSaving}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          />
        );

      case 'DATE':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleValueChange(definition.id, e.target.value)}
            disabled={readOnly || isSaving}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          />
        );

      case 'DROPDOWN':
        return (
          <select
            value={value}
            onChange={(e) => handleValueChange(definition.id, e.target.value)}
            disabled={readOnly || isSaving}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">-- Select --</option>
            {(definition.options || []).map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case 'CHECKBOX':
        return (
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={(e) => handleValueChange(definition.id, e.target.checked ? 'true' : 'false')}
            disabled={readOnly || isSaving}
            className="rounded border-gray-300"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleValueChange(definition.id, e.target.value)}
            disabled={readOnly || isSaving}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          />
        );
    }
  };

  if (loading) {
    return <div className="text-xs text-gray-400 mt-2">Loading fields...</div>;
  }

  if (definitions.length === 0) {
    return null; // No custom fields defined
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="text-xs font-medium text-gray-500 mb-2">Custom Fields</div>
      <div className="space-y-2">
        {definitions.map((definition) => (
          <div key={definition.id} className="flex items-start gap-2">
            <label className="text-xs text-gray-600 w-24 pt-1 flex-shrink-0">
              {definition.name}
              {definition.isRequired && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <div className="flex-1">
              {renderFieldInput(definition)}
              {savingField === definition.id && (
                <span className="text-xs text-gray-400 ml-1">Saving...</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomFields;

