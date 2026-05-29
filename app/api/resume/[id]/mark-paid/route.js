import db from '../../../../../database';

export async function POST(request, { params }) {
  try {
    await db.markAsPaid(params.id, true);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
