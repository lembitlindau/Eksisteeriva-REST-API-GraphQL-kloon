#!/bin/bash

# GraphQL Client Example Script
# This script demonstrates all the GraphQL operations

GRAPHQL_ENDPOINT="http://localhost:4000/graphql"

echo "🔬 Medium Clone GraphQL API Client Examples"
echo "============================================="

# Function to make GraphQL requests
graphql_request() {
    local query="$1"
    local variables="$2"
    local token="$3"
    
    local headers='{"Content-Type": "application/json"}'
    if [ ! -z "$token" ]; then
        headers='{"Content-Type": "application/json", "Authorization": "Bearer '"$token"'"}'
    fi
    
    curl -s -X POST \
        -H "Content-Type: application/json" \
        ${token:+-H "Authorization: Bearer $token"} \
        -d "{\"query\":\"$query\"${variables:+,\"variables\":$variables}}" \
        "$GRAPHQL_ENDPOINT" | jq '.'
}

# Test server availability
echo "🔍 Testing server availability..."
response=$(curl -s -w "%{http_code}" -o /dev/null "$GRAPHQL_ENDPOINT")
if [ "$response" != "200" ]; then
    echo "❌ GraphQL server is not running at $GRAPHQL_ENDPOINT"
    echo "Please start the server first with ./scripts/run.sh"
    exit 1
fi
echo "✅ Server is running"

echo ""
echo "1. 👤 Creating a test user..."
CREATE_USER_QUERY='
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    username
    email
    bio
    avatar
    createdAt
  }
}'

CREATE_USER_VARIABLES='{
  "input": {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "bio": "Test user for GraphQL API",
    "avatar": "https://example.com/avatar.jpg"
  }
}'

echo "Query: $CREATE_USER_QUERY"
echo "Variables: $CREATE_USER_VARIABLES"
user_response=$(graphql_request "$CREATE_USER_QUERY" "$CREATE_USER_VARIABLES")
echo "Response:"
echo "$user_response"

echo ""
echo "2. 🔐 Logging in..."
LOGIN_QUERY='
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      username
      email
    }
  }
}'

LOGIN_VARIABLES='{
  "input": {
    "email": "test@example.com",
    "password": "password123"
  }
}'

echo "Query: $LOGIN_QUERY"
echo "Variables: $LOGIN_VARIABLES"
login_response=$(graphql_request "$LOGIN_QUERY" "$LOGIN_VARIABLES")
echo "Response:"
echo "$login_response"

# Extract token for authenticated requests
TOKEN=$(echo "$login_response" | jq -r '.data.login.token // empty')
USER_ID=$(echo "$login_response" | jq -r '.data.login.user.id // empty')

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get authentication token"
    exit 1
fi

echo ""
echo "3. 🏷️ Creating tags..."
CREATE_TAG_QUERY='
mutation CreateTag($input: CreateTagInput!) {
  createTag(input: $input) {
    id
    name
    description
    createdAt
  }
}'

for tag_data in '{"name": "javascript", "description": "JavaScript programming language"}' '{"name": "graphql", "description": "GraphQL query language"}'; do
    CREATE_TAG_VARIABLES='{"input": '$tag_data'}'
    echo "Creating tag with variables: $CREATE_TAG_VARIABLES"
    tag_response=$(graphql_request "$CREATE_TAG_QUERY" "$CREATE_TAG_VARIABLES" "$TOKEN")
    echo "Response: $tag_response"
    echo ""
done

echo ""
echo "4. 📝 Creating an article..."
CREATE_ARTICLE_QUERY='
mutation CreateArticle($input: CreateArticleInput!) {
  createArticle(input: $input) {
    id
    title
    content
    author {
      username
    }
    tags {
      name
    }
    createdAt
  }
}'

# Get tag IDs first
GET_TAGS_QUERY='
query GetTags {
  tags {
    id
    name
  }
}'

