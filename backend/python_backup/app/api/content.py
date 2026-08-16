from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import CMSContent, CompanyVideo, User
from app.schemas.schemas import CMSContentOut, CMSContentUpdate, CompanyVideoCreate, CompanyVideoUpdate, CompanyVideoOut
from app.api.auth import get_current_admin

router = APIRouter(prefix="/content", tags=["CMS Content & Video Management"])

# CMS Content Key-Value Endpoints
@router.get("", response_model=List[CMSContentOut])
def get_all_cms_content(db: Session = Depends(get_db)):
    return db.query(CMSContent).all()

@router.get("/key/{key}", response_model=CMSContentOut)
@router.get("/{key}", response_model=CMSContentOut)
def get_cms_content(key: str, db: Session = Depends(get_db)):
    item = db.query(CMSContent).filter(CMSContent.key == key).first()
    if not item:
        # Fallback empty response
        return {
            "id": 0,
            "key": key,
            "title": "Sai Balaji Silverworks",
            "content": "",
            "media_url": "",
            "updated_at": "2026-08-13T00:00:00Z"
        }
    return item

@router.put("/admin/{key}", response_model=CMSContentOut)
def update_cms_content(
    key: str,
    data: CMSContentUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    item = db.query(CMSContent).filter(CMSContent.key == key).first()
    if not item:
        item = CMSContent(key=key, title=data.title, content=data.content, media_url=data.media_url)
        db.add(item)
    else:
        item.title = data.title
        item.content = data.content
        item.media_url = data.media_url
    
    db.commit()
    db.refresh(item)
    return item


# Video Management Endpoints
@router.get("/videos/all", response_model=List[CompanyVideoOut])
@router.get("/videos", response_model=List[CompanyVideoOut])
def get_company_videos(
    section: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CompanyVideo).filter(CompanyVideo.is_active == True)
    if section:
        query = query.filter(CompanyVideo.section == section)
    return query.order_by(CompanyVideo.sort_order.asc(), CompanyVideo.created_at.asc()).all()

@router.post("/videos", response_model=CompanyVideoOut, status_code=status.HTTP_201_CREATED)
def create_company_video(
    v_in: CompanyVideoCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    video = CompanyVideo(
        title=v_in.title,
        description=v_in.description,
        video_url=v_in.video_url,
        thumbnail_url=v_in.thumbnail_url,
        section=v_in.section,
        sort_order=v_in.sort_order,
        is_active=v_in.is_active
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return video

@router.put("/videos/{video_id}", response_model=CompanyVideoOut)
def update_company_video(
    video_id: int,
    v_in: CompanyVideoUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    video = db.query(CompanyVideo).filter(CompanyVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if v_in.title is not None: video.title = v_in.title
    if v_in.description is not None: video.description = v_in.description
    if v_in.video_url is not None: video.video_url = v_in.video_url
    if v_in.thumbnail_url is not None: video.thumbnail_url = v_in.thumbnail_url
    if v_in.section is not None: video.section = v_in.section
    if v_in.sort_order is not None: video.sort_order = v_in.sort_order
    if v_in.is_active is not None: video.is_active = v_in.is_active

    db.commit()
    db.refresh(video)
    return video

@router.delete("/videos/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company_video(
    video_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    video = db.query(CompanyVideo).filter(CompanyVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    db.delete(video)
    db.commit()
    return None
