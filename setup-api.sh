#!/bin/bash

#Variaveis de Ambiente + Github
GITHUB_REPO_URL="https://github.com/analaura-gb/TVBox.git"
PROJECT_DIR="/home/$USER/TVBox"
BRANCH="main"

#Atualização de Pacotes + Instalação do Node
sudo apt update
REQUIRED_NODE_MAJOR=18

if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_${REQUIRED_NODE_MAJOR}.x | sudo -E bash -
  sudo apt install -y nodejs
else
  CURRENT_NODE_MAJOR=$(node -v | grep -oP '(?<=v)\d+')
  if [ "$CURRENT_NODE_MAJOR" -lt "$REQUIRED_NODE_MAJOR" ]; then
    sudo apt remove -y nodejs
    curl -fsSL https://deb.nodesource.com/setup_${REQUIRED_NODE_MAJOR}.x | sudo -E bash -
    sudo apt install -y nodejs
  else
    echo "Node.js v$CURRENT_NODE_MAJOR já está instalado. Nenhuma ação necessária."
  fi
fi

#Clone ou atualização do repositório
if [ ! -d "$PROJECT_DIR/.git" ]; then
    git clone -b "$BRANCH" "$GITHUB_REPO_URL" "$PROJECT_DIR"
else
    cd "$PROJECT_DIR"
    git pull origin "$BRANCH"
fi

#Instalação de Dependências
API_DIR="$PROJECT_DIR/API"
cd "$API_DIR"
npm ci

#Serviço Systemd
SERVICE_NAME="tvbox-api"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
if [ ! -f "$SERVICE_FILE" ]; then
    sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=TVBox API
After=network.target

[Service]
WorkingDirectory=$API_DIR
ExecStart=/usr/bin/node $API_DIR/src/index.js
Restart=always
EnvironmentFile=$API_DIR/.env

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reexec
    sudo systemctl daemon-reload
    sudo systemctl enable $SERVICE_NAME
else
  echo "Serviço systemd já existe. Pulando criação."
fi

#Reinicia sempre após possíveis atualizações
sudo systemctl restart $SERVICE_NAME

echo "API iniciada!"
