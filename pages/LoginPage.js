const { expect } = require('@playwright/test');


exports.LoginPage =
class LoginPage {

    constructor(page){
        this.page   = page;
        this.usernameInput  = '//label[@for="signInEmail"]';
        this.passwordInput  = '//input[@name="password"]';
        this.SignInBtn  ='//button[@class="button button__primary"]';
        this.Hmnm   = "//button[@id='account-nav-menu-icon']//span[contains(@class,'header__flex-container__icon__label')]";

    }

    async   login(username,password){
        await   this.page.locator(this.usernameInput).fill(username);
        await   this.page.locator(this.passwordInput).fill(password);
        await this.page.locator(this.SignInBtn).click();
        await this.page.waitForSelector(this.Hmnm, { state: 'visible', timeout: 10000 });
        await expect( this.page.locator(this.Hmnm)).toHaveText('Clay')


    }
}