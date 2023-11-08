import { Document, model, Schema } from "mongoose";
import { TComment } from "./type/Comment";

export interface IComment extends TComment, Document {};

const commentSchema: Schema = new Schema({
        comments: [
            {
                postId: {
                    type: String,
                    required: true,
                },
                author: {
                    authorId: {
                        type: String,
                        required: true,
                    },
                    userName: {
                        type: String,
                        required: true,
                    },
                    avatar: {
                        type: String,
                    }
                },
                description: {
                    type: String,
                    required: true,
                },
                comment_like_count: {
                    type: [String],
                    default: []
                },
                comment_reply: {
                    user: {
                        userId: {
                            type: String,
                            required: true,
                        },
                        userName: {
                            type: String,
                            required: true
                        },
                        avatar: {
                            type: String,
                        }
                    },
                    description: {
                        type: String,
                        required: true
                    },
                    reply_like_count: {
                        type: Number,
                        default: 0
                    }
                }
            }
        ]
    },
    { timestamps: true }
);

const Comment = model<IComment>("Comment", commentSchema);

export default Comment;