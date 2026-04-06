const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const http = require('http');
const schedule = require('node-schedule');

// 创建Express应用（Web控制台后端）
const expressApp = express();
const server = http.createServer(expressApp);

// 静态文件服务
expressApp.use(express.static(path.join(__dirname, '..', 'public')));

// API路由
expressApp.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    agents: 165,
    articles: 6,
    公众号: '技趣研究',
    appID: 'wx71a91e04e801cb76',
    originalID: 'gh_68be8e1988fd'
  });
});

expressApp.get('/api/start-agent/:name', (req, res) => {
  console.log(`启动智能体: ${req.params.name}`);
  res.json({ success: true, message: `已启动 ${req.params.name}` });
});

expressApp.get('/api/publish-article', (req, res) => {
  console.log('发布文章到公众号');
  // 这里会集成微信API
  res.json({ success: true, message: '文章已发布到公众号' });
});

expressApp.get('/api/articles', (req, res) => {
  const articles = [
    'AI大模型新突破：GLM-5如何改变开发者生态',
    '量子计算：开发者需要了解的下一代计算范式',
    'Python自动化：提升开发者效率的实用指南',
    'AI军备竞赛：科技巨头的战略布局与开发者机遇',
    '开发者工具栈：构建高效开发工作流的必备利器',
    '调试的艺术：从新手到专家的调试技巧大全'
  ];
  res.json({ articles });
});

// 启动Web服务器
const PORT = 8080;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`一人集团Web控制台运行在 http://localhost:${PORT}`);
});

// 自动化任务调度
schedule.scheduleJob('0 9 * * 1-6', function(){
  console.log('每日9点自动发布文章任务执行');
  // 自动发布今日文章
});

schedule.scheduleJob('0 7 * * *', function(){
  console.log('每日7点生成集团早报');
  // 生成集团早报
});

// Electron主窗口
let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 加载Web控制台
  mainWindow.loadURL(`http://localhost:${PORT}`);
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 系统托盘
function createTray() {
  const iconPath = path.join(__dirname, '..', 'assets', 'tray-icon.png');
  let trayIcon;
  
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
  } catch (error) {
    // 如果没有图标文件，使用默认
    trayIcon = nativeImage.createEmpty();
  }
  
  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    { label: '打开控制台', click: () => mainWindow.show() },
    { label: '启动所有智能体', click: () => console.log('启动所有智能体') },
    { label: '退出', click: () => app.quit() }
  ]);
  
  tray.setToolTip('一人集团 - 多智能体系统');
  tray.setContextMenu(contextMenu);
}

// 应用生命周期
app.whenReady().then(() => {
  createWindow();
  createTray();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC通信
ipcMain.handle('start-all-agents', async () => {
  console.log('启动所有165个智能体');
  return { success: true, message: '所有智能体已启动' };
});

ipcMain.handle('stop-all-agents', async () => {
  console.log('停止所有165个智能体');
  return { success: true, message: '所有智能体已停止' };
});