import { Entity, Field, Fields } from "remult"
import { Relations } from "remult"
import { DistillationJob } from "./DistillationJob.js"

@Entity<Distillation>("distillations", {
  allowApiCrud: true,
  dbName: "distillations",
})
export class Distillation {
  @Fields.integer()
  id!: number

  @Fields.string()
  preset_name!: string

  @Fields.string()
  version!: string

  @Fields.string()
  content!: string

  @Fields.integer()
  size_kb!: number

  @Fields.integer()
  document_count!: number

  @Fields.integer({ allowNull: true })
  distillation_job_id?: number

  @Relations.toOne(() => DistillationJob, { field: "distillation_job_id" })
  distillation_job?: DistillationJob

  @Fields.integer()
  created_at!: number
}
