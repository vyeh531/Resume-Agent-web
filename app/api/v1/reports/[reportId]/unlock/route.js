import db from '../../../../../../database';
import { formatPremiumUnlockedReport } from '../../../../../../src/ats/report-formatter';

function reportTokenFromRequest(request) {
  return (
    request.headers.get('x-report-access-token') ||
    new URL(request.url).searchParams.get('reportAccessToken') ||
    null
  );
}

export async function POST(request, { params }) {
  try {
    // Also support token from request body
    let bodyToken = null;
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const body = await request.json();
        bodyToken = body?.reportAccessToken || null;
      }
    } catch { /* ignore body parse errors */ }

    const token = request.headers.get('x-report-access-token') ||
      new URL(request.url).searchParams.get('reportAccessToken') ||
      bodyToken ||
      null;

    const unlock = await db.validateReportUnlock(params.reportId, {
      token,
      userId: request.headers.get('x-user-id') || null,
    });
    if (!unlock.ok) {
      return Response.json({ success: false, error: unlock.error }, { status: unlock.status || 403 });
    }
    const premiumReport =
      unlock.report.premiumReport ||
      formatPremiumUnlockedReport(unlock.report.internalAtsResult, unlock.report.paidAdvice);
    const fallbackPremiumReport = (premiumReport?.problemTags && premiumReport?.detailedSuggestions)
      ? null
      : formatPremiumUnlockedReport(unlock.report.internalAtsResult, unlock.report.paidAdvice);
    const hydratedPremiumReport = fallbackPremiumReport
      ? {
          ...fallbackPremiumReport,
          ...premiumReport,
          problemTags: premiumReport?.problemTags || fallbackPremiumReport.problemTags || null,
          detailedSuggestions: premiumReport?.detailedSuggestions || fallbackPremiumReport.detailedSuggestions || null,
        }
      : premiumReport;
    return Response.json({
      success: true,
      reportId: params.reportId,
      premiumReport: hydratedPremiumReport,
    });
  } catch (err) {
    console.error('[ATS-Report] Unlock error:', err.message);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
