/**
 * Campaign Plan Parser
 * 
 * Utilities for parsing campaign plan structure and tracking email generation progress
 */

export interface PlanEmail {
  id: string; // Unique stable ID (e.g., "nov-4-warm-up")
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
      const date = emailMatch[1];
      const description = emailMatch[3].trim();
      
      // Generate stable ID from date and first few words of description
      const dateSlug = date.toLowerCase().replace(/\s+/g, '-');
      const descSlug = description.substring(0, 30).toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 20);
      const id = `${dateSlug}-${descSlug}`;
      
      emails.push({
        id,
        date,
        description,
        phase: phaseName,
        index: emailIndex++
      });
    }
  }
  
  return emails;
}

/**
 * Find the next email in sequence based on what has been generated
 * @param planEmails - All emails from the plan
 * @param generatedEmailIds - Array of email IDs that have been generated
 */
export function getNextEmail(planEmails: PlanEmail[], generatedEmailIds: string[]): PlanEmail | null {
  // Find the first email whose ID is not in the generated list
  for (const email of planEmails) {
    if (!generatedEmailIds.includes(email.id)) {
      return email;
    }
  }
  
  return null; // All emails generated
}

/**
 * Try to match a user message or campaign content to a plan email
 * Returns the email ID if a match is found
 */
export function matchMessageToEmail(message: string, planEmails: PlanEmail[]): string | null {
  const messageLower = message.toLowerCase();
  
  // Try to match by date mention
  for (const email of planEmails) {
    const dateLower = email.date.toLowerCase();
    if (messageLower.includes(dateLower)) {
      return email.id;
    }
  }
  
  // Try to match by description keywords
  for (const email of planEmails) {
    const descWords = email.description.toLowerCase().split(' ').filter(w => w.length > 4);
    const matchedWords = descWords.filter(word => messageLower.includes(word));
    
    // If 2+ significant words match, consider it a match
    if (matchedWords.length >= 2) {
      return email.id;
    }
  }
  
  return null;
}

/**
 * Format next email suggestion for AI prompt
 */
export function formatNextEmailSuggestion(nextEmail: PlanEmail): string {
  return `The next email in the campaign plan is: **${nextEmail.description}** (${nextEmail.date}, ${nextEmail.phase} phase). Would you like me to generate this email next?`;
}
