#!/bin/bash

if [ ! -d ".git" ]; then
  echo "Please deploy using Git."
  exit 1
fi

if ! command -v git &> /dev/null; then
    echo "Git is not installed! Please install git and try again."
    exit 1
fi

git config --global --add safe.directory $(pwd)
git fetch --all && git reset --hard origin/master && git pull origin master
rm -rf composer.lock composer.phar
wget https://github.com/composer/composer/releases/latest/download/composer.phar -O composer.phar
php composer.phar update -vvv

php_main_version=$(php -v | head -n 1 | cut -d ' ' -f 2 | cut -d '.' -f 1)
if [ $php_main_version -ge 8 ]; then
    php composer.phar require joanhey/adapterman
    if ! php -m | grep -q "pcntl"; then
        echo "Adding pcntl extension to cli-php.ini"
        sed -i '/extension=redis.so/a extension=pcntl.so' cli-php.ini
    fi
    php -c cli-php.ini webman.php stop
    echo "Webman stopped.Please restart it by yourself."
fi

php artisan v2board:update

# Run custom SQL migrations
echo "Running custom SQL migrations..."
DB_HOST=$(grep ^DB_HOST .env | cut -d '=' -f2 | tr -d ' \r')
DB_PORT=$(grep ^DB_PORT .env | cut -d '=' -f2 | tr -d ' \r')
DB_DATABASE=$(grep ^DB_DATABASE .env | cut -d '=' -f2 | tr -d ' \r')
DB_USERNAME=$(grep ^DB_USERNAME .env | cut -d '=' -f2 | tr -d ' \r')
DB_PASSWORD=$(grep ^DB_PASSWORD .env | cut -d '=' -f2 | tr -d ' \r')

if [ -z "$DB_PORT" ]; then
  DB_PORT=3306
fi

MYSQL_CMD="mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE}"

# Add trial_used to v2_user if not exists
$MYSQL_CMD -e "SELECT column_name FROM information_schema.columns WHERE table_schema='${DB_DATABASE}' AND table_name='v2_user' AND column_name='trial_used'" 2>/dev/null | grep -q trial_used
if [ $? -ne 0 ]; then
  echo "  Adding trial_used column to v2_user..."
  $MYSQL_CMD -e "ALTER TABLE v2_user ADD trial_used tinyint(1) NOT NULL DEFAULT '0' AFTER banned;" 2>/dev/null
fi

# Add trial_days to v2_plan if not exists
$MYSQL_CMD -e "SELECT column_name FROM information_schema.columns WHERE table_schema='${DB_DATABASE}' AND table_name='v2_plan' AND column_name='trial_days'" 2>/dev/null | grep -q trial_days
if [ $? -ne 0 ]; then
  echo "  Adding trial_days column to v2_plan..."
  $MYSQL_CMD -e "ALTER TABLE v2_plan ADD trial_days int(11) NULL DEFAULT '0' AFTER capacity_limit;" 2>/dev/null
fi

# Add region_id to server tables if not exists
for TBL in v2_server_vmess v2_server_vless v2_server_trojan v2_server_shadowsocks v2_server_hysteria v2_server_tuic v2_server_anytls v2_server_v2node; do
  $MYSQL_CMD -e "SELECT column_name FROM information_schema.columns WHERE table_schema='${DB_DATABASE}' AND table_name='${TBL}' AND column_name='region_id'" 2>/dev/null | grep -q region_id
  if [ $? -ne 0 ]; then
    echo "  Adding region_id to ${TBL}..."
    $MYSQL_CMD -e "ALTER TABLE ${TBL} ADD region_id varchar(255) DEFAULT NULL;" 2>/dev/null
  fi
done

# Create v2_login_log table if not exists
$MYSQL_CMD -e "SELECT table_name FROM information_schema.tables WHERE table_schema='${DB_DATABASE}' AND table_name='v2_login_log'" 2>/dev/null | grep -q v2_login_log
if [ $? -ne 0 ]; then
  echo "  Creating v2_login_log table..."
  $MYSQL_CMD -e "CREATE TABLE v2_login_log (id int(11) AUTO_INCREMENT PRIMARY KEY, user_id int(11) NOT NULL, ip varchar(128) DEFAULT NULL, ua varchar(512) DEFAULT NULL, created_at int(11) NOT NULL, INDEX idx_user_id (user_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;" 2>/dev/null
fi

# Create v2_subscribe_region table if not exists
$MYSQL_CMD -e "SELECT table_name FROM information_schema.tables WHERE table_schema='${DB_DATABASE}' AND table_name='v2_subscribe_region'" 2>/dev/null | grep -q v2_subscribe_region
if [ $? -ne 0 ]; then
  echo "  Creating v2_subscribe_region table..."
  $MYSQL_CMD -e "CREATE TABLE v2_subscribe_region (id int(11) AUTO_INCREMENT PRIMARY KEY, name varchar(64) NOT NULL, code varchar(10) NOT NULL, domain varchar(255) NOT NULL, icon varchar(64) DEFAULT NULL, sort int(11) DEFAULT 0, status tinyint(1) DEFAULT 1, created_at int(11) NOT NULL, updated_at int(11) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;" 2>/dev/null
fi

echo "Custom SQL migrations done!"

if [ -f "/etc/init.d/bt" ]; then
  chown -R www $(pwd);
fi
