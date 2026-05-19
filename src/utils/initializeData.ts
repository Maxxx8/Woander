import { QuotesService } from '../services/quotesService';
import { MediaService } from '../services/mediaService';

export async function initializeAppData() {
  try {
    console.log('Initializing app data...');

    console.log('Seeding quotes to database...');
    await QuotesService.seedQuotesToDatabase();

    console.log('App data initialization complete!');
  } catch (error) {
    console.error('Error initializing app data:', error);
  }
}

export async function fetchMediaLibrary() {
  try {
    console.log('Fetching media from APIs...');
    await MediaService.fetchAndCacheMedia();
    console.log('Media library updated!');
  } catch (error) {
    console.error('Error fetching media library:', error);
  }
}
