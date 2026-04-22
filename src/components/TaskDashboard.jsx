import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import FilterBar from './FilterBar';
import {
  selectTasksWithAssignees,
  selectUsersArray,
  selectProjectsArray,
  selectTaskForm,
  selectFilters,
  selectLoading,
  selectErrors,
  selectTaskById,
} from '../store/selectors';
import {
  fetchTasksRequest,
  createTaskRequest,
  updateTaskRequest,
  deleteTaskRequest,
} from '../store/actions/taskActions';
import { fetchUsersRequest, fetchProjectsRequest } from '../store/actions/referenceActions';
import { openTaskForm, closeTaskForm, setFilters } from '../store/actions/uiActions';

const TaskDashboard = () => {
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasksWithAssignees);
  const users = useSelector(selectUsersArray);
  const projects = useSelector(selectProjectsArray);
  const taskForm = useSelector(selectTaskForm);
  const filters = useSelector(selectFilters);
  const loading = useSelector(selectLoading);
  const errors = useSelector(selectErrors);
  const editingTask = useSelector(selectTaskById(taskForm.taskId));

  useEffect(() => {
    dispatch(fetchUsersRequest());
    dispatch(fetchProjectsRequest());
    dispatch(fetchTasksRequest(filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap once with initial filters
  }, [dispatch]);

  const handleFiltersChange = useCallback(
    (nextFilters) => {
      dispatch(setFilters(nextFilters));
      dispatch(fetchTasksRequest(nextFilters));
    },
    [dispatch]
  );

  const handleCreateTask = () => {
    dispatch(openTaskForm('create', null));
  };

  const handleEditTask = (taskId) => {
    dispatch(openTaskForm('edit', taskId));
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Delete this task?')) {
      dispatch(deleteTaskRequest(taskId));
    }
  };

  const handleFormSubmit = (formPayload) => {
    if (taskForm.mode === 'edit' && taskForm.taskId) {
      dispatch(updateTaskRequest(taskForm.taskId, formPayload));
    } else {
      dispatch(createTaskRequest(formPayload));
    }
  };

  const handleFormClose = () => {
    dispatch(closeTaskForm());
  };

  return (
    <div className="task-dashboard">
      <header className="dashboard-header">
        <h1>Task Management Dashboard</h1>
        <button type="button" className="create-task-btn" onClick={handleCreateTask}>
          + Create Task
        </button>
      </header>

      {errors.tasks && (
        <div className="error-banner" role="alert">
          Error: {errors.tasks}
        </div>
      )}

      <FilterBar
        filters={filters}
        projects={projects}
        users={users}
        onFiltersChange={handleFiltersChange}
      />

      <TaskList
        tasks={tasks}
        loading={loading.tasks}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />

      <TaskForm
        isOpen={taskForm.isOpen}
        mode={taskForm.mode}
        initialData={taskForm.mode === 'edit' ? editingTask : null}
        users={users}
        projects={projects}
        loading={loading.saveTask}
        errorMessage={errors.form}
        onSubmit={handleFormSubmit}
        onClose={handleFormClose}
      />
    </div>
  );
};

export default TaskDashboard;
