const FORMATTED_CASES = [
  {
    calendarNotes:
      'Spicy jalapeno bacon ipsum dolor amet laborum nostrud eiusmod, ex drumstick quis eu dolore excepteur fatback. Qui sirloin andouille chuck. Jowl velit capicola quis elit meatloaf.',
    caseTitle: 'Cora Poole',
    docketNumber: '103-22',
    docketNumberWithSuffix: '103-22',
    inConsolidatedGroup: true,
    irsPractitioners: [
      {
        barNumber: 'RT6789',
        contact: {
          address1: '234 Main St',
          address2: 'Apartment 4',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'irsPractitioner@example.com',
        entityName: 'IrsPractitioner',
        name: 'Test IRS Practitioner',
        role: 'irsPractitioner',
        serviceIndicator: 'Electronic',
        userId: '5805d1ab-18d0-43ec-bafb-654e83405416',
      },
      {
        barNumber: 'RT0987',
        contact: {
          address1: '234 Main St',
          address2: 'Apartment 4',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'irsPractitioner1@example.com',
        entityName: 'IrsPractitioner',
        name: 'Test IRS Practitioner1',
        role: 'irsPractitioner',
        serviceIndicator: 'Electronic',
        userId: '5fb6e815-b5d3-459b-b08b-49c61f0fce5e',
      },
    ],
    leadCase: true,
    privatePractitioners: [
      {
        barNumber: 'PT1234',
        contact: {
          address1: '234 Main St',
          address2: 'Apartment 4',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'privatePractitioner@example.com',
        entityName: 'PrivatePractitioner',
        firmName: 'GW Law Offices',
        name: 'Test Private Practitioner',
        representing: ['992f08b6-1c68-4db9-a581-5cdf30dac65b'],
        role: 'privatePractitioner',
        serviceIndicator: 'Electronic',
        userId: '9805d1ab-18d0-43ec-bafb-654e83405416',
      },
      {
        barNumber: 'PT9999',
        contact: {
          address1: '234 Bogus Ln',
          address2: 'Apartment 99',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'privatePractitioner99@example.com',
        entityName: 'PrivatePractitioner',
        firmName: 'Bogus Barristers',
        name: 'Test Private Practitioner',
        representing: ['992f08b6-1c68-4db9-a581-5cdf30dac65b'],
        role: 'privatePractitioner',
        serviceIndicator: 'Electronic',
        userId: 'a6318a31-8aa4-4002-a7b0-1192af19dbb9',
      },
    ],
    trialStatus: 'recall',
    userNotes:
      'Bacon ipsum dolor amet salami doner meatball ground round. Pork belly tail jerky turducken tenderloin salami fatback strip steak cow ribeye sausage corned beef spare ribs. Landjaeger sausage spare ribs doner t-bone shankle pastrami chislic tenderloin bacon. Shoulder t-bone kevin, cupim corned beef doner burgdoggen shankle tongue ball tip chicken short ribs pork turkey boudin. Strip steak ball tip jowl kevin, tail turkey flank venison jerky bacon. Pork chop venison strip steak, bresaola short ribs leberkas corned beef t-bone chuck beef ribs meatloaf fatback frankfurter.\n\nTurkey tri-tip tongue, shankle boudin landjaeger porchetta ribeye rump t-bone swine capicola brisket chuck short ribs. Beef ribs ham hock chuck, doner chislic bacon meatloaf t-bone pancetta turducken ball tip. Chuck picanha shankle, jowl pig doner pork rump kielbasa. Meatloaf cupim salami corned beef spare ribs drumstick venison, pork chop prosciutto jerky pig doner beef flank tongue. Flank alcatra turducken, landjaeger ham t-bone corned beef pork loin rump shoulder fatback pork chop short ribs. Swine strip steak pork belly venison pig doner ball tip porchetta cow. Pancetta prosciutto cupim, leberkas jerky flank tenderloin shank ribeye kevin drumstick sausage doner.',
  },
  {
    calendarNotes:
      'Spicy jalapeno bacon ipsum dolor amet beef biltong chuck tongue bresaola, rump boudin prosciutto doner. Boudin kielbasa cow brisket, tail hamburger flank.',
    caseTitle: 'Lucas Maldonado & Lauryn Robins',
    docketNumber: '105-22',
    docketNumberWithSuffix: '105-22',
    inConsolidatedGroup: true,
    irsPractitioners: [
      {
        barNumber: 'RT6789',
        contact: {
          address1: '234 Main St',
          address2: 'Apartment 4',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'irsPractitioner@example.com',
        entityName: 'IrsPractitioner',
        name: 'Test IRS Practitioner',
        role: 'irsPractitioner',
        serviceIndicator: 'Electronic',
        userId: '5805d1ab-18d0-43ec-bafb-654e83405416',
      },
      {
        barNumber: 'RT0987',
        contact: {
          address1: '234 Main St',
          address2: 'Apartment 4',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'irsPractitioner1@example.com',
        entityName: 'IrsPractitioner',
        name: 'Test IRS Practitioner1',
        role: 'irsPractitioner',
        serviceIndicator: 'Electronic',
        userId: '5fb6e815-b5d3-459b-b08b-49c61f0fce5e',
      },
    ],
    leadCase: false,
    privatePractitioners: [
      {
        barNumber: 'PT9999',
        contact: {
          address1: '234 Bogus Ln',
          address2: 'Apartment 99',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'privatePractitioner99@example.com',
        entityName: 'PrivatePractitioner',
        firmName: 'Bogus Barristers',
        name: 'Test Private Practitioner',
        representing: [
          'fb7e9432-ddb0-4a44-99b1-2bbc804ed72f',
          'a3cf2108-ef52-4993-8398-8bef1106d545',
        ],
        role: 'privatePractitioner',
        serviceIndicator: 'Electronic',
        userId: 'a6318a31-8aa4-4002-a7b0-1192af19dbb9',
      },
    ],
    trialStatus: 'setForTrial',
  },
  {
    caseTitle: 'Arron Andrade, Deceased, Finn Berg, Surviving Spouse',
    docketNumber: '107-22',
    docketNumberWithSuffix: '107-22',
    inConsolidatedGroup: true,
    irsPractitioners: [
      {
        barNumber: 'RT6789',
        contact: {
          address1: '234 Main St',
          address2: 'Apartment 4',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'irsPractitioner@example.com',
        entityName: 'IrsPractitioner',
        name: 'Test IRS Practitioner',
        role: 'irsPractitioner',
        serviceIndicator: 'Electronic',
        userId: '5805d1ab-18d0-43ec-bafb-654e83405416',
      },
      {
        barNumber: 'RT0987',
        contact: {
          address1: '234 Main St',
          address2: 'Apartment 4',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'irsPractitioner1@example.com',
        entityName: 'IrsPractitioner',
        name: 'Test IRS Practitioner1',
        role: 'irsPractitioner',
        serviceIndicator: 'Electronic',
        userId: '5fb6e815-b5d3-459b-b08b-49c61f0fce5e',
      },
    ],
    leadCase: false,
    privatePractitioners: [
      {
        barNumber: 'PT1234',
        contact: {
          address1: '234 Main St',
          address2: 'Apartment 4',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'privatePractitioner@example.com',
        entityName: 'PrivatePractitioner',
        firmName: 'GW Law Offices',
        name: 'Test Private Practitioner',
        representing: ['ec31adf4-634f-41e4-b1e9-085a8bd039b9'],
        role: 'privatePractitioner',
        serviceIndicator: 'Electronic',
        userId: '9805d1ab-18d0-43ec-bafb-654e83405416',
      },
      {
        barNumber: 'PT9999',
        contact: {
          address1: '234 Bogus Ln',
          address2: 'Apartment 99',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'privatePractitioner99@example.com',
        entityName: 'PrivatePractitioner',
        firmName: 'Bogus Barristers',
        name: 'Test Private Practitioner',
        representing: ['ec31adf4-634f-41e4-b1e9-085a8bd039b9'],
        role: 'privatePractitioner',
        serviceIndicator: 'Electronic',
        userId: 'a6318a31-8aa4-4002-a7b0-1192af19dbb9',
      },
      {
        barNumber: 'PT5432',
        contact: {
          address1: '234 Main St',
          address2: 'Apartment 4',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'privatePractitioner1@example.com',
        entityName: 'PrivatePractitioner',
        firmName: 'Bogus Barristers',
        name: 'Test Private Practitioner',
        representing: ['ec31adf4-634f-41e4-b1e9-085a8bd039b9'],
        role: 'privatePractitioner',
        serviceIndicator: 'Electronic',
        userId: 'ad07b846-8933-4778-9fe2-b5d8ac8ad728',
      },
    ],
    trialStatus: 'basisReached',
    userNotes:
      'Bacon ipsum dolor amet ad enim leberkas dolor id venison laboris deserunt ut jerky frankfurter voluptate strip steak cupim ipsum. Voluptate consectetur aliqua venison buffalo fugiat landjaeger. Et turkey corned beef fatback, ut pork cupidatat shoulder boudin in anim elit laborum ground round. Consequat tail irure duis.',
  },
  {
    calendarNotes:
      'Spicy jalapeno bacon ipsum dolor amet sausage shankle pork t-bone ribeye, swine ground round short loin chuck pancetta meatloaf chislic.',
    caseTitle:
      'Aquila Yang & Izzy Vazquez, Deceased, Aquila Yang, Surviving Spouse',
    docketNumber: '104-22',
    docketNumberWithSuffix: '104-22',
    inConsolidatedGroup: false,
    irsPractitioners: [
      {
        barNumber: 'RT6789',
        contact: {
          address1: '234 Main St',
          address2: 'Apartment 4',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'irsPractitioner@example.com',
        entityName: 'IrsPractitioner',
        name: 'Test IRS Practitioner',
        role: 'irsPractitioner',
        serviceIndicator: 'Electronic',
        userId: '5805d1ab-18d0-43ec-bafb-654e83405416',
      },
    ],
    leadCase: false,
    privatePractitioners: [
      {
        barNumber: 'PT1234',
        contact: {
          address1: '234 Main St',
          address2: 'Apartment 4',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'privatePractitioner@example.com',
        entityName: 'PrivatePractitioner',
        firmName: 'GW Law Offices',
        name: 'Test Private Practitioner',
        representing: ['8767a0e0-3569-43ff-9221-fc4435f7b3bb'],
        role: 'privatePractitioner',
        serviceIndicator: 'Electronic',
        userId: '9805d1ab-18d0-43ec-bafb-654e83405416',
      },
      {
        barNumber: 'PT9999',
        contact: {
          address1: '234 Bogus Ln',
          address2: 'Apartment 99',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'privatePractitioner99@example.com',
        entityName: 'PrivatePractitioner',
        firmName: 'Bogus Barristers',
        name: 'Test Private Practitioner',
        representing: ['ef82f223-869d-46e9-abac-170a8fd3d86f'],
        role: 'privatePractitioner',
        serviceIndicator: 'Electronic',
        userId: 'a6318a31-8aa4-4002-a7b0-1192af19dbb9',
      },
      {
        barNumber: 'PT5432',
        contact: {
          address1: '234 Main St',
          address2: 'Apartment 4',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'privatePractitioner1@example.com',
        entityName: 'PrivatePractitioner',
        firmName: 'Bogus Barristers',
        name: 'Test Private Practitioner',
        representing: [
          '8767a0e0-3569-43ff-9221-fc4435f7b3bb',
          'ef82f223-869d-46e9-abac-170a8fd3d86f',
        ],
        role: 'privatePractitioner',
        serviceIndicator: 'Electronic',
        userId: 'ad07b846-8933-4778-9fe2-b5d8ac8ad728',
      },
    ],
    trialStatus: 'continued',
  },
  {
    caseTitle: 'Merritt Wong',
    docketNumber: '106-22',
    docketNumberWithSuffix: '106-22',
    inConsolidatedGroup: false,
    irsPractitioners: [
      {
        barNumber: 'RT6789',
        contact: {
          address1: '234 Main St',
          address2: 'Apartment 4',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'irsPractitioner@example.com',
        entityName: 'IrsPractitioner',
        name: 'Test IRS Practitioner',
        role: 'irsPractitioner',
        serviceIndicator: 'Electronic',
        userId: '5805d1ab-18d0-43ec-bafb-654e83405416',
      },
    ],
    leadCase: false,
    privatePractitioners: [
      {
        barNumber: 'PT9999',
        contact: {
          address1: '234 Bogus Ln',
          address2: 'Apartment 99',
          address3: 'Under the stairs',
          city: 'Chicago',
          countryType: 'domestic',
          phone: '+1 (555) 555-5555',
          postalCode: '61234',
          state: 'IL',
        },
        email: 'privatePractitioner99@example.com',
        entityName: 'PrivatePractitioner',
        firmName: 'Bogus Barristers',
        name: 'Test Private Practitioner',
        representing: ['8ee3bd2b-e640-4fad-b2ab-77c6a8ae34f6'],
        role: 'privatePractitioner',
        serviceIndicator: 'Electronic',
        userId: 'a6318a31-8aa4-4002-a7b0-1192af19dbb9',
      },
    ],
    userNotes:
      'Spicy jalapeno bacon ipsum dolor amet laborum nostrud eiusmod, ex drumstick quis eu dolore excepteur fatback. Qui sirloin andouille chuck. Jowl velit capicola quis elit meatloaf. Aute filet mignon boudin, sed pork belly nostrud do ball tip venison laboris incididunt consectetur fugiat. Consequat anim elit sirloin. Tail kevin incididunt biltong dolore tri-tip magna pork belly andouille prosciutto. Qui tempor eu aliqua deserunt drumstick chislic andouille boudin ribeye tail shoulder pork loin sirloin incididunt.',
  },
];

const FORMATTED_TRIAL_SESSION = {
  computedStatus: 'Open',
  endDateForAdditionalPageHeaders: 'Feb 10, 2023',
  formattedChambersPhoneNumber: '1234567',
  formattedCourtReporter: 'Test court report',
  formattedEstimatedEndDateFull: 'February 10, 2023',
  formattedIrsCalendarAdministrator: 'Test Irs Calendar Administrator',
  formattedJudge: 'Gustafson',
  formattedStartDateFull: 'January 26, 2023',
  formattedTerm: 'Winter 23',
  formattedTrialClerk: 'Test trial clerk',
  startDateForAdditionalPageHeaders: 'Jan 26, 2023',
  trialLocation: 'Washington, District of Columbia',
};

const SESSION_NOTES =
  'Bacon ipsum dolor amet bresaola sirloin capicola, prosciutto pork belly cupim fatback picanha ham meatball drumstick shankle turducken shank. Pork pork belly tail beef filet mignon burgdoggen pastrami porchetta shankle. T-bone ball tip kielbasa, capicola pork pork loin venison pork belly shank shoulder buffalo andouille hamburger sirloin. Rump drumstick pig beef filet mignon, shankle picanha. Rump pastrami meatball, ham pancetta prosciutto jerky pork belly ribeye tongue bacon. Turducken ham hock burgdoggen andouille beef ribs, pork belly fatback t-bone tail. Shank pork chop meatball brisket.\n\nChislic picanha burgdoggen drumstick kielbasa flank biltong chuck frankfurter jowl fatback shankle filet mignon. Bacon pancetta bresaola beef ribs. Bacon leberkas meatloaf sausage pig, turkey bresaola fatback flank pastrami. Meatloaf prosciutto pastrami filet mignon.';

module.exports = {
  FORMATTED_CASES,
  FORMATTED_TRIAL_SESSION,
  SESSION_NOTES,
};
