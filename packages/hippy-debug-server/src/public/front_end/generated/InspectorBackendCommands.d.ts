/**
 * @param {!InspectorBackendAPI} inspectorBackend
 */
export function registerCommands(inspectorBackend: InspectorBackendAPI): void;
export type InspectorBackendAPI = {
    registerCommand: (arg0: string, arg1: Array<{
        name: string;
        type: string;
        optional: boolean;
    }>, arg2: Array<string>) => void;
    registerEnum: (arg0: string, arg1: {
        [x: string]: string;
    }) => void;
    registerEvent: (arg0: string, arg1: Array<string>) => void;
};
/**
 * @typedef {{
 *  registerCommand: function(string, !Array.<!{name: string, type: string, optional: boolean}>, !Array.<string>):void,
 *  registerEnum: function(string, !Object<string, string>):void,
 *  registerEvent: function(string, !Array<string>):void,
 * }}
 */
export let InspectorBackendAPI: any;
