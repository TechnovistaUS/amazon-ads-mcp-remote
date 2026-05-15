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
export declare function createBidRule(campaignId: string, name: string, condition: string, adjustment: number, priority: number): BidRule;
export declare function getBidRules(campaignId?: string): BidRule[];
export declare function getBidRule(ruleId: string): BidRule | undefined;
export declare function updateBidRule(ruleId: string, updates: Partial<Omit<BidRule, "ruleId" | "createdAt">>): BidRule | null;
export declare function deleteBidRule(ruleId: string): boolean;
export declare function recordBidAdjustment(record: Omit<BidAdjustmentRecord, "timestamp">): void;
export declare function getAdjustmentHistory(campaignId?: string): BidAdjustmentRecord[];
export declare function createBidAutomation(campaignId: string, targetAcos: number, ruleIds: string[]): BidAutomation;
export declare function getBidAutomation(automationId: string): BidAutomation | undefined;
export declare function getBidAutomations(campaignId?: string): BidAutomation[];
//# sourceMappingURL=bid-store.d.ts.map