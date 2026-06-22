import { scoreWithHostedAtsSystem } from './hostedAtsSystem.mjs';
import { scoreResumeATS as scoreResumeSystem } from '../../src/ats/ats-scorer.js';
import {
  createReportAccessToken,
  createReportId,
  formatDebugReport,
  formatInternalAtsResult,
  formatPremiumUnlockedReport,
  formatPublicFreeReport,
} from '../../src/ats/report-formatter';
import {
  retrieveMentorAdviceWithStatus,
  selectFreeMentorPlan,
  selectPremiumMentorPlan,
  buildLockedAdvicePreview,
  formatPublicFreeMentorAdvice,
  formatPremiumMentorReport,
  retrieveInsiderTips,
  groupAdviceByMentor,
} from '../../services/mentorAdviceRetrieval';
import { curateMentorAdvicePlan } from '../../services/adviceCurator';
import { parsePDF, parseDocx } from '../../file-parser';
import db from '../../database';
import { normalizeLocale } from '../../src/i18n/locale';

export async function resolveResumeText(file, bodyResumeText) {
  if (bodyResumeText) return bodyResumeText;
  if (file) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = file.name.toLowerCase().split('.').pop();
    if (ext === 'pdf') return await parsePDF(buffer);
    if (ext === 'docx') return await parseDocx(buffer);
    if (ext === 'txt') return buffer.toString('utf-8');
    throw new Error('不支援的檔案格式：' + ext);
  }
  throw new Error('請提供 resumeText 或上傳 file');
}

function logRetrievalDebug({
  reportContext,
  mentorCandidateCount,
  strictCandidateCount,
  fallbackCandidateCount,
  selectedFreeAdviceId,
  paidAdviceCount,
  roleMismatchPenalty,
  retrievalStatus,
  retrievalErrorCode,
  selectedScope,
  rawRows,
  eligibleRows,
  excludedInterviewAdvice,
}) {
  if (process.env.LOG_ATS_RETRIEVAL_DEBUG === 'false') return;
  console.log('[Advice Retrieval]', JSON.stringify({
    reportContext,
    rawRows,
    eligibleRows,
    candidates: mentorCandidateCount,
    strictCandidates: strictCandidateCount,
    fallbackCandidates: fallbackCandidateCount,
    selectedFreeAdvice: selectedFreeAdviceId,
    selectedScope,
    excludedInterviewAdvice,
    paidAdvice: paidAdviceCount,
    roleMismatchPenalty,
    retrievalStatus,
    retrievalErrorCode,
  }));
}

function logAdvicePlan(freeMentorPlan, premiumMentorPlan = [], coverageSummary = {}) {
  if (process.env.LOG_ATS_RETRIEVAL_DEBUG === 'false') return;
  const allAdviceCount = premiumMentorPlan.reduce((sum, mentor) => sum + (mentor.adviceItems?.length || 0), 0);
  const freeAdviceSources = (freeMentorPlan?.adviceItems || []).map((item) => item.source || 'db');
  console.log('[Advice Plan]', JSON.stringify({
    freeMentor: freeMentorPlan?.mentorId || null,
    freeAdviceCount: freeMentorPlan?.adviceItems?.length || 0,
    freeAdviceSources,
    roleSafeRejected: freeMentorPlan?.debug?.roleSafeRejected || 0,
    premiumMentors: premiumMentorPlan.length,
    premiumAdviceCount: allAdviceCount,
    lockedAdviceCount: Math.max(0, allAdviceCount - (freeMentorPlan?.adviceItems?.length || 0)),
    coverageRatio: coverageSummary.coverageRatio ?? 0,
    coveredProblemTags: coverageSummary.coveredProblemTags || [],
    uncoveredProblemTags: coverageSummary.uncoveredProblemTags || [],
  }));
}

export function logPublicAtsResponseForTesting(label, payload) {
  if (process.env.LOG_ATS_PUBLIC_RESPONSE === 'false') return;
  const loggedPayload = {
    ...payload,
    reportAccessToken: payload.reportAccessToken ? '[REDACTED]' : payload.reportAccessToken,
  };
  console.log(`\n[ATS Public Response][${label}]`);
  console.log(JSON.stringify(loggedPayload, null, 2));
  console.log('[/ATS Public Response]\n');
}

