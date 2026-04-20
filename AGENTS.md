<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-safety-rules -->
# 🔐 MANDATORY: Read Before ANY Action

This is the **Chaman Cab** production project. Data loss has occurred before. Follow all rules below without exception.

## ⚡ Quick Project Context
- **Type**: Cab booking platform (production, real customers)
- **Database**: SQLite — single file at `/home/ubuntu/app/dev.db` on EC2
- **ORM**: Prisma v7 with better-sqlite3 adapter
- **Hosting**: AWS EC2 Ubuntu at `98.84.13.176`, managed by PM2
- **Full docs**: Read `PROJECT_DOCS.md` for complete system understanding
- **Full rules**: Read `AI_RULES.md` for complete safety rules

## 🚫 NEVER Do These (No Exceptions)
- `npx prisma db push` — can silently DROP and recreate tables, wiping all data
- `prisma db reset` — wipes entire database
- `rm dev.db` or overwriting the database file without backup
- `DROP TABLE`, `DROP COLUMN`, or any destructive SQL
- Deploying without running backup first

## ✅ Always Do These
- **Schema changes**: Use `npx prisma migrate dev --name <feature>` locally, then `npx prisma migrate deploy` on production
- **Deploy**: Always use `bash ~/safe-deploy.sh` on EC2 — never deploy manually
- **Before risky ops**: Run `bash ~/backup.sh` and confirm backup exists on S3

## 🔄 Safe Deploy Command (on EC2)
```bash
bash ~/safe-deploy.sh
```
This automatically: backs up DB → git pull → migrate → build → restart

## 💾 Backup & Recovery
```bash
# Manual backup
bash ~/backup.sh

# List S3 backups
aws s3 ls s3://chamancab-db-backups/ --human-readable

# Restore from S3
aws s3 cp s3://chamancab-db-backups/dev_backup_YYYYMMDD_HHMMSS.db ~/app/dev.db
pm2 restart chamancab
```

## ⚠️ If Unsure About Anything
**STOP. Ask the user before proceeding.** Safety > Speed.
<!-- END:project-safety-rules -->
