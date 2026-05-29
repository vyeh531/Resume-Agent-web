import db from '../../../database';

async function fuzzyRow(pool, table, cols, jobTitle) {
  const sel = 'SELECT ' + cols + ' FROM ' + table;
  let r = await pool.query(sel + ' WHERE LOWER(position_title) = LOWER($1) LIMIT 1', [jobTitle]);
  if (r.rows[0]) return r.rows[0];
  r = await pool.query(sel + " WHERE LOWER(position_title) LIKE LOWER($1) OR LOWER($2) LIKE LOWER('%' || position_title || '%') LIMIT 1", ['%' + jobTitle + '%', jobTitle]);
  if (r.rows[0]) return r.rows[0];
  for (const w of jobTitle.split(/\s+/).filter(w => w.length > 2)) {
    r = await pool.query(sel + ' WHERE LOWER(position_title) LIKE LOWER($1) LIMIT 1', ['%' + w + '%']);
    if (r.rows[0]) return r.rows[0];
  }
  return null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobTitle = (searchParams.get('jobTitle') || '').trim();
    if (!jobTitle) return Response.json({ error: 'jobTitle is required' }, { status: 400 });
    const pool = db.getPool();
    const row = await fuzzyRow(pool, 'position_skills', 'position_title, salary_range', jobTitle);
    if (!row) return Response.json({ success: true, found: false, salary_range: null });
    return Response.json({ success: true, found: true, position_title: row.position_title, salary_range: row.salary_range });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
