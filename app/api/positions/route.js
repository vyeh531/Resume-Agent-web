import db from '../../../database';

export async function GET() {
  try {
    const pool = db.getPool();
    const { rows } = await pool.query('SELECT position_title FROM position_skills ORDER BY position_title');
    return Response.json({ success: true, data: rows.map(r => r.position_title) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
