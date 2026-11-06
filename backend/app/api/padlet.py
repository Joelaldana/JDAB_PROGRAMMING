from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import PadletCard, User
from app.schemas.schemas import PadletCardCreate, PadletCardOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/padlet", tags=["Tablero Padlet"])

@router.get("/cards", response_model=list[PadletCardOut])
def get_cards(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cards = db.query(PadletCard).order_by(PadletCard.created_at.desc()).all()
    out = []
    for c in cards:
        card_data = PadletCardOut.model_validate(c)
        card_data.author_name = c.user.username if c.user else "Comunidad JDAB"
        out.append(card_data)
    return out

@router.post("/cards", response_model=PadletCardOut, status_code=status.HTTP_201_CREATED)
def create_card(card_in: PadletCardCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_card = PadletCard(
        user_id=current_user.id,
        title=card_in.title,
        content=card_in.content,
        card_type=card_in.card_type,
        color=card_in.color
    )
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    
    res = PadletCardOut.model_validate(new_card)
    res.author_name = current_user.username
    return res

@router.delete("/cards/{card_id}")
def delete_card(card_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    card = db.query(PadletCard).filter(PadletCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada.")
    if card.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No puedes eliminar tarjetas de otros estudiantes.")
        
    db.delete(card)
    db.commit()
    return {"message": "Tarjeta eliminada correctamente."}