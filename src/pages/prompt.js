// export function getModuleAuditPrompt(modulesJson) {
//   return `You are a Senior Zoho CRM Audit Consultant. Analyze the modules below and return ONLY valid JSON — no prose, no markdown.

// <modules_data>
// ${JSON.stringify(modulesJson)}
// </modules_data>

// Run these checks on each module:

// 1. UNUSED CUSTOM MODULE (HIGH) — custom + 0 records or no activity in 180 days
// 2. EMPTY MODULE (MEDIUM) — record count = 0
// 3. DUPLICATE PURPOSE (HIGH) — modules serving the same business function (compare names, fields, relationships)
// 4. HIDDEN MODULE (MEDIUM) — hidden from nav or all profiles
// 5. ORPHAN MODULE (CRITICAL) — exists but no active profile has access
// 6. ADOPTION SCORE (0–100) — based on records, last activity, user access, automations; 0–20=Unused, 21–50=Low, 51–80=Moderate, 81–100=High
// 7. DEPENDENCY ANALYSIS — used by workflows, blueprints, functions, reports, dashboards, validation/assignment rules

// Return this exact JSON shape:

// {
//   "summary": {
//     "totalModules": 0,
//     "customModules": 0,
//     "unusedModules": 0,
//     "duplicateModules": 0,
//     "hiddenModules": 0,
//     "orphanModules": 0,
//     "overallHealthScore": 0
//   },
//   "findings": [{
//     "moduleName": "",
//     "severity": "Critical|High|Medium|Low",
//     "issueType": "",
//     "description": "",
//     "businessImpact": "",
//     "recommendation": ""
//   }],
//   "moduleScores": [{
//     "moduleName": "",
//     "adoptionScore": 0,
//     "dependencyScore": 0,
//     "healthScore": 0
//   }]
// }

// Rules: evidence-based findings only, no assumptions, prioritize Critical/High, include businessImpact for every finding.`;
// }