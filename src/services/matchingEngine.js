import { tokenizeText, jaccardSimilarity, normalizeColor } from '../utils/helpers';
import { storage, COLLECTIONS } from './storage';
import { createNotification } from './notifications';
import { STATUS } from '../utils/constants';

export const MATCH_THRESHOLD = 55;

export const WEIGHTS = {
  category: 0.25,
  color: 0.20,
  text: 0.25,
  location: 0.15,
  date: 0.15
};

export function calculateMatchScore(lostItem, foundItem) {
  const breakdown = { category: 0, color: 0, text: 0, location: 0, date: 0 };
  const reasons = [];

  // 1. Category (Exact match)
  if (lostItem.category === foundItem.category) {
    breakdown.category = 1.0;
    reasons.push(`Same category: ${lostItem.category}`);
  }

  // 2. Color (Exact or Synonym match)
  if (lostItem.color && foundItem.color) {
    const lColor = normalizeColor(lostItem.color);
    const fColor = normalizeColor(foundItem.color);
    if (lColor === fColor) {
      breakdown.color = 1.0;
      reasons.push(`Colors match: ${lostItem.color}`);
    } else if (lColor && fColor && (lColor.includes(fColor) || fColor.includes(lColor))) {
      breakdown.color = 0.8;
      reasons.push('Colors are similar');
    }
  }

  // 3. Text (Tokenize and Jaccard)
  const lText = `${lostItem.title || ''} ${lostItem.description || ''} ${lostItem.brand || ''}`;
  const fText = `${foundItem.title || ''} ${foundItem.description || ''} ${foundItem.brand || ''}`;
  const lTokens = tokenizeText(lText);
  const fTokens = tokenizeText(fText);
  const textSim = jaccardSimilarity(lTokens, fTokens);
  breakdown.text = textSim;
  if (textSim > 0.3) {
    reasons.push('Similar descriptions/brand');
  }

  // 4. Location (Exact match)
  if (lostItem.locationId && lostItem.locationId === foundItem.locationId) {
    breakdown.location = 1.0;
    reasons.push(`Same location: ${lostItem.locationId}`);
  }

  // 5. Date (Decay over 30 days)
  const lDate = new Date(lostItem.date || lostItem.createdAt);
  const fDate = new Date(foundItem.date || foundItem.createdAt);
  // Found date should ideally be >= lost date
  const diffTime = fDate - lDate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  if (diffDays >= 0) {
    const dateScore = Math.max(0, 1 - (diffDays / 30));
    breakdown.date = dateScore;
    if (dateScore > 0.8) {
      reasons.push(`Found ${Math.round(diffDays)} days after loss`);
    } else if (dateScore > 0) {
      reasons.push('Dates are within 30 days');
    }
  }

  // Final weighted score
  const finalScore = Math.round(
    ((breakdown.category * WEIGHTS.category) +
    (breakdown.color * WEIGHTS.color) +
    (breakdown.text * WEIGHTS.text) +
    (breakdown.location * WEIGHTS.location) +
    (breakdown.date * WEIGHTS.date)) * 100
  );

  return { score: finalScore, breakdown, reasons };
}

export function findMatches(newItem, type) {
  const isLost = type === 'lost';
  const targetCollection = isLost ? COLLECTIONS.FOUND_ITEMS : COLLECTIONS.LOST_ITEMS;
  const candidates = storage.query(targetCollection, item => item.status === STATUS.ACTIVE);

  const matches = candidates.map(candidate => {
    const lostItem = isLost ? newItem : candidate;
    const foundItem = isLost ? candidate : newItem;
    const { score, breakdown, reasons } = calculateMatchScore(lostItem, foundItem);
    return {
      matchedItem: candidate,
      score,
      breakdown,
      reasons
    };
  });

  return matches
    .filter(m => m.score >= MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score);
}

export function processNewItem(item, type) {
  const matches = findMatches(item, type);
  
  matches.forEach(matchObj => {
    const isLost = type === 'lost';
    const lostItemId = isLost ? item.id : matchObj.matchedItem.id;
    const foundItemId = isLost ? matchObj.matchedItem.id : item.id;
    
    // Create match record
    storage.create(COLLECTIONS.MATCHES, {
      lostItemId,
      foundItemId,
      score: matchObj.score,
      reasons: matchObj.reasons,
      status: 'pending'
    });

    // Create notifications for both parties
    const itemOwner = item.reportedBy;
    const matchedOwner = matchObj.matchedItem.reportedBy;
    
    if (itemOwner) {
      createNotification({
        recipientId: itemOwner,
        type: 'match_found',
        title: 'Potential Match Found',
        message: `We found a potential match for your ${type} item: ${item.title}`,
        relatedId: matchObj.matchedItem.id,
        relatedType: type === 'lost' ? 'found' : 'lost'
      });
    }

    if (matchedOwner && matchedOwner !== itemOwner) {
      createNotification({
        recipientId: matchedOwner,
        type: 'match_found',
        title: 'Potential Match Found',
        message: `A new ${type} item might match your report: ${matchObj.matchedItem.title}`,
        relatedId: item.id,
        relatedType: type
      });
    }
  });

  return matches;
}
