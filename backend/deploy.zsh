#! /usr/bin/env zsh
set -e
GOOS=linux GOARCH=amd64 go build -o bin/budgeter-linux-amd64 .
scp -i ~/.ssh/Mac_to_homelab bin/budgeter-linux-amd64 root@budgeter.shallows:/opt/budgeter/temp-server
ssh -t -i ~/.ssh/Mac_to_homelab root@budgeter.shallows << EOF
mv /opt/budgeter/temp-server /opt/budgeter/budgeter
chmod 750 /opt/budgeter/budgeter
chown root:web /opt/budgeter/budgeter

chown -R root:web /data/budgeter/
chmod -R 770 /data/budgeter

systemctl restart budgeter-api
EOF
