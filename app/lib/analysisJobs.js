import crypto from 'crypto';
import { buildAtsReportPayload, scoreWithLocalAts } from './atsHelpers';

const JOB_TTL_MS = 1000 * 60 * 60;
const DEFAULT_JOB_TIMEOUT_MS = 90000;
const jobs = globalThis.__resumeAnalysisJobs || new Map();
globalThis.__resumeAnalysisJobs = jobs;

function getJobTimeoutMs() {
  const value = Number(process.env.ANALYSIS_JOB_TIMEOUT_MS || DEFAULT_JOB_TIMEOUT_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_JOB_TIMEOUT_MS;
}

function publicJob(job) {
  if (!job) return null;
  const result = job.status === 'completed' ? job.result : null;
  return {
    jobId: job.jobId,
    status: job.status,
    stage: job.stage,
    progress: job.progress,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt || null,
    error: job.error || null,
    result,
    debugSummary: result?.debugSummary || null,
  };
}

function cleanupJobs() {
  const now = Date.now();
  for (const [jobId, job] of jobs.entries()) {
    if (now - job.createdAt > JOB_TTL_MS) jobs.delete(jobId);
  }
}

function updateJob(job, patch) {
  if (job.status === 'failed' && patch.status === 'completed') return;
  Object.assign(job, patch, { updatedAt: Date.now() });
}

function timeoutAfter(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`analysis job timed out after ${ms}ms`)), ms);
  });
}

function progressForReportStep(step) {
  const progressByStep = {
    format_internal_ats: 70,
    retrieve_mentor_advice: 78,
    select_mentor_plan: 82,
    format_reports: 88,
    format_public_premium: 92,
    save_report: 96,
  };
  return progressByStep[step] || 65;
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
    const runJob = async () => {
      updateJob(job, { status: 'running', stage: 'scoring', progress: 25 });
      const scoreResult = await scoreWithLocalAts({
        resumeText,
        jobTitle,
        jdText,
        fileName: fileName || '',
        locale,
      });

      updateJob(job, { stage: 'building_report', progress: 65 });
      const report = await buildAtsReportPayload(
        scoreResult.rawScoreResult,
        { resumeText, jobTitle, jdText, fileName: fileName || '', locale },
        userId,
        {
          locale,
          onProgress(step) {
            updateJob(job, {
              stage: step,
              progress: Math.max(job.progress || 0, progressForReportStep(step)),
            });
          },
        }
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
          debugSummary: {
            scorerInput: {
              resumeTextLength: String(resumeText || '').length,
              resumeTextHash: crypto.createHash('sha256').update(String(resumeText || '')).digest('hex'),
              jobTitle: jobTitle || '',
              jdTextLength: String(jdText || '').length,
              jdTextHash: crypto.createHash('sha256').update(String(jdText || '')).digest('hex'),
              fileName: fileName || '',
            },
            rawAts: {
              total: scoreResult.rawScoreResult.total,
              dimensions: scoreResult.rawScoreResult.dimensions,
              jobTitle: scoreResult.rawScoreResult.jobTitle || null,
              hasJD: Boolean(scoreResult.rawScoreResult.hasJD),
            },
            publicReport: {
              total: report.publicReport?.total,
              dimensions: report.publicReport?.dimensions,
            },
          },
          locale,
          warning: scoreResult.warning || undefined,
          timestamp: new Date().toISOString(),
        },
      });
    };

    await Promise.race([runJob(), timeoutAfter(getJobTimeoutMs())]);
  }).catch((error) => {
    updateJob(job, {
      status: 'failed',
      stage: 'failed',
      progress: Math.max(job.progress || 0, 20),
      error: error.message || 'analysis failed',
    });
    console.error('[Analysis Job] failed', jobId, {
      stage: job.stage,
      progress: job.progress,
      message: error.message,
      stack: error.stack,
    });
  });

  return publicJob(job);
}
