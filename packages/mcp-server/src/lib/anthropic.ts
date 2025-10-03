import { Anthropic } from '@anthropic-ai/sdk';
import type { Model } from '@anthropic-ai/sdk/resources/messages/messages.js';
import * as v from 'valibot';

// Valibot schemas for Batch API
export const summary_data_schema = v.object({
	generated_at: v.string(),
	model: v.string(),
	total_sections: v.number(),
	successful_summaries: v.number(),
	failed_summaries: v.number(),
	summaries: v.record(v.string(), v.string()),
	errors: v.optional(
		v.array(
			v.object({
				section: v.string(),
				error: v.string(),
			}),
		),
	),
	download_errors: v.optional(
		v.array(
			v.object({
				section: v.string(),
				error: v.string(),
			}),
		),
	),
});

export const anthropic_batch_request_schema = v.object({
	custom_id: v.string(),
	params: v.object({
		model: v.string(),
		max_tokens: v.number(),
		messages: v.array(
			v.object({
				role: v.union([v.literal('user'), v.literal('assistant')]),
				content: v.union([
					v.string(),
					v.array(
						v.object({
							type: v.string(),
							text: v.string(),
						}),
					),
				]),
			}),
		),
	}),
});

export const anthropic_batch_response_schema = v.object({
	id: v.string(),
	type: v.string(),
	processing_status: v.union([v.literal('in_progress'), v.literal('ended')]),
	request_counts: v.object({
		processing: v.number(),
		succeeded: v.number(),
		errored: v.number(),
		canceled: v.number(),
		expired: v.number(),
	}),
	ended_at: v.nullable(v.string()),
	created_at: v.string(),
	expires_at: v.string(),
	cancel_initiated_at: v.nullable(v.string()),
	results_url: v.nullable(v.string()),
});

export const anthropic_batch_result_schema = v.object({
	custom_id: v.string(),
	result: v.object({
		type: v.union([
			v.literal('succeeded'),
			v.literal('errored'),
			v.literal('canceled'),
			v.literal('expired'),
		]),
		message: v.optional(
			v.object({
				id: v.string(),
				type: v.string(),
				role: v.string(),
				model: v.string(),
				content: v.array(
					v.object({
						type: v.string(),
						text: v.string(),
					}),
				),
				stop_reason: v.string(),
				stop_sequence: v.nullable(v.string()),
				usage: v.object({
					input_tokens: v.number(),
					output_tokens: v.number(),
				}),
			}),
		),
		error: v.optional(
			v.object({
				type: v.string(),
				message: v.string(),
			}),
		),
	}),
});

// Export inferred types
export type SummaryData = v.InferOutput<typeof summary_data_schema>;
export type AnthropicBatchRequest = v.InferOutput<typeof anthropic_batch_request_schema>;
export type AnthropicBatchResponse = v.InferOutput<typeof anthropic_batch_response_schema>;
export type AnthropicBatchResult = v.InferOutput<typeof anthropic_batch_result_schema>;

export class AnthropicProvider {
	private client: Anthropic;
	private modelId: Model;
	private baseUrl: string;
	private apiKey: string;
	name = 'Anthropic';

	constructor(model_id: Model, api_key: string) {
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

	get_model_identifier(): Model {
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
