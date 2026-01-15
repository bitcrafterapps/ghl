import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join, resolve } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const config = await req.json();
    
    console.log('Received generation request for:', config.company.name);

    // Save temp config file
    const tempFileName = `site-config-${Date.now()}.json`;
    const tempFilePath = join(process.cwd(), tempFileName);
    
    await writeFile(tempFilePath, JSON.stringify(config, null, 2));
    
    // Resolve script path (assuming sitewizard is in templates/sitewizard and scripts is in templates/scripts)
    const scriptPath = resolve(process.cwd(), '../scripts/create-site-api.js');
    
    console.log(`Executing generator script: ${scriptPath}`);
    console.log(`Config file: ${tempFilePath}`);

    try {
      const { stdout, stderr } = await execAsync(`node "${scriptPath}" --json-config "${tempFilePath}"`);
      
      console.log('Generator output:', stdout);
      if (stderr) console.error('Generator stderr:', stderr);
      
      // Clean up temp file
      await unlink(tempFilePath).catch(e => console.error('Failed to cleanup temp file:', e));

      return NextResponse.json({ 
        success: true, 
        message: 'Site generated successfully',
        details: stdout
      });
    } catch (execError: any) {
      console.error('Script execution failed:', execError);
      return NextResponse.json({ 
        success: false, 
        error: 'Script execution failed', 
        details: execError.message 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Site generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request: ' + error.message },
      { status: 500 }
    );
  }
}
