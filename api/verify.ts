import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verificationService } from '../lib/verify/verificationService.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use POST.' });
  }

  const startTime = Date.now();

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { entityName, claimText, entityUrl, forceFresh } = body || {};

    if (!entityName || typeof entityName !== 'string' || entityName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid entity name. Minimum 2 characters required.'
      });
    }

    if (!claimText || typeof claimText !== 'string' || claimText.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Invalid claim text. Minimum 5 characters required.'
      });
    }

    const result = await verificationService.verifyClaim({
      entityName: entityName.trim(),
      claimText: claimText.trim(),
      entityUrl: entityUrl ? String(entityUrl).trim() : undefined,
      forceFresh: Boolean(forceFresh)
    });

    const durationMs = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      result,
      durationMs
    });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal verification engine error.',
      durationMs
    });
  }
}
