/**
 * jsc的trace数据结构： JscStack
 * jsc没1ms采样1次，JscTrace 表示一个采样点
 * JscFrame 表示当前采样点的调用栈，按叶节点到根节点排序
 *
 * v8的trace数据结构：V8Stack，是一个一维数组
 * 用 PH 值表示调用栈的开始结束
 */

import { PH } from '../../../@types/enum';

interface JscFrame {
  sourceID: string;
  name: string;
  line: number;
  column: number;
  url: string;
  expressionLocation: {
    line: number;
    column: number;
  };
}

interface JscTrace {
  timestamp: number;
  stackFrames: JscFrame[];
}

interface JscStack {
  timestamp: number;
  samples: {
    stackTraces: JscTrace[];
  };
}

interface V8Frame {
  args?: {
    name: string;
  };
  cat?: string;
  name: string;
  ph: PH;
  pid: number;
  tid: number;
  ts: number;
}

type V8Stack = V8Frame[];

class JscTreeNode {
  data: JscFrame;
  children: JscTreeNode[];
  parent?: JscTreeNode;
  ts: number;
}

export default class TraceAdapter {
  jscJson: JscStack;
  v8Json: V8Stack = [];
  nodeMap: { [id: string]: JscTreeNode } = {};

  /**
   * 将jsc的trace数据转为v8的trace数据
   * @param json
   * @returns
   */
  jsc2v8(json: JscStack): V8Stack {
    this.jscJson = json;
    const traces = json.samples.stackTraces;
    const trees: JscTreeNode[] = [];
    let lastTree: JscTreeNode;
    for (const trace of traces) {
      if (lastTree) {
        const end = this.getTraceEnd(trace);
        // 整个trace下的frame与前一帧没有共用的节点，说明该帧是一个新的调用栈，要构建为一颗单独的树
        if (end === trace.stackFrames.length - 1) {
          trees.push(lastTree);
          lastTree = this.buildTree(trace.stackFrames, trace.timestamp);
        }
        // 有共用的节点，可添加到上一颗树
        else {
          this.appendToTree(trace, end);
        }
      } else {
        lastTree = this.buildTree(trace.stackFrames, trace.timestamp);
      }
    }
    trees.push(lastTree);

    for (const tree of trees) {
      const v8Frames = this.dfs(tree);
      if (v8Frames?.length) this.v8Json.push(...v8Frames);
    }
    return this.v8Json;
  }

  /**
   * 将一个trace构建为一棵🌲
   * @param trace
   * @returns
   */
  buildTree(frames: JscFrame[], ts: number): JscTreeNode {
    let child;
    for (const frame of frames) {
      const treeNode = {
        data: frame,
        children: child ? [child] : [],
        parent: null,
        ts,
      };
      const key = this.getFrameKey(frame, ts);
      this.nodeMap[key] = treeNode;
      if (child) child.parent = treeNode;
      child = treeNode;
    }
    return child;
  }

  /**
   * 将 trace 下的 frames [0, end] 范围内构建为子树，并追加到父节点下
   * @param tree
   * @param trace
   */
  appendToTree(trace: JscTrace, end: number) {
    const frames = trace.stackFrames.slice(0, end + 1);
    const subTree = this.buildTree(frames, trace.timestamp);
    const parentFrame = trace.stackFrames[end + 1];
    const parentNode = this.nodeMap[this.getFrameKey(parentFrame, trace.timestamp)];
    if (subTree) parentNode.children.push(subTree);
    else console.log("subTree doesn't exist!");
  }

  newV8Frame(frame: JscFrame, { ph, ts }: { ph: PH; ts: number }) {
    return {
      name: frame.name || frame.url,
      ph,
      pid: 0,
      tid: 0,
      ts,
    };
  }

  getTraceEnd(trace: JscTrace) {
    for (const [i, frame] of trace.stackFrames.entries()) {
      if (frame.sourceID === '-1') continue;
      const key = this.getFrameKey(frame, trace.timestamp);
      if (this.nodeMap[key]) return i - 1;
    }
    return trace.stackFrames.length - 1;
  }

  /**
   * 要保证每一个调用栈id唯一，同一行代码有可能执行多次，需要加采样时间戳
   */
  getFrameKey(frame, ts) {
    return `${ts}-${frame.sourceID}-${frame.line}-${frame.column}`;
  }

  /**
   * 深度优先遍历树，并将树结构转为类似于 [B, B, E, B, E, E] 的一维数组结构
   */
  dfs(tree: JscTreeNode, v8Frames: V8Frame[] = []) {
    if (!tree) return;
    const frameData = {
      ph: PH.Begin,
      ts: tree.ts,
    };
    const beginFrame = this.newV8Frame(tree.data, frameData);
    const endFrame = this.newV8Frame(tree.data, frameData);
    v8Frames.push(beginFrame);
    for (const child of tree.children) {
      this.dfs(child, v8Frames);
    }
    v8Frames.push(endFrame);
    return v8Frames;
  }
}
