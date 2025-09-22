const { expect } = require('@playwright/test');

exports.SelectPage = class SelectPage {

  constructor(page) {
    this.page = page;

    // Locators
    this.Prdlist      = '//div[@class="product-grid__products"]//h3//span';
    this.SelectprdNm  = '//h1[@id="product-name"]//span';
    this.stndship     = "//label[@id='pdp-fulfillment-option-label-SHIP']//div[@class='radio-fill']";
    this.strpickopt   = "//label[@id='pdp-fulfillment-option-label-BOPIS']//div[@class='radio-fill']";
    this.sizeopt      = '//button[contains(@class,"box-selector")]';
    this.allsize      = 'span:nth-of-type(2)';
    this.addtobagbtn  = '//button[@id="add-to-bag-button"]';
    this.addbagbtn    = '//a[@aria-labelledby="header__flex-container__icon__label"]';
    this.iframclsbtn  = '[data-testid="closeIcon"]';
    this.nxtpgbtn     = '//a[@aria-label="Go To Next Page"]';
    this.searchBox    = '#searchboxDesktop';
    this.titprd       = '#title-product-filter-price';
    this.prmin        = '//input[@formcontrolname="priceRangeMin"]';
    this.prmax        = '//input[@formcontrolname="priceRangeMax"]';
    this.prdfilrng    = "//button[contains(@class,'product-filter__price__range')]";
    this.prdfiltsrt   = "#title-product-filter-sort";
    this.firstprd     = "//app-product-listing//app-product-tile[1]//h3//span";
    this.shoesize     = '//span[normalize-space()="10"]';
    this.gotoshopbtn  = '//div[@class="bag-info"]//button[@id="atb-review-and-checkout-button"]';
          
  }

  async select(pr1, pr2, pr3, prd4) {
    let productFound = false;
    let currentPage = 1;

    while (true) {
      console.log(`🔍 Searching Page ${currentPage}...`);

      // get all product names
      const nameTiles = this.page.locator(this.Prdlist);
      const productNames = await nameTiles.allTextContents();

      for (let idx = 0; idx < productNames.length; idx++) {
        const productName = productNames[idx]?.toLowerCase().trim();

        if (
          productName.includes(pr1.toLowerCase()) &&
          productName.includes(pr2.toLowerCase()) &&
          productName.includes(pr3.toLowerCase())
        ) {
          console.log(`✅ Found product: ${productName}`);

          const target = nameTiles.nth(idx);
          await target.scrollIntoViewIfNeeded();  // scroll first
          await target.click(); 
          productFound = true;

          // Assertions
          await expect(this.page.locator(this.SelectprdNm)).toContainText('Nike Calm Slip-On');
          await expect(this.page.locator(this.stndship)).toBeChecked();
          await expect(this.page.locator(this.strpickopt)).not.toBeChecked();

          await this.page.locator("//span[normalize-space()='12']").click()

          await this.page.locator(this.addtobagbtn).click();
          //await this.page.locator(this.addbagbtn).click();

          await this.page.waitForTimeout(10000);

          const reviewAndCheckoutBtn = this.page.locator(this.gotoshopbtn);

          if (await reviewAndCheckoutBtn.isVisible()) {
            await reviewAndCheckoutBtn.scrollIntoViewIfNeeded();
            if (await reviewAndCheckoutBtn.isEnabled()) {
              await reviewAndCheckoutBtn.click();
              console.log('🛒 Clicked "Review & Checkout" after 30s wait.');
            } else {
              console.log('ℹ️ "Review & Checkout" is visible but not enabled; skipping.');
            }
          } else {
            console.log('ℹ️ "Review & Checkout" not visible after 30s; continuing.');
}


          // close optional popup
          const frame = await this.page.frame({ name: 'Sign Up via Text for Offers' });
          if (frame && await frame.locator(this.iframclsbtn).isVisible().catch(() => false)) {
            await frame.locator(this.iframclsbtn).click();
          }

          break;
        }
      }

      if (productFound) break;

      // go to next page if available
      const nextButton = this.page.locator(this.nxtpgbtn);
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await this.page.waitForTimeout(2000); // wait 2s for products to load
        currentPage++;
      } else {
        console.log('❌ Product not found. Running fallback search...');
        break;
      }
    }

    // ===== Fallback search flow =====
    if (!productFound) {
      await this.page.locator(this.searchBox).fill(prd4 || 'adidas shoes');
      await this.page.locator(this.searchBox).press('Enter');

      // wait for results to load
      await this.page.waitForTimeout(3000);

      await this.page.locator(this.titprd).click();
      await this.page.locator(this.prmin).fill('50');
      await this.page.locator(this.prmax).fill('60');
      await this.page.locator(this.prdfilrng).click();

      await this.page.waitForTimeout(2000);

      const sortFilter = this.page.locator(this.prdfiltsrt);
      await sortFilter.click();

      await this.page.locator(this.firstprd).click();
      await this.page.locator(this.shoesize).click();

      await expect(this.page.locator(this.stndship)).toBeChecked();
      await expect(this.page.locator(this.strpickopt)).not.toBeChecked();

      await this.page.locator(this.addtobagbtn).click();
      await this.page.waitForTimeout(10000);

          const reviewAndCheckoutBtn = this.page.locator(this.gotoshopbtn);

          if (await reviewAndCheckoutBtn.isVisible()) {
            await reviewAndCheckoutBtn.scrollIntoViewIfNeeded();
            if (await reviewAndCheckoutBtn.isEnabled()) {
              await reviewAndCheckoutBtn.click();
              console.log('🛒 Clicked "Review & Checkout" after 30s wait.');
            } else {
              console.log('ℹ️ "Review & Checkout" is visible but not enabled; skipping.');
            }
          } else {
            console.log('ℹ️ "Review & Checkout" not visible after 30s; continuing.');
}
    }

    if (productFound) {
      console.log('🎯 Product clicked successfully.');
    } else {
      console.log('🔍 Fallback executed.');
    }
  }
};
