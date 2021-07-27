import type * as HeapSnapshotModel from '../../models/heap_snapshot_model/heap_snapshot_model.js';
export interface ChildrenProvider {
    dispose(): void;
    nodePosition(snapshotObjectId: number): Promise<number>;
    isEmpty(): Promise<boolean>;
    serializeItemsRange(startPosition: number, endPosition: number): Promise<HeapSnapshotModel.HeapSnapshotModel.ItemsRange>;
    sortAndRewind(comparator: HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig): Promise<void>;
}
