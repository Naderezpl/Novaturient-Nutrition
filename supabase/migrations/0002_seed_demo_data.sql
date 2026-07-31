-- Seed data for Novaturient Nutrition (demo)
-- Matches demo-data.ts: 2 users (1 dietitian + 1 client), 30 clients, 336 foods, 11 lessons

-- ──────────────────────────────────────────────────────────────────────
-- Users (auth-layer demo users — swap out IDs when wiring real auth)
-- ──────────────────────────────────────────────────────────────────────
insert into public.users (id, email, role, full_name, avatar_url, created_at) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'leena@novaturient.app',        'dietitian', 'Dr. Leena Rahal', null, now()),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'mila.nasser@novaturient.app',  'client',    'Mila Nasser',     null, now())
on conflict (email) do nothing;

-- ──────────────────────────────────────────────────────────────────────
-- Client profile for Mila Nasser (the default demo client)
-- ──────────────────────────────────────────────────────────────────────
insert into public.client_profiles
  (user_id, age, sex, height_cm, weight_kg, goal, activity_level, learning_mode_enabled, water_goal_ml)
values
  ('aaaaaaaa-0000-4000-8000-000000000002',
   27, 'female', 162.00, 62.00, 'fat_loss', 'light', false, 2500)
on conflict (user_id) do nothing;

-- ──────────────────────────────────────────────────────────────────────
-- Exchange prescription for Mila, assigned by Dr. Leena
-- Targets: 10 Starch / 4 Fruit / 4 Vegetables / 8 Protein / 3 Dairy / 5 Fat
-- ──────────────────────────────────────────────────────────────────────
insert into public.exchange_prescriptions
  (client_id, assigned_by, items, effective_date, notes)
values
  ('aaaaaaaa-0000-4000-8000-000000000002',
   'aaaaaaaa-0000-4000-8000-000000000001',
   '[{"category":"starch","dailyTarget":10},{"category":"fruit","dailyTarget":4},{"category":"vegetable","dailyTarget":4},{"category":"protein","dailyTarget":8},{"category":"dairy","dailyTarget":3},{"category":"fat","dailyTarget":5}]'::jsonb,
   current_date,
   'Balanced starting plan with focus on protein and vegetables. Adjust after two weeks.')
on conflict do nothing;

-- ──────────────────────────────────────────────────────────────────────
-- 30 additional demo client users (matching demo-data roster)
-- ──────────────────────────────────────────────────────────────────────
do $$
declare
  first_names text[] := array[
    'Ava','Layla','Nora','Mira','Zayn','Omar','Mason','Lina','Sara','Noah',
    'Mila','Adam','Talia','Yara','Leo','Ivy','Dina','Elias','Rami','Jana',
    'Luca','Maya','Hana','Amir','Sami','Ella','Reem','Nadine','Rayan','Celine'
  ];
  last_names  text[] := array['Haddad','Salem','Khan','Ibrahim','Murphy','Yousef','Parker','Mansour','Aziz','Nasser'];
  goals       text[] := array['fat_loss','maintenance','muscle_gain'];
  levels      text[] := array['sedentary','light','moderate','active','very_active'];
  i int; j int; fn text; ln text; uid uuid; goal text; lvl text;
begin
  for i in 0..29 loop
    fn  := first_names[i+1];
    ln  := last_names[(i % 10)+1];
    uid := ('bbbbbbbb-0000-4000-8000-' || lpad((i+1)::text, 12, '0'))::uuid;
    goal:= goals[(i % 3)+1];
    lvl := levels[(i % 5)+1];

    insert into public.users (id, email, role, full_name)
    values (uid, lower(fn || '.' || ln || '@novaturient.app'), 'client', initcap(fn) || ' ' || initcap(ln))
    on conflict (email) do nothing;

    insert into public.client_profiles
      (user_id, age, sex, height_cm, weight_kg, goal, activity_level, learning_mode_enabled, water_goal_ml)
    values
      (uid,
       23 + (i % 19),
       case when i % 2 = 0 then 'female' else 'male' end,
       158.00 + (i % 18),
       58.00 + i,
       goal::client_goal,
       lvl::activity_level,
       false,
       2200 + ((i % 4) * 300))
    on conflict (user_id) do nothing;
  end loop;
end $$;

-- ──────────────────────────────────────────────────────────────────────
-- Exchange prescriptions for every demo client (prescribed by Leena)
-- ──────────────────────────────────────────────────────────────────────
do $$
declare
  first_names text[] := array[
    'Ava','Layla','Nora','Mira','Zayn','Omar','Mason','Lina','Sara','Noah',
    'Mila','Adam','Talia','Yara','Leo','Ivy','Dina','Elias','Rami','Jana',
    'Luca','Maya','Hana','Amir','Sami','Ella','Reem','Nadine','Rayan','Celine'
  ];
  last_names  text[] := array['Haddad','Salem','Khan','Ibrahim','Murphy','Yousef','Parker','Mansour','Aziz','Nasser'];
  i int; uid uuid; s int; f int; v int; p int; d int; fa int;
