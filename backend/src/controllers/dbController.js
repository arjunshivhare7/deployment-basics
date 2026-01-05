import { Todo } from '../models/todo.js';
import { getElasticsearchClient } from '../config/database.js';
import config from '../config/ConfigService.js';
import { getIndex } from './esController.js';

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
      console.log(`📤 Attempting to index todo in Elasticsearch: ${todo.id}`);
      
      // Ensure index exists
      await getIndex();

      const client = getElasticsearchClient();
      const indexName = getIndexName();
      
      if (!client) {
        throw new Error('Elasticsearch client is not available');
      }

      const esTodo = {
        id: todo.id,
        title: todo.title,
        completed: todo.completed,
        createdAt: todo.createdAt.toISOString(),
      };

      console.log(`   Indexing to: ${indexName}`);
      console.log(`   Document:`, JSON.stringify(esTodo, null, 2));

      const indexResult = await client.index({
        index: indexName,
        id: todo.id,
        document: esTodo,
        refresh: 'wait_for', // Make document immediately searchable
      });
      
      console.log(`✅ Successfully indexed todo in Elasticsearch: ${todo.id}`);
      console.log(`   Index result:`, JSON.stringify(indexResult, null, 2));
    } catch (esError) {
      // Log ES indexing error but don't fail the request
      console.error('❌ Error indexing todo in Elasticsearch:', esError);
      console.error('   Error message:', esError.message);
      console.error('   Error stack:', esError.stack);
      if (esError.meta) {
        console.error('   Error meta:', JSON.stringify(esError.meta, null, 2));
      }
      if (esError.cause) {
        console.error('   Error cause:', esError.cause);
      }
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

