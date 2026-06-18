import db from '../../../database';
import roleDictionary from '../../../public/ats_role_dictionary.json';

function getLocalPositions() {
  const roles = Array.isArray(roleDictionary?.roles) ? roleDictionary.roles : [];
  return [...new Set(
    roles
      .map((role) => role.position_title_original || role.canonical_role)
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));
}

export async function GET() {
  try {
    const pool = db.getPool();
    const { rows } = await pool.query('SELECT position_title FROM position_skills ORDER BY position_title');
    return Response.json({ success: true, data: rows.map(r => r.position_title) });
  } catch (error) {
    const data = getLocalPositions();
    console.warn(
      '[positions] database unavailable; using local role dictionary fallback:',
      error.message || error.code || 'unknown error'
    );
    return Response.json({
      success: true,
      source: 'local-role-dictionary',
      data,
    });
  }
}
