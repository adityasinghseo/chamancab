#!/bin/bash
# ============================================================
# Chaman Cab - Production Database Backup Script
# Run this BEFORE any prisma db push / migration on EC2
# Usage: bash scripts/backup-db.sh
# ============================================================

DB_PATH="/home/ubuntu/app/dev.db"
BACKUP_DIR="/home/ubuntu/db_backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/dev_backup_$TIMESTAMP.db"

mkdir -p "$BACKUP_DIR"

if [ -f "$DB_PATH" ]; then
  cp "$DB_PATH" "$BACKUP_FILE"
  echo "✅ Backup saved to: $BACKUP_FILE"
  echo "   Size: $(du -h "$BACKUP_FILE" | cut -f1)"
  ls -lt "$BACKUP_DIR" | head -10
else
  echo "❌ Database not found at $DB_PATH"
  exit 1
fi
