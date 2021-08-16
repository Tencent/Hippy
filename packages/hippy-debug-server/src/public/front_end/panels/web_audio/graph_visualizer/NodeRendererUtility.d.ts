import type { Point, Size } from './GraphStyle.js';
/**
 * Calculate the x, y value of input port.
 * Input ports are placed near the top of the left-side border.
 */
export declare const calculateInputPortXY: (portIndex: number) => Point;
/**
 * Calculate the x, y value of output port.
 * Output ports are placed near the center of the right-side border.
 */
export declare const calculateOutputPortXY: (portIndex: number, nodeSize: Size, numberOfOutputs: number) => Point;
/**
 * Calculate the x, y value of param port.
 * Param ports are placed near the bottom of the left-side border.
 */
export declare const calculateParamPortXY: (portIndex: number, offsetY: number) => Point;
