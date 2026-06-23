import db from '../../../../../../database';
import { formatDebugReport } from '../../../../../../src/ats/report-formatter';
import { scoreResumeATS } from '../../../../../../src/ats/ats-scorer';
import { inferScoringJobTitleFromJd, normalizeScoringJobTitle } from '../../../../../../app/lib/atsHelpers';
import crypto from 'crypto';

function scoreSummary(resumeText, jobTitle, jdText, fileName = '') {
  const result = scoreResumeATS(resumeText || '', jobTitle || '', jdText || '', { fileName });
  return {
    jobTitle: jobTitle || '',
    total: result.total,
    dimensions: result.dimensions,
    detectedJobTitle: result.jobTitle || null,
    jdMatchRatio: result.metrics?.jdMatchRatio ?? null,
    roleId: result.metrics?.keywordProfile?.role_id || null,
    keywordProfileSource: result.metrics?.keywordProfile?.source || null,
  };
}

export async function GET(request, { params: paramsPromise }) {
  try {
    const params = await paramsPromise;
    const debugAllowed =
      process.env.NODE_ENV !== 'production' ||
      (process.env.DEBUG_REPORT_SECRET &&
        request.headers.get('x-debug-secret') === process.env.DEBUG_REPORT_SECRET);
    if (!debugAllowed) {
      return Response.json({ success: false, error: 'NOT_FOUND' }, { status: 404 });
    }

    const report = await db.getAtsReport(params.reportId);
    if (!report) {
      return Response.json({ success: false, error: 'REPORT_NOT_FOUND' }, { status: 404 });
    }
    const resumeText = String(report.resume_text || report.internalAtsResult?.resumeText || '');
    const jdText = String(report.internalAtsResult?.jdText || '');
    const fileName = String(report.internalAtsResult?.fileName || '');
    const storedJobTitle = normalizeScoringJobTitle(report.job_title || report.internalAtsResult?.jobTitle || '');
    const inferredJobTitle = inferScoringJobTitleFromJd(jdText);
    const variants = [
      scoreSummary(resumeText, '', jdText, fileName),
      storedJobTitle && storedJobTitle !== 'unknown' ? scoreSummary(resumeText, storedJobTitle, jdText, fileName) : null,
      inferredJobTitle ? scoreSummary(resumeText, inferredJobTitle, jdText, fileName) : null,
    ].filter(Boolean);

    return Response.json({
      success: true,
      reportId: params.reportId,
      rawAtsSummary: {
        total: report.internalAtsResult?.total,
        dimensions: report.internalAtsResult?.dimensions,
        jobTitle: report.internalAtsResult?.jobTitle || null,
        hasJD: Boolean(report.internalAtsResult?.hasJD),
        fileName,
        resumeTextLength: String(report.resume_text || '').length,
        resumeTextHash: report.resume_text
          ? crypto.createHash('sha256').update(String(report.resume_text || '')).digest('hex')
          : null,
      },
      runtime: {
        scorerFunctionHash: crypto.createHash('sha256').update(scoreResumeATS.toString()).digest('hex'),
        hasMarketingLens: Boolean(variants[0]?.dimensions && report.internalAtsResult?.resumeFacts),
      },
      scoreVariants: variants,
      debugReport: formatDebugReport(report.internalAtsResult, report.mentorCandidates),
    });
  } catch (err) {
    console.error('[ATS-Report] Debug error:', err.message);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
