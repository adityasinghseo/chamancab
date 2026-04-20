#!/bin/bash
# backup_db.sh — Run on server before any migration
# Usage: bash prisma/backup_db.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="./prisma/backups/dev_${TIMESTAMP}.db"
mkdir -p ./prisma/backups
cp dev.db "$BACKUP_PATH"
echo "✅ Database backed up to: $BACKUP_PATH"
ls -lh ./prisma/backups/ | tail -5
