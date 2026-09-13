const cloud = require('./utils/cloud.js');

App({
  onLaunch() {
    // 向自建后端换取 openid（无后端时自动回退本地 Mock）
    cloud.login();
    // 初始化全局状态：从缓存恢复教师设置与校正进度
    const store = require('./utils/data.js');
    store.restore();
    // 首次使用引导（OOBE）：未完成则进入引导页
    try {
      if (!wx.getStorageSync('oobe_done')) {
        wx.reLaunch({ url: '/pages/oobe/oobe' });
      }
    } catch (e) {}
  },
  globalData: {
    currentBatchId: ''
  }
});
