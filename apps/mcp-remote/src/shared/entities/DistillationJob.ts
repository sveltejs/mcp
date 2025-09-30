import { Entity, Fields } from 'remult';
import { Relations } from 'remult';
import { Distillation } from './Distillation.js';

@Entity<DistillationJob>('distillation_jobs', {
	allowApiCrud: true,
	dbName: 'distillation_jobs',
})
export class DistillationJob {
	@Fields.integer()
	id!: number;

	@Fields.string()
	preset_name!: string;

	@Fields.string({ allowNull: true })
	batch_id?: string;

	@Fields.string()
	status!: string;

	@Fields.string()
	model_used!: string;

	@Fields.integer()
	total_files!: number;

	@Fields.integer()
	processed_files = 0;

	@Fields.integer()
	successful_files = 0;

	@Fields.boolean()
	minimize_applied = false;

	@Fields.integer()
	total_input_tokens = 0;

	@Fields.integer()
	total_output_tokens = 0;

	@Fields.integer({ allowNull: true })
	started_at?: number;

	@Fields.integer({ allowNull: true })
	completed_at?: number;

	@Fields.string({ allowNull: true })
	error_message?: string;

	@Fields.string()
	metadata = '{}';

	@Fields.integer()
	created_at!: number;

	@Fields.integer()
	updated_at!: number;

	// Relations toMany
	@Relations.toMany(() => Distillation)
	distillations?: Distillation[];
}
