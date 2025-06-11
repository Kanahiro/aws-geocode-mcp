import { z } from 'zod';
import { CATEGORIES } from './categories';
import { FOOD_TYPES } from './foodtypes';

const apikey = process.env.AMAZON_LOCATION_API_KEY ?? '';
const region = process.env.AWS_REGION ?? 'ap-northeast-1';

interface PlaceResult {
	PlaceId: string;
	PlaceType: string;
	Title: string;
	Address: any;
	Position: any[];
	Distance: number;
	Categories: (typeof CATEGORIES)[number][];
}

interface SearchPlaceResponse {
	ResultItems: PlaceResult[];
}

async function geocode(query: string, language: string = 'ja') {
	try {
		// Construct the endpoint URL
		const endpoint = `https://places.geo.${region}.amazonaws.com/v2/geocode?key=${apikey}`;

		// Prepare the request payload
		const payload = {
			QueryText: query,
			MaxResults: 5,
			Language: language,
		};

		// Make the HTTP POST request
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = (await response.json()) as SearchPlaceResponse;

		if (!data.ResultItems || data.ResultItems.length === 0) {
			return [] satisfies PlaceResult[];
		}

		return data.ResultItems;
	} catch (error) {
		console.error('Geocoding error:', error);
		return [] satisfies PlaceResult[];
	}
}

async function searchNearBy(
	latitude: number,
	longitude: number,
	radius: number,
	categories: (typeof CATEGORIES)[number][] = [],
	foodtypes: (typeof FOOD_TYPES)[number][] = [],
	language: string = 'ja',
) {
	try {
		const endpoint = `https://places.geo.${region}.amazonaws.com/v2/search-nearby?key=${apikey}`;

		const payload = {
			QueryPosition: [longitude, latitude],
			MaxResults: 20,
			QueryRadius: radius,
			Language: language,
			Filter: {
				IncludeCategories: categories.length > 0 ? categories : undefined,
				IncludeFoodTypes: foodtypes.length > 0 ? foodtypes : undefined,
			},
		};

		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = (await response.json()) as SearchPlaceResponse;

		if (!data.ResultItems || data.ResultItems.length === 0) {
			return [] satisfies PlaceResult[];
		}

		return data.ResultItems;
	} catch (error) {
		console.error('Search nearby error:', error);
		return [] satisfies PlaceResult[];
	}
}

export { geocode, searchNearBy, PlaceResult, SearchPlaceResponse };
