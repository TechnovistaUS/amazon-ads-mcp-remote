# 🎯 Amazon Ads Advanced Bidding Strategies - Complete Guide

## Overview

Your Amazon Ads MCP server now supports **11 advanced bidding strategy tools** in addition to the original 7 campaign management tools, for a total of **18 complete tools**.

---

## 📊 Tool Breakdown

### Original Tools (7)
1. `amazon_ads_get_profiles`
2. `amazon_ads_get_account_info`
3. `amazon_ads_list_campaigns`
4. `amazon_ads_get_campaign_metrics`
5. `amazon_ads_create_campaign`
6. `amazon_ads_update_campaign`
7. `amazon_ads_get_token_status`

### NEW Bidding Strategy Tools (11)
8. `amazon_ads_set_bidding_strategy`
9. `amazon_ads_apply_bid_multiplier`
10. `amazon_ads_create_bid_rule`
11. `amazon_ads_get_bid_rules`
12. `amazon_ads_adjust_bid`
13. `amazon_ads_set_target_acos`
14. `amazon_ads_create_bid_automation`
15. `amazon_ads_get_adjustment_history`
16. `amazon_ads_update_bid_rule`

**Total: 18 Tools**

---

## 🎯 Bidding Strategies in Detail

### 1. Set Bidding Strategy
**Purpose**: Configure the bidding approach for a campaign

```
Tool: amazon_ads_set_bidding_strategy

Parameters:
- profile_id: Your advertiser profile ID
- campaign_id: Target campaign
- strategy: One of:
  * "manual" - You control all bids manually
  * "automatic" - Amazon adjusts bids to maximize sales
  * "dynamic" - Bids adjust based on device/browser/location
- description: Optional notes about the strategy
```

**Example in Claude:**
```
"Set campaign ABC123 to use automatic bidding strategy to maximize sales"
```

---

### 2. Apply Bid Multiplier
**Purpose**: Adjust bids proportionally across multiple keywords/targets

```
Tool: amazon_ads_apply_bid_multiplier

Parameters:
- profile_id: Your advertiser profile ID
- ad_group_id: Target ad group
- multiplier: Number from 0.1 to 3.0
  * 0.5 = 50% (reduce bids by 50%)
  * 1.0 = 100% (no change)
  * 1.5 = 150% (increase bids by 50%)
  * 2.0 = 200% (double bids)
- apply_to: Optional - which items to affect:
  * "all_keywords"
  * "all_targets"
  * "low_performers"
```

**Example in Claude:**
```
"Increase bids in ad group XYZ by 25%"
```

---

### 3. Create Bid Rule
**Purpose**: Set up automated bidding rules for different campaign stages

#### Campaign Stages Supported:

#### A. LAUNCH STAGE (Maximize Impressions)
For new products that need visibility

```
Parameters:
- stage: "launch"
- launch_bid: Starting bid amount ($)
- launch_max_budget: Daily budget limit
- launch_placement_focus: Where to show ads
  * "top" - Top of search results
  * "rest_of_page" - Below top ads
  * "product_pages" - On product pages

What it does:
✓ Aggressively bids to get impressions
✓ Spreads budget across placements
✓ Focuses on brand awareness
```

**Example in Claude:**
```
"Create a launch stage bid rule for product XYZ with $2 bids and $50 daily budget, 
focusing on top placements for maximum visibility"
```

---

#### B. PERFORMANCE STAGE (Target ACoS)
For products in growth phase targeting profitability

```
Parameters:
- stage: "performance"
- target_acos: Target ACoS percentage (e.g., 30 = 30% ACoS)
- min_bid: Minimum bid to maintain
- max_bid: Maximum bid allowed
- acos_adjustment_interval: How often to adjust
  * "daily" - Check and adjust every day
  * "weekly" - Check and adjust weekly
- acos_adjustment_amount: Dollar amount to adjust per interval

What it does:
✓ Maintains your target ACoS automatically
✓ Decreases bids if ACoS rises above target
✓ Increases bids if ACoS is below target
✓ Respects min/max bid boundaries
```

