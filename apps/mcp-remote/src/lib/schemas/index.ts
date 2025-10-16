import * as v from 'valibot';

// not the full schema but it contains the information we need
export const github_webhook_schema = v.object({
	action: v.union([v.literal('closed')]),
	pull_request: v.object({
		patch_url: v.string(),
		merged: v.boolean(),
		user: v.object({
			login: v.string(),
		}),
	}),
});

export const github_content_schema = v.object({
	name: v.string(),
	path: v.string(),
	sha: v.string(),
	size: v.number(),
	url: v.string(),
	html_url: v.string(),
	git_url: v.string(),
	download_url: v.nullable(v.string()),
	type: v.literal('file'),
	content: v.string(),
	encoding: v.literal('base64'),
	_links: v.object({
		self: v.string(),
		git: v.string(),
		html: v.string(),
	}),
});
