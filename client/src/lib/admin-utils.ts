// Utility functions for admin-only features

export function isAdmin(): boolean {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.email === 'admin@campaigncraft.com';
  } catch {
    return false;
  }
}

export function shouldShowPromptIndicators(): boolean {
  return isAdmin();
}
