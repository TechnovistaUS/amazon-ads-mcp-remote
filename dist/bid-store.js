const bidRules = new Map();
const adjustmentHistory = [];
const bidAutomations = new Map();
let ruleCounter = 1;
let automationCounter = 1;
export function createBidRule(campaignId, name, condition, adjustment, priority) {
    const ruleId = `rule_${ruleCounter++}_${Date.now()}`;
    const now = new Date().toISOString();
    const rule = {
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
export function getBidRules(campaignId) {
    const all = Array.from(bidRules.values());
    return campaignId ? all.filter((r) => r.campaignId === campaignId) : all;
}
export function getBidRule(ruleId) {
    return bidRules.get(ruleId);
}
export function updateBidRule(ruleId, updates) {
    const rule = bidRules.get(ruleId);
    if (!rule)
        return null;
    const updated = { ...rule, ...updates, updatedAt: new Date().toISOString() };
    bidRules.set(ruleId, updated);
    return updated;
}
export function deleteBidRule(ruleId) {
    return bidRules.delete(ruleId);
}
export function recordBidAdjustment(record) {
    adjustmentHistory.push({ ...record, timestamp: new Date().toISOString() });
    if (adjustmentHistory.length > 500)
        adjustmentHistory.shift();
}
export function getAdjustmentHistory(campaignId) {
    return campaignId
        ? adjustmentHistory.filter((r) => r.campaignId === campaignId)
        : [...adjustmentHistory];
}
export function createBidAutomation(campaignId, targetAcos, ruleIds) {
    const automationId = `auto_${automationCounter++}_${Date.now()}`;
    const automation = {
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
export function getBidAutomation(automationId) {
    return bidAutomations.get(automationId);
}
export function getBidAutomations(campaignId) {
    const all = Array.from(bidAutomations.values());
    return campaignId ? all.filter((a) => a.campaignId === campaignId) : all;
}
//# sourceMappingURL=bid-store.js.map