**Example in Claude:**
```
"Create a performance rule targeting 28% ACoS with min bid $0.30 and max bid $2.00, 
adjusting daily by $0.05"
```

---

#### C. LIQUIDATE STAGE (Maximize Orders)
For products being cleared or discontinued

```
Parameters:
- stage: "liquidate"
- liquidate_bid: Aggressive bid amount
- max_acos_threshold: Don't exceed this ACoS
- launch_max_budget: Daily budget

What it does:
✓ Bids aggressively to clear inventory
✓ Stops if ACoS gets too high
✓ Maximizes orders/sales
```

**Example in Claude:**
```
"Create liquidate rule with $3 bids, but don't exceed 50% ACoS"
```

---

#### D. CUSTOM STAGE (Your Rules)
Create your own bidding logic based on performance metrics

```
Parameters:
- stage: "custom"
- custom_rules: Array of rules, each with:
  
  Condition:
  - metric: What to monitor:
    * "acos" - Advertising Cost of Sales
    * "roas" - Return on Ad Spend
    * "cpc" - Cost Per Click
    * "ctr" - Click Through Rate
    * "conversion_rate" - Conversion %
    * "impressions" - # of impressions
  
  - operator: How to compare:
    * "greater_than"
    * "less_than"
    * "equals"
    * "greater_or_equal"
    * "less_or_equal"
  
  - value: Threshold number
  - time_window: Look back period
    * "today"
    * "7days"
    * "14days"
    * "30days"
  
  Action: What to do when condition met:
  - action_type:
    * "increase_bid"
    * "decrease_bid"
    * "pause"
    * "resume"
    * "set_bid"
  
  - adjustment_percentage: % change (-100 to +100)
  - bid_amount: Fixed bid amount
```

**Example in Claude:**
```
"Create a custom rule: if ACoS in last 7 days exceeds 35%, decrease bid by 10%. 
And if ROAS exceeds 5.0 in 30 days, increase bid by 8%"
```

---

### 4. Get Bid Rules
**Purpose**: View all configured bid rules for a campaign

```
Tool: amazon_ads_get_bid_rules

Parameters:
- profile_id: Your advertiser profile ID
- campaign_id: Campaign to check
- rule_id: Optional - get specific rule details
```

**Example in Claude:**
```
"Show me all bid rules for campaign ABC123"
```

---

### 5. Adjust Bid
**Purpose**: Manually adjust a single bid with constraints

```
Tool: amazon_ads_adjust_bid

Parameters:
- profile_id: Your advertiser profile ID
- ad_group_id: Target ad group
- adjustment_type: How to adjust:
  * "percentage" - Percentage change
  * "fixed_amount" - Dollar change
  * "set_to" - Set to specific value
- adjustment_value: The adjustment
  * For percentage: -50 to +100
  * For amount: -5.00 to +5.00
  * For set_to: the new bid amount
- reason: Why you're making this adjustment
- min_bid: Don't go below this
- max_bid: Don't go above this
```

**Example in Claude:**
```
"Increase bid for ad group XYZ by $0.25, but keep it between $0.50 and $3.00. 
Reason: low impressions"
```

---

### 6. Set Target ACoS
**Purpose**: Enable automatic ACoS-based bidding

```
Tool: amazon_ads_set_target_acos

Parameters:
- profile_id: Your advertiser profile ID
- campaign_id: Target campaign
- target_acos_percentage: Your target (e.g., 25 = 25%)
- min_bid: Minimum bid allowed
- max_bid: Maximum bid allowed
- adjustment_frequency:
  * "hourly" - Check & adjust hourly
  * "daily" - Check & adjust daily
  * "weekly" - Check & adjust weekly
- enable_automation: true/false
```

**What it does:**
```
✓ Measures actual ACoS from last 7 days
✓ If ACoS > target: Decrease bids by 5%
✓ If ACoS < 70% of target: Increase bids by 5%
✓ Repeats at selected frequency
✓ Respects min/max bid constraints
✓ Stops if can't maintain target
```

