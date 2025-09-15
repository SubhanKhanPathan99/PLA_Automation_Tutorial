const { expect } = require('@playwright/test');


exports.SearchPage =
class SearchPage {

    constructor(page){
        this.page   = page;
        this.SearchPg = '#searchboxDesktop';
        this.SearchOpt  =   '//a[@role="option"]';
        this.producttitles  =   '//div[@class="product-grid__products"]//h3//span';
        this.brandfilt  =   '//label[@for="product-filter-brand-input"]';
        this.closebtn   =   '#modalContent';
        this.filterbtn  =   '#title-product-filter-brand';
        this.fitlerfill =   '//div[@aria-labelledby="title-product-filter-brand"]//input[@type="text"]';
        this.filtoptchk =   '#brand_Nike'

    }

    async   search(searchitm,filtitm){
        await   this.page.locator(this.SearchPg).fill(searchitm);
        await   this.page.locator(this.SearchOpt).hover()
        await   this.page.keyboard.press('Enter');
        await   this.page.waitForSelector(this.producttitles, { timeout: 10000 });
        await   this.page.locator(this.brandfilt).scrollIntoViewIfNeeded();
        //await   this.page.locator(this.closebtn).getByRole('button').filter({ hasText: /^$/ }).click();
        await   this.page.waitForSelector(this.filterbtn, { state: 'visible', timeout: 10000 });
        await   this.page.locator(this.filterbtn).click()
        await   this.page.locator(this.fitlerfill).fill(filtitm);
        await   this.page.locator(this.filtoptchk).check();
    }
}