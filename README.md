# 农用地流转系统
基于区块链技术的农用地流转系统，系统分为前端（front文件夹）、中间服务器（main文件夹）、区块链系统三部分组成。

## 启动方式

+ 确保安装并运行了Docker
+ 使用start_network.sh启动容器
+ 使用installchaincode.sh安装链码
+ 进入main文件夹执行`go run .`运行中间服务器
+ 进入front文件夹运行`npm run start` 运行前端服务
