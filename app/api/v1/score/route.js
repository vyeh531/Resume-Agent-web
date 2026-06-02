import { resolveResumeText, buildAtsReportPayload, logPublicAtsResponseForTesting, scoreWithHostedFirst } from '../../../lib/atsHelpers';

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

    if (!jobTitle && !jdText) {
      return Response.json({ success: false, error: 'jobTitle or jdText is required' }, { status: 400 });
    }

    const hostedFileBuffer = file ? Buffer.from(await file.arrayBuffer()) : null;
    const resolvedText = await resolveResumeText(file, resumeText);
    const scoreResult = await scoreWithHostedFirst({
      resumeText: resolvedText,
      jobTitle,
      jdText,
      fileName: file?.name || '',
      fileBuffer: hostedFileBuffer,
    });
    const rawScoreResult = scoreResult.rawScoreResult;
    const report = await buildAtsReportPayload(rawScoreResult, { resumeText: resolvedText, jobTitle, jdText }, userId);

    const payload = {
      success: true,
      source: scoreResult.source,
      reportId: report.reportId,
      reportAccessToken: report.reportAccessToken,
      publicReport: report.publicReport,
      warning: scoreResult.warning || undefined,
      timestamp: new Date().toISOString(),
    };
    logPublicAtsResponseForTesting('score', payload);
    return Response.json(payload);
  } catch (err) {
    console.error('[ATS-Report] Error:', err.message);
    const isHostedAtsError = /hosted|ats api|ats_api|ATS system/i.test(err.message || '');
    return Response.json({
      success: false,
      source: 'hosted-api',
      error: err.message,
    }, { status: isHostedAtsError ? 502 : 400 });
  }
}
