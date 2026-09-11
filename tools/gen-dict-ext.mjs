// gen-dict-ext.mjs —— #301 词典拼字·扩展词库生成工具（永久维护工具）
// 用法：先下载 jieba 词库（https://raw.githubusercontent.com/fxsjy/jieba/master/jieba/dict.txt，MIT License），
//   curl -o jieba-dict.txt https://raw.githubusercontent.com/fxsjy/jieba/master/jieba/dict.txt
//   node tools/gen-dict-ext.mjs jieba-dict.txt
// 规则（情侣聊天场景，四层过滤，详见 src/js/dict-ext-data.js 文件头注释）：
//   ① 词性剔除专名：ns 地名 / nt 机构 / nr,nrt 人名 / nz 其他专名；
//   ② 语素块禁：政治党政/军事/法律犯罪/金融/宗教神鬼/病灾死亡/古代帝制/灾祸/武贪奸淫等 60+ 字；
//   ③ 词级剔除：语素有日常用法但整词不当的（恐怖/商业/迷信占卜/IT/行政委员会等精确词）；
//   ④ 白名单：仿佛/冠军/赌气/打赌/胆小鬼/死心塌地/凶巴巴/贪吃/贪玩/贪睡/恐龙/欺负/抱怨/埋怨/怨言/怨气/纪念品/纪念册。
//   5 字及以上长词不收录（政治行政长词重灾区，情侣拼字用不上）。
// 输出：src/js/dict-ext-data.js（词串空格分隔，载入时 split 还原）。
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const w = {}; w.window = w;
vm.runInNewContext(fs.readFileSync(path.join(root, 'src/js/default-cards-data.js'), 'utf8'), w);
const baseWords = new Set();
(w.DEFAULT_CARD_DATA.dict || []).forEach(g => { if (g[0].indexOf('词库') === 0) (g[1] || []).forEach(x => baseWords.add(x)); });

const dictPath = process.argv[2] || path.join(process.env.TEMP || '/tmp', 'jieba-dict.txt');
const lines = fs.readFileSync(dictPath, 'utf8').split('\n');
const cjk = /^[\u4e00-\u9fff]+$/;
const BAD_POS = new Set(['ns', 'nt', 'nr', 'nrt', 'nz']);
const BLACKLIST = new Set(['中国', '天安门', '人民政府', '国务院', '鄂州', '鄂州市', '共产党', '党中央', '全国人大', '解放军', '国家', '祖国', '首都', '曾宪梓']);
const MORPHEME_BLOCK = ['党', '政', '军', '警', '兵', '罪', '狱', '刑', '赌', '盗', '窃', '匪', '贼', '寇', '凶', '尸', '棺', '坟', '墓', '葬', '皇', '帝', '妃', '衙', '佛', '鬼', '妖', '魔', '巫', '股', '税', '债', '贷', '券', '官', '杀', '血', '死', '武', '贪', '奸', '淫', '妓', '嫖', '毒', '枪', '灾', '祸', '骗', '击', '攻', '仇', '恨', '诡', '诅', '贿', '奴', '雇', '绩', '贸',
  '主义', '纪念', '人民', '民主', '区域', '平方', '主席', '马克思', '国际', '宪', '革命', '阶级', '剥削', '立法', '司法', '执法', '普法', '国有', '私有', '公有', '共产', '司令', '劳模', '少先', '国务', '纪委'];
