import { Anthropic } from '@anthropic-ai/sdk';
import type { Model } from '@anthropic-ai/sdk/resources/messages/messages.js';
import * as v from 'valibot';
import {
	anthropic_batch_response_schema,
	anthropic_batch_result_schema,
	type AnthropicBatchRequest,
} from './schemas.js';

export class AnthropicProvider {
	private client: Anthropic;
	private modelId: Model;
	private baseUrl: string;
	private apiKey: string;
	name = 'Anthropic';

	constructor(model_id: Model, api_key: string, base_url: string = 'https://api.anthropic.com/v1') {
		if (!api_key) {
			throw new Error('ANTHROPIC_API_KEY is required');
		}
		this.apiKey = api_key;
		this.modelId = model_id;
		// Remove trailing slash if present to prevent double slashes in URLs
		this.baseUrl = base_url.replace(/\/$/, '');

		this.client = new Anthropic({
			apiKey: api_key,
			timeout: 1800000,
			baseURL: this.baseUrl,
		});
	}

	get_client(): Anthropic {
		return this.client;
	}

	get_model_identifier(): Model {
		return this.modelId;
	}

	async create_batch(requests: AnthropicBatchRequest[]) {
		try {
			const response = await fetch(`${this.baseUrl}/messages/batches`, {
				method: 'POST',
				headers: {
					'x-api-key': this.apiKey,
					'anthropic-version': '2023-06-01',
					'content-type': 'application/json',
				},
				body: JSON.stringify({ requests }),
			});

			if (!response.ok) {
				const error_text = await response.text();
				throw new Error(
					`Failed to create batch: ${response.status} ${response.statusText} - ${error_text}`,
				);
			}

			const json_data = await response.json();
			const validated_response = v.safeParse(anthropic_batch_response_schema, json_data);

			if (!validated_response.success) {
				throw new Error(
					`Invalid batch response from Anthropic API: ${JSON.stringify(validated_response.issues)}`,
				);
			}

			return validated_response.output;
		} catch (error) {
			console.error('Error creating batch with Anthropic:', error);
			throw new Error(
				`Failed to create batch: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	async get_batch_status(batch_id: string, max_retries = 10, retry_delay = 30000) {
		let retry_count = 0;

		while (retry_count <= max_retries) {
			try {
				const response = await fetch(`${this.baseUrl}/messages/batches/${batch_id}`, {
					method: 'GET',
					headers: {
						'x-api-key': this.apiKey,
						'anthropic-version': '2023-06-01',
					},
				});

				if (!response.ok) {
					const error_text = await response.text();
					throw new Error(
						`Failed to get batch status: ${response.status} ${response.statusText} - ${error_text}`,
					);
				}

				const json_data = await response.json();
				const validated_response = v.safeParse(anthropic_batch_response_schema, json_data);

				if (!validated_response.success) {
					throw new Error(
						`Invalid batch status response from Anthropic API: ${JSON.stringify(validated_response.issues)}`,
					);
				}

				return validated_response.output;
			} catch (error) {
				retry_count++;

				if (retry_count > max_retries) {
					console.error(
						`Error getting batch status for ${batch_id} after ${max_retries} retries:`,
						error,
					);
					throw new Error(
						`Failed to get batch status after ${max_retries} retries: ${error instanceof Error ? error.message : String(error)
						}`,
					);
				}

				console.warn(
					`Error getting batch status for ${batch_id} (attempt ${retry_count}/${max_retries}):`,
					error,
				);
				console.log(`Retrying in ${retry_delay / 1000} seconds...`);

				await new Promise((resolve) => setTimeout(resolve, retry_delay));
			}
		}

		// This should never be reached due to the throw in the catch block, but TypeScript needs a return
		throw new Error(`Failed to get batch status for ${batch_id} after ${max_retries} retries`);
	}

	async get_batch_results(results_url: string) {
		try {
			const response = await fetch(results_url, {
				method: 'GET',
				headers: {
					'x-api-key': this.apiKey,
					'anthropic-version': '2023-06-01',
				},
			});

			if (!response.ok) {
				const error_text = await response.text();
				throw new Error(
					`Failed to get batch results: ${response.status} ${response.statusText} - ${error_text}`,
				);
			}

			const text = await response.text();
			// Parse JSONL format (one JSON object per line)
			const parsed_results = text
				.split('\n')
				.filter((line) => line.trim())
				.map((line) => JSON.parse(line));

			// Validate all results
			const validated_results = v.safeParse(v.array(anthropic_batch_result_schema), parsed_results);

			if (!validated_results.success) {
				throw new Error(
					`Invalid batch results from Anthropic API: ${JSON.stringify(validated_results.issues)}`,
				);
			}

			return validated_results.output;
		} catch (error) {
			console.error(`Error getting batch results:`, error);
			throw new Error(
				`Failed to get batch results: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
}
