# Supabase + GitHub Pages 部署

## 1. 创建 Supabase 项目

1. 在 [Supabase](https://supabase.com/) 创建项目。
2. 打开 `SQL Editor`，执行 `supabase/schema.sql`。
3. 打开 `Project Settings -> API`。
4. 复制 `Project URL` 和公开的 `anon public` key。

把这两个值写入 `cloud-config.js`：

```js
window.MELD_CLOUD_CONFIG = {
  supabaseUrl: "https://你的项目.supabase.co",
  supabaseAnonKey: "你的 anon public key",
};
```

不要把 `service_role` key 写进前端。

## 2. 配置登录地址

在 Supabase 的 `Authentication -> URL Configuration` 中：

- Site URL 填写 GitHub Pages 地址，例如：
  `https://用户名.github.io/meld-studio/`
- Redirect URLs 添加同一个地址。

如果启用了邮箱确认，注册后需要先点击验证邮件，再回到网站登录。

## 3. 创建 GitHub 仓库

在 GitHub 新建空仓库，建议名称 `meld-studio`。

在项目目录执行：

```bash
git init
git add .
git commit -m "Publish MELD with Supabase cloud sync"
git branch -M main
git remote add origin https://github.com/用户名/meld-studio.git
git push -u origin main
```

## 4. 启用 GitHub Pages

仓库进入 `Settings -> Pages`，将 Source 设置为 `GitHub Actions`。

之后每次推送到 `main`，`.github/workflows/pages.yml` 都会自动部署。

发布地址：

```text
https://用户名.github.io/meld-studio/
```

## 云端保存的内容

- 作品名称、备注、音符、调性和编曲
- 自定义音色参数
- 登录会话只保存在当前标签页的 `sessionStorage`
- 登录后不再使用项目数据的 `localStorage`；首次登录会把已有本地作品迁移到云端
