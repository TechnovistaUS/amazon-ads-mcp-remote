/**
 * Amazon Ads Advanced Bidding Strategies Module
 * 
 * This module handles:
 * - Bid strategy management (manual, automatic, dynamic)
 * - Bid multipliers
 * - Bid rules for different campaign stages
 * - Custom performance-based rules
 * - Target ACoS bidding
 * - Min/Max bid constraints
 * - Bid automation
 */

import { z } from "zod";

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export enum BiddingStrategy {
  MANUAL = "manual",
  AUTOMATIC = "automatic",
  DYNAMIC = "dynamic",
}

export enum CampaignStage {
  LAUNCH = "launch", // Maximize impressions
  PERFORMANCE = "performance", // Target ACoS
  LIQUIDATE = "liquidate", // Maximize orders
  CUSTOM = "custom", // Custom rules
}

export interface BidMultiplier {
  adGroupId: string;
  adGroupName: string;
  keyword?: string;
  target?: string;
  currentBid: number;
  multiplier: number; // 0.5 = 50%, 1.5 = 150%
  newBid: number;
  adjustmentType: "increase" | "decrease";
  appliedAt: Date;
}

export interface BidRule {
  ruleId: string;
  campaignId: string;
  profileId: string;
  name: string;
  stage: CampaignStage;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  config: BidRuleConfig;
}

export interface BidRuleConfig {
  // Launch stage: Max impressions
  launch?: {
    bidAmount: number; // Base bid for new products
    maxDailyBudget: number;
    focusOnPlacement: "top" | "rest_of_page" | "product_pages";
  };

  // Performance stage: Target ACoS
  targetAcos?: {
    targetAcosPercentage: number; // e.g., 30 = 30%
    minBid: number;
    maxBid: number;
    adjustmentInterval: "daily" | "weekly"; // How often to adjust
    adjustmentAmount: number; // e.g., 0.05 = $0.05
  };

  // Liquidate stage: Max orders
  maxOrders?: {
    bidAmount: number; // Aggressive bid
    minAcosThreshold: number; // Don't go higher than X% ACoS
    maxDailyBudget: number;
  };

  // Custom rules
  custom?: {
    rules: CustomBidRule[];
  };
}

export interface CustomBidRule {
  id: string;
  name: string;
  condition: PerformanceCondition;
  action: BidAction;
  enabled: boolean;
}

export interface PerformanceCondition {
  metric: "acos" | "roas" | "cpc" | "ctr" | "conversion_rate" | "impressions";
  operator: "greater_than" | "less_than" | "equals" | "greater_or_equal" | "less_or_equal";
  value: number;
  timeWindow: "today" | "7days" | "14days" | "30days";
}

export interface BidAction {
  type: "increase_bid" | "decrease_bid" | "pause" | "resume" | "set_bid";
  bidAmount?: number; // For set_bid action
  adjustmentPercentage?: number; // For increase/decrease (-50 to +100)
  adjustmentAmount?: number; // Fixed dollar amount
}

export interface BidAutomation {
  automationId: string;
  campaignId: string;
  profileId: string;
  name: string;
  enabled: boolean;
  rules: AutomationRule[];
  lastExecuted?: Date;
  executionSchedule: "hourly" | "daily" | "weekly";
  createdAt: Date;
}

export interface AutomationRule {
  ruleId: string;
  priority: number; // 1 = highest priority
  condition: PerformanceCondition;
  action: BidAction;
  maxAdjustmentsPerDay: number;
  cooldownMinutes: number; // Wait X minutes before next adjustment
  lastExecuted?: Date;
}

