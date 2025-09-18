export const getDocumentationHandler = async ({
	section,
}: {
	section: string | string[] | unknown;
}): Promise<{
	content: Array<{ type: string; text: string }>;
}> => {
	// Parse sections with error checking
	let sections: string[];
	
	if (Array.isArray(section)) {
		sections = section.filter((s): s is string => typeof s === 'string');
	} else if (
		typeof section === 'string' &&
		section.trim().startsWith('[') &&
		section.trim().endsWith(']')
	) {
		// Try to parse JSON string array
		try {
			const parsed = JSON.parse(section);
			if (Array.isArray(parsed)) {
				sections = parsed.filter((s): s is string => typeof s === 'string');
			} else {
				sections = [section];
			}
		} catch (parseError) {
			// JSON parse failed, treat as single string
			sections = [section];
		}
	} else if (typeof section === 'string') {
		sections = [section];
	} else {
		// Fallback for unexpected input
		sections = [];
	}

	// Return formatted message
	const sectionsList = sections.length > 0 
		? sections.join(', ') 
		: 'no sections';

	return {
		content: [
			{
				type: 'text',
				text: `called for sections: ${sectionsList}`,
			},
		],
	};
};
