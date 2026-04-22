import React, { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { TASK_TYPES, PRIORITIES, BUG_SEVERITIES } from '../api/mockApi';

const emptyDefaults = () => ({
  title: '',
  taskType: 'Feature',
  priority: 'Medium',
  projectId: '',
  assigneeId: '',
  description: '',
  dueDate: '',
  businessValue: '',
  severity: 'Medium',
  stepsToReproduce: '',
  currentBehavior: '',
  proposedBehavior: '',
  researchQuestions: [{ value: '' }],
  expectedOutcomes: '',
  acceptanceCriteria: [],
  subtasks: [],
});

function mapTaskToForm(task) {
  if (!task) return emptyDefaults();
  return {
    title: task.title ?? '',
    taskType: task.taskType ?? 'Feature',
    priority: task.priority ?? 'Medium',
    projectId: task.projectId ?? '',
    assigneeId: task.assigneeId ?? '',
    description: task.description ?? '',
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    businessValue: task.businessValue ?? '',
    severity: task.severity ?? 'Medium',
    stepsToReproduce: task.stepsToReproduce ?? '',
    currentBehavior: task.currentBehavior ?? '',
    proposedBehavior: task.proposedBehavior ?? '',
    researchQuestions:
      task.researchQuestions?.length > 0
        ? task.researchQuestions.map((q) => ({ value: q }))
        : [{ value: '' }],
    expectedOutcomes: task.expectedOutcomes ?? '',
    acceptanceCriteria:
      task.acceptanceCriteria?.length > 0
        ? task.acceptanceCriteria.map((c) => ({ value: c }))
        : [],
    subtasks:
      task.subtasks?.length > 0
        ? task.subtasks.map((s) => ({
            title: s.title,
            completed: !!s.completed,
          }))
        : [],
  };
}

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

function buildApiPayload(data) {
  const task = {
    title: data.title.trim(),
    taskType: data.taskType,
    priority: data.priority,
    projectId: data.projectId || null,
    assigneeId: data.assigneeId || null,
    description: (data.description || '').trim(),
    dueDate: data.dueDate || null,
    subtasks: (data.subtasks || [])
      .filter((s) => s.title?.trim())
      .map((s) => ({
        id: uuidv4(),
        title: s.title.trim(),
        completed: !!s.completed,
      })),
  };

  switch (data.taskType) {
    case 'Bug':
      task.severity = data.severity;
      task.stepsToReproduce = (data.stepsToReproduce || '').trim();
      break;
    case 'Feature':
      task.businessValue = (data.businessValue || '').trim();
      task.acceptanceCriteria = (data.acceptanceCriteria || [])
        .map((c) => c.value?.trim())
        .filter(Boolean);
      break;
    case 'Enhancement':
      task.currentBehavior = (data.currentBehavior || '').trim();
      task.proposedBehavior = (data.proposedBehavior || '').trim();
      break;
    case 'Research':
      task.researchQuestions = (data.researchQuestions || [])
        .map((q) => q.value?.trim())
        .filter(Boolean);
      task.expectedOutcomes = (data.expectedOutcomes || '').trim();
      break;
    default:
      break;
  }

  return stripUndefined(task);
}

const TaskForm = ({
  isOpen,
  mode,
  initialData = null,
  onSubmit,
  onClose,
  users = [],
  projects = [],
  loading = false,
  errorMessage = null,
}) => {
  const defaults = useMemo(() => emptyDefaults(), []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: defaults,
  });

  const taskType = watch('taskType');
  const projectId = watch('projectId');

  const { fields: criteriaFields, append: appendCriteria, remove: removeCriteria } =
    useFieldArray({ control, name: 'acceptanceCriteria' });

  const { fields: subtaskFields, append: appendSubtask, remove: removeSubtask } =
    useFieldArray({ control, name: 'subtasks' });

  const { fields: researchFields, append: appendResearch, remove: removeResearch } =
    useFieldArray({ control, name: 'researchQuestions' });

  const assigneeOptions = useMemo(() => {
    if (!projectId) return users;
    return users.filter((u) => u.projectIds?.includes(projectId));
  }, [users, projectId]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit') {
      if (initialData) reset(mapTaskToForm(initialData));
      return;
    }
    reset(emptyDefaults());
  }, [isOpen, mode, initialData, reset]);

  useEffect(() => {
    if (!isOpen || !projectId) return;
    const aid = getValues('assigneeId');
    if (aid && !assigneeOptions.some((u) => u.id === aid)) {
      setValue('assigneeId', '');
    }
  }, [projectId, assigneeOptions, isOpen, getValues, setValue]);

  const submit = (data) => {
    onSubmit(buildApiPayload(data));
  };

  if (!isOpen) return null;

  return (
    <div className="task-form-overlay" role="presentation" onClick={onClose}>
      <div
        className="task-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="task-form-header">
          <h2 id="task-form-title">{mode === 'create' ? 'Create New Task' : 'Edit Task'}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {errorMessage && (
          <div className="form-banner-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(submit)} noValidate>
          <div className="form-group">
            <label htmlFor="title">
              Title <span className="req">*</span>
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && <div className="form-error">{errors.title.message}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="taskType">
              Task Type <span className="req">*</span>
            </label>
            <Controller
              name="taskType"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <select id="taskType" {...field}>
                  {TASK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">
              Priority <span className="req">*</span>
            </label>
            <Controller
              name="priority"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <select id="priority" {...field}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectId">Project</label>
            <Controller
              name="projectId"
              control={control}
              render={({ field }) => (
                <select id="projectId" {...field}>
                  <option value="">Select a project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          <div className="form-group">
            <label htmlFor="assigneeId">Assignee</label>
            <Controller
              name="assigneeId"
              control={control}
              render={({ field }) => (
                <select id="assigneeId" {...field}>
                  <option value="">Unassigned</option>
                  {assigneeOptions.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Enter task description..."
              {...register('description')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input id="dueDate" type="date" {...register('dueDate')} />
          </div>

          {taskType === 'Bug' && (
            <>
              <div className="form-group">
                <label htmlFor="severity">Severity</label>
                <Controller
                  name="severity"
                  control={control}
                  render={({ field }) => (
                    <select id="severity" {...field}>
                      {BUG_SEVERITIES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
              <div className="form-group">
                <label htmlFor="stepsToReproduce">Steps to reproduce</label>
                <textarea id="stepsToReproduce" rows={4} {...register('stepsToReproduce')} />
              </div>
            </>
          )}

          {taskType === 'Feature' && (
            <>
              <div className="form-group">
                <label htmlFor="businessValue">Business Value</label>
                <textarea
                  id="businessValue"
                  placeholder="Describe the business value this feature will provide..."
                  {...register('businessValue')}
                />
              </div>
              <div className="form-group">
                <label>Acceptance Criteria</label>
                {criteriaFields.map((field, index) => (
                  <div key={field.id} className="field-array-row">
                    <input
                      type="text"
                      {...register(`acceptanceCriteria.${index}.value`)}
                      placeholder="Criterion"
                    />
                    <button type="button" className="btn-row" onClick={() => removeCriteria(index)}>
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" className="btn-add" onClick={() => appendCriteria({ value: '' })}>
                  + Add Criteria
                </button>
              </div>
            </>
          )}

          {taskType === 'Enhancement' && (
            <>
              <div className="form-group">
                <label htmlFor="currentBehavior">Current behavior</label>
                <textarea id="currentBehavior" rows={3} {...register('currentBehavior')} />
              </div>
              <div className="form-group">
                <label htmlFor="proposedBehavior">Proposed behavior</label>
                <textarea id="proposedBehavior" rows={3} {...register('proposedBehavior')} />
              </div>
            </>
          )}

          {taskType === 'Research' && (
            <>
              <div className="form-group">
                <label>Research questions</label>
                {researchFields.map((field, index) => (
                  <div key={field.id} className="field-array-row">
                    <input
                      type="text"
                      {...register(`researchQuestions.${index}.value`)}
                      placeholder="Question"
                    />
                    {researchFields.length > 1 && (
                      <button type="button" className="btn-row" onClick={() => removeResearch(index)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-add" onClick={() => appendResearch({ value: '' })}>
                  + Add question
                </button>
              </div>
              <div className="form-group">
                <label htmlFor="expectedOutcomes">Expected outcomes</label>
                <textarea id="expectedOutcomes" rows={3} {...register('expectedOutcomes')} />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Subtasks</label>
            {subtaskFields.map((field, index) => (
              <div key={field.id} className="field-array-row">
                <input type="text" {...register(`subtasks.${index}.title`)} placeholder="Subtask title" />
                <label className="checkbox-inline">
                  <input type="checkbox" {...register(`subtasks.${index}.completed`)} />
                  Done
                </label>
                <button type="button" className="btn-row" onClick={() => removeSubtask(index)}>
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-add"
              onClick={() => appendSubtask({ title: '', completed: false })}
            >
              + Add Subtask
            </button>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
