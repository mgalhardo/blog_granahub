/**
 * fetch-analytics.mjs
 * 
 * Busca dados reais do Google Analytics 4 e Google Search Console
 * usando uma Service Account. Roda em tempo de build (GitHub Actions).
 * Se falhar, grava dados de fallback para o build não quebrar.
 */

import { google } from 'googleapis';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'analytics.json');

// --- CONFIG ---
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const SEARCH_CONSOLE_SITE_URL = process.env.SEARCH_CONSOLE_SITE_URL || 'https://blog.granahub.com.br/';
const SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

// --- FALLBACK DATA ---
const FALLBACK_DATA = {
  generatedAt: new Date().toISOString(),
  isReal: false,
  ga4: {
    totalUsers: 0,
    sessions: 0,
    pageViews: 0,
    avgSessionDurationSeconds: 0,
    usersChange: 0,
    pageViewsChange: 0,
    durationChange: 0,
    topPages: [],
  },
  searchConsole: {
    impressions: 0,
    clicks: 0,
    ctr: 0,
    position: 0,
    topQueries: [],
  },
};

function saveData(data) {
  const dir = path.dirname(OUTPUT_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Analytics data saved to ${OUTPUT_PATH}`);
}

async function getAuthClient() {
  if (!SERVICE_ACCOUNT_JSON) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON env var not set or empty');
  }

  try {
    const credentials = JSON.parse(SERVICE_ACCOUNT_JSON);
    console.log('🔑 Service Account JSON parsed successfully.');
    
    if (!credentials.client_email || !credentials.private_key) {
      throw new Error('Service Account JSON is missing client_email or private_key');
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/webmasters.readonly',
      ],
    });

    return auth;
  } catch (err) {
    throw new Error(`Failed to initialize Google Auth: ${err.message}`);
  }
}

async function fetchGA4Data(auth) {
  if (!GA4_PROPERTY_ID) {
    console.warn('⚠️  GA4_PROPERTY_ID not set, skipping GA4 data');
    return FALLBACK_DATA.ga4;
  }

  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

  // Buscar métricas gerais dos últimos 30 dias
  const response = await analyticsData.properties.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
      ],
    },
  });

  const row = response.data.rows?.[0]?.metricValues || [];
  const totalUsers = parseInt(row[0]?.value || '0');
  const sessions = parseInt(row[1]?.value || '0');
  const pageViews = parseInt(row[2]?.value || '0');
  const avgSessionDurationSeconds = parseFloat(row[3]?.value || '0');

  console.log(`📊 GA4: ${totalUsers} users, ${sessions} sessions, ${pageViews} pageViews`);

  // Buscar top 10 páginas
  const topPagesResponse = await analyticsData.properties.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    },
  });

  const topPages = (topPagesResponse.data.rows || []).map(r => ({
    path: r.dimensionValues?.[0]?.value || '',
    title: r.dimensionValues?.[1]?.value || '',
    views: parseInt(r.metricValues?.[0]?.value || '0'),
  }));

  console.log(`📊 GA4 top pages: ${topPages.length} pages found`);

  // Buscar dados de períodos para calcular variação
  const comparisonResponse = await analyticsData.properties.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [
        { startDate: '30daysAgo', endDate: 'today', name: 'current' },
        { startDate: '60daysAgo', endDate: '31daysAgo', name: 'previous' },
      ],
      metrics: [
        { name: 'totalUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
      ],
    },
  });

  const compRows = comparisonResponse.data.rows || [];
  const currentRow = compRows.find(r => r.dimensionValues?.[0]?.value === 'date_range_0')?.metricValues 
    || compRows[0]?.metricValues || [];
  const previousRow = compRows.find(r => r.dimensionValues?.[0]?.value === 'date_range_1')?.metricValues 
    || compRows[1]?.metricValues || [];

  function calcChange(current, previous) {
    const c = parseFloat(current || '0');
    const p = parseFloat(previous || '1'); // avoid division by zero
    if (p === 0) return 0;
    return ((c - p) / p) * 100;
  }

  const usersChange = calcChange(currentRow[0]?.value, previousRow[0]?.value);
  const pageViewsChange = calcChange(currentRow[1]?.value, previousRow[1]?.value);
  const durationChange = calcChange(currentRow[2]?.value, previousRow[2]?.value);

  return {
    totalUsers,
    sessions,
    pageViews,
    avgSessionDurationSeconds,
    usersChange: Math.round(usersChange * 10) / 10,
    pageViewsChange: Math.round(pageViewsChange * 10) / 10,
    durationChange: Math.round(durationChange * 10) / 10,
    topPages,
  };
}

async function fetchSearchConsoleData(auth) {
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() - 3); // SC data has 3-day delay
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 30);

  const formatDate = (d) => d.toISOString().split('T')[0];

  try {
    const response = await searchconsole.searchanalytics.query({
      siteUrl: SEARCH_CONSOLE_SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: [],
      },
    });

    const row = response.data.rows?.[0] || {};
    const impressions = Math.round(row.impressions || 0);
    const clicks = Math.round(row.clicks || 0);
    const ctr = Math.round((row.ctr || 0) * 1000) / 10; // convert to percentage, 1 decimal
    const position = Math.round((row.position || 0) * 10) / 10;

    console.log(`🔍 Search Console: ${impressions} impressions, ${clicks} clicks, ${ctr}% CTR`);

    // Buscar top queries
    const queriesResponse = await searchconsole.searchanalytics.query({
      siteUrl: SEARCH_CONSOLE_SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query'],
        rowLimit: 10,
      },
    });

    const topQueries = (queriesResponse.data.rows || []).map(r => ({
      query: r.keys?.[0] || '',
      clicks: Math.round(r.clicks || 0),
      impressions: Math.round(r.impressions || 0),
      ctr: Math.round((r.ctr || 0) * 1000) / 10,
      position: Math.round((r.position || 0) * 10) / 10,
    }));

    return { impressions, clicks, ctr, position, topQueries };
  } catch (err) {
    console.warn(`⚠️  Search Console API error: ${err.message}`);
    return { ...FALLBACK_DATA.searchConsole, topQueries: [] };
  }
}

// --- MAIN ---
async function main() {
  console.log('🚀 Fetching analytics data...\n');

  if (!SERVICE_ACCOUNT_JSON) {
    console.warn('⚠️  GOOGLE_SERVICE_ACCOUNT_JSON not set. Using fallback data.');
    console.warn('   This is normal for local builds. Configure the secret in GitHub Actions.\n');
    saveData(FALLBACK_DATA);
    return;
  }

  try {
    const auth = await getAuthClient();
    
    const [ga4, searchConsole] = await Promise.all([
      fetchGA4Data(auth),
      fetchSearchConsoleData(auth),
    ]);

    const data = {
      generatedAt: new Date().toISOString(),
      isReal: true,
      ga4,
      searchConsole,
    };

    saveData(data);
    console.log('\n🎉 Real analytics data fetched successfully!');
  } catch (err) {
    console.error(`❌ Failed to fetch analytics: ${err.message}`);
    console.warn('   Falling back to empty data so build can proceed.\n');
    saveData(FALLBACK_DATA);
  }
}

main();
