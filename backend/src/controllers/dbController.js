import { Todo } from '../models/todo.js';
import { getElasticsearchClient } from '../config/database.js';
import config from '../config/ConfigService.js';

const getIndexName = () => config.getElasticsearchConfig().indexName;

export const createTodo = async (req, res) => {
  try {
    const { title, completed } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todo = new Todo({
      title,
      completed: completed || false,
    });

    await todo.save();

    // Auto-index in Elasticsearch
    try {
      const client = getElasticsearchClient();
      const esTodo = {
        id: todo.id,
        title: todo.title,
        completed: todo.completed,
        createdAt: todo.createdAt.toISOString(),
      };

      await client.index({
        index: getIndexName(),
        id: todo.id,
        document: esTodo,
      });
    } catch (esError) {
      // Log ES indexing error but don't fail the request
      console.error('Error indexing todo in Elasticsearch:', esError);
    }

    res.status(201).json({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      createdAt: todo.createdAt,
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
};

export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });

    const formattedTodos = todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      createdAt: todo.createdAt,
    }));

    res.status(200).json(formattedTodos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
};