const WHITELIST = new Set(['仿佛', '冠军', '亚军', '赌气', '打赌', '胆小鬼', '死心塌地', '凶巴巴', '贪吃', '贪玩', '贪睡', '恐龙', '欺负', '抱怨', '埋怨', '怨言', '怨气', '纪念品', '纪念册']);
const WORD_BLOCK = new Set([
  // 宗教/迷信占卜
  '上帝', '教堂', '牧师', '神父', '祷告', '圣经', '庙宇', '庙会', '寺庙', '祭祀', '祭祖', '观音', '菩萨', '神灵', '神明', '神像', '神龛', '神汉', '神婆', '神棍', '风水', '迷信', '占卜', '算命', '符咒', '手相', '驱邪', '抽签',
  // 军事武器（弹/战/枪有日常用法，词级处理）
  '导弹', '炮弹', '子弹', '炸弹', '弹药', '弹头', '弹壳', '弹片', '弹道', '弹弓', '氢弹', '原子弹', '手枪', '步枪', '机枪', '枪支', '核武器', '核潜艇', '核试验',
  '战争', '战场', '战斗', '战士', '战舰', '战火', '战乱', '停战', '宣战', '奋战', '大战', '战役', '进攻', '防御', '突击', '轰炸', '射击',
  // 暴力攻击/恐吓/犯罪补充
  '袭击', '冲击', '鞭子', '欺侮', '诈骗', '绑架', '贩毒', '走私', '抢劫', '抢夺', '贪污', '腐败', '贿赂', '堕落', '法院', '检察', '律师', '起诉', '官司', '辩护', '侦破', '嫌疑',
  // 商业经济/职场黑话（商量/商店/老板/薪水/加班等日常词不受影响）
  '商业', '商务', '经济', '贸易', '体制', '报表', '倒闭', '汇率', '利率', '通胀', '审计', '会计', '招标', '投标', '预算', '融资', '基金', '期货', '资本', '货币',
  // 病灾
  '癌症', '肿瘤', '艾滋病', '梅毒', '疱疹', '痔疮', '痴呆', '瘫痪', '瘟疫', '病毒', '细菌', '感染', '残疾', '僵尸', '毒品', '吸毒',
  // 科技 IT
  '程序', '协议', '函数', '代码', '参数', '变量', '芯片', '接口', '算法', '架构', '编程', '带宽', '内核', '调试', '网卡', '服务器', '数据库', '程序员', '爆炸', '爆破', '爆燃', '炸药', '炸毁',
  // 政治补充
  '干部', '阶级', '斗争', '方针', '纲领', '革命', '选举', '议会', '外交', '使馆', '人大', '人大常委会', '人大代表', '省人大', '全国人大', '国务卿', '国务委员', '国务院令', '国共', '国共内战', '国共合作', '中纪委', '总书记', '委员会', '委员', '常委会', '省委', '市委', '县委', '区委', '团委', '联合国', '特区', '大会堂', '自然保护区', '综合治理',
  // 社会学术/意识形态
  '社会学', '社会学家', '社会学系', '社会制度', '社会效益', '社会保障', '社会关系', '社会活动', '社会分工', '社会工作', '封建社会', '原始社会', '上层社会', '上流社会', '集体所有', '非公有制', '有产阶级', '中央集权', '中央委员', '安定团结', '群众运动', '群众组织', '组织部', '组织部长', '组织部门', '组织生活', '商品经济', '市场经济', '计划经济', '国民经济', '集体经济', '经济社会', '土地改革', '产业革命', '氢氧化物', '生产方式',
  // 古代帝制/负面成语
  '状元', '宰相', '大臣', '封建', '奴隶', '部落', '酋长', '科举', '铤而走险', '励精图治'
]);

const words = [];
let cnt = { pos: 0, bl: 0, morph: 0, word: 0 };
for (const line of lines) {
  const p = line.trim().split(/\s+/);
  if (p.length < 2) continue;
  const word = p[0], freq = parseInt(p[1], 10) || 0;
  const pos = p[2] || '';
  if (word.length < 2 || word.length > 4) continue;
  if (!cjk.test(word)) continue;
  if (BLACKLIST.has(word)) { cnt.bl++; continue; }
  if (BAD_POS.has(pos)) { cnt.pos++; continue; }
  if (WHITELIST.has(word)) { words.push([word, freq]); continue; }
  if (MORPHEME_BLOCK.some(m => word.includes(m))) { cnt.morph++; continue; }
  if (WORD_BLOCK.has(word)) { cnt.word++; continue; }
  words.push([word, freq]);
}
words.sort((a, b) => b[1] - a[1]);
const seen = new Set(baseWords);
const out = [[], [], []];
let n = 0;
for (const [word] of words) {
  if (n >= 38000) break;
  if (seen.has(word)) continue;
  seen.add(word);
  const gi = word.length === 2 ? 0 : word.length === 3 ? 1 : 2;
  out[gi].push(word); n++;
}
console.log('总数:', n, '| 双字:', out[0].length, '三字:', out[1].length, '四字:', out[2].length);
console.log('剔除: 专名词性=' + cnt.pos, '黑名单=' + cnt.bl, '语素块禁=' + cnt.morph, '词级=' + cnt.word);
const all = new Set([].concat(...out));
const mustAbsent = ['中国', '天安门', '人民政府', '鄂州', '北京', '上海', '国务院', '军队', '战争', '武器', '警察', '犯罪', '监狱', '股票', '贷款', '上帝', '魔鬼', '皇帝', '宰相', '僵尸', '癌症', '赌博', '贪污', '政府', '导弹', '服务器', '手枪', '爆炸', '骗子',
  '马克思主义', '民主集中制', '毛主席纪念堂', '万平方公里', '发展中国家', '本行政区域', '自然保护区', '人民日报', '国家主席', '纪念堂', '主义', '人民大会堂', '阶级', '宪法', '司令', '安定团结', '国共合作', '商品经济', '人大', '国务卿', '综合治理'];
