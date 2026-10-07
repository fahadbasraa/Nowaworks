export const SYSTEM_PROMPT = `You convert a meeting transcript into projects and tasks for NovaWorks Technologies.

Rules:
1. Use ONLY people from the provided directory, referenced by their \`code\`. Managers must have role MANAGER; task assignees must have role AGENT.
2. When a value is changed later in the meeting (deadline, hours, owner), use the FINAL agreed value. An explicit final recap overrides earlier statements.
3. Do not create tasks for features that were rejected, excluded or deferred to future work.
4. People who are not in the directory (clients, end users, outsiders) are never assigned work.
5. One task per distinct piece of work discussed. Do not merge tasks with the same owner, and do not split a task into sub-tasks.
6. estimatedHours is developer effort hours as stated, not calendar days. No management hours.
7. Dates are YYYY-MM-DD. Use the meeting year if no year is given.
8. If a required value cannot be determined, do NOT guess. Add it to unresolved.
9. Descriptions: 1-2 sentences, include scope boundaries mentioned (e.g. "demo cart, no real payments").
10. Record every notable judgment call you made in \`decisions\`:
    - type "revised": a deadline, hours estimate, or owner that was stated and then changed later in the meeting. Set \`subject\` to the task or project name, \`from\` to the earlier value, \`to\` to the final value, and \`reason\` to a short note (e.g. "owner corrected in final recap").
    - type "excluded": a feature, task, or project that was discussed but rejected, deferred, or explicitly left out. Set \`subject\` to the feature/task name and \`reason\` to why it was excluded.
    - type "ignored_person": a person mentioned who is not in the directory (a client, end user, or outsider) and was therefore not assigned any work. Set \`subject\` to their name and \`reason\` to why they were not assigned work.
    Leave \`from\`/\`to\` unset for "excluded" and "ignored_person" entries.

You must call the submit_plan tool with your result. Do not respond with plain text.`;

export const SUBMIT_PLAN_TOOL = {
  name: "submit_plan",
  description: "Submit the extracted projects and tasks from the meeting transcript.",
  parameters: {
    type: "object",
    properties: {
      projects: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            clientName: { type: "string" },
            description: { type: "string" },
            managerId: { type: "string", description: "Directory code of the manager, e.g. PM01" },
            deadline: { type: "string", description: "YYYY-MM-DD" },
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  assigneeId: { type: "string", description: "Directory code of the agent, e.g. DEV01" },
                  deadline: { type: "string", description: "YYYY-MM-DD" },
                  estimatedHours: { type: "number" },
                },
                required: ["title", "assigneeId", "deadline", "estimatedHours"],
              },
            },
          },
          required: ["name", "clientName", "managerId", "deadline", "tasks"],
        },
      },
      unresolved: {
        type: "array",
        items: {
          type: "object",
          properties: {
            project: { type: "string" },
            task: { type: "string", description: "Omit this field for project-level issues that aren't tied to one task." },
            field: { type: "string" },
            reason: { type: "string" },
          },
          required: ["project", "field", "reason"],
        },
      },
      decisions: {
        type: "array",
        description: "Judgment calls made while extracting the plan: revised values, excluded features, and people outside the directory who were not assigned work.",
        items: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["revised", "excluded", "ignored_person"] },
            subject: { type: "string", description: "The task, project, feature, or person this decision is about." },
            from: { type: "string", description: "The earlier value, for \"revised\" decisions only." },
            to: { type: "string", description: "The final value, for \"revised\" decisions only." },
            reason: { type: "string" },
          },
          required: ["type", "subject", "reason"],
        },
      },
    },
    required: ["projects", "unresolved", "decisions"],
  },
};

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

export function extractMeetingDate(transcript) {
  const match = transcript.match(
    /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/i
  );
  if (!match) return null;
  const day = String(match[1]).padStart(2, "0");
  const month = String(MONTHS[match[2].toLowerCase()]).padStart(2, "0");
  const year = match[3];
  return `${year}-${month}-${day}`;
}

export function buildUserMessage({ meetingDate, directory, transcript }) {
  return `MEETING DATE: ${meetingDate}\n\nDIRECTORY:\n${JSON.stringify(directory)}\n\nTRANSCRIPT:\n${transcript}`;
}
