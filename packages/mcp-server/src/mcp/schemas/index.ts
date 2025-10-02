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
