"""Upload service for handling batch document uploads."""

import asyncio
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from fastapi import UploadFile

from ..db.models import UploadJob, RagDocument, UploadStatusEnum, ChunkingStrategyEnum
from ..models.rag import UploadJobResponse, BatchUploadRequest
from ..services.document_service import DocumentService
from ..utils.logger import get_logger

logger = get_logger(__name__)


class UploadService:
    """Service for managing batch document uploads."""
    
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session
    
    async def create_upload_job(
        self,
        corpus_id: UUID,
        files: List[UploadFile],
        chunking_strategy: ChunkingStrategyEnum = ChunkingStrategyEnum.AUTO,
        metadata: Optional[Dict[str, Any]] = None
    ) -> UploadJobResponse:
        """Create a new batch upload job."""
        try:
            # Create upload job record
            job_id = uuid4()
            upload_job = UploadJob(
                id=job_id,
                corpus_id=corpus_id,
                status=UploadStatusEnum.QUEUED,
                total_files=len(files),
                processed_files=0,
                successful_uploads=0,
                failed_uploads=0,
                chunking_strategy=chunking_strategy,
                job_metadata=metadata or {},
                errors={"files": []}
            )
            
            self.db_session.add(upload_job)
            await self.db_session.commit()
            await self.db_session.refresh(upload_job)
            
            logger.info(f"Created upload job {job_id} for {len(files)} files")
            
            return self._convert_to_response(upload_job)
            
        except Exception as e:
            await self.db_session.rollback()
            logger.error(f"Failed to create upload job: {e}")
            raise
    
    async def get_upload_job(self, job_id: UUID) -> Optional[UploadJobResponse]:
        """Get upload job by ID."""
        stmt = select(UploadJob).where(UploadJob.id == job_id)
        result = await self.db_session.execute(stmt)
        job = result.scalar_one_or_none()
        
        if not job:
            return None
        
        return self._convert_to_response(job)
    
    async def process_upload_job(
        self,
        job_id: UUID,
        files: List[UploadFile]
    ) -> None:
        """Process upload job files (should run in background)."""
        try:
            # Get the job
            stmt = select(UploadJob).where(UploadJob.id == job_id)
            result = await self.db_session.execute(stmt)
            job = result.scalar_one_or_none()
            
            if not job:
                logger.error(f"Upload job {job_id} not found")
                return
            
            # Update job status to processing
            job.status = UploadStatusEnum.PROCESSING
            job.started_at = datetime.utcnow()
            await self.db_session.commit()
            
            logger.info(f"Started processing upload job {job_id}")
            
            # Initialize document service
            document_service = DocumentService(self.db_session)
            
            # Process each file
            errors = []
            successful_count = 0
            failed_count = 0
            
            for i, file in enumerate(files):
                try:
                    # Upload document
                    document = await document_service.upload_document(
                        file=file,
                        corpus_id=job.corpus_id,
                        chunking_strategy=job.chunking_strategy,
                        metadata=job.job_metadata
                    )
                    
                    if document.upload_status == UploadStatusEnum.COMPLETED:
                        successful_count += 1
                        logger.info(f"Successfully uploaded {file.filename} in job {job_id}")
                    else:
                        failed_count += 1
                        error_msg = f"{file.filename}: {document.error_message or 'Upload failed'}"
                        errors.append(error_msg)
                        logger.warning(f"Failed to upload {file.filename} in job {job_id}: {document.error_message}")
                    
                except Exception as e:
                    failed_count += 1
                    error_msg = f"{file.filename}: {str(e)}"
                    errors.append(error_msg)
                    logger.error(f"Exception uploading {file.filename} in job {job_id}: {e}")
                
                # Update job progress
                job.processed_files = i + 1
                job.successful_uploads = successful_count
                job.failed_uploads = failed_count
                
                if errors:
                    job.errors = {"files": errors}
                
                await self.db_session.commit()
            
            # Mark job as completed
            job.status = UploadStatusEnum.COMPLETED if failed_count == 0 else UploadStatusEnum.FAILED
            job.completed_at = datetime.utcnow()
            await self.db_session.commit()
            
            logger.info(
                f"Completed upload job {job_id}: {successful_count} successful, {failed_count} failed"
            )
            
        except Exception as e:
            # Mark job as failed
            try:
                update_stmt = (
                    update(UploadJob)
                    .where(UploadJob.id == job_id)
                    .values(
                        status=UploadStatusEnum.FAILED,
                        completed_at=datetime.utcnow(),
                        errors={"system_error": str(e)}
                    )
                )
                await self.db_session.execute(update_stmt)
                await self.db_session.commit()
            except Exception as update_error:
                logger.error(f"Failed to update job status: {update_error}")
            
            logger.error(f"Upload job {job_id} failed with system error: {e}")
            raise
    
    async def cancel_upload_job(self, job_id: UUID) -> bool:
        """Cancel an active upload job."""
        stmt = select(UploadJob).where(UploadJob.id == job_id)
        result = await self.db_session.execute(stmt)
        job = result.scalar_one_or_none()
        
        if not job:
            return False
        
        if not job.is_active:
            logger.warning(f"Upload job {job_id} is not active, cannot cancel")
            return False
        
        # Update job status
        job.status = UploadStatusEnum.CANCELLED
        job.completed_at = datetime.utcnow()
        await self.db_session.commit()
        
        logger.info(f"Cancelled upload job {job_id}")
        return True
    
    async def list_upload_jobs(
        self,
        corpus_id: Optional[UUID] = None,
        status: Optional[UploadStatusEnum] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[UploadJobResponse]:
        """List upload jobs with optional filtering."""
        stmt = select(UploadJob).order_by(UploadJob.created_at.desc())
        
        if corpus_id:
            stmt = stmt.where(UploadJob.corpus_id == corpus_id)
        
        if status:
            stmt = stmt.where(UploadJob.status == status)
        
        stmt = stmt.limit(limit).offset(offset)
        
        result = await self.db_session.execute(stmt)
        jobs = result.scalars().all()
        
        return [self._convert_to_response(job) for job in jobs]
    
    def _convert_to_response(self, job: UploadJob) -> UploadJobResponse:
        """Convert database model to response model."""
        # Calculate estimated time remaining
        estimated_time = None
        if job.is_active and job.processed_files > 0:
            if job.started_at:
                elapsed = (datetime.utcnow() - job.started_at).total_seconds()
                avg_time_per_file = elapsed / job.processed_files
                remaining_files = job.total_files - job.processed_files
                estimated_time = int(remaining_files * avg_time_per_file)
        
        # Extract error messages
        errors = []
        if job.errors:
            if isinstance(job.errors, dict):
                if "files" in job.errors:
                    errors.extend(job.errors["files"])
                if "system_error" in job.errors:
                    errors.append(f"System error: {job.errors['system_error']}")
            else:
                errors.append(str(job.errors))
        
        return UploadJobResponse(
            id=job.id,
            corpus_id=job.corpus_id,
            status=job.status,
            total_files=job.total_files,
            processed_files=job.processed_files,
            successful_uploads=job.successful_uploads,
            failed_uploads=job.failed_uploads,
            progress_percentage=job.progress_percentage,
            estimated_time_remaining=estimated_time,
            errors=errors,
            created_at=job.created_at,
            started_at=job.started_at,
            completed_at=job.completed_at
        )