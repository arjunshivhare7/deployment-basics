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

export const connectElasticsearch = async () => {
  try {
    const esConfig = config.getElasticsearchConfig();
    console.log(`🔗 Connecting to Elasticsearch at: ${esConfig.node}`);
    
    esClient = new Client({
      node: esConfig.node,
      maxRetries: esConfig.maxRetries,
      requestTimeout: esConfig.requestTimeout,
    });
    
    // Test the connection
    try {
      const pingResult = await esClient.ping();
      console.log('✅ Elasticsearch client initialized and connected');
      console.log(`   Ping result: ${pingResult}`);
    } catch (pingError) {
      console.error('❌ Elasticsearch ping failed:', pingError.message);
      throw pingError;
    }
    
    return esClient;
  } catch (error) {
    console.error('❌ Elasticsearch connection error:', error);
    console.error('   Error details:', {
      message: error.message,
      stack: error.stack,
      meta: error.meta,
    });
    throw error;
  }
};

export const getElasticsearchClient = () => {
  if (!esClient) {
    const esConfig = config.getElasticsearchConfig();
    console.error('❌ Elasticsearch client not initialized!');
    console.error(`   Expected to connect to: ${esConfig.node}`);
    console.error('   Make sure connectElasticsearch() is called during server startup');
    throw new Error('Elasticsearch client is not initialized. Call connectElasticsearch() first.');
  }
  return esClient;
};

export const getMongoConnection = () => {
  return mongoConnection;
};