begin
  for i in 0..29 loop
    uid := ('bbbbbbbb-0000-4000-8000-' || lpad((i+1)::text, 12, '0'))::uuid;
    s  := 8 + (i % 4);
    f  := 3 + (i % 2);
    v  := 4 + (i % 2);
    p  := 7 + (i % 3);
    d  := 2 + (i % 2);
    fa := 4 + (i % 3);
    insert into public.exchange_prescriptions
      (client_id, assigned_by, items, effective_date, notes)
    values
      (uid,
       'aaaaaaaa-0000-4000-8000-000000000001',
       format('[{"category":"starch","dailyTarget":%s},{"category":"fruit","dailyTarget":%s},{"category":"vegetable","dailyTarget":%s},{"category":"protein","dailyTarget":%s},{"category":"dairy","dailyTarget":%s},{"category":"fat","dailyTarget":%s}]', s,f,v,p,d,fa)::jsonb,
       current_date - (i % 30),
       'Initial prescription based on onboarding goals.')
    on conflict do nothing;
  end loop;
end $$;

-- ──────────────────────────────────────────────────────────────────────
-- 336 foods — 56 per exchange category (matches demo-data.ts generators)
-- ──────────────────────────────────────────────────────────────────────
do $$
declare
  cats exchange_category[] := array['starch','fruit','vegetable','protein','dairy','fat'];
  bases jsonb := '{
    "starch":    ["Brown Rice","Oatmeal","Pita Bread","Sweet Potato","Quinoa","Popcorn","Pasta","Tortilla"],
    "fruit":     ["Apple","Banana","Berries","Orange","Pear","Mango","Kiwi","Peaches"],
    "vegetable": ["Cucumber","Spinach","Carrots","Tomato","Broccoli","Peppers","Zucchini","Salad Greens"],
    "protein":   ["Chicken Breast","Salmon","Eggs","Turkey","Greek Yogurt","Lentils","Tofu","Tuna"],
    "dairy":     ["Milk","Labneh","Yogurt","Kefir","Cottage Cheese","Cheese Cubes","Ricotta","Laban"],
    "fat":       ["Olive Oil","Avocado","Tahini","Nuts","Seeds","Peanut Butter","Walnuts","Hummus"]
  }';
  portions jsonb := '{
    "starch":    ["1/3 cup cooked","1 slice","1 small","1/2 cup cooked","3 cups popped"],
    "fruit":     ["1 small","1 medium","3/4 cup","1 cup sliced","1/2 large"],
    "vegetable": ["1 cup raw","1/2 cup cooked","1 bowl","3/4 cup"],
    "protein":   ["1 oz","2 oz","1/2 cup","3/4 cup","1 piece"],
    "dairy":     ["1 cup","3/4 cup","1/3 cup","2 slices"],
    "fat":       ["1 tsp","1 tbsp","1/8 avocado","6 pieces","2 tbsp"]
  }';
  cat text; arr text[]; parr text[]; n text; p text; ex numeric; eq jsonb; kw text[]; tip text; i int; idx int;
begin
  foreach cat in array cats loop
    arr  := array(select jsonb_array_elements_text(bases->cat));
    parr := array(select jsonb_array_elements_text(portions->cat));
    for i in 1..56 loop
      idx := i - 1;
      n   := arr[(idx % array_length(arr,1))+1] || ' ' || i;
      p   := parr[(idx % array_length(parr,1))+1];
      ex  := case when cat = 'vegetable' then 0.5 else 1 end;
      eq  := jsonb_build_array(
               arr[((idx+1) % array_length(arr,1))+1] || ' '  || parr[((idx+1) % array_length(parr,1))+1],
               arr[((idx+2) % array_length(arr,1))+1] || ' '  || parr[((idx+2) % array_length(parr,1))+1],
               arr[((idx+3) % array_length(arr,1))+1] || ' '  || parr[((idx+3) % array_length(parr,1))+1]
             );
      kw  := array[lower(arr[(idx % array_length(arr,1))+1]), cat, 'exchange', 'meal', 'portion'];
      tip := arr[(idx % array_length(arr,1))+1] || ' can fit well in a balanced meal when you pair it with protein or fiber for staying power.';
      insert into public.foods (name, category, serving_size, exchanges, image_url, equivalent_foods, learning_tip, keywords)
      values (n, cat::exchange_category, p, ex,
              'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=' ||
                replace(urlencode(
                  n || ', ' ||
                  case cat
                    when 'starch'    then 'on elegant small ceramic plate or portion bowl'
                    when 'fruit'     then 'on elegant small plate or in small bowl'
                    when 'vegetable' then 'on elegant small plate, fresh or lightly steamed'
                    when 'protein'   then 'on elegant small white plate, properly portioned'
                    when 'dairy'     then 'in glass, elegant cup, or small portion dish'
                    when 'fat'       then 'on elegant small dish, in spoon, or in glass ramekin'
                    else 'on elegant small plate'
                  end || ', ' ||
                  'soft pastel healthcare website aesthetic, studio light, bright white background, minimal elegant plating, premium food photography, no borders, no letterbox, no pillarbox, no black bars, fills entire frame, edge-to-edge content'
                ), 'E2%80%82', '') ||
                '&image_size=portrait_4_3',
              eq, tip, kw)
      on conflict do nothing;
    end loop;
  end loop;
