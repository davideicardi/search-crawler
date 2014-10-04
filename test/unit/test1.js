// to disable c9 errors...
var describe = describe || null;
var beforeEach = beforeEach || null;
var inject = inject || null;
var it = it || null;
var expect = expect || null;



describe("Suite 1", function() {
  
  beforeEach(function(){
    module("myApp.sites.services", "ngResource");
  });
  
  var SiteApi;
  
  beforeEach(inject(function(_SiteApi_){
    SiteApi = _SiteApi_;
  }));
  
  it("siteApi should be valid", function() {
    expect(SiteApi).toBeDefined();
  });
  
});