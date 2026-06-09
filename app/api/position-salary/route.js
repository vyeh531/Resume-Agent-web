import salaryTrajectory from '../../../services/salaryTrajectory.js';

const { buildSalaryTrajectory } = salaryTrajectory;

function jsonResponse(payload, init) {
  return Response.json(payload, init);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobTitle = (searchParams.get('jobTitle') || '').trim();
    const jdText = (searchParams.get('jdText') || '').trim();
    const location = (searchParams.get('location') || '').trim();
    const resumeText = (searchParams.get('resumeText') || '').trim();
    const roleFamily = (searchParams.get('roleFamily') || '').trim();
    const targetRole = (searchParams.get('targetRole') || '').trim();
    if (!jobTitle && !jdText) {
      return jsonResponse({ error: 'jobTitle or jdText is required' }, { status: 400 });
    }
    return jsonResponse(buildSalaryTrajectory({ jobTitle, jdText, location, resumeText, roleFamily, targetRole }));
  } catch (error) {
    console.error('[position-salary]', error);
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const jobTitle = (body.jobTitle || '').trim();
    const jdText = (body.jdText || '').trim();
    const location = (body.location || '').trim();
    const resumeText = (body.resumeText || '').trim();
    const roleFamily = (body.roleFamily || '').trim();
    const targetRole = (body.targetRole || '').trim();
    if (!jobTitle && !jdText) {
      return jsonResponse({ error: 'jobTitle or jdText is required' }, { status: 400 });
    }
    return jsonResponse(buildSalaryTrajectory({ jobTitle, jdText, location, resumeText, roleFamily, targetRole }));
  } catch (error) {
    console.error('[position-salary]', error);
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
