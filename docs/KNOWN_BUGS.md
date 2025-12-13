# Known Bugs - OpenFlow Frontend

## Fixed Bugs

### BUG-001: Translation key "task.description" missing (Fixed: 2025-12-13)

**Problem**: In `TaskDetailModal.jsx` line 179, the translation call `t('task.description')` was displaying the literal key "task.description" instead of the translated text because the key was missing from the translation files.

**Root Cause**: The `task.description` key was not defined in `src/locales/en.json` and `src/locales/es.json`.

**Solution**: Added the missing translation key:
- `en.json`: `"description": "Description"` under the `task` object
- `es.json`: `"description": "Descripción"` under the `task` object

**Files Modified**:
- `src/locales/en.json`
- `src/locales/es.json`

**Verified**: The task detail modal now correctly displays "Description" (EN) or "Descripción" (ES) instead of "task.description".

