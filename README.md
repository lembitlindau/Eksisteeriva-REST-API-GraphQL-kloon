# Medium Clone GraphQL API

A GraphQL implementation of the Medium clone API, providing identical functionality to the original REST API through a modern GraphQL interface.

## 📋 Overview

This project converts the existing [Medium clone REST API](https://github.com/lembitlindau/Medium-clone-API) to GraphQL while maintaining complete functional equivalence. The GraphQL API supports all the same operations as the REST version including user management, article CRUD operations, tag management, and authentication.

## 🚀 Features

- **Complete GraphQL Schema**: All REST endpoints mapped to GraphQL queries and mutations
- **Authentication**: JWT-based authentication with bearer token support
- **User Management**: User registration, login, profile updates, and deletion
- **Article Management**: Create, read, update, and delete articles with tag associations
- **Tag System**: Tag creation and management with article associations
- **Introspection**: Full GraphQL introspection support for development tools
- **Error Handling**: Proper GraphQL error responses for all failure cases

## 🛠 Technology Stack

- **Node.js** - Runtime environment
- **Apollo Server Express** - GraphQL server implementation
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Docker** - MongoDB containerization

## 📁 Project Structure

```
/project-root
├── schema/                 # GraphQL schema definition files
│   └── schema.graphql     # Main GraphQL SDL file
├── src/                   # Source code
│   ├── index.js          # Main server file
│   ├── resolvers.js      # GraphQL resolvers
│   ├── context.js        # Authentication context
│   └── models/           # Mongoose models
│       ├── User.js
│       ├── Article.js
│       └── Tag.js
├── scripts/
│   └── run.sh            # Server startup script
├── client/
│   └── example.sh        # Client usage examples
├── tests/
│   └── test.sh           # Automated tests
├── docker-compose.yml    # MongoDB setup
├── package.json          # Node.js dependencies
├── .env.example          # Environment template
└── README.md
```

## 🏗 Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- npm
- Docker and Docker Compose (for MongoDB)
- curl and jq (for testing scripts)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Eksisteeriva-REST-API-GraphQL-kloon
   ```

2. **Run the application**
   ```bash
   ./scripts/run.sh
   ```

   This script will:
   - Install all dependencies
   - Set up environment variables
   - Start MongoDB with Docker
   - Launch the GraphQL server

3. **Access the GraphQL Playground**
   
   Open your browser and navigate to: `http://localhost:4000/graphql`

### Manual Setup

If you prefer manual setup:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**
   ```bash
   docker-compose up -d
   ```

4. **Start the server**
   ```bash
   npm start
   ```

## 🔧 Configuration

Environment variables (`.env` file):

```env
MONGODB_URI=mongodb://localhost:27017/medium-clone-graphql
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=4000
NODE_ENV=development
```

## 📖 API Usage

### Authentication

All mutations requiring authentication need a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Example Queries

#### User Registration
```graphql
mutation CreateUser {
  createUser(input: {
    username: "johndoe"
    email: "john@example.com"
    password: "securepassword"
    bio: "Software developer"
    avatar: "https://example.com/avatar.jpg"
  }) {
    id
    username
    email
    bio
  }
}
```

#### Login
```graphql
mutation Login {
  login(input: {
    email: "john@example.com"
    password: "securepassword"
  }) {
    token
    user {
      id
      username
      email
    }
  }
}
```

#### Create Article
```graphql
mutation CreateArticle {
  createArticle(input: {
    title: "Getting Started with GraphQL"
    content: "GraphQL is a powerful query language..."
    tagIds: ["tag-id-1", "tag-id-2"]
  }) {
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
}
```

#### Query Articles
```graphql
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
}
```

## 🧪 Testing

### Run Client Examples

Execute all example operations:

```bash
./client/example.sh
```

This script demonstrates:
- User creation and authentication
- Tag creation and management
- Article creation and updates
- All query operations

### Run Automated Tests

Execute the full test suite:

```bash
./tests/test.sh
```

The test suite validates:
- ✅ GraphQL SDL validation and introspection
- ✅ All REST endpoints have GraphQL equivalents
- ✅ Service startup functionality
- ✅ All operations work correctly
- ✅ Response structures match SDL types
- ✅ Proper error handling
- ✅ Documentation completeness

## 🔍 GraphQL Schema Overview

### Types

- **User**: User accounts with authentication
- **Article**: Blog posts with author and tag relationships
- **Tag**: Category tags for articles
- **AuthPayload**: Login response with token and user data

### Queries

- `users`: Get all users
- `user(id)`: Get user by ID
- `me`: Get current authenticated user
- `articles`: Get all articles
- `article(id)`: Get article by ID
- `tags`: Get all tags
- `tag(id)`: Get tag by ID
- `articleTags(articleId)`: Get tags for specific article

### Mutations

- **Authentication**: `login`, `logout`
- **User Management**: `createUser`, `updateUser`, `deleteUser`
- **Article Management**: `createArticle`, `updateArticle`, `deleteArticle`
- **Tag Management**: `createTag`, `updateTag`, `deleteTag`
- **Tag-Article Relations**: `addTagsToArticle`, `removeTagsFromArticle`

## 🔄 REST to GraphQL Mapping

| REST Endpoint | HTTP Method | GraphQL Operation |
|---------------|-------------|-------------------|
| `/sessions` | POST | `login` mutation |
| `/sessions` | DELETE | `logout` mutation |
| `/users` | GET | `users` query |
| `/users` | POST | `createUser` mutation |
| `/users/{id}` | GET | `user(id)` query |
| `/users/{id}` | PUT/PATCH | `updateUser` mutation |
| `/users/{id}` | DELETE | `deleteUser` mutation |
| `/articles` | GET | `articles` query |
| `/articles` | POST | `createArticle` mutation |
| `/articles/{id}` | GET | `article(id)` query |
| `/articles/{id}` | PUT/PATCH | `updateArticle` mutation |
| `/articles/{id}` | DELETE | `deleteArticle` mutation |
| `/tags` | GET | `tags` query |
| `/tags` | POST | `createTag` mutation |
| `/tags/{id}` | GET | `tag(id)` query |
| `/tags/{id}` | PUT/PATCH | `updateTag` mutation |
| `/tags/{id}` | DELETE | `deleteTag` mutation |
| `/articles/{id}/tags` | GET | `articleTags(articleId)` query |
| `/articles/{id}/tags` | POST | `addTagsToArticle` mutation |
| `/articles/{id}/tags` | DELETE | `removeTagsFromArticle` mutation |

## 🚦 Error Handling

The GraphQL API provides structured error responses following GraphQL standards:

```json
{
  "data": null,
  "errors": [
    {
      "message": "User not found",
      "locations": [...],
      "path": [...]
    }
  ]
}
```

Common error scenarios:
- **Authentication errors**: Invalid credentials, missing tokens
- **Authorization errors**: Insufficient permissions
- **Validation errors**: Invalid input data
- **Not found errors**: Requested resources don't exist
- **Duplicate errors**: Unique constraint violations

## 🏃‍♂️ Development

### Start in Development Mode

```bash
npm run dev
```

This uses nodemon for automatic server restart on file changes.

### Database Management

The application uses MongoDB with Mongoose ODM. The database will be automatically created when the server starts.

To reset the database:
```bash
docker-compose down -v
docker-compose up -d
```

## 🔒 Security Considerations

- JWT tokens expire after 7 days
- Passwords are hashed using bcrypt
- Users can only modify their own data
- Input validation on all mutations
- MongoDB injection protection via Mongoose

## 📝 License

This project is for educational purposes as part of a course assignment.

## 🤝 Contributing

This is a course assignment project. Please refer to the original REST API repository for the base implementation.

---

**Note**: This GraphQL implementation provides identical functionality to the REST API while offering the benefits of GraphQL such as efficient data fetching, strong typing, and a single endpoint for all operations.