**Example in Claude:**
```
"Set target ACoS to 22% for campaign ABC, with bids between $0.40-$2.50, 
adjusting daily with automation enabled"
```

---

### 7. Create Bid Automation
**Purpose**: Set up complex automation with multiple rules and priorities

```
Tool: amazon_ads_create_bid_automation

Parameters:
- profile_id: Your advertiser profile ID
- campaign_id: Target campaign
- automation_name: Name for this automation
- execution_schedule: How often to check:
  * "hourly"
  * "daily"
  * "weekly"

- rules: Array of rules, each with:
  * priority: 1 (highest) to N
  * metric: "acos", "roas", "cpc", "ctr", "conversion_rate"
  * operator: "greater_than", "less_than", etc.
  * threshold: The value to compare
  * time_window: "today", "7days", "14days", "30days"
  * action: "increase_bid", "decrease_bid", "pause", "resume"
  * adjustment_value: % to change
  * max_adjustments_per_day: Max changes allowed
  * cooldown_minutes: Wait time between adjustments
```

**Example in Claude:**
```
"Create daily automation with these rules:
1. If ACoS > 30% in 7 days: decrease bid by 8%
2. If ROAS < 2.0 in 7 days: pause campaign
3. If CTR > 5% in 7 days: increase bid by 5%
Maximum 5 adjustments per day, 60 minute cooldown"
```

---

### 8. Update Bid Rule
**Purpose**: Enable/disable or modify existing rules

```
Tool: amazon_ads_update_bid_rule

Parameters:
- profile_id: Your advertiser profile ID
- rule_id: The rule to update
- enabled: true/false to enable/disable
- config: Updated rule configuration
```

**Example in Claude:**
```
"Disable the launch rule for campaign ABC123"
```

---

### 9. Get Adjustment History
**Purpose**: View all bids changes made to campaigns

```
Tool: amazon_ads_get_adjustment_history

Parameters:
- campaign_id: Optional - filter by campaign
- limit: How many results to show (default: 100)

Returns:
- List of all bid adjustments with:
  * Previous bid amount
  * New bid amount
  * Adjustment amount and percentage
  * Reason for adjustment
  * Timestamp
```

**Example in Claude:**
```
"Show me all bid adjustments made to campaign ABC in the last 30 days"
```

---

## 🚀 Common Use Cases

### Use Case 1: New Product Launch
```
1. Set bidding strategy to "automatic"
2. Create launch stage rule:
   - Bid: $1.50
   - Focus: Top placements
   - Budget: $75/day
3. Monitor with get_bid_rules

Result: Aggressive bidding for brand awareness
```

### Use Case 2: Maintaining 25% ACoS Target
```
1. Set target ACoS to 25%
2. Enable automation
3. Set frequency to daily
4. Min bid: $0.40, Max bid: $2.00
5. Monitor with get_adjustment_history

Result: Automatic daily bid adjustments to hit 25% ACoS
```

### Use Case 3: Multi-Criteria Automation
```
Create bid automation with rules:
- Priority 1: If ACoS > 30%, decrease -10%
- Priority 2: If ROAS < 2.0, pause for review
- Priority 3: If CTR > 4%, increase +5%

Result: Complex logic handles different scenarios
```

### Use Case 4: Quick Bid Adjustment
```
Problem: Ad group has 10% CTR but only $0.50 bid
Solution:
1. Adjust bid from $0.50 to $1.00 (+100%)
2. Set max bid to $1.50 to control costs
3. Record reason: "High CTR, low bid"
4. Check adjustment history in 24 hours

Result: Manual one-time adjustment
```

### Use Case 5: Clear Inventory
```
1. Create liquidate rule:
   - Bid: $3.00
   - Max ACoS: 50%
   - Budget: $100/day
2. Monitor adjustment history
3. Once inventory clears, pause rule

Result: Aggressive clearing while controlling losses
```

---

## 📈 Bidding Strategy Comparison

