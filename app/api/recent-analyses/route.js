import db from '../../../database';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const rows = db.getRecentAnalyses(limit);
    return Response.json({ success: true, data: rows, total: rows.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
