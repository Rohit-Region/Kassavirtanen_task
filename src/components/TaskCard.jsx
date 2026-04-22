import React from 'react';

const TASK_TYPE_STYLES = {
  Bug: { bg: '#ef4444', border: '#ef4444' },
  Feature: { bg: '#f97316', border: '#22c55e' },
  Enhancement: { bg: '#eab308', border: '#f59e0b' },
  Research: { bg: '#a855f7', border: '#a855f7' },
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'In Progress':
      return { color: '#2563eb', fontWeight: 600 };
    case 'Todo':
      return { color: '#64748b', fontWeight: 600 };
    case 'Review':
      return { color: '#d97706', fontWeight: 600 };
    case 'Done':
      return { color: '#16a34a', fontWeight: 600 };
    default:
      return { color: '#64748b', fontWeight: 600 };
  }
};

const getPriorityColor = (priority) => {
  const colors = {
    Low: '#22c55e',
    Medium: '#f59e0b',
    High: '#ef4444',
    Critical: '#b91c1c',
  };
  return colors[priority] || '#6b7280';
};

const formatDue = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const TaskCard = ({ task, onEdit, onDelete }) => {
  const typeStyle = TASK_TYPE_STYLES[task.taskType] || TASK_TYPE_STYLES.Feature;
  const overdue = task.dueDate && new Date(task.dueDate) < new Date(new Date().toDateString());

  return (
    <div
      className={`task-card ${task.taskType?.toLowerCase()}`}
      style={{ borderLeft: `4px solid ${typeStyle.border}` }}
    >
      <div className="task-card-header">
        <div className="task-meta">
          <span className="task-type" style={{ backgroundColor: typeStyle.bg }}>
            {task.taskType}
          </span>
          <span className="task-status" style={getStatusStyle(task.status)}>
            {task.status}
          </span>
        </div>

        <div className="task-actions">
          <button type="button" onClick={onEdit} className="btn-edit" aria-label="Edit task">
            ✏️
          </button>
          <button type="button" onClick={onDelete} className="btn-delete" aria-label="Delete task">
            🗑️
          </button>
        </div>
      </div>

      <div className="task-content">
        <h3 className="task-title">{task.title}</h3>

        {task.description && (
          <p className="task-description">
            {task.description.length > 100 ? `${task.description.substring(0, 100)}...` : task.description}
          </p>
        )}

        {task.taskType === 'Bug' && task.severity && (
          <div className="task-severity">
            Severity:{' '}
            <span className={`severity-${task.severity?.toLowerCase()}`}>{task.severity}</span>
          </div>
        )}

        {task.taskType === 'Feature' && task.acceptanceCriteria?.length > 0 && (
          <div className="task-criteria">{task.acceptanceCriteria.length} acceptance criteria</div>
        )}

        {task.subtasks?.length > 0 && (
          <div className="task-subtasks">
            Subtasks: {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length}
          </div>
        )}
      </div>

      <div className="task-footer">
        <div className="task-assignee">
          {task.assigneeName
            ? `Assigned to: ${task.assigneeName}`
            : task.assigneeId
              ? `Assigned to: User ${task.assigneeId}`
              : 'Unassigned'}
        </div>

        {task.dueDate && (
          <div className={`task-due-date ${overdue ? 'overdue' : ''}`}>Due: {formatDue(task.dueDate)}</div>
        )}

        <div className="task-priority">
          Priority:{' '}
          <span style={{ color: getPriorityColor(task.priority) }}>{task.priority}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
