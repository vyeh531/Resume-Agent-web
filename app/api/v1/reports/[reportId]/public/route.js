import db from '../../../../../../database';

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
    const access = await db.validateReportAccess(params.reportId, {
      token: reportTokenFromRequest(request),
      userId: request.headers.get('x-user-id') || null,
    });
    if (!access.ok) {
      return Response.json({ success: false, error: access.error }, { status: access.status || 403 });
    }
    return Response.json({
      success: true,
      reportId: params.reportId,
      publicReport: access.report.publicReport,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[ATS-Report] Public load error:', err.message);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
