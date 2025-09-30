import { Entity, Fields } from 'remult';
import { FieldVector } from '../FieldVector';

@Entity<ContentDistilled>('content_distilled', {
	allowApiCrud: true,
	dbName: 'content_distilled',
})
export class ContentDistilled {
	@Fields.integer()
	id!: number;

	@Fields.string()
	path!: string;

	@Fields.string()
	filename!: string;

	@Fields.string()
	content!: string;

	@Fields.integer()
	size_bytes!: number;

	@FieldVector({ allowNull: true })
	embeddings: number[] | null = null;

	@Fields.string()
	metadata = '{}';

	@Fields.integer()
	created_at!: number;

	@Fields.integer()
	updated_at!: number;
}
