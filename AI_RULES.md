# 🔐 AI SAFETY & DATABASE RULES (MANDATORY)

This project is production-critical. You (AI agent) MUST follow all rules below before making any change.

-----------------------------------
🚫 ABSOLUTE RESTRICTIONS (DO NOT DO)
-----------------------------------

1. NEVER run:
   - npx prisma db push
   - prisma db reset
   - Any command that drops or recreates tables

2. NEVER delete or truncate any table
3. NEVER overwrite the SQLite database file (dev.db)
4. NEVER modify or drop existing columns directly
5. NEVER perform destructive schema changes without explicit approval

-----------------------------------
✅ SAFE DATABASE PRACTICES
-----------------------------------

1. ALWAYS use Prisma Migrations:

   Local:
   npx prisma migrate dev --name <feature_name>

   Production:
   npx prisma migrate deploy

2. All schema changes must be:
   - Additive (safe)
   - Backward compatible

3. If a change is destructive:
   - STOP
   - Ask for confirmation
   - Suggest safe migration strategy

-----------------------------------
🆕 WHEN ADDING NEW FEATURE (WITH DB CHANGES)
-----------------------------------

1. Update schema.prisma safely:
   - Add new tables or fields only
   - DO NOT modify existing columns destructively

2. Generate migration:
   npx prisma migrate dev --name add_<feature>

3. BEFORE applying migration:
   - Explain what will change
   - Confirm no data loss

4. Review migration SQL:
   - Ensure NO DROP TABLE
   - Ensure NO DROP COLUMN

5. After migration:
   - Verify existing data is intact
   - Check record counts (drivers, bookings, etc.)

-----------------------------------
🚀 DEPLOYMENT RULES
-----------------------------------

NEVER deploy manually.

ALWAYS use:
bash ~/safe-deploy.sh

This script lives at: /home/ubuntu/safe-deploy.sh on EC2

This ensures:
- Database backup runs FIRST (local + S3)
- Git pull runs after backup
- Safe prisma migrate deploy (NOT db push)
- Build and restart only after all above succeed

-----------------------------------
💾 BACKUP RULES
-----------------------------------

1. Local backups — /home/ubuntu/db_backups/ (auto-cleaned after 7 days)
2. S3 backups — s3://chamancab-db-backups (kept 30 days)
3. Cron runs TWICE daily: 3AM UTC + 3PM UTC

Before any risky operation, VERIFY backup exists:
   ls -lah ~/db_backups/
   aws s3 ls s3://chamancab-db-backups/ --human-readable

If no recent backup exists → run backup first:
   bash ~/backup.sh

Do NOT proceed with risky changes until backup is confirmed.

-----------------------------------
🔄 ROLLBACK / RECOVERY RULE
-----------------------------------

If anything goes wrong:

1. STOP immediately — do not retry the failed command
2. List available S3 backups:

   aws s3 ls s3://chamancab-db-backups/ --human-readable

3. Restore latest backup (replace filename with most recent):

   aws s3 cp s3://chamancab-db-backups/dev_backup_YYYYMMDD_HHMMSS.db ~/app/dev.db
   pm2 restart chamancab

4. Verify data is restored:

   sqlite3 ~/app/dev.db "SELECT COUNT(*) FROM Booking; SELECT COUNT(*) FROM Car; SELECT COUNT(*) FROM Driver;"

5. Report what went wrong before proceeding further.

-----------------------------------
🔍 VERIFICATION BEFORE APPLYING CHANGES
-----------------------------------

Before executing any command:

You MUST:
- Explain what the command will do
- Confirm it will NOT delete or overwrite data
- Ask for approval if any risk exists

-----------------------------------
🧠 MEMORY INSTRUCTION (IMPORTANT)
-----------------------------------

You must remember:

- This project uses SQLite (dev.db on EC2)
- Data loss has occurred in past
- Safety is priority over speed
- Never assume schema changes are safe

-----------------------------------
⚠️ IF UNSURE
-----------------------------------

If there is ANY uncertainty:

- STOP execution
- Ask for clarification
- Suggest safest approach

-----------------------------------
🎯 GOAL
-----------------------------------

- Zero data loss
- Safe feature development
- Controlled and reversible changes only

-----------------------------------
🚫 BLOCKED COMMANDS
-----------------------------------

- npx prisma db push          ← DESTROYS data on schema conflicts
- prisma db reset              ← WIPES entire database
- sqlite3 dev.db "DROP TABLE"  ← Direct table destruction
- rm dev.db                    ← Deletes entire database
- Any manual schema sync       ← Unpredictable behavior
- cp /dev/null dev.db          ← Zeroes out the database file
- Overwriting dev.db without backup first

-----------------------------------
🧠 DATABASE CHANGE RULE
-----------------------------------

For any new feature requiring DB change:

1. Local:
   npx prisma migrate dev --name <feature>

2. Production:
   bash ~/safe-deploy.sh

DO NOT skip migration step.
DO NOT use db push.