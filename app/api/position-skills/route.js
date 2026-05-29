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
    const resumeText = (searchParams.get('resumeText') || '').toLowerCase();
    if (!jobTitle) return Response.json({ error: 'jobTitle is required' }, { status: 400 });
    const pool = db.getPool();
    const row = await fuzzyRow(pool, 'position_skills', '*', jobTitle);
    if (!row) return Response.json({ success: true, found: false, skills: [] });
    const keys = ['top1_skill','top2_skill','top3_skill','top4_skill','top5_skill','top6_skill','top7_skill','top8_skill','top9_skill','top10_skill'];
    const skills = keys
      .map((k, i) => ({ priority: i + 1, name: row[k] }))
      .filter(s => s.name && s.name.trim())
      .map(s => ({ priority: s.priority, name: s.name, status: resumeText.includes(s.name.toLowerCase()) ? 'have' : 'weak' }));
    return Response.json({ success: true, found: true, position_title: row.position_title, skills });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
