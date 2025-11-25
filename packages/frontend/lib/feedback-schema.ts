export type FeedbackOption = { value: string; label: string };

export type FeedbackBaseQuestion = { id: string; label: string; required?: boolean };

export type FeedbackQuestion =
    | (FeedbackBaseQuestion & { type: 'text'; placeholder?: string })
    | (FeedbackBaseQuestion & { type: 'number'; placeholder?: string; unitSuffix?: string })
    | (FeedbackBaseQuestion & {
          type: 'select';
          options: FeedbackOption[];
          supportsOther?: boolean;
          otherLabel?: string;
      })
    | (FeedbackBaseQuestion & {
          type: 'multi-select';
          options: FeedbackOption[];
          supportsOther?: boolean;
          otherLabel?: string;
      });

export type FeedbackSection = { id: string; title: string; description?: string; questions: FeedbackQuestion[] };

export const FEEDBACK_SECTIONS: FeedbackSection[] = [
    {
        id: 'matching-efficiency',
        title: '1. Matching Efficiency & Idle Capital',
        questions: [
            {
                id: 'holdingDays',
                label: 'How many days are you typically holding positions on Polymarket (roughly)?',
                type: 'number',
                placeholder: 'e.g. 7',
                required: true,
            },
            {
                id: 'withdrawImportance',
                label: 'How much does it matter for you to be able to withdraw Polymarket positions from Robin at any time? (1 = Not at all, 5 = Dealbreaker)',
                type: 'select',
                options: [
                    { value: '1', label: '1 - Not at all' },
                    { value: '2', label: '2' },
                    { value: '3', label: '3' },
                    { value: '4', label: '4' },
                    { value: '5', label: '5 - Dealbreaker' },
                ],
                required: true,
            },
            {
                id: 'lockupYieldPct',
                label: 'How much yield (APY) would you need to earn to be willing to lock up positions for 30 days?',
                type: 'number',
                unitSuffix: '%',
                placeholder: 'e.g. 10',
                required: true,
            },
        ],
    },
    {
        id: 'yield-risk-transparency',
        title: '2. Yield & Risk Transparency',
        questions: [
            {
                id: 'meaningYield',
                label: 'When you hear “earn yield on your prediction-market positions,” what do you think that means?',
                type: 'text',
                placeholder: 'Open answer',
                required: true,
            },
            {
                id: 'confidenceFactors',
                label: 'What would make you feel confident depositing $1,000 into our protocol? (Multi-select)',
                type: 'multi-select',
                options: [
                    { value: 'audits', label: 'Audits' },
                    { value: 'high_tvl', label: 'High TVL' },
                    { value: 'past_performance', label: 'Past performance' },
                    { value: 'x_following', label: 'X following' },
                    { value: 'big_community', label: 'Big community' },
                    { value: 'partners', label: 'Partners' },
                    { value: 'funding_round', label: 'Funding round' },
                ],
                supportsOther: true,
                otherLabel: 'Other (specify)',
                required: false,
            },
            {
                id: 'apyClarity',
                label: 'If a vault said “APY 5% from LPing USDC on Yearn,” is that clear, or would you want more details?',
                type: 'select',
                options: [
                    { value: 'clear', label: 'Yes it’s clear' },
                    { value: 'more_details', label: 'No, I want more details' },
                ],
                required: true,
            },
        ],
    },
    {
        id: 'onboarding',
        title: '3. Onboarding',
        questions: [
            {
                id: 'confusingPart',
                label: 'What’s the most confusing part about Robin?',
                type: 'text',
                placeholder: 'Open answer',
                required: true,
            },
            {
                id: 'missingInfo',
                label: 'What information do you think is missing from our websites?',
                type: 'text',
                placeholder: 'Open answer',
                required: true,
            },
        ],
    },
    {
        id: 'comprehension',
        title: '4. User Comprehension',
        description: 'Answer these questions to the best of your knowledge about Robin.',
        questions: [
            {
                id: 'claimOnRobin',
                label: 'When the event resolves on Polymarket and my positions are staked with Robin, I can claim my winnings directly on Robin.',
                type: 'select',
                options: [
                    { value: 'true', label: 'True' },
                    { value: 'false', label: 'False' },
                ],
                required: true,
            },
            {
                id: 'withdrawThenClaim',
                label: 'When the event resolves on Polymarket and my positions are staked with Robin, I have to first withdraw my positions and can then claim my winnings on Polymarket.',
                type: 'select',
                options: [
                    { value: 'true', label: 'True' },
                    { value: 'false', label: 'False' },
                ],
                required: true,
            },
            {
                id: 'yieldImmediate',
                label: 'When I withdraw my positions from Robin, I also get the yield that I earned immediately.',
                type: 'select',
                options: [
                    { value: 'true', label: 'True' },
                    { value: 'false', label: 'False' },
                ],
                required: true,
            },
            {
                id: 'yieldAfterResolve',
                label: 'The yield that I earned can be claimed from Robin only after the market resolved on Polymarket',
                type: 'select',
                options: [
                    { value: 'true', label: 'True' },
                    { value: 'false', label: 'False' },
                ],
                required: true,
            },
            {
                id: 'awareDeltaNeutral',
                label: 'Did you know before reading this that Robin only invests the YES and NO positions of which there are an equal amount in the pool?',
                type: 'select',
                options: [
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                ],
                required: true,
            },
        ],
    },
    {
        id: 'capital-efficiency',
        title: '5. Capital-Efficiency Appetite',
        questions: [
            {
                id: 'vaultPreference',
                label: 'If there was a “High-Yield Vault” (riskier) and a “Safe Vault” (lower yield), which would you pick?',
                type: 'select',
                options: [
                    { value: 'high_yield', label: 'High-Yield Vault' },
                    { value: 'safe', label: 'Safe Vault' },
                ],
                required: true,
            },
            {
                id: 'minApyPct',
                label: 'What is the minimum percentage of APY that you would need in order to stake your positions with Robin?',
                type: 'number',
                unitSuffix: '%',
                placeholder: 'e.g. 5',
                required: true,
            },
            {
                id: 'preventStakingAll',
                label: 'If you can withdraw your positions at any time, is there anything that would prevent you from staking all your positions with Robin?',
                type: 'text',
                placeholder: 'Open answer',
                required: true,
            },
            {
                id: 'stakeDespiteDifferentYields',
                label: 'Currently, Robin provides different APY for a market’s yes and no positions depending on the price of the position. For example, you want to stake YES positions for 3% APY and can see that NO positions are receiving 10% APY. Would you still stake your YES position?',
                type: 'select',
                options: [
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                ],
                required: true,
            },
            {
                id: 'stakeDifferentYieldsDetails',
                label: 'Add details to your answer of the previous question (Optional)',
                type: 'text',
                placeholder: 'Open answer',
                required: false,
            },
        ],
    },
    {
        id: 'narrative-positioning',
        title: '6. Narrative & Positioning',
        questions: [
            {
                id: 'positioningPhrase',
                label: 'Which phrase feels most accurate for you to describe Robin?',
                type: 'select',
                options: [
                    { value: 'yield_layer', label: '“Yield layer for prediction markets”' },
                    { value: 'liquidity_layer', label: '“Liquidity layer for bets”' },
                    { value: 'defi_savings', label: '“DeFi savings account for Polymarket positions”' },
                    { value: 'passive_income', label: '“Passive income from prediction markets”' },
                ],
                supportsOther: true,
                otherLabel: 'Other suggestion',
                required: true,
            },
            {
                id: 'nameAssociation',
                label: 'What does the name “Robin Markets” make you think of?',
                type: 'text',
                placeholder: 'Open answer',
                required: true,
            },
            {
                id: 'trustMessaging',
                label: 'What kind of content or messaging would make you trust and try it?',
                type: 'text',
                placeholder: 'Open answer',
                required: true,
            },
        ],
    },
];
