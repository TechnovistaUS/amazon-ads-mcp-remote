export interface BidRule {
  ruleId: string;
  campaignId: string;
  name: string;
  condition: string;
  adjustment: number;
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BidAdjustmentRecord {
  campaignId: string;
  adGroupId?: string;
  previousBid: number;
  newBid: number;
  reason: string;
  timestamp: string;
}

export interface BidAutomation {
  automationId: string;
  campaignId: string;
  targetAcos: number;
  rules: string[];
  enabled: boolean;
  createdAt: string;
}

const bidRules = new Map<string, BidRule>();
const adjustmentHistory: BidAdjustmentRecord[] = [];
const bidAutomations = new Map<string, BidAutomation>();

let ruleCounter = 1;
let automationCounter = 1;

export function createBidRule(
  campaignId: string,
  name: string,
  condition: string,
  adjustment: number,
  priority: number
): BidRule {
  const ruleId = `rule_${ruleCounter++}_${Date.now()}`;
  const now = new Date().toISOString();
  const rule: BidRule = {
    ruleId,
    campaignId,
    name,
    condition,
    adjustment,
    priority,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  };
  bidRules.set(ruleId, rule);
  return rule;
}

export function getBidRules(campaignId?: string): BidRule[] {
  const all = Array.from(bidRules.values());
  return campaignId ? all.filter((r) => r.campaignId === campaignId) : all;
}

export function getBidRule(ruleId: string): BidRule | undefined {
  return bidRules.get(ruleId);
}

export function updateBidRule(
  ruleId: string,
  updates: Partial<Omit<BidRule, "ruleId" | "createdAt">>
): BidRule | null {
  const rule = bidRules.get(ruleId);
  if (!rule) return null;
  const updated = { ...rule, ...updates, updatedAt: new Date().toISOString() };
  bidRules.set(ruleId, updated);
  return updated;
}

export function deleteBidRule(ruleId: string): boolean {
  return bidRules.delete(ruleId);
}

export function recordBidAdjustment(record: Omit<BidAdjustmentRecord, "timestamp">): void {
  adjustmentHistory.push({ ...record, timestamp: new Date().toISOString() });
  if (adjustmentHistory.length > 500) adjustmentHistory.shift();
}

export function getAdjustmentHistory(campaignId?: string): BidAdjustmentRecord[] {
  return campaignId
    ? adjustmentHistory.filter((r) => r.campaignId === campaignId)
    : [...adjustmentHistory];
}

export function createBidAutomation(
  campaignId: string,
  targetAcos: number,
  ruleIds: string[]
): BidAutomation {
  const automationId = `auto_${automationCounter++}_${Date.now()}`;
  const automation: BidAutomation = {
    automationId,
    campaignId,
    targetAcos,
    rules: ruleIds,
    enabled: true,
    createdAt: new Date().toISOString(),
  };
  bidAutomations.set(automationId, automation);
  return automation;
}

export function getBidAutomation(automationId: string): BidAutomation | undefined {
  return bidAutomations.get(automationId);
}

export function getBidAutomations(campaignId?: string): BidAutomation[] {
  const all = Array.from(bidAutomations.values());
  return campaignId ? all.filter((a) => a.campaignId === campaignId) : all;
}
