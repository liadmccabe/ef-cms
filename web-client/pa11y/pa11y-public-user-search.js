module.exports = [
  {
    actions: [
      'wait for #tab-case to be visible',
      'set field #docket-number to 103-20',
      'click element button#docket-search-button',
      'wait for table.ustc-table to be visible',
    ],
    notes: 'checks a11y of advanced case search',
    url: 'http://localhost:5678/',
  },
  {
    actions: [
      'wait for #tab-order to be visible',
      'click element #tab-order',
      'wait for #clear-search to be visible',
      'click element #clear-search',
      'wait for #order-search to be visible',
      'set field #order-search to dismissal',
      'wait for #order-date-range to be visible',
      'set field #order-date-range to customDates',
      'check field #order-date-range',
      'wait for #startDate-date-start to be visible',
      'set field #startDate-date-start to 08/01/2001',
      'check field #startDate-date-start',
      'wait for button#advanced-search-button to be visible',
      'click element button#advanced-search-button',
      'wait for table.search-results to be visible',
    ],
    notes: 'checks a11y of advanced order search',
    timeout: 80001,
    url: 'http://localhost:5678/',
  },
  {
    actions: [
      'wait for #tab-order to be visible',
      'click element #tab-order',
      'wait for #clear-search to be visible',
      'click element #clear-search',
      'wait for #clear-search to be visible',
      'click element #clear-search',
      'wait for #order-search to be visible',
      'set field #order-search to meow',
      'wait for button#advanced-search-button to be visible',
      'click element button#advanced-search-button',
      'wait for #no-search-results to be visible',
    ],
    notes: 'checks a11y of advanced order search with no results',
    timeout: 80000,
    url: 'http://localhost:5678/',
  },
  // TODO: Add back in when 8990 is complete
  // {
  //   actions: [
  //     'wait for #tab-opinion to be visible',
  //     'click element #tab-opinion',
  //     'wait for #clear-search to be visible',
  //     'click element #clear-search',
  //     'wait for #opinion-search to be visible',
  //     'set field #opinion-search to sunglasses',
  //     'set field #startDate-date-start to 08/01/2001',
  //     'check field #startDate-date-start',
  //     'click element button#advanced-search-button',
  //     'wait for table.search-results to be visible',
  //   ],
  //   notes: 'checks a11y of advanced opinion search with results on sealed case',
  //   url: 'http://localhost:5678/',
  // },
];
