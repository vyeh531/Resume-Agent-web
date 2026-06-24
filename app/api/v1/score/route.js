import { resolveResumeText, buildAtsReportPayload, logPublicAtsResponseForTesting, scoreWithLocalAts } from '../../../lib/atsHelpers';
import { requestLocaleFromParts } from '../../../../src/i18n/locale';

export async function POST(request) {
  const startedAt = Date.now();
  const timings = [];
  const mark = (label) => timings.push([label, Date.now() - startedAt]);
  try {
    const contentType = request.headers.get('content-type') || '';
    let file = null, jobTitle = '', jdText = '', resumeText = '', fileName = '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      file = formData.get('file');
      jobTitle = formData.get('jobTitle') || '';
      jdText = formData.get('jdText') || '';
      resumeText = formData.get('resumeText') || '';
      fileName = formData.get('fileName') || file?.name || '';
      var locale = requestLocaleFromParts({ formData, request, url: new URL(request.url) });
    } else {
      const body = await request.json();
      jobTitle = body.jobTitle || '';
      jdText = body.jdText || '';
      resumeText = body.resumeText || '';
      fileName = body.fileName || '';
      var locale = requestLocaleFromParts({ body, request, url: new URL(request.url) });
    }
    mark('parse_request');

    const userId = request.headers.get('x-user-id') || null;

    jobTitle = String(jobTitle || '').trim();
    if (!jobTitle && !jdText) {
      return Response.json({ success: false, error: 'jobTitle or jdText is required' }, { status: 400 });
    }

    const hostedFileBuffer = file ? Buffer.from(await file.arrayBuffer()) : null;
    const resolvedText = await resolveResumeText(file, resumeText);
    mark('resolve_resume_text');
    const scoreResult = await scoreWithLocalAts({
      resumeText: resolvedText,
      jobTitle,
      jdText,
      fileName,
      fileBuffer: hostedFileBuffer,
    });
    mark('local_ats');
    const rawScoreResult = scoreResult.rawScoreResult;
    const report = await buildAtsReportPayload(rawScoreResult, { resumeText: resolvedText, jobTitle, jdText, fileName, locale }, userId, { locale });
    mark('build_report');

    const payload = {
      success: true,
      source: scoreResult.source,
      reportId: report.reportId,
      reportAccessToken: report.reportAccessToken,
      publicReport: report.publicReport,
      locale,
      warning: scoreResult.warning || undefined,
      timestamp: new Date().toISOString(),
    };
    console.log('[ATS-Report Timing]', JSON.stringify({
      totalMs: Date.now() - startedAt,
      timings: Object.fromEntries(timings),
      source: scoreResult.source,
      reportId: report.reportId,
    }));
    logPublicAtsResponseForTesting('score', payload);
    return Response.json(payload);
  } catch (err) {
    console.warn('[ATS-Report Timing][failed]', JSON.stringify({
      totalMs: Date.now() - startedAt,
      timings: Object.fromEntries(timings),
      error: err.message,
    }));
    console.error('[ATS-Report] Error:', err.message);
    return Response.json({
      success: false,
      source: 'local',
      error: err.message,
    }, { status: 400 });
  }
}
