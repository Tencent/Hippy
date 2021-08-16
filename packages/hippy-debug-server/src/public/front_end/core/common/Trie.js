// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
export class Trie {
    _size;
    _root;
    _edges;
    _isWord;
    _wordsInSubtree;
    _freeNodes;
    constructor() {
        this._root = 0;
        this.clear();
    }
    add(word) {
        let node = this._root;
        ++this._wordsInSubtree[this._root];
        for (let i = 0; i < word.length; ++i) {
            const edge = word[i];
            let next = this._edges[node][edge];
            if (!next) {
                if (this._freeNodes.length) {
                    next = this._freeNodes.pop();
                }
                else {
                    next = this._size++;
                    this._isWord.push(false);
                    this._wordsInSubtree.push(0);
                    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    this._edges.push({ __proto__: null });
                }
                this._edges[node][edge] = next;
            }
            ++this._wordsInSubtree[next];
            node = next;
        }
        this._isWord[node] = true;
    }
    remove(word) {
        if (!this.has(word)) {
            return false;
        }
        let node = this._root;
        --this._wordsInSubtree[this._root];
        for (let i = 0; i < word.length; ++i) {
            const edge = word[i];
            const next = this._edges[node][edge];
            if (!--this._wordsInSubtree[next]) {
                delete this._edges[node][edge];
                this._freeNodes.push(next);
            }
            node = next;
        }
        this._isWord[node] = false;
        return true;
    }
    has(word) {
        let node = this._root;
        for (let i = 0; i < word.length; ++i) {
            node = this._edges[node][word[i]];
            if (!node) {
                return false;
            }
        }
        return this._isWord[node];
    }
    words(prefix) {
        prefix = prefix || '';
        let node = this._root;
        for (let i = 0; i < prefix.length; ++i) {
            node = this._edges[node][prefix[i]];
            if (!node) {
                return [];
            }
        }
        const results = [];
        this._dfs(node, prefix, results);
        return results;
    }
    _dfs(node, prefix, results) {
        if (this._isWord[node]) {
            results.push(prefix);
        }
        const edges = this._edges[node];
        for (const edge in edges) {
            this._dfs(edges[edge], prefix + edge, results);
        }
    }
    longestPrefix(word, fullWordOnly) {
        let node = this._root;
        let wordIndex = 0;
        for (let i = 0; i < word.length; ++i) {
            node = this._edges[node][word[i]];
            if (!node) {
                break;
            }
            if (!fullWordOnly || this._isWord[node]) {
                wordIndex = i + 1;
            }
        }
        return word.substring(0, wordIndex);
    }
    clear() {
        this._size = 1;
        this._root = 0;
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._edges = [{ __proto__: null }];
        this._isWord = [false];
        this._wordsInSubtree = [0];
        this._freeNodes = [];
    }
}
//# sourceMappingURL=Trie.js.map