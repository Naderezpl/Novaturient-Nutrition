const { Client } = require("pg");

const schemaOnly = process.argv.includes("--schema");
const seedOnly   = process.argv.includes("--seed");
const clean      = process.argv.includes("--clean");

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  if (clean) {
    console.log("Dropping Neon demo table 'playing_with_neon'...");
    await client.query(`drop table if exists public.playing_with_neon cascade`);
    console.log("Done.");
  }

  if (schemaOnly || !seedOnly) {
    const fs = require("fs");
    const path = require("path");
    const schema = fs.readFileSync(
      path.join(__dirname, "..", "supabase", "combined", "neon_schema_and_seed.sql"),
      "utf8"
    );
    // Split schema section from seed section: run the full combined file every
    // time because it uses `if not exists` / `on conflict do nothing`.
    console.log("Applying combined schema + seed SQL (idempotent)...");
    await client.query(schema);
    console.log("Done.");
  }

  const names = await client.query(
    `select table_name, (xpath('/row/c/text()',
        query_to_xml(format('select count(*) as c from public.%I', table_name),
                      false, true, '')))[1]::text::int as rows
     from information_schema.tables
     where table_schema = 'public'
     order by table_name`
  );
  console.log(`\n${names.rows.length} table(s) in public schema:`);
  console.table(names.rows);

  await client.end();
})().catch((e) => { console.error(e); process.exit(1); });
