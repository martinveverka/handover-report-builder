import Doc from "./doc.js";
import fs from "fs";

export default class Report {
    /** @type {string} */
    currency;
    /** @type {NumberFormat} for currency formatting */
    formatter;
    /** @type {number} */
    hourlyRate = 0;
    /** @type {Array.<ReportItem>} */
    items = [];
    /** @type {string} */
    locale;
    /** @type {number} */
    order;
    /** @type {string} formatted periodId */
    period;
    /** @type {string} yyyy-mm */
    periodId;
    /** @type {object} */
    products = {};
    /** @type {Provider} */
    provider;
    /** @type {string} */
    reservations;
    /** @type {string} */
    thirdPartyLibs = '';
    /** @type {number} */
    totalHours = 0;

    constructor() {
    }

    /**
     * @param {ReportItem} item
     */
    addItem(item) {
        this.items.push(item);

        let oi = item;

        if (typeof this.products[item.product] === 'undefined') {
            this.products[item.product] = {
                product: item.product,
                hours: 0,
                amount: 0,
                type: item.type,
            };
        }

        let product2 = this.products[oi.product];
        product2.hours += item.hours;
        product2.amount += item.hours * this.hourlyRate;

        this.totalHours += item.hours;
    }

    /**
     * @param {number} amount
     * @return {string}
     */
    formatAmount(amount) {
        if (typeof this.formatter === 'undefined') {
            this.formatter = new Intl.NumberFormat(this.locale, {
                style: 'currency',
                currency: this.currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        }

        return this.formatter.format(amount);
    }

    getPeriodText() {
        if (typeof this.period === 'string') {
            return this.period;
        }

        let periodYear, periodMonth;
        [periodYear, periodMonth] = this.periodId.split('-');
        let date = new Date(parseInt(periodYear, 10), parseInt(periodMonth, 10), 0);

        return '1.–' + date.getDate() + '. ' + (date.getMonth() + 1) + '. ' + date.getFullYear(); // TODO: other locales
    }

    /**
     * @param {string} template
     * @return {string}
     */
    getTargetPath(template) {
        if (typeof template === 'undefined') {
            throw new Error('Invalid target path.');
        }

        let targetPath = template;
        targetPath = targetPath.replace(/{{ period }}/, this.periodId);
        targetPath = targetPath.replace(/{{ order }}/, this.order.toString());

        return targetPath;
    }

    async createReportDocument(targetPath, info, fonts, fontDefaults) {
        // https://pdfkit.org/docs/getting_started.html
        const pdfkitOptions = {
            info: {
                Title: info.Title || '',
                Subject: info.Subject || '',
                Author: info.Author || '',
                Creator: info.Creator || '',
                Producer: info.Producer || '',
                Keywords: info.Keywords || '',
            },
            margins: {
                top: 50,
                left: 50,
                bottom: 50,
                right: 50,
            },
            pdfVersion: '1.5',
            size: 'A4', // A4 = 595.28 x 841.89 (portrait)
        };

        const doc = new Doc(pdfkitOptions, this);
        doc.pipe(fs.createWriteStream(targetPath));
        doc.setupFonts(fonts, fontDefaults);

        doc.addTitle('Předávací protokol');
        doc.addProviderInfo();
        await doc.addItemsTable();
        doc.addRateSummary();
        await doc.addSummaryTable();

        doc.addTextBox(
            'Využité knihovny třetích stran a odkazy na jejich licenční ujednání:',
            this.thirdPartyLibs,
            3
        );

        doc.addTextBox(
            'Výhrady k převzetí a termíny jejich odstranění:',
            this.reservations,
            3
        );

        doc.addPageFooter();
        doc.end();

        console.log(`Saved in %s`, targetPath);
    }
}
