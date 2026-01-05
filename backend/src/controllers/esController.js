import { getElasticsearchClient } from '../config/database.js';
import config from '../config/ConfigService.js';
import { v4 as uuidv4 } from 'uuid';

const getIndexName = () => config.getElasticsearchConfig().indexName;

export const indexTodo = async (req, res) => {
  try {
    const { title, completed } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const client = getElasticsearchClient();
    const id = uuidv4();
    const todo = {
      id,
      title,
      completed: completed || false,
      createdAt: new Date().toISOString(),
    };

    await client.index({
      index: getIndexName(),
      id,
      document: todo,
    });

    res.status(201).json(todo);
  } catch (error) {
    console.error('Error indexing todo:', error);
    res.status(500).json({ error: 'Failed to index todo' });
  }
};

export const searchTodos = async (req, res) => {
  try {
    const { q } = req.query;
    const client = getElasticsearchClient();

    let query = {
      match_all: {},
    };

    if (q) {
      query = {
        wildcard: {
          title: {
            value: `*${q}*`,
            case_insensitive: true,
          },
        },
      };
    }

    const result = await client.search({
      index: getIndexName(),
      query,
      size: 100,
    });

    const todos = result.hits.hits.map((hit) => hit._source);

    res.status(200).json(todos);
  } catch (error) {
    console.error('Error searching todos:', error);
    res.status(500).json({ error: 'Failed to search todos' });
  }
};

