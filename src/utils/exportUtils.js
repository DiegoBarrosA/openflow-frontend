/**
 * Export utilities for generating Markdown and Mermaid Kanban formats
 */

/**
 * Generate a safe identifier from a string (for Mermaid)
 * @param {string} str - Input string
 * @returns {string} Safe identifier
 */
const toSafeId = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 30);
};

/**
 * Export board data to Markdown format
 * @param {object} board - Board object with name
 * @param {array} statuses - Array of status objects
 * @param {array} tasks - Array of task objects
 * @param {object} customFieldsMap - Map of taskId -> array of custom field values
 * @returns {string} Markdown content
 */
export const generateMarkdown = (board, statuses, tasks, customFieldsMap = {}) => {
  let markdown = `# ${board.name}\n\n`;
  
  if (board.description) {
    markdown += `> ${board.description}\n\n`;
  }
  
  markdown += `---\n\n`;

  statuses.forEach((status) => {
    const statusTasks = tasks.filter((task) => task.statusId === status.id);
    
    markdown += `## ${status.name}\n\n`;
    
    if (statusTasks.length === 0) {
      markdown += `*No tasks*\n\n`;
    } else {
      statusTasks.forEach((task) => {
        markdown += `- **${task.title}**\n`;
        
        if (task.description) {
          markdown += `  - Description: ${task.description}\n`;
        }
        
        if (task.assignedUsername) {
          markdown += `  - Assignee: ${task.assignedUsername}\n`;
        }
        
        // Add custom fields
        const customFields = customFieldsMap[task.id] || [];
        customFields.forEach((field) => {
          if (field.value) {
            markdown += `  - ${field.fieldName}: ${field.value}\n`;
          }
        });
        
        markdown += `\n`;
      });
    }
  });

  return markdown;
};

/**
 * Convert hex color to CSS color with alpha for backgrounds
 * @param {string} hex - Hex color code (e.g., "#0079bf")
 * @returns {string} CSS color
 */
const hexToRgba = (hex, alpha = 0.15) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
};

/**
 * Export board data to Mermaid Kanban format
 * Following: https://mermaid.js.org/syntax/kanban.html
 * @param {object} board - Board object with name
 * @param {array} statuses - Array of status objects (with color property)
 * @param {array} tasks - Array of task objects
 * @param {object} customFieldsMap - Map of taskId -> array of custom field values
 * @returns {string} Mermaid Kanban content
 */
export const generateMermaidKanban = (board, statuses, tasks, customFieldsMap = {}) => {
  // Build column styles based on status colors
  const columnStyles = {};
  statuses.forEach((status) => {
    const statusId = toSafeId(status.name);
    if (status.color) {
      columnStyles[statusId] = status.color;
    }
  });
  
  let mermaid = `---\nconfig:\n  kanban:\n    ticketBaseUrl: ''\n---\nkanban\n`;
  
  // Add a comment with color legend for reference
  if (Object.keys(columnStyles).length > 0) {
    mermaid = `%%{init: {'theme': 'base'}}%%\n` + mermaid;
    mermaid += `%% Column Colors: ${statuses.map(s => `${s.name}: ${s.color || 'default'}`).join(', ')} %%\n`;
  }

  statuses.forEach((status) => {
    const statusTasks = tasks.filter((task) => task.statusId === status.id);
    const statusId = toSafeId(status.name);
    
    // Column definition - use brackets if name has spaces, add color indicator in comment
    if (status.name.includes(' ')) {
      mermaid += `  ${statusId}[${status.name}]\n`;
    } else {
      mermaid += `  ${statusId}\n`;
    }
    
    // Add column metadata with color styling if available
    if (status.color) {
      mermaid += `    @{ style: 'background-color: ${hexToRgba(status.color, 0.2)}; border-left: 4px solid ${status.color}' }\n`;
    }
    
    // Tasks in this column
    statusTasks.forEach((task) => {
      const taskId = `task_${task.id}`;
      mermaid += `    ${taskId}[${task.title}]\n`;
      
      // Build metadata
      const metadata = {};
      
      if (task.assignedUsername) {
        metadata.assigned = task.assignedUsername;
      }
      
      // Add custom fields that could be priority or ticket
      const customFields = customFieldsMap[task.id] || [];
      customFields.forEach((field) => {
        if (field.value) {
          const fieldNameLower = field.fieldName.toLowerCase();
          if (fieldNameLower.includes('priority')) {
            // Map to Mermaid priority values
            const priorityMap = {
              'very high': 'Very High',
              'high': 'High',
              'low': 'Low',
              'very low': 'Very Low'
            };
            const mappedPriority = priorityMap[field.value.toLowerCase()];
            if (mappedPriority) {
              metadata.priority = mappedPriority;
            }
          } else if (fieldNameLower.includes('ticket')) {
            metadata.ticket = field.value;
          }
        }
      });
      
      // Add metadata if any
      if (Object.keys(metadata).length > 0) {
        const metadataStr = Object.entries(metadata)
          .map(([key, value]) => `${key}: '${value}'`)
          .join(', ');
        mermaid += `      @{ ${metadataStr} }\n`;
      }
    });
  });

  return mermaid;
};

