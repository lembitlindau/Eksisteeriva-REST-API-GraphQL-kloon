const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const User = require('./models/User');
const Article = require('./models/Article');
const Tag = require('./models/Tag');
const { generateToken, requireAuth } = require('./context');

// Custom DateTime scalar
const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  serialize: (value) => value.toISOString(),
  parseValue: (value) => new Date(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const resolvers = {
  DateTime,
  
  Query: {
    // User queries
    users: async () => {
      return await User.find().sort({ createdAt: -1 });
    },
    
    user: async (_, { id }) => {
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    },
    
    me: async (_, __, { user }) => {
      requireAuth(user);
      return user;
    },
    
    // Article queries
    articles: async () => {
      return await Article.find().sort({ createdAt: -1 });
    },
    
    article: async (_, { id }) => {
      const article = await Article.findById(id);
      if (!article) {
        throw new Error('Article not found');
      }
      return article;
    },
    
    // Tag queries
    tags: async () => {
      return await Tag.find().sort({ name: 1 });
    },
    
    tag: async (_, { id }) => {
      const tag = await Tag.findById(id);
      if (!tag) {
        throw new Error('Tag not found');
      }
      return tag;
    },
    
    articleTags: async (_, { articleId }) => {
      const article = await Article.findById(articleId).populate('tags');
      if (!article) {
        throw new Error('Article not found');
      }
      return article.tags;
    }
  },
  
  Mutation: {
    // Authentication
    login: async (_, { input }) => {
      const { email, password } = input;
      
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      const isValid = await user.comparePassword(password);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }
      
      const token = generateToken(user._id);
      
      return {
        token,
        user
      };
    },
    
    logout: async (_, __, { user }) => {
      requireAuth(user);
      // In a real implementation, you might invalidate the token
      // For now, we just return true as logout is handled client-side
      return true;
    },
    
    // User mutations
    createUser: async (_, { input }) => {
      try {
        const user = new User(input);
        await user.save();
        return user;
      } catch (error) {
        if (error.code === 11000) {
          const field = Object.keys(error.keyPattern)[0];
          throw new Error(`${field} already exists`);
        }
        throw new Error(error.message);
      }
    },
    
    updateUser: async (_, { id, input }, { user }) => {
      requireAuth(user);
      
      // Users can only update their own profile
      if (user._id.toString() !== id) {
        throw new Error('Unauthorized');
      }
      
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );
      
      if (!updatedUser) {
        throw new Error('User not found');
      }
      
      return updatedUser;
    },
    
    deleteUser: async (_, { id }, { user }) => {
      requireAuth(user);
      
      // Users can only delete their own profile
      if (user._id.toString() !== id) {
        throw new Error('Unauthorized');
      }
      
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        throw new Error('User not found');
      }
      
      // Also delete user's articles
      await Article.deleteMany({ authorId: id });
      
      return true;
    },
    
    // Article mutations
    createArticle: async (_, { input }, { user }) => {
      requireAuth(user);
      
      const { tagIds, ...articleData } = input;
      
      // Verify all tags exist
      if (tagIds && tagIds.length > 0) {
        const existingTags = await Tag.find({ _id: { $in: tagIds } });
        if (existingTags.length !== tagIds.length) {
          throw new Error('One or more tags not found');
        }
      }
      
      const article = new Article({
        ...articleData,
        authorId: user._id,
        tags: tagIds || []
      });
      
      await article.save();
      return await Article.findById(article._id);
    },
    
    updateArticle: async (_, { id, input }, { user }) => {
      requireAuth(user);
      
      const article = await Article.findById(id);
      if (!article) {
        throw new Error('Article not found');
      }
      
      // Only the author can update the article
      if (article.authorId.toString() !== user._id.toString()) {
        throw new Error('Unauthorized');
      }
      
      const { tagIds, ...updateData } = input;
      
      // Verify all tags exist if tagIds provided
      if (tagIds && tagIds.length > 0) {
        const existingTags = await Tag.find({ _id: { $in: tagIds } });
        if (existingTags.length !== tagIds.length) {
          throw new Error('One or more tags not found');
        }
        updateData.tags = tagIds;
      }
      
      const updatedArticle = await Article.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      return updatedArticle;
    },
    
    deleteArticle: async (_, { id }, { user }) => {
      requireAuth(user);
      
      const article = await Article.findById(id);
      if (!article) {
        throw new Error('Article not found');
      }
      
      // Only the author can delete the article
      if (article.authorId.toString() !== user._id.toString()) {
        throw new Error('Unauthorized');
      }
      
      await Article.findByIdAndDelete(id);
      return true;
    },
    
    // Tag mutations
    createTag: async (_, { input }, { user }) => {
      requireAuth(user);
      
      try {
        const tag = new Tag(input);
        await tag.save();
        return tag;
      } catch (error) {
        if (error.code === 11000) {
          throw new Error('Tag name already exists');
        }
        throw new Error(error.message);
      }
    },
    
    updateTag: async (_, { id, input }, { user }) => {
      requireAuth(user);
      
      const updatedTag = await Tag.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );
      
      if (!updatedTag) {
        throw new Error('Tag not found');
      }
      
      return updatedTag;
    },
    
    deleteTag: async (_, { id }, { user }) => {
      requireAuth(user);
      
      const deletedTag = await Tag.findByIdAndDelete(id);
      if (!deletedTag) {
        throw new Error('Tag not found');
      }
      
      // Remove tag from all articles
      await Article.updateMany(
        { tags: id },
        { $pull: { tags: id } }
      );
      
      return true;
    },
    
    // Article-Tag associations
    addTagsToArticle: async (_, { articleId, tagIds }, { user }) => {
      requireAuth(user);
      
      const article = await Article.findById(articleId);
      if (!article) {
        throw new Error('Article not found');
      }
      
      // Only the author can modify the article
      if (article.authorId.toString() !== user._id.toString()) {
        throw new Error('Unauthorized');
      }
      
      // Verify all tags exist
      const existingTags = await Tag.find({ _id: { $in: tagIds } });
      if (existingTags.length !== tagIds.length) {
        throw new Error('One or more tags not found');
      }
      
      // Add tags that aren't already associated
      const updatedArticle = await Article.findByIdAndUpdate(
        articleId,
        { $addToSet: { tags: { $each: tagIds } } },
        { new: true }
      );
      
      return updatedArticle;
    },
    
    removeTagsFromArticle: async (_, { articleId, tagIds }, { user }) => {
      requireAuth(user);
      
      const article = await Article.findById(articleId);
      if (!article) {
        throw new Error('Article not found');
      }
      
      // Only the author can modify the article
      if (article.authorId.toString() !== user._id.toString()) {
        throw new Error('Unauthorized');
      }
      
      const updatedArticle = await Article.findByIdAndUpdate(
        articleId,
        { $pull: { tags: { $in: tagIds } } },
        { new: true }
      );
      
      return updatedArticle;
    }
  },
  
  // Field resolvers
  Article: {
    author: async (article) => {
      return await User.findById(article.authorId);
    }
  },
  
  Tag: {
    articles: async (tag) => {
      return await Article.find({ tags: tag._id });
    }
  }
};

module.exports = resolvers;
