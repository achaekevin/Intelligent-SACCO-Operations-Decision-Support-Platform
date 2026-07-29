// Rule Engine & Business Policy Configurator
export class RuleEngine {
  static rules = [
    {
      id: 'rule_max_loan_mult',
      name: 'Standard Loan Savings Multiplier Policy',
      category: 'LOANS',
      condition: 'Savings >= 100000 AND MembershipDurationMonths >= 12',
      actionType: 'CALCULATE_MAX_LOAN',
      actionValue: 'Savings * 3',
      isActive: true,
      description: 'Members with >= 100k savings and >= 12 months membership get 3x savings loan ceiling.',
    },
    {
      id: 'rule_ceo_approval_tier',
      name: 'High Value Loan CEO Escroment Rule',
      category: 'APPROVALS',
      condition: 'LoanAmount > 2000000',
      actionType: 'REQUIRE_APPROVAL_ROLE',
      actionValue: 'CEO',
      isActive: true,
      description: 'Loans exceeding KES 2,000,000 require executive CEO authorization.',
    },
    {
      id: 'rule_guarantor_exposure',
      name: 'Guarantor Exposure Limit Rule',
      category: 'GUARANTORS',
      condition: 'TotalGuaranteedAmount > MemberSavings * 4',
      actionType: 'FLAG_COMPLIANCE_VIOLATION',
      actionValue: 'Guarantor exposure exceeds 4x savings limit',
      isActive: true,
      description: 'Prevents members from guaranteeing loans beyond 4x their accumulated savings balance.',
    },
    {
      id: 'rule_share_capital_min',
      name: 'Share Capital Qualification Floor',
      category: 'MEMBERSHIP',
      condition: 'ShareCapital < 10000',
      actionType: 'RESTRICT_LOAN_DISBURSEMENT',
      actionValue: 'Share capital below statutory minimum of KES 10,000',
      isActive: true,
      description: 'Blocks loan disbursement if member share capital is below KES 10,000.',
    },
  ];

  static complianceLogs = [
    {
      id: 'log_01',
      ruleId: 'rule_ceo_approval_tier',
      ruleName: 'High Value Loan CEO Escroment Rule',
      status: 'VIOLATION_PREVENTED',
      details: 'Loan application #L-9042 (KES 3,500,000) automatically routed to CEO queue.',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'log_02',
      ruleId: 'rule_guarantor_exposure',
      ruleName: 'Guarantor Exposure Limit Rule',
      status: 'WARNING_TRIGGERED',
      details: 'Guarantor John Doe exposed to KES 1,800,000 against KES 400,000 savings.',
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
  ];

  static getRules() {
    return this.rules;
  }

  static createRule(ruleData) {
    const newRule = {
      id: `rule_${Date.now()}`,
      isActive: true,
      ...ruleData,
    };
    this.rules.push(newRule);
    return newRule;
  }

  static toggleRule(id) {
    const r = this.rules.find((item) => item.id === id);
    if (r) {
      r.isActive = !r.isActive;
      return r;
    }
    return null;
  }

  static evaluateContext(context) {
    const executed = [];
    const violations = [];

    for (const r of this.rules) {
      if (!r.isActive) continue;

      let matched = false;
      if (r.id === 'rule_ceo_approval_tier' && context.LoanAmount > 2000000) {
        matched = true;
      } else if (r.id === 'rule_max_loan_mult' && context.Savings >= 100000 && context.MembershipDurationMonths >= 12) {
        matched = true;
      } else if (r.id === 'rule_share_capital_min' && context.ShareCapital < 10000) {
        matched = true;
        violations.push({ rule: r.name, reason: r.actionValue });
      }

      if (matched) {
        executed.push({
          ruleId: r.id,
          name: r.name,
          actionType: r.actionType,
          actionValue: r.actionValue,
        });
      }
    }

    return { executed, violations };
  }

  static getComplianceSummary() {
    return {
      activeRulesCount: this.rules.filter((r) => r.isActive).length,
      totalRulesCount: this.rules.length,
      recentViolationsCount: this.complianceLogs.length,
      logs: this.complianceLogs,
    };
  }
}

export default RuleEngine;
