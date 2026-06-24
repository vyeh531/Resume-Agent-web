import db from '../../database';

const PENDING_TTL_MS = 1000 * 60 * 20;
const pendingReports = globalThis.__resumePendingReports || new Map();
globalThis.__resumePendingReports = pendingReports;

function cleanupPendingReports() {
  const now = Date.now();
  for (const [reportId, entry] of pendingReports.entries()) {
    if (now - entry.createdAt > PENDING_TTL_MS) pendingReports.delete(reportId);
  }
}

export function stashPendingReport(reportData) {
  cleanupPendingReports();
  pendingReports.set(reportData.reportId, {
    reportData,
    createdAt: Date.now(),
    savePromise: null,
  });
}

export function savePendingReportInBackground(reportId) {
  const entry = pendingReports.get(reportId);
  if (!entry) return null;
  if (!entry.savePromise) {
    entry.savePromise = db.saveAtsReport(entry.reportData)
      .then(() => {
        console.log('[ATS Report Save] pending report saved', JSON.stringify({ reportId }));
        pendingReports.delete(reportId);
        return true;
      })
      .catch((error) => {
        entry.savePromise = null;
        console.warn('[ATS Report Save] pending report save failed', JSON.stringify({
          reportId,
          error: error.message,
        }));
        return false;
      });
  }
  return entry.savePromise;
}

export async function ensurePendingReportSaved(reportId) {
  cleanupPendingReports();
  const entry = pendingReports.get(reportId);
  if (!entry) return false;
  return Boolean(await savePendingReportInBackground(reportId));
}

