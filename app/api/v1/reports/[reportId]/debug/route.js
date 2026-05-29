import db from '../../../../../../database';
import { formatDebugReport } from '../../../../../../src/ats/report-formatter';

export async function GET(request, { params }) {
  try {
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
    return Response.json({
      success: true,
      reportId: params.reportId,
      debugReport: formatDebugReport(report.internalAtsResult, report.mentorCandidates),
    });
  } catch (err) {
    console.error('[ATS-Report] Debug error:', err.message);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
