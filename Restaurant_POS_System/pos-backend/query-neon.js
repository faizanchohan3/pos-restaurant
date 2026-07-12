const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_EwHePj93LsKY@ep-restless-feather-atgs0zm2-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
});

async function main() {
  try {
    await client.connect();

    console.log("=== SHOPS ===\n");
    const shopsResult = await client.query('SELECT * FROM "Shop" ORDER BY id DESC');
    if (shopsResult.rows.length === 0) {
      console.log("No shops found");
    } else {
      shopsResult.rows.forEach(row => {
        console.log(`ID: ${row.id}`);
        console.log(`Name: ${row.name}`);
        console.log(`Owner: ${row.ownerName}`);
        console.log(`Email: ${row.email}`);
        console.log(`Phone: ${row.phone}`);
        console.log(`Address: ${row.address}`);
        console.log(`Status: ${row.status}`);
        console.log(`Created: ${row.createdAt}`);
        console.log("---");
      });
    }

    console.log("\n=== SUPER ADMINS ===\n");
    const superAdminResult = await client.query('SELECT id, name, email, "createdAt" FROM "SuperAdmin" ORDER BY id DESC');
    if (superAdminResult.rows.length === 0) {
      console.log("No super admins found");
    } else {
      superAdminResult.rows.forEach(row => {
        console.log(`ID: ${row.id}`);
        console.log(`Name: ${row.name}`);
        console.log(`Email: ${row.email}`);
        console.log(`Created: ${row.createdAt}`);
        console.log("---");
      });
    }

    console.log("\n=== USERS (STAFF) ===\n");
    const usersResult = await client.query('SELECT id, name, email, phone, role, "shopId", "createdAt" FROM "User" ORDER BY id DESC LIMIT 10');
    if (usersResult.rows.length === 0) {
      console.log("No users/staff found");
    } else {
      usersResult.rows.forEach(row => {
        console.log(`ID: ${row.id}`);
        console.log(`Name: ${row.name}`);
        console.log(`Email: ${row.email}`);
        console.log(`Role: ${row.role}`);
        console.log(`Shop ID: ${row.shopId}`);
        console.log(`Created: ${row.createdAt}`);
        console.log("---");
      });
    }

  } catch (error) {
    console.error("Database Error:", error.message);
  } finally {
    await client.end();
  }
}

main();
