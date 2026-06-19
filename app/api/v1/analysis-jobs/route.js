import { startAnalysisJob } from '../../../lib/analysisJobs';
import { requestLocaleFromParts } from '../../../../src/i18n/locale';

export async function POST(request) {
  try {
    const body = await request.json();
    const resumeText = body.resumeText || '';
    const jobTitle = body.jobTitle || '';
    const jdText = body.jdText || '';
    const fileName = body.fileName || '';
    const locale = requestLocaleFromParts({ body, request, url: new URL(request.url) });
    const userId = request.headers.get('x-user-id') || body.userId || null;

    if (!resumeText) {
      return Response.json({ success: false, error: 'resumeText is required' }, { status: 400 });
    }
    if (!jobTitle && !jdText) {
      return Response.json({ success: false, error: 'jobTitle or jdText is required' }, { status: 400 });
    }

    const job = startAnalysisJob({ resumeText, jobTitle, jdText, fileName, userId, locale });
    return Response.json({ success: true, job }, { status: 202 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}
