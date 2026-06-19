import { normalizeLocale, isEnglishLocale } from '../../src/i18n/locale';
import { retrieveAdviceCardsByIds } from '../../services/mentorAdviceRetrieval';

function cloneJson(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function collectAdviceIds(value, out = new Set()) {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    value.forEach((item) => collectAdviceIds(item, out));
    return out;
  }
  if (value.adviceId) out.add(String(value.adviceId));
  for (const child of Object.values(value)) collectAdviceIds(child, out);
  return out;
}

function overlayCard(target, card) {
  if (!target || !card) return target;
  const next = { ...target };
  const problem = card.problemSummary || target.problemSummary || target.currentDiagnosis || '';
  const action = card.actionSummary || target.actionSummary || target.action || '';
  next.title = card.title || target.title;
  next.problemSummary = problem;
  next.currentDiagnosis = problem;
  next.actionSummary = action;
  next.action = action;
  next.mentorLens = card.mentorInsight || card.mentorLens || target.mentorLens || '';
  next.reason = card.mentorInsight || card.reason || target.reason || '';
  next.mentorInsight = card.mentorInsight || target.mentorInsight || '';
  next.hrPerspective = card.hrPerspective || target.hrPerspective || '';
  next.HR_os = card.HR_os || card.hrPerspective || target.HR_os || '';
  next.example = card.example || target.example || '';
  next.canonicalTitle = card.canonicalTitle || target.canonicalTitle || '';
  next.humanizedMentorInsight = card.humanizedMentorInsight || target.humanizedMentorInsight || '';
  next.humanizedHrPerspective = card.humanizedHrPerspective || target.humanizedHrPerspective || '';
  next.locale = card.locale || target.locale;
  next.translationFallback = Boolean(card.translationFallback);
  return next;
}

function overlayAdviceTree(value, cardMap) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => overlayAdviceTree(item, cardMap));
  const adviceId = value.adviceId ? String(value.adviceId) : '';
  const overlaid = adviceId && cardMap.has(adviceId) ? overlayCard(value, cardMap.get(adviceId)) : { ...value };
  for (const [key, child] of Object.entries(overlaid)) {
    if (child && typeof child === 'object') overlaid[key] = overlayAdviceTree(child, cardMap);
  }
  return overlaid;
}

async function localizedCardMapForReport(reportJson, locale) {
  const adviceIds = [...collectAdviceIds(reportJson)];
  if (!adviceIds.length) return new Map();
  return retrieveAdviceCardsByIds(adviceIds, { locale });
}

export async function hydrateStoredReportJsonForLocale(reportJson, locale) {
  const normalizedLocale = normalizeLocale(locale);
  const source = cloneJson(reportJson || {});
  const cardMap = await localizedCardMapForReport(source, normalizedLocale);
  const hydrated = overlayAdviceTree(source, cardMap);
  hydrated.locale = normalizedLocale;
  const cards = [...cardMap.values()];
  hydrated.translationFallback = isEnglishLocale(normalizedLocale) &&
    (!cards.length || cards.some((card) => card.translationFallback));
  return hydrated;
}
