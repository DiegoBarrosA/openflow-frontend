import React, { useState, useEffect } from 'react';
import {
  getCustomFieldDefinitions,
  getTaskCustomFieldValues,
  setTaskCustomFieldValue
} from '../services/api';

/**
 * CustomFields component - displays and allows editing of custom field values for a task.
 * 
 * Props:
 * - taskId: The ID of the task (null for creation mode)
 * - boardId: The ID of the board
 * - readOnly: Whether the fields are read-only
 * - mode: 'edit' (default) or 'create'
 * - onChange: Callback when values change in create mode (receives { fieldId: value })
 * - initialValues: Initial values for create mode
 */
const CustomFields = ({ taskId, boardId, readOnly = false, mode = 'edit', onChange, initialValues = {} }) => {
  const [definitions, setDefinitions] = useState([]);
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState(null);
  const [errors, setErrors] = useState({});

  const isCreateMode = mode === 'create';

  useEffect(() => {
    fetchData();
  }, [taskId, boardId]);

  useEffect(() => {
    if (isCreateMode) {
      setValues(initialValues);
    }
  }, [initialValues, isCreateMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Always fetch definitions
      const defs = await getCustomFieldDefinitions(boardId);
      setDefinitions(defs);
      
      // Only fetch values if we have a taskId (edit mode)
      if (taskId && !isCreateMode) {
        const vals = await getTaskCustomFieldValues(taskId);
        // Convert values array to a map for easy lookup
        const valuesMap = {};
        vals.forEach(v => {
          valuesMap[v.fieldDefinitionId] = v.value;
        });
        setValues(valuesMap);
      }
    } catch (err) {
      console.error('Failed to load custom fields:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateField = (definition, value) => {
    if (!value && definition.isRequired) {
      return 'This field is required';
    }
    
    if (!value) return null;

    switch (definition.fieldType) {
      case 'NUMBER':
        if (!/^-?\d*\.?\d*$/.test(value)) {
          return 'Please enter a valid number';
        }
        break;
      case 'DATE':
        if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return 'Please enter a valid date (YYYY-MM-DD)';
        }
        break;
      case 'DROPDOWN':
        if (value && definition.options && !definition.options.includes(value)) {
          return 'Please select a valid option';
        }
        break;
      default:
        break;
    }
    return null;
  };

  const handleValueChange = async (fieldId, newValue, definition) => {
    if (readOnly) return;
    
    // Validate the field
    const error = validateField(definition, newValue);
    setErrors(prev => ({
      ...prev,
      [fieldId]: error
    }));
    
    // Update local state
    const newValues = { ...values, [fieldId]: newValue };
    setValues(newValues);
    
    // In create mode, just call onChange callback
    if (isCreateMode) {
      if (onChange) {
        onChange(newValues);
      }
      return;
    }
    
    // In edit mode, save to server
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
    const error = errors[definition.id];
    const hasError = !!error;
    const baseInputClass = `w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 disabled:bg-gray-100 ${
      hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
    }`;

    switch (definition.fieldType) {
      case 'TEXT':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleValueChange(definition.id, e.target.value, definition)}
            disabled={readOnly || isSaving}
            className={baseInputClass}
          />
        );

      case 'TEXTAREA':
        return (
          <textarea
            value={value}
            onChange={(e) => handleValueChange(definition.id, e.target.value, definition)}
            disabled={readOnly || isSaving}
            rows={2}
            className={`${baseInputClass} resize-y`}
          />
        );

      case 'NUMBER':
        return (
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => handleValueChange(definition.id, e.target.value, definition)}
            disabled={readOnly || isSaving}
            className={baseInputClass}
            placeholder="Enter a number"
          />
        );

      case 'DATE':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleValueChange(definition.id, e.target.value, definition)}
            disabled={readOnly || isSaving}
            className={baseInputClass}
          />
        );

      case 'DROPDOWN':
        return (
          <select
            value={value}
            onChange={(e) => handleValueChange(definition.id, e.target.value, definition)}
            disabled={readOnly || isSaving}
            className={baseInputClass}
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
            onChange={(e) => handleValueChange(definition.id, e.target.checked ? 'true' : 'false', definition)}
            disabled={readOnly || isSaving}
            className="rounded border-gray-300"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleValueChange(definition.id, e.target.value, definition)}
            disabled={readOnly || isSaving}
            className={baseInputClass}
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
              {errors[definition.id] && (
                <span className="text-xs text-red-500 mt-0.5 block">{errors[definition.id]}</span>
              )}
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