| Strategy | When to Use | Bid Control | Automation |
|----------|----------|----------|----------|
| **Manual** | Full control needed | You decide | None |
| **Automatic** | Maximize sales | Amazon decides | High |
| **Dynamic** | Device/location matters | Amazon adjusts | Medium |
| **Target ACoS** | Profitability focus | Semi-auto | High |
| **Custom Rules** | Complex logic | Rule-based | Fully custom |

---

## 🎯 Best Practices

### For Launch Stage
✅ Start with 20-30% higher bids than normal  
✅ Focus on top placements for visibility  
✅ Monitor daily for first week  
✅ Adjust based on early CTR/conversion data  

### For Performance Stage
✅ Set realistic ACoS targets (within 80% of ROAS)  
✅ Use 7-day lookback window  
✅ Adjust frequency: daily or weekly  
✅ Set min bid to maintain presence  

### For Liquidate Stage
✅ Be aggressive with bids  
✅ Set max ACoS threshold  
✅ Monitor inventory levels  
✅ Plan end date for campaign  

### For Custom Rules
✅ Start with 1-2 rules  
✅ Test in lower-volume campaigns  
✅ Use 7-30 day lookback  
✅ Set cooldown to prevent over-adjusting  
✅ Monitor adjustment history  

---

## 💡 Advanced Tips

### Tip 1: Stagger Rules by Priority
Create multiple rules with different metrics:
- Priority 1: ACoS control
- Priority 2: Minimum ROAS
- Priority 3: CTR optimization

### Tip 2: Use Time Windows Strategically
- Last 7 days: Quick responses
- Last 30 days: Stable trends
- Daily lookback: High-volume campaigns

### Tip 3: Combine Strategies
1. Use automatic bidding for overall control
2. Add custom rules for exceptions
3. Manual adjustments for anomalies

### Tip 4: Monitor Before Automating
1. Gather 1-2 weeks of data
2. Test rules manually
3. Then enable automation

### Tip 5: Adjust Cooldown Wisely
- Short cooldown (30 min): Fast response, more changes
- Long cooldown (4 hrs): Stable, fewer changes
- Very long (daily): Major changes only

---

## ⚠️ Common Mistakes to Avoid

❌ **Setting unrealistic ACoS targets** - Target within reach of product margins  
❌ **Too many rules competing** - Prioritize rules clearly  
❌ **Not monitoring automation** - Check adjustment history weekly  
❌ **Setting max bid too low** - Campaign won't get impressions  
❌ **Frequent manual changes** - Let automation work before adjusting  
❌ **Launch bids too aggressive** - Budget will deplete quickly  

---

## 🔧 Integration with Claude

### Ask Claude to:
```
"Create a launch strategy for my new ASIN with $2 bids"
"Set up automatic ACoS targeting at 28%"
"Show me all bid adjustments for campaign ABC123"
"Increase bids by 15% but keep max at $2.50"
"Create a custom rule: pause if ACoS exceeds 40%"
"What's my bid adjustment history for this week?"
"Enable my liquidate rule for SKU XYZ"
```

Claude will:
1. Understand your request
2. Map it to the right tool
3. Gather parameters from your input
4. Execute the bidding action
5. Confirm the change

---

## 📊 Monitoring Your Bidding

### Daily
- [ ] Check token status
- [ ] Review major campaigns' ACoS

### Weekly
- [ ] Review adjustment history
- [ ] Check if rules are firing
- [ ] Verify bids are in expected range

### Monthly
- [ ] Analyze bidding ROI
- [ ] Adjust rule thresholds
- [ ] Disable rules that aren't helping
- [ ] Plan strategy for next month

---

## 🎉 You Now Have

✅ 7 original campaign management tools  
✅ 11 advanced bidding strategy tools  
✅ Support for all campaign stages  
✅ Custom automation rules  
✅ Target ACoS automation  
✅ Full adjustment history tracking  
✅ Min/max bid constraints  
✅ Priority-based rule execution  

**Total: 18 Complete Tools**

---

## 📝 Next Steps

1. Read your bidding rules strategy
2. Identify campaign stages for your products
3. Start with 1-2 simple rules
4. Monitor adjustment history
5. Gradually enable automation
6. Refine based on results

---

**Happy bidding! 🎯**
