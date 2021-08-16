/**
 * Look up the best available locale for the requested language through these fall backs:
 * - exact match
 * - progressively shorter prefixes (`de-CH-1996` -> `de-CH` -> `de`)
 * - the default locale ('en-US') if no match is found
 *
 * If `locale` isn't provided, the default is used.
 * @param {string=} locale
 */
 declare function lookupLocale(locale: string): string;

 /**
  * Function to retrieve all 'argumentElement's from an ICU message. An argumentElement
  * is an ICU element with an argument in it, like '{varName}' or '{varName, number, bytes}'. This
  * differs from 'messageElement's which are just arbitrary text in a message.
  *
  * Notes:
  *  This function will recursively inspect plural elements for nested argumentElements.
  *
  *  We need to find all the elements from the plural format sections, but
  *  they need to be deduplicated. I.e. "=1{hello {icu}} =other{hello {icu}}"
  *  the variable "icu" would appear twice if it wasn't de duplicated. And they cannot
  *  be stored in a set because they are not equal since their locations are different,
  *  thus they are stored via a Map keyed on the "id" which is the ICU varName.
  *
  * @param {ArrayLike<Object>} icuElements
  * @param {Map<string, T>} [seenElementsById]
  * @return {Map<string, T>}
  */
 declare function collectAllCustomElementsFromICU<T>(icuElements: ArrayLike<Object>, seenElementsById?: Map<string, T>): T;
 /** @param {ArrayLike<string>} pathInLHR */
 declare function _formatPathAsString(pathInLHR: string[]): string;
 /**
  * @param {string} locale
  */
 declare function getRendererFormattedStrings(locale: string): {};
 /**
  * Register a file's UIStrings with i18n, return function to
  * generate the string ids.
  *
  * @param {string} filename
  */
 declare function createMessageInstanceIdFn(filename: string, fileStrings: Object): typeof getMessageInstanceIdFn;
 /**
  * Returns true if string is an ICUMessage reference.
  * @param {string} icuMessageIdOrRawString
  */
 declare function isIcuMessage(icuMessageIdOrRawString: string): boolean;
 /**
  * @param {string} icuMessageIdOrRawString
  * @param {string} locale
  */
 declare function getFormatted(icuMessageIdOrRawString: string, locale: string): string;
 /**
  * @param {string} icuMessageIdOrRawString
  * @param {string} locale
  */
 declare function getFormatter(icuMessageIdOrRawString: string, locale: string): any;
 /**
  * @param {string} locale
  * @param {string} icuMessageId
  * @param {Object} [values]
  */
 declare function getFormattedFromIdAndValues(locale: string, icuMessageId: string, values: Object): string;
 /**
  * Recursively walk the input object, looking for property values that are
  * string references and replace them with their localized values. Primarily
  * used with the full LHR as input.
  * @param {*} inputObject
  * @param {string} locale
  */
 declare function replaceIcuMessageInstanceIds(inputObject: any, locale: string): {};
 /**
  * Populate the i18n string lookup dict with locale data
  * Used when the host environment selects the locale and serves lighthouse the intended locale file
  * @see https://docs.google.com/document/d/1jnt3BqKB-4q3AE94UWFA0Gqspx8Sd_jivlB7gQMlmfk/edit
  * @param {string} locale
  * @param {*} lhlMessages
  */
 declare function registerLocaleData(locale: string, lhlMessages: any): void;
 /**
  * @param {string} icuMessage
  * @param {Object} [values]
  */
 declare function getMessageInstanceIdFn(icuMessage: string, values: Object | null): string;

 /**
 * Throws an error with the given icuMessage id.
 * @param {string} icuMessage
 */
declare function idNotInMainDictionaryException(icuMessage: string): void;

 declare var i18n: {
   _formatPathAsString: typeof _formatPathAsString;
   _ICUMsgNotFoundMsg: string;
   lookupLocale: typeof lookupLocale;
   getRendererFormattedStrings: typeof getRendererFormattedStrings;
   createMessageInstanceIdFn: typeof createMessageInstanceIdFn;
   getFormatted: typeof getFormatted;
   getFormatter: typeof getFormatter;
   getFormattedFromIdAndValues: typeof getFormattedFromIdAndValues;
   replaceIcuMessageInstanceIds: typeof replaceIcuMessageInstanceIds;
   isIcuMessage: typeof isIcuMessage;
   collectAllCustomElementsFromICU: typeof collectAllCustomElementsFromICU;
   registerLocaleData: typeof registerLocaleData;
   idNotInMainDictionaryException: typeof idNotInMainDictionaryException;
 };
 export default i18n;
