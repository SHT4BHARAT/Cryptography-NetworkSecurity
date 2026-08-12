-- backend/migrations/002_seed.sql
-- Optional demo data. Run after signing up a demo account in the app,
-- then replace <DEMO_USER_ID> with that account's auth.users id.

-- Demo profile (income fallback so the health score always has a denominator)
insert into public.profiles (user_id, full_name, monthly_income)
values ('<DEMO_USER_ID>', 'Demo User', 4500)
on conflict (user_id) do nothing;

-- Sample transactions for the demo account (spread across the last 3 months)
insert into public.transactions (user_id, date, amount, description, category)
values
  ('<DEMO_USER_ID>', '2026-08-01', 4500.00, 'SALARY AUGUST', 'Income'),
  ('<DEMO_USER_ID>', '2026-08-03', -12.99, 'NETFLIX.COM', 'Subscriptions'),
  ('<DEMO_USER_ID>', '2026-08-05', -9.99, 'SPOTIFY PREMIUM', 'Subscriptions'),
  ('<DEMO_USER_ID>', '2026-08-05', -64.50, 'WHOLE FOODS MARKET', 'Groceries'),
  ('<DEMO_USER_ID>', '2026-08-07', -18.40, 'STARBUCKS COFFEE', 'Food & Dining'),
  ('<DEMO_USER_ID>', '2026-08-09', -86.00, 'ZOMATO ORDER', 'Food & Dining'),
  ('<DEMO_USER_ID>', '2026-08-12', -1200.00, 'RENT PAYMENT', 'Rent'),
  ('<DEMO_USER_ID>', '2026-08-15', -45.00, 'ELECTRICITY BILL', 'Bills & Utilities'),
  ('<DEMO_USER_ID>', '2026-08-18', -32.00, 'AIRTEL RECHARGE', 'Bills & Utilities'),
  ('<DEMO_USER_ID>', '2026-08-20', -210.00, 'AMAZON INDIA', 'Shopping'),
  ('<DEMO_USER_ID>', '2026-08-22', -30.00, 'METRO CARD', 'Transport'),
  ('<DEMO_USER_ID>', '2026-08-25', -15.00, 'CINEMA TICKET', 'Entertainment'),
  ('<DEMO_USER_ID>', '2026-07-05', -12.99, 'NETFLIX.COM', 'Subscriptions'),
  ('<DEMO_USER_ID>', '2026-07-05', -9.99, 'SPOTIFY PREMIUM', 'Subscriptions'),
  ('<DEMO_USER_ID>', '2026-07-08', -9.99, 'SPOTIFY PREMIUM', 'Subscriptions'),
  ('<DEMO_USER_ID>', '2026-07-10', -1240.00, 'RENT PAYMENT', 'Rent'),
  ('<DEMO_USER_ID>', '2026-07-12', -40.00, 'ELECTRICITY BILL', 'Bills & Utilities'),
  ('<DEMO_USER_ID>', '2026-07-20', -150.00, 'MYNTRA SHOPPING', 'Shopping'),
  ('<DEMO_USER_ID>', '2026-07-22', -25.00, 'UBER RIDE', 'Travel'),
  ('<DEMO_USER_ID>', '2026-06-05', -12.99, 'NETFLIX.COM', 'Subscriptions')
on conflict do nothing;
