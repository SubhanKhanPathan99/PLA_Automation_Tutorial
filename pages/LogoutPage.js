const { expect } = require('@playwright/test');


exports.LogoutPage =
class LogoutPage {

    constructor(page){
        this.page       = page;
        this.lgoutpg    = '#account-nav-menu-icon';
        this.lgtbtn     = "//span[normalize-space()='Sign Out']";
        this.text       = "//button[@id='account-nav-menu-icon']//span[contains(@class,'header__flex-container__icon__label')]"

    }

    async   logout(){
        await this.page.locator(this.lgoutpg).click()
        await this.page.locator(this.lgtbtn).click()
        await expect(await this.page.locator(this.text)).toHaveText('Sign In')


    }
}