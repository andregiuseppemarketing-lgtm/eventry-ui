#!/bin/bash
set -euo pipefail

PRODUCTION_POSTGRES_URL="postgresql://neondb_owner:npg_1zKLQxqaUl6S@ep-wispy-hall-agi4r9qs-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require" node scripts/create-production-admin.mjs
