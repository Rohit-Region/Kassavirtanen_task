import React, { useEffect, useMemo, useState, useRef } from 'react';
import { TASK_TYPES, STATUSES } from '../api/mockApi';

const FilterBar = ({ filters = {}, projects = [], users = [], onFiltersChange }) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    const id = setTimeout(() => {
      const currentSearch = filtersRef.current.search || '';
      if (searchInput === currentSearch) return;
      onFiltersChange({ ...filtersRef.current, search: searchInput });
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput, onFiltersChange]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.search?.trim()) n += 1;
    if (filters.projectId) n += 1;
    if (filters.assigneeId) n += 1;
    if (filters.status && filters.status !== 'all') n += 1;
    if (filters.taskType && filters.taskType !== 'all') n += 1;
    return n;
  }, [filters]);

  const handleFilterChange = (filterKey, value) => {
    const normalized =
      filterKey === 'projectId' || filterKey === 'assigneeId'
        ? value || null
        : value;
    onFiltersChange({
      ...filters,
      [filterKey]: normalized,
    });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    onFiltersChange({
      projectId: null,
      assigneeId: null,
      status: 'all',
      taskType: 'all',
      search: '',
    });
  };

  return (
    <div className="filter-bar">
      <div className="filter-controls">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={filters.projectId || ''}
            onChange={(e) => handleFilterChange('projectId', e.target.value)}
            className="filter-select"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.assigneeId || ''}
            onChange={(e) => handleFilterChange('assigneeId', e.target.value)}
            className="filter-select"
          >
            <option value="">All Assignees</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.taskType || 'all'}
            onChange={(e) => handleFilterChange('taskType', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            {TASK_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <button
            type="button"
            onClick={clearAllFilters}
            className="clear-filters-btn"
            disabled={activeCount === 0}
          >
            Clear Filters{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
