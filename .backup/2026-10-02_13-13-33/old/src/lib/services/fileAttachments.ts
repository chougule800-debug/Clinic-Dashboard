import { supabase } from '../supabase';
import { handle, requireUser, ServiceError } from './base';
import type { Tables, AttachmentEntity } from '../database.types';

export type FileAttachmentRow = Tables<'file_attachments'>;

export const STORAGE_BUCKET = 'clinical-attachments';

export const fileAttachmentService = {
  /**
   * Upload a file to Supabase Storage. If shareTokenId is provided, it will be
   * stored under the `share/<tokenId>/` prefix used for anonymous patient uploads.
   * Otherwise, it will be stored under the doctor's own folder.
   */
  async upload(
    file: File,
    options: {
      doctorId: string;
      patientId?: string | null;
      entityType: AttachmentEntity;
      entityId: string;
      questionResponseId?: string | null;
      fieldName?: string;
      shareTokenId?: string | null;
    }
  ): Promise<FileAttachmentRow> {
    requireUser(options.doctorId, 'upload attachment');

    const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, '_');
    const prefix = options.shareTokenId
      ? `share/${options.shareTokenId}/${options.entityType}/${options.entityId}`
      : `${options.doctorId}/${options.entityType}/${options.entityId}`;
    const path = `${prefix}/${Date.now()}_${safeName}`;

    const { error: uploadErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined
      });
    if (uploadErr) throw new ServiceError('Upload failed', uploadErr as never);

    const { data, error } = await supabase
      .from('file_attachments')
      .insert({
        doctor_id: options.doctorId,
        patient_id: options.patientId ?? null,
        entity_type: options.entityType,
        entity_id: options.entityId,
        question_response_id: options.questionResponseId ?? null,
        field_name: options.fieldName ?? null,
        storage_bucket: STORAGE_BUCKET,
        storage_path: path,
        original_filename: file.name,
        mime_type: file.type || null,
        size_bytes: file.size
      })
      .select('*')
      .single();
    if (error || !data) {
      // Best-effort cleanup
      await supabase.storage.from(STORAGE_BUCKET).remove([path]);
      throw new ServiceError('Record attachment failed', error);
    }
    return data as FileAttachmentRow;
  },

  async uploadViaShareToken(
    file: File,
    options: {
      doctorId: string;
      shareTokenId: string;
      patientId?: string | null;
      entityType: AttachmentEntity;
      entityId: string;
      questionResponseId?: string | null;
      fieldName?: string;
    }
  ): Promise<FileAttachmentRow> {
    return this.upload(file, {
      doctorId: options.doctorId,
      patientId: options.patientId ?? null,
      entityType: options.entityType,
      entityId: options.entityId,
      questionResponseId: options.questionResponseId ?? null,
      fieldName: options.fieldName,
      shareTokenId: options.shareTokenId
    });
  },

  async signedUrl(path: string, expiresIn = 3600): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(path, expiresIn);
    if (error) {
      console.warn('[fileAttachmentService.signedUrl]', error);
      return null;
    }
    return data?.signedUrl ?? null;
  },

  async listForEntity(
    entityType: AttachmentEntity,
    entityId: string
  ): Promise<FileAttachmentRow[]> {
    const { data, error } = await supabase
      .from('file_attachments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true });
    return handle(data ?? [], error, 'Fetch attachments') ?? [];
  },

  async listForQuestionResponse(
    questionResponseId: string
  ): Promise<FileAttachmentRow[]> {
    const { data, error } = await supabase
      .from('file_attachments')
      .select('*')
      .eq('question_response_id', questionResponseId);
    return handle(data ?? [], error, 'Fetch question attachments') ?? [];
  },

  async remove(id: string, doctorId: string | null | undefined): Promise<void> {
    requireUser(doctorId, 'delete attachment');
    const { data: row, error: fetchErr } = await supabase
      .from('file_attachments')
      .select('storage_path')
      .eq('id', id)
      .eq('doctor_id', doctorId!)
      .maybeSingle();
    if (fetchErr) handle(null, fetchErr, 'Lookup attachment');
    if (row?.storage_path) {
      await supabase.storage.from(STORAGE_BUCKET).remove([row.storage_path]);
    }
    const { error } = await supabase
      .from('file_attachments')
      .delete()
      .eq('id', id)
      .eq('doctor_id', doctorId!);
    if (error) handle(null, error, 'Delete attachment');
  }
};