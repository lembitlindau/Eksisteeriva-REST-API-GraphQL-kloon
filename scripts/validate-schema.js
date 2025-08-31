const { buildSchema, validate, parse } = require('graphql');
const { readFileSync } = require('fs');
const { join } = require('path');

console.log('🔍 Validating GraphQL Schema...');

try {
  // Read the schema file
  const schemaPath = join(__dirname, '../schema/schema.graphql');
  const typeDefs = readFileSync(schemaPath, 'utf8');
  
  // Parse and validate the schema
  const schema = buildSchema(typeDefs);
  
  console.log('✅ GraphQL Schema is valid!');
  console.log('📋 Schema contains the following types:');
  
  const typeMap = schema.getTypeMap();
  Object.keys(typeMap)
    .filter(name => !name.startsWith('__'))
    .forEach(typeName => {
      const type = typeMap[typeName];
      console.log(`   - ${typeName} (${type.constructor.name})`);
    });
    
  console.log('\n🎯 Validation complete - Schema ready for use!');
  
} catch (error) {
  console.error('❌ Schema validation failed:', error.message);
  process.exit(1);
}
