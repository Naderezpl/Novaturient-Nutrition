/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require("pg");

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const count = await client.query(
    `select count(*)::int as n from information_schema.tables where table_schema = 'public'`
  );
  console.log("Total tables in public schema:", count.rows[0].n);

  const names = await client.query(
    `select table_name, (xpath('/row/c/text()',
        query_to_xml(format('select count(*) as c from public.%I', table_name),
                      false, true, '')))[1]::text::int as rows
     from information_schema.tables
     where table_schema = 'public'
     order by table_name`
  );
  console.table(names.rows);

  await client.end();
})().catch((e) => { console.error(e); process.exit(1); });
