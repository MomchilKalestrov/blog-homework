interface Comment {
    _id: string;
    author: string;
    content: string;
};

interface Post {
    _id: string;
    title: string;
    content: string;
    author: string;
    comments: Comment[];
};

export type { Comment, Post };