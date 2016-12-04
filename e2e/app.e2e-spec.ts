import { MyconsolePage } from './app.po';

describe('myconsole App', function() {
  let page: MyconsolePage;

  beforeEach(() => {
    page = new MyconsolePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
