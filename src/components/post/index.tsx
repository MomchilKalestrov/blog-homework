import React from 'react';
import { useCookies } from 'next-client-cookies';

import type { Comment, Post } from '@/logic/types';

type actions = {
    type: 'add',
    post: Post
} | {
    type: 'concat',
    posts: Post[]
} | {
    type: 'comment',
    postId: string,
    comment: Comment
} | {
    type: 'delete',
    postId: string
};

type PostProps = {
    personal: boolean;
    post: Post;
    dispatch: React.Dispatch<actions>;
};

let counter = 0;

const PostComponent: React.FC<PostProps> = ({ personal, post, dispatch }) => {
    const cookies = useCookies();
    const commentInputRef = React.useRef<HTMLInputElement>(null);

    const handleComment = () => {
        const author = cookies.get('name');
        const comment = commentInputRef.current?.value;

        if (!comment || comment.length === 0 || !author) return;

        fetch(`/api/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                _id: post._id,
                content: comment
            })
        }).then(response => {
            if (!response.ok) return;

            dispatch({
                type: 'comment',
                postId: post._id,
                comment: { content: comment, author, _id: `${ counter++ }` }
            });
        });
    };

    const handleDelete = () =>
        fetch(`/api/blog?type=delete&id=${ encodeURIComponent(post._id) }`, { method: 'POST' })
            .then(response =>
                response.ok
                ?   dispatch({ type: 'delete', postId: post._id })
                :   console.error
            );

    return (
        <div key={ post._id }>
            <h2>{ post.title }</h2>
            <p>{ post.content }</p>
            <p><b>Author: </b>{ post.author }</p>
            <h3>Comments</h3>
            {
                post.comments.length !== 0
                ?   post.comments.map((comment) => (
                        <p key={ comment._id }>
                            <b>{ comment.author }: </b>{ comment.content }
                        </p>
                    ))
                :   <p>No comments yet!</p>
            }
            {
                personal
                ?   <button onClick={ handleDelete }>Delete</button>
                :   <><input ref={ commentInputRef } /><button onClick={ handleComment }>Comment</button></>
            }
        </div>
    );
};

export default PostComponent;