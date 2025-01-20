'use client';
import React from 'react';

const Page = () => {
    const nameRef = React.useRef<HTMLInputElement>(null);
    const passwordRef = React.useRef<HTMLInputElement>(null);

    const authenticate = (login: boolean) => {
        if (!nameRef.current || !passwordRef.current) return;

        const name = nameRef.current.value;
        const password = passwordRef.current.value;

        if (name === '' || password === '') return;

        fetch(`/api/auth?type=${ login ? 'login' : 'signup' }`, {
            method: 'POST',
            body: JSON.stringify({ name, password })
        }).then((response: any) => {
            if (response.ok) window.location.href = '/blog';
        });
    };

    return (
        <div style={ { display: 'flex', flexDirection: 'column', maxWidth: '20rem', gap: '0.5rem' } }>
            <h1 style={ { margin: '0px' } }>Authenticate</h1>
            <input ref={ nameRef } type="text" placeholder="Username" />
            <input ref={ passwordRef } type="password" placeholder="Password" />
            <div style={ { display: 'flex', gap: '0.5rem' } }>
                <button onClick={ () => authenticate(true) }>Log in</button>
                <button onClick={ () => authenticate(false) }>Sign up</button>
            </div>
        </div>
    )
};

export default Page;