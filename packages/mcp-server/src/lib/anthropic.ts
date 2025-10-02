import { Anthropic } from '@anthropic-ai/sdk';

// Batch API interfaces
export interface AnthropicBatchRequest {
	custom_id: string;
	params: {
		model: string;
		max_tokens: number;
		messages: {
			role: 'user' | 'assistant';
			content: string | { type: string; text: string }[];
		}[];
		[key: string]: unknown;
	};
}

export interface AnthropicBatchResponse {
	id: string;
	type: string;
	processing_status: 'in_progress' | 'ended';
	request_counts: {
		processing: number;
		succeeded: number;
		errored: number;
		canceled: number;
		expired: number;
	};
	ended_at: string | null;
	created_at: string;
	expires_at: string;
	cancel_initiated_at: string | null;
	results_url: string | null;
}

export interface AnthropicBatchResult {
	custom_id: string;
	result: {
		type: 'succeeded' | 'errored' | 'canceled' | 'expired';
		message?: {
			id: string;
			type: string;
			role: string;
			model: string;
			content: {
				type: string;
				text: string;
			}[];
			stop_reason: string;
			stop_sequence: string | null;
			usage: {
				input_tokens: number;
				output_tokens: number;
			};
		};
		error?: {
			type: string;
			message: string;
		};
	};
}

export class AnthropicProvider {
	private client: Anthropic;
	private modelId: string;
	private baseUrl: string;
	private apiKey: string;
	name = 'Anthropic';

	constructor(model_id: string, api_key: string) {
		if (!api_key) {
			throw new Error('ANTHROPIC_API_KEY is required');
		}
		this.apiKey = api_key;
		this.client = new Anthropic({ apiKey: api_key, timeout: 1800000 });
		this.modelId = model_id;
		this.baseUrl = 'https://api.anthropic.com/v1';
	}

	get_client(): Anthropic {
		return this.client;
	}

	get_model_identifier(): string {
		return this.modelId;
	}

	async create_batch(requests: AnthropicBatchRequest[]): Promise<AnthropicBatchResponse> {
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

			return await response.json();
		} catch (error) {
			console.error('Error creating batch with Anthropic:', error);
			throw new Error(
				`Failed to create batch: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	async get_batch_status(
		batch_id: string,
		max_retries = 10,
		retry_delay = 30000,
	): Promise<AnthropicBatchResponse> {
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

				return await response.json();
			} catch (error) {
				retry_count++;

				if (retry_count > max_retries) {
					console.error(
						`Error getting batch status for ${batch_id} after ${max_retries} retries:`,
						error,
					);
					throw new Error(
						`Failed to get batch status after ${max_retries} retries: ${
							error instanceof Error ? error.message : String(error)
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

	async get_batch_results(results_url: string): Promise<AnthropicBatchResult[]> {
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
			const results: AnthropicBatchResult[] = text
				.split('\n')
				.filter((line) => line.trim())
				.map((line) => JSON.parse(line));

			return results;
		} catch (error) {
			console.error(`Error getting batch results:`, error);
			throw new Error(
				`Failed to get batch results: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
}
