import assert from 'node:assert/strict';
import test from 'node:test';

import { apply, inject } from '../index.js';

function collectSections() {
  const sections = [];
  apply({
    systemPrompt: {
      section(section) {
        sections.push(section);
        return () => {};
      },
    },
  });
  return sections;
}

test('registers requirements discovery before the Xiaohongshu style guide', () => {
  assert.deepEqual(inject, ['systemPrompt']);
  const sections = collectSections();
  assert.deepEqual(
    sections.map(({ name, order }) => ({ name, order })),
    [
      { name: 'local:xhs-requirements-discovery', order: 110 },
      { name: 'local:xhs-style', order: 120 },
    ],
  );
});

test('gates product and competitor work behind iterative clarification', () => {
  const [{ text }] = collectSections();
  assert.match(text, /选购、选品、竞品分析/);
  assert.match(text, /普通资料查询、事实问答、纯资料搜集和既有文案改写不触发/);
  assert.match(text, /默认进行 2–3 轮澄清/);
  assert.match(text, /每轮结束后等待用户回答/);
  assert.match(text, /未完成澄清与路线确认前，不输出正式报告/);
  assert.match(text, /不开始大规模联网调研或扒图/);
  assert.match(text, /ask_user_question/);
});

test('preserves user control and requires an explicit route check', () => {
  const [{ text }] = collectSections();
  assert.match(text, /别问了/);
  assert.match(text, /按我说的买/);
  assert.match(text, /列出关键假设和未确认风险后执行/);
  assert.match(text, /原方案、替代方案、最低成本方案/);
  assert.match(text, /真实目标｜硬约束｜必须项｜可选项｜已排除路线｜待确认假设/);
  assert.match(text, /原始诉求 → 确认后的需求 → 路线变化及原因/);
});

test('covers the washer-drain decision without forcing a fixed answer', () => {
  const [{ text }] = collectSections();
  assert.match(text, /水箱版或上下水版/);
  assert.match(text, /进水、排水、电源位置/);
  assert.match(text, /不能接受手动换水的具体原因是什么/);
  assert.match(text, /只复用提问逻辑，不套固定答案/);
});

test('keeps clarification turns free of report formatting and image work', () => {
  const [discovery, style] = collectSections();
  assert.match(discovery.text, /澄清轮只输出当前理解、需要验证的假设和本轮问题/);
  assert.match(discovery.text, /不执行小红书规范中的星级表、强制配图/);
  assert.match(style.text, /需求澄清轮以「先澄清需求，再研究方案」规范为准/);
});
