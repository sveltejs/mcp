import * as v from 'valibot';

export const documentation_sections_schema = v.record(
	v.string(),
	v.object({
		metadata: v.object({
			title: v.string(),
			use_cases: v.optional(v.string()),
		}),
		slug: v.string(),
	}),
);

// Valibot schemas for Batch API
export const summary_data_schema = v.object({
	generated_at: v.string(),
	model: v.string(),
	total_sections: v.number(),
	successful_summaries: v.number(),
	summaries: v.record(v.string(), v.string()),
	content_hashes: v.record(v.string(), v.string()),
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
