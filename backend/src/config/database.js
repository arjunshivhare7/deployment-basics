import mongoose from 'mongoose';
import { Client } from '@elastic/elasticsearch';
import config from './ConfigService.js';

let mongoConnection = null;
let esClient = null;

export const connectMongoDB = async () => {
  try {
    const mongoConfig = config.getMongoConfig();
    mongoConnection = await mongoose.connect(mongoConfig.uri);
    console.log('✅ MongoDB connected successfully');
    return mongoConnection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export const connectElasticsearch = () => {
  try {
    const esConfig = config.getElasticsearchConfig();
    esClient = new Client({
      node: esConfig.node,
      maxRetries: esConfig.maxRetries,
      requestTimeout: esConfig.requestTimeout,
    });
    console.log('✅ Elasticsearch client initialized');
    return esClient;
  } catch (error) {
    console.error('❌ Elasticsearch connection error:', error);
    throw error;
  }
};

export const getElasticsearchClient = () => {
  if (!esClient) {
    return connectElasticsearch();
  }
  return esClient;
};

export const getMongoConnection = () => {
  return mongoConnection;
};

