import crypto from 'crypto';
import { buildAtsReportPayload, scoreWithHostedFirst } from './atsHelpers';

const JOB_TTL_MS = 1000 * 60 * 60;
const jobs = globalThis.__resumeAnalysisJobs || new Map();
globalThis.__resumeAnalysisJobs = jobs;

function publicJob(job) {
  if (!job) return null;
  return {
    jobId: job.jobId,
    status: job.status,
    stage: job.stage,
    progress: job.progress,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt || null,
    error: job.error || null,
    result: job.status === 'completed' ? job.result : null,
  };
}

function cleanupJobs() {
  const now = Date.now();
  for (const [jobId, job] of jobs.entries()) {
    if (now - job.createdAt > JOB_TTL_MS) jobs.delete(jobId);
  }
}

function updateJob(job, patch) {
  Object.assign(job, patch, { updatedAt: Date.now() });
}

export function getAnalysisJob(jobId) {
  cleanupJobs();
  return publicJob(jobs.get(jobId));
}

export function startAnalysisJob({ resumeText, jobTitle, jdText, fileName, userId = null, locale = 'zh-CN' } = {}) {
  cleanupJobs();
  const jobId = crypto.randomUUID();
  const now = Date.now();
  const job = {
    jobId,
    status: 'queued',
    stage: 'queued',
    progress: 5,
    createdAt: now,
    updatedAt: now,
    result: null,
    error: null,
  };
  jobs.set(jobId, job);

  Promise.resolve().then(async () => {
    updateJob(job, { status: 'running', stage: 'scoring', progress: 25 });
    const scoreResult = await scoreWithHostedFirst({
      resumeText,
      jobTitle,
      jdText,
      fileName: fileName || '',
      locale,
    });

    updateJob(job, { stage: 'retrieving_advice', progress: 65 });
    const report = await buildAtsReportPayload(
      scoreResult.rawScoreResult,
      { resumeText, jobTitle, jdText, locale },
      userId,
      { locale }
    );

    updateJob(job, {
      status: 'completed',
      stage: 'completed',
      progress: 100,
      completedAt: Date.now(),
      result: {
        success: true,
        source: scoreResult.source,
        reportId: report.reportId,
        reportAccessToken: report.reportAccessToken,
        publicReport: report.publicReport,
        locale,
        warning: scoreResult.warning || undefined,
        timestamp: new Date().toISOString(),
      },
    });
  }).catch((error) => {
    updateJob(job, {
      status: 'failed',
      stage: 'failed',
      progress: Math.max(job.progress || 0, 20),
      error: error.message || 'analysis failed',
    });
    console.error('[Analysis Job] failed', jobId, error.message);
  });

  return publicJob(job);
}
