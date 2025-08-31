const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const mongoose = require('mongoose');
const { readFileSync } = require('fs');
const { join } = require('path');
require('dotenv').config();

const resolvers = require('./resolvers');
const { createContext } = require('./context');

async function startServer() {
  const app = express();
  
  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medium-clone-graphql');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }

  // Read GraphQL schema
  const typeDefs = readFileSync(join(__dirname, '../schema/schema.graphql'), 'utf8');

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
  });

  await server.start();

  // Apply middleware
  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: createContext,
    })
  );

  const PORT = process.env.PORT || 4000;
  
  app.listen(PORT, () => {
    console.log(`🚀 GraphQL Server ready at http://localhost:${PORT}/graphql`);
    console.log(`📖 GraphQL Studio available at https://studio.apollographql.com/sandbox/explorer`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
  process.exit(1);
});
