# Melohum 音高识别审查与基线（第一阶段）

日期：2026-11-16。审查起点：46c32a9a2b5e82d88af12eaed157253a53979ce4。
本阶段仅新增审查资料和测试，不修改生产音频逻辑、不发布功能版本。以下区分代码事实、可复现实验和待验证风险。

## 数据流及入口

实时：`getAudioContext` 复用 AudioContext → `startRecording` 申请单声道麦克风（关闭回声消除、降噪、自动增益）→ MediaStreamSource → AnalyserNode（fftSize=2048）→ requestAnimationFrame 调用 `processLiveAudio` → `MeldPitchAnalysis.detectPitch` → `frequencyToPitchData`（MIDI 域平滑）→ 页面音名/cents及 state.samples。

最终结果：MediaRecorder（120ms分块）→ `finalizeRecording` 解码 Blob → `analyzeAudioBuffer` → `resampleMono`（平均混声、线性插值到16kHz、最多45秒）→ `frames`（10ms步长，人声48ms窗）→ `analyzeSamples` → `stabilize` → `analyze` → `segmentSyllables` 或 `segmentCore` → 调性估计/可选调内吸附 → 单声部音符 → 编辑、播放、保存、MIDI。解码失败才使用实时采样轨迹。

`public/app.js`：上述采集、资源释放、UI、重采样与总编排；`public/pitch-analysis.js`：基频、轨迹和切分；`public/recognition-controls.js`：识别类型、起音优先开关和重解析；`public/pitch-editor.js`/`piano-roll.js`：编辑；`public/performance.js`：编曲播放与多轨导出。`worker/transcription.js` 的 MuScriptor 转写是独立的服务器代理，不参与普通单声部哼唱识别；普通路径没有后端基频计算接口。

## 已有算法

现有 `detectPitch` 已是 YIN 类型：平方差分、累积均值归一化CMNDF、首个低于0.18的谷并下行到局部最低点、无候选时全局最低点0.3门限、三点抛物线插值。差分每隔一个样本求和以减计算；周期范围对应65–1200Hz，RMS门限0.0012。输入采样率来自上下文或显式16kHz重采样数据，未硬编码44100Hz。Hz→MIDI公式正确。

当前检测主线程执行；与DX7发声相关的 AudioWorklet 不等于音高检测已在Worklet。AnalyserNode smoothingTimeConstant不能代替音高轨迹平滑。

## 实际问题和风险

1. **已复现的切分丢音**：recognitionOnsetFirst 默认true。`segmentSyllables` 每次发音只选最初140ms内第一个稳定小音簇，之后音高变化不再切分。连续1秒、前半220Hz后半440Hz，默认只保留A3 0–0.995秒；连续切分模式得到A3 0–0.53秒、A4 0.53–0.995秒。不能把这个问题归罪于YIN频率公式。
2. **实时与最终不一致**：实时2048点窗在44.1/48kHz约46.4/42.7ms；最终重采样16kHz、48ms窗。实时平滑不使用最终路径的起音检测；时间戳取UI执行时刻，没有补偿分析窗中心。最终结果可能与用户录音时看到的音名不同。
3. **噪声鲁棒性**：确定性带噪实验出现C3最大165.03cents偏差；恒定绝对能量门限不适应所有麦克风/背景噪声。高置信周期性噪声也不能仅靠置信度识别人声。
4. **八度处理不足**：`stabilize`只消除一个孤立尖峰；没有结合周期候选证据处理持续2–3帧倍频/半频错误。本次强二次泛音样本没有八度错误，不代表真实人声已解决。必须保留真实八度跳跃。
5. **性能/低音范围**：实时每帧分配数组、在UI线程O(N×最大周期)计算。48kHz/2048点受半窗约束，实际最低可估频率约93.9Hz，44.1kHz约86.3Hz；并非标称65Hz。最终16kHz/48ms窗也只能到约83.6Hz。需要按最低支持频率确定窗长，不能只改频率门限。
6. **重采样风险**：线性插值降采样无抗混叠低通；高频噪声可能折叠。立体声直接平均可能抵消反相内容。尚未通过真实样本量化。
7. **无效输入**：NaN数组返回unvoiced但rms仍是NaN（JSON报告显示null）；缺少采样率、有限值、长度完整契约。
8. **重复平滑**：analyzeSamples先stabilize，analyze内部再stabilize；应统一一次。当前只补孤立点，并非完整平滑器。
9. **时间/节奏**：音符时长由帧时间、起音、静音/释放门限决定；没有独立可靠的拍点推断。创作台MIDI `createMidiFile` 用秒×480写tick而固定120BPM，需另建时长回归，避免识别正确却导出变速。本阶段未改动。

