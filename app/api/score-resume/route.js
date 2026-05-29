import { scoreResumeATS as scoreResumeSystem } from '../../../src/ats/ats-scorer';
import db from '../../../database';

export async function POST(request) {
  try {
    const { resumeText, jobTitle, jdText } = await request.json();
    if (!resumeText) return Response.json({ error: 'resumeText is required' }, { status: 400 });

    const result = scoreResumeSystem(resumeText, jobTitle, jdText);
    let sessionId = null;
    try { sessionId = db.saveAnalysis({ jobTitle, resumeText, jdText, result }); } catch (e) {}

    return Response.json({ success: true, sessionId, data: result, timestamp: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
