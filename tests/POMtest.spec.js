import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import  { SearchPage }    from    '../pages/SearchPage';
import  { SelectPage }  from    '../pages/SelectPage';
import  { LogoutPage }  from    '../pages/LogoutPage';
const testdata  =   JSON.parse(JSON.stringify(require("../testdata.json")));


test('test @smoke' , async({page})=>{


    const hmp = new HomePage(page);
    await hmp.gotoLoginPage();
    await hmp.home();

    const   lgn = new LoginPage(page);
    await   lgn.login(testdata.username,testdata.password);

    const Srp = new SearchPage(page);
    await   Srp.search(testdata.search1,testdata.search2);

    const   Selitm  = new   SelectPage(page);
    await   Selitm.select(testdata.productnm0,testdata.productnm1,testdata.productnm2,testdata.Product2)

    const lgot  = new   LogoutPage(page);
    await   lgot.logout();





})



// Timeouts:
// 1. Test timeout
// 2. Assertion timeout
// 3. Action timeout
// 4. All time execution timeout