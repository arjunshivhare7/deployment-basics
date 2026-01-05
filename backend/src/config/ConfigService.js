import dotenv from 'dotenv';

/**
 * Centralized Configuration Service
 * Loads configuration from environment variables with fallback to defaults
 */
class ConfigService {
  constructor() {
    // Load environment variables from .env file
    dotenv.config();
    
    this.config = {
      // Server Configuration
      port: this._getNumber('PORT', 3001),
      nodeEnv: this._getString('NODE_ENV', 'development'),
      
      // MongoDB Configuration
      mongodb: {
        uri: this._getString('MONGODB_URI', 'mongodb://localhost:27017/todos'),
        dbName: this._getString('MONGODB_DB_NAME', 'todos'),
      },
      
      // Elasticsearch Configuration
      elasticsearch: {
        node: this._getString('ELASTICSEARCH_NODE', 'http://localhost:9200'),
        indexName: this._getString('ELASTICSEARCH_INDEX', 'todos'),
        maxRetries: this._getNumber('ELASTICSEARCH_MAX_RETRIES', 3),
        requestTimeout: this._getNumber('ELASTICSEARCH_REQUEST_TIMEOUT', 30000),
      },
      
      // CORS Configuration
      cors: {
        origin: this._getString('CORS_ORIGIN', '*'),
        credentials: this._getBoolean('CORS_CREDENTIALS', false),
      },
      
      // Logging Configuration
      logging: {
        level: this._getString('LOG_LEVEL', 'info'),
      },
    };
    
    // Validate configuration on initialization
    this._validate();
  }
  
  /**
   * Get string value from environment with fallback
   * @private
   */
  _getString(key, defaultValue) {
    return process.env[key] || defaultValue;
  }
  
  /**
   * Get number value from environment with fallback
   * @private
   */
  _getNumber(key, defaultValue) {
    const value = process.env[key];
    if (value === undefined || value === '') {
      return defaultValue;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  
  /**
   * Get boolean value from environment with fallback
   * @private
   */
  _getBoolean(key, defaultValue) {
    const value = process.env[key];
    if (value === undefined || value === '') {
      return defaultValue;
    }
    return value === 'true' || value === '1';
  }
  
  /**
   * Validate configuration values
   * @private
   */
  _validate() {
    const errors = [];
    
    // Validate port
    if (this.config.port < 1 || this.config.port > 65535) {
      errors.push(`Invalid port: ${this.config.port}. Must be between 1 and 65535.`);
    }
    
    // Validate MongoDB URI format
    if (!this.config.mongodb.uri.startsWith('mongodb://') && 
        !this.config.mongodb.uri.startsWith('mongodb+srv://')) {
      errors.push(`Invalid MongoDB URI format: ${this.config.mongodb.uri}`);
    }
    
    // Validate Elasticsearch node format
    if (!this.config.elasticsearch.node.startsWith('http://') && 
        !this.config.elasticsearch.node.startsWith('https://')) {
      errors.push(`Invalid Elasticsearch node format: ${this.config.elasticsearch.node}`);
    }
    
    // Validate node environment
    const validEnvs = ['development', 'production', 'test'];
    if (!validEnvs.includes(this.config.nodeEnv)) {
      console.warn(`⚠️  Unknown NODE_ENV: ${this.config.nodeEnv}. Expected one of: ${validEnvs.join(', ')}`);
    }
    
    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
  }
  
  /**
   * Get server port
   */
  getPort() {
    return this.config.port;
  }
  
  /**
   * Get Node environment
   */
  getNodeEnv() {
    return this.config.nodeEnv;
  }
  
  /**
   * Check if running in production
   */
  isProduction() {
    return this.config.nodeEnv === 'production';
  }
  
  /**
   * Check if running in development
   */
  isDevelopment() {
    return this.config.nodeEnv === 'development';
  }
  
  /**
   * Check if running in test
   */
  isTest() {
    return this.config.nodeEnv === 'test';
  }
  
  /**
   * Get MongoDB configuration
   */
  getMongoConfig() {
    return this.config.mongodb;
  }
  
  /**
   * Get Elasticsearch configuration
   */
  getElasticsearchConfig() {
    return this.config.elasticsearch;
  }
  
  /**
   * Get CORS configuration
   */
  getCorsConfig() {
    return this.config.cors;
  }
  
  /**
   * Get logging configuration
   */
  getLoggingConfig() {
    return this.config.logging;
  }
  
  /**
   * Get entire configuration object
   */
  getAll() {
    return { ...this.config };
  }
  
  /**
   * Print configuration (hides sensitive data)
   */
  printConfig() {
    console.log('\n📋 Configuration:');
    console.log('─────────────────────────────────────');
    console.log(`Environment: ${this.config.nodeEnv}`);
    console.log(`Port: ${this.config.port}`);
    console.log(`MongoDB URI: ${this._maskUri(this.config.mongodb.uri)}`);
    console.log(`MongoDB DB: ${this.config.mongodb.dbName}`);
    console.log(`Elasticsearch Node: ${this.config.elasticsearch.node}`);
    console.log(`Elasticsearch Index: ${this.config.elasticsearch.indexName}`);
    console.log(`CORS Origin: ${this.config.cors.origin}`);
    console.log(`Log Level: ${this.config.logging.level}`);
    console.log('─────────────────────────────────────\n');
  }
  
  /**
   * Mask sensitive parts of URI
   * @private
   */
  _maskUri(uri) {
    try {
      const url = new URL(uri);
      if (url.password) {
        url.password = '****';
      }
      if (url.username) {
        url.username = '****';
      }
      return url.toString();
    } catch {
      return uri;
    }
  }
}

// Export singleton instance
export default new ConfigService();

