import { getHostedAtsConfig } from '../../lib/hostedAtsSystem.mjs';

const DEFAULT_WARMUP_TIMEOUT_MS = 8000;

function getWarmupUrl(config) {
  const explicitUrl = String(process.env.ATS_WARMUP_URL || '').trim();
  if (explicitUrl) return explicitUrl;

  const apiUrl = String(config.apiUrl || '').trim();
  if (!apiUrl) return '';
  return apiUrl.replace(/\/api\/v1\/score\/?$/i, '/api/v1/health');
}

export async function GET() {
  const config = getHostedAtsConfig();
  const warmupUrl = getWarmupUrl(config);
  if (!warmupUrl) {
    return Response.json({
      success: false,
      error: 'ATS warmup URL is not configured',
    }, { status: 500 });
  }

  const timeoutMs = Number(process.env.ATS_WARMUP_TIMEOUT_MS || DEFAULT_WARMUP_TIMEOUT_MS);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : DEFAULT_WARMUP_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const response = await fetch(warmupUrl, {
      method: 'GET',
      headers: config.apiKey ? { 'X-Api-Key': config.apiKey } : undefined,
      cache: 'no-store',
      signal: controller.signal,
    });
    return Response.json({
      success: true,
      status: response.status,
      ok: response.ok,
      durationMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error?.name === 'AbortError' ? `ATS warmup timed out after ${timeoutMs}ms` : error.message,
      durationMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