export async function buildAtsReportPayload(rawScoreResult, input, userId = null, options = {}) {
  const startedAt = Date.now();
  const timings = [];
  const mark = (label) => {
    timings.push([label, Date.now() - startedAt]);
    if (typeof options.onProgress === 'function') {
      options.onProgress(label);
    }
  };
  const locale = normalizeLocale(options.locale || input?.locale);
  const internalAtsResult = formatInternalAtsResult(rawScoreResult, input);
  internalAtsResult.locale = locale;
  mark('format_internal_ats');
  const retrievalQuery = internalAtsResult.retrievalQuery;
  retrievalQuery.locale = locale;
  const {
    candidates: mentorCandidates,
    status: retrievalStatus,
  } = await retrieveMentorAdviceWithStatus(retrievalQuery, { locale });
  internalAtsResult.retrievalStatus = retrievalStatus;
  mark('retrieve_mentor_advice');
  const freeMentorPlan = selectFreeMentorPlan(mentorCandidates, internalAtsResult);
  const premiumMentorPlan = selectPremiumMentorPlan(mentorCandidates, internalAtsResult, freeMentorPlan);
  mark('select_mentor_plan');
  const freeAdvice = formatPublicFreeMentorAdvice(freeMentorPlan, internalAtsResult);
  const paidAdvice = premiumMentorPlan.slice(1);
  const premiumMentorReport = formatPremiumMentorReport(premiumMentorPlan, internalAtsResult);
  const curatedAdvice = curateMentorAdvicePlan({
    internalAtsResult,
    retrievalQuery,
    freeAdvice,
    paidAdvice,
    mentorReport: premiumMentorReport,
    candidateMentors: groupAdviceByMentor(mentorCandidates),
    targetRole: internalAtsResult.jobTitle,
  });
  if (curatedAdvice?.coverageSummary) {
    curatedAdvice.coverageSummary.retrievalStatus = retrievalStatus;
  }
  const companyInsiderTips = await retrieveInsiderTips({ internalAtsResult, limit: 6 });
  mark('format_reports');
  logRetrievalDebug({
    reportContext: input?.jobTitle || rawScoreResult.jobTitle || 'unknown',
    mentorCandidateCount: mentorCandidates.length,
    strictCandidateCount: mentorCandidates.debug?.strictCandidates ?? 0,
    fallbackCandidateCount: mentorCandidates.debug?.fallbackCandidates ?? 0,
    selectedFreeAdviceId: freeAdvice?.mentorId || null,
    paidAdviceCount: paidAdvice.reduce((sum, mentor) => sum + (mentor.adviceItems?.length || 0), 0),
    roleMismatchPenalty: mentorCandidates.debug?.maxRoleMismatchPenalty ?? 0,
    retrievalStatus: retrievalStatus?.retrievalStatus,
    retrievalErrorCode: retrievalStatus?.retrievalErrorCode,
    selectedScope: mentorCandidates.debug?.selectedScope || 'mentor_plan',
    rawRows: mentorCandidates.debug?.rawRows ?? 0,
    eligibleRows: mentorCandidates.debug?.eligibleRows ?? 0,
    excludedInterviewAdvice: mentorCandidates.debug?.excludedInterviewAdvice ?? 0,
  });
  const lockedPreview = buildLockedAdvicePreview(premiumMentorPlan, internalAtsResult);
  const publicReport = formatPublicFreeReport(internalAtsResult, freeAdvice, lockedPreview, curatedAdvice, { locale });
  publicReport.retrievalStatus = retrievalStatus;
  const premiumReport = {
    ...formatPremiumUnlockedReport(internalAtsResult, {
      ...premiumMentorReport,
      curatedAdviceItems: curatedAdvice.curatedAdviceItems,
      resultPageAdviceItems: curatedAdvice.resultPageAdviceItems,
      reportPageMentorGroups: curatedAdvice.reportPageMentorGroups,
      coverageSummary: {
        ...(premiumMentorReport.coverageSummary || {}),
        ...(curatedAdvice.coverageSummary || {}),
      },
    }, { locale }),
    companyInsiderTips,
    retrievalStatus,
    locale,
  };
  mark('format_public_premium');
  logAdvicePlan(freeMentorPlan, premiumMentorPlan, premiumReport.coverageSummary);
  const reportId = createReportId();
  const reportAccessToken = createReportAccessToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();

  const resumeText = input?.resumeText || null;
  const resumeBullets = resumeText ? db.extractBullets(resumeText) : [];

  await db.saveAtsReport({
    reportId,
    reportAccessToken,
    expiresAt,
    jobTitle: internalAtsResult.jobTitle,
    hasJD: internalAtsResult.hasJD,
    total: internalAtsResult.total,
    risk: internalAtsResult.risk,
    locale,
    publicReport,
    internalAtsResult,
    retrievalQuery,
    mentorCandidates,
    freeAdvice: freeMentorPlan,
    paidAdvice,
    premiumReport,
    paymentStatus: 'unpaid',
    userId,
    resumeText,
    resumeBullets,
  });
  mark('save_report');

  console.log('[ATS Report Build Timing]', JSON.stringify({
    totalMs: Date.now() - startedAt,
    timings: Object.fromEntries(timings),
    candidateCount: mentorCandidates.length,
    reportContext: input?.jobTitle || rawScoreResult.jobTitle || 'unknown',
  }));

  return {
    reportId,
    reportAccessToken,
    publicReport,
    internalAtsResult,
    mentorCandidates,
    freeAdvice: freeMentorPlan,
    paidAdvice,
    premiumReport,
    retrievalStatus,
  };
}

export async function scoreWithHostedFirst(input = {}) {
  try {
    const hosted = await scoreWithHostedAtsSystem(input);
    return {
      rawScoreResult: hosted.rawScoreResult,
      source: 'hosted-api',
      warning: null,
    };
  } catch (error) {
    const warning = error?.message || 'Hosted ATS API unavailable';
    console.warn('[ATS-System] Hosted API unavailable, using local fallback:', warning);
    const local = scoreResumeSystem(input.resumeText || '', input.jobTitle || '', input.jdText || '');
    return {
      rawScoreResult: {
        ...local,
        engine: local.engine || 'ats-system-local-fallback',
        source: 'local-fallback',
        fallbackReason: warning,
      },
      source: 'local-fallback',
      warning,
    };
  }
}