/**
 * Trigger file download in browser
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export board to Markdown and download
 * @param {object} board - Board object
 * @param {array} statuses - Statuses array
 * @param {array} tasks - Tasks array
 * @param {object} customFieldsMap - Custom fields map
 */
export const exportToMarkdown = (board, statuses, tasks, customFieldsMap = {}) => {
  const content = generateMarkdown(board, statuses, tasks, customFieldsMap);
  const filename = `${board.name.replace(/[^a-z0-9]/gi, '_')}_export.md`;
  downloadFile(content, filename, 'text/markdown');
};

/**
 * Export board to Mermaid Kanban and download
 * @param {object} board - Board object
 * @param {array} statuses - Statuses array
 * @param {array} tasks - Tasks array
 * @param {object} customFieldsMap - Custom fields map
 */
export const exportToMermaid = (board, statuses, tasks, customFieldsMap = {}) => {
  const content = generateMermaidKanban(board, statuses, tasks, customFieldsMap);
  const filename = `${board.name.replace(/[^a-z0-9]/gi, '_')}_kanban.mmd`;
  downloadFile(content, filename, 'text/plain');
};

/**
 * Escape a value for CSV (handle quotes and commas)
 * @param {string} value - Value to escape
 * @returns {string} Escaped value
 */
const escapeCSV = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  // If contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Export board data to CSV format
 * @param {object} board - Board object with name
 * @param {array} statuses - Array of status objects
 * @param {array} tasks - Array of task objects
 * @param {object} customFieldsMap - Map of taskId -> array of custom field values
 * @returns {string} CSV content
 */
export const generateCSV = (board, statuses, tasks, customFieldsMap = {}) => {
  // Collect all unique custom field names
  const customFieldNames = new Set();
  Object.values(customFieldsMap).forEach((fields) => {
    fields.forEach((field) => {
      if (field.fieldName) {
        customFieldNames.add(field.fieldName);
      }
    });
  });
  const customFieldColumns = Array.from(customFieldNames).sort();
  
  // Build status lookup
  const statusMap = {};
  statuses.forEach((status) => {
    statusMap[status.id] = status.name;
  });
  
  // CSV header
  const headers = ['Status', 'Title', 'Description', 'Assignee', ...customFieldColumns];
  let csv = headers.map(escapeCSV).join(',') + '\n';
  
  // Sort tasks by status order
  const sortedTasks = [...tasks].sort((a, b) => {
    const statusOrderA = statuses.findIndex((s) => s.id === a.statusId);
    const statusOrderB = statuses.findIndex((s) => s.id === b.statusId);
    return statusOrderA - statusOrderB;
  });
  
  // CSV rows
  sortedTasks.forEach((task) => {
    const customFields = customFieldsMap[task.id] || [];
    const customFieldValues = {};
    customFields.forEach((field) => {
      customFieldValues[field.fieldName] = field.value || '';
    });
    
    const row = [
      statusMap[task.statusId] || '',
      task.title || '',
      task.description || '',
      task.assignedUsername || '',
      ...customFieldColumns.map((fieldName) => customFieldValues[fieldName] || '')
    ];
    
    csv += row.map(escapeCSV).join(',') + '\n';
  });
  
  return csv;
};

/**
 * Export board to CSV and download
 * @param {object} board - Board object
 * @param {array} statuses - Statuses array
 * @param {array} tasks - Tasks array
 * @param {object} customFieldsMap - Custom fields map
 */
export const exportToCSV = (board, statuses, tasks, customFieldsMap = {}) => {
  const content = generateCSV(board, statuses, tasks, customFieldsMap);
  const filename = `${board.name.replace(/[^a-z0-9]/gi, '_')}_export.csv`;
  downloadFile(content, filename, 'text/csv;charset=utf-8');
};

