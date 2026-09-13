const api = require('../../utils/api.js');
const cloud = require('../../utils/cloud.js');
const store = require('../../utils/data.js');
const app = getApp();

function rateCls(r) { if (r < 60) return 'danger'; if (r < 80) return 'warn'; return 'ok'; }

function blankAdvice() {
  return { source: '', classLevel: [], personal: [], aiText: '' };
}

Page({
  data: { advice: null, batchId: '', batches: [] },
  onLoad(q) {
    this.id = q.batchId || app.globalData.currentBatchId || '';
    this.setData({ batchId: this.id });
    this.load();
  },
  async loadBatches() {
    const list = await api.listBatches().catch(() => []);
    this.setData({ batches: list });
    return list;
  },
  pickBatch(e) {
    const id = e.currentTarget.dataset.id;
    this.id = id;
    app.globalData.currentBatchId = id;
    this.setData({ batchId: id });
    this.load();
  },
  async load() {
    let bid = this.id;
    const list = await this.loadBatches();
    if (!bid) {
      const c = list.find((b) => b.status === '已确认');
      bid = c ? c.id : '';
    }
    if (!bid) {
      this.setData({ advice: cloud.ready() ? blankAdvice() : store.advice });
      return;
    }
    this.setData({ batchId: bid });
    const ov = await api.getInsight(bid).catch(() => null);
    const students = await api.getStudents(bid).catch(() => null);
    const teach = await api.getTeaching(bid).catch(() => ({ text: '' }));
    if (!ov) {
      this.setData({ advice: cloud.ready() ? blankAdvice() : store.advice });
      return;
    }
    const classLevel = (ov.kpRank || []).slice(0, 3).map((k, i) => ({
      rank: String(i + 1), rankType: rateCls(k.rate), name: k.name,
      rate: '掌握率' + k.rate + '%', detail: '典型错法见学情页，建议配阶梯练习。'
    }));
    const personal = (students || []).filter((s) => s.focus === '优先')
      .map((s) => ({ name: s.name, level: '优先', levelType: 'danger', detail: s.advice || '' }));
    this.setData({
      advice: {
        source: (ov.classMastery != null ? '班级掌握度' + ov.classMastery + '% · ' : '') + '题级记录统计',
        classLevel, personal,
        aiText: teach && teach.text ? teach.text : ''
      }
    });
  },
  copyAll() {
    const a = this.data.advice;
    const lines = [];
    lines.push('【全班层面 · 下一节讲什么】');
    (a.classLevel || []).forEach((x) => lines.push(x.rank + '. ' + x.name + '（' + x.rate + '）：' + x.detail));
    lines.push('', '【个体层面 · 课后辅导谁】');
    (a.personal || []).forEach((x) => lines.push(x.name + '（' + x.level + '）：' + x.detail));
    if (a.aiText) lines.push('', '【AI 讲评建议全文】\n' + a.aiText);
    wx.setClipboardData({ data: lines.join('\n') });
  },
  toCourseware() { wx.showToast({ title: '已加入讲评课件', icon: 'none' }); },
  exportReport() { wx.showToast({ title: '已复制学情报告', icon: 'none' }); },
  refreshAI() { this.load(); }
});
