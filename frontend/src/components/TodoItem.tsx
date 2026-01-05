import React from 'react';
import { Todo } from '../lib/api';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="todo-item">
      <div className="todo-content">
        <h3 className={todo.completed ? 'completed' : ''}>{todo.title}</h3>
        <p className="todo-meta">
          Status: {todo.completed ? 'Completed' : 'Pending'} | Created: {formatDate(todo.createdAt)}
        </p>
      </div>
      <style jsx>{`
        .todo-item {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .todo-content h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #333;
        }
        .todo-content h3.completed {
          text-decoration: line-through;
          color: #888;
        }
        .todo-meta {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

