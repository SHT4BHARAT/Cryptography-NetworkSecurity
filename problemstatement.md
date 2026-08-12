Smart Expense Analyzer & Financial Health Dashboard 

Theme: FinTech & Personal Finance 

# Smart Expense Analyzer & Financial Health Dashboard 

"Because you can‘ fix what you can't see ~~—~~ and most people can't see where their money actually goes." 

#### Real-World Context 

Most people don't really know where their money goes each month. They earn, they spend, and by the end of the month they're often surprised at how little is left ~~—~~ without ever understanding why ~~.~~ Bank statements are long, confusing, and not built to help people understand their own habits ~~.~~ Budgeting apps exist, but many are either too complicated, too generic, or require tedious manual entry that people give up on within a week. 

Meanwhile, real financial health isn't just about tracking expenses ~~—~~ it's about understanding patterns: Are you overspending on food delivery? Is a subscription draining money every month without you noticing? Are you saving enough compared to your income? Most people never get clear, personalized answers to these questions ~~.~~ 

Asmart, easy ~~-t~~ o ~~-~~ use tool that turns raw transaction data into real understanding and honest financial guidance could genuinely change how people manage their money ~~.~~ 

### The Problem Statement 

Build a Smart Expense Analyzer & Financial Health Dashboard ~~—~~ a web ~~-b~~ ased application where a 

user can input or upload their financial transactions, get their spending automatically categorized and analyzed, and receive a clear picture of their financial health along with personalized, actionable insights ~~.~~ 

This should feel like a financial advisor in your pocket ~~—~~ honest, clear, and genuinely helpful — not just a spreadsheet with colors ~~.~~ 

### Objective 

By the end of the hackathon, your team must deliver a working, full-stack application that can: 

- 1 ~~.~~ Let a user create an account and securely log in ~~.~~ 

- 2 ~~.~~ Allow a user to input transactions manually or upload transaction data (e ~~.~~ g ~~.,~~ via CSV/bank statement upload) ~~.~~ 

3. Automatically categorize transactions and analyze spending patterns. 

4. Generate a clear financial health score/summary along with personalized insights and recommendations ~~.~~ 

- 5 ~~.~~ Let users set and track budgets or savings goals over time ~~.~~ 

## Key Requirements (Must ~~-~~ Haves) 

Your solution must include alll of the following ~~—~~ plan your team's time across all days carefully, this is meant to be genuinely challenging: 

## 1. User Accounts & Authentication 

- e Secure sign ~~-~~ up/login system ~~.~~ 

- e Each user's financial data must be private and securely stored ~~—~~ this is sensitive personal data, so handle it with real care in your design. 

# 2 ~~.~~ Transaction Input & Import 

- e Allow users to manually add individual transactions (amount, date, merchant/description, etc.) ~~.~~ 

- e Allow bulk import of transactions via CSV upload (simulate a bank statement export format) ~~.~~ 

- e Handle inconsistent or messy data gracefully (different date formats, missing fields, duplicate entries) ~~.~~ 

## 3 ~~.~~ Automatic Categorization Engine 

- e This is the technical core of your project ~~.~~ Automatically classify each transaction into a meaningful category (e.g., Food, Rent, Shopping, Subscriptions, Travel, Bills, Entertainment) based on the transaction description/merchant ~~—~~ without the user having to manually tag every single transaction ~~.~~ 

- e You are expected to research and implement/integrate a suitable approach for this ~~—~~ this could be a rul ~~e-~~ based classification system you design, a machine learning model, or a thir ~~d-~~ party Al/NLP API. Evaluating available options and picking the one that fits your solution and timeline is part of the challenge ~~.~~ Clearly document in your README which approach/API/service you used, why you chose it, and how it's integrated ~~.~~ 

## 4 ~~.~~ Spending Pattern Analysis 

- e Analyze categorized data to surface real insights: top spending categories, month ~~-o~~ ver ~~-~~ month trends, recurring/subscription payments, unusual spending spikes, etc. 

- e Insights must be generated from actual analysis of the user's data ~~—~~ not generic, hardcoded statements ~~.~~ 

## 5 <mark>.</mark> Financial Health Score & Recommendations 

- e Generate a clear, simple financial health indicator (e.g ~~.,~~ a score or rating) based on factors like spending vs ~~.~~ income, savings rate, and budget adherence. 

- e Provide specific, actionable recommendations in plain language (e.g. ~~,~~ "You spent 40% more on food delivery this month compared to last month ~~—~~ consider setting a limit ~~."~~ ) ~~.~~ 

# 6 ~~.~~ Budget & Goal Tracking 

- e Let users set monthly budgets for specific categories and/or savings goals ~~.~~ e Track actual spending/saving against these targets and clearly show progress or overspending ~~.~~ 

### 7 <mark>.</mark> Visual Dashboard 

- e Aclear dashboard with charts/graphs showing spending breakdown, trends over time, budget progress, and financial health score ~~.~~ 

- e Should help a user understand their financial situation in seconds, not force them to read numbers in a table ~~.~~ 

## 8 ~~.~~ Database Integration 

e Persistently store user accounts, transactions, categories, budgets/goals, and historical analysis. 

## 9 ~~.~~ Responsive, Clean Ul 

- e Should work smoothly on both desktop and mobile ~~.~~ 

- e Design should feel trustworthy, calm, and professional — this is sensitive financial data, and the experience should reflect that ~~.~~ 

## 10 ~~.~~ Error Handling 

- e Handle cases like malformed CSV uploads, invalid transaction data, categorization failures, and empty datasets gracefully ~~—~~ never leave the user with a blank or broken screen ~~.~~ 

## Challenges 

- e Subscription Detector: Automatically detect recurring subscriptions and flag ones that seem unused or forgotten ~~.~~ 

- e Bill Reminder System: Predict upcoming recurring bills based on transaction history and remind users before they're due. 

- e Mult ~~i-~~ Account Support: Let users track transactions across multiple accounts/cards in one unified view ~~.~~ 

- e Al Chat ~~-~~ Based Financial Assistant: Let users ask natural-language questions about their spending (e.g., "How much did | spend on food last month?") and get an accurate, generated answer ~~.~~ 

- e Comparison & Benchmarking: Show anonymized comparisons of spending patterns against similar income/age groups ~~.~~ 

- e Savings Simulation Tool: Let users simulate "what if" scenarios (e.g. ~~,~~ "what if|cut food delivery by half?") and see the projected impact on savings. 

#### Deliverables 

Each team must submit: 

1. Fully functional deployed application (deployment strongly recommended) ~~—~~ frontend + backend + database. 

2. GitHub repository following the naming and structure guidelines from the General Instructions (HackInMotio ~~n-~~ TeamCode), including: 

   - ° architectur ~~e-~~ diagram.png 

   - © ap ~~i-~~ documentation.md 

   - ° presentation ~~.~~ pptx 

   - Complete README.md (as per Section 8 of General Instructions ~~—~~ including which categorization approach/APl/service was used and how) 

3. Live demo showing real/sample transaction data being uploaded, automatically categorized, and turned into a financial health summary with insights ~~.~~ 

4. Product Pitch (for finalists) covering the problem, solution, tech stack, real-world impact, and future scope. 

