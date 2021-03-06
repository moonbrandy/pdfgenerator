const logger = require('winston');
const path = require('path');
const fs = require('fs');
const fileUrl = require('file-url');
const puppeteer = require('puppeteer');
const config = require('../config');

const pdf_dir = config.PDF_DIRECTORY;
const tmp_dir = config.TEMPORARY_DIRECTORY;

let browser;

async function start() {
    logger.debug('chrome headless starting...');
    browser = await puppeteer.launch({args:['--no-sandbox']});
    logger.debug('chrome headless ready');
}

async function exit() {
    logger.debug('chrome headless stopping...');
    if (browser) {
        await browser.close();
    }
    logger.debug('chrome headless stopped');
}

async function generate(documentId, html, fileName) {
    const file = await new Promise(async (resolve, reject) => {
        try {
            const html_file = path.join(tmp_dir, `${fileName}.html`);
            const pdf_file = path.join(pdf_dir, `${fileName}.pdf`);

            logger.debug(`generating pdf for ${documentId}...`);
            fs.writeFileSync(html_file, html, 'utf8');
            const page = await browser.newPage();
            await page.goto(fileUrl(html_file));
            const buffer = await page.pdf({
                format: 'A4',
                printBackground: true
            });
            fs.writeFileSync(pdf_file, buffer);
            await page.close();
            logger.debug(`done ${pdf_file}`);
            resolve(pdf_file);
        } catch(exc) {
            reject(exc);
        }
    });
    return file;
}

module.exports = {
    start,
    exit,
    generate
};