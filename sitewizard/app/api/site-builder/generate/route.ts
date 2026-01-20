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
    
    // Resolve script path (sitewizard is at /ghl/sitewizard, scripts is at /ghl/templates/scripts)
    const scriptPath = resolve(process.cwd(), '../templates/scripts/create-site-api.js');
    
    console.log(`Executing generator script: ${scriptPath}`);
    console.log(`Config file: ${tempFilePath}`);

    try {
      console.log(`Running: node "${scriptPath}" --json-config "${tempFilePath}"`);
      const { stdout, stderr } = await execAsync(`node "${scriptPath}" --json-config "${tempFilePath}"`, {
        timeout: 120000, // 2 minute timeout
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

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
      console.error('stdout:', execError.stdout);
      console.error('stderr:', execError.stderr);
      return NextResponse.json({
        success: false,
        error: execError.stderr || execError.stdout || execError.message || 'Script execution failed',
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
