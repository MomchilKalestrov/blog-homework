'use client';
import React from 'react';
import { useCookies } from 'next-client-cookies';

import { Comment, Post } from '@/logic/types';
import PostComponent from '@/components/post';

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
    const cookies = useCookies();
    const username = cookies.get('name');

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

        if (!title || !content || !username) return;

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

    const loadMore = (personal: boolean) => {
        const skip = personal ? personalPosts.length : posts.length;

        fetch(`/api/blog?personal=${ personal }&skip=${ skip }`)
            .then(response => response.json())
            .then((posts: Post[]) => personal ? setPersonalPosts({ type: 'concat', posts }) : setPosts({ type: 'concat', posts }))
    }

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
                        <PostComponent key={ post._id } personal={ true } post={ post } dispatch={ setPersonalPosts } />
                    ))
                :   <p>You have no posts</p>
            }
            <button onClick={ () => loadMore(true)}>Load more</button>
            <h1>Posts</h1>
            {
                posts.length !== 0
                ?   posts.map((post) => (
                        <PostComponent key={ post._id } personal={ false } post={ post } dispatch={ setPersonalPosts } />
                    ))
                :   <p>No posts</p>
            }
            <button onClick={ () => loadMore(false)}>Load more</button>
        </div>
    );
};

export default Page;