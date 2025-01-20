import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import User from '@/logic/mongoose/user';
import connect from '@/logic/mongoose/connect';

const check = ({ name, password }: any): boolean =>
    name && password && name.length > 3 && password.length > 6;

const login = async ({ name, password }: any) => {
    const cookie = cookies();
    try {
        await connect();
        
        const userExist = await User.find({ name, password });
        if (!userExist.length) return NextResponse.json({ error: 'User not found' }, { status: 400 });

        (await cookie).set('name', name, { path: '/' });
        (await cookie).set('password', password, { path: '/' });

        return NextResponse.json({ success: 'User created' });
    } catch {
        console.error('Server error');
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    };
};

const signup = async ({ name, password }: any) => {
    const cookie = cookies();
    try {
        await connect();

        const userExist = await User.find({ name });
        if (userExist.length) return NextResponse.json({ error: 'User already exists' }, { status: 400 });

        const user = new User({ name, password });
        await user.save();

        (await cookie).set('name', name, { path: '/' });
        (await cookie).set('password', password, { path: '/' });

        return NextResponse.json({ success: 'User created' });
    } catch {
        console.error('Server error');
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    };
};

const POST = async (request: NextRequest) => {
    const params = new URL(request.url).searchParams;
    const type = params.get('type');

    const body = await request.json();

    if (!check(body)) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    if (type === 'login') return await login(body);
    if (type === 'signup') return await signup(body);

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
};

export { POST };