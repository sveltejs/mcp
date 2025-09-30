import { Fields, type FieldOptions } from 'remult';

export function FieldVector<entityType = unknown>(
	...options: (FieldOptions<entityType, number[]> & { dimensions?: number })[]
) {
	const dimensions = options[0].dimensions ?? 1024;

	return Fields.object<entityType, number[]>(
		{
			valueConverter: {
				fieldTypeInDb: `F32_BLOB(${dimensions})`,
				toDb: (val) => JSON.stringify(val),
				toDbSql: (val) => `vector32(${val})`,
				fromDb: (val: Buffer) => Array.from(new Float32Array(val)),
			},
		},
		...options,
	);
}
