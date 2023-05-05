import fs from 'fs';

import PDFDocumentWithTables from 'pdfkit-table';

export default class Doc extends PDFDocumentWithTables {
    /** @type {Report} */
    report;
    /** @type {string} */
    defaultFontRegular = 'Helvetica';
    /** @type {string} */
    defaultFontBold = 'Helvetica-Bold';
    /** @type {number} */
    defaultFontCorrection = 1.0;

    /**
     * @param {object} pdfkitOptions
     * @param {Report} report
     */
    constructor(pdfkitOptions, report) {
        super(pdfkitOptions);

        this.report = report;
    }

    /**
     * @param {Array.<string, string>} fonts
     * @param {object} defaults
     * @param {string} defaults.regular
     * @param {string} defaults.bold
     * @param {number} defaults.correction
     */
    setupFonts(fonts, defaults) {
        // add fonts
        for (let name in fonts) {
            if (fonts.hasOwnProperty(name)) {
                let source = fonts[name];

                try {
                    this.registerFont(name, source);
                } catch (e) {
                    console.log('Cannot add font %s from %s', name, source);
                }
            }
        }

        if (defaults.regular) {
            this.defaultFontRegular = defaults.regular;
        }

        if (defaults.bold) {
            this.defaultFontBold = defaults.bold;
        }

        if (defaults.correction) {
            this.defaultFontCorrection = defaults.correction;
        }

        if (this.defaultFontRegular) {
            this.font(this.defaultFontRegular);
        }
    }

    resetText() {
        this.fontSize2(11);
        this.lineGap(1);
    }

    /**
     * @param {string} title
     */
    addTitle(title) {
        this.fontSize2(20);
        this.text(title, {
            align: 'center'
        });
        this.moveDown2(0.75);
    }

    addProviderInfo() {
        this.resetText();

        let x1 = this.x;
        let y1 = this.y;

        // left column
        this.text('Dodavatel:');
        this.text('IČO:');
        this.text('Číslo objednávky:');
        this.text('Časové období:');

        this.x = this.page.margins.left + 113;
        this.y = y1; // reset y

        let provider = this.report.provider;
        let order = this.report.order.toString();
        let period = this.report.getPeriodText();

        // right column
        this.text(provider.name);
        this.text(provider.companyNo);
        this.text(order);
        this.text(period);

        this.x = x1; // reset x
        this.moveDown2(1.25);
    }

    createHeader(label, percentWidth, align) {
        align = align || 'left';

        const w = this.page.width - this.page.margins.left - this.page.margins.right;
        const valign = 'top';

        return {
            label: label,
            width: w * percentWidth / 100,
            align: align,
            valign: valign,
            headerColor: '#f0f0f0',
            headerOpacity: 1,
        };
    }

    createPropertyHeader(property, label, percentWidth, align, renderer) {
        let h = this.createHeader(label, percentWidth, align);
        h.property = property;
        h.renderer = renderer;
        return h;
    }

    async addItemsTable() {
        let items = this.report.items;

        let rows = [];
        for (let i in items) {
            if (items.hasOwnProperty(i)) {
                rows.push(items[i].getRow());
            }
        }

        await this.table2({
            headers: [
                this.createHeader('Nákl. středisko / investice', 23),
                this.createHeader('ID a popis úlohy', 51),
                this.createHeader('Hodiny', 8, 'right'),
                this.createHeader('Podpora / vylepšení', 18),
            ],
            rows: rows,
        });

        this.moveDown2(0.75);
    }

    addRateSummary() {
        this.resetText();

        let hours = this.report.totalHours;
        let hourlyRate = this.report.hourlyRate;
        let amountTotal = hours * hourlyRate;

        let x1 = this.x;
        let y1 = this.y;

        // left column
        this.text('Celkem hodin:');
        this.text('Sazba / hod.:');
        this.font(this.defaultFontBold);
        this.text('Cena celkem:');
        this.font(this.defaultFontRegular);

        this.x = this.page.margins.left + 113;
        this.y = y1; // reset y

        // right column
        this.text(hours.toString());
        this.text(this.report.formatAmount(hourlyRate));

        this.font(this.defaultFontBold);
        this.text(this.report.formatAmount(amountTotal));
        this.font(this.defaultFontRegular);

        this.fontSize2(9);
        if (this.report.provider.vatPayer) {
            this.text('Dodavatel je plátce DPH.\nVšechny ceny jsou uvedeny bez DPH.');
        } else {
            this.text('Dodavatel není plátce DPH.');
        }
        this.fontSize2(11);

        this.x = x1; // reset x
        this.moveDown2(3);
    }