## 基线结果和复现

`node scripts/pitch-baseline.mjs`生成 docs/pitch-baseline.json；`node --test tests/pitch-baseline.test.mjs`运行断言。

50种配置×12帧=600次检测：五标准音、44.1/48kHz、振幅0.005/0.2/0.7、二次泛音为基音3倍、幅度0.03确定性均匀噪声。稳定窗48ms，不含起止边界。纯音最大绝对误差0.095cents；全部配置未返回缺失、未出现±1200cents八度错误；含噪最大165.03cents。该噪声设置的低音误差不满足10cents，10cents目标本来只适用于干净稳定音。

|音名|Hz|44.1k纯音误差(cents)|48k纯音误差(cents)|
|---|---:|---:|---:|
|C3|130.81|0.006|0.005|
|A3|220|0.007|0.015|
|C4|261.63|0.012|0.009|
|A4|440|0.071|0.068|
|C5|523.25|0.095|0.078|

静音两采样率均unvoiced。16kHz连续滑音/5Hz±20cents颤音，排除60ms边界后最大误差分别3.491/3.636cents。连续八度切换被连续模式延后到0.53秒，约30ms；这是离线切分边界偏差，不是端到端实时延迟。Node本机48ms窗平均每次计算约0.710–5.205ms（各配置），不等于手机浏览器或UI性能。没有有标注、授权用于评测的真人哼唱样本，因此没有真人准确率和麦克风实测延迟结论。

三条基线断言通过，其中一条明确记录当前丢音缺陷，不能称为缺陷已修复。

## 最小改动方案（第二阶段入口）

保留麦克风权限、单例AudioContext、录音Blob/上传、资源释放、六种识别profile、编辑/播放/保存/API和数据库。优先复用现有YIN代码，抽成可替换纯检测模块；不为已有算法引入新大型依赖。后续如果考虑第三方实现，再核对官方源码、维护状态、许可证及测试。

先分离检测器、MIDI轨迹稳定器、音符切分；保持原输出对象兼容。人声默认使用连续音高切分，同时保留显式“每次发音一个音符”模式给用户选择并处理旧设置迁移。补真正短音、同音重复、换气、真实八度跳跃回归后再改变默认。

前端为主：实时捕获可用AudioWorklet将PCM分块送专用Worker，复用同一个纯检测模块处理录音和上传；计算不要放在音频渲染线程执行重循环。先测浏览器能力和回退策略再接入。Worker处理抗混叠重采样、基频和轨迹，UI只显示。后端保留MuScriptor复杂转写；不上传普通哼唱以实现YIN，不新增公开API。

加入有限值校验、去直流、可配置能量/置信度和频率范围；按支持低音选择窗长。八度校正必须比较相邻帧和候选周期代价，持续高置信新音高应被接受；不能按大音程直接折回。轻量中值平滑在MIDI/cents域，明确滑音、颤音、短音响应成本。

## 回滚

本阶段生产逻辑未变，只新增scripts/pitch-baseline.mjs、tests/pitch-baseline.test.mjs和docs文档/报告。无须回滚线上。后续功能应独立提交并保留legacy检测/切分开关；需要回滚时revert功能提交，勿重置用户数据或数据库。审查报告只在仓库docs，不进入public。

## 构建与现有回归

npm run build成功。npm test共25项，23通过、2失败，均来自原有assistant-song.test.mjs：测试曲仅16个有效重复音符，低于现有完整编曲校验门槛；另一个模拟请求断言系统提示必须含大写ORIGINAL，而当前提示使用小写original，模拟fetch抛错被包装为502。本阶段未改生产或这些无关测试，不把全套测试称为通过。
