export const listSectionsHandler = async (): Promise<{
	content: Array<{ type: string; text: string }>;
}> => {
	return {
		content: [
			{
				type: 'text',
				text: 'tool list_sections called',
			},
		],
	};
};
