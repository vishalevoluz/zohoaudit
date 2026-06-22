// ─── CRM Audit Prompts (server-side) ─────────────────────────────────────────

function getModuleAuditPrompt(modulesJson) {
  return `You are a Senior Zoho CRM Audit Consultant.

Your task is to perform a Module Audit on a Zoho CRM organization.

Input:
The following JSON contains all CRM modules with their metadata, profiles, permissions, record counts, visibility settings, and relationships.

<modules_data>
${JSON.stringify(modulesJson, null, 2)}
</modules_data>

Audit Objective:
Analyze every module and identify configuration issues, risks, unused components, and optimization opportunities.

Step 1: For each module capture:
* Module Name
* API Name
* Module Type (Standard / Custom)
* Record Count
* Created Date
* Last Modified Date
* Profiles Assigned
* Visibility Status
* Related Lists
* Lookup Relationships

Step 2: Run the following audit checks.

CHECK 1: Custom Modules Never Used
Condition:
* Custom Module
* Record Count = 0 OR no records created in last 180 days
Severity: HIGH

CHECK 2: Modules With Zero Records
Condition: Record Count = 0
Severity: MEDIUM

CHECK 3: Duplicate Modules Serving Same Purpose
Analyze module names, descriptions, similar fields and relationships.
Examples: "Project Requests" / "Project Intake", "Customer Accounts" / "Client Accounts"
Severity: HIGH

CHECK 4: Hidden Modules
Condition: Module hidden from navigation or hidden from all profiles
Severity: MEDIUM

CHECK 5: Modules Not Included In Any Profile
Condition: Module exists but no active profile has access
Severity: CRITICAL

CHECK 6: Module Adoption Analysis
Calculate adoption score (0–100) based on:
* Number of records
* Last activity date
* Number of users accessing module
* Number of automations connected
Scoring: 0–20 = Unused, 21–50 = Low, 51–80 = Moderate, 81–100 = High

CHECK 7: Business Process Dependency Analysis
Check whether module is used by: Workflows, Blueprints, Functions, Reports, Dashboards, Validation Rules, Assignment Rules
Output: Dependency Count and Details

Step 3: Return ONLY valid JSON — no prose, no markdown fences, no explanation:

{
  "summary": {
    "totalModules": 0,
    "customModules": 0,
    "unusedModules": 0,
    "duplicateModules": 0,
    "hiddenModules": 0,
    "orphanModules": 0,
    "overallHealthScore": 0
  },
  "findings": [
    {
      "moduleName": "",
      "severity": "Critical | High | Medium | Low",
      "issueType": "",
      "description": "",
      "businessImpact": "",
      "recommendation": ""
    }
  ],
  "moduleScores": [
    {
      "moduleName": "",
      "adoptionScore": 0,
      "dependencyScore": 0,
      "healthScore": 0
    }
  ]
}

Rules:
* Do not assume data that is not provided.
* Flag only evidence-based findings.
* Prioritize Critical and High severity issues first.
* Include businessImpact for every finding.
* Calculate overallHealthScore from 0–100 based on all findings.`;
}

module.exports = { getModuleAuditPrompt };
