# ASocialSys - 类Twitter社交网站

一个采用Notion简洁风格设计的现代化社交网站，支持发布动态、关注用户、点赞评论等核心社交功能。

## 技术架构

### 后端技术栈
- **框架**: Django 4.2 + Django REST Framework
- **数据库**: MySQL 8.0 (主库) + Redis 7.0 (缓存)
- **认证**: JWT + RBAC权限控制
- **API文档**: drf-spectacular (OpenAPI 3.0)
- **异步任务**: Celery + Redis

### 前端技术栈
- **框架**: React 18 + TypeScript
- **状态管理**: Redux Toolkit + RTK Query
- **UI组件**: Tailwind CSS + Headless UI
- **路由**: React Router v6
- **构建工具**: Vite

### 基础设施
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **CI/CD**: GitHub Actions
- **监控**: Prometheus + Grafana

## 项目结构

```
ASocialSys/
├── backend/            # Django后端项目
│   ├── requirements.txt
│   ├── Dockerfile
│   └── src/
│       ├── apps/       # 应用模块
│       ├── config/     # 项目配置
│       └── tests/      # 测试代码
├── frontend/           # React前端项目
│   ├── package.json
│   ├── Dockerfile
│   └── src/
│       ├── components/ # 组件库
│       ├── views/      # 页面组件
│       └── router/     # 路由配置
├── infrastructure/     # 基础设施
│   ├── docker-compose.yml
│   └── nginx/          # 反向代理配置
├── docs/               # 项目文档
│   ├── API.md         # API接口文档
│   └── DEPLOYMENT.md  # 部署指南
└── README.md          # 项目说明
```

## 核心功能

### 用户系统
- 用户注册/登录/注销
- 个人资料管理
- 头像上传
- 邮箱验证

### 社交功能
- 发布/编辑/删除动态
- 关注/取消关注用户
- 点赞/取消点赞
- 评论/回复评论
- 私信功能

### 内容管理
- 动态时间线
- 热门推荐
- 搜索功能
- 话题标签

## 性能目标

- 支持每秒1000+并发请求
- 页面加载时间低于3秒
- 首屏加载时间低于1.5秒
- 测试覆盖率>85%

## 快速开始

### 开发环境要求
- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Redis 7.0+
- Docker & Docker Compose

### 本地开发

```bash
# 克隆项目
git clone <repository-url>
cd ASocialSys

# 启动开发环境
docker-compose up -d

# 后端开发
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# 前端开发
cd frontend
npm install
npm run dev
```

## 许可证