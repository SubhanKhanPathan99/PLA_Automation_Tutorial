const { expect } = require('@playwright/test');


exports.SelectPage =
class SelectPage {

    constructor(page){
        this.page               =   page;
        this.Prdlist            =   '//div[@class="product-grid__products"]//h3//span';
        this.allPrdNm           =   "//app-product-listing[@class='ng-star-inserted']//app-product-tile//div//div//a//h3//span";
        this.SelectprdNm        =   '//h1[@id="product-name"]//span';
        this.stndship           =   "//label[@id='pdp-fulfillment-option-label-SHIP']//div[@class='radio-fill']";
        this.strpickopt         =   "//label[@id='pdp-fulfillment-option-label-BOPIS']//div[@class='radio-fill']";
        this.sizeopt            =   '//button[contains(@class,"box-selector")]';
        this.allsize            =   'span:nth-of-type(2)';
        this.addtobagbtn        =   '//button[@id="add-to-bag-button"]';
        this.addtobagtit        =   '//div[@class="product__info"]//div[1]';
        this.closeBtn           =   'dialog-title-close-button';
        this.addbagbtn          =   '//a[@aria-labelledby="header__flex-container__icon__label"]';
        this.iframclsbtn        =   '[data-testid="closeIcon"]';
        this.chkoutpgtit        =   '//ul[@class="nobul product-module__details__info__list"]//li[1]//h5';
        this.chkoutpgalrt       =   '//div[contains(@class,"bag-message-zone__urgency-message")]';
        this.payoutbtn          =   '//button[@data-testid="pay-with-card-button"]';
        this.nxtpgbtn           =   '//a[@aria-label="Go To Next Page"]';
        this.frstprdcont        =   '//div[@class="product-grid__products"]//h3//span';
        this.searchBox          =   '#searchboxDesktop';
        this.titprd             =   '#title-product-filter-price';
        this.prmin              =   '//input[@formcontrolname="priceRangeMin"]';
        this.prmax              =   '//input[@formcontrolname="priceRangeMax"]';
        this.prdfilrng          =   "//button[contains(@class,'product-filter__price__range')]";
        this.prdfiltsrt         =   "#title-product-filter-sort";
        this.srtfltr            =   "//label[@for='sort-radio-input-4']";
        this.allprddet          =   '//div[@class="product-grid__products"]//div[contains(@class,"product-tile__price")]//span';
        this.firstprd           =   "//app-product-listing[@class='ng-star-inserted']//app-product-tile[1]//div[1]//div//a[1]//h3[1]//span[1]";
        this.shoesize           =   '//span[normalize-space()="10"]'


    }

    async   select(pr1,pr2,pr3,prd4){

        let productFound = false;
        let currentPage = 1;
        while (true) {
            console.log(`🔍 Searching Page ${currentPage}...`);
          
            // Get all product names
            const productNamesRaw = await this.page.locator(this.Prdlist).allTextContents();
          
            console.log(`📦 Found ${productNamesRaw.length} products on page ${currentPage}`);
          
            for (let idx = 0; idx < productNamesRaw.length; idx++) {
              const productName = productNamesRaw[idx]?.toLowerCase().trim();
              console.log(`Page ${currentPage} - Product ${idx + 1}: ${productName}`);
          
              if (productName?.includes(pr1) && productName.includes(pr2) && productName.includes(pr3)) {
                console.log(`✅ Found target product: ${productName}`);   
  
                const productLink = this.page.locator(this.allPrdNm).nth(idx);
          
                await productLink.scrollIntoViewIfNeeded();
                await productLink.click();
          
                productFound = true;
  
                await expect(this.page.locator(this.SelectprdNm)).toContainText('Nike Calm Slip-On')
  
                expect(this.page.locator(this.stndship )).toBeChecked()
        
                expect(this.page.locator(this.strpickopt)).not.toBeChecked()
  
  
                const sizes = await this.page.$$(this.sizeopt);
                for (const size of sizes) {
                  const span = await size.$(this.allsize);
                  const sizeText = (await span.textContent()).trim();
                  const classes = await size.getAttribute('class');
                  const isDisabled = classes.includes('disabled');
                  if (!isDisabled && (sizeText === '9' || sizeText === '10')) {
                    await size.click();
                    break;
                  }
                }
        
                await this.page.locator(this.addtobagbtn).click()
                await this.page.locator(this.addbagbtn).click()
          
  
                const frameHandle = await this.page.$('iframe[title="Sign Up via Text for Offers"]');  // $ = no waiting forever
                if (frameHandle) {
                const frame = await frameHandle.contentFrame();
                if (frame && await frame.locator(this.iframclsbtn).isVisible()) {
                    await frame.locator(this.iframclsbtn).click({ force: true });
                }
                }
  
     
                break;
              }
            }

            if (productFound) break;
        
          // Locate the next page button
          const nextButton = this.page.locator(this.nxtpgbtn);
          
          // ✅ Check if next page is visible and enabled
          if (await nextButton.isVisible() && await nextButton.isEnabled()) {
            console.log(`➡️ Going to next page (${currentPage + 1})...`);
        
            const firstProductBefore = await this.page.locator(this.frstprdcont).first().textContent();
        
            await nextButton.click();
        
            // Wait for products to update
            await this.page.waitForFunction(
              (prevName) => {
                const el = document.querySelector('.product-grid__products h3 span');
                return el && el.textContent.trim() !== prevName?.trim();
              },
              firstProductBefore
            );
        
            await this.page.waitForTimeout(2000);
            currentPage++;
          } else {
            console.log('❌ No more pages or Next button disabled. Searching for adidas shoes...');
            
            // Go to main search box
            await this.page.locator(this.searchBox).fill(prd4);
            await this.page.locator(this.searchBox).press('Enter');

            await this.page.locator(this.titprd).click()

            await this.page.locator(this.prmin).fill('50')
            await this.page.locator(this.prmax).fill('60')
            await this.page.locator(this.prdfilrng).click()
          
            // Wait for products to reload after sorting
            await this.page.waitForTimeout(3000);

            const sortFilter = this.page.locator(this.prdfiltsrt);
            await sortFilter.waitFor({ state: "visible" });
            await sortFilter.scrollIntoViewIfNeeded();
            await sortFilter.click();

            await this.page.locator(this.firstprd).click()

            await this.page.locator(this.shoesize).click()

            expect(this.page.locator(this.stndship)).toBeChecked()
      
            expect(this.page.locator(this.strpickopt)).not.toBeChecked()
              
            await this.page.locator(this.addtobagbtn).click()

            await this.page.getByTestId(this.closeBtn).click();

            await this.page.locator(this.addbagbtn).click()

              try {
                const frameHandle = await this.page.locator('iframe[title="Sign Up via Text for Offers"]').elementHandle();
                if (frameHandle) {
                  const frame = await frameHandle.contentFrame();
                  if (frame) {
                    const closeBtn = frame.locator('[data-testid="closeIcon"]');
                    if (await closeBtn.isVisible()) {
                      await closeBtn.click({ force: true });
                      console.log("✅ Popup closed.");
                    }
                  }
                }
              } catch (err) {
                console.log("ℹ️ Popup already closed or iframe detached, continuing...");
              }
            break;
          }
        }
        
        if (productFound) {
          console.log('🎯 Test finished: Product clicked successfully.');
        } else {
          console.log('🔍 Test finished: Product not found on any page. Adidas search executed.');
        }   
    }
}



