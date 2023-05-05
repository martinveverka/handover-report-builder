/**
 * @typedef {object} Config
 * @property {object} intl
 * @property {string} intl.locale
 * @property {ReportDefaults} order_defaults
 * @property {ReportItemDefaults} order_item_defaults
 * @property {Object.<string, object>} orders
 * @property {DocOptions} pdf
 * @property {object} provider
 * @property {string} provider.name
 * @property {string} provider.company_no
 * @property {?string} provider.signature.path
 * @property {?string} provider.signature.offset_y
 * @property {boolean} provider.vat_payer
 */

/**
 * @typedef {object} DocOptions
 * @property {object} font
 * @property {string} font.regular
 * @property {string} font.bold
 * @property {number} font.correction
 * @property {Array.<string, string>} fonts
 * @property {Array.<string, string>} info
 * @property {string} target_path
 */

/**
 * @typedef {object} ReportDefaults
 * @property {?number} rate
 * @property {?string} rate_currency
 * @property {?string} reservations
 * @property {?string} third_party_libs
 */

/**
 * @typedef {object} ReportItemDefaults
 * @property {?string} product
 * @property {?string} type
 */
