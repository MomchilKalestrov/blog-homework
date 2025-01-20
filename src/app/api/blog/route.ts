import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Post from '@/logic/mongoose/post';
import verifyUser from '@/logic/verifyUser';
import connect from '@/logic/mongoose/connect';

const GET = async (request: NextRequest) => {
    const params = new URL(request.url).searchParams;
    const personal = params.get('personal') === 'true';
    const skip = parseInt(params.get('skip') || '0');

    const verified = verifyUser();
    const cookie = cookies();

    if (await verified) return await verified;

    try {
        await connect();
        
        const posts =
            await Post.find({
                author:
                    personal
                    ?   (await cookie).get('name')?.value
                    :   { $ne: (await cookie).get('name')?.value }
            })
                .sort({ _id: -1 })
                .skip(skip)
                .limit(10);

        return NextResponse.json(posts);
    } catch (error) {
        console.error('Server error: ', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    };
};

const createPost = async ({ title, content }: { title: string, content: string }) => {
    const cookie = cookies();

    if (!title || !content) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    try {
        await connect();

        const post = new Post({ title, content, author: (await cookie).get('name')?.value });
        await post.save();

        return NextResponse.json({ _id: await post.save() });
    } catch (error) {
        console.error('Server error: ', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    };
};

const deletePost = async (id: string | null) => {
    const cookie = cookies();

    if (!id) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    try {
        await connect();

        await Post.deleteOne({ _id: id, author: (await cookie).get('name')?.value });
        
        return NextResponse.json({ success: 'Post deleted' });
    } catch (error) {
        console.error('Server error: ', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    };
};

const POST = async (request: NextRequest) => {
    const params = new URL(request.url).searchParams;
    const type = params.get('type');

    const verified = verifyUser();

    if (await verified) return await verified;

    switch (type) {
        case 'create': return await createPost(await request.json());
        case 'delete': return await deletePost(params.get('id'));
        default: return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    };
};

export { GET, POST };