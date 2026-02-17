FROM node:20-bookworm

# 開発に必要なツールをインストール
RUN apt-get update && apt-get install -y \
    git \
    curl \
    sudo \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# node ユーザーに sudo 権限を付与
RUN echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# 作業ディレクトリ
WORKDIR /workspace

# node ユーザーで実行
USER node

EXPOSE 3000
