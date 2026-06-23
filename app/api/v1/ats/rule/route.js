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
    if (!jobTitle && !jdText) {
      return Response.json({ success: false, error: 'jobTitle or jdText is required' }, { status: 400 });
    }

    console.log('[ATS-System] Scoring via local engine:', {
      textLen: resolvedText.length,
      jobTitle: jobTitle || 'N/A',
      hasJD: !!jdText,
    });

    const data = scoreResumeSystem(resolvedText, jobTitle, jdText, { fileName });
    const mergedData = { ...data, engine: data.engine || 'ats-system-local', source: 'local' };
    const report = await buildAtsReportPayload(mergedData, { resumeText: resolvedText, jobTitle, jdText }, userId);
    const payload = {
      success: true,
      engine: mergedData.engine,
      source: 'local',
      reportId: report.reportId,
      reportAccessToken: report.reportAccessToken,
      publicReport: report.publicReport,
      data: report.publicReport,
      timestamp: new Date().toISOString(),
    };
    logPublicAtsResponseForTesting('ats/rule local', payload);
    return Response.json(payload);
  } catch (err) {
    console.error('[ATS-System] Error:', err.message);
    return Response.json({ success: false, error: err.message }, { status: 400 });
  }
}
