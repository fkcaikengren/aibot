#!/bin/bash

# 检查是否存在镜像 aibot-next
image_id=$(docker images -q aibot-next)

if [ -n "$image_id" ]; then
    echo "镜像 aibot-next 存在，检查是否被使用..."

    # 检查镜像是否被任何容器使用
    in_use=$(docker ps -a --filter "ancestor=aibot-next" -q)

    if [ -z "$in_use" ]; then
        echo "镜像未被使用，删除镜像..."
        docker rmi aibot-next
    else
        echo "镜像正在被使用，无法删除。"
        exit 1
    fi
else
    echo "镜像 aibot-next 不存在。"
fi

# 构建新的镜像
echo "开始构建新的 aibot-next 镜像..."
docker build -t aibot-next .

echo "构建完成。"
