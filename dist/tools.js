import { z } from "zod";
import { adsRequest, okText } from "./api-client.js";
import { getTokenStatus } from "./token-manager.js";
import { createBidRule, getBidRules, updateBidRule, deleteBidRule, recordBidAdjustment, getAdjustmentHistory, createBidAutomation, getBidAutomation, getBidAutomations, } from "./bid-store.js";
export function registerAllTools(server) {
    server.registerTool("amazon_ads_get_profiles", {
        title: "Get Advertiser Profiles",
        description: "Retrieve all Amazon Advertising profiles associated with the authenticated account. Returns profileId, countryCode, currencyCode, timezone, accountInfo. The profileId is required by all other tools.",
        inputSchema: {},
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async () => {
        const data = await adsRequest("GET", "/v2/profiles", "");
        return { content: [{ type: "text", text: okText(data) }] };
    });
    server.registerTool("amazon_ads_list_campaigns", {
        title: "List Campaigns",
        description: "List all campaigns for a given profile with optional filtering by state and campaign type. Args: profileId (string), stateFilter (enabled|paused|archived, optional), campaignType (sponsoredProducts|sponsoredBrands|sponsoredDisplay, optional), count (default 100), startIndex (default 0).",
        inputSchema: {
            profileId: z.string().describe("Advertiser profile ID"),
            stateFilter: z.enum(["enabled", "paused", "archived"]).optional().describe("Campaign state filter"),
            campaignType: z.enum(["sponsoredProducts", "sponsoredBrands", "sponsoredDisplay"]).optional().describe("Campaign type filter"),
            count: z.number().int().min(1).max(1000).default(100).describe("Max results"),
            startIndex: z.number().int().min(0).default(0).describe("Pagination offset"),
        },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async ({ profileId, stateFilter, campaignType, count, startIndex }) => {
        const params = { count, startIndex };
        if (stateFilter)
            params.stateFilter = stateFilter;
        if (campaignType)
            params.campaignType = campaignType;
        const data = await adsRequest("GET", "/v2/campaigns", profileId, undefined, params);
        return { content: [{ type: "text", text: okText(data) }] };
    });
    server.registerTool("amazon_ads_get_campaign_metrics", {
        title: "Get Campaign Metrics",
        description: "Retrieve performance metrics for a specific campaign. Args: profileId (string), campaignId (string), startDate (YYYYMMDD optional), endDate (YYYYMMDD optional). Returns impressions, clicks, cost, attributedSales, orders.",
        inputSchema: {
            profileId: z.string().describe("Advertiser profile ID"),
            campaignId: z.string().describe("Campaign ID"),
            startDate: z.string().optional().describe("Start date YYYYMMDD"),
            endDate: z.string().optional().describe("End date YYYYMMDD"),
        },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async ({ profileId, campaignId, startDate, endDate }) => {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const fmt = (d) => d.toISOString().slice(0, 10).replace(/-/g, "");
        const body = {
            reportDate: endDate ?? fmt(today),
            metrics: "impressions,clicks,cost,attributedSales30d,attributedUnitsOrdered30d",
            campaignId,
            startDate: startDate ?? fmt(thirtyDaysAgo),
            endDate: endDate ?? fmt(today),
        };
        const data = await adsRequest("POST", "/v2/sp/campaigns/report", profileId, body);
        return { content: [{ type: "text", text: okText(data) }] };
    });
    server.registerTool("amazon_ads_create_campaign", {
        title: "Create Campaign",
        description: "Create a new Sponsored Products campaign. Args: profileId, name (max 128 chars), dailyBudget (min 1.0), startDate (YYYYMMDD), endDate (YYYYMMDD optional), targetingType (manual|auto), state (enabled|paused, default paused), premiumBidAdjustment (boolean).",
        inputSchema: {
            profileId: z.string().describe("Advertiser profile ID"),
            name: z.string().min(1).max(128).describe("Campaign name"),
            dailyBudget: z.number().min(1).describe("Daily budget in account currency"),
            startDate: z.string().describe("Start date YYYYMMDD"),
            endDate: z.string().optional().describe("End date YYYYMMDD"),
            targetingType: z.enum(["manual", "auto"]).describe("Targeting type"),
            state: z.enum(["enabled", "paused"]).default("paused").describe("Initial state"),
            premiumBidAdjustment: z.boolean().default(false).describe("Enable top-of-search bid boost"),
        },
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    }, async ({ profileId, name, dailyBudget, startDate, endDate, targetingType, state, premiumBidAdjustment }) => {
        const body = { name, campaignType: "sponsoredProducts", targetingType, state, dailyBudget, startDate, premiumBidAdjustment };
        if (endDate)
            body.endDate = endDate;
        const data = await adsRequest("POST", "/v2/sp/campaigns", profileId, [body]);
        return { content: [{ type: "text", text: okText(data) }] };
    });
    server.registerTool("amazon_ads_update_campaign", {
        title: "Update Campaign",
        description: "Update an existing campaign's settings. Args: profileId, campaignId, name (optional), state (enabled|paused|archived, optional), dailyBudget (optional), endDate (YYYYMMDD optional).",
        inputSchema: {
            profileId: z.string().describe("Advertiser profile ID"),
            campaignId: z.string().describe("Campaign ID to update"),
            name: z.string().min(1).max(128).optional().describe("New campaign name"),
            state: z.enum(["enabled", "paused", "archived"]).optional().describe("New state"),
            dailyBudget: z.number().min(1).optional().describe("New daily budget"),
            endDate: z.string().optional().describe("New end date YYYYMMDD"),
        },
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, async ({ profileId, campaignId, name, state, dailyBudget, endDate }) => {
        const body = { campaignId };
        if (name !== undefined)
            body.name = name;
        if (state !== undefined)
            body.state = state;
        if (dailyBudget !== undefined)
            body.dailyBudget = dailyBudget;
        if (endDate !== undefined)
            body.endDate = endDate;
        const data = await adsRequest("PUT", "/v2/sp/campaigns", profileId, [body]);
        return { content: [{ type: "text", text: okText(data) }] };
    });
    server.registerTool("amazon_ads_get_account_info", {
        title: "Get Account Information",
        description: "Retrieve account information for a specific advertiser profile. Args: profileId. Returns account type, marketplace, timezone, currency.",
        inputSchema: {
            profileId: z.string().describe("Advertiser profile ID"),
        },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async ({ profileId }) => {
        const data = await adsRequest("GET", `/v2/profiles/${profileId}`, profileId);
        return { content: [{ type: "text", text: okText(data) }] };
    });
    server.registerTool("amazon_ads_get_token_status", {
        title: "Get Token Status",
        description: "Check the current OAuth access token status including validity and expiration time. Returns: { valid, status, expiresAt, expiresInSeconds }. Status values: valid | expiring_soon | expired | no_token.",
        inputSchema: {},
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, async () => {
        const status = getTokenStatus();
        return { content: [{ type: "text", text: okText(status) }] };
    });
    server.registerTool("amazon_ads_set_bidding_strategy", {
        title: "Set Bidding Strategy",
        description: "Set the bidding strategy for a Sponsored Products campaign. Args: profileId, campaignId, strategy (legacyForSales=down-only dynamic | autoForSales=up-down dynamic | manual=fixed bids).",
        inputSchema: {
            profileId: z.string().describe("Advertiser profile ID"),
            campaignId: z.string().describe("Campaign ID"),
            strategy: z.enum(["legacyForSales", "autoForSales", "manual"]).describe("Bidding strategy"),
        },
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, async ({ profileId, campaignId, strategy }) => {
        const data = await adsRequest("PUT", "/v2/sp/campaigns", profileId, [{ campaignId, bidding: { strategy } }]);
        return { content: [{ type: "text", text: okText(data) }] };
    });
    server.registerTool("amazon_ads_apply_bid_multiplier", {
        title: "Apply Bid Multiplier",
        description: "Scale all bids in a campaign by a multiplier (0.1x to 3.0x). Args: profileId, campaignId, multiplier (0.1-3.0, e.g. 1.5=+50%), adGroupId (optional, limits scope).",
        inputSchema: {
            profileId: z.string().describe("Advertiser profile ID"),
            campaignId: z.string().describe("Campaign ID"),
            multiplier: z.number().min(0.1).max(3.0).describe("Bid multiplier 0.1–3.0"),
            adGroupId: z.string().optional().describe("Optional ad group ID to scope the multiplier"),
        },
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    }, async ({ profileId, campaignId, multiplier, adGroupId }) => {
        const params = { campaignId };
        if (adGroupId)
            params.adGroupId = adGroupId;
        const keywords = await adsRequest("GET", "/v2/sp/keywords", profileId, undefined, params);
        if (!Array.isArray(keywords) || keywords.length === 0) {
            return { content: [{ type: "text", text: JSON.stringify({ message: "No keywords found", campaignId }) }] };
        }
        const updates = keywords.map((kw) => {
            const oldBid = kw.bid ?? 0.75;
            const newBid = Math.max(0.02, Math.round(oldBid * multiplier * 100) / 100);
            recordBidAdjustment({ campaignId, adGroupId, previousBid: oldBid, newBid, reason: `Multiplier x${multiplier}` });
            return { keywordId: kw.keywordId, bid: newBid };
        });
        const data = await adsRequest("PUT", "/v2/sp/keywords", profileId, updates);
        return { content: [{ type: "text", text: okText({ updated: updates.length, multiplier, data }) }] };
    });
    server.registerTool("amazon_ads_create_bid_rule", {
        title: "Create Bid Rule",
        description: "Create a bid rule for automatic bid adjustments. Args: campaignId, name, condition (e.g. 'acos > 30' | 'impressions < 100'), adjustment (-50 to +100 percent), priority (1-10, 1=highest).",
        inputSchema: {
            campaignId: z.string().describe("Campaign ID"),
            name: z.string().min(1).describe("Rule name"),
            condition: z.string().describe("Condition expression e.g. 'acos > 30'"),
            adjustment: z.number().min(-50).max(100).describe("Bid adjustment % (-50 to +100)"),
            priority: z.number().int().min(1).max(10).default(5).describe("Priority 1–10"),
        },
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    }, async ({ campaignId, name, condition, adjustment, priority }) => {
        const rule = createBidRule(campaignId, name, condition, adjustment, priority);
        return { content: [{ type: "text", text: okText(rule) }] };
    });
    server.registerTool("amazon_ads_get_bid_rules", {
        title: "Get Bid Rules",
        description: "Retrieve all bid rules, optionally filtered by campaign. Args: campaignId (optional). Returns array of rules with ruleId, condition, adjustment, priority, enabled status.",
        inputSchema: {
            campaignId: z.string().optional().describe("Campaign ID filter (omit for all rules)"),
        },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, async ({ campaignId }) => {
        const rules = getBidRules(campaignId);
        return { content: [{ type: "text", text: okText(rules) }] };
    });
    server.registerTool("amazon_ads_adjust_bid", {
        title: "Adjust Bid",
        description: "Manually set a specific bid amount for a keyword. Args: profileId, campaignId (for tracking), keywordId, newBid (min 0.02), reason (optional).",
        inputSchema: {
            profileId: z.string().describe("Advertiser profile ID"),
            campaignId: z.string().describe("Campaign ID for tracking"),
            keywordId: z.string().describe("Keyword ID to update"),
            newBid: z.number().min(0.02).describe("New bid amount (min $0.02)"),
            reason: z.string().default("Manual adjustment").describe("Reason for adjustment"),
        },
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, async ({ profileId, campaignId, keywordId, newBid, reason }) => {
        const existing = await adsRequest("GET", `/v2/sp/keywords/${keywordId}`, profileId);
        const previousBid = existing.bid ?? 0;
        const data = await adsRequest("PUT", "/v2/sp/keywords", profileId, [{ keywordId, bid: newBid }]);
        recordBidAdjustment({ campaignId, previousBid, newBid, reason });
        return { content: [{ type: "text", text: okText({ keywordId, previousBid, newBid, reason, result: data }) }] };
    });
    server.registerTool("amazon_ads_set_target_acos", {
        title: "Set Target ACoS",
        description: "Set a target ACoS percentage for a campaign. Creates bid rules to maintain the target. Args: profileId, campaignId, targetAcos (5-100).",
        inputSchema: {
            profileId: z.string().describe("Advertiser profile ID"),
            campaignId: z.string().describe("Campaign ID"),
            targetAcos: z.number().min(5).max(100).describe("Target ACoS percentage (5–100)"),
        },
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, async ({ campaignId, targetAcos }) => {
        const highRule = createBidRule(campaignId, `ACoS > ${targetAcos + 10}% — reduce bids`, `acos > ${targetAcos + 10}`, -15, 1);
        const lowRule = createBidRule(campaignId, `ACoS < ${targetAcos - 5}% — increase bids`, `acos < ${targetAcos - 5}`, 10, 2);
        return { content: [{ type: "text", text: okText({ targetAcos, campaignId, rulesCreated: [highRule, lowRule], message: `Target ACoS of ${targetAcos}% set.` }) }] };
    });
    server.registerTool("amazon_ads_create_bid_automation", {
        title: "Create Bid Automation",
        description: "Create a multi-rule bid automation for a campaign. Args: campaignId, targetAcos (5-100), ruleIds (array of rule IDs from amazon_ads_get_bid_rules).",
        inputSchema: {
            campaignId: z.string().describe("Campaign ID"),
            targetAcos: z.number().min(5).max(100).describe("Target ACoS %"),
            ruleIds: z.array(z.string()).min(1).describe("Rule IDs to include"),
        },
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    }, async ({ campaignId, targetAcos, ruleIds }) => {
        const automation = createBidAutomation(campaignId, targetAcos, ruleIds);
        return { content: [{ type: "text", text: okText(automation) }] };
    });
    server.registerTool("amazon_ads_update_bid_rule", {
        title: "Update Bid Rule",
        description: "Enable, disable, or modify an existing bid rule. Args: ruleId, enabled (boolean optional), condition (optional), adjustment (-50 to +100 optional), priority (1-10 optional), name (optional).",
        inputSchema: {
            ruleId: z.string().describe("Rule ID to update"),
            enabled: z.boolean().optional().describe("Enable or disable the rule"),
            condition: z.string().optional().describe("New condition expression"),
            adjustment: z.number().min(-50).max(100).optional().describe("New bid adjustment %"),
            priority: z.number().int().min(1).max(10).optional().describe("New priority 1–10"),
            name: z.string().optional().describe("New rule name"),
        },
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, async ({ ruleId, enabled, condition, adjustment, priority, name }) => {
        const updates = {};
        if (enabled !== undefined)
            updates.enabled = enabled;
        if (condition !== undefined)
            updates.condition = condition;
        if (adjustment !== undefined)
            updates.adjustment = adjustment;
        if (priority !== undefined)
            updates.priority = priority;
        if (name !== undefined)
            updates.name = name;
        const updated = updateBidRule(ruleId, updates);
        if (!updated) {
            return { content: [{ type: "text", text: JSON.stringify({ error: `Rule ${ruleId} not found` }) }] };
        }
        return { content: [{ type: "text", text: okText(updated) }] };
    });
    server.registerTool("amazon_ads_get_adjustment_history", {
        title: "Get Bid Adjustment History",
        description: "View the full history of bid adjustments. Args: campaignId (optional filter). Returns array of records with timestamp, previousBid, newBid, reason.",
        inputSchema: {
            campaignId: z.string().optional().describe("Campaign ID filter (omit for full history)"),
        },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, async ({ campaignId }) => {
        const history = getAdjustmentHistory(campaignId);
        return { content: [{ type: "text", text: okText(history) }] };
    });
    server.registerTool("amazon_ads_get_bid_automation", {
        title: "Get Bid Automation",
        description: "Retrieve bid automation configurations. Args: automationId (optional specific ID), campaignId (optional filter). Returns automation(s) with targetAcos, rules, enabled status.",
        inputSchema: {
            automationId: z.string().optional().describe("Specific automation ID (omit for all)"),
            campaignId: z.string().optional().describe("Filter by campaign ID"),
        },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, async ({ automationId, campaignId }) => {
        if (automationId) {
            const automation = getBidAutomation(automationId);
            return { content: [{ type: "text", text: okText(automation ?? { error: `Automation ${automationId} not found` }) }] };
        }
        const automations = getBidAutomations(campaignId);
        return { content: [{ type: "text", text: okText(automations) }] };
    });
    server.registerTool("amazon_ads_delete_bid_rule", {
        title: "Delete Bid Rule",
        description: "Permanently remove a bid rule. Args: ruleId (from amazon_ads_get_bid_rules). Returns confirmation with deleted status.",
        inputSchema: {
            ruleId: z.string().describe("Rule ID to delete"),
        },
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
    }, async ({ ruleId }) => {
        const deleted = deleteBidRule(ruleId);
        return { content: [{ type: "text", text: okText({ ruleId, deleted, message: deleted ? "Rule deleted." : `Rule ${ruleId} not found.` }) }] };
    });
}
//# sourceMappingURL=tools.js.map