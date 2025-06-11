#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import {
	geocode,
	searchNearBy,
	FOOD_TYPES,
	CATEGORIES,
} from './amazonlocation';

import packagejson from '../package.json';

// Create an MCP server
const server = new McpServer({
	name: 'Amazon Location Service Geocoder',
	version: packagejson.version,
});

server.tool(
	'geocode',
	'You can search places by text.',
	{
		query: z.string().describe('Search query text'),
		language: z
			.string()
			.optional()
			.default('ja')
			.describe('Language code for results (default: ja)'),
	},
	async ({ query, language }) => {
		const geocodeResult = await geocode(query, language);

		if (geocodeResult.length === 0) {
			return {
				content: [
					{
						type: 'text',
						text: 'No geocoding results found',
					},
				],
			};
		}

		return {
			content: geocodeResult.map((result) => ({
				type: 'text',
				text: JSON.stringify(
					{
						address: result.Address?.Street || '',
						municipality: result.Address?.Municipality || '',
						region: result.Address?.Region || '',
						country: result.Address?.Country || '',
						postalCode: result.Address?.PostalCode || '',
						coordinates: result.Position,
						title: result.Title,
						placeId: result.PlaceId,
						placeType: result.PlaceType,
						distance: result.Distance,
					},
					null,
					2,
				),
			})),
		};
	},
);

// Amazon Location Serviceを使用して近くの場所を検索
server.tool(
	'searchNearby',
	'You can find places biased on geographic coordinates.',
	{
		latitude: z.number().describe('Latitude of the search center point'),
		longitude: z.number().describe('Longitude of the search center point'),
		radius: z
			.number()
			.min(1)
			.max(50000)
			.describe('Search radius in meters (1-50000)'),
		categories: z.array(z.enum(CATEGORIES)).optional(),
		foodtypes: z.array(z.enum(FOOD_TYPES)).optional(),
		language: z
			.string()
			.optional()
			.default('ja')
			.describe('Language code for results (default: ja)'),
	},
	async ({ latitude, longitude, radius, categories, foodtypes, language }) => {
		const searchResult = await searchNearBy(
			latitude,
			longitude,
			radius,
			categories,
			foodtypes,
			language,
		);

		if (searchResult.length === 0) {
			return {
				content: [
					{
						type: 'text',
						text: 'No nearby places found',
					},
				],
			};
		}

		return {
			content: searchResult.map((result) => ({
				type: 'text',
				text: JSON.stringify(
					{
						address: result.Address?.Street || '',
						municipality: result.Address?.Municipality || '',
						region: result.Address?.Region || '',
						country: result.Address?.Country || '',
						postalCode: result.Address?.PostalCode || '',
						coordinates: result.Position,
						title: result.Title,
						placeId: result.PlaceId,
						placeType: result.PlaceType,
						distance: result.Distance,
					},
					null,
					2,
				),
			})),
		};
	},
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
server.connect(transport);
