const api = require('../../utils/api.js');

Page({
  data: { detail: null, pendingCount: 0, batchId: '' },
  onLoad(q) {
    this.id = q.id;
    this.setData({ batchId: q.id || '' });
    this.load();
  },
  load() {
    if (!this.id || this.id === 'new') { this.setData({ detail: null }); return; }
    api.getBatchDetail(this.id).then((d) => {
      if (d && !d.error) {
        const pending = d.summary && d.summary[1] ? d.summary[1].num : 0;
        this.setData({ detail: d, pendingCount: pending });
      } else {
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    }).catch(() => {});
  },
  goReview() { if (this.id) wx.navigateTo({ url: '/pages/review/review?batchId=' + this.id }); },
  goAdvice() { if (this.id) wx.navigateTo({ url: '/pages/advice/advice?batchId=' + this.id }); },
  goCapture() { if (this.id) wx.navigateTo({ url: '/pages/capture/capture?batchId=' + this.id }); },
  markTeaching() {
    const d = this.data.detail;
    if (!d || !d.kps) return;
    wx.showModal({
      title: '标记讲评覆盖知识点',
      content: '输入本次讲评覆盖的知识点（逗号分隔），用于验证讲评有效性 Δ',
      editable: true,
      placeholderText: d.kps,
      success: (res) => {
        if (res.confirm && res.content) {
          const points = res.content.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
          api.setTeaching(this.id, points).then(() =>
            wx.showToast({ title: '已记录，后续清单可验证有效性', icon: 'none' }));
        }
      }
    });
  },
  edit() { wx.showToast({ title: '已确认清单不可编辑', icon: 'none' }); },
  remove() {
    wx.showModal({
      title: '删除清单',
      content: '将级联删除其下全部影像与题级记录，确认？',
      success: (res) => {
        if (res.confirm) {
          api.removeBatch(this.id).then(() => wx.navigateBack());
        }
      }
    });
  }
});