const bad = mustAbsent.filter(x => all.has(x));
if (bad.length) { console.error('!! 仍存在:', bad.join(',')); process.exit(1); }
console.log('黑名单自检通过');
const mustPresent = ['冠军', '赌气', '打赌', '胆小鬼', '仿佛', '拥抱', '火锅', '天气', '旅行', '挑战', '偷偷', '钢琴'];
const missing = mustPresent.filter(x => !all.has(x) && !baseWords.has(x));
console.log('白名单/日常词检查:', missing.length ? '缺失 ' + missing.join(',') : '全部在词库');
const groups = [['词库·双字', out[0]], ['词库·三字', out[1]], ['词库·四字', out[2]]];
let src = '// ===== #301 词典拼字·扩展词库（真实中文分词词典·情侣日常过滤版） =====\n';
src += '// 数据来源：jieba 中文分词词库 dict.txt（MIT License，https://github.com/fxsjy/jieba），\n';
src += '// 按 ~3.8 万高频词筛选（2~4 字纯汉字，按词频降序，与内置基础词库去重），按字数分组。\n';
src += '// 本应用为情侣聊天场景，四层过滤（再生成：node tools/gen-dict-ext.mjs jieba-dict.txt）：\n';
src += '//   ① 词性剔除专名：ns 地名 / nt 机构 / nr,nrt 人名 / nz 其他专名；\n';
src += '//   ② 语素块禁：党/政/军/警/兵/罪/狱/刑/赌/盗/窃/匪/贼/寇/凶/尸/棺/坟/墓/葬/皇/帝/妃/衙/佛/鬼/妖/魔/巫/股/税/债/贷/券/官/杀/血/死/武/贪/奸/淫/妓/嫖/毒/枪/灾/祸/骗/击/攻/仇/恨/诡/诅/贿/奴/雇/绩/贸/主义/纪念/人民/民主/区域/平方/主席/马克思/国际/宪/革命/阶级/剥削/立法/司法/执法/普法/国有/私有/公有/共产/司令/劳模/少先/国务/纪委；\n';
src += '//   ③ 词级剔除：宗教/迷信占卜/商业经济/IT/军事武器/病灾/法律/社会学术/行政委员会等精确词；\n';
src += '//   ④ 白名单：仿佛/冠军/亚军/赌气/打赌/胆小鬼/死心塌地/凶巴巴/贪吃/贪玩/贪睡/恐龙/欺负/抱怨/埋怨/怨言/怨气/纪念品/纪念册。\n';
src += '//   5 字及以上长词不收录（政治行政长词重灾区，情侣拼字用不上；长句由 2~4 字词组合切分）。\n';
src += 'window.DEFAULT_CARD_DATA.dict_ext = [\n';
for (const [name, arr] of groups) {
  src += '  ["' + name + '", ' + JSON.stringify(arr.join(' ')) + '.split(" ")],\n';
}
src += '];\n';
fs.writeFileSync(path.join(root, 'src/js/dict-ext-data.js'), src, 'utf8');
console.log('dict-ext-data.js 生成:', (fs.statSync(path.join(root, 'src/js/dict-ext-data.js')).size / 1024).toFixed(0) + 'KB');
