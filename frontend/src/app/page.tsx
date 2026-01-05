'use client';

import { useRef } from 'react';
import { TodoForm } from '../components/TodoForm';
import { TodoList, TodoListRef } from '../components/TodoList';
import { ESList, ESListRef } from '../components/ESList';

export default function Home() {
  const todoListRef = useRef<TodoListRef>(null);
  const esListRef = useRef<ESListRef>(null);

  const handleTodoCreated = () => {
    // Refresh both lists after 1 second delay to allow backend processing
    setTimeout(() => {
      todoListRef.current?.refresh();
      esListRef.current?.refresh();
    }, 1000);
  };

  return (
    <main className="container">
      <header>
        <h1>Todo Application</h1>
        <p>Manage your todos with MongoDB and Elasticsearch</p>
      </header>
      <TodoForm onTodoCreated={handleTodoCreated} />
      <div className="lists-container">
        <TodoList ref={todoListRef} />
        <ESList ref={esListRef} />
      </div>
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        header {
          text-align: center;
          margin-bottom: 40px;
        }
        header h1 {
          font-size: 2.5rem;
          color: #333;
          margin-bottom: 10px;
        }
        header p {
          font-size: 1.2rem;
          color: #666;
        }
        .lists-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 768px) {
          .lists-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}