    async addSummaryTable() {
        let products = this.report.products;

        let datas = [];
        for (let key in products) {
            if (products.hasOwnProperty(key)) {
                let product = products[key];
                datas.push(product);
                // rows.push([
                //     product.product,
                //     product.hours,
                //     (product.amount),
                //     product.type
                // ]);
            }
        }

        this.fontSize2(14);
        this.text('Sumář za nákladová střediska a investiční zakázky');
        this.moveDown2(0.5);
        this.fontSize2(11);

        await this.table2({
            headers: [
                this.createPropertyHeader('product', 'Nákl. středisko / investice', 23),
                this.createPropertyHeader('hours', 'Hodiny', 45, 'right'),
                this.createPropertyHeader('amount', 'Cena', 14, 'right', (value) => {
                    return this.report.formatAmount(value);
                }),
                this.createPropertyHeader('type', 'Podpora / vylepšení', 18),
            ],
            datas: datas,
        });

        this.moveDown2(5);
    }

    addTextBox(title, text, h) {
        this.resetText();

        const lh = this.currentLineHeight();
        const w = this.page.width - this.page.margins.right - this.page.margins.left;

        let x0 = this.x;

        // box title
        this.text(title);

        // box rect
        this.x = x0;
        this.y += 1;
        this.rect(this.x, this.y, w, h * lh).stroke('lightgray');

        // inner text
        this.x += 6;
        this.y += 6;
        this.text(text);

        // bottom margin
        this.x = x0;
        this.y += (h + 0.5) * lh;
    }

    addPageFooter() {
        this.resetText();

        const lh = this.currentLineHeight();
        const y = this.page.height - this.page.margins.bottom - 3 * lh;

        // const l = this.page.margins.left;
        const r = this.page.width - this.page.margins.right;
        const w = 130;

        // // left part
        // this.moveTo(l, y).lineTo(l + w, y).stroke('black');
        // this.y = y + 0.5 * lh;
        // this.text('podpis odběratele', {
        //     align: 'left',
        // });

        // right part
        this.moveTo(r - w, y).lineTo(r, y).stroke('black');
        this.y = y + 0.5 * lh;
        this.text('podpis dodavatele', {
            align: 'right',
        });

        let signature = this.report.provider.signature;

        // signature
        if (typeof signature !== 'undefined' && typeof signature.path === 'string' && signature.path !== '') {
            if (fs.existsSync(signature.path)) {
                const sw = 170;
                const sh = 120;
                const sx = r - sw;
                const sy = y - sh + signature.offset_y;

                this.image(signature.path, sx, sy, {
                    fit: [sw, sh],
                    align: 'right',
                    valign: 'bottom',
                });
            } else {
                console.log(`Cannot find signature file %s, skipping.`, signature.path);
            }
        }
    }

    // table builder

    async table2(table) {
        this.resetText();

        let fontSize = 9;
        let xPadding = 5;
        let x0 = this.x;

        this.fontSize2(fontSize);
        let t = await super.table(table, {
            x: this.x - xPadding,
            divider: {
                header: {disabled: false, width: 0.25, opacity: 0.5, color: 'black'},
                horizontal: {disabled: false, width: 0.25, opacity: 0.5, color: 'lightgray'},
            },
            padding: {top: 0, right: xPadding, bottom: 0, left: xPadding}, // {Number} default: 0
            columnSpacing: 5, // {Number} default: 3
            hideHeader: false,
            // minRowHeight: fontSize,
            prepareHeader: () => {
                this.lineGap(-2 * this.defaultFontCorrection); // fix valign
                //this.font(this.defaultFontRegular).fontSize(10)
            },
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                this.lineGap(-1 * this.defaultFontCorrection); // fix valign
                //this.font(this.defaultFontRegular).fontSize(fontSize);
            },
        });

        this.x = x0;

        return t;
    }

    fontSize2(size) {
        return this.fontSize(size * this.defaultFontCorrection);
    }

    moveDown2(value) {
        return this.moveDown(value * this.defaultFontCorrection);
    }
}
