import { Command } from '@tauri-apps/plugin-shell';

/**
 * Generates a unique hardware fingerprint using system commands.
 * For Windows, we use 'wmic csproduct get uuid'.
 * If wmic fails, fallback to a timestamp-based ID or a randomly generated UUID that we store.
 * But since it's a security feature, we try our best to get a real hardware ID.
 */
export async function getHardwareFingerprint(): Promise<string> {
  try {
    // Run WMIC to get system UUID
    const command = Command.create('wmic', ['csproduct', 'get', 'uuid']);
    const output = await command.execute();

    if (output.code === 0) {
      const raw = output.stdout;
      // raw output usually looks like:
      // UUID
      // XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
      const lines = raw.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length >= 2) {
        // Return the actual UUID string
        return lines[1];
      }
    }
    
    // Fallback if wmic csproduct fails (e.g. some VMs)
    const diskCommand = Command.create('wmic', ['diskdrive', 'get', 'serialnumber']);
    const diskOutput = await diskCommand.execute();
    if (diskOutput.code === 0) {
      const lines = diskOutput.stdout.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length >= 2) {
        return lines[1];
      }
    }

    throw new Error('Could not generate a hardware fingerprint.');
  } catch (error) {
    console.error('Failed to get hardware fingerprint:', error);
    // In a real environment, you might want to return a fallback or throw.
    // For now, if we absolutely can't get it, we throw to block access if required.
    throw error;
  }
}
