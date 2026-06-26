"use strict";

const FULL_STACK_ROLE = "full_stack_engineer";
const SOFTWARE_ROLE_FAMILY = "software_engineer";

function hasFullStackSignal(value = "") {
  const text = String(value || "").toLowerCase();
  return /\bfull[-\s]?stack\b|\bfullstack\b/.test(text) || /全[栈棧]/.test(String(value || ""));
}

function normalizeTargetRole(value = "") {
  const text = String(value || "").trim();
  if (!text) return "";
  const snake = text
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^\p{L}\p{N}_]+/gu, "")
    .replace(/^_+|_+$/g, "");
  if (snake === "full_stack" || snake === "fullstack" || snake === "full_stack_developer" || hasFullStackSignal(text)) {
    return FULL_STACK_ROLE;
  }
  return snake;
}

function roleFamilyForTargetRole(targetRole = "", fallback = "") {
  const normalized = normalizeTargetRole(targetRole);
  if (normalized === FULL_STACK_ROLE) return SOFTWARE_ROLE_FAMILY;
  return fallback || normalized || "";
}

function expandTargetRoles(targetRole = "", roleFamily = "") {
  const normalizedTarget = normalizeTargetRole(targetRole);
  const normalizedFamily = roleFamilyForTargetRole(normalizedTarget || targetRole, normalizeTargetRole(roleFamily));
  const roles = [];
  if (normalizedTarget) roles.push(normalizedTarget);
  if (normalizedFamily && normalizedFamily !== normalizedTarget) roles.push(normalizedFamily);
  roles.push("universal");
  return [...new Set(roles.filter(Boolean))];
}

module.exports = {
  FULL_STACK_ROLE,
  SOFTWARE_ROLE_FAMILY,
  hasFullStackSignal,
  normalizeTargetRole,
  roleFamilyForTargetRole,
  expandTargetRoles,
};
