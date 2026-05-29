import db from '../../../../database';

export async function GET(request, { params }) {
  try {
    const row = db.getAnalysis(params.id);
    if (!row) return Response.json({ error: 'Record not found' }, { status: 404 });
    return Response.json({ success: true, data: row });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
