import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    author: String,
    content: String
});

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  comments: { type: [ CommentSchema ], default: [] }
});

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

export default Post;