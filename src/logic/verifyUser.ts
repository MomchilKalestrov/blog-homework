import User from '@/logic/mongoose/user';
import connect from '@/logic/mongoose/connect';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const verifyUser = async () => {
    const cookie = await cookies();
    const name = cookie.get('name')?.value;
    const password = cookie.get('password')?.value;

    
    if (!name || !password) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    await connect();
    const userExist = await User.find({ name, password });
    if (!userExist.length) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return undefined;
};

export default verifyUser;