export interface BidAdjustmentResult {
  success: boolean;
  campaignId: string;
  adGroupId?: string;
  previousBid: number;
  newBid: number;
  adjustment: number;
  adjustmentPercentage: number;
  reason: string;
  timestamp: Date;
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const SetBiddingStrategySchema = z.object({
  profile_id: z.string().describe("Amazon advertiser profile ID"),
  campaign_id: z.string().describe("Campaign ID to update"),
  strategy: z
    .enum(["manual", "automatic", "dynamic"])
    .describe("Bidding strategy type"),
  description: z
    .string()
    .optional()
    .describe("Strategy description or notes"),
});

export const ApplyBidMultiplierSchema = z.object({
  profile_id: z.string().describe("Amazon advertiser profile ID"),
  ad_group_id: z.string().describe("Ad group ID to adjust"),
  multiplier: z
    .number()
    .min(0.1)
    .max(3.0)
    .describe(
      "Bid multiplier (0.5 = 50%, 1.5 = 150%). Range: 0.1 to 3.0"
    ),
  apply_to: z
    .enum(["all_keywords", "all_targets", "low_performers"])
    .optional()
    .describe("Which items to apply multiplier to"),
});

export const CreateBidRuleSchema = z.object({
  profile_id: z.string().describe("Amazon advertiser profile ID"),
  campaign_id: z.string().describe("Campaign ID"),
  campaign_name: z.string().describe("Campaign name (for reference)"),
  stage: z
    .enum(["launch", "performance", "liquidate", "custom"])
    .describe("Campaign stage"),
  rule_name: z.string().describe("Name for this bid rule"),

  // Launch stage options
  launch_bid: z
    .number()
    .optional()
    .describe("(Launch) Base bid amount in dollars"),
  launch_max_budget: z
    .number()
    .optional()
    .describe("(Launch) Maximum daily budget"),
  launch_placement_focus: z
    .enum(["top", "rest_of_page", "product_pages"])
    .optional()
    .describe(
      "(Launch) Ad placement focus for impressions"
    ),

  // Performance stage options
  target_acos: z
    .number()
    .optional()
    .describe("(Performance) Target ACoS percentage (e.g., 30 for 30%)"),
  min_bid: z
    .number()
    .optional()
    .describe("(Performance) Minimum bid amount"),
  max_bid: z
    .number()
    .optional()
    .describe("(Performance) Maximum bid amount"),
  acos_adjustment_interval: z
    .enum(["daily", "weekly"])
    .optional()
    .describe("(Performance) How often to adjust bids"),
  acos_adjustment_amount: z
    .number()
    .optional()
    .describe(
      "(Performance) Dollar amount to adjust per interval"
    ),

  // Liquidate stage options
  liquidate_bid: z
    .number()
    .optional()
    .describe("(Liquidate) Aggressive bid amount"),
  max_acos_threshold: z
    .number()
    .optional()
    .describe("(Liquidate) Don't exceed this ACoS percentage"),

  // Custom rules
  custom_rules: z
    .array(
      z.object({
        name: z.string().describe("Rule name"),
        metric: z
          .enum(["acos", "roas", "cpc", "ctr", "conversion_rate", "impressions"])
          .describe("Performance metric to monitor"),
        operator: z
          .enum([
            "greater_than",
            "less_than",
            "equals",
            "greater_or_equal",
            "less_or_equal",
          ])
          .describe("Comparison operator"),
        value: z.number().describe("Threshold value for the metric"),
        time_window: z
          .enum(["today", "7days", "14days", "30days"])
          .describe("How far back to look at data"),
        action_type: z
          .enum(["increase_bid", "decrease_bid", "pause", "resume", "set_bid"])
          .describe("Action to take when condition is met"),
        adjustment_percentage: z
          .number()
          .optional()
          .describe("Percentage to adjust bid (-100 to +100)"),
        bid_amount: z
          .number()
          .optional()
          .describe("Fixed bid amount (for set_bid action)"),
      })
    )
    .optional()
    .describe("(Custom) Array of custom bidding rules"),
});

export const AdjustBidSchema = z.object({
  profile_id: z.string().describe("Amazon advertiser profile ID"),
  ad_group_id: z.string().describe("Ad group ID"),
  adjustment_type: z
    .enum(["percentage", "fixed_amount", "set_to"])
    .describe("Type of adjustment"),
  adjustment_value: z
    .number()
    .describe("Adjustment value (percentage, amount, or absolute bid)"),
  reason: z.string().describe("Reason for adjustment"),
  min_bid: z
    .number()
    .optional()
    .describe("Minimum bid threshold"),
  max_bid: z
    .number()
    .optional()
    .describe("Maximum bid threshold"),
});

export const SetTargetAcosSchema = z.object({
  profile_id: z.string().describe("Amazon advertiser profile ID"),
  campaign_id: z.string().describe("Campaign ID"),
  target_acos_percentage: z
    .number()
    .min(5)
    .max(500)
    .describe("Target ACoS percentage (5-500%)"),
  min_bid: z
    .number()
    .describe("Minimum bid to maintain"),
  max_bid: z
    .number()
    .describe("Maximum bid to allow"),
  adjustment_frequency: z
    .enum(["hourly", "daily", "weekly"])
    .describe("How often to check and adjust"),
  enable_automation: z
    .boolean()
    .default(true)
    .describe("Enable automatic bid adjustments"),
});

export const CreateBidAutomationSchema = z.object({
  profile_id: z.string().describe("Amazon advertiser profile ID"),
  campaign_id: z.string().describe("Campaign ID"),
  automation_name: z.string().describe("Name for this automation"),
  execution_schedule: z
    .enum(["hourly", "daily", "weekly"])
    .describe("How often automation rules execute"),
  rules: z
    .array(
      z.object({
        priority: z
          .number()
          .min(1)
          .describe("Rule priority (1 = highest)"),
        metric: z
          .enum(["acos", "roas", "cpc", "ctr", "conversion_rate"])
          .describe("Metric to monitor"),
        operator: z
          .enum([
            "greater_than",
            "less_than",
            "greater_or_equal",
            "less_or_equal",
          ])
          .describe("Comparison operator"),
        threshold: z
          .number()
          .describe("Threshold value"),
        time_window: z
          .enum(["today", "7days", "14days", "30days"])
          .describe("Data lookback window"),
        action: z
          .enum(["increase_bid", "decrease_bid", "pause", "resume"])
          .describe("Action to execute"),
        adjustment_value: z
          .number()
          .describe("Adjustment percentage (-100 to +100)"),
        max_adjustments_per_day: z
          .number()
          .default(5)
          .describe("Maximum adjustments allowed per day"),
        cooldown_minutes: z
          .number()
          .default(60)
          .describe(
            "Minutes to wait before next adjustment"
          ),
      })
    )
    .describe("Array of automation rules"),
});

export const GetBidRuleSchema = z.object({
  profile_id: z.string().describe("Amazon advertiser profile ID"),
  campaign_id: z.string().describe("Campaign ID"),
  rule_id: z.string().optional().describe("Specific rule ID to retrieve"),
});

export const UpdateBidRuleSchema = z.object({
  profile_id: z.string().describe("Amazon advertiser profile ID"),
  rule_id: z.string().describe("Bid rule ID to update"),
  enabled: z.boolean().optional().describe("Enable or disable the rule"),
  config: z.record(z.any()).optional().describe("Updated rule configuration"),
});

// ============================================================================
// BIDDING STRATEGIES CLIENT
// ============================================================================

export class BiddingStrategiesClient {
  private biddingRules: Map<string, BidRule> = new Map();
  private bidAutomations: Map<string, BidAutomation> = new Map();
  private adjustmentHistory: BidAdjustmentResult[] = [];

