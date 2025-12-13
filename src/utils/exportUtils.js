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
 * Export board data to Mermaid Kanban format
 * Following: https://mermaid.js.org/syntax/kanban.html
 * @param {object} board - Board object with name
 * @param {array} statuses - Array of status objects
 * @param {array} tasks - Array of task objects
 * @param {object} customFieldsMap - Map of taskId -> array of custom field values
 * @returns {string} Mermaid Kanban content
 */
export const generateMermaidKanban = (board, statuses, tasks, customFieldsMap = {}) => {
  let mermaid = `---\nconfig:\n  kanban:\n    ticketBaseUrl: ''\n---\nkanban\n`;

  statuses.forEach((status) => {
    const statusTasks = tasks.filter((task) => task.statusId === status.id);
    const statusId = toSafeId(status.name);
    
    // Column definition - use brackets if name has spaces
    if (status.name.includes(' ')) {
      mermaid += `  ${statusId}[${status.name}]\n`;
    } else {
      mermaid += `  ${statusId}\n`;
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

