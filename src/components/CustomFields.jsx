import React, { useState, useEffect, useRef } from 'react';
import {
  getCustomFieldDefinitions,
  getTaskCustomFieldValues,
  setTaskCustomFieldValue
} from '../services/api';
import { useTranslation } from '../contexts/I18nContext';

// Simple in-memory cache for field definitions (keyed by boardId)
// Cache entries expire after 5 minutes
const definitionsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedDefinitions = (boardId) => {
  const cached = definitionsCache.get(boardId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedDefinitions = (boardId, data) => {
  definitionsCache.set(boardId, { data, timestamp: Date.now() });
};

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
  const t = useTranslation();
  const [definitions, setDefinitions] = useState(() => getCachedDefinitions(boardId) || []);
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(!getCachedDefinitions(boardId));
  const [loadingValues, setLoadingValues] = useState(false);
  const [savingField, setSavingField] = useState(null);
  const [errors, setErrors] = useState({});
  const fetchedRef = useRef(false);

  const isCreateMode = mode === 'create';

  useEffect(() => {
    // Prevent double fetching in strict mode
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchData();
    
    return () => {
      fetchedRef.current = false;
    };
  }, [taskId, boardId]);

  useEffect(() => {
    if (isCreateMode) {
      setValues(initialValues);
    }
  }, [initialValues, isCreateMode]);

  const fetchData = async () => {
    try {
      const cachedDefs = getCachedDefinitions(boardId);
      
      // If we have cached definitions, show them immediately
      if (cachedDefs) {
        setDefinitions(cachedDefs);
        setLoading(false);
        
        // Fetch values in parallel if needed (edit mode)
        if (taskId && !isCreateMode) {
          setLoadingValues(true);
          try {
            const vals = await getTaskCustomFieldValues(taskId);
            const valuesMap = {};
            vals.forEach(v => {
              valuesMap[v.fieldDefinitionId] = v.value;
            });
            setValues(valuesMap);
          } finally {
            setLoadingValues(false);
          }
        }
        
        // Refresh definitions in background (don't await)
        getCustomFieldDefinitions(boardId).then(defs => {
          setCachedDefinitions(boardId, defs);
          setDefinitions(defs);
        }).catch(console.error);
        
        return;
      }
      
      // No cache - fetch everything in parallel
      setLoading(true);
      
      const promises = [getCustomFieldDefinitions(boardId)];
      if (taskId && !isCreateMode) {
        promises.push(getTaskCustomFieldValues(taskId));
      }
      
      const results = await Promise.all(promises);
      
      const defs = results[0];
      setCachedDefinitions(boardId, defs);
      setDefinitions(defs);
      
      if (results[1]) {
        const valuesMap = {};
        results[1].forEach(v => {
          valuesMap[v.fieldDefinitionId] = v.value;
        });
        setValues(valuesMap);
      }
    } catch (err) {
      console.error('Failed to load custom fields:', err);
    } finally {
      setLoading(false);
      setLoadingValues(false);
    }
  };

  const validateField = (definition, value) => {
    if (!value && definition.isRequired) {
      return t('board.requiredField');
    }
    
    if (!value) return null;

    switch (definition.fieldType) {
      case 'NUMBER':
        if (!/^-?\d*\.?\d*$/.test(value)) {
          return t('board.fieldValidation.invalidNumber', { defaultValue: 'Please enter a valid number' });
        }
        break;
      case 'DATE':
        if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return t('board.fieldValidation.invalidDate', { defaultValue: 'Please enter a valid date (YYYY-MM-DD)' });
        }
        break;
      case 'DROPDOWN':
        if (value && definition.options && !definition.options.includes(value)) {
          return t('board.fieldValidation.invalidOption', { defaultValue: 'Please select a valid option' });
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
      disabled:bg-base-01 dark:bg-base-02 disabled:text-base-04 disabled:cursor-not-allowed
      ${hasError 
        ? 'border-base-08 focus:ring-base-08/30 focus:border-base-08 bg-base-08/10 dark:bg-base-08/20' 
        : 'border-base-0E/30 focus:ring-base-0D/30 focus:border-base-0D bg-base-07 dark:bg-base-00 hover:border-base-0E/50 text-base-05'
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
            placeholder={t('board.fieldPlaceholder', { fieldName: definition.name, defaultValue: `Enter ${definition.name.toLowerCase()}` })}
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
            placeholder={t('board.fieldPlaceholder', { fieldName: definition.name, defaultValue: `Enter ${definition.name.toLowerCase()}` })}
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
            <option value="">{t('board.selectOption', { defaultValue: 'Select an option...' })}</option>
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
                ? 'bg-base-0D border-base-0D text-base-07' 
                : 'bg-base-07 dark:bg-base-00 border-base-0E/40 hover:border-base-0E'
              }
              ${readOnly || isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-base-0D/30 focus:ring-offset-1`}
          >
            {isChecked && (
              <i className="fas fa-check text-xs" aria-hidden="true"></i>
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
      <div className="mt-4 pt-4 border-t border-base-0E/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-base-0E rounded-full"></div>
          <h4 className="text-sm font-semibold text-base-05">
            <i className="fas fa-tags mr-2" aria-hidden="true"></i>
            {t('board.customFields')}
          </h4>
        </div>
        {/* Skeleton loading */}
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="h-4 w-20 bg-base-02 dark:bg-base-03 rounded mb-1.5"></div>
              <div className="h-10 w-full bg-base-01 dark:bg-base-02 rounded-md border border-base-02 dark:border-base-03"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (definitions.length === 0) {
    return null; // No custom fields defined
  }

  return (
    <div className="mt-4 pt-4 border-t border-base-0E/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-base-0E rounded-full"></div>
        <h4 className="text-sm font-semibold text-base-05">
          <i className="fas fa-tags mr-2" aria-hidden="true"></i>
          {t('board.customFields')}
        </h4>
        {loadingValues && (
          <i className="fas fa-spinner fa-spin h-3 w-3 text-base-0D ml-1" aria-hidden="true"></i>
        )}
      </div>
      <div className={`space-y-3 ${loadingValues ? 'opacity-60' : ''}`}>
        {definitions.map((definition) => (
          <div key={definition.id} className={`${definition.fieldType === 'CHECKBOX' ? 'flex items-center gap-3' : ''}`}>
            <label className={`text-sm font-medium text-base-05 ${definition.fieldType === 'CHECKBOX' ? 'order-2' : 'block mb-1.5'}`}>
              {definition.name}
              {definition.isRequired && <span className="text-base-08 ml-0.5">*</span>}
            </label>
            <div className={definition.fieldType === 'CHECKBOX' ? 'order-1' : ''}>
              {renderFieldInput(definition)}
              {errors[definition.id] && (
                <p className="text-xs text-base-08 mt-1 flex items-center gap-1">
                  <i className="fas fa-exclamation-circle w-3 h-3" aria-hidden="true"></i>
                  {errors[definition.id]}
                </p>
              )}
              {savingField === definition.id && (
                <p className="text-xs text-base-0D mt-1 flex items-center gap-1">
                  <i className="fas fa-spinner fa-spin h-3 w-3" aria-hidden="true"></i>
                  {t('common.saving', { defaultValue: 'Saving...' })}
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