tags_response=$(graphql_request "$GET_TAGS_QUERY" "" "$TOKEN")
echo "Available tags: $tags_response"

TAG_IDS=$(echo "$tags_response" | jq -r '.data.tags[].id' | head -2 | tr '\n' ',' | sed 's/,$//')
TAG_IDS_ARRAY='["'$(echo "$TAG_IDS" | sed 's/,/","/g')'"]'

CREATE_ARTICLE_VARIABLES='{
  "input": {
    "title": "Getting Started with GraphQL",
    "content": "GraphQL is a powerful query language that allows you to request exactly the data you need. This article explores the basics of GraphQL and how to implement it effectively.",
    "tagIds": '$TAG_IDS_ARRAY'
  }
}'

echo "Query: $CREATE_ARTICLE_QUERY"
echo "Variables: $CREATE_ARTICLE_VARIABLES"
article_response=$(graphql_request "$CREATE_ARTICLE_QUERY" "$CREATE_ARTICLE_VARIABLES" "$TOKEN")
echo "Response:"
echo "$article_response"

ARTICLE_ID=$(echo "$article_response" | jq -r '.data.createArticle.id // empty')

echo ""
echo "5. 📚 Querying all articles..."
GET_ARTICLES_QUERY='
query GetArticles {
  articles {
    id
    title
    content
    author {
      username
      email
    }
    tags {
      name
      description
    }
    createdAt
  }
}'

echo "Query: $GET_ARTICLES_QUERY"
articles_response=$(graphql_request "$GET_ARTICLES_QUERY")
echo "Response:"
echo "$articles_response"

echo ""
echo "6. 👥 Querying all users..."
GET_USERS_QUERY='
query GetUsers {
  users {
    id
    username
    email
    bio
    avatar
    createdAt
  }
}'

echo "Query: $GET_USERS_QUERY"
users_response=$(graphql_request "$GET_USERS_QUERY")
echo "Response:"
echo "$users_response"

echo ""
echo "7. 🏷️ Querying all tags..."
echo "Query: $GET_TAGS_QUERY"
all_tags_response=$(graphql_request "$GET_TAGS_QUERY")
echo "Response:"
echo "$all_tags_response"

echo ""
echo "8. 🔍 Getting current user info..."
ME_QUERY='
query Me {
  me {
    id
    username
    email
    bio
    avatar
  }
}'

echo "Query: $ME_QUERY"
me_response=$(graphql_request "$ME_QUERY" "" "$TOKEN")
echo "Response:"
echo "$me_response"

echo ""
echo "9. ✏️ Updating the article..."
if [ ! -z "$ARTICLE_ID" ]; then
    UPDATE_ARTICLE_QUERY='
    mutation UpdateArticle($id: ID!, $input: UpdateArticleInput!) {
      updateArticle(id: $id, input: $input) {
        id
        title
        content
        updatedAt
      }
    }'

    UPDATE_ARTICLE_VARIABLES='{
      "id": "'$ARTICLE_ID'",
      "input": {
        "title": "Advanced GraphQL Concepts",
        "content": "This updated article now covers advanced GraphQL concepts including resolvers, mutations, and subscriptions."
      }
    }'

    echo "Query: $UPDATE_ARTICLE_QUERY"
    echo "Variables: $UPDATE_ARTICLE_VARIABLES"
    update_response=$(graphql_request "$UPDATE_ARTICLE_QUERY" "$UPDATE_ARTICLE_VARIABLES" "$TOKEN")
    echo "Response:"
    echo "$update_response"
fi

echo ""
echo "10. 🚪 Logging out..."
LOGOUT_QUERY='
mutation Logout {
  logout
}'

echo "Query: $LOGOUT_QUERY"
logout_response=$(graphql_request "$LOGOUT_QUERY" "" "$TOKEN")
echo "Response:"
echo "$logout_response"

echo ""
echo "✅ All GraphQL operations completed successfully!"
echo "🎉 The GraphQL API is working correctly!"
