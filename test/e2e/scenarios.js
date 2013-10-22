'use strict';

// http://docs.angularjs.org/guide/dev_guide.e2e-testing 
// http://www.yearofmoo.com/2013/01/full-spectrum-testing-with-angularjs-and-karma.html

describe('nextprot:', function() {

  angular.scenario.matcher('toArrayContain', function(expected) {
    var result=true;
    angular.forEach(this.actual, function(e){
      if(e.indexOf(expected)==-1){
        result=false;
        return false;
      }
    })
    return result;
  });

  beforeEach(function() {
    browser().navigateTo('/');
  });

  describe("General usage of the interface",function(){
    it('when search field is empty, clear and search buttons must be disabled', function() {
      browser().navigateTo('/');

      expect(element('#search-entity').text()).toContain('proteins');
      expect(element('#search-quality').text()).toContain('Gold only');
      expect(element('#search-clear[disabled=disabled]').count()).toBe(1);
      expect(element('#search-button[disabled=disabled]').count()).toBe(1);
    });

    it('when searching, clear and search buttons must be enabled', function() {
      browser().navigateTo('/publications/search/insulin');

      expect(element('#search-entity').text()).toContain('publications');
      expect(element('#search-clear[disabled=disabled]').count()).toBe(0);
      expect(element('#search-button[disabled=disabled]').count()).toBe(0);


    });

    it('when changing entity from publications to proteins, ui must be consistant', function() {
      browser().navigateTo('/publications/search/insulin');
      expect(element('#search-entity').text()).toContain('publications');

      //
      //change entity
      element('#search-entity-dropdown>li>a:first').click();
      expect(element('#search-entity').text()).toContain('proteins');
      expect(element('#search-quality').text()).toContain('Gold only');
    });

    it('testing incorrect url search path', function() {
      browser().navigateTo('/pouet/search/insulin');
      expect(element('div.error').text()).toContain('pouet');
    });

    it('testing incorrect url filters : gold-and-silver', function() {
      browser().navigateTo('/publications/search/insulin?quality=gold-and-silver');
      expect(element('div.error').text()).toContain('gold-and-silver');
    });

    it('testing incorrect url filters : pouet', function() {
      browser().navigateTo('/publications/search/insulin?pouet=prout');
      expect(element('div.error').text()).toContain('pouet');
    });

    it("testing paging, kinane receptor => 2 pages of 20 items",function({
      browser().navigateTo('/proteins/search/kinane receptor');
      expect(element('.resultparams .pagination li').count()).toBe(5);
      expect(element('.resultparams .pagination li.disabled').count()).toBe(1);
      expect(element('.resultparams .pagination li.ng-scope').count()).toBe(2);
    }))

    it("testing paging, kinase receptor => 2 pages of 20 items",function({
      browser().navigateTo('/proteins/search/kinase receptor');
      expect(element('.resultparams .pagination li').count()).toBe(8);
      expect(element('.resultparams .pagination li.disabled').count()).toBe(1);
      expect(element('.resultparams .pagination li.ng-scope').count()).toBe(5);
    }))

  });


  describe("GS4 Search should support Gold only' and 'Gold and silver'",function(){
    it('search quality Gold/Silver is only available for proteins', function() {
      //
      // on proteins
      browser().navigateTo('/proteins/search/insulin');
      expect(element('#search-quality.ng-hide').count()).toBe(0);


      //
      // on publications
      browser().navigateTo('/publications/search/insulin');
      expect(element('#search-quality.ng-hide').count()).toBe(1);

      //
      // on terms
      browser().navigateTo('/terms/search/insulin');
      expect(element('#search-quality.ng-hide').count()).toBe(1);

    });

    it('when changing quality from "Gold only" to "Gold and Silver" ui must be consistant', function() {
      browser().navigateTo('/proteins/search/insulin');

      //
      //change quality
      element('#search-quality-dropdown>li>a:eq(1)').click();
      expect(element('#search-quality').text()).toContain('Include silver');
      expect(browser().location().url()).toBe("/proteins/search/insulin?quality=gold-and-silver");
    });


  });


  describe("GS5 100% of the entries for which the search terms is relevant should be retrieved",function(){

  });

  describe("GS6 searching for Insul*: should retrieve Insulin, Insulinemia, etc.",function(){
    it('searching insul* should result more than 19 rows  (in fact 20)', function() {
      browser().navigateTo('/proteins/search/insul*');
      expect(element('#search-results>li').count()).toBeGreaterThan(19);
    });
  });

  describe("GS7 Searching for an exact term string should be supported",function(){
    //
    // checking with uniprot 
    // http://www.uniprot.org/uniprot/?query=%22protein+kinase%22+AND+organism%3A%22Human+[9606]%22&sort=score
    it("Searching for 'protein kinase' should return titles with 'protein kinase'",function(){
      browser().navigateTo('/proteins/search/protein kinase');
      expect(repeater('#search-results>li a.ng-binding').column('doc.recommended_name')).toArrayContain('protein kinase')
    });
  });

  describe("FT1 The full text search should allow to search in three separate sections: proteins, publications and terminology",function(){
    it('search on sections proteins', function() {
      //
      // on proteins
      browser().navigateTo('/proteins/search/insulin');
      expect(element('#search-entity').text()).toContain('proteins');
      expect(element('#search-results>li').count()).toBeGreaterThan(19);
    });

    it('search on sections publications', function() {
      //
      // on publications
      browser().navigateTo('/publications/search/insulin');
      expect(element('#search-entity').text()).toContain('publications');
      expect(element('#search-results>li').count()).toBeGreaterThan(19);

    });

    it('search on sections terminology', function() {

      //
      // on terms
      browser().navigateTo('/terms/search/insulin');
      expect(element('#search-entity').text()).toContain('terms');
      expect(element('#search-results>li').count()).toBeGreaterThan(19);

    });

  });
  describe("FT2 By default, if a user enters multiple words, the full text search tool will use the AND operator",function(){
    it('search multiple words [amos btk jak2] should result 0 doc', function() {
      //
      // on terms
      browser().navigateTo('/proteins/search/amos btk jak2');
      expect(element('#search-entity').text()).toContain('proteins');
      expect(element('#search-results>li').count()).toBe(0);

    });

  });
  describe("FT3 the terminologies hierarchies should be explicited and taken into account in the indices",function(){

  });
  describe("FT4 For terminology, all data must be indexed: term accessions, names, etc. Note: the hierarchy should not be explicited",function(){

  });
  describe("FT5 For publications all data must be indexed (authors, title, journal name, year, abstract and PubMed IDs).",function(){
    it('search with authors Antonarakis AND Trochet', function() {
      //
      // on terms
      browser().navigateTo('/publications/search/antonarakis%20trochet');
      expect(element('#search-entity').text()).toContain('publications');
      expect(element('#search-results>li').count()).toBe(1);
    });

    it('search with journal title "Epistatic interactions with a common hypomorphic"', function() {
      //
      // on terms
      browser().navigateTo('/publications/search/Epistatic interactions with a common hypomorphic');
      expect(element('#search-entity').text()).toContain('publications');
      expect(element('#search-results>li').count()).toBe(1);
    });

    it('search with journal name "Human mutation"', function() {
      //
      // on terms
      browser().navigateTo('/publications/search/Human mutation');
      expect(element('#search-entity').text()).toContain('publications');
      expect(element('#search-results>li').count()).toBeGreaterThan(10);
    });

    it('search with pubmedid 8276809', function() {
      //
      // on terms
      browser().navigateTo('/publications/search/8276809');
      expect(element('#search-entity').text()).toContain('publications');
      expect(element('#search-results>li').count()).toBe(1);
      expect(element('#search-results>li a.ng-binding').text()).toContain('Direct activation of the phosphatidylinositol');
    });    

    it('search with year 1968', function() {
      //
      // on terms
      browser().navigateTo('/publications/search/1968');
      expect(element('#search-entity').text()).toContain('publications');
      expect(element('#search-results>li a.ng-binding').text()).toContain('1968');
    });    

  });
  describe("FT6 There is no need of autocompletion in full text search",function(){

  });
  describe("FT7 Search suggestions (displayed à la 'google' when someone starts typing);",function(){

  });
  describe("FT7 'Did you mean' for single word search that did not get results",function(){
    it('search for "kinaze rezeptor" should result 0 doc and suggest "kinase recpetor"', function() {
      //
      // on terms
      browser().navigateTo('/proteins/search/kinaze rezeptor');
      expect(element('#search-entity').text()).toContain('proteins');
      expect(element('#search-didyoumean').text()).toContain('kinase receptor');      
      expect(element('#search-results>li').count()).toBe(0);

    });
  });


  describe("DR4 In a first round we would like to be able to sort on the following",function(){
    xit('sort on Gene name', function() {
    });
    xit('sort on Protein name', function() {
    });
    xit('sort on Protein family name', function() {
    });
    xit('sort on ACs', function() {
    });
    xit('sort on Protein length', function() {
    });
    xit('sort on The ranking score', function() {
    });
  });


});
