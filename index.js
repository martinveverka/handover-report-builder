import fs from 'fs';
import yaml from 'js-yaml';

import Report from './src/report.js';
import Provider from './src/provider.js';
import ReportItem from "./src/report-item.js";

let periodId = null;
if (process.argv.length > 2) {
    periodId = process.argv[2];
}

let configPaths = [
    './config.yml',
    './config.dist.yml',
];

/** @type {object|Config} */
let conf;

for (let i in configPaths) {
    if (configPaths.hasOwnProperty(i)) {
        let configPath = configPaths[i];
        if (!fs.existsSync(configPath)) {
            continue;
        }

        try {
            conf = yaml.load(fs.readFileSync(configPath, 'utf8'));
            break;
        } catch (e) {
            console.log(`Cannot load configuration: %s`, e);
            process.exit(1);
        }
    }
}

if (typeof conf === 'undefined') {
    console.log(`Cannot load configuration.`);
    process.exit(1);
}

if (null === periodId) {
    for (let key in conf.orders) {
        if (conf.orders.hasOwnProperty(key)) {
            periodId = key;
        }
    }

    if (null !== periodId) {
        console.log(`No period set, loading last order %s.`, periodId);
    }
}

if (null === periodId || typeof conf.orders === 'undefined') {
    console.log(`Cannot find any order.`);
    process.exit(1);
}

if (typeof conf.orders[periodId] === 'undefined') {
    console.log(`Cannot find order %s.`, periodId);
    process.exit(1);
}

let reportDefaults = conf.order_defaults;
let reportItemDefaults = conf.order_item_defaults;
let order = conf.orders[periodId];

const provider = new Provider(
    conf.provider.name,
    conf.provider.company_no,
    conf.provider.vat_payer,
    conf.provider.signature,
);

let report = new Report();
report.currency = order.rate_currency || reportDefaults.rate_currency;
report.hourlyRate = order.rate || reportDefaults.rate;
report.locale = conf.intl.locale;
report.order = order.order;
report.period = order.period;
report.periodId = periodId;
report.provider = provider;
report.reservations = order.reservations || reportDefaults.reservations || '';
report.thirdPartyLibs = order.third_party_libs || reportDefaults.third_party_libs || '';

for (let key in order.items) {
    if (order.items.hasOwnProperty(key)) {
        let item = order.items[key];

        let product, name, hours, type;
        if (typeof item === 'object') {
            product = item.product || reportItemDefaults.product;
            name = item.name;
            hours = item.hours;
            type = item.type || reportItemDefaults.type;
        } else {
            product = reportItemDefaults.product;
            name = key;
            hours = item;
            type = reportItemDefaults.type;
        }

        let oi = new ReportItem(product, name, hours, type);
        report.addItem(oi);
    }
}

let targetPath = report.getTargetPath(conf.pdf.target_path);

;(async function () {
    await report.createReportDocument(targetPath, conf.pdf.info, conf.pdf.fonts, conf.pdf.font);
})();
