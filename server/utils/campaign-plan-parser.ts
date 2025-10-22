/**
 * Campaign Plan Parser
 * 
 * Utilities for parsing campaign plan structure and tracking email generation progress
 */

export interface PlanEmail {
  date: string;
  description: string;
  phase: string;
  index: number; // Position in overall sequence
}

/**
 * Parse a campaign plan's generated text to extract the email sequence
 * Looks for the "Dated Calendar & Cadence" section and extracts individual emails
 */
export function parseCampaignPlanEmails(planText: string): PlanEmail[] {
  const emails: PlanEmail[] = [];
  
  // Find the calendar section
  const calendarMatch = planText.match(/Phases, dates, and touchplan[\s\S]*?(?=\n\n[A-Z]|$)/i);
  if (!calendarMatch) {
    return emails;
  }
  
  const calendarSection = calendarMatch[0];
  
  // Extract phases and their emails
  // Pattern: - Phase (Date range)
  //   - Month Day (Weekday): Email description
  const phasePattern = /- ([^(]+)\s*\(([^)]+)\)([\s\S]*?)(?=\n- [A-Z]|\n\n|$)/g;
  
  let phaseMatch;
  let emailIndex = 0;
  
  while ((phaseMatch = phasePattern.exec(calendarSection)) !== null) {
    const phaseName = phaseMatch[1].trim();
    const emailsText = phaseMatch[3];
    
    // Extract individual emails within this phase
    // Pattern: - Month Day (Weekday): Description
    const emailPattern = /- (\w+ \d+) \((\w+)\): ([^\n]+)/g;
    let emailMatch;
    
    while ((emailMatch = emailPattern.exec(emailsText)) !== null) {
      emails.push({
        date: emailMatch[1],
        description: emailMatch[3].trim(),
        phase: phaseName,
        index: emailIndex++
      });
    }
  }
  
  return emails;
}

/**
 * Find the next email in sequence based on what has been generated
 */
export function getNextEmail(planEmails: PlanEmail[], generatedEmails: string[]): PlanEmail | null {
  // generatedEmails contains descriptions or partial matches
  for (const email of planEmails) {
    const alreadyGenerated = generatedEmails.some(gen => 
      email.description.toLowerCase().includes(gen.toLowerCase()) ||
      gen.toLowerCase().includes(email.description.substring(0, 30).toLowerCase())
    );
    
    if (!alreadyGenerated) {
      return email;
    }
  }
  
  return null; // All emails generated
}

/**
 * Format next email suggestion for AI prompt
 */
export function formatNextEmailSuggestion(nextEmail: PlanEmail): string {
  return `The next email in the campaign plan is: **${nextEmail.description}** (${nextEmail.date}, ${nextEmail.phase} phase). Would you like me to generate this email next?`;
}
