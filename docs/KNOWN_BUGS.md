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

---

### BUG-002: Custom fields double-submit (Fixed: 2025-12-13)

**Problem**: When creating or editing custom fields, clicking the submit button quickly would create duplicate entries.

**Root Cause**: The form had no protection against double-submit - no loading state disabled the button during submission.

**Solution**: Added `isSubmitting` and `deletingId` states in `CustomFieldManager.jsx` to disable buttons during async operations.

**Files Modified**:
- `src/components/CustomFieldManager.jsx`

---

### BUG-003: Custom fields 500 error - Oracle reserved word (Fixed: 2025-12-13)

**Problem**: All custom field operations returned HTTP 500 Internal Server Error.

**Root Cause**: The column name `value` in `custom_field_values` table is a reserved word in Oracle, causing: `ORA-00904: "CFV1_0"."value": invalid identifier`

**Solution**: 
- Renamed column from `"value"` to `field_value` in `CustomFieldValue.java`
- Added Flyway migration `V5__rename_value_column.sql` to rename the column in the database

**Files Modified (Backend)**:
- `src/main/java/com/openflow/model/CustomFieldValue.java`
- `src/main/resources/db/migration/V5__rename_value_column.sql`

---

### BUG-004: Error 400 creating tasks with custom fields (Fixed: 2025-12-13)

**Problem**: Creating a task with custom field values returned HTTP 400 Bad Request.

**Root Cause**: Jackson could not deserialize JSON object keys (strings like `"42"`) directly to `Map<Long, String>`.

**Solution**: 
- Changed `TaskDto.customFieldValues` from `Map<Long, String>` to `Map<String, String>`
- Added conversion to Long in `TaskService.createTaskDto()` before saving

**Files Modified (Backend)**:
- `src/main/java/com/openflow/dto/TaskDto.java`
- `src/main/java/com/openflow/service/TaskService.java`

---

### BUG-005: Custom field delete 500 error (Fixed: 2025-12-13)

**Problem**: Deleting a custom field definition returned HTTP 500.

**Root Cause**: Spring Data JPA `deleteBy...` methods need `@Modifying` annotation for write operations.

**Solution**: Added `@Modifying` and explicit `@Query` annotations to delete methods in repository.

**Files Modified (Backend)**:
- `src/main/java/com/openflow/repository/CustomFieldValueRepository.java`

---

### BUG-006: Mermaid export parse error (Fixed: 2025-12-13)

**Problem**: Exported Mermaid Kanban files failed to parse with error: `Expecting 'SPACELINE'... got 'SHAPE_DATA'`

**Root Cause**: Mermaid Kanban syntax does not support `@{ style: ... }` metadata on columns, only on tasks.

**Solution**: Removed the `@{ style: ... }` block from column definitions, keeping colors only as comments.

**Files Modified**:
- `src/utils/exportUtils.js`

---

### BUG-007: Username overflow in navigation menu (Fixed: 2025-12-13)

**Problem**: Long usernames would overflow the dropdown menu container, breaking the layout.

**Root Cause**: The username paragraph had no width constraints or truncation.

**Solution**: Added `truncate max-w-[120px]` classes and `title` attribute for tooltip on hover.

**Files Modified**:
- `src/components/NavigationBar.jsx`

---

### BUG-008: Infinite loading after board errors (Fixed: 2025-12-13)

**Problem**: If fetching board data failed, the loading spinner would display forever.

**Root Cause**: The loading state was inferred from `!board` instead of having an explicit `loading` state. Errors left `board` as null indefinitely.

**Solution**: Added explicit `loading` and `error` states with proper error UI showing a message and "Go to Boards" button.

**Files Modified**:
- `src/components/Board.jsx`

---

### BUG-009: No character limit validation on text fields (Fixed: 2025-12-13)

**Problem**: Users can submit extremely long text (47,000+ characters) in title/description fields, causing HTTP 400 errors from the backend.

**Root Cause**: No client-side validation or character limits on input fields.

**Solution**: Added `maxLength` attributes and character counters to title (200 chars) and description (1000 chars) fields in:
- Task creation form in `Board.jsx`
- Task edit form in `TaskDetailModal.jsx`

**Files Modified**:
- `src/components/Board.jsx`
- `src/components/TaskDetailModal.jsx`

