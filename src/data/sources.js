// Central list of every external data source used by the app, rendered on
// the /sources page. Kept as data (not scattered strings) so it's easy to
// audit and update as the app's API usage changes.
export const SOURCES = [
  {
    name: 'NASA EONET',
    fullName: 'Earth Observatory Natural Event Tracker',
    provides: 'Currently open natural events worldwide — wildfires, severe storms, volcanoes, landslides, floods, drought, and more — each with category, title, coordinates, and a source link.',
    usedIn: 'Map markers (Explore page), Live Events feed, and nearby-event lookups in the Location Analysis panel and Compare page.',
    docsUrl: 'https://eonet.gsfc.nasa.gov/docs/v3',
    limitations: 'Only tracks a curated set of significant events, not every local incident. Coordinates for tracked events (e.g. storms) reflect the most recent reported position, which can lag real time. No severity/magnitude scale is provided.',
  },
  {
    name: 'USGS Earthquake Hazards Program',
    fullName: 'USGS Earthquake GeoJSON Feeds & FDSN Event Web Service',
    provides: 'Earthquake location, magnitude, depth, and time, from rolling feeds (day/week/month) and a queryable historical/geographic search API.',
    usedIn: 'Map markers, Live Events feed, nearby-earthquake lookups and magnitude history charts in the Location Analysis and Compare pages.',
    docsUrl: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php',
    limitations: 'Global feeds are dominated by very small, frequent earthquakes below magnitude 2.5 in seismically active regions; the app filters by a minimum magnitude for location queries to keep results meaningful. Detection sensitivity varies by region and monitoring network density.',
  },
  {
    name: 'Open-Meteo',
    fullName: 'Open-Meteo Forecast & Historical Weather API',
    provides: 'Current weather conditions (temperature, precipitation, wind, WMO weather code), a 7-day forecast, and multi-year daily historical weather.',
    usedIn: 'Current Conditions panel, heat/flood exposure scoring, and the 5-year temperature trend chart.',
    docsUrl: 'https://open-meteo.com/en/docs',
    limitations: 'Forecast-model based rather than direct station observations in many areas; accuracy varies with model resolution and region. Historical archive data ends a few days before the present.',
  },
  {
    name: 'Open-Meteo Geocoding API',
    fullName: 'Open-Meteo Geocoding API',
    provides: 'Converts a searched place name into coordinates, plus administrative region and country metadata.',
    usedIn: 'The location search bar used across Explore, Compare, and Events pages.',
    docsUrl: 'https://open-meteo.com/en/docs/geocoding-api',
    limitations: 'Coverage and naming can be inconsistent for very small towns or ambiguous place names; results are ranked by the provider\'s own relevance heuristics.',
  },
  {
    name: 'BigDataCloud Reverse Geocoding',
    fullName: 'BigDataCloud Free Reverse Geocode (Client) API',
    provides: 'Converts a clicked map coordinate back into a readable place name (city, region, country).',
    usedIn: 'Clicking directly on the map in the Explore page.',
    docsUrl: 'https://www.bigdatacloud.com/docs/api/free-reverse-geocode-to-city-api',
    limitations: 'Free tier is rate-limited and may not resolve remote or ocean coordinates to a named place; the app falls back to showing raw coordinates in that case.',
  },
  {
    name: 'OpenStreetMap',
    fullName: 'OpenStreetMap Standard Tile Layer',
    provides: 'The base map tiles rendered by Leaflet. Rendered in a dark theme via a CSS filter applied on top of the standard free tiles.',
    usedIn: 'The interactive map on every page that shows a map.',
    docsUrl: 'https://operations.osmfoundation.org/policies/tiles/',
    limitations: 'The public OSM tile server is a shared community resource with a usage policy (no heavy/bulk traffic, must show attribution); production apps at scale should switch to a paid tile provider or self-hosted tiles.',
  },
]