  /**
   * Set bidding strategy for a campaign
   */
  async setBiddingStrategy(
    profileId: string,
    campaignId: string,
    strategy: BiddingStrategy,
    description?: string
  ): Promise<{ success: true; message: string; strategy: BiddingStrategy }> {
    // In real implementation, would call Amazon Ads API
    return {
      success: true,
      message: `Bidding strategy updated to ${strategy} for campaign ${campaignId}`,
      strategy,
    };
  }

  /**
   * Apply bid multiplier to ad group
   */
  async applyBidMultiplier(
    profileId: string,
    adGroupId: string,
    multiplier: number,
    applyTo?: string
  ): Promise<BidMultiplier> {
    // Simulated current bid (would come from API)
    const currentBid = 1.0;
    const newBid = Number((currentBid * multiplier).toFixed(2));
    const adjustment = Number((newBid - currentBid).toFixed(2));

    return {
      adGroupId,
      adGroupName: `Ad Group ${adGroupId}`,
      currentBid,
      multiplier,
      newBid,
      adjustmentType: multiplier > 1 ? "increase" : "decrease",
      appliedAt: new Date(),
    };
  }

  /**
   * Create a bid rule for a campaign stage
   */
  async createBidRule(
    profileId: string,
    campaignId: string,
    campaignName: string,
    stage: CampaignStage,
    ruleName: string,
    config: BidRuleConfig
  ): Promise<BidRule> {
    const ruleId = `rule_${Date.now()}`;
    const bidRule: BidRule = {
      ruleId,
      campaignId,
      profileId,
      name: ruleName,
      stage,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      config,
    };

    this.biddingRules.set(ruleId, bidRule);

    return bidRule;
  }

  /**
   * Get bid rules for a campaign
   */
  async getBidRules(
    profileId: string,
    campaignId: string,
    ruleId?: string
  ): Promise<BidRule[]> {
    if (ruleId) {
      const rule = this.biddingRules.get(ruleId);
      return rule ? [rule] : [];
    }

    return Array.from(this.biddingRules.values()).filter(
      (rule) => rule.campaignId === campaignId && rule.profileId === profileId
    );
  }

