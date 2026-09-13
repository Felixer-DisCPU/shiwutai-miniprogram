const api = require('../../utils/api.js');
const app = getApp();
const TYPES = ['日常作业', '周测', '月考', '单元测验'];

Page({
  data: {
    name: '', klass: '初二(3)班', subject: '初中数学', typeIdx: 3, types: TYPES,
    date: '', submitting: false
  },
  onName(e) { this.setData({ name: e.detail.value }); },
  onKlass(e) { this.setData({ klass: e.detail.value }); },
  onDate(e) { this.setData({ date: e.detail.value }); },
  pickType(e) { this.setData({ typeIdx: Number(e.currentTarget.dataset.i) }); },
  async submit() {
    if (!this.data.name) { wx.showToast({ title: '请填写清单名称', icon: 'none' }); return; }
    this.setData({ submitting: true });
    const b = {
      title: this.data.name, className: this.data.klass, subject: this.data.subject,
      type: this.data.types[this.data.typeIdx], examDate: this.data.date,
      pointScope: []
    };
    const r = await api.createBatch(b).catch((e) => ({ error: String(e) }));
    this.setData({ submitting: false });
    if (r && r.id) {
      app.globalData.currentBatchId = r.id;
      wx.redirectTo({ url: '/pages/batch-detail/batch-detail?id=' + r.id });
    } else {
      wx.showToast({ title: '创建失败', icon: 'none' });
    }
  }
});
