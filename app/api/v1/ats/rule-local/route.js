import { resolveResumeText, buildAtsReportPayload, logPublicAtsResponseForTesting } from '../../../../lib/atsHelpers';
import { scoreResumeATS as scoreResumeSystem } from '../../../../../src/ats/ats-scorer';

export async function POST(request) {
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
    } else {
      const body = await request.json();
      jobTitle = body.jobTitle || '';
      jdText = body.jdText || '';
      resumeText = body.resumeText || '';
      fileName = body.fileName || '';
    }

    const userId = request.headers.get('x-user-id') || null;
    const resolvedText = await resolveResumeText(file, resumeText);

    jobTitle = String(jobTitle || '').trim();
    console.log('[ATS-Rule] jobTitle:', jobTitle || 'N/A', '| textLen:', resolvedText.length);
    const rawScoreResult = scoreResumeSystem(resolvedText, jobTitle, jdText, { fileName });
    const report = await buildAtsReportPayload(rawScoreResult, { resumeText: resolvedText, jobTitle, jdText }, userId);
    const payload = {
      success: true,
      engine: 'rule-based',
      reportId: report.reportId,
      reportAccessToken: report.reportAccessToken,
      publicReport: report.publicReport,
      data: report.publicReport,
      timestamp: new Date().toISOString(),
    };
    logPublicAtsResponseForTesting('ats/rule-local', payload);
    return Response.json(payload);
  } catch (err) {
    console.error('[ATS-Rule] Error:', err.message);
    return Response.json({ success: false, error: err.message }, { status: 400 });
  }
}
