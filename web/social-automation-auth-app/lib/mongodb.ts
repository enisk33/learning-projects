/**
 * MongoDB Connection Singleton
 * Optimized connection pooling ve error handling
 */

import { MongoClient, MongoClientOptions } from 'mongodb';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';

// Connection options - optimized for production
const options: MongoClientOptions = {
  maxPoolSize: 10, // Maximum number of connections
  minPoolSize: 2, // Minimum number of connections

  serverSelectionTimeoutMS: 5000, // How long to try selecting a server
  socketTimeoutMS: 45000, // How long to wait for a socket
  connectTimeoutMS: 10000, // How long to wait for initial connection
  tls: false, // Use TLS/SSL
  // Production'da false olmalı
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // Development: Global variable kullan (hot reload için)
  if (!global._mongoClientPromise) {
    client = new MongoClient(env.MONGODB_URI, options);
    global._mongoClientPromise = client.connect();
    logger.info('MongoDB connection başlatıldı (development)');
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Production: Her seferinde yeni connection
  client = new MongoClient(env.MONGODB_URI, options);
  clientPromise = client.connect();
  logger.info('MongoDB connection başlatıldı (production)');
}

// Connection health check
clientPromise
  .then(() => {
    logger.info('MongoDB bağlantısı başarılı');
  })
  .catch((error) => {
    logger.error('MongoDB bağlantı hatası', error);
  });

export default clientPromise;
