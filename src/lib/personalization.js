import { fetchFollowedCities } from './cityFollows';

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

export async function getPreferredCities() {
  const preferred = new Set();

  try {
    const pinnedCity = localStorage.getItem('pinnedCity');
    if (pinnedCity) {
      preferred.add(normalize(pinnedCity));
    }
  } catch {
    // Ignore local storage failures and continue with backend follows.
  }

  try {
    const followedCities = await fetchFollowedCities();
    followedCities.forEach((city) => {
      const normalized = normalize(city);
      if (normalized) {
        preferred.add(normalized);
      }
    });
  } catch {
    // Follow state is optional for anonymous/public users.
  }

  return [...preferred];
}

export function prioritizeStoriesByCities(items = [], preferredCities = []) {
  if (!Array.isArray(items) || preferredCities.length === 0) {
    return Array.isArray(items) ? items : [];
  }

  const preferredSet = new Set(preferredCities.map(normalize).filter(Boolean));

  return [...items].sort((left, right) => {
    const leftPriority = preferredSet.has(normalize(left?.city)) ? 1 : 0;
    const rightPriority = preferredSet.has(normalize(right?.city)) ? 1 : 0;

    if (leftPriority !== rightPriority) {
      return rightPriority - leftPriority;
    }

    return 0;
  });
}

export function prioritizeHomeData(homeData, preferredCities = []) {
  if (!homeData || preferredCities.length === 0) {
    return homeData;
  }

  const prioritizedCenterNews = prioritizeStoriesByCities(homeData.centerNews || [], preferredCities);
  const prioritizedCenterHero = homeData.centerHero && preferredCities.includes(normalize(homeData.centerHero.city))
    ? homeData.centerHero
    : homeData.centerHero;

  return {
    ...homeData,
    items: prioritizeStoriesByCities(homeData.items || [], preferredCities),
    latestNews: prioritizeStoriesByCities(homeData.latestNews || [], preferredCities),
    centerHero: prioritizedCenterHero,
    centerNews: prioritizedCenterNews,
    breakingNews: prioritizeStoriesByCities(homeData.breakingNews || [], preferredCities),
    cityNews: prioritizeStoriesByCities(homeData.cityNews || [], preferredCities),
    electionCards: prioritizeStoriesByCities(homeData.electionCards || [], preferredCities),
    featureSections: {
      ...(homeData.featureSections || {}),
      business: prioritizeStoriesByCities(homeData.featureSections?.business || [], preferredCities),
      editorial: prioritizeStoriesByCities(homeData.featureSections?.editorial || [], preferredCities),
    },
    trioSections: Array.isArray(homeData.trioSections)
      ? homeData.trioSections.map((section) => ({
          ...section,
          items: prioritizeStoriesByCities(section.items || [], preferredCities),
        }))
      : [],
    customSections: Array.isArray(homeData.customSections)
      ? homeData.customSections.map((section) => ({
          ...section,
          items: prioritizeStoriesByCities(section.items || [], preferredCities),
        }))
      : [],
  };
}