  /**
   * Adjust bid based on performance
   */
  async adjustBid(
    profileId: string,
    adGroupId: string,
    adjustmentType: "percentage" | "fixed_amount" | "set_to",
    adjustmentValue: number,
    reason: string,
    minBid?: number,
    maxBid?: number
  ): Promise<BidAdjustmentResult> {
    // Simulated current bid
    const previousBid = 1.5;
    let newBid = previousBid;

    switch (adjustmentType) {
      case "percentage":
        newBid = Number((previousBid * (1 + adjustmentValue / 100)).toFixed(2));
        break;
      case "fixed_amount":
        newBid = Number((previousBid + adjustmentValue).toFixed(2));
        break;
      case "set_to":
        newBid = adjustmentValue;
        break;
    }

    // Apply min/max constraints
    if (minBid) newBid = Math.max(newBid, minBid);
    if (maxBid) newBid = Math.min(newBid, maxBid);

    const result: BidAdjustmentResult = {
      success: true,
      campaignId: `campaign_${adGroupId}`,
      adGroupId,
      previousBid,
      newBid,
      adjustment: Number((newBid - previousBid).toFixed(2)),
      adjustmentPercentage: Number(
        (((newBid - previousBid) / previousBid) * 100).toFixed(1)
      ),
      reason,
      timestamp: new Date(),
    };

    this.adjustmentHistory.push(result);
    return result;
  }

  /**
   * Set target ACoS and enable automation
   */
  async setTargetAcos(
    profileId: string,
    campaignId: string,
    targetAcosPercentage: number,
    minBid: number,
    maxBid: number,
    adjustmentFrequency: "hourly" | "daily" | "weekly",
    enableAutomation: boolean
  ): Promise<{
    success: true;
    message: string;
    targetAcos: number;
    automationEnabled: boolean;
  }> {
    if (enableAutomation) {
      const automation: BidAutomation = {
        automationId: `automation_${Date.now()}`,
        campaignId,
        profileId,
        name: `Target ACoS ${targetAcosPercentage}%`,
        enabled: true,
        executionSchedule: adjustmentFrequency,
        rules: [
          {
            ruleId: `acos_rule_${Date.now()}`,
            priority: 1,
            condition: {
              metric: "acos",
              operator: "greater_than",
              value: targetAcosPercentage,
              timeWindow: "7days",
            },
            action: {
              type: "decrease_bid",
              adjustmentPercentage: -5,
            },
            maxAdjustmentsPerDay: 10,
            cooldownMinutes: 30,
          },
          {
            ruleId: `acos_rule_low_${Date.now()}`,
            priority: 2,
            condition: {
              metric: "acos",
              operator: "less_than",
              value: targetAcosPercentage * 0.7, // 70% of target
              timeWindow: "7days",
            },
            action: {
              type: "increase_bid",
              adjustmentPercentage: 5,
            },
            maxAdjustmentsPerDay: 10,
            cooldownMinutes: 30,
          },
        ],
        createdAt: new Date(),
      };

      this.bidAutomations.set(automation.automationId, automation);
    }

    return {
      success: true,
      message: `Target ACoS set to ${targetAcosPercentage}% for campaign ${campaignId}`,
      targetAcos: targetAcosPercentage,
      automationEnabled: enableAutomation,
    };
  }

  /**
   * Create custom bid automation
   */
  async createBidAutomation(
    profileId: string,
    campaignId: string,
    automationName: string,
    executionSchedule: "hourly" | "daily" | "weekly",
    rules: AutomationRule[]
  ): Promise<BidAutomation> {
    const automationId = `automation_${Date.now()}`;
    const automation: BidAutomation = {
      automationId,
      campaignId,
      profileId,
      name: automationName,
      enabled: true,
      rules: rules.sort((a, b) => a.priority - b.priority),
      executionSchedule,
      createdAt: new Date(),
    };

    this.bidAutomations.set(automationId, automation);
    return automation;
  }

  /**
   * Get automation details
   */
  async getAutomation(automationId: string): Promise<BidAutomation | null> {
    return this.bidAutomations.get(automationId) || null;
  }

  /**
   * Get adjustment history
   */
  getAdjustmentHistory(
    campaignId?: string,
    limit: number = 100
  ): BidAdjustmentResult[] {
    let history = this.adjustmentHistory;

    if (campaignId) {
      history = history.filter((h) => h.campaignId === campaignId);
    }

    return history.slice(-limit);
  }

  /**
   * Enable/disable bid rule
   */
  async updateBidRule(
    ruleId: string,
    enabled?: boolean,
    config?: BidRuleConfig
  ): Promise<BidRule | null> {
    const rule = this.biddingRules.get(ruleId);
    if (!rule) return null;

    if (enabled !== undefined) rule.isActive = enabled;
    if (config) rule.config = config;
    rule.updatedAt = new Date();

    this.biddingRules.set(ruleId, rule);
    return rule;
  }
}

export default BiddingStrategiesClient;
