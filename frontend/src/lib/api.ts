import ConfigService from './ConfigService';

const API_URL = ConfigService.getApiUrl();
const ES_URL = ConfigService.getElasticsearchUrl();
const ES_INDEX = ConfigService.getElasticsearchIndex();

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateTodoRequest {
  title: string;
  completed?: boolean;
}

// Backend API calls
export const createTodoInDB = async (todo: CreateTodoRequest): Promise<Todo> => {
  const response = await fetch(`${API_URL}/db`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todo),
  });

  if (!response.ok) {
    throw new Error('Failed to create todo in MongoDB');
  }

  return response.json();
};

export const getTodosFromDB = async (): Promise<Todo[]> => {
  const response = await fetch(`${API_URL}/db`);

  if (!response.ok) {
    throw new Error('Failed to fetch todos from MongoDB');
  }

  return response.json();
};

export const indexTodoInES = async (todo: CreateTodoRequest): Promise<Todo> => {
  const response = await fetch(`${API_URL}/es`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todo),
  });

  if (!response.ok) {
    throw new Error('Failed to index todo in Elasticsearch');
  }

  return response.json();
};

// Direct Elasticsearch search
export const searchTodosInES = async (query?: string): Promise<Todo[]> => {
  const searchQuery = query
    ? {
        query: {
          wildcard: {
            title: {
              value: `*${query}*`,
              case_insensitive: true,
            },
          },
        },
      }
    : {
        query: {
          match_all: {},
        },
      };

  const response = await fetch(`${ES_URL}/${ES_INDEX}/_search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...searchQuery,
      size: 100,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to search todos in Elasticsearch');
  }

  const data = await response.json();
  return data.hits.hits.map((hit: any) => hit._source);
};

