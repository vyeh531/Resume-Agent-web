import { resolveResumeText, buildAtsReportPayload, logPublicAtsResponseForTesting } from '../../../../lib/atsHelpers';
import { scoreResumeATS as scoreResumeSystem } from '../../../../../src/ats/ats-scorer';

const ATS_API_URL = process.env.ATS_API_URL || 'https://ats-system-wec6.onrender.com/api/v1/score';
const ATS_API_KEY = process.env.ATS_API_KEY;

async function callHostedATS({ resumeText, jobTitle, jdText }) {
  if (!ATS_API_KEY) throw new Error('ATS_API_KEY is not configured');
  const body = { resumeText };
  if (jobTitle) body.jobTitle = jobTitle;
  if (jdText) body.jdText = jdText;
  const response = await fetch(ATS_API_URL, {
    method: 'POST',
    headers: { 'X-Api-Key': ATS_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let payload;
  try { payload = text ? JSON.parse(text) : {}; } catch { throw new Error(`ATS API returned non-JSON (${response.status})`); }
  if (!response.ok || payload.success === false) throw new Error(payload.error || `ATS API failed with status ${response.status}`);
  return payload.data || payload;
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let file = null, jobTitle = '', jdText = '', resumeText = '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      file = formData.get('file');
      jobTitle = formData.get('jobTitle') || '';
      jdText = formData.get('jdText') || '';
      resumeText = formData.get('resumeText') || '';
    } else {
      const body = await request.json();
      jobTitle = body.jobTitle || '';
      jdText = body.jdText || '';
      resumeText = body.resumeText || '';
    }

    const userId = request.headers.get('x-user-id') || null;
    const resolvedText = await resolveResumeText(file, resumeText);

    if (!jobTitle && !jdText) {
      return Response.json({ success: false, error: 'jobTitle or jdText is required' }, { status: 400 });
    }

    console.log('[ATS-System] Scoring via hosted API:', {
      textLen: resolvedText.length,
      jobTitle: jobTitle || 'N/A',
      hasJD: !!jdText,
    });

    try {
      const data = await callHostedATS({ resumeText: resolvedText, jobTitle, jdText });
      const report = await buildAtsReportPayload(
        { ...data, engine: data.engine || 'ats-system-api', source: 'hosted-api' },
        { resumeText: resolvedText, jobTitle, jdText },
        userId
      );
      const payload = {
        success: true,
        engine: 'ats-system-api',
        source: 'hosted-api',
        reportId: report.reportId,
        reportAccessToken: report.reportAccessToken,
        publicReport: report.publicReport,
        data: report.publicReport,
        timestamp: new Date().toISOString(),
      };
      logPublicAtsResponseForTesting('ats/rule hosted', payload);
      return Response.json(payload);
    } catch (apiErr) {
      console.warn('[ATS-System] Hosted API unavailable, using local fallback:', apiErr.message);
      const data = scoreResumeSystem(resolvedText, jobTitle, jdText);
      const mergedData = { ...data, engine: data.engine || 'ats-system-local-fallback', source: 'local-fallback', fallbackReason: apiErr.message };
      const report = await buildAtsReportPayload(mergedData, { resumeText: resolvedText, jobTitle, jdText }, userId);
      const payload = {
        success: true,
        engine: mergedData.engine,
        source: 'local-fallback',
        reportId: report.reportId,
        reportAccessToken: report.reportAccessToken,
        publicReport: report.publicReport,
        data: report.publicReport,
        warning: apiErr.message,
        timestamp: new Date().toISOString(),
      };
      logPublicAtsResponseForTesting('ats/rule fallback', payload);
      return Response.json(payload);
    }
  } catch (err) {
    console.error('[ATS-System] Error:', err.message);
    return Response.json({ success: false, error: err.message }, { status: 400 });
  }
}
