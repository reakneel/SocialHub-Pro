import { NextRequest, NextResponse } from 'next/server';
import { Post } from '../route';

// Mock data - in production, this would come from a database
let posts: Post[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = posts.find(p => p.id === params.id);
  
  if (!post) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const postIndex = posts.findIndex(p => p.id === params.id);
    
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    posts[postIndex] = {
      ...posts[postIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(posts[postIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const postIndex = posts.findIndex(p => p.id === params.id);
  
  if (postIndex === -1) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    );
  }

  posts.splice(postIndex, 1);
  
  return NextResponse.json({ message: 'Post deleted successfully' });
}