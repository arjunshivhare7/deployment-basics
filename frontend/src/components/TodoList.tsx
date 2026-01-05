'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { getTodosFromDB, Todo } from '../lib/api';
import { TodoItem } from './TodoItem';

export interface TodoListRef {
  refresh: () => void;
}

export const TodoList = forwardRef<TodoListRef>((props, ref) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodosFromDB();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: fetchTodos,
  }));

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="todo-list">
      <div className="header">
        <h2>MongoDB Todos</h2>
        <button onClick={fetchTodos} disabled={loading} className="refresh-btn">
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
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
        .todo-list {
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
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .refresh-btn:hover:not(:disabled) {
          background: #0051cc;
        }
        .refresh-btn:disabled {
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

TodoList.displayName = 'TodoList';

