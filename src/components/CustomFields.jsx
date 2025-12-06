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
    const baseInputClass = `w-full px-3 py-2 text-sm border rounded-md transition-all duration-200 
      focus:outline-none focus:ring-2 focus:ring-offset-0 
      disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
      ${hasError 
        ? 'border-red-400 focus:ring-red-300 focus:border-red-400 bg-red-50/30' 
        : 'border-[#B19CD9]/30 focus:ring-[#82AAFF]/30 focus:border-[#82AAFF] bg-white hover:border-[#B19CD9]/50'
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
            placeholder={`Enter ${definition.name.toLowerCase()}`}
          />
        );

      case 'TEXTAREA':
        return (
          <textarea
            value={value}
            onChange={(e) => handleValueChange(definition.id, e.target.value, definition)}
            disabled={readOnly || isSaving}
            rows={3}
            className={`${baseInputClass} resize-y min-h-[60px]`}
            placeholder={`Enter ${definition.name.toLowerCase()}`}
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
            placeholder="0"
          />
        );

      case 'DATE':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleValueChange(definition.id, e.target.value, definition)}
            disabled={readOnly || isSaving}
            className={`${baseInputClass} cursor-pointer`}
          />
        );

      case 'DROPDOWN':
        return (
          <select
            value={value}
            onChange={(e) => handleValueChange(definition.id, e.target.value, definition)}
            disabled={readOnly || isSaving}
            className={`${baseInputClass} cursor-pointer appearance-none bg-no-repeat bg-right pr-8`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundSize: '1.25rem',
              backgroundPosition: 'right 0.5rem center'
            }}
          >
            <option value="">Select an option...</option>
            {(definition.options || []).map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case 'CHECKBOX':
        const isChecked = value === 'true';
        return (
          <button
            type="button"
            role="checkbox"
            aria-checked={isChecked}
            onClick={() => !readOnly && !isSaving && handleValueChange(definition.id, isChecked ? 'false' : 'true', definition)}
            disabled={readOnly || isSaving}
            className={`w-6 h-6 rounded-md border-2 transition-all duration-200 flex items-center justify-center
              ${isChecked 
                ? 'bg-[#88D8C0] border-[#88D8C0] text-white' 
                : 'bg-white border-[#B19CD9]/40 hover:border-[#B19CD9]'
              }
              ${readOnly || isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-[#82AAFF]/30 focus:ring-offset-1`}
          >
            {isChecked && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
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
    return (
      <div className="mt-4 pt-4 border-t border-[#B19CD9]/20">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="animate-spin h-4 w-4 text-[#82AAFF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading custom fields...</span>
        </div>
      </div>
    );
  }

  if (definitions.length === 0) {
    return null; // No custom fields defined
  }

  return (
    <div className="mt-4 pt-4 border-t border-[#B19CD9]/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-[#B19CD9] rounded-full"></div>
        <h4 className="text-sm font-semibold text-gray-700">Custom Fields</h4>
      </div>
      <div className="space-y-3">
        {definitions.map((definition) => (
          <div key={definition.id} className={`${definition.fieldType === 'CHECKBOX' ? 'flex items-center gap-3' : ''}`}>
            <label className={`text-sm font-medium text-gray-600 ${definition.fieldType === 'CHECKBOX' ? 'order-2' : 'block mb-1.5'}`}>
              {definition.name}
              {definition.isRequired && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            <div className={definition.fieldType === 'CHECKBOX' ? 'order-1' : ''}>
              {renderFieldInput(definition)}
              {errors[definition.id] && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors[definition.id]}
                </p>
              )}
              {savingField === definition.id && (
                <p className="text-xs text-[#82AAFF] mt-1 flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomFields;

