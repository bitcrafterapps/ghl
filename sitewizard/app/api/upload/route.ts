import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueId = crypto.randomUUID();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const filename = `${uniqueId}-${originalName}`;
    
    // Save to public/uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure dir exists
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    return NextResponse.json({ 
      url: `/uploads/${filename}`,
      absolutePath: filePath 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
