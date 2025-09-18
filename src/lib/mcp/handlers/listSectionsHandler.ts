export const listSectionsHandler = async (): Promise<{
	content: Array<{ type: 'text'; text: string }>;
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