end $$;

-- ──────────────────────────────────────────────────────────────────────
-- 11 Lessons (Learning Center topics)
-- ──────────────────────────────────────────────────────────────────────
do $$
declare
  specs jsonb := '[
    ["what-are-food-exchanges",      "What are food exchanges?",   "Foundations"],
    ["building-balanced-meals",      "Building balanced meals",    "Meals"],
    ["portion-sizes",                "Portion sizes",              "Practical skills"],
    ["reading-nutrition-labels",     "Reading nutrition labels",   "Practical skills"],
    ["meal-prep",                    "Meal prep",                  "Lifestyle"],
    ["grocery-shopping",             "Grocery shopping",           "Lifestyle"],
    ["eating-out",                   "Eating out",                 "Lifestyle"],
    ["protein",                      "Protein essentials",         "Nutrition"],
    ["healthy-fats",                 "Healthy fats",               "Nutrition"],
    ["water-and-hydration",          "Water and hydration",        "Nutrition"],
    ["vegetables",                   "Why vegetables matter",      "Nutrition"]
  ]';
  rec jsonb; i int; v_slug text; v_title text; v_topic text;
begin
  for i in 0..jsonb_array_length(specs)-1 loop
    rec     := specs->i;
    v_slug  := rec->>0;
    v_title := rec->>1;
    v_topic := rec->>2;
    insert into public.lessons (slug, title, topic, illustration_url, summary, tips, takeaways, content_blocks)
    values (
      v_slug, v_title, v_topic,
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=' ||
        urlencode('premium editorial healthcare illustration, soft pastel nutrition education, ' || v_title || ', glassmorphism card art, elegant minimal website visual') ||
        '&image_size=landscape_16_9',
      'A calm, practical lesson with quick wins, food examples, and simple decisions you can use today.',
      '["Pair one anchor food with one support food to make meals easier to repeat.","Use the exchange system to flex portions instead of labeling foods as good or bad.","Keep your meals familiar. Better structure is often more useful than full reinvention."]'::jsonb,
      jsonb_build_array(
        'Build confidence through repetition.',
        'Keep meals satisfying before you make them stricter.',
        'Lesson ' || (i+1) || ' supports flexible consistency.'
      ),
      '[]'::jsonb
    ) on conflict (slug) do nothing;
  end loop;
end $$;

-- ──────────────────────────────────────────────────────────────────────
-- Demo meals for Mila (3 default: breakfast / lunch / snack)
-- ──────────────────────────────────────────────────────────────────────
do $$
declare
  cid uuid := 'aaaaaaaa-0000-4000-8000-000000000002';
  mid uuid;
begin
  -- Breakfast
  insert into public.meals (client_id, meal_type, notes, logged_at)
  values (cid, 'breakfast', 'Nice balance. Consider one vegetable exchange later.', '2026-07-31T08:30:00Z')
  returning id into mid;
  insert into public.meal_entries (meal_id, food_id, serving_multiplier, exchanges_by_category)
  select mid, id, 1, '{"starch":0.5}'::jsonb from public.foods where name like 'Brown Rice%' limit 1;

  -- Lunch
  insert into public.meals (client_id, meal_type, logged_at)
  values (cid, 'lunch', '2026-07-31T13:00:00Z') returning id into mid;
  insert into public.meal_entries (meal_id, food_id, serving_multiplier, exchanges_by_category)
  select mid, id, 1, '{"protein":1}'::jsonb from public.foods where name like 'Chicken Breast%' limit 1;

  -- Snack
  insert into public.meals (client_id, meal_type, logged_at)
  values (cid, 'snack', '2026-07-31T16:00:00Z') returning id into mid;
  insert into public.meal_entries (meal_id, food_id, serving_multiplier, exchanges_by_category)
  select mid, id, 1, '{"dairy":1}'::jsonb from public.foods where name like 'Greek Yogurt%' limit 1;
end $$;

-- ──────────────────────────────────────────────────────────────────────
-- Weight + water entries (7-day trailing for Mila Nasser)
-- ──────────────────────────────────────────────────────────────────────
do $$
declare
  cid uuid := 'aaaaaaaa-0000-4000-8000-000000000002';
  d   int;
  w   numeric;
begin
  for d in 0..6 loop
    w := 74.0 - (d * 0.08);
    insert into public.weight_entries (client_id, weight_kg, recorded_at)
    values (cid, round(w,1)::numeric(5,2), now() - (d || ' days')::interval);
    insert into public.water_entries  (client_id, amount_ml,   recorded_at)
    values (cid, 1600 + (d*150),       now() - (d || ' days')::interval);
  end loop;
end $$;

-- Helper used above
create or replace function urlencode(value text) returns text language sql immutable as $$
  select regexp_replace(
           replace(
             replace(value, ' ', '%20'),
             '/', '%2F'
           ),
           '([^a-zA-Z0-9%._~-])',
           '%' || upper(lpad(to_hex(ascii('\1')),2,'0')),
           'g'
         );
$$;
