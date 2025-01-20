import User from '@/logic/mongoose/user';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const verifyUser = async () => {
    const cookie = await cookies();
    const name = cookie.get('name')?.value;
    const password = cookie.get('password')?.value;

    if (!name || !password) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userExist = await User.find({ name, password });
    if (!userExist.length) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return undefined;
};

export default verifyUser;