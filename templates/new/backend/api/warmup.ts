import { checkDbConnection } from '../db';

export const warmup = async (req: any, res: any) => {
  try {
    await checkDbConnection();
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ error: 'Warmup failed' });
  }
}; 