'use client';

import React, { useState } from 'react';
import { createTodoInDB, CreateTodoRequest } from '../lib/api';

interface TodoFormProps {
  onTodoCreated?: () => void;
}

export const TodoForm: React.FC<TodoFormProps> = ({ onTodoCreated }) => {
  const [title, setTitle] = useState('');
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const todo: CreateTodoRequest = { title, completed };
      await createTodoInDB(todo);
      setSuccess('Todo created successfully!');
      setTitle('');
      setCompleted(false);
      
      // Trigger refresh of both lists
      if (onTodoCreated) {
        onTodoCreated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="todo-form">
      <h2>Create New Todo</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter todo title"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              disabled={loading}
            />
            Completed
          </label>
        </div>
        <div className="button-group">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Todo'}
          </button>
        </div>
      </form>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <style jsx>{`
        .todo-form {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }
        .todo-form h2 {
          margin: 0 0 20px 0;
          color: #333;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #555;
        }
        .form-group input[type='text'] {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          box-sizing: border-box;
        }
        .form-group input[type='checkbox'] {
          margin-right: 8px;
        }
        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-primary {
          background: #0070f3;
          color: white;
        }
        .btn-primary:hover:not(:disabled) {
          background: #0051cc;
        }
        .btn-secondary {
          background: #7928ca;
          color: white;
        }
        .btn-secondary:hover:not(:disabled) {
          background: #5a1f9a;
        }
        .error {
          margin-top: 12px;
          padding: 10px;
          background: #fee;
          color: #c33;
          border-radius: 4px;
        }
        .success {
          margin-top: 12px;
          padding: 10px;
          background: #efe;
          color: #3c3;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

