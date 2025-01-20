'use client';
import React from 'react';
import { Comment, Post } from '@/logic/types';

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

const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp(name + '=([^;]+)'));
    return match ? match[1] : '';
}

const postsReducer = (state: Post[], action: actions) => {
    switch (action.type) {
        case 'add':
            return [ ...state, action.post ];
        case 'concat':
            return [ ...state, ...action.posts ];
        case 'comment':
            return state.map<Post>((post) =>
                post._id === action.postId
                ?   { ...post, comments: [ ...post.comments, action.comment ] }
                :   post
            );
        case 'delete':
            return state.filter((post) => post._id !== action.postId);
    };
};

const Page = () => {
    const [ personalPosts, setPersonalPosts ] = React.useReducer<Post[], [ actions: actions ]>(postsReducer, []);
    const [ posts, setPosts ] = React.useReducer<Post[], [ actions: actions ]>(postsReducer, []);
    const username = React.useMemo(() => getCookie('name'), [ document.cookie ]);

    React.useEffect(() => {
        fetch('/api/blog?personal=false')
            .then(response => response.json())
            .then((posts: Post[]) => setPosts({ type: 'concat', posts }))
            .catch(console.error);

        fetch('/api/blog?personal=true')
            .then(response => response.json())
            .then((posts: Post[]) => setPersonalPosts({ type: 'concat', posts }))
            .catch(console.error);
    }, []);

    const createAPost = (form: FormData) => {
        const title = form.get('title') as string;
        const content = form.get('content') as string;

        if (!title || !content) return;

        fetch('/api/blog?type=create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        })
            .then(response => response.json())
            .then(({ _id }: { _id: string }) => setPersonalPosts({ type: 'add', post: {
                _id,
                title,
                content,
                comments: [],
                author: username
            } }))
    };

    return (
        <div>
            <h1>Create a post</h1>
            <form action={ createAPost } style={ { display: 'flex', flexDirection: 'column', maxWidth: '20rem', gap: '0.5rem' } }>
                <input name='title' type='text' placeholder='Title' />
                <textarea name='content' placeholder='Content'></textarea>
                <button>Create</button>
            </form>
            <h1>Your posts</h1>
            {
                personalPosts.length !== 0
                ?   personalPosts.map((post) => (
                        <div key={ post._id }>
                            <h2>{ post.title }</h2>
                            <p>{ post.content }</p>
                            <ul>
                            { // i recently learned I shouldn't use index as key, but I couldn't give less of a damn
                                post.comments.map((comment, index) => (
                                    <li key={ index }><p>{ comment.content }</p></li>
                                ))
                            }
                            </ul>
                            <button onClick={ () =>
                                fetch(`/api/blog?type=delete&id=${ encodeURIComponent(post._id) }`, { method: 'POST' })
                                    .then(response =>
                                        response.ok
                                        ?   setPersonalPosts({ type: 'delete', postId: post._id })
                                        :   console.error
                                    )
                            }>Delete</button>
                        </div>
                    ))
                :   <p>You have no posts</p>
            }
            <h1>Posts</h1>
            {
                posts.length !== 0
                ?   posts.map((post) => (
                        <div key={ post._id }>
                            <h2>{ post.title }</h2>
                            <p>{ post.content }</p>
                        </div>
                    ))
                :   <p>No posts</p>
            }
        </div>
    );
};

export default Page;