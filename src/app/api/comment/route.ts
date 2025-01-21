import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Post from '@/logic/mongoose/post';
import verifyUser from '@/logic/verifyUser';
import connect from '@/logic/mongoose/connect';

const POST = async (request: NextRequest) => {
    const verified = verifyUser();

    const cookie = cookies();

    if (await verified) return await verified;

    const { _id, content } = await request.json();

    if (!_id || !content) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    try {
        await connect();

        const a = await Post.updateOne(
            { _id },
            { $push: { comments: {
                content,
                author: (await cookie).get('name')?.value
            } } }
        );

        return NextResponse.json({ success: 'Comment posted.' });
    } catch (error) {
        console.error('Server error: ', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    };
};

export { POST };