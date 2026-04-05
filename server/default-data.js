export function createDefaultStoreData() {
  const states = [
    { id: 1, name: 'उत्तर प्रदेश', slug: 'uttar-pradesh' },
    { id: 2, name: 'दिल्ली', slug: 'delhi' },
    { id: 3, name: 'बिहार', slug: 'bihar' },
    { id: 4, name: 'राजस्थान', slug: 'rajasthan' },
  ];

  const districts = [
    { id: 1, stateId: 1, name: 'लखनऊ', slug: 'lucknow-district' },
    { id: 2, stateId: 2, name: 'नई दिल्ली', slug: 'new-delhi' },
    { id: 3, stateId: 3, name: 'पटना', slug: 'patna-district' },
    { id: 4, stateId: 4, name: 'जयपुर', slug: 'jaipur-district' },
  ];

  const cities = [
    { id: 1, districtId: 1, name: 'लखनऊ', slug: 'lucknow', lat: 26.8467, lng: 80.9462 },
    { id: 2, districtId: 2, name: 'दिल्ली', slug: 'delhi-city', lat: 28.6139, lng: 77.2090 },
    { id: 3, districtId: 3, name: 'पटना', slug: 'patna', lat: 25.5941, lng: 85.1376 },
    { id: 4, districtId: 4, name: 'जयपुर', slug: 'jaipur', lat: 26.9124, lng: 75.7873 },
  ];

  const categories = [
    { id: 1, name: 'देश', slug: 'desh', sortOrder: 1 },
    { id: 2, name: 'राजनीति', slug: 'rajniti', sortOrder: 2 },
    { id: 3, name: 'वर्ल्ड', slug: 'world', sortOrder: 3 },
    { id: 4, name: 'बिजनेस', slug: 'business', sortOrder: 4 },
    { id: 5, name: 'संपादकीय', slug: 'editorial', sortOrder: 5 },
    { id: 6, name: 'क्रिकेट', slug: 'cricket', sortOrder: 6 },
    { id: 7, name: 'उत्तर प्रदेश', slug: 'uttar-pradesh-news', sortOrder: 7 },
    { id: 8, name: 'दिल्ली', slug: 'delhi-news', sortOrder: 8 },
    { id: 9, name: 'बिहार', slug: 'bihar-news', sortOrder: 9 },
    { id: 10, name: 'टेक', slug: 'tech', sortOrder: 10 },
    { id: 11, name: 'मनोरंजन', slug: 'entertainment', sortOrder: 11 },
  ];

  const slotDefinitions = [
    { slot: 'center-hero', label: 'मुख्य शीर्षक', section: 'मुख्य समाचार', single: true },
    { slot: 'latest', label: 'ताज़ा खबरें', section: 'ताज़ा खबरें' },
    { slot: 'center', label: 'मुख्य समाचार', section: 'मुख्य समाचार' },
    { slot: 'breaking', label: 'ब्रेकिंग न्यूज़', section: 'ब्रेकिंग न्यूज़' },
    { slot: 'city', label: 'खबरें आपके शहर की', section: 'शहर' },
    { slot: 'election', label: 'विधानसभा चुनाव', section: 'चुनाव' },
    { slot: 'business', label: 'बिजनेस', section: 'बिजनेस' },
    { slot: 'editorial', label: 'संपादकीय', section: 'संपादकीय' },
    { slot: 'cricket-hero', label: 'क्रिकेट हेडलाइन', section: 'क्रिकेट', single: true },
    { slot: 'cricket-story', label: 'क्रिकेट स्टोरी', section: 'क्रिकेट' },
    { slot: 'trio-national', label: 'राष्ट्रीय न्यूज़', section: 'मुख्य वर्ग' },
    { slot: 'trio-politics', label: 'पॉलिटिक्स', section: 'मुख्य वर्ग' },
    { slot: 'trio-world', label: 'दुनिया', section: 'मुख्य वर्ग' },
  ];

  return {
    config: {
      trending: true,
      latest: true,
      center: true,
      breaking: true,
      city: true,
      election: true,
      business: true,
      editorial: true,
      cricket: true,
      shorts: true,
      trio: true,
      show_article_suggestions: true,
      show_article_latest_news: true,
      siteNamePrimary: 'प्रथम एजेंडा',
      siteNameSecondary: 'NEWS',
      siteTagline: 'सच आईने की तरह...',
      footerCopyright: '© 2026 प्रथम एजेंडा न्यूज़. सर्वाधिकार सुरक्षित.',
      facebook_url: '',
      twitter_url: '',
      whatsapp_number: '',
      support_email: '',
      meta_description: '',
      labels: {
        latest: 'ताज़ा खबरें',
        center: 'मुख्य समाचार',
        breaking: 'ब्रेकिंग न्यूज़',
        city: 'खबरें आपके शहर की',
        election: 'विधानसभा चुनाव',
        business: 'बिजनेस',
        editorial: 'संपादकीय',
        cricket: 'क्रिकेट',
        shorts: 'शॉर्ट वीडियो',
        trio: 'मुख्य वर्ग',
      },
    },
    users: [
      { id: 1, username: 'admin', email: 'admin@prathamagenda.local', password: 'admin123', role: 'admin', assignedCityId: null },
      { id: 2, username: 'editor', email: 'editor@prathamagenda.local', password: 'editor123', role: 'editor', assignedCityId: 1 },
      { id: 3, username: 'reporter', email: 'reporter@prathamagenda.local', password: 'reporter123', role: 'reporter', assignedCityId: 3 },
    ],
    passwordResetTokens: [],
    categories,
    tags: [],
    trendingTopics: [],
    electionTabs: [],
    cricketPointsTable: [],
    slotDefinitions,
    locations: { states, districts, cities },
    articles: [],
    shorts: [],
  };
}
