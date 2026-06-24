import db from '../../../../../../database';
import { normalizeLocale } from '../../../../../../src/i18n/locale';
import { hydrateStoredReportJsonForLocale } from '../../../../../lib/localeReports';
import { ensurePendingReportSaved } from '../../../../../lib/pendingReports';

function reportTokenFromRequest(request) {
  return (
    request.headers.get('x-report-access-token') ||
    new URL(request.url).searchParams.get('reportAccessToken') ||
    null
  );
}

export async function GET(request, { params: paramsPromise }) {
  try {
    const params = await paramsPromise;
    let access = await db.validateReportAccess(params.reportId, {
      token: reportTokenFromRequest(request),
      userId: request.headers.get('x-user-id') || null,
    });
    if (!access.ok && access.error === 'REPORT_NOT_FOUND' && await ensurePendingReportSaved(params.reportId)) {
      access = await db.validateReportAccess(params.reportId, {
        token: reportTokenFromRequest(request),
        userId: request.headers.get('x-user-id') || null,
      });
    }
    if (!access.ok) {
      return Response.json({ success: false, error: access.error }, { status: access.status || 403 });
    }
    const locale = normalizeLocale(new URL(request.url).searchParams.get('locale') || access.report.locale || access.report.publicReport?.locale);
    const storedLocale = normalizeLocale(access.report.publicReport?.locale || access.report.locale);
    const publicReport = locale === storedLocale
      ? { ...(access.report.publicReport || {}), locale }
      : await hydrateStoredReportJsonForLocale(access.report.publicReport, locale);
    return Response.json({
      success: true,
      reportId: params.reportId,
      publicReport,
      locale,
      translationFallback: Boolean(publicReport.translationFallback),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[ATS-Report] Public load error:', err.message);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
