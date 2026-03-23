import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// ── Firebase Storage ──────────────────────────────────
function getFirebaseBucket() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
  }
  return getStorage().bucket();
}

async function uploadToFirebase(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const bucket = getFirebaseBucket();
  const fileRef = bucket.file(filename);
  await fileRef.save(buffer, { metadata: { contentType } });
  await fileRef.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

// ── AWS S3 ────────────────────────────────────────────
function getS3Client() {
  return new S3Client({
    region: process.env.AWS_S3_REGION || 'ap-northeast-1',
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
    },
  });
}

async function uploadToS3(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_S3_REGION || 'ap-northeast-1';

  if (!bucket) throw new Error('AWS_S3_BUCKET 未設定');

  await getS3Client().send(new PutObjectCommand({
    Bucket: bucket,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
  }));

  const cdnUrl = process.env.AWS_CLOUDFRONT_URL;
  return cdnUrl
    ? `${cdnUrl}/${filename}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${filename}`;
}

// ── Route Handler ─────────────────────────────────────
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: '未授權' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: '未提供檔案' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `receipts/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const provider = process.env.UPLOAD_PROVIDER || 'firebase';

    const url = provider === 's3'
      ? await uploadToS3(buffer, filename, file.type)
      : await uploadToFirebase(buffer, filename, file.type);

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: `上傳失敗: ${error?.message || error}` }, { status: 500 });
  }
}
