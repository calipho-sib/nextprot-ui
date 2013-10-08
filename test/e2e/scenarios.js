'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('nextprot ui', function() {

  beforeEach(function() {
    browser().navigateTo('/');
  });


  it('when search field is empty clear and search buttons must be disabled', function() {
    browser().navigateTo('/');

    expect(element('#search-entity').text()).toContain('proteins');
    expect(element('#search-quality').text()).toContain('Gold only');
    expect(element('#search-clear[disabled=disabled]').count()).toBe(1);
    expect(element('#search-button[disabled=disabled]').count()).toBe(1);
  });

  it('when searching clear and search buttons must be enabled', function() {
    browser().navigateTo('/publications/search/insulin');

    expect(element('#search-entity').text()).toContain('publications');
    expect(element('#search-quality.ng-hide').count()).toBe(1);
    expect(element('#search-clear[disabled=disabled]').count()).toBe(0);
    expect(element('#search-button[disabled=disabled]').count()).toBe(0);


  });

  it('when changing entity from publications to proteins ui must be consistant', function() {
    browser().navigateTo('/publications/search/insulin');
    expect(element('#search-entity').text()).toContain('publications');

    //
    //change entity
    element('#search-entity-dropdown>li>a:first').click();
    expect(element('#search-entity').text()).toContain('proteins');
    expect(element('#search-quality').text()).toContain('Gold only');
  });


  it('testing incorrect url', function() {
    browser().navigateTo('/pouet/search/insulin');
    expect(element('div.error').text()).toContain('pouet');
  });



});
