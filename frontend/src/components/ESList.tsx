'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { searchTodosInES, Todo } from '../lib/api';
import { TodoItem } from './TodoItem';

export interface ESListRef {
  refresh: () => void;
}

export const ESList = forwardRef<ESListRef>((props, ref) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTodos = async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchTodosInES(query);
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search todos');
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: () => fetchTodos(),
  }));

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTodos(searchQuery || undefined);
  };

  return (
    <div className="es-list">
      <div className="header">
        <h2>Elasticsearch Todos CHANGED</h2>
        <button onClick={() => fetchTodos()} disabled={loading} className="refresh-btn">
          {loading ? 'Loading...' : 'Refresh All'}
        </button>
      </div>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search todos..."
          className="search-input"
        />
        <button type="submit" disabled={loading} className="search-btn">
          Search
        </button>
      </form>
      {loading && <div className="loading">Loading todos...</div>}
      {error && <div className="error">Error: {error}</div>}
      {!loading && !error && todos.length === 0 && (
        <div className="empty">No todos found. Create one above!</div>
      )}
      {!loading && !error && todos.length > 0 && (
        <div className="todos">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      )}
      <style jsx>{`
        .es-list {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .header h2 {
          margin: 0;
          color: #333;
        }
        .refresh-btn {
          padding: 8px 16px;
          background: #7928ca;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .refresh-btn:hover:not(:disabled) {
          background: #5a1f9a;
        }
        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .search-form {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
        .search-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        .search-btn {
          padding: 10px 20px;
          background: #7928ca;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        .search-btn:hover:not(:disabled) {
          background: #5a1f9a;
        }
        .search-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .loading,
        .error,
        .empty {
          padding: 20px;
          text-align: center;
          color: #666;
        }
        .error {
          color: #c33;
          background: #fee;
          border-radius: 4px;
        }
        .todos {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
});

ESList.displayName = 'ESList';

