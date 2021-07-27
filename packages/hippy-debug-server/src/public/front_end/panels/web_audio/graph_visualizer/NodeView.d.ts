import type { NodeCreationData, NodeLayout, Port } from './GraphStyle.js';
import { PortTypes } from './GraphStyle.js';
export declare class NodeView {
    id: string;
    type: string;
    numberOfInputs: number;
    numberOfOutputs: number;
    label: string;
    size: {
        width: number;
        height: number;
    };
    position: Object | null;
    _layout: NodeLayout;
    ports: Map<string, Port>;
    constructor(data: NodeCreationData, label: string);
    _initialize(data: NodeCreationData): void;
    /**
     * Add an AudioParam to this node.
     * Note for @method removeParamPort: removeParamPort is not necessary because it will only happen
     * when the parent NodeView is destroyed. So there is no need to remove port individually
     * when the whole NodeView will be gone.
     */
    addParamPort(paramId: string, paramType: string): void;
    getPortsByType(type: PortTypes): Port[];
    /**
     * Use number of inputs and outputs to compute the layout
     * for text and ports.
     * Credit: This function is mostly borrowed from Audion/
     *      `audion.entryPoints.handleNodeCreated_()`.
     *      https://github.com/google/audion/blob/master/js/entry-points/panel.js
     */
    _updateNodeLayoutAfterAddingNode(data: NodeCreationData): void;
    /**
     * After adding a param port, update the node layout based on the y value
     * and label length.
     */
    _updateNodeLayoutAfterAddingParam(numberOfParams: number, paramType: string): void;
    _updateNodeSize(): void;
    _setupInputPorts(): void;
    _setupOutputPorts(): void;
    _addPort(port: Port): void;
}
/**
 * Generates the port id for the input of node.
 */
export declare const generateInputPortId: (nodeId: string, inputIndex: number | undefined) => string;
/**
 * Generates the port id for the output of node.
 */
export declare const generateOutputPortId: (nodeId: string, outputIndex: number | undefined) => string;
/**
 * Generates the port id for the param of node.
 */
export declare const generateParamPortId: (nodeId: string, paramId: string) => string;
export declare class NodeLabelGenerator {
    _totalNumberOfNodes: number;
    constructor();
    /**
     * Generates the label for a node of a graph.
     */
    generateLabel(nodeType: string): string;
}
/**
 * Get the text width using given font style.
 */
export declare const measureTextWidth: (text: string, fontStyle: string | null) => number;
