#!/usr/bin/env bash
# deploy.sh — Builds the project and prepares a deploy/ folder ready to upload to Banahosting
# Usage:
#   bash deploy.sh                   — build only (no FTP upload)
#   bash deploy.sh --upload          — build + upload via FTP (requires lftp and .env.deploy)
#
# FTP credentials (.env.deploy — never commit this file):
#   FTP_HOST=ftp.yourdomain.com
#   FTP_USER=your_ftp_user
#   FTP_PASS=your_ftp_password
#   FTP_REMOTE_DIR=/public_html

set -e

DEPLOY_DIR="deploy"
SPA_DIR="dist/spa"

echo "→ Cleaning previous deploy..."
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

echo "→ Building React SPA..."
npm run build:client

echo "→ Copying SPA build to deploy/..."
cp -r "$SPA_DIR"/. "$DEPLOY_DIR/"

echo "→ Copying PHP API files (excluding _config.php)..."
mkdir -p "$DEPLOY_DIR/api"
find public/api -maxdepth 1 -name "*.php" ! -name "_config.php" -exec cp {} "$DEPLOY_DIR/api/" \;

echo "→ Copying PHP admin API files..."
mkdir -p "$DEPLOY_DIR/api/admin"
find public/api/admin -maxdepth 1 -name "*.php" ! -name "_config.php" -exec cp {} "$DEPLOY_DIR/api/admin/" \;

echo "→ Copying PHP cron files..."
mkdir -p "$DEPLOY_DIR/api/cron"
find public/api/cron -maxdepth 1 -name "*.php" -exec cp {} "$DEPLOY_DIR/api/cron/" \;

echo ""
echo "⚠️  IMPORTANT: public/api/_config.php is NOT included in the deploy folder."
echo "   You must manually upload _config.php to public_html/api/ on the server."
echo "   Use public/api/_config.example.php as a reference."
echo ""

echo "→ Copying .htaccess..."
cp public/.htaccess "$DEPLOY_DIR/.htaccess"

echo "✓ Deploy folder ready at: ./$DEPLOY_DIR"
echo ""
echo "Upload the contents of ./$DEPLOY_DIR to your Banahosting public_html via:"
echo "  - cPanel File Manager (zip and upload)"
echo "  - FTP client (FileZilla, Transmit, etc.)"
echo "  - Or run: bash deploy.sh --upload (requires lftp + .env.deploy)"

# Optional FTP upload
if [[ "$1" == "--upload" ]]; then
  if [[ ! -f ".env.deploy" ]]; then
    echo "✗ Missing .env.deploy file with FTP credentials."
    exit 1
  fi

  # Load FTP credentials
  export $(grep -v '^#' .env.deploy | xargs)

  if ! command -v lftp &> /dev/null; then
    echo "✗ lftp is not installed. Install with: brew install lftp"
    exit 1
  fi

  echo "→ Uploading to $FTP_HOST$FTP_REMOTE_DIR ..."
  lftp -c "
    set ftp:ssl-allow yes;
    set ssl:verify-certificate no;
    open -u $FTP_USER,$FTP_PASS $FTP_HOST;
    mirror --reverse --delete --verbose $DEPLOY_DIR/ $FTP_REMOTE_DIR/;
    bye
  "
  echo "✓ Upload complete!"
fi
