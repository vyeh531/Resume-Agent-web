import db from '../../../../../../database';
import { ensurePendingReportSaved } from '../../../../../lib/pendingReports';

function tokenFromRequest(request) {
  return (
    request.headers.get('x-report-access-token') ||
    new URL(request.url).searchParams.get('reportAccessToken') ||
    null
  );
}

export async function POST(request, { params: paramsPromise }) {
  try {
    const params = await paramsPromise;
    if (process.env.NODE_ENV === 'production' && process.env.PAYMENT_MOCK_ENABLED !== 'true') {
      return Response.json({ success: false, error: 'NOT_FOUND' }, { status: 404 });
    }

    let bodyToken = null;
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const body = await request.json();
        bodyToken = body?.reportAccessToken || null;
      }
    } catch { /* ignore body parse errors */ }

    let access = await db.validateReportAccess(params.reportId, {
      token: tokenFromRequest(request) || bodyToken,
      userId: request.headers.get('x-user-id') || null,
    });
    if (!access.ok && access.error === 'REPORT_NOT_FOUND' && await ensurePendingReportSaved(params.reportId)) {
      access = await db.validateReportAccess(params.reportId, {
        token: tokenFromRequest(request) || bodyToken,
        userId: request.headers.get('x-user-id') || null,
      });
    }
    if (!access.ok) {
      return Response.json({ success: false, error: access.error }, { status: access.status || 403 });
    }

    await db.markAtsReportPaid(params.reportId, true);
    return Response.json({ success: true, reportId: params.reportId });
  } catch (err) {
    console.error('[ATS-Report] Mark paid error:', err.message);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
