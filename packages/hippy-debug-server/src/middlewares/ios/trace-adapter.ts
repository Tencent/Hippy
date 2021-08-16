/**
 * jsc的trace数据结构： JscStack
 * jsc没1ms采样1次，JscTrace 表示一个采样点
 * JscFrame 表示当前采样点的调用栈，按叶节点到根节点排序
 *
 * v8的trace数据结构：V8Stack，是一个一维数组
 * 用 PH 值表示调用栈的开始结束
 */

import { PH } from '../../@types/enum';
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

interface JscTreeNode {
  id: string;
  data: JscFrame;
  children: JscTreeNode[];
  parent?: JscTreeNode;
  startTs: number; // 采样起始时间
  endTs: number; // 采样结束时间
}

// 理论上1ms采样1次，实际在1ms左右，这里按理论值绘图
const sampleInterval = 0.001;
const TIME_MULTIPLE = 1000000; // 单位：秒，转换为微秒，1s = 1000000 us

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
    let prevTrace;
    for (const trace of traces) {
      if (lastTree) {
        const end = this.getTraceEnd(trace, prevTrace);
        // 整个trace下的frame与前一帧没有共用的节点，说明该帧是一个新的调用栈，要构建为一颗单独的树
        if (end === trace.stackFrames.length - 1) {
          trees.push(lastTree);
          lastTree = this.buildTree(trace.stackFrames, trace.timestamp);
        }
        // trace 和 prevTrace 完全重合，更新其 sampleNum
        else if (end === -1) {
          this.updateSampleNum(trace, prevTrace, end);
        }
        // 有共用的节点，可添加到上一颗树，同时更新相同节点的 sampleNum
        else {
          this.appendToTree(trace, prevTrace, end);
          this.updateSampleNum(trace, prevTrace, end);
        }
      } else {
        lastTree = this.buildTree(trace.stackFrames, trace.timestamp);
      }
      prevTrace = trace;
    }
    trees.push(lastTree);
    for (const tree of trees) {
      const v8Frames = this.dfs(tree);
      if (v8Frames?.length) this.v8Json.push(...v8Frames);
    }
    return this.v8Json;
  }

  /**
   * 将一个trace构建为一棵�
   * @param trace
   * @returns
   */
  buildTree(frames: JscFrame[], ts: number): JscTreeNode {
    let child;
    for (const frame of frames) {
      const id = this.getFrameId(frame, ts);
      const treeNode = {
        id,
        data: frame,
        children: child ? [child] : [],
        parent: null,
        startTs: ts,
        endTs: ts + sampleInterval,
      };
      this.nodeMap[id] = treeNode;
      if (child) child.parent = treeNode;
      child = treeNode;
    }
    return child;
  }

  /**
   * 将 trace 下的 frames [0, end] 范围内构建为子树，并追加到父节点下
   * end + 1 后的节点，是原有树共用的节点，更新器 sampleNum 值
   * @param tree
   * @param trace
   */
  appendToTree(trace: JscTrace, prevTrace: JscTrace, end: number) {
    const frames = trace.stackFrames.slice(0, end + 1);
    const subTree = this.buildTree(frames, trace.timestamp);

    const parentNodeIndex = prevTrace.stackFrames.length - (trace.stackFrames.length - end - 1);
    const parentFrame = prevTrace.stackFrames[parentNodeIndex];
    let parentNode;
    if (parentFrame) parentNode = this.nodeMap[this.getFrameId(parentFrame, prevTrace.timestamp)];
    if (subTree && parentNode) {
      subTree.parent = parentNode;
      parentNode.children.push(subTree);
    } else console.log("subTree doesn't exist!");
  }

  updateSampleNum(trace: JscTrace, prevTrace: JscTrace, end: number) {
    let parentNodeIndex;
    if (end === -1) {
      parentNodeIndex = 0;
    } else parentNodeIndex = prevTrace.stackFrames.length - (trace.stackFrames.length - end - 1);
    const parentFrame = prevTrace.stackFrames[parentNodeIndex];
    let parentNode;
    if (parentFrame) parentNode = this.nodeMap[this.getFrameId(parentFrame, prevTrace.timestamp)];

    for (let i = parentNodeIndex; i < prevTrace.stackFrames.length; i++) {
      if (!parentNode) break;

      const id = this.getFrameId(prevTrace.stackFrames[i], prevTrace.timestamp);
      if (id === parentNode.id) {
        parentNode.endTs = trace.timestamp + sampleInterval;
        parentNode = parentNode.parent;
      } else {
        console.log("update frame sample time error, parent node doesn't match!");
      }
    }
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

  getTraceEnd(trace: JscTrace, prevTrace: JscTrace) {
    const end = trace.stackFrames.length - 1;
    // 两trace采样间隔1.5（含误差兼容）个 sampleInterval，认为是两棵树
    if (trace.timestamp - prevTrace.timestamp > sampleInterval * 1.5) return end;
    if (!prevTrace?.stackFrames) return end;

    const isSameFrame = (frame1, frame2) =>
      frame1.sourceID === frame2.sourceID && frame1.line === frame2.line && frame1.column === frame2.column;

    for (let i = end, j = prevTrace.stackFrames.length - 1; i >= 0; i--, j--) {
      const frame = trace.stackFrames[i];
      const prevTraceFrame = prevTrace.stackFrames[j];
      if (prevTraceFrame)
        if (isSameFrame(frame, prevTraceFrame)) {
          continue;
        } else {
          return i;
        }
      else return i;

      // if (frame.sourceID === '-1') continue;
    }
    return -1;
  }

  /**
   * 要保证每一个调用栈id唯一，同一行代码有可能执行多次，需要加采样时间戳
   */
  getFrameId(frame, ts) {
    return `${ts}-${frame.sourceID}-${frame.line}-${frame.column}`;
  }

  /**
   * 深度优先遍历树，并将树结构转为类似于 [B, B, E, B, E, E] 的一维数组结构
   */
  dfs(tree: JscTreeNode, v8Frames: V8Frame[] = []) {
    if (!tree) return;
    const beginFrame = this.newV8Frame(tree.data, {
      ph: PH.Begin,
      ts: tree.startTs * TIME_MULTIPLE,
    });
    const endFrame = this.newV8Frame(tree.data, {
      ph: PH.End,
      ts: tree.endTs * TIME_MULTIPLE,
    });
    v8Frames.push(beginFrame);
    for (const child of tree.children) {
      this.dfs(child, v8Frames);
    }
    v8Frames.push(endFrame);
    return v8Frames;
  }
}
