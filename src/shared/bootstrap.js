const { all, run } = require('./database');
const { config } = require('./config');

async function columnExists(tableName, columnName) {
  const columns = await all(`PRAGMA table_info("${tableName}")`);
  return columns.some((column) => column.name === columnName);
}

async function ensureUsersRoleColumn() {
  const exists = await columnExists('Users', 'Role');
  if (!exists) {
    await run('ALTER TABLE "Users" ADD COLUMN "Role" TEXT NOT NULL DEFAULT \'user\'');
  }

  await run('UPDATE "Users" SET "Role" = COALESCE(NULLIF("Role", \'\'), \'user\')');

  for (const email of config.adminEmails) {
    await run('UPDATE "Users" SET "Role" = \'admin\' WHERE LOWER("Email") = ?', [
      email,
    ]);
  }
}

async function ensureBlogsTable() {
  await run(`
    CREATE TABLE IF NOT EXISTS "Blogs" (
      "Id" TEXT NOT NULL PRIMARY KEY,
      "Title" TEXT NOT NULL,
      "Excerpt" TEXT NOT NULL,
      "Category" TEXT NOT NULL,
      "Author" TEXT NOT NULL,
      "ReadTime" TEXT NOT NULL,
      "Content" TEXT NOT NULL,
      "TagsJson" TEXT NOT NULL,
      "Status" TEXT NOT NULL,
      "Featured" INTEGER NOT NULL DEFAULT 0,
      "CoverImage" TEXT NULL,
      "CreatedAtUtc" TEXT NOT NULL,
      "UpdatedAtUtc" TEXT NOT NULL
    )
  `);
}

async function ensureConsultationsTable() {
  await run(`
    CREATE TABLE IF NOT EXISTS "Consultations" (
      "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "UserId" INTEGER NOT NULL,
      "Name" TEXT NOT NULL,
      "Surname" TEXT NOT NULL,
      "Email" TEXT NOT NULL,
      "PhoneNumber" TEXT NOT NULL,
      "IdNumber" TEXT NULL,
      "Reason" TEXT NOT NULL,
      "Date" TEXT NOT NULL,
      "Time" TEXT NOT NULL,
      "CreatedAtUtc" TEXT NOT NULL
    )
  `);
}

async function initializeDatabase() {
  await ensureUsersRoleColumn();
  await ensureBlogsTable();
  await ensureConsultationsTable();
}

module.exports = { initializeDatabase };
