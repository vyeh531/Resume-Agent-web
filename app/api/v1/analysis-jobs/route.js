import { startAnalysisJob } from '../../../lib/analysisJobs';
import { resolveResumeText } from '../../../lib/atsHelpers';
import { requestLocaleFromParts } from '../../../../src/i18n/locale';

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let file = null;
    let body = {};
    let resumeText = '';
    let jobTitle = '';
    let jdText = '';
    let fileName = '';
    let locale;
    let userId = request.headers.get('x-user-id') || null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      file = formData.get('file');
      body = formData;
      resumeText = formData.get('resumeText') || '';
      jobTitle = formData.get('jobTitle') || '';
      jdText = formData.get('jdText') || '';
      fileName = formData.get('fileName') || file?.name || '';
      locale = requestLocaleFromParts({ formData, request, url: new URL(request.url) });
      userId = userId || formData.get('userId') || null;
    } else {
      body = await request.json();
      resumeText = body.resumeText || '';
      jobTitle = body.jobTitle || '';
      jdText = body.jdText || '';
      fileName = body.fileName || '';
      locale = requestLocaleFromParts({ body, request, url: new URL(request.url) });
      userId = userId || body.userId || null;
    }

    const resolvedText = await resolveResumeText(file, resumeText);
    if (!resolvedText) {
      return Response.json({ success: false, error: 'resumeText is required' }, { status: 400 });
    }
    jobTitle = String(jobTitle || '').trim();
    if (!jobTitle && !jdText) {
      return Response.json({ success: false, error: 'jobTitle or jdText is required' }, { status: 400 });
    }

    const job = startAnalysisJob({ resumeText: resolvedText, jobTitle, jdText, fileName, userId, locale });
    return Response.json({ success: true, job, resumeText: resolvedText }, { status: 202 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}
