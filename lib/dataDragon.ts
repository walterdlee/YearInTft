/**
 * Data Dragon CDN utilities for TFT assets
 * https://ddragon.leagueoflegends.com/
 */

const DDRAGON_VERSION = '15.24.1';
const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com/cdn';

/**
 * Get the URL for a TFT champion image
 * @param championId - The champion ID (e.g., "TFT15_Udyr" or "TFT16_Tristana")
 * @returns The full CDN URL for the champion image
 */
export function getTftChampionImage(championId: string): string {
  // For Set 16 champions, the format is: TFT16_{name}_splash_centered_0.TFT_Set16
  if (championId.startsWith('TFT16_') && !championId.includes('_splash_centered_0')) {
    return `${DDRAGON_BASE_URL}/${DDRAGON_VERSION}/img/tft-champion/${championId}_splash_centered_0.TFT_Set16.png`;
  }

  // For Set 15 champions, ensure the format is: TFT15_{name}.TFT_Set15
  if (championId.startsWith('TFT15_') && !championId.includes('.TFT_Set15')) {
    return `${DDRAGON_BASE_URL}/${DDRAGON_VERSION}/img/tft-champion/${championId}.TFT_Set15.png`;
  }

  return `${DDRAGON_BASE_URL}/${DDRAGON_VERSION}/img/tft-champion/${championId}.png`;
}

/**
 * Get the URL for a TFT item image
 * @param itemId - The item ID
 * @returns The full CDN URL for the item image
 */
export function getTftItemImage(itemId: string): string {
  return `${DDRAGON_BASE_URL}/${DDRAGON_VERSION}/img/tft-item/${itemId}.png`;
}

/**
 * Fetch TFT item data from Data Dragon
 * @returns Promise containing item data
 */
export async function fetchTftItemData(): Promise<Record<string, { name: string }>> {
  const response = await fetch(
    `${DDRAGON_BASE_URL}/${DDRAGON_VERSION}/data/en_US/tft-item.json`
  );
  const data = await response.json();
  return data.data;
}

/**
 * Fetch TFT tactician (little legend) data from Data Dragon
 * @returns Promise containing tactician data
 */
export async function fetchTftTacticianData(): Promise<Record<string, { name: string; image: { full: string } }>> {
  const response = await fetch(
    `${DDRAGON_BASE_URL}/${DDRAGON_VERSION}/data/en_US/tft-tactician.json`
  );
  const data = await response.json();
  return data.data;
}

/**
 * Get the URL for a TFT trait image
 * @param traitId - The trait ID
 * @returns The full CDN URL for the trait image
 */
export function getTftTraitImage(traitId: string): string {
  return `${DDRAGON_BASE_URL}/${DDRAGON_VERSION}/img/tft-trait/${traitId}.png`;
}

/**
 * Get the URL for a TFT ranked tier regalia image
 * @param tier - The rank tier (e.g., "IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER")
 * @returns The full CDN URL for the TFT rank regalia image
 */
export function getRankEmblemImage(tier: string): string {
  // Capitalize first letter, rest lowercase for the TFT Regalia format
  const tierFormatted = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
  return `${DDRAGON_BASE_URL}/${DDRAGON_VERSION}/img/tft-regalia/TFT_Regalia_${tierFormatted}.png`;
}

/**
 * Get the URL for a TFT little legend (companion) image
 * @param contentId - The companion content ID from the match data
 * @returns The full CDN URL for the companion image
 */
export function getLittleLegendImage(contentId: string): string {
  return `${DDRAGON_BASE_URL}/${DDRAGON_VERSION}/img/tft-companion/${contentId}.png`;
}
